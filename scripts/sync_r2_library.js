import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// 1. Initialize Clients & Auth
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.GRH_LIBRARY_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.GRH_LIBRARY_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.GRH_LIBRARY_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.GRH_LIBRARY_R2_BUCKET_NAME || 'grh-library';
const PUBLIC_BASE_URL = process.env.GRH_LIBRARY_CLOUDFLARE_R2_PUBLIC_URL || '';
const normalizedBaseUrl = PUBLIC_BASE_URL.endsWith('/') ? PUBLIC_BASE_URL.slice(0, -1) : PUBLIC_BASE_URL;

// Helper to clean up titles from filenames
function cleanTitle(filename) {
  const extIndex = filename.lastIndexOf('.');
  const baseName = extIndex !== -1 ? filename.substring(0, extIndex) : filename;
  
  // Replace dashes and underscores with spaces
  let cleaned = baseName.replace(/[-_]/g, ' ');
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Title Case conversion
  return cleaned
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Classification Helper based on folder structure and content
function classifyResource(key) {
  const lowerKey = key.toLowerCase();
  
  // 1. Extract file name and extension
  const filename = key.split('/').pop() || '';
  const title = cleanTitle(filename);
  
  // 2. Programme mapping
  let programme = 'General';
  if (lowerKey.includes('perl')) {
    programme = 'PERL';
  } else if (lowerKey.includes('sparc')) {
    programme = 'SPARC';
  } else if (lowerKey.includes('slgp')) {
    programme = 'SLGP';
  }
  
  // 3. Location mapping
  let location = 'General';
  if (lowerKey.includes('kano')) {
    location = 'Kano';
  } else if (lowerKey.includes('kaduna')) {
    location = 'Kaduna';
  } else if (lowerKey.includes('jigawa')) {
    location = 'Jigawa';
  } else if (lowerKey.includes('federal')) {
    location = 'Federal';
  } else if (lowerKey.includes('nigeria') || lowerKey.includes('national')) {
    location = 'Nigeria';
  }
  
  // 4. Thematic Area mapping
  let thematicArea = 'Policy & Strategy';
  if (
    lowerKey.includes('financial') || 
    lowerKey.includes('pfm') || 
    lowerKey.includes('budget') || 
    lowerKey.includes('fiscal') || 
    lowerKey.includes('audit') || 
    lowerKey.includes('debt') || 
    lowerKey.includes('procurement') ||
    lowerKey.includes('tax') ||
    lowerKey.includes('revenue')
  ) {
    thematicArea = 'Public Financial Management';
  } else if (
    lowerKey.includes('service') || 
    lowerKey.includes('psm') || 
    lowerKey.includes('reform') || 
    lowerKey.includes('civil service') || 
    lowerKey.includes('ministry') ||
    lowerKey.includes('institutions') ||
    lowerKey.includes('capacity')
  ) {
    thematicArea = 'Public Service Management';
  } else if (
    lowerKey.includes('policy') || 
    lowerKey.includes('strategy') || 
    lowerKey.includes('framework') || 
    lowerKey.includes('guidelines') || 
    lowerKey.includes('roadmap') ||
    lowerKey.includes('development plan')
  ) {
    thematicArea = 'Policy & Strategy';
  } else if (
    lowerKey.includes('monitoring') || 
    lowerKey.includes('evaluation') || 
    lowerKey.includes('learning') || 
    lowerKey.includes('mel') || 
    lowerKey.includes('impact') || 
    lowerKey.includes('indicator') ||
    lowerKey.includes('assessment') ||
    lowerKey.includes('review')
  ) {
    thematicArea = 'Monitoring, Evaluation & Learning';
  } else if (
    lowerKey.includes('knowledge') || 
    lowerKey.includes('km') || 
    lowerKey.includes('repository') || 
    lowerKey.includes('database') || 
    lowerKey.includes('communication') || 
    lowerKey.includes('media') ||
    lowerKey.includes('factsheet') ||
    lowerKey.includes('resource guide')
  ) {
    thematicArea = 'Knowledge Management';
  }
  
  // 5. Year mapping (extract 4-digit numbers starting with 20 or 19)
  let year = null;
  const yearMatch = key.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }
  
  // Default description
  const description = `A ${programme === 'General' ? 'governance' : programme} resource focusing on ${thematicArea} in ${location}.`;
  
  return {
    title,
    programme,
    location,
    thematicArea,
    year,
    description
  };
}

