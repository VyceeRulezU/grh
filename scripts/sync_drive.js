
/**
 * Governance Resource Hub - Google Drive Sync Script
 * 
 * This script connects to a Google Drive folder, reads file metadata,
 * and syncs it to the Supabase 'library_resources' table.
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
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
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
  'http://localhost' // More modern redirect URI for Desktop apps
);

async function authenticate() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        resolve(google.drive({ version: 'v3', auth: oauth2Client }));
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function syncDocuments() {
  try {
    const drive = await authenticate();
    
    console.log(`Debug: Using Folder ID [${CONFIG.folderId}]`);
    console.log(`Searching for files...`);
    
    const response = await drive.files.list({
      q: `'${CONFIG.folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, description, createdTime)',
    });

    const files = response.data.files;
    if (!files || files.length === 0) {
      console.log('No files found.');
      return;
    }

    console.log(`Found ${files.length} files. Syncing to Supabase...`);

    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') continue;

      const metadata = {
        title: file.name,
        file_id: file.id,
        preview_url: file.webViewLink,
        download_url: `https://drive.google.com/uc?export=download&id=${file.id}`,
        created_at: file.createdTime
      };

      console.log(`Syncing: ${file.name}...`);
      
      const { data, error } = await supabase
        .from('perl_resources')
        .upsert(metadata, { onConflict: 'file_id' });

      if (error) {
        console.error(`Error syncing ${file.name}:`, error.message);
      } else {
        console.log(`Successfully synced: ${file.name}`);
      }
    }

    console.log('Sync completed successfully!');
  } catch (err) {
    console.error('Core sync error:', err);
  }
}

syncDocuments();

