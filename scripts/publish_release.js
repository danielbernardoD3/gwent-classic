const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function getGitToken() {
  const input = "protocol=https\nhost=github.com\nusername=danielbernardoD3\n";
  const output = execSync('git credential fill', { input, encoding: 'utf8' });
  const match = output.match(/password=(.+)/);
  if (!match) throw new Error('Token not found from git credential fill');
  return match[1].trim();
}

const token = getGitToken();

// Create ZIP package for PC
function createPcZip(rootDir) {
  const zipPath = path.join(rootDir, 'GwentClassic-PC.zip');
  console.log('Creating portable GwentClassic-PC.zip package...');
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  const psCmd = `
    $items = @(
      "GwentClassic.exe",
      "Microsoft.Web.WebView2.Core.dll",
      "Microsoft.Web.WebView2.WinForms.dll",
      "WebView2Loader.dll",
      "app.ico",
      "index.html",
      "style.css",
      "menu.css",
      "story.css",
      "versus.css",
      "common.js",
      "cards.js",
      "decks.js",
      "abilities.js",
      "factions.js",
      "story_data.js",
      "story.js",
      "i18n.js",
      "achievements.js",
      "gwent.js",
      "peerjs.min.js",
      "versus.js",
      "menu.js",
      "gamepad.js",
      "version.json",
      "img",
      "music",
      "fonts",
      "sfx",
      "svg"
    )
    Compress-Archive -Path $items -DestinationPath "GwentClassic-PC.zip" -CompressionLevel Optimal
  `;
  execSync(`powershell -NoProfile -Command "${psCmd.replace(/\n/g, ' ')}"`, { cwd: rootDir });
  console.log('GwentClassic-PC.zip generated successfully.');
  return zipPath;
}

// Create the release
async function createRelease(version, rootDir) {
  const versionPath = path.join(rootDir, 'version.json');
  let changelogList = "- Melhorias gerais e correções de estabilidade";
  let apkSize = "154 MB";

  if (fs.existsSync(versionPath)) {
    const vData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    if (Array.isArray(vData.changelog) && vData.changelog.length > 0) {
      changelogList = vData.changelog.map(item => `- ${item}`).join('\n');
    }
    if (vData.apkSize) {
      apkSize = vData.apkSize;
    }
  }

  const postData = JSON.stringify({
    tag_name: version,
    target_commitish: 'main',
    name: 'Gwent Classic',
    body: `## Gwent Classic ${version}

### ⚔️ O que há de novo:
${changelogList}

### 📦 Downloads Disponíveis:
- 📱 **Android**: \`GwentClassic.apk\` (${apkSize}) — Instalação direta no celular
- 💻 **Windows PC (Completo Portátil)**: \`GwentClassic-PC.zip\` (~147 MB) — Basta descompactar e dar dois cliques em \`GwentClassic.exe\`
- ⚙️ **Executável Avulso**: \`GwentClassic.exe\` (Para atualizar apenas o inicializador)`,
    draft: false,
    prerelease: false
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: '/repos/danielbernardoD3/gwent-classic/releases',
      method: 'POST',
      headers: {
        'User-Agent': 'GwentClassic-Release-Bot',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject(new Error(`Failed to create release: ${res.statusCode} ${JSON.stringify(parsed)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Upload release asset
async function uploadAsset(releaseId, filePath, assetName, contentType) {
  const stats = fs.statSync(filePath);
  const readStream = fs.createReadStream(filePath);

  console.log(`Uploading ${assetName} (${(stats.size / 1024 / 1024).toFixed(1)} MB)...`);

  return new Promise((resolve, reject) => {
    const uploadUrl = `https://uploads.github.com/repos/danielbernardoD3/gwent-classic/releases/${releaseId}/assets?name=${encodeURIComponent(assetName)}`;
    const urlObj = new URL(uploadUrl);

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'User-Agent': 'GwentClassic-Release-Bot',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': contentType,
        'Content-Length': stats.size
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✓ Uploaded ${assetName}`);
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to upload ${assetName}: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    readStream.pipe(req);
  });
}

async function main() {
  try {
    const rootDir = path.resolve(__dirname, '..');
    const versionPath = path.join(rootDir, 'version.json');
    let version = 'v1.2.0';
    if (fs.existsSync(versionPath)) {
      const vData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      if (vData.version) version = 'v' + vData.version.replace(/^v/, '');
    }

    const release = await createRelease(version, rootDir);
    console.log(`Release created: ${release.name} (${release.tag_name})`);

    const apkPath = path.join(rootDir, 'GwentClassic.apk');
    const exePath = path.join(rootDir, 'GwentClassic.exe');
    const zipPath = createPcZip(rootDir);

    if (fs.existsSync(apkPath)) {
      await uploadAsset(release.id, apkPath, 'GwentClassic.apk', 'application/vnd.android.package-archive');
    }

    if (fs.existsSync(zipPath)) {
      await uploadAsset(release.id, zipPath, 'GwentClassic-PC.zip', 'application/zip');
    }

    if (fs.existsSync(exePath)) {
      await uploadAsset(release.id, exePath, 'GwentClassic.exe', 'application/octet-stream');
    }

    console.log('\nAll assets published successfully to GitHub Release!');
    console.log('Release Link:', release.html_url);
  } catch (err) {
    console.error('Error during release publication:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
