import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const CONFIG = {
  // Base R2 URL provided by user
  baseUrl: 'https://pub-18be25e422c14b14ac1da71403c739f3.r2.dev/',
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  }
};

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

async function migrate() {
  console.log('--- Starting Migration to R2 Hosted URLs ---');
  
  // Mapping of table name to its folder in R2
  const tableConfig = [
    { name: 'sparc_resources', folder: 'SPARC_Resources' },
    { name: 'perl_resource', folder: 'PERL_Resources' },
    { name: 'library_resources', folder: 'Library_Resources' },
    { name: 'books', folder: 'Books' }
  ];

  for (const config of tableConfig) {
    console.log(`\nProcessing table: ${config.name}`);
    try {
      const { data: resources, error: fetchError } = await supabase
        .from(config.name)
        .select('*');

      if (fetchError) {
        console.error(`Error fetching from ${config.name}:`, fetchError.message);
        continue;
      }

      if (!resources || resources.length === 0) {
        console.log(`No resources found in ${config.name}.`);
        continue;
      }

      console.log(`Found ${resources.length} resources in ${config.name}.`);

      for (const res of resources) {
        // Filename is usually stored in 'title' or 'filename' field
        const fileName = res.title || res.filename;
        if (!fileName) {
          console.warn(`Skipping ID ${res.id} - No title/filename found.`);
          continue;
        }

        // Standard R2/S3 encoding: 
        // spaces -> %20, ( -> %28, ) -> %29, etc.
        const safeName = encodeURIComponent(fileName).replace(/%20/g, '%20'); 
        
        const newUrl = `${CONFIG.baseUrl}${config.folder}/${safeName}`;

        console.log(`Update: ${fileName.substring(0, 30)}... -> ${newUrl.substring(0, 50)}...`);

        const updateData = {
          preview_url: newUrl,
          download_url: newUrl,
          file_url: newUrl // Ensure file_url is also updated if exists
        };

        const { error: updateError } = await supabase
          .from(config.name)
          .update(updateData)
          .eq('id', res.id);

        if (updateError) {
          console.error(`Failed to update ${fileName}:`, updateError.message);
        }
      }
    } catch (err) {
      console.error(`Critical error in ${config.name}:`, err);
    }
  }

  console.log('\n--- R2 Migration Completed ---');
}

migrate();
