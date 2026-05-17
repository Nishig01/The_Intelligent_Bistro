import fs from 'fs';
import path from 'path';

const targetDirs = ['./node_modules', './app', './frontend', './backend'];
console.log('Patching project files for import.meta...');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== '.git' && f !== '.expo' && f !== 'dist') {
        walk(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

targetDirs.forEach(dir => {
  walk(dir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.cjs') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('import.meta')) {
        console.log(`Patching ${filePath}`);
        const newContent = content.replace(/import\.meta\.env/g, '({MODE:"development"})');
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }
  });
});

console.log('Done.');
