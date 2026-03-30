import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(__dirname, '..');
const distPath = path.join(rootPath, 'dist');
const clientPath = path.join(distPath, 'client');
const vercelOutputPath = path.join(rootPath, '.vercel', 'output');
const vercelStaticPath = path.join(vercelOutputPath, 'static');

async function fixBuild() {
  if (!fs.existsSync(clientPath)) {
    console.error('dist/client not found. Build likely failed.');
    process.exit(1);
  }

  console.log('Finalizing build for Vercel (implementing Build Output API)...');

  // 1. Setup .vercel/output/static
  if (fs.existsSync(vercelOutputPath)) fs.rmSync(vercelOutputPath, { recursive: true, force: true });
  fs.mkdirSync(vercelStaticPath, { recursive: true });

  // 2. Move EVERYTHING from dist/client into .vercel/output/static
  fs.readdirSync(clientPath).forEach(file => {
    fs.renameSync(path.join(clientPath, file), path.join(vercelStaticPath, file));
  });

  // 3. Create .vercel/output/config.json
  const config = {
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  };
  fs.writeFileSync(path.join(vercelOutputPath, 'config.json'), JSON.stringify(config, null, 2));

  // 4. Also keep the files in dist root for backward compatibility or local testing (optional)
  // But for Vercel, the .vercel/output IS the source of truth if we configure it
  
  // Cleanup dist/client
  fs.rmSync(clientPath, { recursive: true, force: true });

  console.log('Build finalized: .vercel/output/static is ready for Vercel Deployment.');
}

fixBuild().catch(err => {
  console.error(err);
  process.exit(1);
});
