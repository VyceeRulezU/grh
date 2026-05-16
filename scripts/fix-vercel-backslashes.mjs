import fs from 'fs';
import path from 'path';

const configPath = path.resolve('.vercel/output/config.json');

console.log('--- Patching Vercel config.json backslashes for Linux compatibility ---');

if (!fs.existsSync(configPath)) {
  console.error(`Error: Vercel config not found at ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (config.overrides) {
  const newOverrides = {};
  for (const [key, value] of Object.entries(config.overrides)) {
    // Replace all backslashes with forward slashes
    const newKey = key.replace(/\\/g, '/');
    newOverrides[newKey] = value;
    if (key !== newKey) {
      console.log(`Patched override: ${key} -> ${newKey}`);
    }
  }
  config.overrides = newOverrides;
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
console.log('Vercel config.json successfully patched!');
