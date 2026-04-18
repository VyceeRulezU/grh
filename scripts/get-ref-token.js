/**
 * Google OAuth2 Refresh Token Generator (Local Server Version)
 * 
 * 1. Ensure http://localhost:3000/oauth2callback is in your Google Cloud Console Redirect URIs.
 * 2. Run: node scripts/get-ref-token.js
 */

import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import { exec } from 'child_process';
import url from 'url';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/oauth2callback')) {
      const q = url.parse(req.url, true).query;
      res.end('✅ Authorization successful! You can close this tab and return to the terminal.');
      
      const { tokens } = await oauth2Client.getToken(q.code);
      console.log('\n✅ Token Exchange Successful!');
      console.log('--------------------------------------------------');
      console.log('Copy this into your .env file:');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('--------------------------------------------------');
      console.log('\nOnce added, you can run: node scripts/video-migration.js');
      
      server.close();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error exchanging code:', err.message);
    res.end('❌ Error exchanging code. Check terminal.');
    server.close();
    process.exit(1);
  }
}).listen(PORT, () => {
  console.log('🚀 Step 1: Visit this URL to authorize (or it might open automatically):');
  console.log('\n' + authUrl + '\n');
  
  // Try to open automatically
  const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
  exec(`${start} "${authUrl.replace(/&/g, '^&')}"`);
});
