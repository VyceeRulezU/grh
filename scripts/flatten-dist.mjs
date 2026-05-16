import fs from 'fs';
import path from 'path';

const distClient = path.resolve('dist/client');
const distRoot = path.resolve('dist');

if (!fs.existsSync(distClient)) {
  console.error('dist/client does not exist! Build might have failed.');
  process.exit(1);
}

console.log('Flattening dist/client into dist root...');

function copyRecursive(src, dest) {
  if (fs.lstatSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy everything from dist/client to dist root
fs.readdirSync(distClient).forEach(item => {
  const src = path.join(distClient, item);
  const dest = path.join(distRoot, item);
  copyRecursive(src, dest);
});

console.log('Flattening complete!');
