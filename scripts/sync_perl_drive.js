/**
 * Governance Resource Hub - Google Drive Sync Script
 * 
 * This script connects to a Google Drive folder, reads file metadata,
 * and syncs it to the Supabase 'perl_resource' table.
 * 
 * Prerequisites:
 * 1. Google Cloud Project with Drive API enabled.
 * 2. gcloud CLI installed and authenticated (gcloud auth application-default login).
 * 3. Folder ID accessible by your Google account.
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const CONFIG = {
  folderId: process.env.GOOGLE_DRIVE_PERL_FOLDER_ID,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

const oauth2Client = new google.auth.OAuth2(
  CONFIG.clientId,
  CONFIG.clientSecret,
  'http://localhost' 
);

async function authenticate() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  console.log('\n======================================================');
  console.log('1. Click this link to authorize the app:');
  console.log(authUrl);
  console.log('\n2. After allowing access, your browser will redirect to an error page (this is normal!).');
  console.log('3. Look at the URL bar in that error page. It will look like: http://localhost/?code=4/0AeaY...&scope=...');
  console.log('4. Copy ONLY the part between "code=" and "&scope="');
  console.log('======================================================\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Paste the exact code here and press Enter: ', async (code) => {
      rl.close();
      try {
        // Automatically decode just in case they pasted the URL encoded version
        const cleanCode = decodeURIComponent(code.trim());
        const { tokens } = await oauth2Client.getToken(cleanCode);
        oauth2Client.setCredentials(tokens);
        resolve(google.drive({ version: 'v3', auth: oauth2Client }));
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function getAllFilesInFolder(drive, folderId) {
  let allFiles = [];
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, description, createdTime)',
    });
    
    const items = response.data.files || [];
    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        console.log(`Scanning subfolder: ${item.name}...`);
        const subFiles = await getAllFilesInFolder(drive, item.id);
        allFiles = allFiles.concat(subFiles);
      } else {
        allFiles.push(item);
      }
    }
  } catch (err) {
    console.error(`Error scanning folder ${folderId}:`, err.message);
  }
  return allFiles;
}

async function syncDocuments() {
  try {
    const drive = await authenticate();
    
    console.log(`Debug: Using Root Folder ID [${CONFIG.folderId}]`);
    console.log(`Searching for files recursively...`);
    
    const files = await getAllFilesInFolder(drive, CONFIG.folderId);

    if (!files || files.length === 0) {
      console.log('No files found.');
      return;
    }

    console.log(`Found ${files.length} flat files across all folders. Syncing to Supabase...`);

    for (const file of files) {
      const metadata = {
        title: file.name,
        preview_url: file.webViewLink,
        download_url: `https://drive.google.com/uc?export=download&id=${file.id}`,
        created_at: file.createdTime
      };

      console.log(`Syncing: ${file.name}...`);
      
      const { data, error } = await supabase
        .from('perl_resource')
        .insert([metadata]);

      if (error) {
        console.error(`Error syncing ${file.name}:`, error.message);
      }
    }

    console.log('Sync completed successfully!');
  } catch (err) {
    console.error('Core sync error:', err);
  }
}

syncDocuments();
