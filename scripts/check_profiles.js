import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Profiles:');
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
