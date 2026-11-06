/**
 * GWENT CLASSIC — IN-GAME DEBUGGER & MATCH INSPECTOR
 * Utilitário avançado de depuração e inspeção durante duelos e desenvolvimento.
 */

(function () {
	"use strict";

	const GwentDebugger = {
		isOpen: false,
		isMaximized: false,
		activeTab: "match",
		logs: [],
		maxLogs: 300,
		unreadErrors: 0,
		filterLevel: "all",
		filterSearch: "",
		autoRefreshInterval: null,

		// Interceptação de Logs e Erros
		initLogging() {
			const self = this;
			const originalLog = console.log;
			const originalInfo = console.info;
			const originalWarn = console.warn;
			const originalError = console.error;

			function addEntry(level, args) {
				try {
					const time = new Date().toLocaleTimeString();
					const message = Array.from(args).map(a => {
						if (typeof a === "object") {
							try { return JSON.stringify(a); } catch (e) { return String(a); }
						}
						return String(a);
					}).join(" ");

					const entry = { time, level, message };
					self.logs.push(entry);
					if (self.logs.length > self.maxLogs) self.logs.shift();

					if (level === "error") {
						self.unreadErrors++;
						self.updateErrorBadge();
					}

					if (self.isOpen && self.activeTab === "logs") {
						self.renderLogs();
					}
				} catch (e) { }
			}

			console.log = function (...args) {
				originalLog.apply(console, args);
				addEntry("info", args);
			};
			console.info = function (...args) {
				originalInfo.apply(console, args);
				addEntry("info", args);
			};
			console.warn = function (...args) {
				originalWarn.apply(console, args);
				addEntry("warn", args);
			};
			console.error = function (...args) {
				originalError.apply(console, args);
				addEntry("error", args);
			};

			window.addEventListener("error", function (e) {
				const errMsg = e.message || "Erro desconhecido de execução";
				const source = e.filename ? `${e.filename.split("/").pop()}:${e.lineno}` : "script";
				self.showErrorBanner(`[${source}] ${errMsg}`);
				addEntry("error", [`[Erro Global em ${source}]`, errMsg, e.error && e.error.stack ? "\n" + e.error.stack : ""]);
			});

			window.addEventListener("unhandledrejection", function (e) {
				const reason = e.reason ? (e.reason.message || String(e.reason)) : "Rejeição não tratada";
				self.showErrorBanner(`[Promise Rejeitada] ${reason}`);
				addEntry("error", ["[Promise Rejection]", reason, e.reason && e.reason.stack ? "\n" + e.reason.stack : ""]);
			});
		},

		init() {
			this.initLogging();
			const self = this;

			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", () => self.setupUI());
			} else {
				self.setupUI();
			}
		},

		setupUI() {
			if (document.getElementById("gc-debugger-modal")) return;

			// Criação do Botão Flutuante
			const toggleBtn = document.createElement("button");
			toggleBtn.id = "gc-debug-toggle-btn";
			toggleBtn.innerHTML = `<span>🐞</span> <span>Debug</span> <span class="tab-badge" id="gc-debug-badge">0</span>`;
			toggleBtn.title = "Abrir Painel de Debug (Atalho: F2 ou ~)";
			toggleBtn.onclick = () => this.toggle();
			document.body.appendChild(toggleBtn);

			// Criação do Banner de Erro Global
			const banner = document.createElement("div");
			banner.id = "gc-debug-error-banner";
			banner.innerHTML = `
				<span>⚠️</span>
				<div class="banner-msg" id="gc-debug-banner-msg">Erro detectado no script</div>
				<button class="banner-btn" id="gc-debug-banner-inspect-btn">Inspecionar</button>
				<button class="banner-btn" style="background:#4a1515;" id="gc-debug-banner-close-btn">✕</button>
			`;
			document.body.appendChild(banner);
			document.getElementById("gc-debug-banner-inspect-btn").onclick = () => {
				this.hideErrorBanner();
				this.open();
				this.switchTab("logs");
			};
			document.getElementById("gc-debug-banner-close-btn").onclick = () => this.hideErrorBanner();

			// Criação do Modal de Debug
			const modal = document.createElement("div");
			modal.id = "gc-debugger-modal";
			modal.innerHTML = `
				<div class="gc-dbg-header" id="gc-dbg-drag-handle">
					<div class="gc-dbg-title">
						<span>⚔️</span>
						<span>GWENT CLASSIC — PAINEL DE DEBUG</span>
					</div>
					<div class="gc-dbg-actions">
						<button class="gc-dbg-btn-icon" id="gc-dbg-btn-refresh" title="Atualizar Dados">🔄</button>
						<button class="gc-dbg-btn-icon" id="gc-dbg-btn-maximize" title="Maximizar / Restaurar">⛶</button>
						<button class="gc-dbg-btn-icon" id="gc-dbg-btn-close" title="Fechar (F2)">✕</button>
					</div>
				</div>

				<div class="gc-dbg-tabs">
					<button class="gc-dbg-tab active" data-tab="match">⚔️ Duelo & Tabuleiro</button>
					<button class="gc-dbg-tab" data-tab="actions">🃏 Ações & Spawner</button>
					<button class="gc-dbg-tab" data-tab="logs">
						📜 Console & Logs
						<span class="tab-badge" id="gc-dbg-tab-badge">0</span>
					</button>
				</div>

				<div class="gc-dbg-content">
					<!-- Aba 1: Duelo & Tabuleiro -->
					<div class="gc-dbg-tab-panel active" id="gc-dbg-panel-match">
						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Estado da Partida</span>
								<span id="gc-dbg-match-status-badge" style="color:#d1b16a; font-weight:normal;">Verificando...</span>
							</div>
							<div class="gc-dbg-status-grid">
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Rodada / Turno</div>
									<div class="gc-dbg-stat-value highlight" id="gc-dbg-stat-round">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Vez de Jogar</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-stat-turn">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Jogador (Gemas / Mão)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-stat-me">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Oponente / IA (Gemas / Mão)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-stat-op">-</div>
								</div>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">Placar por Fileira</div>
							<table class="gc-dbg-rows-table">
								<thead>
									<tr>
										<th>Lado</th>
										<th>Corpo a Corpo</th>
										<th>Longo Alcance</th>
										<th>Cerco</th>
										<th>Total</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td><strong>IA (Op)</strong></td>
										<td id="gc-dbg-row-op-close">0</td>
										<td id="gc-dbg-row-op-ranged">0</td>
										<td id="gc-dbg-row-op-siege">0</td>
										<td class="row-highlight" id="gc-dbg-total-op">0</td>
									</tr>
									<tr>
										<td><strong>Jogador</strong></td>
										<td id="gc-dbg-row-me-close">0</td>
										<td id="gc-dbg-row-me-ranged">0</td>
										<td id="gc-dbg-row-me-siege">0</td>
										<td class="row-highlight" id="gc-dbg-total-me">0</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Clima & Modificadores</span>
							</div>
							<div style="font-size:11px; display:flex; flex-direction:column; gap:4px;">
								<div><strong>Climas no Tabuleiro:</strong> <span id="gc-dbg-weather-status" style="color:#a8c0ff;">Nenhum</span></div>
								<div><strong>Regras Ativas:</strong> <span id="gc-dbg-rules-status" style="color:#d1b16a;">Padrão</span></div>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Mão do Oponente / IA (<span id="gc-dbg-ai-hand-count">0</span> cartas)</span>
								<button class="gc-dbg-btn" style="padding:2px 8px; font-size:10px;" id="gc-dbg-btn-toggle-ai-hand">Revelar Mão</button>
							</div>
							<div class="gc-dbg-ai-hand-list" id="gc-dbg-ai-hand-list">
								<div style="color:#6b6357; text-align:center; padding:10px;">Clique em "Revelar Mão" para inspecionar.</div>
							</div>
						</div>
					</div>

					<!-- Aba 2: Ações & Spawner -->
					<div class="gc-dbg-tab-panel" id="gc-dbg-panel-actions">
						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">Comandos Rápidos de Teste</div>
							<div class="gc-dbg-actions-grid">
								<button class="gc-dbg-btn" id="gc-dbg-act-draw-me">🎴 Comprar Carta (+1)</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-draw-op">🤖 IA Comprar Carta (+1)</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-force-pass-op">✋ Forçar IA a Passar</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-clear-weather">☀️ Limpar Todo Clima</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-recalc-board">🔄 Recalcular Tabuleiro</button>
								<button class="gc-dbg-btn danger" id="gc-dbg-act-win-round">⚡ Ganhar Rodada Atual</button>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">🃏 Invocador de Cartas (Card Spawner)</div>
							<div class="gc-dbg-spawner-form">
								<input type="text" class="gc-dbg-input" id="gc-dbg-card-search" placeholder="Buscar carta por nome ou habilidade..." />
								<select class="gc-dbg-select" id="gc-dbg-card-select" size="6" style="height:120px;"></select>
								<div style="display:flex; gap:8px;">
									<button class="gc-dbg-btn" style="flex:1;" id="gc-dbg-act-spawn-me">➕ Inserir na Minha Mão</button>
									<button class="gc-dbg-btn" style="flex:1;" id="gc-dbg-act-spawn-op">➕ Inserir na Mão da IA</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Aba 3: Console & Logs -->
					<div class="gc-dbg-tab-panel" id="gc-dbg-panel-logs">
						<div class="gc-dbg-log-toolbar">
							<div class="gc-dbg-log-filters">
								<span class="gc-dbg-filter-chip active" data-lvl="all">Todos</span>
								<span class="gc-dbg-filter-chip" data-lvl="info">Info</span>
								<span class="gc-dbg-filter-chip" data-lvl="warn">Avisos</span>
								<span class="gc-dbg-filter-chip" data-lvl="error">Erros</span>
							</div>
							<div style="display:flex; gap:6px;">
								<button class="gc-dbg-btn" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-copy-logs">📋 Copiar Logs</button>
								<button class="gc-dbg-btn" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-clear-logs">🗑️ Limpar</button>
							</div>
						</div>
						<input type="text" class="gc-dbg-input" id="gc-dbg-log-search" placeholder="Filtrar mensagem de log..." style="margin-bottom:6px;" />
						<div class="gc-dbg-console-output" id="gc-dbg-console-output"></div>
					</div>
				</div>
			`;
			document.body.appendChild(modal);

			this.bindEvents();
			this.populateCardSelect();

			// Verifica se deve abrir automaticamente por parâmetro da URL ou debug salvo
			const params = new URLSearchParams(window.location.search);
			if (params.get("dev") === "1" || params.get("debug") === "1" || localStorage.getItem("gc_auto_debug") === "true") {
				this.open();
			}
		},

		bindEvents() {
			const self = this;

			// Teclas de Atalho: F2 ou ~ ou Ctrl+Shift+D
			window.addEventListener("keydown", function (e) {
				if (e.key === "F2" || e.key === "~" || e.key === "`" || (e.ctrlKey && e.shiftKey && e.code === "KeyD")) {
					e.preventDefault();
					self.toggle();
				}
			});

			// Header buttons
			document.getElementById("gc-dbg-btn-close").onclick = () => self.close();
			document.getElementById("gc-dbg-btn-maximize").onclick = () => self.toggleMaximize();
			document.getElementById("gc-dbg-btn-refresh").onclick = () => {
				self.updateMatchInspector();
				self.showToast("Dados atualizados.");
			};

			// Tabs
			const tabs = document.querySelectorAll(".gc-dbg-tab");
			tabs.forEach(tab => {
				tab.onclick = () => {
					self.switchTab(tab.getAttribute("data-tab"));
				};
			});

			// Log filters
			const chips = document.querySelectorAll(".gc-dbg-filter-chip");
			chips.forEach(chip => {
				chip.onclick = () => {
					chips.forEach(c => c.classList.remove("active"));
					chip.classList.add("active");
					self.filterLevel = chip.getAttribute("data-lvl");
					self.renderLogs();
				};
			});

			document.getElementById("gc-dbg-log-search").oninput = (e) => {
				self.filterSearch = e.target.value.toLowerCase();
				self.renderLogs();
			};

			document.getElementById("gc-dbg-btn-clear-logs").onclick = () => {
				self.logs = [];
				self.unreadErrors = 0;
				self.updateErrorBadge();
				self.renderLogs();
				self.showToast("Logs limpos.");
			};

			document.getElementById("gc-dbg-btn-copy-logs").onclick = () => self.copyLogsToClipboard();

			// AI Hand Toggle
			document.getElementById("gc-dbg-btn-toggle-ai-hand").onclick = () => self.toggleAIHandVisibility();

			// Card Spawner Search
			document.getElementById("gc-dbg-card-search").oninput = (e) => {
				self.populateCardSelect(e.target.value);
			};

			// Action Buttons
			document.getElementById("gc-dbg-act-draw-me").onclick = () => self.actionDrawCard(0);
			document.getElementById("gc-dbg-act-draw-op").onclick = () => self.actionDrawCard(1);
			document.getElementById("gc-dbg-act-force-pass-op").onclick = () => self.actionForceAIPass();
			document.getElementById("gc-dbg-act-clear-weather").onclick = () => self.actionClearWeather();
			document.getElementById("gc-dbg-act-recalc-board").onclick = () => self.actionRecalculateBoard();
			document.getElementById("gc-dbg-act-win-round").onclick = () => self.actionForceWinRound();
			document.getElementById("gc-dbg-act-spawn-me").onclick = () => self.actionSpawnCard(0);
			document.getElementById("gc-dbg-act-spawn-op").onclick = () => self.actionSpawnCard(1);

			// Arrastar Modal
			this.makeDraggable(document.getElementById("gc-debugger-modal"), document.getElementById("gc-dbg-drag-handle"));
		},

		makeDraggable(modal, handle) {
			let isDragging = false;
			let startX, startY, origX, origY;

			handle.addEventListener("mousedown", (e) => {
				if (this.isMaximized || e.target.tagName === "BUTTON") return;
				isDragging = true;
				startX = e.clientX;
				startY = e.clientY;
				const rect = modal.getBoundingClientRect();
				origX = rect.left;
				origY = rect.top;
				modal.style.right = "auto";
				modal.style.bottom = "auto";
				modal.style.left = origX + "px";
				modal.style.top = origY + "px";
				e.preventDefault();
			});

			window.addEventListener("mousemove", (e) => {
				if (!isDragging) return;
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;
				modal.style.left = Math.max(0, origX + dx) + "px";
				modal.style.top = Math.max(0, origY + dy) + "px";
			});

			window.addEventListener("mouseup", () => {
				isDragging = false;
			});
		},

		toggle() {
			if (this.isOpen) this.close();
			else this.open();
		},

		open() {
			const modal = document.getElementById("gc-debugger-modal");
			if (!modal) return;
			modal.style.display = "flex";
			this.isOpen = true;
			this.updateMatchInspector();

			if (!this.autoRefreshInterval) {
				this.autoRefreshInterval = setInterval(() => {
					if (this.isOpen && this.activeTab === "match") {
						this.updateMatchInspector();
					}
				}, 1500);
			}

			if (this.activeTab === "logs") {
				this.renderLogs();
			}
		},

		close() {
			const modal = document.getElementById("gc-debugger-modal");
			if (!modal) return;
			modal.style.display = "none";
			this.isOpen = false;
			if (this.autoRefreshInterval) {
				clearInterval(this.autoRefreshInterval);
				this.autoRefreshInterval = null;
			}
		},

		toggleMaximize() {
			const modal = document.getElementById("gc-debugger-modal");
			if (!modal) return;
			this.isMaximized = !this.isMaximized;
			if (this.isMaximized) {
				modal.classList.add("maximized");
			} else {
				modal.classList.remove("maximized");
			}
		},

		switchTab(tabName) {
			this.activeTab = tabName;
			const tabs = document.querySelectorAll(".gc-dbg-tab");
			tabs.forEach(t => {
				if (t.getAttribute("data-tab") === tabName) t.classList.add("active");
				else t.classList.remove("active");
			});

			const panels = document.querySelectorAll(".gc-dbg-tab-panel");
			panels.forEach(p => p.classList.remove("active"));
			const targetPanel = document.getElementById(`gc-dbg-panel-${tabName}`);
			if (targetPanel) targetPanel.classList.add("active");

			if (tabName === "match") this.updateMatchInspector();
			if (tabName === "logs") {
				this.unreadErrors = 0;
				this.updateErrorBadge();
				this.renderLogs();
			}
		},

		showErrorBanner(msg) {
			const banner = document.getElementById("gc-debug-error-banner");
			const msgElem = document.getElementById("gc-debug-banner-msg");
			if (!banner || !msgElem) return;
			msgElem.innerText = msg;
			banner.style.display = "flex";
		},

		hideErrorBanner() {
			const banner = document.getElementById("gc-debug-error-banner");
			if (banner) banner.style.display = "none";
		},

		updateErrorBadge() {
			const badge = document.getElementById("gc-debug-badge");
			const tabBadge = document.getElementById("gc-dbg-tab-badge");
			const btn = document.getElementById("gc-debug-toggle-btn");

			if (this.unreadErrors > 0) {
				if (badge) {
					badge.innerText = this.unreadErrors;
					badge.style.display = "inline-block";
				}
				if (tabBadge) {
					tabBadge.innerText = this.unreadErrors;
					tabBadge.style.display = "inline-block";
				}
				if (btn) btn.classList.add("has-error");
			} else {
				if (badge) badge.style.display = "none";
				if (tabBadge) tabBadge.style.display = "none";
				if (btn) btn.classList.remove("has-error");
			}
		},

		updateMatchInspector() {
			const inGame = typeof game !== "undefined" && game && typeof player_me !== "undefined" && player_me;
			const statusBadge = document.getElementById("gc-dbg-match-status-badge");

			if (!inGame) {
				if (statusBadge) statusBadge.innerText = "Fora de Partida (No Menu)";
				return;
			}

			if (statusBadge) statusBadge.innerText = "⚔️ Partida em Andamento";

			// Status geral
			const roundElem = document.getElementById("gc-dbg-stat-round");
			const turnElem = document.getElementById("gc-dbg-stat-turn");
			const meElem = document.getElementById("gc-dbg-stat-me");
			const opElem = document.getElementById("gc-dbg-stat-op");

			if (roundElem) roundElem.innerText = `Rodada ${game.round || 1}`;
			if (turnElem) {
				const isMeTurn = game.activePlayer === player_me;
				turnElem.innerText = isMeTurn ? "🛡️ Jogador" : "🤖 IA (Oponente)";
				turnElem.style.color = isMeTurn ? "#74c0fc" : "#ff8787";
			}
			if (meElem) {
				const meHandCount = (player_me.hand && player_me.hand.cards) ? player_me.hand.cards.length : 0;
				const mePassed = player_me.passed ? " (Passou)" : "";
				meElem.innerText = `❤️ ${player_me.health || 0} Gemas | 🎴 ${meHandCount} cartas${mePassed}`;
			}
			if (opElem) {
				const opHandCount = (player_op.hand && player_op.hand.cards) ? player_op.hand.cards.length : 0;
				const opPassed = player_op.passed ? " (Passou)" : "";
				opElem.innerText = `❤️ ${player_op.health || 0} Gemas | 🎴 ${opHandCount} cartas${opPassed}`;
			}

			// Placar por Fileira
			if (typeof board !== "undefined" && board && board.row) {
				const opClose = (board.row[0] && board.row[0].score) || 0;
				const opRanged = (board.row[1] && board.row[1].score) || 0;
				const opSiege = (board.row[2] && board.row[2].score) || 0;
				const meClose = (board.row[3] && board.row[3].score) || 0;
				const meRanged = (board.row[4] && board.row[4].score) || 0;
				const meSiege = (board.row[5] && board.row[5].score) || 0;

				document.getElementById("gc-dbg-row-op-close").innerText = opClose;
				document.getElementById("gc-dbg-row-op-ranged").innerText = opRanged;
				document.getElementById("gc-dbg-row-op-siege").innerText = opSiege;
				document.getElementById("gc-dbg-total-op").innerText = player_op.total || (opClose + opRanged + opSiege);

				document.getElementById("gc-dbg-row-me-close").innerText = meClose;
				document.getElementById("gc-dbg-row-me-ranged").innerText = meRanged;
				document.getElementById("gc-dbg-row-me-siege").innerText = meSiege;
				document.getElementById("gc-dbg-total-me").innerText = player_me.total || (meClose + meRanged + meSiege);
			}

			// Clima
			const weatherElem = document.getElementById("gc-dbg-weather-status");
			if (weatherElem && typeof weather !== "undefined" && weather.types) {
				const activeWeathers = [];
				if (weather.types.frost && weather.types.frost.count > 0) activeWeathers.push("❄️ Geadas");
				if (weather.types.fog && weather.types.fog.count > 0) activeWeathers.push("🌫️ Névoa");
				if (weather.types.rain && weather.types.rain.count > 0) activeWeathers.push("🌧️ Chuva");
				weatherElem.innerText = activeWeathers.length > 0 ? activeWeathers.join(", ") : "Céu Limpo (Nenhum)";
			}

			// Regras Ativas
			const rulesElem = document.getElementById("gc-dbg-rules-status");
			if (rulesElem && typeof GameRules !== "undefined") {
				const list = GameRules.getActiveRulesList();
				if (list.length > 0) {
					rulesElem.innerText = list.map(r => `${r.icon} ${r.name}`).join(" | ");
				} else {
					rulesElem.innerText = "Modo Clássico (Regras Padrão)";
				}
			}

			// Mão da IA
			this.renderAIHandList();
		},

		toggleAIHandVisibility() {
			this._showAIHand = !this._showAIHand;
			const btn = document.getElementById("gc-dbg-btn-toggle-ai-hand");
			if (btn) btn.innerText = this._showAIHand ? "Ocultar Mão" : "Revelar Mão";
			this.renderAIHandList();
		},

		renderAIHandList() {
			const container = document.getElementById("gc-dbg-ai-hand-list");
			const counter = document.getElementById("gc-dbg-ai-hand-count");
			if (!container) return;

			if (typeof player_op === "undefined" || !player_op || !player_op.hand || !player_op.hand.cards) {
				container.innerHTML = `<div style="color:#6b6357; text-align:center; padding:10px;">Sem oponente ativo.</div>`;
				if (counter) counter.innerText = "0";
				return;
			}

			const cards = player_op.hand.cards;
			if (counter) counter.innerText = cards.length;

			if (!this._showAIHand) {
				container.innerHTML = `<div style="color:#6b6357; text-align:center; padding:10px;">Mão oculta (${cards.length} cartas). Clique em "Revelar Mão".</div>`;
				return;
			}

			if (cards.length === 0) {
				container.innerHTML = `<div style="color:#8c8273; text-align:center; padding:10px;">A IA não tem cartas na mão.</div>`;
				return;
			}

			container.innerHTML = cards.map(c => {
				const isHero = c.hero ? "hero" : "";
				const ability = c.abilities && c.abilities.length ? `[${c.abilities.join(", ")}]` : "";
				const power = c.power !== undefined ? c.power : (c.basePower || 0);
				return `
					<div class="gc-dbg-ai-card-item ${isHero}">
						<div>
							<strong>${c.name}</strong> <span style="color:#8c8273; font-size:10px;">${c.row || ""} ${ability}</span>
						</div>
						<div class="gc-dbg-ai-card-power">${power}</div>
					</div>
				`;
			}).join("");
		},

		populateCardSelect(query = "") {
			const select = document.getElementById("gc-dbg-card-select");
			if (!select || typeof card_dict === "undefined") return;

			const q = (query || "").trim().toLowerCase();
			select.innerHTML = "";

			const cardsArray = Array.isArray(card_dict) ? card_dict : Object.values(card_dict);
			const seen = new Set();
			const list = [];

			cardsArray.forEach((c, idx) => {
				if (!c || !c.name || seen.has(c.name)) return;
				seen.add(c.name);

				const str = `${c.name} ${c.deck || ""} ${c.ability || ""}`.toLowerCase();
				if (q && !str.includes(q)) return;

				list.push({ idx, data: c });
			});

			list.sort((a, b) => a.data.name.localeCompare(b.data.name));

			list.forEach(item => {
				const opt = document.createElement("option");
				opt.value = item.idx;
				const abilityStr = item.data.ability ? ` (${item.data.ability})` : "";
				const strengthStr = item.data.strength ? ` [${item.data.strength}]` : "";
				opt.innerText = `${item.data.name}${strengthStr}${abilityStr} — ${item.data.deck || ""}`;
				select.appendChild(opt);
			});

			if (select.options.length > 0) {
				select.selectedIndex = 0;
			}
		},

		renderLogs() {
			const container = document.getElementById("gc-dbg-console-output");
			if (!container) return;

			let filtered = this.logs;
			if (this.filterLevel !== "all") {
				filtered = filtered.filter(l => l.level === this.filterLevel);
			}
			if (this.filterSearch) {
				filtered = filtered.filter(l => l.message.toLowerCase().includes(this.filterSearch));
			}

			if (filtered.length === 0) {
				container.innerHTML = `<div style="color:#6b6357; text-align:center; padding:20px;">Nenhum registro encontrado.</div>`;
				return;
			}

			container.innerHTML = filtered.map(l => {
				const cleanMsg = l.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
				return `<div class="gc-dbg-log-entry ${l.level}"><span class="time">[${l.time}]</span><span>${cleanMsg}</span></div>`;
			}).join("");

			container.scrollTop = container.scrollHeight;
		},

		copyLogsToClipboard() {
			if (this.logs.length === 0) {
				this.showToast("Nenhum log para copiar.");
				return;
			}

			const text = this.logs.map(l => `[${l.time}] [${l.level.toUpperCase()}] ${l.message}`).join("\n");
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(text).then(() => {
					this.showToast("Logs copiados para a área de transferência!");
				}).catch(() => {
					this.fallbackCopy(text);
				});
			} else {
				this.fallbackCopy(text);
			}
		},

		fallbackCopy(text) {
			const ta = document.createElement("textarea");
			ta.value = text;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			try {
				document.execCommand("copy");
				this.showToast("Logs copiados!");
			} catch (e) {
				this.showToast("Não foi possível copiar os logs.");
			}
			document.body.removeChild(ta);
		},

		showToast(msg) {
			const existing = document.querySelector(".gc-dbg-toast");
			if (existing) existing.remove();

			const toast = document.createElement("div");
			toast.className = "gc-dbg-toast";
			toast.innerText = msg;
			document.body.appendChild(toast);

			setTimeout(() => {
				toast.style.opacity = "0";
				toast.style.transition = "opacity 0.3s";
				setTimeout(() => toast.remove(), 300);
			}, 2200);
		},

		// Ações de Depuração
		actionDrawCard(playerIndex) {
			const p = (playerIndex === 0) ? player_me : player_op;
			if (!p || !p.deck) {
				this.showToast("Partida não está ativa.");
				return;
			}
			if (p.deck.cards && p.deck.cards.length > 0) {
				const card = p.deck.drawCard();
				if (card) {
					p.hand.addCard(card);
					this.showToast(`Carta sacada: ${card.name} para ${(playerIndex === 0 ? "Jogador" : "IA")}`);
					this.updateMatchInspector();
				}
			} else {
				this.showToast("Baralho está vazio!");
			}
		},

		actionForceAIPass() {
			if (typeof player_op === "undefined" || !player_op) {
				this.showToast("IA não está ativa.");
				return;
			}
			try {
				player_op.passRound();
				this.showToast("IA forçada a passar a rodada!");
				this.updateMatchInspector();
			} catch (e) {
				console.error("[Debugger] Erro ao forçar passe da IA:", e);
			}
		},

		actionClearWeather() {
			if (typeof weather !== "undefined" && weather && typeof weather.clearWeather === "function") {
				weather.clearWeather();
				this.showToast("Todo o clima foi limpo do tabuleiro.");
				this.updateMatchInspector();
			} else {
				this.showToast("Gerenciador de clima não encontrado.");
			}
		},

		actionRecalculateBoard() {
			if (typeof board !== "undefined" && board && typeof board.calculate === "function") {
				board.calculate();
				this.showToast("Pontuação do tabuleiro recalculada.");
				this.updateMatchInspector();
			}
		},

		actionForceWinRound() {
			if (typeof game === "undefined" || !game || typeof player_me === "undefined") {
				this.showToast("Partida não iniciada.");
				return;
			}
			try {
				if (typeof player_op !== "undefined" && !player_op.passed) {
					player_op.passRound();
				}
				if (!player_me.passed) {
					player_me.passRound();
				}
				this.showToast("Ambos os jogadores passaram. Desfecho da rodada em andamento.");
				this.updateMatchInspector();
			} catch (e) {
				console.error("[Debugger] Erro ao forçar vitória:", e);
			}
		},

		actionSpawnCard(playerIndex) {
			const select = document.getElementById("gc-dbg-card-select");
			if (!select || select.selectedIndex < 0) {
				this.showToast("Selecione uma carta na lista.");
				return;
			}

			const p = (playerIndex === 0) ? player_me : player_op;
			if (!p || !p.hand) {
				this.showToast("Partida não iniciada ou jogador inválido.");
				return;
			}

			const cardIdx = Number(select.value);
			const cardData = card_dict[cardIdx];
			if (!cardData) {
				this.showToast("Dados da carta não encontrados.");
				return;
			}

			try {
				const newCard = new Card(cardData, p);
				p.hand.addCard(newCard);
				this.showToast(`🃏 [${newCard.name}] adicionada à mão de ${(playerIndex === 0 ? "Jogador" : "IA")}!`);
				this.updateMatchInspector();
			} catch (e) {
				console.error("[Debugger] Erro ao instanciar carta:", e);
				this.showToast("Erro ao invocar carta: " + e.message);
			}
		}
	};

	window.GwentDebugger = GwentDebugger;
	GwentDebugger.init();
})();

