import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    // Read the pre-rendered index.html from the static folder
    const htmlPath = join(process.cwd(), '.vercel', 'output', 'static', 'app-main.html');
    const html = readFileSync(htmlPath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Error loading homepage: ' + error.message);
  }
}
