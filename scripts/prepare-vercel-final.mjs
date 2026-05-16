import fs from 'fs';
import path from 'path';

const src = path.resolve('dist/client');
const outputDir = path.resolve('.vercel/output');
const staticDir = path.join(outputDir, 'static');

console.log('--- Restructuring for Vercel Build Output API ---');

// 1. Clean and create .vercel/output structure
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// 2. Copy pre-rendered static files
if (!fs.existsSync(src)) {
  console.error(`Error: Source directory ${src} not found!`);
  process.exit(1);
}

function copyRecursive(s, d) {
  if (fs.lstatSync(s).isDirectory()) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    fs.readdirSync(s).forEach(child => copyRecursive(path.join(s, child), path.join(d, child)));
  } else {
    fs.copyFileSync(s, d);
  }
}

console.log(`Copying files from ${src} to ${staticDir}...`);
fs.readdirSync(src).forEach(item => copyRecursive(path.join(src, item), path.join(staticDir, item)));

// 3. Generate clean, standard config.json
const config = {
  version: 3,
  cleanUrls: true,
  routes: [
    {
      handle: 'filesystem'
    }
  ]
};

fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify(config, null, 2));
console.log('Generated .vercel/output/config.json');
console.log('Restructuring complete!');
