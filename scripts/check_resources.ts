import { createClient } from '@supabase/supabase-client';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function checkResources() {
  const tables = ['library_resources', 'books', 'sparc_resources', 'perl_resource'];
  
  for (const table of tables) {
    console.log(`Checking table: ${table}`);
    const { data, error } = await supabase.from(table).select('title, file_url, preview_url, download_url').limit(5);
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      continue;
    }
    console.log(JSON.stringify(data, null, 2));
  }
}

checkResources();
