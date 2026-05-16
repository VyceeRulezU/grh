import fs from 'fs';
import path from 'path';

const configPath = path.resolve('.vercel/output/config.json');

console.log('--- Patching Vercel config.json for Linux and filesystem compatibility ---');

if (!fs.existsSync(configPath)) {
  console.error(`Error: Vercel config not found at ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 1. Resolve Windows backslashes in overrides
if (config.overrides) {
  const newOverrides = {};
  for (const [key, value] of Object.entries(config.overrides)) {
    // Replace all backslashes with forward slashes
    const newKey = key.replace(/\\/g, '/');
    newOverrides[newKey] = value;
    if (key !== newKey) {
      console.log(`Patched override path: ${key} -> ${newKey}`);
    }
  }
  config.overrides = newOverrides;
}

// 2. Inject missing filesystem router to allow serving static assets
if (config.routes) {
  const hasFilesystem = config.routes.some(r => r.handle === 'filesystem');
  if (!hasFilesystem) {
    console.log('Injecting "handle: filesystem" into Vercel routes...');
    // Find the index of the error handler or 404 catch-all, and insert right before it
    const errorIndex = config.routes.findIndex(r => r.handle === 'error' || r.status === 404);
    if (errorIndex !== -1) {
      config.routes.splice(errorIndex, 0, { handle: 'filesystem' });
    } else {
      config.routes.push({ handle: 'filesystem' });
    }
    console.log('"handle: filesystem" successfully injected!');
  }
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
console.log('Vercel config.json successfully patched!');
