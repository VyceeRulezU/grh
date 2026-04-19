import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// ─── Clients Configuration ──────────────────────────────────────────────────
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.GRH_LIBRARY_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.GRH_LIBRARY_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.GRH_LIBRARY_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.GRH_LIBRARY_R2_BUCKET_NAME;
const PUBLIC_DOMAIN = "https://pub-18be25e422c14b14ac1da71403c739f3.r2.dev";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ─── Tables to Scan ─────────────────────────────────────────────────────────
const TABLES = ['perl_resource', 'library_resources', 'sparc_resources', 'books'];

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Normalize strings to make matching incredibly forgiving */
function normalize(str) {
  if (!str) return '';
  // Remove everything up to the last slash (get filename)
  let name = str.split('/').pop();
  try { name = decodeURIComponent(name); } catch(e) {}
  
  // Extract extension to ensure we never cross-map a PDF to a DOCX
  const parts = name.split('.');
  const ext = parts.length > 1 ? '.' + parts.pop().toLowerCase() : '';
  const basename = parts.join('.');
  
  // Convert to lowercase and strip special chars
  const cleanBase = basename.toLowerCase().replace(/[\s\-_%]/g, '');
  return cleanBase + ext;
}

async function run() {
  console.log(`[1] Fetching all files from R2 Bucket: ${BUCKET}...`);
  let isTruncated = true;
  let continuationToken = undefined;
  
  // R2 Map: normalizedName -> full R2 exact Key
  const r2Dictionary = new Map();
  let r2TotalCount = 0;

  while(isTruncated) {
    const res = await s3Client.send(new ListObjectsV2Command({ 
      Bucket: BUCKET, 
      ContinuationToken: continuationToken
    }));
    
    if (res.Contents) {
      for (const obj of res.Contents) {
        // Skip directories
        if (obj.Key.endsWith('/')) continue;
        
        const normKey = normalize(obj.Key);
        // Save the exact character-accurate path from Cloudflare
        r2Dictionary.set(normKey, obj.Key);
        r2TotalCount++;
      }
    }
    isTruncated = res.IsTruncated;
    continuationToken = res.NextContinuationToken;
  }
  
  console.log(`✅ Loaded ${r2TotalCount} individual files from Cloudflare R2.`);
  console.log(`[2] Scanning Supabase for broken URLs...`);

  let fixesFound = 0;
  let missingInR2 = 0;
  const updateQueue = [];

  for (const table of TABLES) {
    const { data: records, error } = await supabase.from(table).select('*');
    
    if (error) {
      console.warn(`⚠️ Could not read table ${table}: ${error.message}`);
      continue;
    }

    if (!records || records.length === 0) continue;

    for (const record of records) {
      const urlColumn = record.fileUrl ? 'fileUrl' : (record.file_url ? 'file_url' : null);
      if (!urlColumn) continue;

      const currentUrl = record[urlColumn];
      if (!currentUrl || !currentUrl.includes('pub-18be')) continue;

      const currentPath = currentUrl.replace(PUBLIC_DOMAIN + '/', '');
      let dbPath;
      try { dbPath = decodeURIComponent(currentPath); } catch(e) { dbPath = currentPath; }

      const dbNorm = normalize(dbPath);
      const matchedR2Key = r2Dictionary.get(dbNorm);

      if (matchedR2Key) {
        const encodedR2Path = matchedR2Key.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const verifiedR2Url = `${PUBLIC_DOMAIN}/${encodedR2Path}`;

        if (currentUrl !== verifiedR2Url) {
          fixesFound++;
          updateQueue.push({
            table,
            id: record.id,
            column: urlColumn,
            old: currentUrl,
            new: verifiedR2Url,
            title: record.title
          });
        }
      } else {
        missingInR2++;
      }
    }
  }

  console.log(`\n=================================================`);
  console.log(`📊 SCAN RESULTS`);
  console.log(`=================================================`);
  console.log(`Found ${fixesFound} files in Supabase with improperly formatted URLs.`);
  console.log(`Found ${missingInR2} files that exist in DB but NOT found in R2 bucket.\n`);

  if (fixesFound > 0) {
    const logData = updateQueue.map(q => `✅ ${q.title}\n - OLD: ${q.old}\n - NEW: ${q.new}\n`).join('\n');
    fs.writeFileSync('scratch/url_fixes_log.txt', logData);
    console.log(`I have saved the list of proposed fixes to: scratch/url_fixes_log.txt`);
    
    // Actually apply the fixes to Supabase
    console.log(`Applying updates to Supabase...`);
    for (const fix of updateQueue) {
       await supabase.from(fix.table).update({ [fix.column]: fix.new }).eq('id', fix.id);
    }
    console.log(`Done! Synced perfectly with Cloudflare R2.`);
  }

}

run();
