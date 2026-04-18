/**
 * GRH R2 Smart-Mapper
 * 
 * This script helps match manually uploaded R2 videos to Supabase modules.
 * It uses fuzzy matching to suggest pairings and lets you manually resolve mismatches.
 * 
 * RUN: node scripts/r2-smart-mapper.js
 */

import 'dotenv/config';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// --- CONFIG ---
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'grh-courses';
const PUBLIC_BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// --- UTILS ---
const normalize = (str) => {
  if (!str) return '';
  // Remove file extension if present
  const base = (str.split('/').pop() || '').split('.').slice(0, -1).join('.') || str;
  return base.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const fuzzyMatch = (modTitle, fileName) => {
  const nMod = normalize(modTitle);
  const nFile = normalize(fileName);
  
  if (!nMod || !nFile) return 0;
  if (nMod === nFile) return 1.0;
  
  // 1. Check for substring (handles "Abdul [Title]")
  if (nFile.includes(nMod)) return 0.95;
  if (nMod.includes(nFile) && nFile.length > 15) return 0.9;
  
  // 2. Token-based matching (checking if important words match)
  const modTokens = modTitle.toLowerCase().split(/\W+/).filter(t => t.length > 3);
  const fileTokens = fileName.toLowerCase().split(/\W+/).filter(t => t.length > 3);
  
  if (modTokens.length === 0) return 0;
  
  let matches = 0;
  modTokens.forEach(token => {
    if (fileTokens.includes(token)) matches++;
  });
  
  const score = matches / modTokens.length;
  return score > 0.6 ? score : 0;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function startMapping() {
  console.log("🔍 Fetching data from R2 and Supabase...");

  try {
    // 1. Fetch R2 Objects
    const r2Res = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME }));
    const r2Files = (r2Res.Contents || [])
      .map(c => c.Key)
      .filter(k => k.endsWith('.mp4') || k.endsWith('.webm'));

    if (r2Files.length === 0) {
      console.log("❌ No video files found in R2 bucket.");
      process.exit(0);
    }

    // 2. Fetch Supabase Modules
    const { data: dbModules, error } = await supabase
      .from('course_modules')
      .select('id, title, sort_order, chapter_title, courses(title)')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Group chapters to determine Chapter Number
    const chapterOrder = [...new Set(dbModules.map(m => m.chapter_title))];
    const modulesByChapter = {};
    chapterOrder.forEach(title => {
      modulesByChapter[title] = dbModules.filter(m => m.chapter_title === title);
    });

    console.log(`✅ Loaded ${r2Files.length} files from R2.`);
    console.log(`✅ Loaded ${dbModules.length} modules from Database.`);

    const mappings = [];
    const usedFiles = new Set();

    // 3. Pattern Matching Logic (e.g., "4A", "1B")
    console.log("\n🤖 Attempting pattern-based matching (4A, 1B etc.)...");
    
    for (const mod of dbModules) {
      const chNum = chapterOrder.indexOf(mod.chapter_title) + 1;
      const chModules = modulesByChapter[mod.chapter_title];
      const modIdx = chModules.indexOf(mod);
      const modLetter = String.fromCharCode(65 + modIdx); // 0 -> A, 1 -> B
      
      const pattern = new RegExp(`[\\s]${chNum}${modLetter}(?:[\\s\\.]|$)`, 'i');
      
      let match = r2Files.find(f => !usedFiles.has(f) && pattern.test(f));
      
      if (match) {
        mappings.push({ module: mod, file: match, auto: true, method: 'Pattern' });
        usedFiles.add(match);
        console.log(`  [PATTERN] Match: "${mod.title}" (Ch ${chNum}, ${modLetter}) -> ${match}`);
      } else {
        // Fallback to Fuzzy matching
        let bestMatch = null;
        let highestScore = 0;

        for (const file of r2Files) {
          if (usedFiles.has(file)) continue;
          const score = fuzzyMatch(mod.title, file.split('/').pop());
          if (score > highestScore) {
            highestScore = score;
            bestMatch = file;
          }
        }

        if (bestMatch && highestScore >= 0.8) {
          mappings.push({ module: mod, file: bestMatch, auto: true, method: 'Fuzzy' });
          usedFiles.add(bestMatch);
          console.log(`  [FUZZY] Match: "${mod.title}" -> ${bestMatch}`);
        } else {
          mappings.push({ module: mod, file: null, auto: false });
        }
      }
    }

    const unmapped = mappings.filter(m => !m.file);
    const unused = r2Files.filter(f => !usedFiles.has(f));

    console.log(`\n📊 Summary: ${mappings.length - unmapped.length} auto-matched, ${unmapped.length} unmapped, ${unused.length} extra files in R2.`);

    // 4. Interactive Phase
    for (const item of mappings) {
      if (item.file) continue;

      const chNum = chapterOrder.indexOf(item.module.chapter_title) + 1;
      console.log(`\n❓ UNMAPPED MODULE: "${item.module.title}"`);
      console.log(`   [Chapter ${chNum}: ${item.module.chapter_title}]`);
      console.log(`   (Course: ${item.module.courses.title})`);
      
      console.log("\n   Remaining R2 Files:");
      unused.forEach((f, i) => console.log(`   [${i}] ${f}`));
      console.log(`   [s] Skip this module`);
      console.log(`   [q] Quit and save current progress`);
      console.log(`   [/keyword] Type / followed by a word to filter files (e.g., /mtef)`);

      const answer = await new Promise(resolve => rl.question('\n   Pick a file number or search: ', resolve));

      if (answer.toLowerCase() === 'q') break;
      if (answer.toLowerCase() === 's') continue;
      
      if (answer.startsWith('/')) {
        const filter = answer.substring(1).toLowerCase();
        const filtered = unused.filter(f => f.toLowerCase().includes(filter));
        console.log(`\n   🔍 Filtered Results for "${filter}":`);
        filtered.forEach(f => {
          const originalIdx = unused.indexOf(f);
          console.log(`   [${originalIdx}] ${f}`);
        });
        // Loop back for the same module
        item.file = null; 
        mappings.unshift(mappings.splice(mappings.indexOf(item), 1)[0]);
        continue;
      }

      const idx = parseInt(answer);
      if (!isNaN(idx) && unused[idx]) {
        item.file = unused[idx];
        unused.splice(idx, 1);
        console.log(`   ✅ Manually matched!`);
      }
    }

    // 5. Final Sync
    const finalMappings = mappings.filter(m => m.file);
    console.log(`\n💾 Ready to update ${finalMappings.length} modules in Supabase.`);
    const confirm = await new Promise(resolve => rl.question('   Proceed with database update? (y/n): ', resolve));

    if (confirm.toLowerCase() === 'y') {
      for (const map of finalMappings) {
        const fullUrl = `${PUBLIC_BASE_URL}/${map.file}`;
        const { error: updErr } = await supabase
          .from('course_modules')
          .update({ video_url: fullUrl })
          .eq('id', map.module.id);
        
        if (updErr) console.error(`   ❌ Failed: ${map.module.title} -> ${updErr.message}`);
        else console.log(`   ✅ Updated: ${map.module.title}`);
      }
      console.log("\n✨ Database sync complete!");
    } else {
      console.log("\n❌ Sync cancelled.");
    }

  } catch (err) {
    console.error("❌ Error during mapping:", err);
  } finally {
    rl.close();
  }
}

startMapping();
