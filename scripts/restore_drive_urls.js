import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function restore() {
  console.log('--- Restoring Google Drive URLs ---');

  const { data: resources, error } = await supabase
    .from('sparc_resources')
    .select('id, file_id, title');

  if (error) { console.error(error); return; }

  console.log(`Found ${resources.length} records. Restoring...`);

  for (const res of resources) {
    if (!res.file_id) {
      console.warn(`Skipping [${res.title}] — no file_id`);
      continue;
    }

    const previewUrl = `https://drive.google.com/file/d/${res.file_id}/view`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${res.file_id}`;

    const { error: updateErr } = await supabase
      .from('sparc_resources')
      .update({ preview_url: previewUrl, download_url: downloadUrl })
      .eq('id', res.id);

    if (updateErr) {
      console.error(`Failed [${res.title}]:`, updateErr.message);
    } else {
      console.log(`Restored: ${res.title}`);
    }
  }

  console.log('--- Restore Complete ---');
}

restore();
