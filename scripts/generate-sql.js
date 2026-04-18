import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import 'dotenv/config';

const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

async function run() {
  const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const r2 = await s3.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME }));
  const files = (r2.Contents || []).map(c => c.Key).filter(f => f.endsWith('.mp4'));

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: mods, error } = await supabase
    .from('course_modules')
    .select('id, title, chapter_title, sort_order')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const chaps = [...new Set(mods.map(m => m.chapter_title))];
  const mByC = {};
  chaps.forEach(t => mByC[t] = mods.filter(x => x.chapter_title === t));

  const used = new Set();
  let sql = '';
  let count = 0;

  for (const m of mods) {
    const chIdx = chaps.indexOf(m.chapter_title);
    const cN = chIdx + 1;
    const chModules = mByC[m.chapter_title];
    const mL = String.fromCharCode(65 + chModules.indexOf(m));

    // Priority 1: Pattern match (e.g. 4K)
    const pPattern = new RegExp(`[\\s]${cN}${mL}(?:[\\s\\.]|$)`, 'i');
    const pMatch = files.find(f => !used.has(f) && pPattern.test(f));

    let match = pMatch || files.find(f => !used.has(f) && normalize(f).includes(normalize(m.title)));

    if (match) {
      const url = process.env.GRH_COURSES_CLOUDFLARE_R2_PUBLIC_URL + '/' + match.replace(/'/g, "''");
      sql += `UPDATE course_modules SET video_url = '${url}' WHERE id = ${m.id};\n`;
      used.add(match);
      count++;
    }
  }

  fs.writeFileSync('scripts/update-links.sql', sql);
  console.log(`✅ Generated ${count} SQL updates in scripts/update-links.sql`);
}

run().catch(console.error);