async function sync() {
  console.log('======================================================');
  console.log('🚀 CLOUDFLARE R2 TO SUPABASE LIBRARY SYNC');
  console.log(`R2 Endpoint:   ${process.env.GRH_LIBRARY_R2_ENDPOINT}`);
  console.log(`R2 Bucket:     ${BUCKET_NAME}`);
  console.log(`Public URL:    ${normalizedBaseUrl}`);
  console.log('======================================================\n');

  try {
    let supabase;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      console.log('🔑 Using Service Role Key from environment. Bypassing RLS.');
      supabase = createClient(process.env.VITE_SUPABASE_URL, serviceRoleKey);
    } else {
      console.log('🔑 No Service Role Key found. Please authenticate as an Admin user.');
      const email = await askQuestion('Admin Email: ');
      const password = await askQuestion('Admin Password: ');

      console.log('\nLogging in...');
      supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      console.log(`✅ Logged in successfully as ${authData.user.email}\n`);
    }

    // 1. Fetch all existing library resource URLs from Supabase
    console.log('📥 Fetching existing library resources from Supabase...');
    const { data: existingResources, error: dbError } = await supabase
      .from('library_resources')
      .select('file_url');

    if (dbError) {
      throw new Error(`Failed to fetch existing resources: ${dbError.message}`);
    }

    const existingUrls = new Set(
      (existingResources || [])
        .map(r => r.file_url)
        .filter(url => typeof url === 'string')
    );
    console.log(`✅ Loaded ${existingUrls.size} existing resource URLs from database.\n`);

    // 2. Fetch all files recursively from R2 bucket
    console.log('🔍 Scanning R2 bucket recursively...');
    let allR2Objects = [];
    let isTruncated = true;
    let nextContinuationToken = undefined;

    while (isTruncated) {
      const listParams = { Bucket: BUCKET_NAME };
      if (nextContinuationToken) {
        listParams.ContinuationToken = nextContinuationToken;
      }

      const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));
      const contents = listResponse.Contents || [];
      allR2Objects = allR2Objects.concat(contents);

      isTruncated = listResponse.IsTruncated;
      nextContinuationToken = listResponse.NextContinuationToken;
    }

    console.log(`✅ Scanned R2 bucket. Found ${allR2Objects.length} total objects.`);

    // Filter out directories and empty files
    const validFiles = allR2Objects.filter(obj => {
      const isFolder = obj.Key.endsWith('/');
      const isHidden = obj.Key.split('/').pop().startsWith('.');
      return !isFolder && !isHidden && obj.Size > 0;
    });

    console.log(`📂 Found ${validFiles.length} valid files (excluding folders/hidden files).\n`);

    // 3. Identify new resources to import
    const newResources = [];
    for (const file of validFiles) {
      // Create URL-encoded file path, preserving folder slashes
      const safeKey = file.Key.split('/').map(part => encodeURIComponent(part)).join('/');
      const fileUrl = `${normalizedBaseUrl}/${safeKey}`;

      if (existingUrls.has(fileUrl)) {
        continue;
      }

      const classification = classifyResource(file.Key);
      
      newResources.push({
        title: classification.title,
        type: 'Document',
        category: 'Governance',
        description: classification.description,
        file_url: fileUrl,
        cover_image: null,
        author: 'System Auto-Import',
        year: classification.year,
        pages: null,
        featured: false,
        status: 'Published',
        published_year: classification.year || new Date().getFullYear(),
        programme: classification.programme,
        thematic_area: classification.thematicArea,
        location: classification.location
      });
    }

    console.log(`📊 Sync Summary:`);
    console.log(`  - Total files in R2: ${validFiles.length}`);
    console.log(`  - Already in library: ${validFiles.length - newResources.length}`);
    console.log(`  - New files to pull:  ${newResources.length}`);

    if (newResources.length === 0) {
      console.log('\n✨ Library is already up to date! No new files to sync.');
      return;
    }

    // 4. Batch sync new resources in chunks of 50
    console.log(`\n💾 Pulling ${newResources.length} new records into Supabase...`);
    const chunkSize = 50;
    let successfulSyncs = 0;

    for (let i = 0; i < newResources.length; i += chunkSize) {
      const chunk = newResources.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from('library_resources')
        .insert(chunk);

      if (insertError) {
        console.error(`❌ Error inserting chunk ${i / chunkSize + 1}:`, insertError.message);
      } else {
        successfulSyncs += chunk.length;
        console.log(`  Processed ${successfulSyncs}/${newResources.length} records...`);
      }
    }

    console.log(`\n✨ Successfully pulled ${successfulSyncs} new records to the library!`);
  } catch (err) {
    console.error('\n❌ Critical Error during sync:', err.message || err);
  } finally {
    rl.close();
  }
}

sync();
