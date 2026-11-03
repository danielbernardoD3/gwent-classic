const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'www');

console.log('Building web bundle for mobile in:', outDir);

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy file helper
function copyFile(srcName, destName = srcName) {
  const src = path.join(rootDir, srcName);
  const dest = path.join(outDir, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${srcName}`);
  } else {
    console.warn(`File not found: ${srcName}`);
  }
}

// Copy directory helper
function copyDir(srcDirName) {
  const src = path.join(rootDir, srcDirName);
  const dest = path.join(outDir, srcDirName);
  if (!fs.existsSync(src)) {
    console.warn(`Dir not found: ${srcDirName}`);
    return;
  }
  fs.cpSync(src, dest, { recursive: true });
  console.log(`Copied directory: ${srcDirName}`);
}

// 1. Files
const files = [
  'index.html',
  'style.css',
  'menu.css',
  'story.css',
  'versus.css',
  'common.js',
  'cards.js',
  'decks.js',
  'abilities.js',
  'factions.js',
  'story_data.js',
  'story.js',
  'i18n.js',
  'achievements.js',
  'gwent.js',
  'peerjs.min.js',
  'versus.js',
  'menu.js',
  'gamepad.js',
  'Appico.png',
  'app.ico'
];

files.forEach(f => copyFile(f));

// 2. Asset directories
const assetDirs = ['img', 'music', 'fonts', 'sfx', 'svg'];
assetDirs.forEach(d => copyDir(d));

console.log('Mobile web bundle generated successfully in /www!');

