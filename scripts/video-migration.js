/**
 * GRH Video Migration Script (Google Drive -> Cloudflare R2)
 * 
 * TO RUN:
 * 1. Install dependencies:
 *    npm install @aws-sdk/client-s3 @aws-sdk/lib-storage googleapis dotenv @supabase/supabase-js node-fetch
 * 
 * 2. Set up R2 Credentials in .env:
 *    R2_ACCESS_KEY_ID=your_access_key
 *    R2_SECRET_ACCESS_KEY=your_secret_key
 *    R2_BUCKET_NAME=grh-courses
 *    R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
 *    CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev (or your custom domain)
 * 
 * 3. Run: node scripts/video-migration.js
 */

import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG ---
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { fetch: (...args) => fetch(...args, { timeout: 30000 }) } // 30s timeout
});

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

// Helper to sanitize strings for URL-friendly paths
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // 1. Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // 2. Remove all non-word chars (except dashes)
    .replace(/\-\-+/g, '-')         // 3. Replace multiple dashes with single -
    .replace(/^-+/, '')             // 4. Trim dashes from start
    .replace(/-+$/, '');            // 5. Trim dashes from end
};

const extractFileId = (url) => {
  if (!url) return null;
  const match = url.match(/\/file\/d\/(.+?)\//) || url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
  return match ? (match[1] || match[2]) : null;
};

async function fetchModulesWithRetries(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`📡 Fetching modules from Supabase (Attempt ${i + 1}/${retries})...`);
      const { data, error } = await supabase
        .from('course_modules')
        .select('*, courses(title)')
        .like('video_url', '%drive.google.com%');
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`⚠️ Supabase Fetch Attempt ${i + 1} failed: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1))); // Wait 3s, 6s...
    }
  }
}

async function migrateVideos() {
  console.log("🚀 Starting GRH Video Migration Pipeline...");

  try {
    const modules = await fetchModulesWithRetries();
    console.log(`📂 Found ${modules.length} modules to migrate.`);

    for (const mod of modules) {
    const fileId = extractFileId(mod.video_url);
    if (!fileId) {
      console.warn(`⚠️ Could not parse File ID for: ${mod.title}`);
      continue;
    }

    try {
      const courseSlug = slugify(mod.courses.title);
      const chapterSlug = slugify(mod.chapter_title || 'Introduction');
      const moduleSlug = slugify(`${mod.sort_order || 0}-${mod.title}`);
      
      const r2Key = `grh_courses/${courseSlug}/${chapterSlug}/${moduleSlug}.mp4`;
      console.log(`\n📦 Processing: ${mod.title}`);
      console.log(`🔗 Target Key: ${r2Key}`);

      // 2. Stream from Google Drive
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      // 3. Managed Multipart Upload to R2
      const parallelUploads3 = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.R2_BUCKET_NAME || 'grh-courses',
          Key: r2Key,
          Body: response.data,
          ContentType: 'video/mp4',
        },
        queueSize: 4, // 4 parts in parallel
        partSize: 5 * 1024 * 1024, // 5MB parts
      });

      parallelUploads3.on("httpUploadProgress", (progress) => {
        const uploadedMb = (progress.loaded / 1024 / 1024).toFixed(2);
        console.log(`  ⏳ Uploading... ${uploadedMb} MB uploaded`);
      });

      await parallelUploads3.done();
      console.log("  ✅ R2 Upload complete.");

      // 4. Update Supabase
      const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${r2Key}`;
      const { error: updateErr } = await supabase
        .from('course_modules')
        .update({ video_url: publicUrl })
        .eq('id', mod.id);

      if (updateErr) {
        console.error(`  ❌ Failed to update Supabase for ${mod.title}:`, updateErr);
      } else {
        console.log(`  ✨ Supabase updated: ${publicUrl}`);
      }

    } catch (err) {
      console.error(`  ❌ Failed to migrate ${mod.title}:`, err.message);
    }
  }

  } catch (err) {
    console.error(`❌ Migration Pipeline Error: ${err.message}`);
  }

  console.log("\n🏁 Migration task finished.");
}

migrateVideos();
