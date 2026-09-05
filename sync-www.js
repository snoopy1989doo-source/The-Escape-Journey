const fs = require('fs');
const path = require('path');

const root = __dirname;
const wwwDir = path.join(root, 'www');

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

const filesToCopy = ['index.html', 'manifest.json', 'sw.js', 'app-logo.png'];
for (const file of filesToCopy) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(wwwDir, file));
  }
}

const assetsSrc = path.join(root, 'assets');
const assetsDest = path.join(wwwDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
}

const androidPublicDir = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'public');
if (fs.existsSync(androidPublicDir)) {
  for (const file of filesToCopy) {
    const src = path.join(root, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(androidPublicDir, file));
    }
  }
  const androidAssetsDest = path.join(androidPublicDir, 'assets');
  if (fs.existsSync(assetsSrc)) {
    fs.cpSync(assetsSrc, androidAssetsDest, { recursive: true });
  }
  console.log('Successfully synced all web assets to android assets public');
}

console.log('Successfully synced all web assets to www/');
