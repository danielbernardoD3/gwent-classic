/**
 * GWENT CLASSIC — IN-GAME DEBUGGER, GRANULAR LOG MANAGER & DIAGNOSTIC SUITE
 * Sistema avançado de rastreamento de ações em tempo real, seleção/cópia individual de logs,
 * inspetor completo de duelo, Modo Exploração, Versus P2P e terminal REPL JS.
 */

(function () {
	"use strict";

	let _uidCounter = 1;
	function nextUid(prefix = "id") {
		return `${prefix}_${Date.now()}_${_uidCounter++}`;
	}

	function safeStringify(val, pretty = false) {
		if (val === undefined) return "";
		if (val === null) return "null";
		if (val instanceof Error) {
			return `${val.name || "Error"}: ${val.message || ""}${val.stack ? "\n" + val.stack : ""}`;
		}
		if (typeof val === "object") {
			const seen = new WeakSet();
			try {
				return JSON.stringify(val, function (k, v) {
					if (typeof v === "object" && v !== null) {
						if (v instanceof HTMLElement) return `[HTMLElement ${v.tagName}#${v.id || ""}]`;
						if (seen.has(v)) return "[Circular]";
						seen.add(v);
					}
					return v;
				}, pretty ? 2 : 0);
			} catch (e) {
				return String(val);
			}
		}
		return String(val);
	}

	function escapeHtml(str) {
		return String(str || "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	// ===========================================================================
	// 1. RASTREADOR DE AÇÕES E COMBATE (MATCH TRACKER)
	// ===========================================================================
	const MatchTracker = {
		events: [],
		maxEvents: 800,
		unreadAnomalies: 0,
		filterType: "all",
		filterActor: "all",
		filterSearch: "",
		selectedIds: new Set(),
		expandedIds: new Set(),
		lastClickedId: null,
		autoScroll: true,

		log(type, icon, actor, title, details = "", isAnomaly = false, payload = null) {
			const now = new Date();
			const time = now.toLocaleTimeString();
			const ms = String(now.getMilliseconds()).padStart(3, "0");
			const safeActor = actor || "Sistema";
			const safeIcon = icon || (isAnomaly ? "⚠️" : "ℹ️");
			const safeTitle = title || type || "Ação";

			let payloadText = "";
			if (payload !== null && payload !== undefined) {
				payloadText = safeStringify(payload, true);
			}

			const entry = {
				id: nextUid("act"),
				time: `${time}.${ms}`,
				shortTime: time,
				type: type || "system", // "match" | "round" | "play" | "ability" | "pass" | "anomaly" | "system"
				icon: safeIcon,
				actor: safeActor,       // "Jogador" | "IA" | "Oponente" | "Sistema" | "Debug"
				title: safeTitle,
				details: details || "",
				isAnomaly: !!isAnomaly,
				payload,
				payloadText
			};

			this.events.push(entry);
			if (this.events.length > this.maxEvents) {
				const removed = this.events.shift();
				if (removed) {
					this.selectedIds.delete(removed.id);
					this.expandedIds.delete(removed.id);
				}
			}

			if (isAnomaly) {
				this.unreadAnomalies++;
				console.warn(`[GWENT ANOMALIA] ${safeTitle} — ${details}`, payload || "");
				if (window.GwentDebugger) {
					GwentDebugger.showErrorBanner(`⚠️ [ANOMALIA] ${safeTitle}: ${details}`, entry);
					GwentDebugger.updateBadges();
				}
			} else {
				console.log(`%c[GWENT ${String(type || "LOG").toUpperCase()}] %c${safeIcon} [${safeActor}] ${safeTitle} ${details ? "— " + details : ""}`, "color:#d4a34b; font-weight:bold;", "color:#f5eedf;");
			}

			if (window.GwentDebugger) {
				GwentDebugger.updateBadges();
				if (GwentDebugger.isOpen && GwentDebugger.activeTab === "feed") {
					GwentDebugger.renderFeed();
				}
			}
			return entry;
		},

		formatEntryText(e, includePayload = true) {
			if (!e) return "";
			const anom = e.isAnomaly ? " [⚠️ ANOMALIA]" : "";
			const actor = e.actor || "Sistema";
			const icon = e.icon || (e.isAnomaly ? "⚠️" : "ℹ️");
			const title = e.title || e.type || "Ação";
			let line = `[${e.time || e.shortTime}] [${actor}] ${icon} ${title}${anom}${e.details ? " — " + e.details : ""}`;
			if (includePayload && e.payloadText) {
				line += `\n    Payload/Stack: ${e.payloadText.replace(/\n/g, "\n    ")}`;
			}
			return line;
		},

		// Eventos Específicos do Duelo
		onGameStart(playerMe, playerOp, firstPlayer) {
			const rules = (typeof GameRules !== "undefined") ? GameRules.getActiveRulesList().map(r => r.name).join(", ") : "Padrão";
			const meDeckCount = (playerMe && playerMe.deck && playerMe.deck.cards) ? playerMe.deck.cards.length : "?";
			const opDeckCount = (playerOp && playerOp.deck && playerOp.deck.cards) ? playerOp.deck.cards.length : "?";
			const firstStr = (firstPlayer === playerMe) ? "Jogador começa jogando!" : "Oponente (IA) começa jogando!";

			this.log("match", "⚔️", "Sistema", "Partida Iniciada!",
				`Facções: [${playerMe?.name || "Jogador"}: ${(typeof factions !== "undefined" && factions[playerMe?.deck_data?.faction]?.name) || "N/A"}] vs [${playerOp?.name || "IA"}: ${(typeof factions !== "undefined" && factions[playerOp?.deck_data?.faction]?.name) || "N/A"}]. Baralhos: ${meDeckCount} vs ${opDeckCount} cartas. ${firstStr} Regras: ${rules || "Padrão"}`
			);

			if (playerMe && playerMe.deck && playerMe.deck.cards && playerMe.deck.cards.length < 22) {
				this.log("anomaly", "⚠️", "Sistema", "Baralho do Jogador com menos de 22 unidades", `Total de cartas: ${playerMe.deck.cards.length}`, true);
			}
		},

		onRedraw(player, oldCard, newCard) {
			const actor = (typeof player_me !== "undefined" && player === player_me) ? "Jogador" : "IA";
			const oldName = oldCard ? oldCard.name : "Desconhecida";
			const newName = newCard ? newCard.name : "Desconhecida";
			this.log("round", "🔄", actor, "Troca de Carta (Mulligan)", `Devolveu [${oldName}] ao baralho e puxou [${newName}].`);
		},

		onRoundStart(roundNum, startingPlayer) {
			const actor = (typeof player_me !== "undefined" && startingPlayer === player_me) ? "Jogador" : "IA";
			const meHp = (typeof player_me !== "undefined") ? player_me.health : 2;
			const opHp = (typeof player_op !== "undefined") ? player_op.health : 2;
			this.log("round", "▶️", "Sistema", `Início da Rodada ${roundNum}`, `Vez inicial: ${actor}. Vidas atuais: Jogador ❤️ ${meHp} | IA ❤️ ${opHp}`);
		},

		onCardPlayed(player, card, targetRow) {
			const actor = (typeof player_me !== "undefined" && player === player_me) ? "Jogador" : "IA";
			if (!card) {
				this.log("anomaly", "⚠️", actor, "Tentativa de jogar carta NULA ou indefinida", "Objeto de carta inexistente", true);
				return;
			}
			const heroStr = card.hero ? " [HERÓI DOURADO]" : "";
			const abilityStr = (card.abilities && card.abilities.length) ? ` | Habilidade: ${card.abilities.join(", ")}` : "";
			const rowStr = targetRow || card.row || "Especial";
			const pwrStr = (card.power !== undefined) ? `Poder: ${card.power}` : (card.basePower !== undefined ? `Poder: ${card.basePower}` : "");

			this.log("play", "🎴", actor, `Jogou [${card.name}]${heroStr}`, `${pwrStr} ➔ Fileira: ${rowStr}${abilityStr}`);

			if (typeof GameRules !== "undefined" && GameRules.isCardProhibited(card)) {
				this.log("anomaly", "🚫", actor, `Carta Proibida Jogada: [${card.name}]`, "Esta carta foi banida pelas regras customizadas ativas!", true);
			}
			if (isNaN(card.power) || isNaN(card.basePower)) {
				this.log("anomaly", "⚠️", actor, `Poder Inválido na Carta [${card.name}]`, `card.power: ${card.power}, card.basePower: ${card.basePower}`, true);
			}
		},

		onCardPlaced(player, card, row) {
			const actor = (typeof player_me !== "undefined" && player === player_me) ? "Jogador" : "IA";
			const rowName = (row && row.type) ? row.type : (typeof row === "string" ? row : "campo");
			this.log("play", "📍", actor, `Carta [${card?.name || "Carta"}] assentada no campo`, `Posicionada em: ${rowName}.`);
		},

		onAbility(abilityName, card, details = {}) {
			const actor = (card && typeof player_me !== "undefined" && card.holder === player_me) ? "Jogador" : "IA";
			const cardName = card ? card.name : "Efeito";
			let desc = "";

			switch (abilityName) {
				case "spy":
					desc = `Carta [${cardName}] colocada no campo adversário. Comprou ${details.drawCount || 2} carta(s) do baralho.`;
					this.log("ability", "🕵️‍♂️", actor, "Habilidade Espião Ativada", desc, false, details);
					break;
				case "muster":
					desc = `[${cardName}] chamou reforços! Invocou ${details.count || 0} tropa(s) adicional(is) para o campo: ${(details.summoned || []).join(", ") || "Nenhuma restante no baralho/mão"}.`;
					this.log("ability", "🛡️", actor, "Habilidade de Tropa (Reunir)", desc, false, details);
					break;
				case "scorch":
				case "scorch_c":
				case "scorch_r":
				case "scorch_s":
					desc = `Queimar disparado por [${cardName}]. Destruiu ${details.count || 0} carta(s): ${(details.killed || []).join(", ") || "Nenhum alvo elegível"}.`;
					this.log("ability", "🔥", actor, "Habilidade Queimar (Scorch)", desc, false, details);
					break;
				case "medic":
					desc = `[${cardName}] ressuscitou [${details.revived || "Nenhuma"}] do cemitério direto para o campo!`;
					this.log("ability", "💉", actor, "Habilidade de Médico (Ressuscitar)", desc, false, details);
					break;
				case "decoy":
					desc = `Isca substituiu [${details.swapped || "Tropa"}] no campo, recolhendo-a de volta para a mão.`;
					this.log("ability", "🎭", actor, "Habilidade Isca (Decoy)", desc, false, details);
					break;
				case "horn":
					desc = `Corneta de [${cardName}] dobrou a pontuação de todas as unidades comuns da fileira!`;
					this.log("ability", "📯", actor, "Corneta do Comandante", desc, false, details);
					break;
				case "weather":
					desc = `Clima alterado por [${cardName}]. Efeito aplicado ao tabuleiro.`;
					this.log("ability", "❄️", actor, "Clima no Tabuleiro", desc, false, details);
					break;
				case "leader":
					desc = `Habilidade de Líder executada: ${details.desc || cardName}.`;
					this.log("ability", "👑", actor, "Líder Ativado", desc, false, details);
					break;
				default:
					this.log("ability", "⚡", actor, `Habilidade [${abilityName}] ativada por [${cardName}]`, details.desc || "", false, details);
			}
		},

		onWeather(card) {
			const actor = (card && typeof player_me !== "undefined" && card.holder === player_me) ? "Jogador" : "IA";
			const weatherName = card ? card.name : "Clima";
			this.log("ability", "🌫️", actor, `Carta de Clima: [${weatherName}]`, "Efeito climático aplicado nas fileiras.");
		},

		onPlayerPass(player) {
			const actor = (typeof player_me !== "undefined" && player === player_me) ? "Jogador" : "IA";
			const pScore = player.total || 0;
			const oppScore = player.opponent ? (player.opponent().total || 0) : 0;
			const dif = pScore - oppScore;
			const difStr = dif > 0 ? `Liderando por +${dif}` : (dif < 0 ? `Atrás por ${dif}` : `Empatado em ${pScore}`);
			this.log("pass", "🛑", actor, "Passou a Vez na Rodada!", `Não jogará mais cartas nesta rodada. Placar no momento: ${pScore} vs ${oppScore} (${difStr}).`);
		},

		onRoundEnd(roundNum, winner, scoreMe, scoreOp, dif) {
			const winnerStr = (typeof player_me !== "undefined" && winner === player_me) ? "🏆 Vitória do Jogador" : ((typeof player_op !== "undefined" && winner === player_op) ? "💀 Vitória da IA" : "🤝 Empate na Rodada");
			const meHp = (typeof player_me !== "undefined") ? player_me.health : 0;
			const opHp = (typeof player_op !== "undefined") ? player_op.health : 0;

			this.log("round", "🏁", "Sistema", `Fim da Rodada ${roundNum}: ${winnerStr}`,
				`Placar Final da Rodada: Jogador ${scoreMe} x ${scoreOp} IA (Diferença: ${dif}). Gemas restantes: Jogador ❤️ ${meHp} | IA ❤️ ${opHp}`
			);

			if (isNaN(scoreMe) || isNaN(scoreOp) || scoreMe < 0 || scoreOp < 0) {
				this.log("anomaly", "⚠️", "Sistema", `Placar Anômalo na Rodada ${roundNum}`, `scoreMe: ${scoreMe}, scoreOp: ${scoreOp}`, true);
			}
		},

		onGameEnd(playerMe, playerOp, roundHistory) {
			let outcome = "Vitória do Jogador!";
			let icon = "🎉";
			if (playerMe.health === 0 && playerOp.health > 0) {
				outcome = "Derrota do Jogador!";
				icon = "💀";
			} else if (playerMe.health === 0 && playerOp.health === 0) {
				outcome = "Empate Total da Partida!";
				icon = "🤝";
			}

			const roundsSummary = (roundHistory || []).map((r, i) => `R${i + 1}: ${r.score_me}x${r.score_op}`).join(" | ");
			this.log("match", icon, "Sistema", `Partida Encerrada: ${outcome}`, `Placar de Rodadas: ${roundsSummary}. Vidas finais: Jogador ❤️ ${playerMe.health} | IA ❤️ ${playerOp.health}`);
		},

		onAnomaly(title, desc, rawData = null) {
			this.log("anomaly", "🚨", "Sistema", title, desc, true, rawData);
		}
	};

	window.MatchTracker = MatchTracker;

	// ===========================================================================
	// 2. PAINEL DE DEPURAÇÃO VISUAL & GERENCIADOR DE LOGS (GWENT DEBUGGER)
	// ===========================================================================
	const GwentDebugger = {
		isEnabled: (function () {
			try {
				return localStorage.getItem("gc_debug_mode_enabled") === "true";
			} catch (e) {
				return false;
			}
		})(),
		isOpen: false,
		isMaximized: false,
		activeTab: "match",
		logs: [],
		maxLogs: 800,
		unreadErrors: 0,
		filterLogLevel: "all",
		filterLogSource: "all",
		filterLogSearch: "",
		selectedLogIds: new Set(),
		expandedLogIds: new Set(),
		lastClickedLogId: null,
		logAutoScroll: true,
		autoRefreshInterval: null,
		lastBannerErrorText: "",
		inspectorContainerTarget: "op_hand",
		_fpsFrames: 0,
		_fpsLastTime: performance.now(),
		currentFps: 60,

		detectLogSource(message) {
			const m = String(message || "").toLowerCase();
			if (m.includes("versus") || m.includes("peer") || m.includes("p2p") || m.includes("lobby_sync") || m.includes("match_start")) return "versus";
			if (m.includes("story") || m.includes("explora") || m.includes("campanha") || m.includes("save")) return "story";
			if (m.includes("anomalia") || m.includes("erro global") || m.includes("promise rejection") || m.includes("exception")) return "anomaly";
			if (m.includes("[gwent ") || m.includes("round") || m.includes("card") || m.includes("mulligan") || m.includes("scorch")) return "gwent";
			return "system";
		},

		initLogging() {
			const self = this;
			const originalLog = console.log;
			const originalInfo = console.info;
			const originalWarn = console.warn;
			const originalError = console.error;

			function addEntry(level, args, explicitStack = "") {
				try {
					const now = new Date();
					const time = now.toLocaleTimeString();
					const ms = String(now.getMilliseconds()).padStart(3, "0");
					let stackDetail = explicitStack || "";

					const parts = [];
					Array.from(args).forEach((a, idx) => {
						if (typeof a === "string" && (a.startsWith("color:") || a.startsWith("font-weight:")) && parts.length > 0 && parts[0].includes("%c")) {
							return;
						}
						if (a instanceof Error) {
							parts.push(`${a.name}: ${a.message}`);
							if (a.stack && !stackDetail) stackDetail = a.stack;
							return;
						}
						if (typeof a === "object" && a !== null) {
							const str = safeStringify(a, true);
							if (str.length > 140) {
								parts.push(safeStringify(a, false).slice(0, 140) + "...");
								stackDetail += (stackDetail ? "\n" : "") + str;
							} else {
								parts.push(safeStringify(a, false));
							}
							return;
						}
						parts.push(String(a).replace(/%c/g, ""));
					});

					const message = parts.join(" ").trim();
					if (!message && !stackDetail) return;

					// Se a mensagem contém múltiplas linhas de stack trace embutidas, separa a 1ª linha do stack
					let mainMsg = message;
					if (message.includes("\n")) {
						const lines = message.split("\n");
						mainMsg = lines[0];
						const rest = lines.slice(1).join("\n").trim();
						if (rest && !stackDetail.includes(rest)) {
							stackDetail = stackDetail ? (rest + "\n" + stackDetail) : rest;
						}
					}

					const source = self.detectLogSource(mainMsg + " " + stackDetail);
					const entry = {
						id: nextUid("log"),
						time: `${time}.${ms}`,
						shortTime: time,
						level,
						source,
						message: mainMsg,
						stack: stackDetail
					};

					self.logs.push(entry);
					if (self.logs.length > self.maxLogs) {
						const removed = self.logs.shift();
						if (removed) {
							self.selectedLogIds.delete(removed.id);
							self.expandedLogIds.delete(removed.id);
						}
					}

					if (level === "error") {
						self.unreadErrors++;
						self.updateBadges();
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
				const source = e.filename ? `${e.filename.split("/").pop()}:${e.lineno}:${e.colno || 0}` : "script";
				const stack = (e.error && e.error.stack) ? e.error.stack : `${errMsg} at ${source}`;
				addEntry("error", [`[Erro Global em ${source}] ${errMsg}`], stack);
				const anomEntry = MatchTracker.log("anomaly", "🚨", "Sistema", `Erro Global de Script em ${source}`, errMsg, true, stack);
				self.showErrorBanner(`[${source}] ${errMsg}`, anomEntry);
			});

			window.addEventListener("unhandledrejection", function (e) {
				const reason = e.reason ? (e.reason.message || String(e.reason)) : "Rejeição não tratada";
				const stack = (e.reason && e.reason.stack) ? e.reason.stack : safeStringify(e.reason, true);
				addEntry("error", [`[Promise Rejection] ${reason}`], stack);
				const anomEntry = MatchTracker.log("anomaly", "🚨", "Sistema", "Promise Rejeitada", reason, true, stack);
				self.showErrorBanner(`[Promise Rejeitada] ${reason}`, anomEntry);
			});
		},

		startFpsMonitor() {
			const self = this;
			function tick(now) {
				self._fpsFrames++;
				if (now - self._fpsLastTime >= 1000) {
					self.currentFps = Math.round((self._fpsFrames * 1000) / (now - self._fpsLastTime));
					self._fpsFrames = 0;
					self._fpsLastTime = now;
					const pill = document.getElementById("gc-dbg-fps-pill");
					if (pill && self.isOpen) {
						pill.textContent = `${self.currentFps} FPS`;
						pill.style.color = self.currentFps >= 50 ? "#8ce99a" : (self.currentFps >= 30 ? "#ffd43b" : "#ff8787");
					}
				}
				requestAnimationFrame(tick);
			}
			requestAnimationFrame(tick);
		},

		init() {
			this.initLogging();
			this.startFpsMonitor();
			const self = this;

			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", () => self.setupUI());
			} else {
				self.setupUI();
			}
		},

		setupUI() {
			if (document.getElementById("gc-debugger-modal")) return;

			// Botão Flutuante de Abertura
			const toggleBtn = document.createElement("button");
			toggleBtn.id = "gc-debug-toggle-btn";
			toggleBtn.innerHTML = `<span>🐞</span> <span>Debug</span> <span class="tab-badge" id="gc-debug-badge">0</span>`;
			toggleBtn.title = "Abrir Painel de Debug (Atalho: F2 ou ~ ou Ctrl+Shift+D)";
			toggleBtn.onclick = () => this.toggle();
			if (!this.isEnabled) {
				toggleBtn.style.display = "none";
			}
			document.body.appendChild(toggleBtn);

			// Banner Notificador de Erros Globais (com botão direto de Copiar Erro!)
			const banner = document.createElement("div");
			banner.id = "gc-debug-error-banner";
			banner.innerHTML = `
				<span>⚠️</span>
				<div class="banner-msg" id="gc-debug-banner-msg">Erro detectado no script</div>
				<button class="banner-btn" id="gc-debug-banner-copy-btn" title="Copiar este erro e stack trace">📋 Copiar Erro</button>
				<button class="banner-btn" id="gc-debug-banner-inspect-btn">🔍 Inspecionar</button>
				<button class="banner-btn" style="background:#4a1515;" id="gc-debug-banner-close-btn">✕</button>
			`;
			document.body.appendChild(banner);

			document.getElementById("gc-debug-banner-copy-btn").onclick = () => {
				if (this.lastBannerErrorText) {
					this.copyText(this.lastBannerErrorText, "Erro e stack trace copiados para a área de transferência!");
				}
			};
			document.getElementById("gc-debug-banner-inspect-btn").onclick = () => {
				this.hideErrorBanner();
				this.open();
				this.switchTab("logs");
			};
			document.getElementById("gc-debug-banner-close-btn").onclick = () => this.hideErrorBanner();

			// Modal Principal do Debugger
			const modal = document.createElement("div");
			modal.id = "gc-debugger-modal";
			modal.innerHTML = `
				<div class="gc-dbg-header" id="gc-dbg-drag-handle">
					<div class="gc-dbg-title">
						<span>⚔️</span>
						<span>GWENT CLASSIC — DEBUG & DIAGNOSTIC SUITE</span>
						<span class="gc-dbg-fps-pill" id="gc-dbg-fps-pill">60 FPS</span>
					</div>
					<div class="gc-dbg-actions">
						<button class="gc-dbg-btn-icon" id="gc-dbg-btn-snapshot" title="Copiar Relatório Completo de Diagnóstico">🩺 Dump</button>
						<button class="gc-dbg-btn-icon" id="gc-dbg-btn-refresh" title="Atualizar Dados">🔄</button>
						<button class="gc-dbg-btn-icon" id="gc-dbg-btn-maximize" title="Maximizar / Restaurar">⛶</button>
						<button class="gc-dbg-btn-icon" id="gc-dbg-btn-close" title="Fechar (F2)">✕</button>
					</div>
				</div>

				<div class="gc-dbg-tabs">
					<button class="gc-dbg-tab active" data-tab="match">⚔️ Duelo & Inspetor</button>
					<button class="gc-dbg-tab" data-tab="feed">
						📜 Ações do Duelo
						<span class="tab-badge" id="gc-dbg-feed-badge">0</span>
					</button>
					<button class="gc-dbg-tab" data-tab="logs">
						💻 Console & Logs
						<span class="tab-badge" id="gc-dbg-log-badge">0</span>
					</button>
					<button class="gc-dbg-tab" data-tab="actions">🃏 Comandos & Spawner</button>
					<button class="gc-dbg-tab" data-tab="story">🗺️ Exploração & Save</button>
					<button class="gc-dbg-tab" data-tab="versus">🌐 Versus & Sistema</button>
				</div>

				<div class="gc-dbg-content">
					<!-- ABA 1: DUELO & INSPETOR -->
					<div class="gc-dbg-tab-panel active" id="gc-dbg-panel-match">
						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Estado da Partida & Travas (Locks)</span>
								<div style="display:flex; gap:6px; align-items:center;">
									<span id="gc-dbg-match-status-badge" style="color:#d1b16a; font-weight:normal;">Verificando...</span>
									<button class="gc-dbg-mini-btn" id="gc-dbg-btn-unlock-ui" title="Destrava turno, animações e popups presos">🔓 Destravar Turno/UI</button>
								</div>
							</div>
							<div class="gc-dbg-status-grid">
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Rodada / Estado</div>
									<div class="gc-dbg-stat-value highlight" id="gc-dbg-stat-round">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Vez de Jogar</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-stat-turn">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Jogador (Gemas / Mão / Deck / Cemitério)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-stat-me">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Oponente (Gemas / Mão / Deck / Cemitério)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-stat-op">-</div>
								</div>
							</div>
							<div class="gc-dbg-locks-bar" id="gc-dbg-locks-bar"></div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Placar & Efeitos por Fileira</span>
								<span id="gc-dbg-weather-status" style="color:#a8c0ff; font-size:10px; text-transform:none;">Céu Limpo</span>
							</div>
							<table class="gc-dbg-rows-table">
								<thead>
									<tr>
										<th>Lado</th>
										<th>Corpo a Corpo (Close)</th>
										<th>Longo Alcance (Ranged)</th>
										<th>Cerco (Siege)</th>
										<th>Total</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td><strong>Oponente</strong></td>
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
							<div style="font-size:10.5px; color:#b5a895;">
								<strong>Regras Ativas:</strong> <span id="gc-dbg-rules-status" style="color:#d1b16a;">Padrão</span>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Inspetor de Containers de Cartas (<span id="gc-dbg-ai-hand-count">0</span>)</span>
								<div style="display:flex; gap:5px; align-items:center;">
									<select class="gc-dbg-select" id="gc-dbg-container-select" style="padding:2px 6px; font-size:10px;">
										<option value="op_hand">🤖 Mão do Oponente / IA</option>
										<option value="me_hand">🛡️ Minha Mão</option>
										<option value="me_grave">⚰️ Meu Cemitério</option>
										<option value="op_grave">⚰️ Cemitério do Oponente</option>
										<option value="me_deck">📚 Meu Baralho (Topo➔Base)</option>
										<option value="op_deck">📚 Baralho do Oponente</option>
										<option value="board_all">⚔️ Todas as Cartas no Tabuleiro</option>
									</select>
									<button class="gc-dbg-mini-btn" id="gc-dbg-btn-copy-container" title="Copiar lista de cartas deste container">📋 Copiar Lista</button>
								</div>
							</div>
							<div class="gc-dbg-ai-hand-list" id="gc-dbg-ai-hand-list"></div>
						</div>
					</div>

					<!-- ABA 2: HISTÓRICO DE AÇÕES & COMBAT LOG (COM SELEÇÃO E CÓPIA GRANULAR) -->
					<div class="gc-dbg-tab-panel" id="gc-dbg-panel-feed">
						<div class="gc-dbg-log-toolbar">
							<div class="gc-dbg-log-filters" id="gc-dbg-feed-type-chips">
								<span class="gc-dbg-filter-chip active" data-feed-filter="all">Todas</span>
								<span class="gc-dbg-filter-chip" data-feed-filter="play">🎴 Jogadas</span>
								<span class="gc-dbg-filter-chip" data-feed-filter="ability">⚡ Habilidades</span>
								<span class="gc-dbg-filter-chip" data-feed-filter="round">🚩 Rodadas</span>
								<span class="gc-dbg-filter-chip" data-feed-filter="pass">🛑 Passes</span>
								<span class="gc-dbg-filter-chip" data-feed-filter="anomaly">⚠️ Anomalias</span>
							</div>
							<div class="gc-dbg-log-filters" id="gc-dbg-feed-actor-chips">
								<span class="gc-dbg-filter-chip active" data-feed-actor="all">Todos Atores</span>
								<span class="gc-dbg-filter-chip" data-feed-actor="Jogador">🛡️ Jogador</span>
								<span class="gc-dbg-filter-chip" data-feed-actor="IA">🤖 IA/Op</span>
								<span class="gc-dbg-filter-chip" data-feed-actor="Sistema">⚙️ Sistema</span>
							</div>
						</div>

						<div style="display:flex; gap:6px; align-items:center;">
							<input type="text" class="gc-dbg-input" id="gc-dbg-feed-search" placeholder="🔍 Filtrar ações por carta, habilidade, ator, horário ou anomalia..." style="flex:1;" />
							<button class="gc-dbg-mini-btn" id="gc-dbg-feed-autoscroll">📌 Auto-Scroll: ON</button>
						</div>

						<div class="gc-dbg-selection-bar">
							<div class="gc-dbg-selection-left">
								<button class="gc-dbg-mini-btn" id="gc-dbg-feed-sel-all" title="Selecionar todas as ações visíveis (Dica: use Shift+Clique para intervalo)">☑️ Marcar Visíveis</button>
								<button class="gc-dbg-mini-btn" id="gc-dbg-feed-sel-none" title="Desmarcar todas">⬜ Limpar Seleção</button>
								<span class="gc-dbg-sel-count" id="gc-dbg-feed-sel-count">0 selecionados</span>
							</div>
							<div class="gc-dbg-selection-right">
								<button class="gc-dbg-btn success" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-copy-feed-selected" title="Copia apenas as ações marcadas com checkbox">📋 Copiar Selecionados (0)</button>
								<button class="gc-dbg-btn primary" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-copy-feed-filtered" title="Copia apenas as ações visíveis no filtro atual">📋 Copiar Filtrados</button>
								<button class="gc-dbg-btn" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-copy-feed" title="Copia todo o histórico de combate">📋 Copiar Tudo</button>
								<button class="gc-dbg-btn danger" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-clear-feed" title="Apagar histórico de ações">🗑️</button>
							</div>
						</div>

						<div class="gc-dbg-feed-container" id="gc-dbg-feed-output"></div>
					</div>

					<!-- ABA 3: CONSOLE & LOGS (COM SELEÇÃO INDIVIDUAL, MÚLTIPLA, STACK E REPL) -->
					<div class="gc-dbg-tab-panel" id="gc-dbg-panel-logs">
						<div class="gc-dbg-log-toolbar">
							<div class="gc-dbg-log-filters" id="gc-dbg-log-lvl-chips">
								<span class="gc-dbg-filter-chip active" data-lvl="all">Todos</span>
								<span class="gc-dbg-filter-chip" data-lvl="info">ℹ️ Info</span>
								<span class="gc-dbg-filter-chip" data-lvl="warn">⚠️ Avisos</span>
								<span class="gc-dbg-filter-chip" data-lvl="error">🚨 Erros</span>
							</div>
							<div class="gc-dbg-log-filters" id="gc-dbg-log-src-chips">
								<span class="gc-dbg-filter-chip active" data-src="all">Todas Origens</span>
								<span class="gc-dbg-filter-chip" data-src="gwent">⚔️ Gwent</span>
								<span class="gc-dbg-filter-chip" data-src="versus">🌐 Versus</span>
								<span class="gc-dbg-filter-chip" data-src="story">🗺️ Exploração</span>
								<span class="gc-dbg-filter-chip" data-src="anomaly">🚨 Críticos</span>
							</div>
						</div>

						<div style="display:flex; gap:6px; align-items:center;">
							<input type="text" class="gc-dbg-input" id="gc-dbg-log-search" placeholder="🔍 Buscar texto específico no log (ex: removeChild, VersusMode, avatar, stack)..." style="flex:1;" />
							<button class="gc-dbg-mini-btn" id="gc-dbg-log-autoscroll">📌 Auto-Scroll: ON</button>
						</div>

						<div class="gc-dbg-selection-bar">
							<div class="gc-dbg-selection-left">
								<button class="gc-dbg-mini-btn" id="gc-dbg-log-sel-all" title="Selecionar todos os logs filtrados visíveis (Shift+Clique seleciona intervalo)">☑️ Marcar Visíveis</button>
								<button class="gc-dbg-mini-btn" id="gc-dbg-log-sel-none" title="Limpar seleção de logs">⬜ Limpar Seleção</button>
								<button class="gc-dbg-mini-btn" id="gc-dbg-log-sel-errors" title="Marcar automaticamente apenas os avisos e erros">🚨 Marcar Erros/Avisos</button>
								<span class="gc-dbg-sel-count" id="gc-dbg-log-sel-count">0 selecionados</span>
							</div>
							<div class="gc-dbg-selection-right">
								<button class="gc-dbg-btn success" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-copy-logs-selected" title="Copia apenas os logs marcados com checkbox">📋 Copiar Selecionados (0)</button>
								<button class="gc-dbg-btn primary" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-copy-logs-filtered" title="Copia apenas os logs visíveis no filtro atual">📋 Copiar Filtrados</button>
								<button class="gc-dbg-btn" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-copy-logs" title="Copia todos os logs">📋 Tudo</button>
								<button class="gc-dbg-btn" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-export-logs" title="Baixar arquivo .log com diagnóstico">💾 .LOG</button>
								<button class="gc-dbg-btn danger" style="padding:3px 8px; font-size:10px;" id="gc-dbg-btn-clear-logs" title="Limpar todos os logs">🗑️</button>
							</div>
						</div>

						<div class="gc-dbg-console-output" id="gc-dbg-console-output"></div>

						<div class="gc-dbg-repl-bar">
							<span class="gc-dbg-repl-prompt">&gt;</span>
							<input type="text" class="gc-dbg-repl-input" id="gc-dbg-repl-input" placeholder="Executar expressão JS ao vivo (ex: player_me.total, VersusMode.localAvatar, StoryMode.save.crowns) e Enter..." />
							<button class="gc-dbg-mini-btn" id="gc-dbg-repl-run">▶️ Executar</button>
						</div>
					</div>

					<!-- ABA 4: COMANDOS & SPAWNER -->
					<div class="gc-dbg-tab-panel" id="gc-dbg-panel-actions">
						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">Controle de Rodada, Partida & Turno</div>
							<div class="gc-dbg-actions-grid cols-3">
								<button class="gc-dbg-btn success" id="gc-dbg-act-win-round">🏆 Ganhar Rodada Atual</button>
								<button class="gc-dbg-btn danger" id="gc-dbg-act-lose-round">💀 Perder Rodada Atual</button>
								<button class="gc-dbg-btn primary" id="gc-dbg-act-win-match">🏅 Vencer Partida Já</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-force-pass-op">✋ Forçar IA a Passar</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-unpass-all">🔄 Cancelar Passes</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-recalc-board">🧮 Recalcular Tabuleiro</button>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">Cartas, Gemas, Líderes & Climas</div>
							<div class="gc-dbg-actions-grid cols-3">
								<button class="gc-dbg-btn" id="gc-dbg-act-draw-me">🎴 Comprar Carta (+1)</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-draw-op">🤖 IA Comprar (+1)</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-heal-gems">❤️ Restaurar 2 Gemas</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-dmg-op">💔 -1 Gema Oponente</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-reset-leader-me">👑 Reativar Meu Líder</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-reset-leader-op">👑 Reativar Líder IA</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-clear-weather">☀️ Limpar Todo Clima</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-weather-frost">❄️ Aplicar Geada</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-weather-fog">🌫️ Aplicar Névoa</button>
								<button class="gc-dbg-btn" id="gc-dbg-act-weather-rain">🌧️ Aplicar Chuva</button>
								<button class="gc-dbg-btn danger" id="gc-dbg-act-scorch-all">🔥 Queimar (Scorch)</button>
								<button class="gc-dbg-btn danger" id="gc-dbg-act-clear-board">🧹 Limpar Tabuleiro</button>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>🃏 Invocador de Cartas (Card Spawner)</span>
								<div style="display:flex; gap:6px; align-items:center;">
									<select class="gc-dbg-select" id="gc-dbg-spawner-faction" style="padding:2px 6px; font-size:10px;">
										<option value="all">Todas as Facções</option>
										<option value="realms">Reinos do Norte</option>
										<option value="nilfgaard">Nilfgaard</option>
										<option value="monsters">Monstros</option>
										<option value="scoiatael">Scoia'tael</option>
										<option value="skellige">Skellige</option>
										<option value="neutral">Neutras / Especiais</option>
									</select>
									<select class="gc-dbg-select" id="gc-dbg-spawner-qty" style="padding:2px 6px; font-size:10px;">
										<option value="1">Qtd: 1x</option>
										<option value="2">Qtd: 2x</option>
										<option value="3">Qtd: 3x</option>
									</select>
								</div>
							</div>
							<div class="gc-dbg-spawner-form">
								<input type="text" class="gc-dbg-input" id="gc-dbg-card-search" placeholder="🔍 Buscar carta por nome, ID ou habilidade (ex: Villentretenmerth, spy, medic, Geralt)..." />
								<select class="gc-dbg-select" id="gc-dbg-card-select" size="6" style="height:125px;"></select>
								<div class="gc-dbg-actions-grid cols-3">
									<button class="gc-dbg-btn success" id="gc-dbg-act-spawn-me">➕ Minha Mão</button>
									<button class="gc-dbg-btn" id="gc-dbg-act-spawn-op">➕ Mão da IA</button>
									<button class="gc-dbg-btn primary" id="gc-dbg-act-spawn-board-me">⚔️ Meu Campo</button>
									<button class="gc-dbg-btn" id="gc-dbg-act-spawn-board-op">⚔️ Campo da IA</button>
									<button class="gc-dbg-btn" id="gc-dbg-act-spawn-grave-me">⚰️ Meu Cemitério</button>
									<button class="gc-dbg-btn" id="gc-dbg-act-spawn-grave-op">⚰️ Cemitério IA</button>
								</div>
							</div>
						</div>
					</div>

					<!-- ABA 5: MODO EXPLORAÇÃO & SAVE -->
					<div class="gc-dbg-tab-panel" id="gc-dbg-panel-story">
						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Status da Campanha (Modo Exploração)</span>
								<button class="gc-dbg-mini-btn" id="gc-dbg-story-copy-save">📋 Copiar Save JSON</button>
							</div>
							<div class="gc-dbg-status-grid cols-3">
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Personagem / Slot</div>
									<div class="gc-dbg-stat-value highlight" id="gc-dbg-story-player">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Coroas (Ouro)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-story-crowns">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Progresso de Nós</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-story-nodes">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Cartas na Coleção</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-story-cards">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Troféus Conquistados</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-story-trophies">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Nó Atual</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-story-curr-node" style="font-size:11px;">-</div>
								</div>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">Cheats & Ferramentas do Modo Exploração</div>
							<div class="gc-dbg-actions-grid cols-3">
								<button class="gc-dbg-btn success" id="gc-dbg-story-add-1k">💰 +1.000 Coroas</button>
								<button class="gc-dbg-btn success" id="gc-dbg-story-add-10k">💰 +10.000 Coroas</button>
								<button class="gc-dbg-btn" id="gc-dbg-story-zero-crowns">🗑️ Zerar Coroas</button>
								<button class="gc-dbg-btn primary" id="gc-dbg-story-unlock-map">🗺️ Revelar Todos os Nós</button>
								<button class="gc-dbg-btn primary" id="gc-dbg-story-complete-map">✅ Completar Todos os Nós</button>
								<button class="gc-dbg-btn primary" id="gc-dbg-story-unlock-cards">🃏 Coleção 100% (Todas)</button>
								<button class="gc-dbg-btn" id="gc-dbg-story-unlock-trophies">🏆 Todos os Troféus</button>
								<button class="gc-dbg-btn" id="gc-dbg-story-save-now">💾 Forçar Salvamento</button>
								<button class="gc-dbg-btn" id="gc-dbg-story-refresh-map">🔄 Recarregar HUD/Mapa</button>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">📍 Teleporte & Inspeção de Nós do Continente</div>
							<div style="display:flex; gap:6px;">
								<select class="gc-dbg-select" id="gc-dbg-story-node-select" style="flex:1;"></select>
								<button class="gc-dbg-btn primary" id="gc-dbg-story-teleport">📍 Desbloquear & Ir</button>
								<button class="gc-dbg-btn" id="gc-dbg-story-start-duel">⚔️ Iniciar Duelo do Nó</button>
							</div>
						</div>
					</div>

					<!-- ABA 6: VERSUS P2P & SISTEMA -->
					<div class="gc-dbg-tab-panel" id="gc-dbg-panel-versus">
						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">
								<span>Diagnóstico P2P — Modo Versus</span>
								<button class="gc-dbg-mini-btn" id="gc-dbg-vs-copy-state">📋 Copiar Estado P2P</button>
							</div>
							<div class="gc-dbg-status-grid cols-3">
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Conexão / Sala</div>
									<div class="gc-dbg-stat-value highlight" id="gc-dbg-vs-room">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Papel / TurnSeq</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-vs-role">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Fila de Pacotes P2P</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-vs-queue">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Jogador Local (Avatar)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-vs-local" style="font-size:10.5px;">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Jogador Remoto (Avatar)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-vs-remote" style="font-size:10.5px;">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Mulligan (Local / Remoto)</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-vs-mulligan">-</div>
								</div>
							</div>
							<div class="gc-dbg-actions-grid cols-3">
								<button class="gc-dbg-btn" id="gc-dbg-vs-force-sync">🔄 Forçar Turn Sync</button>
								<button class="gc-dbg-btn" id="gc-dbg-vs-lobby-sync">📨 Enviar Lobby Sync</button>
								<button class="gc-dbg-btn danger" id="gc-dbg-vs-clear-queue">🧹 Destravar Fila P2P</button>
							</div>
						</div>

						<div class="gc-dbg-card">
							<div class="gc-dbg-card-title">Ambiente, Conquistas & Armazenamento</div>
							<div class="gc-dbg-status-grid cols-3">
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Tela Ativa</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-sys-screen">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Viewport / DPI</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-sys-viewport">-</div>
								</div>
								<div class="gc-dbg-stat-box">
									<div class="gc-dbg-stat-label">Uso LocalStorage</div>
									<div class="gc-dbg-stat-value" id="gc-dbg-sys-storage">-</div>
								</div>
							</div>
							<div class="gc-dbg-actions-grid cols-3">
								<button class="gc-dbg-btn primary" id="gc-dbg-sys-unlock-ach">🏆 Liberar Conquistas</button>
								<button class="gc-dbg-btn" id="gc-dbg-sys-reset-ach">🔄 Resetar Conquistas</button>
								<button class="gc-dbg-btn success" id="gc-dbg-sys-full-report">🩺 Copiar Diagnóstico Completo</button>
							</div>
						</div>
					</div>
				</div>
			`;
			document.body.appendChild(modal);

			this.bindEvents();
			this.populateCardSelect();
			this.populateStoryNodesSelect();

			const params = new URLSearchParams(window.location.search);
			if (params.get("dev") === "1" || params.get("debug") === "1" || localStorage.getItem("gc_auto_debug") === "true") {
				this.enableDebugMode(true);
				this.open();
			}
		},

		bindEvents() {
			const self = this;

			// Teclas de Atalho: F2 ou ~ ou Ctrl+Shift+D
			window.addEventListener("keydown", function (e) {
				if (e.ctrlKey && e.shiftKey && e.code === "KeyD") {
					e.preventDefault();
					if (!self.isEnabled) self.enableDebugMode();
					self.toggle();
					return;
				}
				if (e.key === "F2" || e.key === "~" || e.key === "`") {
					const activeTag = document.activeElement ? document.activeElement.tagName : "";
					if ((e.key === "~" || e.key === "`") && (activeTag === "INPUT" || activeTag === "TEXTAREA")) return;
					if (!self.isEnabled) return;
					e.preventDefault();
					self.toggle();
				}
			});

			// Header buttons
			document.getElementById("gc-dbg-btn-close").onclick = () => self.close();
			document.getElementById("gc-dbg-btn-maximize").onclick = () => self.toggleMaximize();
			document.getElementById("gc-dbg-btn-snapshot").onclick = () => self.copyFullDiagnosticReport();
			document.getElementById("gc-dbg-btn-refresh").onclick = () => {
				self.refreshActiveTab();
				self.showToast("Dados atualizados.");
			};

			// Tabs
			document.querySelectorAll(".gc-dbg-tab").forEach(tab => {
				tab.onclick = () => self.switchTab(tab.getAttribute("data-tab"));
			});

			// Aba 1: Inspetor
			document.getElementById("gc-dbg-btn-unlock-ui").onclick = () => self.actionUnlockUI();
			document.getElementById("gc-dbg-container-select").onchange = (e) => {
				self.inspectorContainerTarget = e.target.value;
				self.renderCardContainerList();
			};
			document.getElementById("gc-dbg-btn-copy-container").onclick = () => self.copyContainerCardsList();

			// Aba 2: Feed filters & selection
			document.querySelectorAll("[data-feed-filter]").forEach(chip => {
				chip.onclick = () => {
					document.querySelectorAll("[data-feed-filter]").forEach(c => c.classList.remove("active"));
					chip.classList.add("active");
					MatchTracker.filterType = chip.getAttribute("data-feed-filter");
					self.renderFeed();
				};
			});

			document.querySelectorAll("[data-feed-actor]").forEach(chip => {
				chip.onclick = () => {
					document.querySelectorAll("[data-feed-actor]").forEach(c => c.classList.remove("active"));
					chip.classList.add("active");
					MatchTracker.filterActor = chip.getAttribute("data-feed-actor");
					self.renderFeed();
				};
			});

			document.getElementById("gc-dbg-feed-search").oninput = (e) => {
				MatchTracker.filterSearch = e.target.value.toLowerCase();
				self.renderFeed();
			};

			document.getElementById("gc-dbg-feed-autoscroll").onclick = (e) => {
				MatchTracker.autoScroll = !MatchTracker.autoScroll;
				e.currentTarget.textContent = `📌 Auto-Scroll: ${MatchTracker.autoScroll ? "ON" : "OFF"}`;
			};

			document.getElementById("gc-dbg-feed-sel-all").onclick = () => {
				self.getFilteredFeedEvents().forEach(ev => MatchTracker.selectedIds.add(ev.id));
				self.renderFeed();
			};
			document.getElementById("gc-dbg-feed-sel-none").onclick = () => {
				MatchTracker.selectedIds.clear();
				self.renderFeed();
			};

			document.getElementById("gc-dbg-btn-copy-feed-selected").onclick = () => self.copyFeedToClipboard("selected");
			document.getElementById("gc-dbg-btn-copy-feed-filtered").onclick = () => self.copyFeedToClipboard("filtered");
			document.getElementById("gc-dbg-btn-copy-feed").onclick = () => self.copyFeedToClipboard("all");
			document.getElementById("gc-dbg-btn-clear-feed").onclick = () => {
				MatchTracker.events = [];
				MatchTracker.selectedIds.clear();
				MatchTracker.expandedIds.clear();
				MatchTracker.unreadAnomalies = 0;
				self.updateBadges();
				self.renderFeed();
				self.showToast("Histórico de ações limpo.");
			};

			// Delegação de cliques no Feed de Ações (Checkbox, Shift+Clique, Copiar Individual, Expandir Payload)
			document.getElementById("gc-dbg-feed-output").addEventListener("click", (e) => {
				const copyBtn = e.target.closest("[data-copy-feed-id]");
				if (copyBtn) {
					const id = copyBtn.getAttribute("data-copy-feed-id");
					const ev = MatchTracker.events.find(x => x.id === id);
					if (ev) {
						self.copyText(MatchTracker.formatEntryText(ev, true), "Ação específica copiada!");
						self.flashCopiedButton(copyBtn);
					}
					return;
				}

				const toggleDetailBtn = e.target.closest("[data-toggle-feed-detail]");
				if (toggleDetailBtn) {
					const id = toggleDetailBtn.getAttribute("data-toggle-feed-detail");
					if (MatchTracker.expandedIds.has(id)) MatchTracker.expandedIds.delete(id);
					else MatchTracker.expandedIds.add(id);
					self.renderFeed(false);
					return;
				}

				const cb = e.target.closest("[data-select-feed-id]");
				if (cb) {
					const id = cb.getAttribute("data-select-feed-id");
					const filtered = self.getFilteredFeedEvents();
					if (e.shiftKey && MatchTracker.lastClickedId) {
						const i1 = filtered.findIndex(x => x.id === MatchTracker.lastClickedId);
						const i2 = filtered.findIndex(x => x.id === id);
						if (i1 !== -1 && i2 !== -1) {
							const [start, end] = i1 < i2 ? [i1, i2] : [i2, i1];
							for (let i = start; i <= end; i++) {
								if (cb.checked) MatchTracker.selectedIds.add(filtered[i].id);
								else MatchTracker.selectedIds.delete(filtered[i].id);
							}
						}
					} else {
						if (cb.checked) MatchTracker.selectedIds.add(id);
						else MatchTracker.selectedIds.delete(id);
					}
					MatchTracker.lastClickedId = id;
					self.renderFeed(false);
				}
			});

			// Aba 3: Console & Logs filters & selection
			document.querySelectorAll("[data-lvl]").forEach(chip => {
				chip.onclick = () => {
					document.querySelectorAll("[data-lvl]").forEach(c => c.classList.remove("active"));
					chip.classList.add("active");
					self.filterLogLevel = chip.getAttribute("data-lvl");
					self.renderLogs();
				};
			});

			document.querySelectorAll("[data-src]").forEach(chip => {
				chip.onclick = () => {
					document.querySelectorAll("[data-src]").forEach(c => c.classList.remove("active"));
					chip.classList.add("active");
					self.filterLogSource = chip.getAttribute("data-src");
					self.renderLogs();
				};
			});

			document.getElementById("gc-dbg-log-search").oninput = (e) => {
				self.filterLogSearch = e.target.value.toLowerCase();
				self.renderLogs();
			};

			document.getElementById("gc-dbg-log-autoscroll").onclick = (e) => {
				self.logAutoScroll = !self.logAutoScroll;
				e.currentTarget.textContent = `📌 Auto-Scroll: ${self.logAutoScroll ? "ON" : "OFF"}`;
			};

			document.getElementById("gc-dbg-log-sel-all").onclick = () => {
				self.getFilteredLogs().forEach(l => self.selectedLogIds.add(l.id));
				self.renderLogs(false);
			};
			document.getElementById("gc-dbg-log-sel-none").onclick = () => {
				self.selectedLogIds.clear();
				self.renderLogs(false);
			};
			document.getElementById("gc-dbg-log-sel-errors").onclick = () => {
				self.logs.forEach(l => {
					if (l.level === "error" || l.level === "warn") self.selectedLogIds.add(l.id);
				});
				self.renderLogs(false);
			};

			document.getElementById("gc-dbg-btn-copy-logs-selected").onclick = () => self.copyLogsToClipboard("selected");
			document.getElementById("gc-dbg-btn-copy-logs-filtered").onclick = () => self.copyLogsToClipboard("filtered");
			document.getElementById("gc-dbg-btn-copy-logs").onclick = () => self.copyLogsToClipboard("all");
			document.getElementById("gc-dbg-btn-export-logs").onclick = () => self.exportLogsToFile();
			document.getElementById("gc-dbg-btn-clear-logs").onclick = () => {
				self.logs = [];
				self.selectedLogIds.clear();
				self.expandedLogIds.clear();
				self.unreadErrors = 0;
				self.updateBadges();
				self.renderLogs();
				self.showToast("Logs limpos.");
			};

			// Delegação de cliques no Console de Logs (Checkbox, Shift+Clique, Copiar Log Único, Expandir Stack)
			document.getElementById("gc-dbg-console-output").addEventListener("click", (e) => {
				const copyBtn = e.target.closest("[data-copy-log-id]");
				if (copyBtn) {
					const id = copyBtn.getAttribute("data-copy-log-id");
					const l = self.logs.find(x => x.id === id);
					if (l) {
						self.copyText(self.formatLogEntryText(l, true), "Log específico copiado!");
						self.flashCopiedButton(copyBtn);
					}
					return;
				}

				const toggleStackBtn = e.target.closest("[data-toggle-log-stack]");
				if (toggleStackBtn) {
					const id = toggleStackBtn.getAttribute("data-toggle-log-stack");
					if (self.expandedLogIds.has(id)) self.expandedLogIds.delete(id);
					else self.expandedLogIds.add(id);
					self.renderLogs(false);
					return;
				}

				const cb = e.target.closest("[data-select-log-id]");
				if (cb) {
					const id = cb.getAttribute("data-select-log-id");
					const filtered = self.getFilteredLogs();
					if (e.shiftKey && self.lastClickedLogId) {
						const i1 = filtered.findIndex(x => x.id === self.lastClickedLogId);
						const i2 = filtered.findIndex(x => x.id === id);
						if (i1 !== -1 && i2 !== -1) {
							const [start, end] = i1 < i2 ? [i1, i2] : [i2, i1];
							for (let i = start; i <= end; i++) {
								if (cb.checked) self.selectedLogIds.add(filtered[i].id);
								else self.selectedLogIds.delete(filtered[i].id);
							}
						}
					} else {
						if (cb.checked) self.selectedLogIds.add(id);
						else self.selectedLogIds.delete(id);
					}
					self.lastClickedLogId = id;
					self.renderLogs(false);
				}
			});

			// Console REPL JS
			const replInput = document.getElementById("gc-dbg-repl-input");
			const runRepl = () => {
				const code = (replInput.value || "").trim();
				if (!code) return;
				self.executeReplCommand(code);
				replInput.value = "";
			};
			document.getElementById("gc-dbg-repl-run").onclick = runRepl;
			replInput.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					runRepl();
				}
			});

			// Aba 4: Comandos & Card Spawner
			document.getElementById("gc-dbg-card-search").oninput = () => self.populateCardSelect();
			document.getElementById("gc-dbg-spawner-faction").onchange = () => self.populateCardSelect();

			document.getElementById("gc-dbg-act-win-round").onclick = () => self.actionForceWinRound();
			document.getElementById("gc-dbg-act-lose-round").onclick = () => self.actionForceLoseRound();
			document.getElementById("gc-dbg-act-win-match").onclick = () => self.actionForceWinMatch();
			document.getElementById("gc-dbg-act-force-pass-op").onclick = () => self.actionForceAIPass();
			document.getElementById("gc-dbg-act-unpass-all").onclick = () => self.actionCancelPasses();
			document.getElementById("gc-dbg-act-recalc-board").onclick = () => self.actionRecalculateBoard();

			document.getElementById("gc-dbg-act-draw-me").onclick = () => self.actionDrawCard(0);
			document.getElementById("gc-dbg-act-draw-op").onclick = () => self.actionDrawCard(1);
			document.getElementById("gc-dbg-act-heal-gems").onclick = () => self.actionRestoreGems();
			document.getElementById("gc-dbg-act-dmg-op").onclick = () => self.actionDamageOpponentGem();
			document.getElementById("gc-dbg-act-reset-leader-me").onclick = () => self.actionResetLeader(0);
			document.getElementById("gc-dbg-act-reset-leader-op").onclick = () => self.actionResetLeader(1);

			document.getElementById("gc-dbg-act-clear-weather").onclick = () => self.actionClearWeather();
			document.getElementById("gc-dbg-act-weather-frost").onclick = () => self.actionApplyWeather("Biting Frost");
			document.getElementById("gc-dbg-act-weather-fog").onclick = () => self.actionApplyWeather("Impenetrable Fog");
			document.getElementById("gc-dbg-act-weather-rain").onclick = () => self.actionApplyWeather("Torrential Rain");
			document.getElementById("gc-dbg-act-scorch-all").onclick = () => self.actionScorchBoard();
			document.getElementById("gc-dbg-act-clear-board").onclick = () => self.actionClearAllRows();

			document.getElementById("gc-dbg-act-spawn-me").onclick = () => self.actionSpawnCard(0, "hand");
			document.getElementById("gc-dbg-act-spawn-op").onclick = () => self.actionSpawnCard(1, "hand");
			document.getElementById("gc-dbg-act-spawn-board-me").onclick = () => self.actionSpawnCard(0, "board");
			document.getElementById("gc-dbg-act-spawn-board-op").onclick = () => self.actionSpawnCard(1, "board");
			document.getElementById("gc-dbg-act-spawn-grave-me").onclick = () => self.actionSpawnCard(0, "grave");
			document.getElementById("gc-dbg-act-spawn-grave-op").onclick = () => self.actionSpawnCard(1, "grave");

			// Aba 5: Modo Exploração
			document.getElementById("gc-dbg-story-copy-save").onclick = () => self.storyCopySaveJson();
			document.getElementById("gc-dbg-story-add-1k").onclick = () => self.storyModifyCrowns(1000);
			document.getElementById("gc-dbg-story-add-10k").onclick = () => self.storyModifyCrowns(10000);
			document.getElementById("gc-dbg-story-zero-crowns").onclick = () => self.storyModifyCrowns(0, true);
			document.getElementById("gc-dbg-story-unlock-map").onclick = () => self.storyUnlockAllNodes(false);
			document.getElementById("gc-dbg-story-complete-map").onclick = () => self.storyUnlockAllNodes(true);
			document.getElementById("gc-dbg-story-unlock-cards").onclick = () => self.storyUnlockAllCards();
			document.getElementById("gc-dbg-story-unlock-trophies").onclick = () => self.storyUnlockAllTrophies();
			document.getElementById("gc-dbg-story-save-now").onclick = () => {
				if (typeof StoryMode !== "undefined" && typeof StoryMode.saveGame === "function") {
					StoryMode.saveGame();
					self.showToast("💾 Campanha salva com sucesso!");
				}
			};
			document.getElementById("gc-dbg-story-refresh-map").onclick = () => self.storyRefreshUI();
			document.getElementById("gc-dbg-story-teleport").onclick = () => self.storyTeleportToSelectedNode(false);
			document.getElementById("gc-dbg-story-start-duel").onclick = () => self.storyTeleportToSelectedNode(true);

			// Aba 6: Versus & Sistema
			document.getElementById("gc-dbg-vs-copy-state").onclick = () => self.copyVersusDiagnostic();
			document.getElementById("gc-dbg-vs-force-sync").onclick = () => self.versusForceTurnSync();
			document.getElementById("gc-dbg-vs-lobby-sync").onclick = () => self.versusForceLobbySync();
			document.getElementById("gc-dbg-vs-clear-queue").onclick = () => self.versusClearPacketQueue();
			document.getElementById("gc-dbg-sys-unlock-ach").onclick = () => self.sysUnlockAllAchievements();
			document.getElementById("gc-dbg-sys-reset-ach").onclick = () => self.sysResetAchievements();
			document.getElementById("gc-dbg-sys-full-report").onclick = () => self.copyFullDiagnosticReport();

			// Arrastar Modal
			this.makeDraggable(document.getElementById("gc-debugger-modal"), document.getElementById("gc-dbg-drag-handle"));
		},

		flashCopiedButton(btn) {
			if (!btn) return;
			const orig = btn.innerHTML;
			btn.classList.add("copied");
			btn.innerHTML = "✓ Copiado";
			setTimeout(() => {
				btn.classList.remove("copied");
				btn.innerHTML = orig;
			}, 1100);
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
			if (!this.isEnabled) return;
			if (this.isOpen) this.close();
			else this.open();
		},

		open() {
			if (!this.isEnabled) return;
			const modal = document.getElementById("gc-debugger-modal");
			if (!modal) return;
			modal.style.display = "flex";
			this.isOpen = true;
			this.refreshActiveTab();

			if (!this.autoRefreshInterval) {
				this.autoRefreshInterval = setInterval(() => {
					if (!this.isOpen) return;
					if (this.activeTab === "match") this.updateMatchInspector();
					else if (this.activeTab === "story") this.updateStoryInspector();
					else if (this.activeTab === "versus") this.updateVersusInspector();
				}, 1200);
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
			modal.classList.toggle("maximized", this.isMaximized);
		},

		refreshActiveTab() {
			if (this.activeTab === "match") this.updateMatchInspector();
			else if (this.activeTab === "feed") this.renderFeed();
			else if (this.activeTab === "logs") this.renderLogs();
			else if (this.activeTab === "story") {
				this.populateStoryNodesSelect();
				this.updateStoryInspector();
			} else if (this.activeTab === "versus") {
				this.updateVersusInspector();
			}
		},

		switchTab(tabName) {
			this.activeTab = tabName;
			document.querySelectorAll(".gc-dbg-tab").forEach(t => {
				t.classList.toggle("active", t.getAttribute("data-tab") === tabName);
			});

			document.querySelectorAll(".gc-dbg-tab-panel").forEach(p => p.classList.remove("active"));
			const targetPanel = document.getElementById(`gc-dbg-panel-${tabName}`);
			if (targetPanel) targetPanel.classList.add("active");

			if (tabName === "feed") {
				MatchTracker.unreadAnomalies = 0;
				this.updateBadges();
			}
			if (tabName === "logs") {
				this.unreadErrors = 0;
				this.updateBadges();
			}
			this.refreshActiveTab();
		},

		showErrorBanner(msg, entry = null) {
			this.lastBannerErrorText = entry ? MatchTracker.formatEntryText(entry, true) : `[${new Date().toLocaleTimeString()}] ${msg}`;
			if (!this.isEnabled) return;
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

		updateBadges() {
			const badge = document.getElementById("gc-debug-badge");
			const logBadge = document.getElementById("gc-dbg-log-badge");
			const feedBadge = document.getElementById("gc-dbg-feed-badge");
			const btn = document.getElementById("gc-debug-toggle-btn");

			const totalErrors = this.unreadErrors + MatchTracker.unreadAnomalies;

			if (totalErrors > 0) {
				if (badge) {
					badge.innerText = totalErrors;
					badge.style.display = "inline-block";
				}
				if (btn) btn.classList.add("has-error");
			} else {
				if (badge) badge.style.display = "none";
				if (btn) btn.classList.remove("has-error");
			}

			if (logBadge) {
				if (this.unreadErrors > 0) {
					logBadge.innerText = this.unreadErrors;
					logBadge.style.display = "inline-block";
				} else {
					logBadge.style.display = "none";
				}
			}

			if (feedBadge) {
				if (MatchTracker.unreadAnomalies > 0) {
					feedBadge.innerText = MatchTracker.unreadAnomalies;
					feedBadge.style.display = "inline-block";
				} else {
					feedBadge.style.display = "none";
				}
			}
		},

		// =======================================================================
		// ABA 2: FEED DE AÇÕES DE COMBATE (FILTRAGEM, SELEÇÃO E CÓPIA GRANULAR)
		// =======================================================================
		getFilteredFeedEvents() {
			let filtered = MatchTracker.events;
			if (MatchTracker.filterType === "anomaly") {
				filtered = filtered.filter(e => e.isAnomaly || e.type === "anomaly");
			} else if (MatchTracker.filterType !== "all") {
				filtered = filtered.filter(e => e.type === MatchTracker.filterType);
			}

			if (MatchTracker.filterActor && MatchTracker.filterActor !== "all") {
				filtered = filtered.filter(e => e.actor === MatchTracker.filterActor);
			}

			if (MatchTracker.filterSearch) {
				const q = MatchTracker.filterSearch;
				filtered = filtered.filter(e =>
					(e.title && e.title.toLowerCase().includes(q)) ||
					(e.details && e.details.toLowerCase().includes(q)) ||
					(e.actor && e.actor.toLowerCase().includes(q)) ||
					(e.time && e.time.toLowerCase().includes(q)) ||
					(e.payloadText && e.payloadText.toLowerCase().includes(q))
				);
			}
			return filtered;
		},

		updateFeedFilterCounts() {
			const counts = {
				all: MatchTracker.events.length,
				play: 0,
				ability: 0,
				round: 0,
				pass: 0,
				anomaly: 0
			};
			MatchTracker.events.forEach(e => {
				if (counts[e.type] !== undefined) counts[e.type]++;
				if (e.isAnomaly || e.type === "anomaly") counts.anomaly++;
			});
			const labels = {
				all: "Todas",
				play: "🎴 Jogadas",
				ability: "⚡ Habilidades",
				round: "🚩 Rodadas",
				pass: "🛑 Passes",
				anomaly: "⚠️ Anomalias"
			};
			document.querySelectorAll("[data-feed-filter]").forEach(chip => {
				const k = chip.getAttribute("data-feed-filter");
				if (labels[k]) {
					chip.innerHTML = `${labels[k]} <span class="chip-count">(${counts[k] || 0})</span>`;
				}
			});

			const selCount = MatchTracker.selectedIds.size;
			const countEl = document.getElementById("gc-dbg-feed-sel-count");
			if (countEl) countEl.textContent = `${selCount} selecionado${selCount === 1 ? "" : "s"}`;
			const btnSel = document.getElementById("gc-dbg-btn-copy-feed-selected");
			if (btnSel) btnSel.textContent = `📋 Copiar Selecionados (${selCount})`;
		},

		renderFeed(scrollToEnd = true) {
			const container = document.getElementById("gc-dbg-feed-output");
			if (!container) return;

			this.updateFeedFilterCounts();
			const filtered = this.getFilteredFeedEvents();

			const btnFiltered = document.getElementById("gc-dbg-btn-copy-feed-filtered");
			if (btnFiltered) btnFiltered.textContent = `📋 Copiar Filtrados (${filtered.length})`;

			if (filtered.length === 0) {
				container.innerHTML = `<div style="color:#6b6357; text-align:center; padding:24px;">Nenhuma ação registrada para este filtro.</div>`;
				return;
			}

			const prevScroll = container.scrollTop;
			container.innerHTML = filtered.map(e => {
				const actorClass = (e.actor === "Jogador") ? "player" : (e.actor === "IA" ? "ai" : "system");
				const anomalyClass = e.isAnomaly ? "anomaly" : "";
				const isSelected = MatchTracker.selectedIds.has(e.id);
				const isExpanded = MatchTracker.expandedIds.has(e.id);
				const anomalyBadge = e.isAnomaly ? `<span class="gc-dbg-anomaly-badge">⚠️ ANOMALIA</span>` : "";
				const detailsHtml = e.details ? `<div class="gc-dbg-feed-details">${escapeHtml(e.details)}</div>` : "";
				const hasPayload = !!e.payloadText;
				const payloadBtn = hasPayload
					? `<button class="gc-dbg-mini-btn" data-toggle-feed-detail="${e.id}" title="Ver Payload / Stack Trace">${isExpanded ? "🔽 Ocultar" : "🔍 Detalhes"}</button>`
					: "";
				const payloadBox = hasPayload
					? `<pre class="gc-dbg-stack-box ${isExpanded ? "open" : ""}">${escapeHtml(e.payloadText)}</pre>`
					: "";

				return `
					<div class="gc-dbg-feed-item ${escapeHtml(e.type)} ${anomalyClass} ${isSelected ? "selected" : ""}">
						<div class="gc-dbg-feed-header">
							<div class="gc-dbg-feed-left">
								<input type="checkbox" class="gc-dbg-checkbox" data-select-feed-id="${e.id}" ${isSelected ? "checked" : ""} title="Selecionar esta ação (Shift+Clique para intervalo)" />
								<span class="gc-dbg-feed-icon">${e.icon}</span>
								<span class="gc-dbg-actor-badge ${actorClass}">[${escapeHtml(e.actor)}]</span>
								<span class="gc-dbg-feed-title">${escapeHtml(e.title)}</span>
								${anomalyBadge}
							</div>
							<div class="gc-dbg-feed-right">
								<span class="gc-dbg-feed-time">${escapeHtml(e.time)}</span>
								${payloadBtn}
								<button class="gc-dbg-mini-btn" data-copy-feed-id="${e.id}" title="Copiar apenas esta ação">📋 Copiar</button>
							</div>
						</div>
						${detailsHtml}
						${payloadBox}
					</div>
				`;
			}).join("");

			if (scrollToEnd && MatchTracker.autoScroll) {
				container.scrollTop = container.scrollHeight;
			} else {
				container.scrollTop = prevScroll;
			}
		},

		copyFeedToClipboard(mode = "all") {
			let list = [];
			let label = "";

			if (mode === "selected") {
				list = MatchTracker.events.filter(e => MatchTracker.selectedIds.has(e.id));
				if (list.length === 0) {
					this.showToast("Marque ao menos uma ação na caixa de seleção para copiar!");
					return;
				}
				label = `(${list.length} AÇÕES SELECIONADAS)`;
			} else if (mode === "filtered") {
				list = this.getFilteredFeedEvents();
				if (list.length === 0) {
					this.showToast("Nenhuma ação visível no filtro atual.");
					return;
				}
				label = `(${list.length} AÇÕES FILTRADAS)`;
			} else {
				list = MatchTracker.events;
				if (list.length === 0) {
					this.showToast("Nenhuma ação no histórico.");
					return;
				}
				label = `(COMPLETO: ${list.length} AÇÕES)`;
			}

			const lines = list.map(e => MatchTracker.formatEntryText(e, true));
			const text = `=== GWENT CLASSIC — HISTÓRICO DE COMBATE E AÇÕES ${label} ===\n\n` + lines.join("\n");
			this.copyText(text, `Copiado: ${list.length} ação(ões) para a área de transferência!`);
		},

		// =======================================================================
		// ABA 3: CONSOLE & LOGS (SELEÇÃO GRANULAR, CÓPIA INDIVIDUAL, REPL JS)
		// =======================================================================
		formatLogEntryText(l, includeStack = true) {
			if (!l) return "";
			let text = `[${l.time || l.shortTime}] [${(l.level || "info").toUpperCase()}] [${(l.source || "sys").toUpperCase()}] ${l.message}`;
			if (includeStack && l.stack) {
				text += `\n    ${l.stack.replace(/\n/g, "\n    ")}`;
			}
			return text;
		},

		getFilteredLogs() {
			let filtered = this.logs;
			if (this.filterLogLevel !== "all") {
				filtered = filtered.filter(l => l.level === this.filterLogLevel);
			}
			if (this.filterLogSource !== "all") {
				filtered = filtered.filter(l => l.source === this.filterLogSource);
			}
			if (this.filterLogSearch) {
				const q = this.filterLogSearch;
				filtered = filtered.filter(l =>
					(l.message && l.message.toLowerCase().includes(q)) ||
					(l.stack && l.stack.toLowerCase().includes(q)) ||
					(l.time && l.time.toLowerCase().includes(q))
				);
			}
			return filtered;
		},

		updateLogFilterCounts() {
			const counts = { all: this.logs.length, info: 0, warn: 0, error: 0 };
			this.logs.forEach(l => {
				if (counts[l.level] !== undefined) counts[l.level]++;
			});
			const labels = {
				all: "Todos",
				info: "ℹ️ Info",
				warn: "⚠️ Avisos",
				error: "🚨 Erros"
			};
			document.querySelectorAll("[data-lvl]").forEach(chip => {
				const k = chip.getAttribute("data-lvl");
				if (labels[k]) {
					chip.innerHTML = `${labels[k]} <span class="chip-count">(${counts[k] || 0})</span>`;
				}
			});

			const selCount = this.selectedLogIds.size;
			const countEl = document.getElementById("gc-dbg-log-sel-count");
			if (countEl) countEl.textContent = `${selCount} selecionado${selCount === 1 ? "" : "s"}`;
			const btnSel = document.getElementById("gc-dbg-btn-copy-logs-selected");
			if (btnSel) btnSel.textContent = `📋 Copiar Selecionados (${selCount})`;
		},

		renderLogs(scrollToEnd = true) {
			const container = document.getElementById("gc-dbg-console-output");
			if (!container) return;

			this.updateLogFilterCounts();
			const filtered = this.getFilteredLogs();

			const btnFiltered = document.getElementById("gc-dbg-btn-copy-logs-filtered");
			if (btnFiltered) btnFiltered.textContent = `📋 Copiar Filtrados (${filtered.length})`;

			if (filtered.length === 0) {
				container.innerHTML = `<div style="color:#6b6357; text-align:center; padding:24px;">Nenhum registro de log encontrado para este filtro.</div>`;
				return;
			}

			const prevScroll = container.scrollTop;
			container.innerHTML = filtered.map(l => {
				const isSelected = this.selectedLogIds.has(l.id);
				const isExpanded = this.expandedLogIds.has(l.id);
				const hasStack = !!l.stack;
				const stackBtn = hasStack
					? `<button class="gc-dbg-mini-btn" data-toggle-log-stack="${l.id}" title="Expandir/Ocultar Stack Trace ou JSON">${isExpanded ? "🔽 Stack" : "🔍 Stack"}</button>`
					: "";
				const stackBox = hasStack
					? `<pre class="gc-dbg-stack-box ${isExpanded ? "open" : ""}">${escapeHtml(l.stack)}</pre>`
					: "";

				return `
					<div class="gc-dbg-log-entry ${escapeHtml(l.level)} ${isSelected ? "selected" : ""}">
						<div class="gc-dbg-log-row-main">
							<div class="gc-dbg-log-left">
								<input type="checkbox" class="gc-dbg-checkbox" data-select-log-id="${l.id}" ${isSelected ? "checked" : ""} title="Marcar este log para cópia seletiva (Shift+Clique para intervalo)" />
								<span class="time">[${escapeHtml(l.time)}]</span>
								<span class="gc-dbg-log-lvl-tag ${escapeHtml(l.level)}">${escapeHtml(l.level)}</span>
								<span class="gc-dbg-log-msg">${escapeHtml(l.message)}</span>
							</div>
							<div class="gc-dbg-log-right">
								${stackBtn}
								<button class="gc-dbg-mini-btn" data-copy-log-id="${l.id}" title="Copiar apenas este log">📋</button>
							</div>
						</div>
						${stackBox}
					</div>
				`;
			}).join("");

			if (scrollToEnd && this.logAutoScroll) {
				container.scrollTop = container.scrollHeight;
			} else {
				container.scrollTop = prevScroll;
			}
		},

		copyLogsToClipboard(mode = "all") {
			let list = [];
			let label = "";

			if (mode === "selected") {
				list = this.logs.filter(l => this.selectedLogIds.has(l.id));
				if (list.length === 0) {
					this.showToast("Marque ao menos um log na caixa de seleção para copiar!");
					return;
				}
				label = `(${list.length} LOGS SELECIONADOS)`;
			} else if (mode === "filtered") {
				list = this.getFilteredLogs();
				if (list.length === 0) {
					this.showToast("Nenhum log visível no filtro atual.");
					return;
				}
				label = `(${list.length} LOGS FILTRADOS)`;
			} else {
				list = this.logs;
				if (list.length === 0) {
					this.showToast("Nenhum log para copiar.");
					return;
				}
				label = `(COMPLETO: ${list.length} LOGS)`;
			}

			const text = `=== GWENT CLASSIC — CONSOLE LOGS ${label} ===\n\n` +
				list.map(l => this.formatLogEntryText(l, true)).join("\n");
			this.copyText(text, `Copiado: ${list.length} registro(s) de log!`);
		},

		exportLogsToFile() {
			const report = this.buildFullDiagnosticReport();
			const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `gwent-classic-debug-${new Date().toISOString().replace(/[:.]/g, "-")}.log`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			this.showToast("💾 Arquivo .LOG exportado com sucesso!");
		},

		executeReplCommand(code) {
			console.log(`▶ [REPL JS] ${code}`);
			try {
				// eslint-disable-next-line no-eval
				const result = (0, eval)(code);
				console.log(`◀ [Resultado]`, result);
				this.renderLogs(true);
			} catch (err) {
				console.error(`✖ [Erro REPL] ${err.message}`, err);
				this.renderLogs(true);
			}
		},

		// =======================================================================
		// ABA 1: INSPETOR DE DUELO, TRAVAS & CONTAINERS DE CARTAS
		// =======================================================================
		updateMatchInspector() {
			const inGame = typeof game !== "undefined" && game && typeof player_me !== "undefined" && player_me;
			const statusBadge = document.getElementById("gc-dbg-match-status-badge");
			const locksBar = document.getElementById("gc-dbg-locks-bar");

			if (!inGame) {
				if (statusBadge) statusBadge.innerText = "Fora de Partida (No Menu)";
				if (locksBar) locksBar.innerHTML = `<span class="gc-dbg-lock-pill">Aguardando início de duelo...</span>`;
				this.renderCardContainerList();
				return;
			}

			const isVersus = typeof VersusMode !== "undefined" && VersusMode.isActive;
			const isStory = typeof StoryMode !== "undefined" && StoryMode.activeNodeId;
			const modeStr = isVersus ? "Modo Versus P2P" : (isStory ? `Modo Exploração (${StoryMode.activeNodeId})` : "Partida Rápida de Gwent");
			if (statusBadge) statusBadge.innerText = `⚔️ ${modeStr}`;

			const roundElem = document.getElementById("gc-dbg-stat-round");
			const turnElem = document.getElementById("gc-dbg-stat-turn");
			const meElem = document.getElementById("gc-dbg-stat-me");
			const opElem = document.getElementById("gc-dbg-stat-op");

			if (roundElem) {
				const stName = (typeof GameState !== "undefined" && game.state === GameState.PLAYING) ? "PLAYING" : "OUTRO";
				roundElem.innerText = `Rodada ${game.roundCount || 1} [${stName}]`;
			}
			if (turnElem) {
				const isMeTurn = game.activePlayer === player_me || game.currPlayer === player_me;
				turnElem.innerText = isMeTurn ? `🛡️ ${player_me.name || "Jogador"}` : `🤖 ${player_op?.name || "Oponente"}`;
				turnElem.style.color = isMeTurn ? "#74c0fc" : "#ff8787";
			}
			if (meElem) {
				const hCount = player_me.hand?.cards?.length || 0;
				const dCount = player_me.deck?.cards?.length || 0;
				const gCount = player_me.grave?.cards?.length || 0;
				const pStr = player_me.passed ? " [PASSOU]" : "";
				meElem.innerText = `❤️${player_me.health || 0} | 🎴Mão:${hCount} | 📚Deck:${dCount} | ⚰️Cem:${gCount}${pStr}`;
			}
			if (opElem && typeof player_op !== "undefined" && player_op) {
				const hCount = player_op.hand?.cards?.length || 0;
				const dCount = player_op.deck?.cards?.length || 0;
				const gCount = player_op.grave?.cards?.length || 0;
				const pStr = player_op.passed ? " [PASSOU]" : "";
				opElem.innerText = `❤️${player_op.health || 0} | 🎴Mão:${hCount} | 📚Deck:${dCount} | ⚰️Cem:${gCount}${pStr}`;
			}

			// Monitor de Travas (Locks)
			if (locksBar) {
				const flags = [
					{ name: "isActionInProgress", active: !!game.isActionInProgress },
					{ name: "isCardBeingPlayed", active: !!game.isCardBeingPlayed },
					{ name: "me.isPlayingCard", active: !!player_me.isPlayingCard },
					{ name: "placedEffectsActive", active: !!game.placedEffectsActive },
					{ name: "Carousel.curr", active: !!(typeof Carousel !== "undefined" && Carousel.curr) },
					{ name: "Popup.curr", active: !!(typeof Popup !== "undefined" && Popup.curr) }
				];
				if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
					flags.push({ name: "VS.isActionExec", active: !!VersusMode.isActionExecuting });
					flags.push({ name: "VS.isProcQueue", active: !!VersusMode.isProcessingQueue });
				}
				locksBar.innerHTML = flags.map(f =>
					`<span class="gc-dbg-lock-pill ${f.active ? "active-lock" : "ok-state"}">${f.name}: ${f.active ? "LOCKED" : "OK"}</span>`
				).join("");
			}

			// Placar por Fileira com indicadores de efeitos
			if (typeof board !== "undefined" && board && board.row) {
				const formatRowCell = (r) => {
					if (!r) return "0";
					const tags = [];
					if (r.effects?.weather) tags.push("❄️");
					if (r.effects?.horn > 0 || r.special) tags.push("📯");
					if (r.effects?.morale > 0) tags.push(`+${r.effects.morale}`);
					if (r.effects?.mardroeme > 0) tags.push("🍄");
					const countStr = r.cards ? `(${r.cards.length}c)` : "";
					return `${r.total || 0} <span style="font-size:9.5px; color:#8c8273;">${countStr}${tags.join("")}</span>`;
				};

				document.getElementById("gc-dbg-row-op-close").innerHTML = formatRowCell(board.row[2]);
				document.getElementById("gc-dbg-row-op-ranged").innerHTML = formatRowCell(board.row[1]);
				document.getElementById("gc-dbg-row-op-siege").innerHTML = formatRowCell(board.row[0]);
				document.getElementById("gc-dbg-total-op").innerText = player_op?.total || 0;

				document.getElementById("gc-dbg-row-me-close").innerHTML = formatRowCell(board.row[3]);
				document.getElementById("gc-dbg-row-me-ranged").innerHTML = formatRowCell(board.row[4]);
				document.getElementById("gc-dbg-row-me-siege").innerHTML = formatRowCell(board.row[5]);
				document.getElementById("gc-dbg-total-me").innerText = player_me?.total || 0;
			}

			// Clima
			const weatherElem = document.getElementById("gc-dbg-weather-status");
			if (weatherElem && typeof weather !== "undefined" && weather.types) {
				const activeWeathers = [];
				if (weather.types.frost && weather.types.frost.count > 0) activeWeathers.push("❄️ Geada");
				if (weather.types.fog && weather.types.fog.count > 0) activeWeathers.push("🌫️ Névoa");
				if (weather.types.rain && weather.types.rain.count > 0) activeWeathers.push("🌧️ Chuva");
				weatherElem.innerText = activeWeathers.length > 0 ? activeWeathers.join(", ") : "☀️ Céu Limpo";
			}

			// Regras Ativas
			const rulesElem = document.getElementById("gc-dbg-rules-status");
			if (rulesElem && typeof GameRules !== "undefined") {
				const list = GameRules.getActiveRulesList();
				rulesElem.innerText = list.length > 0 ? list.map(r => `${r.icon} ${r.name}`).join(" | ") : "Modo Clássico (Regras Padrão)";
			}

			this.renderCardContainerList();
		},

		getInspectedContainerCards() {
			if (typeof player_me === "undefined" || !player_me) return [];
			const target = this.inspectorContainerTarget || "op_hand";
			if (target === "op_hand") return (player_op?.hand?.cards || []).map((c, idx) => ({ card: c, source: player_op.hand, idx, label: "Mão Op" }));
			if (target === "me_hand") return (player_me?.hand?.cards || []).map((c, idx) => ({ card: c, source: player_me.hand, idx, label: "Minha Mão" }));
			if (target === "me_grave") return (player_me?.grave?.cards || []).map((c, idx) => ({ card: c, source: player_me.grave, idx, label: "Meu Cem" }));
			if (target === "op_grave") return (player_op?.grave?.cards || []).map((c, idx) => ({ card: c, source: player_op.grave, idx, label: "Cem Op" }));
			if (target === "me_deck") return (player_me?.deck?.cards || []).map((c, idx) => ({ card: c, source: player_me.deck, idx, label: `#${idx + 1}` }));
			if (target === "op_deck") return (player_op?.deck?.cards || []).map((c, idx) => ({ card: c, source: player_op.deck, idx, label: `#${idx + 1}` }));
			if (target === "board_all" && typeof board !== "undefined" && board?.row) {
				const names = ["Op Cerco", "Op Alcance", "Op Corpo", "Meu Corpo", "Meu Alcance", "Meu Cerco"];
				const res = [];
				board.row.forEach((r, rIdx) => {
					if (r.special) {
						res.push({ card: r.special, source: r, idx: -1, label: `${names[rIdx]} [Especial]` });
					}
					(r.cards || []).forEach((c, cIdx) => {
						res.push({ card: c, source: r, idx: cIdx, label: names[rIdx] });
					});
				});
				return res;
			}
			return [];
		},

		renderCardContainerList() {
			const container = document.getElementById("gc-dbg-ai-hand-list");
			const counter = document.getElementById("gc-dbg-ai-hand-count");
			if (!container) return;

			if (typeof player_me === "undefined" || !player_me) {
				container.innerHTML = `<div style="color:#6b6357; text-align:center; padding:12px;">Inicie uma partida para inspecionar containers de cartas.</div>`;
				if (counter) counter.innerText = "0";
				return;
			}

			const items = this.getInspectedContainerCards();
			if (counter) counter.innerText = items.length;

			if (items.length === 0) {
				container.innerHTML = `<div style="color:#8c8273; text-align:center; padding:12px;">Nenhuma carta neste container.</div>`;
				return;
			}

			container.innerHTML = items.map((item, i) => {
				const c = item.card;
				const isHero = c.hero ? "hero" : "";
				const ability = c.abilities && c.abilities.length ? `[${c.abilities.join(", ")}]` : "";
				const power = c.power !== undefined ? c.power : (c.basePower || 0);
				return `
					<div class="gc-dbg-ai-card-item ${isHero}">
						<div style="flex:1; min-width:0;">
							<strong>${escapeHtml(c.name)}</strong>
							<span style="color:#8c8273; font-size:10px;"> (${escapeHtml(item.label)}) ${escapeHtml(c.row || "")} ${escapeHtml(ability)}</span>
						</div>
						<div class="gc-dbg-card-mini-actions">
							<span class="gc-dbg-ai-card-power" title="Poder Atual / Base: ${power}/${c.basePower || 0}">${power}</span>
							<button class="gc-dbg-mini-btn" data-inspect-remove="${i}" title="Remover carta deste container">🗑️</button>
						</div>
					</div>
				`;
			}).join("");

			container.querySelectorAll("[data-inspect-remove]").forEach(btn => {
				btn.onclick = () => {
					const idx = Number(btn.getAttribute("data-inspect-remove"));
					const targetItem = items[idx];
					if (targetItem && targetItem.source && typeof targetItem.source.removeCard === "function") {
						targetItem.source.removeCard(targetItem.card);
						this.actionRecalculateBoard();
						this.updateMatchInspector();
						this.showToast(`Carta [${targetItem.card.name}] removida.`);
					}
				};
			});
		},

		copyContainerCardsList() {
			const items = this.getInspectedContainerCards();
			if (items.length === 0) {
				this.showToast("Container vazio.");
				return;
			}
			const lines = items.map((it, i) => `${i + 1}. [${it.label}] ${it.card.name} (Poder: ${it.card.power}/${it.card.basePower || 0}, Fileira: ${it.card.row}, Hab: ${(it.card.abilities || []).join(",") || "nenhuma"})`);
			this.copyText(lines.join("\n"), `Lista de ${items.length} carta(s) copiada!`);
		},

		// =======================================================================
		// ABA 4: COMANDOS DE DUELO, CHEATS & CARD SPAWNER
		// =======================================================================
		populateCardSelect() {
			const select = document.getElementById("gc-dbg-card-select");
			if (!select || typeof card_dict === "undefined") return;

			const q = (document.getElementById("gc-dbg-card-search")?.value || "").trim().toLowerCase();
			const facFilter = document.getElementById("gc-dbg-spawner-faction")?.value || "all";
			select.innerHTML = "";

			const cardsArray = Array.isArray(card_dict) ? card_dict : Object.values(card_dict);
			const list = [];

			cardsArray.forEach((c, idx) => {
				if (!c || !c.name) return;
				const cDeck = (c.deck || "neutral").toLowerCase();
				if (facFilter !== "all") {
					if (facFilter === "neutral") {
						if (!["neutral", "special", "weather"].includes(cDeck)) return;
					} else if (cDeck !== facFilter) {
						return;
					}
				}
				const str = `${idx} ${c.name} ${c.deck || ""} ${c.ability || ""} ${c.row || ""}`.toLowerCase();
				if (q && !str.includes(q)) return;

				list.push({ idx, data: c });
			});

			list.sort((a, b) => a.data.name.localeCompare(b.data.name));

			list.forEach(item => {
				const opt = document.createElement("option");
				opt.value = item.idx;
				const abilityStr = item.data.ability ? ` (${item.data.ability})` : "";
				const strengthStr = item.data.strength !== undefined ? ` [⚔️${item.data.strength}]` : "";
				opt.innerText = `#${item.idx} ${item.data.name}${strengthStr}${abilityStr} — ${item.data.deck || ""}`;
				select.appendChild(opt);
			});

			if (select.options.length > 0) {
				select.selectedIndex = 0;
			}
		},

		actionUnlockUI() {
			if (typeof game !== "undefined" && game) {
				game.isActionInProgress = false;
				game.isCardBeingPlayed = false;
				game.placedEffectsActive = false;
			}
			if (typeof player_me !== "undefined" && player_me) {
				player_me.isPlayingCard = false;
			}
			if (typeof VersusMode !== "undefined") {
				VersusMode.isActionExecuting = false;
				VersusMode.isProcessingQueue = false;
			}
			if (typeof ui !== "undefined" && ui && typeof ui.enablePlayer === "function") {
				ui.enablePlayer(true);
			}
			this.updateMatchInspector();
			this.showToast("🔓 Travas de UI e Turno liberadas!");
			MatchTracker.log("system", "🔓", "Debug", "Destravamento manual de Turno/UI executado.");
		},

		async actionDrawCard(playerIndex) {
			const p = (playerIndex === 0) ? (typeof player_me !== "undefined" ? player_me : null) : (typeof player_op !== "undefined" ? player_op : null);
			if (!p || !p.deck || !p.hand) {
				this.showToast("Partida não está ativa.");
				return;
			}
			if (p.deck.cards && p.deck.cards.length > 0) {
				const card = p.deck.removeCard(0);
				if (card) {
					p.hand.addCard(card);
					this.showToast(`🎴 Carta sacada: ${card.name} para ${playerIndex === 0 ? "Jogador" : "Oponente"}`);
					MatchTracker.log("play", "🎴", "Debug", `Compra forçada de carta: [${card.name}] para ${playerIndex === 0 ? "Jogador" : "Oponente"}`);
					this.updateMatchInspector();
				}
			} else {
				this.showToast("Baralho está vazio!");
				MatchTracker.onAnomaly("Baralho Vazio", `Tentativa de compra forçada para ${playerIndex === 0 ? "Jogador" : "Oponente"}, mas o baralho não tem cartas.`);
			}
		},

		actionForceAIPass() {
			if (typeof player_op === "undefined" || !player_op) {
				this.showToast("Oponente não está ativo.");
				return;
			}
			try {
				player_op.passRound();
				this.showToast("✋ Oponente forçado a passar a rodada!");
				MatchTracker.log("pass", "✋", "Debug", "Passe forçado do Oponente acionado pelo Debug.");
				this.updateMatchInspector();
			} catch (e) {
				console.error("[Debugger] Erro ao forçar passe:", e);
			}
		},

		actionCancelPasses() {
			if (typeof player_me !== "undefined" && player_me) player_me.setPassed(false);
			if (typeof player_op !== "undefined" && player_op) player_op.setPassed(false);
			if (typeof ui !== "undefined" && ui) ui.enablePlayer(true);
			this.updateMatchInspector();
			this.showToast("🔄 Estado de Passe removido de ambos os jogadores.");
			MatchTracker.log("round", "🔄", "Debug", "Passes cancelados manualmente.");
		},

		actionRestoreGems() {
			if (typeof player_me === "undefined" || !player_me) return;
			player_me.health = 2;
			if (typeof player_op !== "undefined" && player_op) player_op.health = 2;
			document.querySelectorAll("#stats-me .gem, #stats-op .gem").forEach(g => g.classList.add("gem-on"));
			this.updateMatchInspector();
			this.showToast("❤️ Gemas restauradas para 2 em ambos os jogadores!");
			MatchTracker.log("match", "❤️", "Debug", "Gemas de vida restauradas para 2.");
		},

		actionDamageOpponentGem() {
			if (typeof player_op === "undefined" || !player_op) return;
			if (player_op.health > 0) {
				player_op.health--;
				const gemElem = document.getElementById("gem" + player_op.health + "-op");
				if (gemElem) gemElem.classList.remove("gem-on");
			}
			this.updateMatchInspector();
			this.showToast(`💔 Oponente agora tem ${player_op.health} gema(s).`);
		},

		actionResetLeader(playerIndex) {
			const p = (playerIndex === 0) ? (typeof player_me !== "undefined" ? player_me : null) : (typeof player_op !== "undefined" ? player_op : null);
			if (!p || !p.leaderAvailable) {
				this.showToast("Partida não ativa.");
				return;
			}
			p.enableLeader();
			this.showToast(`👑 Líder de ${playerIndex === 0 ? "Jogador" : "Oponente"} reativado!`);
			MatchTracker.log("ability", "👑", "Debug", `Habilidade de Líder reativada para ${playerIndex === 0 ? "Jogador" : "Oponente"}.`);
		},

		actionClearWeather() {
			if (typeof weather !== "undefined" && weather && typeof weather.clearWeather === "function") {
				weather.clearWeather();
				this.actionRecalculateBoard();
				this.showToast("☀️ Todo o clima foi limpo do tabuleiro.");
				MatchTracker.log("ability", "☀️", "Debug", "Comando de Limpar Todo o Clima executado.");
			}
		},

		async actionApplyWeather(weatherCardName) {
			if (typeof weather === "undefined" || !weather || typeof card_dict === "undefined") return;
			const cardsArray = Array.isArray(card_dict) ? card_dict : Object.values(card_dict);
			const wData = cardsArray.find(c => c && c.name === weatherCardName);
			if (!wData) return;
			const wCard = new Card(wData, typeof player_me !== "undefined" ? player_me : null);
			await weather.addCard(wCard);
			this.actionRecalculateBoard();
			this.showToast(`Clima [${weatherCardName}] aplicado!`);
		},

		async actionScorchBoard() {
			if (typeof player_me === "undefined" || !player_me || typeof card_dict === "undefined") return;
			const cardsArray = Array.isArray(card_dict) ? card_dict : Object.values(card_dict);
			const sData = cardsArray.find(c => c && c.name === "Scorch");
			if (!sData) return;
			const sCard = new Card(sData, player_me);
			await player_me.playScorch(sCard);
			this.actionRecalculateBoard();
			this.showToast("🔥 Queimar (Scorch) executado no campo!");
		},

		async actionClearAllRows() {
			if (typeof board === "undefined" || !board || !board.row) return;
			for (const r of board.row) {
				await r.clear();
			}
			this.actionRecalculateBoard();
			this.showToast("🧹 Todas as fileiras do tabuleiro foram limpas!");
		},

		actionRecalculateBoard() {
			if (typeof board !== "undefined" && board && Array.isArray(board.row)) {
				board.row.forEach(r => {
					if (r && typeof r.updateScore === "function") r.updateScore();
				});
				if (typeof board.updateLeader === "function") board.updateLeader();
				this.showToast("🧮 Pontuação de todas as fileiras recalculada.");
				this.updateMatchInspector();
			}
		},

		async actionForceWinRound() {
			if (typeof game === "undefined" || !game || typeof player_me === "undefined" || !player_me) {
				this.showToast("Partida não iniciada.");
				return;
			}
			try {
				if (player_me.total <= (player_op?.total || 0) && typeof board !== "undefined" && board.row) {
					const heroData = (Array.isArray(card_dict) ? card_dict : Object.values(card_dict)).find(c => c && c.name && c.name.includes("Geralt"));
					if (heroData) {
						const c = new Card(heroData, player_me);
						c.basePower = c.power = ((player_op?.total || 0) - player_me.total) + 15;
						await board.row[3].addCard(c);
					}
				}
				player_op.setPassed(true);
				player_me.setPassed(true);
				MatchTracker.log("round", "🏆", "Debug", "Vitória da rodada forçada pelo painel de Debug.");
				await game.endRound();
				this.updateMatchInspector();
			} catch (e) {
				console.error("[Debugger] Erro ao forçar vitória da rodada:", e);
			}
		},

		async actionForceLoseRound() {
			if (typeof game === "undefined" || !game || typeof player_op === "undefined" || !player_op) {
				this.showToast("Partida não iniciada.");
				return;
			}
			try {
				if (player_op.total <= (player_me?.total || 0) && typeof board !== "undefined" && board.row) {
					const heroData = (Array.isArray(card_dict) ? card_dict : Object.values(card_dict)).find(c => c && c.name && c.name.includes("Geralt"));
					if (heroData) {
						const c = new Card(heroData, player_op);
						c.basePower = c.power = ((player_me?.total || 0) - player_op.total) + 15;
						await board.row[2].addCard(c);
					}
				}
				player_me.setPassed(true);
				player_op.setPassed(true);
				MatchTracker.log("round", "💀", "Debug", "Derrota da rodada forçada pelo painel de Debug.");
				await game.endRound();
				this.updateMatchInspector();
			} catch (e) {
				console.error("[Debugger] Erro ao forçar derrota da rodada:", e);
			}
		},

		async actionForceWinMatch() {
			if (typeof game === "undefined" || !game || typeof player_op === "undefined" || !player_op) {
				this.showToast("Partida não iniciada.");
				return;
			}
			player_op.health = 1;
			await this.actionForceWinRound();
		},

		async actionSpawnCard(playerIndex, destination = "hand") {
			const select = document.getElementById("gc-dbg-card-select");
			if (!select || select.selectedIndex < 0) {
				this.showToast("Selecione uma carta na lista.");
				return;
			}

			const p = (playerIndex === 0) ? (typeof player_me !== "undefined" ? player_me : null) : (typeof player_op !== "undefined" ? player_op : null);
			if (!p || !p.hand) {
				this.showToast("Inicie uma partida primeiro para invocar cartas.");
				return;
			}

			const cardIdx = Number(select.value);
			const cardData = card_dict[cardIdx];
			const qty = Number(document.getElementById("gc-dbg-spawner-qty")?.value || 1);
			if (!cardData) return;

			try {
				for (let i = 0; i < qty; i++) {
					const newCard = new Card(cardData, p);
					if (destination === "hand") {
						p.hand.addCard(newCard);
					} else if (destination === "grave") {
						p.grave.addCard(newCard);
					} else if (destination === "board" && typeof board !== "undefined" && board) {
						if (newCard.row === "weather") {
							await weather.addCard(newCard);
						} else {
							const rType = (newCard.row === "agile" || !["close", "ranged", "siege"].includes(newCard.row)) ? "close" : newCard.row;
							const targetRow = board.getRow(newCard, rType, p);
							if (targetRow) await targetRow.addCard(newCard);
						}
					}
				}
				this.actionRecalculateBoard();
				const destLabels = { hand: "Mão", grave: "Cemitério", board: "Campo" };
				this.showToast(`🃏 ${qty}x [${cardData.name}] ➔ ${destLabels[destination]} (${playerIndex === 0 ? "Jogador" : "IA"})!`);
				MatchTracker.log("play", "🃏", "Debug", `Spawn: ${qty}x [${cardData.name}] em ${destLabels[destination]} de ${playerIndex === 0 ? "Jogador" : "IA"}.`);
			} catch (e) {
				console.error("[Debugger] Erro ao invocar carta:", e);
				this.showToast("Erro ao invocar carta: " + e.message);
			}
		},

		// =======================================================================
		// ABA 5: MODO EXPLORAÇÃO & SAVE
		// =======================================================================
		populateStoryNodesSelect() {
			const select = document.getElementById("gc-dbg-story-node-select");
			if (!select || typeof STORY_DATA === "undefined" || !STORY_DATA.NODES) return;
			select.innerHTML = "";
			Object.values(STORY_DATA.NODES).forEach(n => {
				const opt = document.createElement("option");
				opt.value = n.id;
				opt.innerText = `[${n.region || "Mapa"}] ${n.name} (${n.type}) — ${n.id}`;
				select.appendChild(opt);
			});
		},

		updateStoryInspector() {
			const hasSave = typeof StoryMode !== "undefined" && StoryMode.save;
			const pEl = document.getElementById("gc-dbg-story-player");
			const cEl = document.getElementById("gc-dbg-story-crowns");
			const nEl = document.getElementById("gc-dbg-story-nodes");
			const colEl = document.getElementById("gc-dbg-story-cards");
			const tEl = document.getElementById("gc-dbg-story-trophies");
			const curEl = document.getElementById("gc-dbg-story-curr-node");

			if (!hasSave) {
				if (pEl) pEl.innerText = "Sem Save Carregado";
				return;
			}

			const s = StoryMode.save;
			const totalNodes = (typeof STORY_DATA !== "undefined" && STORY_DATA.NODES) ? Object.keys(STORY_DATA.NODES).length : "?";
			const uniqueOwned = s.collection ? Object.keys(s.collection).filter(k => s.collection[k] > 0).length : 0;
			const totalCopies = s.collection ? Object.values(s.collection).reduce((a, b) => a + Number(b || 0), 0) : 0;

			if (pEl) pEl.innerText = `${s.playerName || "Geralt"} (Slot ${s.slotId || 1})`;
			if (cEl) cEl.innerText = `💰 ${s.crowns || 0}`;
			if (nEl) nEl.innerText = `🔓 ${(s.unlockedNodes || []).length} | ✅ ${(s.completedNodes || []).length} / ${totalNodes}`;
			if (colEl) colEl.innerText = `🃏 ${uniqueOwned} únicas (${totalCopies} total)`;
			if (tEl) tEl.innerText = `🏆 ${(s.trophies || []).length}`;
			if (curEl) curEl.innerText = s.currentNode || "-";
		},

		storyRefreshUI() {
			if (typeof StoryMode === "undefined" || !StoryMode.save) return;
			if (typeof StoryMode.saveGame === "function") StoryMode.saveGame();
			if (typeof StoryMode.updateHUD === "function") StoryMode.updateHUD();
			if (typeof StoryMode.renderMapNodes === "function") StoryMode.renderMapNodes();
			if (typeof StoryMode.updateStatsDrawer === "function") StoryMode.updateStatsDrawer();
			this.updateStoryInspector();
		},

		storyModifyCrowns(amount, reset = false) {
			if (typeof StoryMode === "undefined" || !StoryMode.save) {
				this.showToast("Abra ou carregue uma campanha no Modo Exploração primeiro.");
				return;
			}
			StoryMode.save.crowns = reset ? 0 : Math.max(0, (StoryMode.save.crowns || 0) + amount);
			this.storyRefreshUI();
			this.showToast(`💰 Coroas atualizadas: ${StoryMode.save.crowns}`);
			MatchTracker.log("system", "💰", "Debug", `Modo Exploração: Coroas ajustadas para ${StoryMode.save.crowns}.`);
		},

		storyUnlockAllNodes(alsoComplete = false) {
			if (typeof StoryMode === "undefined" || !StoryMode.save || typeof STORY_DATA === "undefined") {
				this.showToast("Campanha do Modo Exploração não carregada.");
				return;
			}
			const allIds = Object.keys(STORY_DATA.NODES);
			StoryMode.save.unlockedNodes = [...allIds];
			if (alsoComplete) {
				StoryMode.save.completedNodes = [...allIds];
			}
			this.storyRefreshUI();
			this.showToast(alsoComplete ? "✅ Todos os nós do Continente concluídos!" : "🗺️ Todos os nós do Continente revelados!");
			MatchTracker.log("system", "🗺️", "Debug", `Modo Exploração: ${allIds.length} nós desbloqueados (completos: ${alsoComplete}).`);
		},

		storyUnlockAllCards() {
			if (typeof StoryMode === "undefined" || !StoryMode.save || typeof card_dict === "undefined") {
				this.showToast("Campanha do Modo Exploração não carregada.");
				return;
			}
			const cardsArray = Array.isArray(card_dict) ? card_dict : Object.values(card_dict);
			cardsArray.forEach((c, idx) => {
				if (!c || !c.name) return;
				const max = typeof StoryMode.getCardMaxCopies === "function" ? StoryMode.getCardMaxCopies(idx) : (Number(c.count) || 1);
				StoryMode.save.collection[idx] = max;
			});
			this.storyRefreshUI();
			this.showToast("🃏 Coleção 100% desbloqueada no Modo Exploração!");
			MatchTracker.log("system", "🃏", "Debug", "Modo Exploração: Todas as cartas adicionadas à coleção.");
		},

		storyUnlockAllTrophies() {
			if (typeof StoryMode === "undefined" || !StoryMode.save || typeof STORY_DATA === "undefined") return;
			const trophies = STORY_DATA.TROPHIES ? Object.keys(STORY_DATA.TROPHIES) : [];
			StoryMode.save.trophies = [...trophies];
			this.storyRefreshUI();
			this.showToast(`🏆 ${trophies.length} troféus desbloqueados!`);
		},

		storyTeleportToSelectedNode(startBattle = false) {
			if (typeof StoryMode === "undefined" || !StoryMode.save) {
				this.showToast("Carregue um save do Modo Exploração primeiro.");
				return;
			}
			const nodeId = document.getElementById("gc-dbg-story-node-select")?.value;
			if (!nodeId) return;
			if (!StoryMode.save.unlockedNodes.includes(nodeId)) {
				StoryMode.save.unlockedNodes.push(nodeId);
			}
			StoryMode.save.currentNode = nodeId;
			this.storyRefreshUI();
			if (typeof StoryMode.selectNode === "function") {
				StoryMode.selectNode(nodeId);
			}
			if (startBattle && typeof StoryMode.startNodeInteraction === "function") {
				this.close();
				StoryMode.startNodeInteraction(nodeId);
			} else {
				this.showToast(`📍 Teleportado para o nó [${nodeId}].`);
			}
		},

		storyCopySaveJson() {
			if (typeof StoryMode === "undefined" || !StoryMode.save) {
				this.showToast("Nenhum save do Modo Exploração ativo.");
				return;
			}
			this.copyText(JSON.stringify(StoryMode.save, null, 2), "Save JSON do Modo Exploração copiado!");
		},

		// =======================================================================
		// ABA 6: VERSUS P2P & SISTEMA
		// =======================================================================
		updateVersusInspector() {
			const hasVs = typeof VersusMode !== "undefined";
			const roomEl = document.getElementById("gc-dbg-vs-room");
			const roleEl = document.getElementById("gc-dbg-vs-role");
			const qEl = document.getElementById("gc-dbg-vs-queue");
			const locEl = document.getElementById("gc-dbg-vs-local");
			const remEl = document.getElementById("gc-dbg-vs-remote");
			const mulEl = document.getElementById("gc-dbg-vs-mulligan");

			if (hasVs) {
				const isOpen = !!(VersusMode.conn && VersusMode.conn.open);
				if (roomEl) roomEl.innerText = `${VersusMode.roomCode || "Sem Sala"} (${isOpen ? "🟢 Conectado" : "⚪ Offline"})`;
				if (roleEl) roleEl.innerText = `${VersusMode.isHost ? "👑 Host" : "👤 Guest"} | Seq: ${VersusMode.turnSeq || 0}`;
				if (qEl) qEl.innerText = `${(VersusMode.packetQueue || []).length} pcts | Exec: ${VersusMode.isActionExecuting ? "SIM" : "NÃO"}`;
				if (locEl) {
					const av = typeof VersusMode.getLocalAvatar === "function" ? VersusMode.getLocalAvatar() : VersusMode.localAvatar;
					locEl.innerText = `${VersusMode.localPlayerName || "-"} (${(av || "").split("/").pop()})`;
				}
				if (remEl) {
					remEl.innerText = `${VersusMode.remotePlayerName || "-"} (${(VersusMode.remoteAvatar || "").split("/").pop()})`;
				}
				if (mulEl) {
					mulEl.innerText = `Eu: ${VersusMode.localMulliganDone ? "✓" : "⏳"} | Op: ${VersusMode.remoteMulliganDone ? "✓" : "⏳"}`;
				}
			}

			const scrEl = document.getElementById("gc-dbg-sys-screen");
			const vpEl = document.getElementById("gc-dbg-sys-viewport");
			const stEl = document.getElementById("gc-dbg-sys-storage");

			if (scrEl) {
				const scr = (typeof ScreenManager !== "undefined" && ScreenManager.currentScreen) || document.body?.getAttribute("data-screen") || "menu";
				scrEl.innerText = scr;
			}
			if (vpEl) {
				vpEl.innerText = `${window.innerWidth}x${window.innerHeight} (@${window.devicePixelRatio || 1}x)`;
			}
			if (stEl) {
				let totalBytes = 0;
				try {
					for (let i = 0; i < localStorage.length; i++) {
						const k = localStorage.key(i);
						totalBytes += (k.length + (localStorage.getItem(k) || "").length) * 2;
					}
				} catch (e) { }
				stEl.innerText = `${(totalBytes / 1024).toFixed(1)} KB (${localStorage.length} chaves)`;
			}
		},

		versusForceTurnSync() {
			if (typeof VersusMode === "undefined" || !VersusMode.conn || !VersusMode.conn.open) {
				this.showToast("Conexão Versus P2P não está aberta.");
				return;
			}
			if (VersusMode.isHost && typeof VersusMode.broadcastTurnSync === "function") {
				VersusMode.broadcastTurnSync();
				this.showToast("🔄 Host enviou broadcastTurnSync()!");
			} else if (typeof VersusMode.sendPacket === "function") {
				VersusMode.sendPacket("REQ_TURN_SYNC", {});
				this.showToast("🔄 Guest solicitou REQ_TURN_SYNC ao Host!");
			}
		},

		versusForceLobbySync() {
			if (typeof VersusMode !== "undefined" && typeof VersusMode.sendLobbySync === "function") {
				VersusMode.sendLobbySync();
				this.showToast("📨 Pacote LOBBY_SYNC enviado!");
			}
		},

		versusClearPacketQueue() {
			if (typeof VersusMode === "undefined") return;
			VersusMode.packetQueue = [];
			VersusMode.isProcessingQueue = false;
			VersusMode.isActionExecuting = false;
			this.updateVersusInspector();
			this.showToast("🧹 Fila de pacotes P2P limpa e destravada!");
		},

		copyVersusDiagnostic() {
			if (typeof VersusMode === "undefined") return;
			const dump = {
				isActive: VersusMode.isActive,
				isHost: VersusMode.isHost,
				roomCode: VersusMode.roomCode,
				connOpen: !!(VersusMode.conn && VersusMode.conn.open),
				localPlayerName: VersusMode.localPlayerName,
				remotePlayerName: VersusMode.remotePlayerName,
				localFaction: VersusMode.localFaction,
				remoteFaction: VersusMode.remoteFaction,
				localAvatar: typeof VersusMode.getLocalAvatar === "function" ? VersusMode.getLocalAvatar() : VersusMode.localAvatar,
				remoteAvatar: VersusMode.remoteAvatar,
				localReady: VersusMode.localReady,
				remoteReady: VersusMode.remoteReady,
				localMulliganDone: VersusMode.localMulliganDone,
				remoteMulliganDone: VersusMode.remoteMulliganDone,
				turnSeq: VersusMode.turnSeq,
				isProcessingQueue: VersusMode.isProcessingQueue,
				isActionExecuting: VersusMode.isActionExecuting,
				packetQueueLength: (VersusMode.packetQueue || []).length
			};
			this.copyText(JSON.stringify(dump, null, 2), "Estado P2P do Modo Versus copiado!");
		},

		sysUnlockAllAchievements() {
			if (typeof Achievements !== "undefined" && Achievements.LIST) {
				Object.keys(Achievements.LIST).forEach(id => {
					if (typeof Achievements.unlock === "function") Achievements.unlock(id);
				});
				this.showToast("🏆 Todas as conquistas foram desbloqueadas!");
			}
		},

		sysResetAchievements() {
			if (typeof Achievements !== "undefined") {
				localStorage.removeItem("gwent_achievements");
				localStorage.removeItem("gwent_stats");
				if (typeof Achievements.init === "function") Achievements.init();
				this.showToast("🔄 Conquistas resetadas.");
			}
		},

		// =======================================================================
		// RELATÓRIO COMPLETO DE DIAGNÓSTICO (SNAPSHOT + LOGS)
		// =======================================================================
		buildFullDiagnosticReport() {
			const lines = [];
			lines.push("=====================================================================");
			lines.push("GWENT CLASSIC — RELATÓRIO DE DIAGNÓSTICO E DEPURAÇÃO");
			lines.push(`Data/Hora: ${new Date().toLocaleString()}`);
			lines.push(`Viewport: ${window.innerWidth}x${window.innerHeight} | FPS: ${this.currentFps}`);
			lines.push("=====================================================================\n");

			// 1. Estado do Duelo
			lines.push("--- [1] ESTADO DO DUELO & TABULEIRO ---");
			if (typeof game !== "undefined" && game && typeof player_me !== "undefined" && player_me) {
				lines.push(`Rodada: ${game.roundCount} | Turno de: ${game.currPlayer === player_me ? "Jogador" : "Oponente"}`);
				lines.push(`Locks: isActionInProgress=${!!game.isActionInProgress}, isCardBeingPlayed=${!!game.isCardBeingPlayed}, me.isPlayingCard=${!!player_me.isPlayingCard}, placedEffectsActive=${!!game.placedEffectsActive}`);
				lines.push(`Jogador (${player_me.name}): ❤️${player_me.health} | Total=${player_me.total} | Passou=${!!player_me.passed} | Mão=${player_me.hand?.cards?.length || 0} | Deck=${player_me.deck?.cards?.length || 0} | Cemitério=${player_me.grave?.cards?.length || 0}`);
				if (typeof player_op !== "undefined" && player_op) {
					lines.push(`Oponente (${player_op.name}): ❤️${player_op.health} | Total=${player_op.total} | Passou=${!!player_op.passed} | Mão=${player_op.hand?.cards?.length || 0} | Deck=${player_op.deck?.cards?.length || 0} | Cemitério=${player_op.grave?.cards?.length || 0}`);
				}
				if (typeof board !== "undefined" && board?.row) {
					const rNames = ["Op_Siege(0)", "Op_Ranged(1)", "Op_Close(2)", "Me_Close(3)", "Me_Ranged(4)", "Me_Siege(5)"];
					board.row.forEach((r, i) => {
						const cNames = (r.cards || []).map(c => `${c.name}(${c.power})`).join(", ");
						const spName = r.special ? ` [Special: ${r.special.name}]` : "";
						lines.push(`  ${rNames[i]}: Total=${r.total}${spName} => [${cNames}]`);
					});
				}
			} else {
				lines.push("Fora de partida.");
			}

			// 2. Estado Versus P2P
			if (typeof VersusMode !== "undefined" && (VersusMode.isActive || (VersusMode.conn && VersusMode.conn.open))) {
				lines.push("\n--- [2] ESTADO MODO VERSUS P2P ---");
				lines.push(`Sala: ${VersusMode.roomCode} | Host: ${VersusMode.isHost} | Conectado: ${!!(VersusMode.conn && VersusMode.conn.open)} | TurnSeq: ${VersusMode.turnSeq}`);
				lines.push(`Avatares: Local=${VersusMode.localAvatar} | Remoto=${VersusMode.remoteAvatar}`);
				lines.push(`Fila P2P: ${(VersusMode.packetQueue || []).length} pacotes | isProcessingQueue=${VersusMode.isProcessingQueue} | isActionExecuting=${VersusMode.isActionExecuting}`);
			}

			// 3. Ações Selecionadas ou Recentes
			const feedList = MatchTracker.selectedIds.size > 0
				? MatchTracker.events.filter(e => MatchTracker.selectedIds.has(e.id))
				: MatchTracker.events.slice(-40);
			lines.push(`\n--- [3] HISTÓRICO DE COMBATE (${MatchTracker.selectedIds.size > 0 ? "SELECIONADOS" : "ÚLTIMOS " + feedList.length}) ---`);
			feedList.forEach(e => lines.push(MatchTracker.formatEntryText(e, true)));

			// 4. Console Logs Selecionados ou Recentes
			const logList = this.selectedLogIds.size > 0
				? this.logs.filter(l => this.selectedLogIds.has(l.id))
				: this.logs.slice(-50);
			lines.push(`\n--- [4] CONSOLE LOGS (${this.selectedLogIds.size > 0 ? "SELECIONADOS" : "ÚLTIMOS " + logList.length}) ---`);
			logList.forEach(l => lines.push(this.formatLogEntryText(l, true)));

			return lines.join("\n");
		},

		copyFullDiagnosticReport() {
			const report = this.buildFullDiagnosticReport();
			this.copyText(report, "🩺 Relatório completo de diagnóstico copiado para a área de transferência!");
		},

		// =======================================================================
		// UTILITÁRIOS DE CÓPIA E TOAST
		// =======================================================================
		copyText(text, successMsg) {
			if (typeof copyToClipboard === "function") {
				copyToClipboard(text).then((ok) => {
					if (ok) this.showToast(successMsg);
					else this.fallbackCopy(text, successMsg);
				}).catch(() => {
					this.fallbackCopy(text, successMsg);
				});
			} else if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
				navigator.clipboard.writeText(text).then(() => {
					this.showToast(successMsg);
				}).catch(() => {
					this.fallbackCopy(text, successMsg);
				});
			} else {
				this.fallbackCopy(text, successMsg);
			}
		},

		fallbackCopy(text, successMsg) {
			const ta = document.createElement("textarea");
			ta.value = text;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			try {
				document.execCommand("copy");
				this.showToast(successMsg);
			} catch (e) {
				this.showToast("Não foi possível copiar.");
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
			}, 2300);
		},

		enableDebugMode(silent = false) {
			this.isEnabled = true;
			try {
				localStorage.setItem("gc_debug_mode_enabled", "true");
			} catch (e) { }

			const toggleBtn = document.getElementById("gc-debug-toggle-btn");
			if (toggleBtn) toggleBtn.style.display = "inline-flex";

			if (!silent) {
				this.showToast("🛠️ Modo Desenvolvedor Ativado! Painel de Debug liberado (F2, ~ ou botão 🐞).");
			}
			MatchTracker.log("system", "🛠️", "Sistema", "Modo Desenvolvedor / Debug ativado pelo usuário.");
		},

		disableDebugMode(silent = false) {
			this.isEnabled = false;
			try {
				localStorage.removeItem("gc_debug_mode_enabled");
			} catch (e) { }

			const toggleBtn = document.getElementById("gc-debug-toggle-btn");
			if (toggleBtn) toggleBtn.style.display = "none";

			this.close();
			this.hideErrorBanner();

			if (!silent) {
				this.showToast("🔒 Modo Desenvolvedor Desativado.");
			}
			MatchTracker.log("system", "🔒", "Sistema", "Modo Desenvolvedor / Debug desativado.");
		},

		toggleDebugMode() {
			if (this.isEnabled) {
				this.disableDebugMode();
			} else {
				this.enableDebugMode();
			}
		}
	};

	window.GwentDebugger = GwentDebugger;
	window.MatchTracker = MatchTracker;
	window.Debugger = MatchTracker;
	GwentDebugger.init();
})();
