const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// 1. Get token from git credential manager
function getGitToken() {
  const input = "protocol=https\nhost=github.com\nusername=danielbernardoD3\n";
  const output = execSync('git credential fill', { input, encoding: 'utf8' });
  const match = output.match(/password=(.+)/);
  if (!match) throw new Error('Token not found from git credential fill');
  return match[1].trim();
}

const token = getGitToken();
console.log('GitHub token obtained successfully.');

// 2. Create the release
async function createRelease() {
  const postData = JSON.stringify({
    tag_name: 'v1.1.0',
    target_commitish: 'main',
    name: 'Gwent Classic',
    body: `## Gwent Classic v1.1.0

### ⚔️ O que há de novo:
- Suporte a gestos touch no Mapa da História (Pan com 1 dedo e Pinch-to-Zoom com 2 dedos)
- Letterboxing 16:9 automático com barras pretas (tabuleiro 100% visível em qualquer proporção de tela)
- Novo menu dropdown no cabeçalho do mapa da história
- Ícone oficial de alta definição para Android e PC
- Feedback tátil (vibração) ao baixar cartas, queima de fileira e passar turno
- Inspeção de cartas por toque longo (380ms) e botão direito no PC
- Gerenciador de Backup e Restauração de Save em JSON
- Janela de carência de 45 segundos para reconexão no Modo Versus
- Redução de 52% no tamanho do jogo com áudio otimizado
- Sistema de Atualizador Automático In-Game

### 📦 Downloads:
- **Android**: \`GwentClassic.apk\` (154 MB)
- **Windows PC**: \`GwentClassic.exe\``,
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
          console.log('Release created successfully!');
          console.log('Release ID:', parsed.id);
          console.log('HTML URL:', parsed.html_url);
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

// 3. Upload asset helper
async function uploadAsset(releaseId, filePath, assetName, contentType) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  console.log(`Uploading ${assetName} (${(fileSize / (1024 * 1024)).toFixed(1)} MB)...`);

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const req = https.request({
      hostname: 'uploads.github.com',
      path: `/repos/danielbernardoD3/gwent-classic/releases/${releaseId}/assets?name=${encodeURIComponent(assetName)}`,
      method: 'POST',
      headers: {
        'User-Agent': 'GwentClassic-Release-Bot',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': contentType,
        'Content-Length': fileSize
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Successfully uploaded ${assetName}!`);
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Upload failed for ${assetName}: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    readStream.pipe(req);
  });
}

async function main() {
  try {
    const release = await createRelease();
    const rootDir = path.resolve(__dirname, '..');

    const apkPath = path.join(rootDir, 'GwentClassic.apk');
    const exePath = path.join(rootDir, 'GwentClassic.exe');

    if (fs.existsSync(apkPath)) {
      await uploadAsset(release.id, apkPath, 'GwentClassic.apk', 'application/vnd.android.package-archive');
    } else {
      console.warn('GwentClassic.apk not found at:', apkPath);
    }

    if (fs.existsSync(exePath)) {
      await uploadAsset(release.id, exePath, 'GwentClassic.exe', 'application/octet-stream');
    } else {
      console.warn('GwentClassic.exe not found at:', exePath);
    }

    console.log('\nAll assets published successfully to GitHub Release v1.1.0!');
    console.log('Release Link:', release.html_url);
  } catch (err) {
    console.error('Error during release publication:', err);
    process.exit(1);
  }
}

main();

