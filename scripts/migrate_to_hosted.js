import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const CONFIG = {
  baseUrl: 'https://governanceresourcehub.com/public_html/perl_resource/',
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

async function migrate() {
  console.log('--- Starting Migration to Hosted URLs ---');
  console.log(`Base URL: ${CONFIG.baseUrl}`);

  try {
    // 1. Fetch all resources
    const { data: resources, error: fetchError } = await supabase
      .from('perl_resources')
      .select('*');

    if (fetchError) throw fetchError;
    if (!resources || resources.length === 0) {
      console.log('No resources found to migrate.');
      return;
    }

    console.log(`Found ${resources.length} resources. Updating URLs...`);

    for (const res of resources) {
      // Use the 'title' which was stored as the filename in sync_drive.js
      const fileName = res.title;
      if (!fileName) {
        console.warn(`Skipping resource ID ${res.id} - No title (filename) found.`);
        continue;
      }

      // Encode filename for URL (handles spaces, special chars)
      const encodedName = encodeURIComponent(fileName).replace(/%20/g, ' '); // Some servers prefer spaces as %20 or ' ', let's use standard %20.
      // Wait, encodeURIComponent converts space to %20. That's perfect. 
      // Re-doing it to be safe:
      const safeName = encodeURIComponent(fileName);

      const newUrl = `${CONFIG.baseUrl}${safeName}`;

      console.log(`Updating [${fileName}] -> ${newUrl}`);

      const { error: updateError } = await supabase
        .from('perl_resources')
        .update({
          preview_url: newUrl,
          download_url: newUrl
        })
        .eq('id', res.id);

      if (updateError) {
        console.error(`Failed to update ${fileName}:`, updateError.message);
      }
    }

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

migrate();
