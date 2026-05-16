import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const clientDir = path.join(distDir, 'client');
const tempDir = path.resolve('dist-temp');

console.log('--- Restructuring dist folder for Vercel default Vite preset ---');

if (!fs.existsSync(clientDir)) {
  console.error(`Error: Client directory ${clientDir} not found!`);
  process.exit(1);
}

// 1. Move client content to tempDir
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.renameSync(clientDir, tempDir);
console.log('Moved dist/client to temporary directory');

// 2. Clean distDir (removes server/ and other files)
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
console.log('Cleaned dist directory');

// 3. Move contents of tempDir directly into distDir
function moveRecursive(src, dest) {
  if (fs.lstatSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => moveRecursive(path.join(src, child), path.join(dest, child)));
  } else {
    fs.renameSync(src, dest);
  }
}

fs.readdirSync(tempDir).forEach(item => {
  moveRecursive(path.join(tempDir, item), path.join(distDir, item));
});
console.log('Restructured all assets directly into dist/');

// 4. Clean up tempDir
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('Cleaned up temporary directory');
console.log('Restructuring complete! Vercel can now deploy the dist/ directory natively.');
