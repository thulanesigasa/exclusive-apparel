import fs from 'node:fs';
import path from 'node:path';

const indexPath = path.resolve(process.cwd(), 'node_modules/lucide-react/dist/esm/icons/index.js');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  let changed = false;

  if (content.includes("'.'stretch-vertical.js'")) {
    content = content.replace("'.'stretch-vertical.js'", "'./stretch-vertical.js'");
    changed = true;
  }
  if (content.includes("'./stethoscopm.js'")) {
    content = content.replace("'./stethoscopm.js'", "'./stethoscope.js'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('[patch-lucide] Applied hotfix to lucide-react exports.');
  }
}
