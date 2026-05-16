import fs from 'fs';
import path from 'path';

const src = path.resolve('dist/client');
const dest = path.resolve('vercel-static');

console.log('--- Preparing vercel-static output ---');

if (!fs.existsSync(src)) {
  console.error(`Error: Source directory ${src} not found!`);
  process.exit(1);
}

// 1. Clean and recreate vercel-static/
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

// 2. Copy files recursively
function copyRecursive(s, d) {
  if (fs.lstatSync(s).isDirectory()) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    fs.readdirSync(s).forEach(child => copyRecursive(path.join(s, child), path.join(d, child)));
  } else {
    fs.copyFileSync(s, d);
  }
}

console.log(`Copying files from ${src} to ${dest}...`);
fs.readdirSync(src).forEach(item => copyRecursive(path.join(src, item), path.join(dest, item)));
console.log('Preparation complete! vercel-static is ready.');
