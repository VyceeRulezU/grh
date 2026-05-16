import fs from 'fs';
import path from 'path';

const src = path.resolve('dist/client');
const outputDir = path.resolve('.vercel/output');
const staticDir = path.join(outputDir, 'static');

console.log('--- Preparing Vercel Build Output API ---');

if (!fs.existsSync(src)) {
  console.error(`Error: Source directory ${src} not found!`);
  process.exit(1);
}

// 1. Clean and recreate .vercel/output structure
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// 2. Copy pre-rendered static files
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

// 3. Generate the ultimate config.json for pre-rendered MPA
const config = {
  version: 3,
  cleanUrls: true,
  routes: [
    {
      src: '^/assets/(.*)',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true
    },
    {
      src: '^/$',
      dest: '/index.html'
    },
    {
      src: '^/index(\\.html)?$',
      dest: '/index.html'
    },
    {
      handle: 'filesystem'
    }
  ]
};

fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify(config, null, 2));
console.log('Generated .vercel/output/config.json');
console.log('Preparation complete!');
