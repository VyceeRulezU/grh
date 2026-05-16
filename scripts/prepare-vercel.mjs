import fs from 'fs';
import path from 'path';

const src = path.resolve('dist/client');
const dest = path.resolve('vercel-static');

if (!fs.existsSync(src)) {
  console.error('Source dist/client does not exist!');
  process.exit(1);
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

let fileCount = 0;
function copyRecursive(s, d) {
  if (fs.lstatSync(s).isDirectory()) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    fs.readdirSync(s).forEach(child => copyRecursive(path.join(s, child), path.join(d, child)));
  } else {
    fs.copyFileSync(s, d);
    fileCount++;
  }
}

console.log(`Copying ${src} to ${dest}...`);
fs.readdirSync(src).forEach(item => copyRecursive(path.join(src, item), path.join(dest, item)));
console.log(`Copy complete! Total files copied: ${fileCount}`);
if (fileCount === 0) {
  console.error('ERROR: No files were copied! Build failed to produce output.');
  process.exit(1);
}
