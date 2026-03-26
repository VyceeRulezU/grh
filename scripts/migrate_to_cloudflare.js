/**
 * Governance Resource Hub - Cloudflare R2 Bulk Migration Script
 * 
 * This script updates existing Supabase records (in sparc_resources and perl_resource)
 * to point to your new Cloudflare R2 bucket.
 * 
 * It assumes you have uploaded your files to R2 with the EXACT SAME filenames 
 * as they appear in the 'title' column in Supabase (e.g., "document.pdf").
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Put your Cloudflare public R2 URL in your .env file
// Example: CLOUDFLARE_R2_PUBLIC_URL=https://pub-123abc456def.r2.dev
const R2_BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

if (!R2_BASE_URL) {
  console.error('❌ ERROR: CLOUDFLARE_R2_PUBLIC_URL is not set in your .env file.');
  console.error('Please add it like this: CLOUDFLARE_R2_PUBLIC_URL=https://pub-your-id.r2.dev');
  process.exit(1);
}

// Remove trailing slash if present to prevent double slashes in URLs
const normalizedBaseUrl = R2_BASE_URL.endsWith('/') ? R2_BASE_URL.slice(0, -1) : R2_BASE_URL;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function migrateTableToCloudflare(tableName, folderName) {
  console.log(`\nFetching existing records from [${tableName}]...`);
  
  const { data: records, error: fetchErr } = await supabase
    .from(tableName)
    .select('id, title, preview_url')
    .limit(10000);

  if (fetchErr) {
    console.error(`Error fetching ${tableName}:`, fetchErr.message);
    return;
  }

  if (!records || records.length === 0) {
    console.log(`No records found in ${tableName}. Skipping.`);
    return;
  }

  console.log(`Found ${records.length} records. Updating URLs...`);

  let successCount = 0;
  let failCount = 0;

  for (const record of records) {
    // Google Drive usually keeps the original extension in the title (.pdf, .mp4, etc.)
    // We encode the title so spaces become %20, ensuring the URL is valid.
    const safeFileName = encodeURIComponent(record.title);
    
    // Construct the URL with the R2 folder structure
    const newCloudflareUrl = `${normalizedBaseUrl}/${folderName}/${safeFileName}`;

    console.log(`Updating: ${record.title} -> ${newCloudflareUrl}`);

    const { error: updateErr } = await supabase
      .from(tableName)
      .update({
        preview_url: newCloudflareUrl,
        download_url: newCloudflareUrl
      })
      .eq('id', record.id);

    if (updateErr) {
      console.error(`❌ Failed to update ${record.title}:`, updateErr.message);
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n✅ Finished updating [${tableName}]!`);
  console.log(`Successfully updated: ${successCount}`);
  if (failCount > 0) console.log(`Failed to update: ${failCount}`);
}

async function runMigration() {
  console.log('======================================================');
  console.log('☁️  CLOUDFLARE R2 URL MIGRATION');
  console.log(`Target R2 Base URL: ${normalizedBaseUrl}`);
  console.log('======================================================\n');
  
  rl.question('Are you sure you want to update all your database URLs to point to Cloudflare? (y/n): ', async (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await migrateTableToCloudflare('sparc_resources', 'SPARC_Resources');
      await migrateTableToCloudflare('perl_resource', 'PERL_Resources');
      console.log('\nMigration complete.');
    } else {
      console.log('Migration cancelled.');
    }
  });
}

runMigration();
