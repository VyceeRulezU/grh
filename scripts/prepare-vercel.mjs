import fs from 'fs';
import path from 'path';

const src = path.resolve('dist/client');
const dest = path.resolve('.vercel/output/static');
const configDir = path.resolve('.vercel/output');

if (!fs.existsSync(src)) {
  console.error('Source dist/client does not exist!');
  process.exit(1);
}

// Clean and create .vercel/output structure
if (fs.existsSync(configDir)) {
  fs.rmSync(configDir, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

// Create the required config.json for Build Output API
const config = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' }
  ]
};
fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify(config, null, 2));

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
console.log(`Copy complete! Total files deployed to Vercel Output API: ${fileCount}`);
if (fileCount === 0) {
  console.error('ERROR: No files were copied!');
  process.exit(1);
}
