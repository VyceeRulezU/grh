import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDb() {
  const { data: perlData, error: perlError } = await supabase.from('perl_resource').select('*').limit(5);
  console.log("PERL DB CHECK:", { perlData, perlError });
  
  const { data: sparcData, error: sparcError } = await supabase.from('sparc_resources').select('*').limit(5);
  console.log("SPARC DB CHECK:", { sparcData: sparcData?.length, sparcError });
}

checkDb();
