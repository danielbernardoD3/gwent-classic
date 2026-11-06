const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_PORT = 8080;

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg',
	'.wav': 'audio/wav',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2'
};

// Clientes SSE conectados para Live Reload
const reloadClients = new Set();

function notifyReload() {
	console.log('\x1b[33m[DevServer] ⚡ Arquivos alterados — Recarregando página...\x1b[0m');
	for (const res of reloadClients) {
		try {
			res.write('data: reload\n\n');
		} catch (e) {
			reloadClients.delete(res);
		}
	}
}

// Watcher de arquivos com debounce
let watchTimeout = null;
function startFileWatcher() {
	try {
		fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
			if (!filename) return;
			// Ignora pastas e arquivos não relacionados a desenvolvimento
			if (
				filename.includes('.git') ||
				filename.includes('node_modules') ||
				filename.includes('android') ||
				filename.includes('.gradle') ||
				filename.includes('build') ||
				filename.endsWith('.tmp') ||
				filename.endsWith('.log') ||
				filename.endsWith('.zip') ||
				filename.endsWith('.apk')
			) {
				return;
			}

			const ext = path.extname(filename).toLowerCase();
			if (['.html', '.css', '.js', '.json'].includes(ext)) {
				if (watchTimeout) clearTimeout(watchTimeout);
				watchTimeout = setTimeout(() => {
					notifyReload();
				}, 200);
			}
		});
		console.log('\x1b[32m[DevServer] ✓ Live Reload ativado (monitorando .js, .css, .html, .json)\x1b[0m');
	} catch (err) {
		console.warn('[DevServer] Aviso ao iniciar watcher de arquivos:', err.message);
	}
}

// Snippet de Live Reload para ser injetado no index.html
const LIVE_RELOAD_SNIPPET = `
<!-- GWENT CLASSIC LIVE RELOAD -->
<script>
(function() {
	if (window.EventSource) {
		var es = new EventSource('/__livereload');
		es.onmessage = function(e) {
			if (e.data === 'reload') {
				console.log('[DevServer] Recarregando via Live Reload...');
				window.location.reload();
			}
		};
		es.onerror = function() {
			// reconexão automática nativa do EventSource
		};
	}
})();
</script>
`;

function createServer() {
	return http.createServer((req, res) => {
		const parsedUrl = url.parse(req.url);
		let pathname = decodeURIComponent(parsedUrl.pathname);

		// Endpoint de SSE para Live Reload
		if (pathname === '/__livereload') {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'Access-Control-Allow-Origin': '*'
			});
			res.write(': connected\n\n');
			reloadClients.add(res);

			req.on('close', () => {
				reloadClients.delete(res);
			});
			return;
		}

		if (pathname === '/' || pathname === '') {
			pathname = '/index.html';
		}

		let filePath = path.join(ROOT_DIR, pathname);

		// Segurança: previne directory traversal
		if (!filePath.startsWith(ROOT_DIR)) {
			res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end('403 Proibido');
			return;
		}

		fs.stat(filePath, (err, stats) => {
			if (err || !stats.isFile()) {
				// Tenta verificar se é um diretório com index.html
				if (stats && stats.isDirectory()) {
					filePath = path.join(filePath, 'index.html');
				} else {
					res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
					res.end(`404 Não Encontrado: ${pathname}`);
					return;
				}
			}

			const ext = path.extname(filePath).toLowerCase();
			const contentType = MIME_TYPES[ext] || 'application/octet-stream';

			// Injeção de Live Reload no index.html
			if (ext === '.html') {
				fs.readFile(filePath, 'utf8', (readErr, content) => {
					if (readErr) {
						res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
						res.end('500 Erro interno ao ler arquivo');
						return;
					}

					let modified = content;
					if (content.includes('</body>')) {
						modified = content.replace('</body>', `${LIVE_RELOAD_SNIPPET}</body>`);
					} else {
						modified = content + LIVE_RELOAD_SNIPPET;
					}

					res.writeHead(200, {
						'Content-Type': contentType,
						'Cache-Control': 'no-store, no-cache, must-revalidate',
						'Access-Control-Allow-Origin': '*'
					});
					res.end(modified);
				});
				return;
			}

			// Streaming para arquivos estáticos em geral
			res.writeHead(200, {
				'Content-Type': contentType,
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				'Access-Control-Allow-Origin': '*'
			});

			const stream = fs.createReadStream(filePath);
			stream.on('error', () => {
				if (!res.headersSent) {
					res.writeHead(500);
					res.end('Erro ao transmitir arquivo');
				}
			});
			stream.pipe(res);
		});
	});
}

function startServer(port) {
	const server = createServer();

	server.on('error', (err) => {
		if (err.code === 'EADDRINUSE') {
			console.log(`[DevServer] Porta ${port} em uso, tentando porta ${port + 1}...`);
			startServer(port + 1);
		} else {
			console.error('[DevServer] Erro no servidor:', err);
		}
	});

	server.listen(port, () => {
		const localUrl = `http://localhost:${port}/index.html?dev=1`;

		console.log('\n\x1b[36m' + '='.repeat(64));
		console.log('   ⚔️  GWENT CLASSIC — AMBIENTE DE DESENVOLVIMENTO LOCAL  ⚔️');
		console.log('='.repeat(64) + '\x1b[0m\n');
		console.log(`\x1b[32m[DevServer] Servidor rodando com sucesso em:\x1b[0m`);
		console.log(`\x1b[1m\x1b[33m➔ ${localUrl}\x1b[0m\n`);
		console.log('\x1b[37mAtalhos e Ferramentas Disponíveis:');
		console.log('  • \x1b[32mF12\x1b[0m               ➔ Abre o DevTools do Navegador (Console, Sources, Rede)');
		console.log('  • \x1b[32mF2 ou ~\x1b[0m           ➔ Abre/Fecha o Painel de Debug & Card Spawner no Duelo');
		console.log('  • \x1b[32mCtrl + Shift + D\x1b[0m  ➔ Alterna o Painel de Debug');
		console.log('  • \x1b[32mSalvar arquivo\x1b[0m    ➔ A página é recarregada automaticamente (Live Reload)');
		console.log('  • \x1b[31mCtrl + C\x1b[0m          ➔ Encerra o servidor de desenvolvimento\x1b[0m\n');

		startFileWatcher();

		// Inicialização automática do navegador ou do executável com flag de debug
		const args = process.argv.slice(2);
		const launchExe = args.includes('--exe');

		if (launchExe) {
			const exePath = path.join(ROOT_DIR, 'GwentClassic.exe');
			if (fs.existsSync(exePath)) {
				console.log('\x1b[34m[DevServer] Iniciando GwentClassic.exe em modo Debug...\x1b[0m');
				exec(`start "" "${exePath}" --debug`, { cwd: ROOT_DIR });
			} else {
				console.log('[DevServer] Executável GwentClassic.exe não encontrado, abrindo no navegador padrão.');
				exec(`start "" "${localUrl}"`);
			}
		} else {
			console.log('\x1b[34m[DevServer] Abrindo no navegador padrão...\x1b[0m');
			exec(`start "" "${localUrl}"`);
		}
	});
}

startServer(DEFAULT_PORT);

