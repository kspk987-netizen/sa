const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname);
const dist = path.join(root, 'dist');

if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

const files = [
  'index.html',
  'styles.css',
  'istockphoto-1488597778-612x612.jpg',
  '.htaccess',
  'vercel.json',
  'package.json',
  'server.js'
];

for (const f of files) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, f));
    console.log('Copied file:', f);
  }
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
console.log('Copied assets/');
copyDir(path.join(root, 'api'), path.join(dist, 'api'));
console.log('Copied api/');

const zipPath = path.join(root, 'para-deployment.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

execSync('powershell -NoProfile -Command "Compress-Archive -Path \'g:\\sap\\dist\\*\' -DestinationPath \'g:\\sap\\para-deployment.zip\' -Force"');
console.log('SUCCESS: Created para-deployment.zip (' + fs.statSync(zipPath).size + ' bytes)');
