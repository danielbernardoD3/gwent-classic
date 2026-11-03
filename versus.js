/* ==========================================================================
   GWENT CLASSIC: VERSUS MODE (MODO VERSUS / PvP) & TURN/MULLIGAN TIMERS
   P2P WebRTC Multiplayer via PeerJS com Árbitro Autoritário e Sincronização Total
   ========================================================================== */

"use strict";

/**
 * Controller para o jogador oponente remoto no Modo Versus.
 * Substitui o ControllerAI quando em partida PvP.
 */
class ControllerPeer {
	constructor(player) {
		this.player = player;
		this.nextMedicTargets = [];
		this.nextMedicTarget = null;
		this.nextLeaderData = null;
	}

	async startTurn(player) {
		// No modo Versus, o oponente é humano remoto.
		// Atualizamos o HUD e aguardamos a mensagem P2P de jogada do peer.
		VersusMode.updateTurnHUD(false);
	}

	redraw() {
		// Redraw do oponente é gerenciado no fluxo sincronizado (MULLIGAN_SYNC)
	}

	async handleRemotePlayCard(data) {
		if (!this.player || !this.player.hand) return;

		VersusMode.stopTurnTimer();
		VersusMode.isActionExecuting = true;
		VersusMode.actionStartTime = Date.now();
		let turnCompleted = false;

		try {
			// 1. Localiza a carta na mão do oponente pelo nome ou índice
			let card = null;
			let cardIdx = -1;
			if (data.cardName) {
				cardIdx = this.player.hand.cards.findIndex(c => c.name === data.cardName);
			}
			if (cardIdx !== -1) {
				card = this.player.hand.cards[cardIdx];
			} else if (data.cardIndex !== undefined && this.player.hand.cards[data.cardIndex]) {
				card = this.player.hand.cards[data.cardIndex];
			}

			// Fallback de segurança: se por acaso a mão divergiu, busca do baralho ou instancia
			if (!card) {
				if (data.cardName) {
					const inDeckIdx = this.player.deck.cards.findIndex(c => c.name === data.cardName);
					if (inDeckIdx !== -1) {
						card = this.player.deck.cards[inDeckIdx];
						this.player.deck.removeCard(card);
						this.player.hand.addCard(card);
					} else {
						const cData = card_dict.find(c => c.name === data.cardName) || card_dict[0];
						card = new Card(cData, this.player);
						this.player.hand.addCard(card);
					}
				} else if (this.player.hand.cards.length > 0) {
					card = this.player.hand.cards[0];
				}
			}

			if (!card) return;

			// 2. Trata habilidade de Isca (Decoy) nas fileiras do oponente (0..2)
			if (card.abilities && card.abilities.includes("decoy") && data.decoyTargetName) {
				let swappedCard = null;
				let sourceRow = null;
				// Busca primeiro nas fileiras do oponente (0, 1, 2)
				for (let r = 0; r < 3; r++) {
					const rowObj = board.row[r];
					const found = rowObj.cards.find(c => c.name === data.decoyTargetName && c.isUnit());
					if (found) {
						swappedCard = found;
						sourceRow = rowObj;
						break;
					}
				}
				// Fallback caso não encontre nas 3 primeiras
				if (!swappedCard) {
					for (let r = 0; r < 6; r++) {
						const rowObj = board.row[r];
						const found = rowObj.cards.find(c => c.name === data.decoyTargetName);
						if (found) {
							swappedCard = found;
							sourceRow = rowObj;
							break;
						}
					}
				}
				if (swappedCard && sourceRow) {
					ui.showPreviewVisuals(card);
					await sleep(900);
					ui.hidePreview(card);
					await board.toHand(swappedCard, sourceRow);
					await board.moveTo(card, sourceRow, this.player.hand);
					VersusMode.recalcAllScores();
					this.player.hand.resize();
					this.player.deck.resize();
					this.player.endTurn();
					turnCompleted = true;
					return;
				}
			}

			// 3. Trata Queimadura (Scorch)
			if (card.name === "Scorch" || data.rowType === "scorch") {
				await this.player.playScorch(card);
				VersusMode.recalcAllScores();
				this.player.hand.resize();
				this.player.deck.resize();
				turnCompleted = true;
				return;
			}

			// 4. Salva alvos de médico (suporta fila de médicos em cadeia e escolha de fileira ágil)
			this.nextMedicTargets = [];
			if (Array.isArray(data.medicTargets) && data.medicTargets.length > 0) {
				this.nextMedicTargets = [...data.medicTargets];
			} else if (data.medicTargetName) {
				this.nextMedicTargets.push({
					name: data.medicTargetName,
					rowType: data.medicRowType || null
				});
			}
			this.nextMedicTarget = data.medicTargetName || (this.nextMedicTargets[0] ? this.nextMedicTargets[0].name : null);

			// 5. Determina a fileira de destino simétrica para o oponente
			let targetRow = null;
			if (data.rowType === "weather" || card.row === "weather") {
				targetRow = weather;
			} else {
				const rowType = data.rowType || (card.row === "agile" ? "close" : card.row);
				targetRow = board.getRow(card, rowType, this.player);
			}

			// 6. Joga a carta na mesa
			if (targetRow) {
				await this.player.playCardToRow(card, targetRow);
			} else {
				await this.player.playCard(card);
			}
			turnCompleted = true;

			// 7. Recalcula pontuações e contadores de mão/baralho com precisão
			VersusMode.recalcAllScores();
			this.player.hand.resize();
			this.player.deck.resize();
		} catch (err) {
			console.error("[ControllerPeer] Erro ao executar handleRemotePlayCard:", err);
		} finally {
			VersusMode.recalcAllScores();
			if (this.player && this.player.hand) this.player.hand.resize();
			if (this.player && this.player.deck) this.player.deck.resize();
			if (!turnCompleted && this.player) {
				console.warn("[ControllerPeer] Forçando this.player.endTurn() no bloco finally.");
				this.player.endTurn();
			}
			VersusMode.isActionExecuting = false;
			if (VersusMode.pendingTurnSync) {
				const sync = VersusMode.pendingTurnSync;
				VersusMode.pendingTurnSync = null;
				VersusMode.onTurnSyncReceived(sync);
			}
		}
	}

	async handleRemotePass(data) {
		VersusMode.stopTurnTimer();
		VersusMode.isActionExecuting = true;
		VersusMode.actionStartTime = Date.now();
		try {
			if (this.player && !this.player.passed) {
				VersusMode.recalcAllScores();
				this.player.passRound();
			}
		} catch (err) {
			console.error("[ControllerPeer] Erro ao executar handleRemotePass:", err);
		} finally {
			VersusMode.isActionExecuting = false;
			if (VersusMode.pendingTurnSync) {
				const sync = VersusMode.pendingTurnSync;
				VersusMode.pendingTurnSync = null;
				VersusMode.onTurnSyncReceived(sync);
			}
		}
	}

	async handleRemoteLeader(data) {
		VersusMode.stopTurnTimer();
		VersusMode.isActionExecuting = true;
		VersusMode.actionStartTime = Date.now();
		let turnCompleted = false;
		try {
			if (this.player && this.player.leaderAvailable) {
				this.nextLeaderData = data || {};
				await this.player.activateLeader();
				this.nextLeaderData = null;
				turnCompleted = true;
			}
		} catch (err) {
			console.error("[ControllerPeer] Erro ao executar handleRemoteLeader:", err);
		} finally {
			VersusMode.recalcAllScores();
			if (this.player && this.player.hand) this.player.hand.resize();
			if (this.player && this.player.deck) this.player.deck.resize();
			if (!turnCompleted && this.player && this.player.leaderAvailable) {
				this.player.disableLeader();
				this.player.endTurn();
			}
			VersusMode.isActionExecuting = false;
			if (VersusMode.pendingTurnSync) {
				const sync = VersusMode.pendingTurnSync;
				VersusMode.pendingTurnSync = null;
				VersusMode.onTurnSyncReceived(sync);
			}
		}
	}
}

/**
 * Gerenciador principal do Modo Versus (Lobby, P2P, Sincronização, Árbitro)
 * e dos Temporizadores de Jogo (30s Mulligan e 1:00 Turno com Auto-Play).
 */
class VersusMode {
	static isActive = false;
	static isHost = false;
	static peer = null;
	static conn = null;
	static roomCode = "";

	static localPlayerName = "Geralt";
	static localFaction = "realms";
	static localLeaderIndex = 0;
	static localReady = false;
	static localDeckData = null;

	static remotePlayerName = "Adversário";
	static remoteFaction = "nilfgaard";
	static remoteLeaderIndex = 0;
	static remoteReady = false;
	static remoteDeckData = null;
	static remoteDeckCards = null;

	static hostDeckOrder = null;
	static guestDeckOrder = null;

	static isCustomizingDeck = false;
	static isFirstTurn = false;
	static pendingMedicTarget = null;
	static pendingMedicTargets = [];
	static pendingLeaderData = null;
	static pendingRoundResults = {};
	static lastRoundResult = null;

	static localMulliganDone = false;
	static remoteMulliganDone = false;
	static scoiataelChoiceReceived = null;

	static rematchRequestedByMe = false;
	static rematchRequestedByRemote = false;
	static initialized = false;

	// Temporizadores (Mulligan 30s e Turno 60s)
	static MULLIGAN_SECONDS = 30;
	static TURN_SECONDS = 60;
	static mulliganInterval = null;
	static mulliganTimeLeft = 30;
	static turnInterval = null;
	static turnTimeLeft = 60;
	static isHandlingTimeout = false;
	static turnSeq = 0;
	static lastTurnSyncTime = 0;
	static packetQueue = [];
	static isProcessingQueue = false;
	static isActionExecuting = false;
	static actionStartTime = 0;
	static pendingTurnSync = null;
	static watchdogInterval = null;

	// Inicia o módulo e vincula eventos da UI
	static init() {
		if (VersusMode.initialized) return;
		const modal = document.getElementById("versus-lobby-modal");
		if (!modal) return;
		VersusMode.initialized = true;

		// Carrega nickname salvo
		const savedName = (localStorage.getItem("gc-player-name") || "").trim();
		if (savedName) {
			VersusMode.localPlayerName = savedName;
		}

		// Vincula campo de Nickname do jogador
		const nameInput = document.getElementById("versus-input-player-name");
		if (nameInput) {
			nameInput.value = VersusMode.localPlayerName;
			let saveBadgeTimeout = null;
			const applyNameUpdate = () => {
				const raw = nameInput.value.replace(/[<>]/g, "").trim();
				const finalName = raw.length > 0 ? raw.slice(0, 22) : "Geralt";
				VersusMode.localPlayerName = finalName;
				localStorage.setItem("gc-player-name", finalName);

				const meNameCard = document.getElementById("versus-p1-name");
				if (meNameCard) meNameCard.innerText = finalName;

				const boardNameMe = document.getElementById("name-me");
				if (boardNameMe) boardNameMe.innerText = finalName;

				const savedBadge = document.getElementById("versus-nickname-saved");
				if (savedBadge) {
					savedBadge.classList.add("show");
					if (saveBadgeTimeout) clearTimeout(saveBadgeTimeout);
					saveBadgeTimeout = setTimeout(() => savedBadge.classList.remove("show"), 1600);
				}

				if (VersusMode.conn && VersusMode.conn.open && !VersusMode.isActive) {
					const localDeck = VersusMode.constructLocalDeck();
					VersusMode.sendPacket("LOBBY_SYNC", {
						name: VersusMode.localPlayerName,
						faction: VersusMode.localFaction,
						leaderIndex: VersusMode.localLeaderIndex,
						ready: VersusMode.localReady,
						deck: localDeck,
						deckCards: localDeck.cards
					});
				}
			};

			nameInput.addEventListener("input", applyNameUpdate);
			nameInput.addEventListener("blur", () => {
				if (!nameInput.value.trim()) {
					nameInput.value = VersusMode.localPlayerName || "Geralt";
				}
				applyNameUpdate();
			});
			nameInput.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					nameInput.blur();
				}
			});
		}

		// Vincula abas Criar vs Entrar
		const tabHost = document.getElementById("tab-versus-host");
		const tabJoin = document.getElementById("tab-versus-join");
		const panelHost = document.getElementById("panel-versus-host");
		const panelJoin = document.getElementById("panel-versus-join");

		if (tabHost && tabJoin && panelHost && panelJoin) {
			tabHost.addEventListener("click", () => {
				tabHost.classList.add("active");
				tabJoin.classList.remove("active");
				panelHost.classList.add("active");
				panelJoin.classList.remove("active");
				VersusMode.createRoom();
			});

			tabJoin.addEventListener("click", () => {
				tabJoin.classList.add("active");
				tabHost.classList.remove("active");
				panelJoin.classList.add("active");
				panelHost.classList.remove("active");
				const errElem = document.getElementById("versus-join-error");
				if (errElem) errElem.innerText = "";
				VersusMode.cleanupPeer();
			});
		}

		// Input de código: transforma em maiúsculas automaticamente
		const inputCode = document.getElementById("versus-input-room-code");
		if (inputCode) {
			inputCode.addEventListener("input", (e) => {
				e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, "");
			});
			inputCode.addEventListener("keydown", (e) => {
				if (e.key === "Enter") VersusMode.joinRoom();
			});
		}
	}

	// Gera um código de sala amigável de 6 caracteres (ex: GW-7482)
	static generateRoomCode() {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
		let code = "GW-";
		for (let i = 0; i < 4; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return code;
	}

	// Traduz objeto Row em string identificadora ("close"|"ranged"|"siege"|"weather")
	static getRowTypeFromRow(row) {
		if (typeof weather !== "undefined" && row === weather) return "weather";
		if (typeof board !== "undefined" && board.row) {
			if (row === board.row[3] || row === board.row[2]) return "close";
			if (row === board.row[4] || row === board.row[1]) return "ranged";
			if (row === board.row[5] || row === board.row[0]) return "siege";
		}
		return "close";
	}

	// Recalcula todas as fileiras e totais de forma limpa sem corromper deltas
	static recalcAllScores() {
		if (typeof board === "undefined" || !board || !board.row) return;
		for (let i = 0; i < 6; i++) {
			if (board.row[i]) {
				board.row[i].updateScore();
			}
		}
		board.updateLeader();
	}

	// Abre o modal do Lobby a partir do Menu Principal
	static openLobby() {
		if (!VersusMode.initialized) {
			VersusMode.init();
		}

		const modal = document.getElementById("versus-lobby-modal");
		if (!modal) {
			console.error("Modal #versus-lobby-modal não encontrado no DOM!");
			return;
		}

		// Carrega nome do jogador
		const savedName = (localStorage.getItem("gc-player-name") || "Geralt").trim() || "Geralt";
		VersusMode.localPlayerName = savedName;
		const nameInput = document.getElementById("versus-input-player-name");
		if (nameInput) {
			nameInput.value = savedName;
			nameInput.disabled = false;
		}

		// Carrega facção atual do DeckMaker
		if (window.dm && window.dm.faction) {
			VersusMode.localFaction = window.dm.faction;
			VersusMode.localLeaderIndex = window.dm.leader ? window.dm.leader.index : 0;
		}

		modal.classList.remove("hide");

		// Exibe painel inicial de abas e oculta o pré-lobby
		const tabs = document.querySelector(".versus-tabs");
		const panelsWrap = document.getElementById("versus-initial-panels");
		const prematchPanel = document.getElementById("versus-prematch-panel");

		if (tabs) tabs.style.display = "flex";
		if (panelsWrap) panelsWrap.style.display = "block";
		if (prematchPanel) prematchPanel.classList.remove("active");

		// Por padrão, abre na aba Criar Sala
		const tabHost = document.getElementById("tab-versus-host");
		if (tabHost) tabHost.click();

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	// Fecha o lobby e limpa conexões (garantindo retorno seguro ao Menu Principal se necessário)
	static closeLobby() {
		VersusMode.cleanupPeer();
		const modal = document.getElementById("versus-lobby-modal");
		if (modal) modal.classList.add("hide");

		// Evita tela preta caso o jogador estivesse voltando de uma partida para a sala e clicou no X
		const mainGame = document.querySelector("main");
		const deckCustom = document.getElementById("deck-customization");
		const mainMenu = document.getElementById("main-menu");
		if (
			(!mainGame || mainGame.classList.contains("hide")) &&
			(!deckCustom || deckCustom.classList.contains("hide")) &&
			mainMenu && mainMenu.classList.contains("hide")
		) {
			if (typeof MenuController !== "undefined") {
				MenuController.returnToMainMenu();
			} else {
				mainMenu.classList.remove("hide");
			}
		}

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_back");
		}
	}

	// Sai da sala pré-jogo e volta para as abas Criar/Entrar sem fechar o modal Versus
	static leaveRoomToInitialLobby() {
		VersusMode.cleanupPeer();

		const tabs = document.querySelector(".versus-tabs");
		const panelsWrap = document.getElementById("versus-initial-panels");
		const prematchPanel = document.getElementById("versus-prematch-panel");
		const nameInput = document.getElementById("versus-input-player-name");

		if (nameInput) nameInput.disabled = false;
		if (tabs) tabs.style.display = "flex";
		if (panelsWrap) panelsWrap.style.display = "block";
		if (prematchPanel) prematchPanel.classList.remove("active");

		const tabHost = document.getElementById("tab-versus-host");
		if (tabHost) tabHost.click();

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_back");
		}
	}

	// Limpa instâncias do PeerJS
	static cleanupPeer() {
		if (VersusMode.conn) {
			try { VersusMode.conn.close(); } catch (e) {}
			VersusMode.conn = null;
		}
		if (VersusMode.peer) {
			try { VersusMode.peer.destroy(); } catch (e) {}
			VersusMode.peer = null;
		}
		VersusMode.roomCode = "";
		VersusMode.localReady = false;
		VersusMode.remoteReady = false;
		VersusMode.isHost = false;
		VersusMode.pendingRoundResults = {};
		VersusMode.resetEmotesUI();
	}

	// -------------------------------------------------------------
	// FLUXO DO HOST: CRIAR SALA
	// -------------------------------------------------------------
	static createRoom() {
		VersusMode.cleanupPeer();
		VersusMode.isHost = true;
		VersusMode.roomCode = VersusMode.generateRoomCode();

		const codeElem = document.getElementById("versus-host-code");
		if (codeElem) codeElem.innerText = VersusMode.roomCode;

		const statusElem = document.getElementById("versus-host-status");
		if (statusElem) statusElem.innerText = "Aguardando oponente conectar...";

		const peerId = "gwentclassic-room-" + VersusMode.roomCode.toLowerCase().replace(/[^a-z0-9]/g, "");

		const PeerClass = window.Peer || (typeof Peer !== "undefined" ? Peer : null);
		if (!PeerClass) {
			console.error("PeerJS não carregado no window!");
			if (statusElem) statusElem.innerText = "Biblioteca PeerJS não encontrada.";
			return;
		}

		try {
			VersusMode.peer = new PeerClass(peerId, { debug: 1 });

			VersusMode.peer.on("open", () => {
				console.log("Sala criada com sucesso! Código:", VersusMode.roomCode);
			});

			VersusMode.peer.on("connection", (c) => {
				console.log("Oponente conectou-se à sala!");
				VersusMode.conn = c;
				VersusMode.setupConnectionHandlers();
				if (VersusMode.isReconnecting) {
					VersusMode.onReconnectionSuccessful();
				}
			});

			VersusMode.peer.on("error", (err) => {
				console.warn("Erro no Peer Host:", err);
				if (err.type === "unavailable-id") {
					VersusMode.createRoom();
				} else if (statusElem) {
					statusElem.innerText = "Erro ao conectar ao serviço P2P. Tente novamente.";
				}
			});
		} catch (e) {
			console.error("Falha ao inicializar PeerJS:", e);
		}
	}

	// Copia o código da sala para a área de transferência
	static copyRoomCode() {
		if (!VersusMode.roomCode) return;
		navigator.clipboard.writeText(VersusMode.roomCode).then(() => {
			const btn = document.getElementById("btn-versus-copy");
			if (btn) {
				btn.classList.add("copied");
				btn.innerHTML = "<span>✓</span><span>Copiado!</span>";
				setTimeout(() => {
					btn.classList.remove("copied");
					btn.innerHTML = "<span>📋</span><span>Copiar Código</span>";
				}, 2200);
			}
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_click");
			}
		}).catch(err => {
			console.error("Erro ao copiar:", err);
		});
	}

	// -------------------------------------------------------------
	// FLUXO DO CONVIDADO: ENTRAR EM SALA
	// -------------------------------------------------------------
	static joinRoom() {
		const input = document.getElementById("versus-input-room-code");
		const errElem = document.getElementById("versus-join-error");
		if (!input) return;

		// Garante que o nickname digitado seja salvo antes de conectar
		const nameInput = document.getElementById("versus-input-player-name");
		if (nameInput && nameInput.value.trim()) {
			VersusMode.localPlayerName = nameInput.value.replace(/[<>]/g, "").trim().slice(0, 22);
			localStorage.setItem("gc-player-name", VersusMode.localPlayerName);
		}

		const code = input.value.trim().toUpperCase();
		if (code.length < 4) {
			if (errElem) errElem.innerText = "Por favor, digite um código de sala válido.";
			return;
		}

		if (errElem) errElem.innerText = "Conectando ao adversário...";
		VersusMode.cleanupPeer();
		VersusMode.isHost = false;
		VersusMode.roomCode = code;

		const targetPeerId = "gwentclassic-room-" + code.toLowerCase().replace(/[^a-z0-9]/g, "");

		const PeerClass = window.Peer || (typeof Peer !== "undefined" ? Peer : null);
		if (!PeerClass) {
			console.error("PeerJS não carregado no window!");
			if (errElem) errElem.innerText = "Biblioteca PeerJS não encontrada.";
			return;
		}

		try {
			VersusMode.peer = new PeerClass({ debug: 1 });

			VersusMode.peer.on("open", () => {
				console.log("Conectando ao host:", targetPeerId);
				const c = VersusMode.peer.connect(targetPeerId, { reliable: true });
				VersusMode.conn = c;
				VersusMode.setupConnectionHandlers();
			});

			VersusMode.peer.on("error", (err) => {
				console.warn("Erro ao conectar no Peer Convidado:", err);
				if (errElem) errElem.innerText = "Não foi possível encontrar a sala. Verifique o código e tente novamente.";
			});
		} catch (e) {
			console.error("Falha no PeerJS:", e);
			if (errElem) errElem.innerText = "Erro ao iniciar conexão P2P.";
		}
	}

	// -------------------------------------------------------------
	// CONFIGURAÇÃO DOS CANAIS P2P (MENSAGENS)
	// -------------------------------------------------------------
	static setupConnectionHandlers() {
		if (!VersusMode.conn) return;

		const onChannelOpen = () => {
			console.log("Canal P2P Aberto com sucesso!");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_confirm");
			}

			// Garante sincronia do nickname atual do input
			const nameInput = document.getElementById("versus-input-player-name");
			if (nameInput && nameInput.value.trim()) {
				VersusMode.localPlayerName = nameInput.value.replace(/[<>]/g, "").trim().slice(0, 22);
				localStorage.setItem("gc-player-name", VersusMode.localPlayerName);
			}

			// Abre a Sala de Preparação
			VersusMode.openPreMatchLobby();

			// Envia informações locais e baralho atual para o oponente
			const localDeck = VersusMode.constructLocalDeck();
			VersusMode.sendPacket("LOBBY_SYNC", {
				name: VersusMode.localPlayerName,
				faction: VersusMode.localFaction,
				leaderIndex: VersusMode.localLeaderIndex,
				ready: false,
				deck: localDeck,
				deckCards: localDeck.cards
			});
		};

		if (VersusMode.conn.open) {
			onChannelOpen();
		} else {
			VersusMode.conn.on("open", onChannelOpen);
		}

		VersusMode.conn.on("data", (data) => {
			VersusMode.handleIncomingPacket(data);
		});

		VersusMode.conn.on("close", () => {
			console.log("Conexão P2P fechada pelo adversário.");
			VersusMode.onPeerDisconnected();
		});

		VersusMode.conn.on("error", (err) => {
			console.error("Erro na conexão P2P:", err);
		});
	}

	static sendPacket(type, payload = {}) {
		if (!VersusMode.conn || !VersusMode.conn.open) return;
		try {
			VersusMode.conn.send({ type, payload });
		} catch (e) {
			console.error("Erro ao enviar pacote P2P:", e);
		}
	}

	// -------------------------------------------------------------
	// SALA DE PREPARAÇÃO (PRE-MATCH LOBBY)
	// -------------------------------------------------------------
	static openPreMatchLobby() {
		const tabs = document.querySelector(".versus-tabs");
		const panelsWrap = document.getElementById("versus-initial-panels");
		const prematchPanel = document.getElementById("versus-prematch-panel");

		if (tabs) tabs.style.display = "none";
		if (panelsWrap) panelsWrap.style.display = "none";
		if (prematchPanel) prematchPanel.classList.add("active");

		VersusMode.localReady = false;
		VersusMode.remoteReady = false;

		VersusMode.updatePreMatchUI();
	}

	static updatePreMatchUI() {
		// Bloqueia edição de nickname apenas quando já marcou PRONTO
		const nameInput = document.getElementById("versus-input-player-name");
		if (nameInput) {
			nameInput.disabled = !!VersusMode.localReady;
		}

		// Jogador Local
		const meName = document.getElementById("versus-p1-name");
		const meCrest = document.getElementById("versus-p1-crest");
		const meFaction = document.getElementById("versus-p1-faction");
		const meStatus = document.getElementById("versus-p1-status");
		const meCard = document.getElementById("versus-p1-card");

		if (meName) meName.innerText = VersusMode.localPlayerName;
		if (meFaction && factions[VersusMode.localFaction]) {
			meFaction.innerText = factions[VersusMode.localFaction].name;
		}
		if (meCrest) {
			meCrest.style.backgroundImage = `url('img/icons/deck_shield_${VersusMode.localFaction}.png')`;
		}
		if (meStatus) {
			meStatus.innerText = VersusMode.localReady ? "✓ PRONTO" : "Preparando Baralho...";
			meStatus.className = "versus-player-status" + (VersusMode.localReady ? " is-ready" : "");
		}
		if (meCard) {
			meCard.className = "versus-player-card" + (VersusMode.localReady ? " ready" : "");
		}

		// Jogador Remoto
		const opName = document.getElementById("versus-p2-name");
		const opCrest = document.getElementById("versus-p2-crest");
		const opFaction = document.getElementById("versus-p2-faction");
		const opStatus = document.getElementById("versus-p2-status");
		const opCard = document.getElementById("versus-p2-card");

		if (opName) opName.innerText = VersusMode.remotePlayerName;
		if (opFaction && factions[VersusMode.remoteFaction]) {
			opFaction.innerText = factions[VersusMode.remoteFaction].name;
		}
		if (opCrest) {
			opCrest.style.backgroundImage = `url('img/icons/deck_shield_${VersusMode.remoteFaction}.png')`;
		}
		if (opStatus) {
			opStatus.innerText = VersusMode.remoteReady ? "✓ PRONTO" : "Preparando Baralho...";
			opStatus.className = "versus-player-status" + (VersusMode.remoteReady ? " is-ready" : "");
		}
		if (opCard) {
			opCard.className = "versus-player-card" + (VersusMode.remoteReady ? " ready" : "");
		}

		// Botão Pronto
		const btnReady = document.getElementById("btn-versus-ready");
		if (btnReady) {
			btnReady.innerText = VersusMode.localReady ? "CANCELAR PRONTO" : "⚔ PRONTO";
			btnReady.className = "versus-btn-ready" + (VersusMode.localReady ? " ready-active" : "");
		}

		// Botão Iniciar Partida e Mensagens de Status
		const btnStart = document.getElementById("btn-versus-start-match");
		const hint = document.getElementById("versus-ready-hint");
		const bothReady = VersusMode.localReady && VersusMode.remoteReady;

		if (bothReady) {
			if (VersusMode.isHost) {
				if (btnStart) btnStart.classList.remove("hide");
				if (hint) {
					hint.innerText = "⚔️ Ambos os jogadores estão prontos! Clique em INICIAR PARTIDA para começar o duelo.";
					hint.className = "versus-ready-hint all-ready";
				}
			} else {
				if (btnStart) btnStart.classList.add("hide");
				if (hint) {
					hint.innerText = "✓ Ambos prontos! Aguardando o Host clicar em INICIAR PARTIDA...";
					hint.className = "versus-ready-hint all-ready";
				}
			}
		} else {
			if (btnStart) btnStart.classList.add("hide");
			if (hint) {
				hint.className = "versus-ready-hint";
				if (VersusMode.localReady) {
					hint.innerText = "Você está pronto! Aguardando o adversário confirmar PRONTO...";
				} else if (VersusMode.remoteReady) {
					hint.innerText = "O adversário já está pronto! Clique em PRONTO para liberar o início.";
				} else {
					hint.innerText = "Configure seu nickname, organize seu baralho e clique em PRONTO.";
				}
			}
		}
	}

	// Alterna o estado de Pronto
	static toggleReady() {
		const nameInput = document.getElementById("versus-input-player-name");
		if (nameInput && nameInput.value.trim()) {
			VersusMode.localPlayerName = nameInput.value.replace(/[<>]/g, "").trim().slice(0, 22);
			localStorage.setItem("gc-player-name", VersusMode.localPlayerName);
		}

		VersusMode.localReady = !VersusMode.localReady;
		VersusMode.updatePreMatchUI();

		const localDeck = VersusMode.constructLocalDeck();
		VersusMode.sendPacket("LOBBY_SYNC", {
			name: VersusMode.localPlayerName,
			faction: VersusMode.localFaction,
			leaderIndex: VersusMode.localLeaderIndex,
			ready: VersusMode.localReady,
			deck: localDeck,
			deckCards: localDeck.cards
		});

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX(VersusMode.localReady ? "witcher_confirm" : "witcher_back");
		}

		VersusMode.checkBothReady();
	}

	// Abre a tela de personalização do baralho antes da partida
	static openDeckBuilderForVersus() {
		VersusMode.isCustomizingDeck = true;
		if (typeof StoryMode !== "undefined") {
			StoryMode.isCustomizingCampaign = false;
		}

		// 1. Oculta o modal do lobby versus
		const modal = document.getElementById("versus-lobby-modal");
		if (modal) modal.classList.add("hide");

		// 2. Oculta o Menu Principal
		const mainMenu = document.getElementById("main-menu");
		if (mainMenu) mainMenu.classList.add("hide");

		// 3. Exibe tela de customização com a classe versus-deck-mode
		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.remove("hide");
			deckCustom.classList.remove("story-deck-mode");
			deckCustom.classList.add("versus-deck-mode");
		}

		// 4. Mostra botões específicos de retorno do Versus
		const btnTop = document.getElementById("btn-versus-top-back");
		if (btnTop) {
			btnTop.classList.remove("hide");
			btnTop.style.display = "inline-flex";
		}
		const btnConfirm = document.getElementById("btn-versus-deck-confirm");
		if (btnConfirm) {
			btnConfirm.classList.remove("hide");
			btnConfirm.style.display = "flex";
		}

		// 5. Oculta botões de single-player
		const btnBackMenu = document.getElementById("btn-back-to-menu");
		if (btnBackMenu) btnBackMenu.style.display = "none";
		const btnStartGame = document.getElementById("start-game");
		if (btnStartGame) btnStartGame.style.display = "none";
		const opPreview = document.getElementById("opponent-preview");
		if (opPreview) opPreview.style.display = "none";

		// 6. Carrega a facção e líder selecionados no DeckMaker com segurança
		try {
			if (window.dm && VersusMode.localFaction) {
				window.dm.loadFactionDeck(VersusMode.localFaction, true);
				if (VersusMode.localLeaderIndex !== undefined && window.dm.leaders) {
					const leaderMatch = window.dm.leaders.find(l => l.index == VersusMode.localLeaderIndex);
					if (leaderMatch) {
						window.dm.setLeader(VersusMode.localLeaderIndex);
					}
				}
				window.dm.update();
			}
		} catch (err) {
			console.warn("Aviso ao carregar baralho no DeckMaker:", err);
		}

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static closeDeckBuilderForVersus() {
		// Valida se o baralho respeita os limites mínimos/máximos do Gwent
		if (window.dm && window.dm.stats) {
			if (window.dm.stats.unit < 15) {
				alert((typeof I18N !== "undefined") ? I18N.t("warn_min_units") : "Seu baralho deve ter pelo menos 15 cartas de unidade.");
				return;
			}
			if (window.dm.stats.special > 10) {
				alert((typeof I18N !== "undefined") ? I18N.t("warn_max_specials") : "Seu baralho não pode ter mais de 10 cartas especiais.");
				return;
			}
		}

		VersusMode.isCustomizingDeck = false;

		// 1. Atualiza dados locais com a facção e líder escolhidos
		if (window.dm) {
			VersusMode.localFaction = window.dm.faction || VersusMode.localFaction || "realms";
			if (window.dm.leader) {
				VersusMode.localLeaderIndex = window.dm.leader.index;
			}
		}

		// 2. Oculta botões específicos do Versus
		const btnTop = document.getElementById("btn-versus-top-back");
		if (btnTop) {
			btnTop.classList.add("hide");
			btnTop.style.display = "none";
		}
		const btnConfirm = document.getElementById("btn-versus-deck-confirm");
		if (btnConfirm) {
			btnConfirm.classList.add("hide");
			btnConfirm.style.display = "none";
		}

		// 3. Oculta o Deck Customization e remove classe versus-deck-mode
		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.add("hide");
			deckCustom.classList.remove("versus-deck-mode");
		}

		// 4. Mantém o Menu Principal oculto (o jogador está no Versus!)
		const mainMenu = document.getElementById("main-menu");
		if (mainMenu) mainMenu.classList.add("hide");

		// 5. Reabre o modal de preparação
		const modal = document.getElementById("versus-lobby-modal");
		if (modal) modal.classList.remove("hide");

		// 6. Cancela o estado de pronto e notifica o oponente da mudança de facção/baralho
		VersusMode.localReady = false;
		VersusMode.updatePreMatchUI();

		const localDeck = VersusMode.constructLocalDeck();
		VersusMode.sendPacket("LOBBY_SYNC", {
			name: VersusMode.localPlayerName,
			faction: VersusMode.localFaction,
			leaderIndex: VersusMode.localLeaderIndex,
			ready: false,
			deck: localDeck,
			deckCards: localDeck.cards
		});

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}
	}

	// Constrói de forma segura os dados do baralho local para o jogo
	static constructLocalDeck() {
		if (window.dm && window.dm.deck && window.dm.leader) {
			const activeCards = window.dm.deck.filter(x => x.count > 0).map(x => ({ index: x.index, count: x.count }));
			if (activeCards.length > 0) {
				return {
					faction: window.dm.faction || VersusMode.localFaction || "realms",
					leader: card_dict[window.dm.leader.index],
					cards: activeCards
				};
			}
		}

		const faction = VersusMode.localFaction || "realms";
		let settings = null;
		try {
			if (typeof Settings !== "undefined" && Settings.getFactionSettings) {
				settings = Settings.getFactionSettings(faction).get();
			}
		} catch (e) {
			console.warn("Erro ao ler Settings da facção:", e);
		}

		const leaderIdx = (settings && settings.leader !== undefined) ? settings.leader : (VersusMode.localLeaderIndex || 0);
		const leaderCard = card_dict[leaderIdx] || card_dict.find(c => c.deck === faction && c.row === "leader");
		let cards = (settings && settings.cards && settings.cards.length > 0) ? settings.cards : [];

		if (cards.length === 0) {
			const factionCards = card_dict
				.map((c, idx) => ({ index: idx, card: c }))
				.filter(p => p.card.deck === faction && p.card.row !== "leader");
			cards = factionCards.slice(0, 22).map(p => ({ index: p.index, count: 1 }));
		}

		return {
			faction: faction,
			leader: leaderCard,
			cards: cards
		};
	}

	static checkBothReady() {
		VersusMode.updatePreMatchUI();
	}

	// Clique no botão Iniciar Partida (apenas Host quando ambos estiverem prontos)
	static onStartMatchClick() {
		if (!VersusMode.isHost) return;
		if (!VersusMode.localReady || !VersusMode.remoteReady) {
			alert("Ambos os jogadores precisam confirmar PRONTO antes de iniciar.");
			return;
		}

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_slash");
		}

		VersusMode.initiateMatchAsHost();
	}

	// -------------------------------------------------------------
	// INICIALIZAÇÃO DA PARTIDA PVP (COM ÁRBITRO E EMBARALHAMENTO SINCRONIZADO)
	// -------------------------------------------------------------
	static initiateMatchAsHost(forceFirstTurnIsHost = null) {
		const coinTossIsHost = (forceFirstTurnIsHost !== null) ? forceFirstTurnIsHost : (Math.random() < 0.5);
		const hostDeckData = VersusMode.constructLocalDeck();
		const guestDeckData = VersusMode.remoteDeckData || { faction: VersusMode.remoteFaction || "nilfgaard" };

		// Gera ordem determinística para os baralhos de ambos os jogadores
		let hostCardsList = Card.expandIDCounts(hostDeckData.cards);
		let guestCardsList = Card.expandIDCounts((guestDeckData && guestDeckData.cards) ? guestDeckData.cards : hostDeckData.cards);

		const shuffle = (arr) => {
			const a = [...arr];
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[a[i], a[j]] = [a[j], a[i]];
			}
			return a;
		};

		const hostDeckOrder = shuffle(hostCardsList).map(c => c.name);
		const guestDeckOrder = shuffle(guestCardsList).map(c => c.name);

		VersusMode.hostDeckOrder = hostDeckOrder;
		VersusMode.guestDeckOrder = guestDeckOrder;
		VersusMode.pendingRoundResults = {};

		// Envia ordem de início e baralho do Host para o Convidado
		VersusMode.sendPacket("MATCH_START", {
			firstTurn: coinTossIsHost ? "guest_op" : "guest_me",
			hostDeck: hostDeckData,
			hostDeckOrder: hostDeckOrder,
			guestDeckOrder: guestDeckOrder
		});

		VersusMode.startActualGame(coinTossIsHost, hostDeckOrder, guestDeckOrder);
	}

	static startActualGame(iStartFirst, hostDeckOrder = null, guestDeckOrder = null) {
		if (typeof MusicManager !== "undefined") MusicManager.playGameMusic();
		VersusMode.stopAllTimers();
		VersusMode.isActive = true;
		VersusMode.isFirstTurn = iStartFirst;
		VersusMode.rematchRequestedByMe = false;
		VersusMode.rematchRequestedByRemote = false;
		VersusMode.localMulliganDone = false;
		VersusMode.remoteMulliganDone = false;
		VersusMode.scoiataelChoiceReceived = null;
		VersusMode.pendingRoundResults = {};
		VersusMode.pendingMedicTargets = [];
		VersusMode.pendingMedicTarget = null;
		VersusMode.pendingLeaderData = null;

		if (hostDeckOrder) VersusMode.hostDeckOrder = hostDeckOrder;
		if (guestDeckOrder) VersusMode.guestDeckOrder = guestDeckOrder;

		// Oculta modais, tela de fim de jogo e menu
		const lobbyModal = document.getElementById("versus-lobby-modal");
		if (lobbyModal) lobbyModal.classList.add("hide");

		const alertModal = document.getElementById("versus-alert-modal");
		if (alertModal) alertModal.classList.add("hide");

		const endScreen = document.getElementById("end-screen");
		if (endScreen) {
			endScreen.classList.add("hide");
			endScreen.style.opacity = 0;
		}

		const rematchBtn = document.getElementById("end-btn-rematch");
		if (rematchBtn) {
			rematchBtn.disabled = false;
			rematchBtn.classList.remove("highlight");
		}

		const mainMenu = document.getElementById("main-menu");
		if (mainMenu) mainMenu.classList.add("hide");

		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.add("hide");
			deckCustom.classList.remove("versus-deck-mode");
		}

		// Exibe tabuleiro
		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.remove("hide");

		// Constrói baralho do jogador local
		const meDeck = VersusMode.constructLocalDeck();

		// Constrói baralho do oponente remoto
		let opDeckData = VersusMode.remoteDeckData;
		if (!opDeckData || !opDeckData.cards || opDeckData.cards.length === 0) {
			const remoteFaction = VersusMode.remoteFaction || "nilfgaard";
			let remoteCards = VersusMode.remoteDeckCards;
			if (!remoteCards || remoteCards.length === 0) {
				const factionCards = card_dict
					.map((c, idx) => ({ index: idx, card: c }))
					.filter(p => p.card.deck === remoteFaction && p.card.row !== "leader");
				remoteCards = factionCards.slice(0, 22).map(p => ({ index: p.index, count: 1 }));
			}
			const leaderCard = (VersusMode.remoteLeaderIndex !== undefined && card_dict[VersusMode.remoteLeaderIndex] && card_dict[VersusMode.remoteLeaderIndex].deck === remoteFaction)
				? card_dict[VersusMode.remoteLeaderIndex]
				: card_dict.find(c => c.deck === remoteFaction && c.row === "leader");

			opDeckData = {
				faction: remoteFaction,
				leader: leaderCard,
				cards: remoteCards
			};
		}

		// Configura jogadores com seus nicknames personalizados
		player_me = new Player(0, VersusMode.localPlayerName || "Geralt", meDeck);
		player_op = new Player(1, VersusMode.remotePlayerName || "Adversário", opDeckData);

		// Aplica reordenação determinística nos baralhos para sincronizar o draw inicial
		if (VersusMode.isHost) {
			if (hostDeckOrder && player_me.deck && player_me.deck.reorderCards) player_me.deck.reorderCards(hostDeckOrder);
			if (guestDeckOrder && player_op.deck && player_op.deck.reorderCards) player_op.deck.reorderCards(guestDeckOrder);
		} else {
			if (guestDeckOrder && player_me.deck && player_me.deck.reorderCards) player_me.deck.reorderCards(guestDeckOrder);
			if (hostDeckOrder && player_op.deck && player_op.deck.reorderCards) player_op.deck.reorderCards(hostDeckOrder);
		}

		// Substitui a IA pelo Controller P2P no oponente
		player_op.controller = new ControllerPeer(player_op);

		// Atualiza os nomes nos elementos visuais do tabuleiro
		const nameMe = document.getElementById("name-me");
		if (nameMe) nameMe.innerText = VersusMode.localPlayerName || "Geralt";

		const nameOp = document.getElementById("name-op");
		if (nameOp) nameOp.innerText = VersusMode.remotePlayerName || "Adversário";

		// Exibe HUD de turno
		VersusMode.showTurnHUD();

		// Exibe botão de trigger dos emotes no tabuleiro e inicializa listeners
		const emoteBtn = document.getElementById("btn-versus-emote-trigger");
		if (emoteBtn) emoteBtn.classList.remove("hide");
		VersusMode.initEmotes();

		// Inicia o jogo
		game.reset();
		game.startGame();
		VersusMode.startWatchdog();
	}

	// -------------------------------------------------------------
	// PROCESSAMENTO DE PACOTES P2P RECEBIDOS
	// -------------------------------------------------------------
	static handleIncomingPacket(msg) {
		if (!msg || !msg.type) return;
		const payload = msg.payload || {};

		// Pacotes de atualização de lobby, sincronização de mulligan ou emotes imediatos
		if (msg.type === "LOBBY_SYNC") {
			VersusMode.remotePlayerName = payload.name || "Adversário";
			VersusMode.remoteFaction = payload.faction || "nilfgaard";
			VersusMode.remoteLeaderIndex = payload.leaderIndex || 0;
			VersusMode.remoteReady = !!payload.ready;
			if (payload.deck) VersusMode.remoteDeckData = payload.deck;
			if (payload.deckCards && Array.isArray(payload.deckCards)) VersusMode.remoteDeckCards = payload.deckCards;
			VersusMode.updatePreMatchUI();
			VersusMode.checkBothReady();
			return;
		}

		if (msg.type === "MATCH_START") {
			const iStartFirst = payload.firstTurn === "guest_me";
			if (payload.hostDeck) {
				VersusMode.remoteDeckData = payload.hostDeck;
				if (payload.hostDeck.faction) {
					VersusMode.remoteFaction = payload.hostDeck.faction;
				}
			}
			VersusMode.startActualGame(iStartFirst, payload.hostDeckOrder, payload.guestDeckOrder);
			return;
		}

		if (msg.type === "MULLIGAN_SYNC") {
			VersusMode.remoteMulliganDone = true;
			if (payload.finalHand) {
				VersusMode.syncRemoteHand(payload.finalHand, payload.finalDeck);
			}
			return;
		}

		if (msg.type === "ROUND_RESULT") {
			VersusMode.onRoundResultReceived(payload);
			return;
		}

		if (msg.type === "EMOTE") {
			VersusMode.onRemoteEmoteReceived(payload);
			return;
		}

		if (msg.type === "ACTION_FORFEIT") {
			VersusMode.onRemoteForfeit();
			return;
		}

		if (msg.type === "GAME_END_SYNC") {
			VersusMode.onGameEndSyncReceived();
			return;
		}

		if (msg.type === "REMATCH_REQUEST") {
			VersusMode.rematchRequestedByRemote = true;
			VersusMode.onRemoteRematchRequested();
			return;
		}

		if (msg.type === "REMATCH_ACCEPT") {
			if (VersusMode.isHost) {
				VersusMode.initiateMatchAsHost(!VersusMode.isFirstTurn);
			}
			return;
		}

		if (msg.type === "RETURN_TO_LOBBY") {
			VersusMode.returnToPreMatchLobby(false);
			return;
		}

		if (msg.type === "REQ_TURN_SYNC") {
			if (VersusMode.isHost) {
				VersusMode.broadcastTurnSync();
			}
			return;
		}

		// Todos os eventos de jogabilidade sequencial entram na fila FIFO estrita
		VersusMode.packetQueue.push(msg);
		VersusMode.processPacketQueue();
	}

	static async processPacketQueue() {
		if (VersusMode.isProcessingQueue) return;
		VersusMode.isProcessingQueue = true;

		try {
			while (VersusMode.packetQueue.length > 0) {
				const nextMsg = VersusMode.packetQueue.shift();
				if (!nextMsg) continue;
				await VersusMode.executeGameplayPacket(nextMsg);
			}
		} catch (err) {
			console.error("[VersusQueue] Erro ao processar fila de pacotes:", err);
		} finally {
			VersusMode.isProcessingQueue = false;
		}
	}

	static async executeGameplayPacket(msg) {
		const payload = msg.payload || {};
		switch (msg.type) {
			case "ACTION_PLAY_CARD":
				if (player_op && player_op.controller instanceof ControllerPeer) {
					await player_op.controller.handleRemotePlayCard(payload);
				}
				break;

			case "ACTION_PASS":
				if (player_op && player_op.controller instanceof ControllerPeer) {
					await player_op.controller.handleRemotePass(payload);
				}
				break;

			case "ACTION_LEADER":
				if (player_op && player_op.controller instanceof ControllerPeer) {
					await player_op.controller.handleRemoteLeader(payload);
				}
				break;

			case "ACTION_FORCE_PASS":
				VersusMode.onActionForcePassReceived(payload);
				break;

			case "TURN_SYNC":
				VersusMode.onTurnSyncReceived(payload);
				break;
		}
	}

	// -------------------------------------------------------------
	// SINCRONIZAÇÃO EXATA DE MÃO E BARALHO DO ADVERSÁRIO (CORREÇÃO DO CONTADOR)
	// -------------------------------------------------------------
	static syncRemoteHand(finalHandNames, finalDeckNames = null) {
		if (!player_op || !player_op.hand || !player_op.deck || !Array.isArray(finalHandNames)) return;

		// Reúne todas as cartas atualmente na mão e no baralho do oponente em um único pool
		const pool = [...player_op.hand.cards, ...player_op.deck.cards];
		const newHandCards = [];

		for (const name of finalHandNames) {
			const idx = pool.findIndex(c => c.name === name);
			if (idx !== -1) {
				newHandCards.push(pool.splice(idx, 1)[0]);
			} else {
				const cData = card_dict.find(c => c.name === name) || card_dict[0];
				newHandCards.push(new Card(cData, player_op));
			}
		}

		// Ordena o restante do baralho conforme finalDeckNames se fornecido
		let newDeckCards = [];
		if (Array.isArray(finalDeckNames) && finalDeckNames.length > 0) {
			for (const name of finalDeckNames) {
				const idx = pool.findIndex(c => c.name === name);
				if (idx !== -1) {
					newDeckCards.push(pool.splice(idx, 1)[0]);
				}
			}
			newDeckCards = newDeckCards.concat(pool);
		} else {
			newDeckCards = pool;
		}

		// Atualiza a mão do oponente e seu contador (#hand-count-op)
		player_op.hand.cards = newHandCards;
		player_op.hand.resize();

		// Reconstrói visualmente a pilha do baralho do oponente e seu contador (#deck-op)
		player_op.deck.cards = [];
		if (player_op.deck.elem) {
			while (player_op.deck.elem.firstChild) {
				player_op.deck.elem.removeChild(player_op.deck.elem.firstChild);
			}
			player_op.deck.elem.appendChild(player_op.deck.counter);
		}
		for (let i = 0; i < newDeckCards.length; i++) {
			player_op.deck.cards.push(newDeckCards[i]);
			player_op.deck.addCardElement();
		}
		player_op.deck.resize();
	}

	// -------------------------------------------------------------
	// TEMPORIZADORES: 30s MULLIGAN & 1:00 TURNO (COM AUTO-PLAY)
	// -------------------------------------------------------------
	static stopAllTimers() {
		VersusMode.stopMulliganTimer();
		VersusMode.stopTurnTimer();
		VersusMode.stopWatchdog();
	}

	static formatSeconds(sec) {
		const s = Math.max(0, Math.ceil(sec));
		const mins = Math.floor(s / 60);
		const rem = s % 60;
		return `${mins}:${rem < 10 ? "0" + rem : rem}`;
	}

	// Inicia o temporizador de 30 segundos para troca inicial de até 2 cartas
	static startMulliganTimer() {
		VersusMode.stopMulliganTimer();
		VersusMode.mulliganTimeLeft = VersusMode.MULLIGAN_SECONDS;
		VersusMode.showTurnHUD();

		const baseTitle = (typeof I18N !== "undefined") ? I18N.t("redraw_title") : "Escolha até 2 cartas para trocar.";
		const updateMulliganUI = () => {
			const tLeft = Math.max(0, VersusMode.mulliganTimeLeft);
			const isUrgent = tLeft <= 10;

			// Atualiza o título do Carousel se estiver aberto
			if (typeof Carousel !== "undefined" && Carousel.curr && Carousel.curr.title_elem) {
				Carousel.curr.title_elem.innerHTML = `${baseTitle} <span class="mulligan-timer-badge ${isUrgent ? "urgent" : ""}">⏱ ${tLeft}s</span>`;
			}

			// Atualiza o banner superior
			const hud = document.getElementById("versus-turn-hud");
			if (hud) {
				hud.classList.remove("hide");
				hud.className = "mulligan-phase" + (isUrgent ? " timer-urgent" : "");
				const pct = Math.max(0, Math.min(100, (tLeft / VersusMode.MULLIGAN_SECONDS) * 100));
				hud.innerHTML = `
					<div class="hud-turn-content">
						<span class="hud-turn-icon">🔄</span>
						<span class="hud-turn-text">Fase de Troca Inicial (até 2 cartas)</span>
						<span class="hud-turn-timer ${isUrgent ? "urgent" : ""}">⏱ 0:${tLeft < 10 ? "0" + tLeft : tLeft}</span>
					</div>
					<div class="hud-turn-progress"><div class="hud-turn-progress-bar" style="width:${pct}%"></div></div>
				`;
			}
		};

		updateMulliganUI();

		VersusMode.mulliganInterval = setInterval(() => {
			VersusMode.mulliganTimeLeft--;
			updateMulliganUI();

			if (VersusMode.mulliganTimeLeft <= 0) {
				VersusMode.stopMulliganTimer();
				// Se o jogador ainda estiver com o Carousel aberto, encerra a troca automaticamente
				if (typeof Carousel !== "undefined" && Carousel.curr) {
					Carousel.curr.bExit = true;
					Carousel.curr.cancel();
				}
			}
		}, 1000);
	}

	static stopMulliganTimer() {
		if (VersusMode.mulliganInterval) {
			clearInterval(VersusMode.mulliganInterval);
			VersusMode.mulliganInterval = null;
		}
	}

	// No modo Versus, aguarda ambos os jogadores concluírem o Mulligan (máximo de 32s)
	static async waitForRemoteMulligan() {
		if (!VersusMode.isActive || VersusMode.remoteMulliganDone) return;
		const startWait = Date.now();
		while (!VersusMode.remoteMulliganDone && VersusMode.isActive && (Date.now() - startWait < 32000)) {
			const elapsed = Math.floor((Date.now() - startWait) / 1000);
			const remaining = Math.max(0, 30 - elapsed);
			const hud = document.getElementById("versus-turn-hud");
			if (hud) {
				hud.classList.remove("hide");
				hud.className = "op-turn";
				hud.innerHTML = `
					<div class="hud-turn-content">
						<span class="hud-turn-icon">⏳</span>
						<span class="hud-turn-text">Aguardando ${VersusMode.remotePlayerName} escolher cartas iniciais...</span>
						<span class="hud-turn-timer">⏱ 0:${remaining < 10 ? "0" + remaining : remaining}</span>
					</div>
				`;
			}
			await sleep(100);
		}
	}

	// Inicia o temporizador de 1:00 (60 segundos) para o turno atual
	static startTurnTimer(isMyTurn) {
		VersusMode.stopTurnTimer();
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) return;

		// Se for single-player e for a vez da IA, não precisa de cronômetro de 60s
		if (!VersusMode.isActive && !isMyTurn) {
			VersusMode.updateTurnHUD(false);
			return;
		}

		VersusMode.turnTimeLeft = VersusMode.TURN_SECONDS;
		VersusMode.showTurnHUD();
		VersusMode.updateTurnHUD(isMyTurn);

		VersusMode.turnInterval = setInterval(() => {
			if (typeof game === "undefined" || game.state !== GameState.PLAYING) {
				VersusMode.stopTurnTimer();
				return;
			}
			VersusMode.turnTimeLeft--;
			VersusMode.updateTurnHUD(isMyTurn);

			if (VersusMode.turnTimeLeft <= 0) {
				VersusMode.stopTurnTimer();
				VersusMode.handleTurnTimeout(isMyTurn);
			}
		}, 1000);
	}

	static stopTurnTimer() {
		if (VersusMode.turnInterval) {
			clearInterval(VersusMode.turnInterval);
			VersusMode.turnInterval = null;
		}
	}

	// Sincronização autoritária de turno transmitida pelo Host
	static broadcastTurnSync() {
		if (!VersusMode.isActive || !VersusMode.isHost) return;
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) return;

		VersusMode.turnSeq++;
		const activePlayer = (game.currPlayer === player_me) ? "host" : "guest";
		VersusMode.lastTurnSyncTime = Date.now();

		VersusMode.sendPacket("TURN_SYNC", {
			turnSeq: VersusMode.turnSeq,
			roundCount: game.roundCount,
			activePlayer: activePlayer,
			hostPassed: player_me ? !!player_me.passed : false,
			guestPassed: player_op ? !!player_op.passed : false
		});
	}

	// Processamento da sincronização autoritária no Guest
	static onTurnSyncReceived(payload) {
		if (!payload || VersusMode.isHost) return;
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) return;

		// Se uma animação de jogada remota ou local estiver em andamento, não aplique a troca de jogador agora
		if (VersusMode.isActionExecuting) {
			VersusMode.pendingTurnSync = payload;
			return;
		}

		const activePlayer = payload.activePlayer; // "host" ou "guest"
		const isMeActive = (activePlayer === "guest");

		if (payload.roundCount !== undefined && payload.roundCount > game.roundCount) {
			game.roundCount = payload.roundCount;
		}

		if (payload.hostPassed !== undefined && player_op) {
			player_op.setPassed(payload.hostPassed);
		}
		if (payload.guestPassed !== undefined && player_me) {
			player_me.setPassed(payload.guestPassed);
		}

		const targetPlayer = isMeActive ? player_me : player_op;
		if (game.currPlayer !== targetPlayer) {
			console.log(`[VersusSync] Alinhando turno com autoridade do Host: ${isMeActive ? "Jogador Local" : "Oponente"}`);
			game.currPlayer = targetPlayer;
		}

		ui.enablePlayer(isMeActive);
		const passBtn = document.getElementById("pass-button");
		if (passBtn) {
			if (isMeActive && player_me && !player_me.passed) {
				passBtn.classList.remove("noclick");
			} else {
				passBtn.classList.add("noclick");
			}
		}

		VersusMode.startTurnTimer(isMeActive);
	}

	// Recebimento de passe forçado pelo Árbitro no Guest
	static onActionForcePassReceived(payload) {
		if (VersusMode.isHost) return;
		console.warn("[VersusGuest] Árbitro Host forçou o encerramento do turno por esgotamento de tempo.");
		if (player_me && !player_me.passed) {
			player_me.passRound();
		}
	}

	// Tratamento de timeout de turno com watchdog anti-softlock
	static async handleTurnTimeout(isMyTurn) {
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) return;
		if (game.isActionInProgress || game.isCardBeingPlayed || game.isTurnTransitioning || VersusMode.isActionExecuting || (player_me && player_me.isPlayingCard)) {
			console.log("[TurnTimer] Ação manual ou transição de turno em andamento, ignorando timeout.");
			return;
		}

		// Caso 1: É o turno do jogador local e seu tempo esgotou
		if (isMyTurn && game.currPlayer === player_me) {
			console.log("[TurnTimer] Tempo esgotado para o jogador local! Executando auto-play.");
			await VersusMode.autoPlayFirstAvailableCard();
			return;
		}

		// Caso 2: É o turno do oponente (ou desincronização em que ambos ficaram em espera)
		if (VersusMode.isActive) {
			if (VersusMode.isHost) {
				// O Host é o ÁRBITRO SUPREMO:
				// O Guest não enviou jogada em 60s. Damos 2.5s de buffer para latência de rede.
				console.warn("[VersusHost] Tempo do Guest esgotou no árbitro. Aguardando buffer de tolerância de 2.5s...");
				await sleep(2500);

				if (typeof game !== "undefined" && game.state === GameState.PLAYING) {
					if (game.currPlayer === player_op && !player_op.passed) {
						console.warn("[VersusHost] Oponente inativo. Árbitro forçando passe remoto para destravar a partida.");
						VersusMode.sendPacket("ACTION_FORCE_PASS");
						player_op.passRound();
						VersusMode.broadcastTurnSync();
					} else if (game.currPlayer === player_me && !player_me.passed) {
						console.warn("[VersusHost] Recuperando controle de turno local travado via árbitro.");
						await VersusMode.autoPlayFirstAvailableCard();
					}
				}
			} else {
				// O Guest estava esperando o Host e o cronômetro esgotou.
				console.warn("[VersusGuest] Tempo esgotado aguardando Host. Solicitando REQ_TURN_SYNC ao árbitro...");
				VersusMode.sendPacket("REQ_TURN_SYNC");

				// Watchdog de segurança após 5s extras no Guest
				setTimeout(() => {
					if (typeof game !== "undefined" && game.state === GameState.PLAYING && game.currPlayer === player_op && VersusMode.turnInterval === null) {
						VersusMode.sendPacket("REQ_TURN_SYNC");
					}
				}, 5000);
			}
		}
	}

	// Se o tempo de 1:00 encerrar e o jogador não jogar, joga a primeira carta disponível automaticamente
	static async autoPlayFirstAvailableCard() {
		if (typeof game === "undefined" || game.state !== GameState.PLAYING || game.currPlayer !== player_me) return;
		if (game.isActionInProgress || game.isCardBeingPlayed || game.isTurnTransitioning || VersusMode.isActionExecuting || (player_me && player_me.isPlayingCard)) {
			console.log("[autoPlay] Ação manual ou transição já em andamento, abortando auto-play.");
			return;
		}
		if (VersusMode.isHandlingTimeout) return;
		VersusMode.isHandlingTimeout = true;
		game.isActionInProgress = true;
		game.isCardBeingPlayed = true;
		game.isAutoPlayingTimeout = true;
		VersusMode.isActionExecuting = true;
		VersusMode.stopTurnTimer();
		ui.enablePlayer(false);
		game.isAutoPlayingTimeout = true;

		try {
			// Fecha quaisquer popups, carousels ou pré-visualizações abertas
			if (typeof Popup !== "undefined" && Popup.curr) {
				Popup.curr.clear();
			}
			if (typeof Carousel !== "undefined" && Carousel.curr) {
				Carousel.curr.exit();
			}
			if (typeof ui !== "undefined" && ui) {
				ui.cancel();
				ui.hidePreview();
				ui.enablePlayer(false);
			}

			if (!player_me || player_me.passed) {
				return;
			}

			const handCards = (player_me.hand && player_me.hand.cards) ? [...player_me.hand.cards] : [];
			if (handCards.length === 0) {
				player_me.passRound();
				return;
			}

			// Procura a primeira carta jogável na mão do jogador
			let played = false;
			for (const card of handCards) {
				// Caso 1: Isca (Decoy) -> exige que exista ao menos uma unidade aliada no campo (fileiras 3..5)
				if (card.name === "Decoy" || (card.abilities && card.abilities.includes("decoy"))) {
					let targetUnit = null;
					let targetRow = null;
					for (let r = 3; r < 6; r++) {
						const rowObj = board.row[r];
						const unit = rowObj.cards.find(c => c.isUnit());
						if (unit) {
							targetUnit = unit;
							targetRow = rowObj;
							break;
						}
					}
					if (targetUnit && targetRow) {
						ui.showPreviewVisuals(card);
						await sleep(700);
						ui.hidePreview(card);
						if (typeof Achievements !== "undefined") {
							Achievements.recordDecoy();
						}
						if (VersusMode.isActive) {
							const rowType = VersusMode.getRowTypeFromRow(targetRow);
							VersusMode.onLocalCardPlayed(card, {
								decoyTargetName: targetUnit.name,
								rowType: rowType
							});
						}
						await board.toHand(targetUnit, targetRow);
						await board.moveTo(card, targetRow, player_me.hand);
						player_me.endTurn();
						played = true;
						break;
					}
					continue;
				}

				// Caso 2: Queimar (Scorch)
				if (card.name === "Scorch") {
					ui.showPreviewVisuals(card);
					await sleep(700);
					ui.hidePreview(card);
					await ability_dict["scorch"].activated(card);
					if (VersusMode.isActive) {
						VersusMode.onLocalCardPlayed(card, { rowType: "scorch" });
					}
					player_me.endTurn();
					played = true;
					break;
				}

				// Caso 3: Carta Especial de Fileira (Corneta do Comandante / Mardroeme)
				if (card.isSpecial && card.isSpecial()) {
					let specialRow = null;
					for (let r = 3; r < 6; r++) {
						if (board.row[r].special === null) {
							specialRow = board.row[r];
							break;
						}
					}
					if (specialRow) {
						ui.showPreviewVisuals(card);
						await sleep(700);
						ui.hidePreview(card);
						await board.moveTo(card, specialRow, player_me.hand);
						if (VersusMode.isActive) {
							const rowType = VersusMode.getRowTypeFromRow(specialRow);
							VersusMode.onLocalCardPlayed(card, { rowType: rowType });
						}
						player_me.endTurn();
						played = true;
						break;
					}
					continue;
				}

				// Caso 4: Carta de Clima (Weather)
				if (card.faction === "weather" || card.row === "weather") {
					ui.showPreviewVisuals(card);
					await sleep(700);
					ui.hidePreview(card);
					await board.moveTo(card, weather, player_me.hand);
					if (VersusMode.isActive) {
						VersusMode.onLocalCardPlayed(card, { rowType: "weather" });
					}
					player_me.endTurn();
					played = true;
					break;
				}

				// Caso 5: Unidades normais, Ágeis, Espiões, Médicos, Heróis
				const rowType = (card.row === "agile") ? "close" : (card.row || "close");
				const targetRow = board.getRow(card, rowType, player_me);
				if (targetRow) {
					VersusMode.pendingMedicTargets = [];
					VersusMode.pendingMedicTarget = null;
					ui.showPreviewVisuals(card);
					await sleep(700);
					ui.hidePreview(card);
					await board.moveTo(card, targetRow, player_me.hand);
					if (VersusMode.isActive) {
						VersusMode.onLocalCardPlayed(card, {
							rowType: rowType,
							medicTargetName: VersusMode.pendingMedicTarget || null,
							medicTargets: VersusMode.pendingMedicTargets
						});
						VersusMode.pendingMedicTarget = null;
						VersusMode.pendingMedicTargets = [];
					}
					player_me.endTurn();
					played = true;
					break;
				}
			}

			// Se nenhuma carta pôde ser jogada (ex: só tinha Isca sem unidades em campo), passa a rodada
			if (!played && !player_me.passed) {
				player_me.passRound();
			}
		} catch (err) {
			console.error("Erro no auto-play por tempo esgotado:", err);
			if (player_me && !player_me.passed) {
				player_me.passRound();
			}
		} finally {
			game.isAutoPlayingTimeout = false;
			VersusMode.isHandlingTimeout = false;
			if (VersusMode.isActive && VersusMode.isHost) {
				VersusMode.broadcastTurnSync();
			}
		}
	}

	// -------------------------------------------------------------
	// BOTÃO DESISTIR (SURRENDER / FORFEIT)
	// -------------------------------------------------------------
	static promptForfeit() {
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) return;
		AudioManager.playSFX("warning");

		const resumeLabel = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_resume") : "Continuar Partida";
		const forfeitLabel = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_confirm") : "🏳 Desistir";
		const titleText = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_title") : "Desistir da Partida?";
		const descText = VersusMode.isActive
			? ((typeof I18N !== "undefined") ? I18N.t("forfeit_popup_desc_versus") : "Se você desistir agora, a vitória será concedida imediatamente ao seu adversário.")
			: ((typeof I18N !== "undefined") ? I18N.t("forfeit_popup_desc") : "Você perderá a partida atual imediatamente.");

		ui.popup(
			resumeLabel,
			() => {
				// Restaura interatividade caso seja o turno do jogador local
				if (game.state === GameState.PLAYING && (game.currPlayer === player_me || (typeof Carousel !== "undefined" && Carousel.curr))) {
					ui.enablePlayer(true);
				}
			},
			forfeitLabel,
			() => {
				VersusMode.executeForfeit();
			},
			titleText,
			descText
		);
	}

	static executeForfeit() {
		VersusMode.stopAllTimers();

		if (typeof Carousel !== "undefined" && Carousel.curr) {
			Carousel.curr.exit();
		}
		if (typeof ui !== "undefined" && ui) {
			ui.hidePreview();
		}

		if (player_me) {
			player_me.health = 0;
		}
		if (player_op && player_op.health <= 0) {
			player_op.health = 1;
		}
		VersusMode.syncGemsUI();

		if (VersusMode.isActive) {
			VersusMode.sendPacket("ACTION_FORFEIT");
		}

		if (typeof game !== "undefined" && game.endGame) {
			game.endGame();
		}
	}

	static onRemoteForfeit() {
		VersusMode.stopAllTimers();

		if (typeof Popup !== "undefined" && Popup.curr) {
			Popup.curr.clear();
		}
		if (typeof Carousel !== "undefined" && Carousel.curr) {
			Carousel.curr.exit();
		}
		if (typeof ui !== "undefined" && ui) {
			ui.hidePreview();
		}

		if (player_op) {
			player_op.health = 0;
		}
		if (player_me && player_me.health <= 0) {
			player_me.health = 1;
		}
		VersusMode.syncGemsUI();

		if (typeof game !== "undefined" && game.endGame) {
			game.endGame();
		}
	}

	// -------------------------------------------------------------
	// HOOKS DE AÇÕES LOCAIS (ENVIO PARA O PEER)
	// -------------------------------------------------------------
	static onLocalCardPlayed(card, meta = {}) {
		VersusMode.stopTurnTimer();
		if (!VersusMode.isActive) return;

		const cardIndex = (player_me && player_me.hand && player_me.hand.cards)
			? player_me.hand.cards.indexOf(card)
			: -1;

		VersusMode.sendPacket("ACTION_PLAY_CARD", {
			cardIndex: cardIndex,
			cardName: card.name,
			rowType: meta.rowType || card.row,
			decoyTargetName: meta.decoyTargetName || null,
			medicTargetName: meta.medicTargetName || null,
			medicTargets: meta.medicTargets || VersusMode.pendingMedicTargets || [],
			senderTotal: player_me ? player_me.total : 0,
			senderHandCount: (player_me && player_me.hand) ? player_me.hand.cards.length : 0,
			abilities: card.abilities
		});

		VersusMode.pendingMedicTargets = [];
		VersusMode.pendingMedicTarget = null;
		if (player_op && player_op.passed) {
			VersusMode.updateTurnHUD(true);
		} else {
			VersusMode.updateTurnHUD(false);
		}
	}

	static onLocalPass() {
		VersusMode.stopTurnTimer();
		if (!VersusMode.isActive) return;
		VersusMode.sendPacket("ACTION_PASS", {
			senderTotal: player_me ? player_me.total : 0,
			senderHandCount: (player_me && player_me.hand) ? player_me.hand.cards.length : 0
		});
		VersusMode.updateTurnHUD(false);
	}

	static onLocalLeader(leaderMeta = {}) {
		VersusMode.stopTurnTimer();
		if (!VersusMode.isActive) return;
		VersusMode.sendPacket("ACTION_LEADER", leaderMeta || VersusMode.pendingLeaderData || {});
		VersusMode.pendingLeaderData = null;
	}

	static onLocalMulliganDone() {
		VersusMode.stopMulliganTimer();
		VersusMode.localMulliganDone = true;
		if (!VersusMode.isActive || !player_me || !player_me.hand) return;
		VersusMode.sendPacket("MULLIGAN_SYNC", {
			finalHand: player_me.hand.cards.map(c => c.name),
			finalDeck: player_me.deck ? player_me.deck.cards.map(c => c.name) : []
		});
	}

	// -------------------------------------------------------------
	// SINCRONIZAÇÃO DE RODADAS E FIM DE JOGO (ÁRBITRO)
	// -------------------------------------------------------------
	static onRoundResultReceived(payload) {
		if (!payload) return;
		VersusMode.pendingRoundResults[payload.roundCount] = payload;
		VersusMode.lastRoundResult = payload;
	}

	static async waitForHostRoundResult(roundCount) {
		const checkResult = () => {
			if (VersusMode.pendingRoundResults[roundCount]) {
				const res = VersusMode.pendingRoundResults[roundCount];
				delete VersusMode.pendingRoundResults[roundCount];
				return res;
			}
			if (VersusMode.lastRoundResult && (VersusMode.lastRoundResult.roundCount === roundCount || roundCount === undefined)) {
				const res = VersusMode.lastRoundResult;
				VersusMode.lastRoundResult = null;
				return res;
			}
			return null;
		};

		const immediate = checkResult();
		if (immediate) return immediate;

		const start = Date.now();
		while (Date.now() - start < 8000) {
			const res = checkResult();
			if (res) return res;
			await sleep(50);
		}

		if (VersusMode.lastRoundResult) {
			const res = VersusMode.lastRoundResult;
			VersusMode.lastRoundResult = null;
			return res;
		}
		return null;
	}

	static syncGemsUI() {
		if (!player_me || !player_op) return;
		for (const tag of ["me", "op"]) {
			const p = tag === "me" ? player_me : player_op;
			const gem1 = document.getElementById(`gem1-${tag}`);
			const gem2 = document.getElementById(`gem2-${tag}`);
			if (gem1) gem1.classList.toggle("gem-on", p.health >= 1);
			if (gem2) gem2.classList.toggle("gem-on", p.health >= 2);
		}
	}

	static onGameEnded() {
		VersusMode.stopAllTimers();
		VersusMode.hideTurnHUD();
		if (VersusMode.isActive) {
			VersusMode.sendPacket("GAME_END_SYNC");
		}
	}

	static onGameEndSyncReceived() {
		const endScreen = document.getElementById("end-screen");
		if (endScreen && (endScreen.classList.contains("hide") || endScreen.style.opacity === "0" || !endScreen.children[0].className)) {
			if (typeof game !== "undefined" && game && game.endGame) {
				game.endGame();
			}
		}
	}

	
	// -------------------------------------------------------------
	// WATCHDOG ANTI-DEADLOCK & AUTO-RECUPERAÇÃO DE PARTIDA
	// -------------------------------------------------------------
	static startWatchdog() {
		VersusMode.stopWatchdog();
		VersusMode.watchdogInterval = setInterval(() => {
			VersusMode.runWatchdogTick();
		}, 1500);
	}

	static stopWatchdog() {
		if (VersusMode.watchdogInterval) {
			clearInterval(VersusMode.watchdogInterval);
			VersusMode.watchdogInterval = null;
		}
	}

	static runWatchdogTick() {
		if (!VersusMode.isActive) return;
		if (typeof game === "undefined" || !game || game.state !== GameState.PLAYING) return;
		if (!player_me || !player_op) return;

		// Se alguma ação/animação estiver ativa há mais de 8s, destrava a flag por segurança
		if (VersusMode.isActionExecuting) {
			if (Date.now() - VersusMode.actionStartTime > 8000) {
				console.warn("[VersusWatchdog] Ação remota/local demorou mais de 8s. Destravando flag de execução.");
				VersusMode.isActionExecuting = false;
				if (VersusMode.pendingTurnSync) {
					const sync = VersusMode.pendingTurnSync;
					VersusMode.pendingTurnSync = null;
					VersusMode.onTurnSyncReceived(sync);
				}
			}
			return;
		}

		// Caso 1: Ambos os jogadores passaram, mas a rodada ainda não foi encerrada
		if (player_me.passed && player_op.passed) {
			if (!game.isEndingRound) {
				console.warn("[VersusWatchdog] Ambos os jogadores passaram. Disparando encerramento de rodada.");
				game.isEndingRound = true;
				game.endRound().finally(() => {
					game.isEndingRound = false;
				});
			}
			return;
		}

		// Caso 2: O jogador que está com a vez já passou!
		if (game.currPlayer && game.currPlayer.passed) {
			const activeOpponent = game.currPlayer.opponent();
			if (activeOpponent && !activeOpponent.passed) {
				console.warn(`[VersusWatchdog] Jogador da vez (${game.currPlayer.tag}) já havia passado! Transferindo vez para ${activeOpponent.tag}.`);
				game.currPlayer = activeOpponent;
				ui.enablePlayer(game.currPlayer === player_me);
				if (game.currPlayer === player_me) {
					const passBtn = document.getElementById("pass-button");
					if (passBtn && !player_me.passed) passBtn.classList.remove("noclick");
				}
				VersusMode.updateTurnHUD(game.currPlayer === player_me);
				VersusMode.startTurnTimer(game.currPlayer === player_me);
				if (VersusMode.isHost) {
					VersusMode.broadcastTurnSync();
				}
				return;
			}
		}

		// Caso 3: SOFTLOCK DETECTADO! Ambos travados com noclick em <main>
		const mainElem = document.querySelector("main");
		const isMainLocked = mainElem && mainElem.classList.contains("noclick");

		if (VersusMode.isHost) {
			// No Host (Árbitro):
			if (game.currPlayer === player_me && !player_me.passed && isMainLocked) {
				const hasOpenModal = (typeof Carousel !== "undefined" && Carousel.curr) ||
				                     (typeof Popup !== "undefined" && Popup.curr) ||
				                     (document.getElementById("deck-customization") && !document.getElementById("deck-customization").classList.contains("hide"));
				if (!hasOpenModal) {
					console.warn("[VersusWatchdog-Host] Turno do Host bloqueado por 'noclick'. Destravando controles locais.");
					ui.enablePlayer(true);
					const passBtn = document.getElementById("pass-button");
					if (passBtn) passBtn.classList.remove("noclick");
					VersusMode.updateTurnHUD(true);
					if (VersusMode.turnInterval === null) {
						VersusMode.startTurnTimer(true);
					}
					VersusMode.broadcastTurnSync();
					return;
				}
			}

			// Se o cronômetro do turno foi interrompido indevidamente durante o jogo
			if (VersusMode.turnInterval === null) {
				const isMyTurn = (game.currPlayer === player_me);
				VersusMode.startTurnTimer(isMyTurn);
			}

			// Heartbeat periódico do Host para o Guest (a cada ~3.5s)
			if (Date.now() - VersusMode.lastTurnSyncTime > 3500) {
				VersusMode.broadcastTurnSync();
			}
		} else {
			// No Guest (Cliente):
			if (game.currPlayer === player_me && !player_me.passed && isMainLocked) {
				const hasOpenModal = (typeof Carousel !== "undefined" && Carousel.curr) ||
				                     (typeof Popup !== "undefined" && Popup.curr);
				if (!hasOpenModal) {
					console.warn("[VersusWatchdog-Guest] Turno do Guest bloqueado por 'noclick'. Destravando controles locais.");
					ui.enablePlayer(true);
					const passBtn = document.getElementById("pass-button");
					if (passBtn) passBtn.classList.remove("noclick");
					VersusMode.updateTurnHUD(true);
					if (VersusMode.turnInterval === null) {
						VersusMode.startTurnTimer(true);
					}
					return;
				}
			}

			// Se o Guest está em espera há mais de 4 segundos sem receber sincronização do Host
			if (Date.now() - VersusMode.lastTurnSyncTime > 4000) {
				VersusMode.lastTurnSyncTime = Date.now();
				VersusMode.sendPacket("REQ_TURN_SYNC");
			}

			// Se o cronômetro parou no Guest
			if (VersusMode.turnInterval === null) {
				const isMyTurn = (game.currPlayer === player_me);
				VersusMode.startTurnTimer(isMyTurn);
			}
		}
	}

	// -------------------------------------------------------------
	// HUD & QoL EM JOGO (BANNER DE TURNO + CRONÔMETRO)
	// -------------------------------------------------------------
	static showTurnHUD() {
		let hud = document.getElementById("versus-turn-hud");
		const container = document.querySelector("main") || document.body;
		if (!hud) {
			hud = document.createElement("div");
			hud.id = "versus-turn-hud";
			container.appendChild(hud);
		} else if (hud.parentNode !== container) {
			container.appendChild(hud);
		}
		hud.classList.remove("hide");
		VersusMode.updateTurnHUD(typeof game !== "undefined" && game.currPlayer === player_me);
	}

	static hideTurnHUD() {
		const hud = document.getElementById("versus-turn-hud");
		if (hud) hud.classList.add("hide");
	}

	static updateTurnHUD(isMyTurn) {
		let hud = document.getElementById("versus-turn-hud");
		const container = document.querySelector("main") || document.body;
		if (!hud) {
			hud = document.createElement("div");
			hud.id = "versus-turn-hud";
			container.appendChild(hud);
		} else if (hud.parentNode !== container) {
			container.appendChild(hud);
		}
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) {
			hud.classList.add("hide");
			return;
		}

		hud.classList.remove("hide");
		const opName = VersusMode.isActive
			? (VersusMode.remotePlayerName || "Adversário")
			: ((player_op && player_op.name) ? player_op.name : "Adversário");

		const tLeft = Math.max(0, VersusMode.turnTimeLeft);
		const isUrgent = tLeft <= 10 && VersusMode.turnInterval !== null;
		const timeFormatted = VersusMode.formatSeconds(tLeft);
		const pct = Math.max(0, Math.min(100, (tLeft / VersusMode.TURN_SECONDS) * 100));
		const showTimer = VersusMode.turnInterval !== null;

		if (player_me && player_me.passed && !isMyTurn) {
			hud.className = "passed" + (isUrgent ? " timer-urgent" : "");
			hud.innerHTML = `
				<div class="hud-turn-content">
					<span class="hud-turn-icon">🛡️</span>
					<span class="hud-turn-text">Você passou. Aguardando ${opName}...</span>
					${showTimer ? `<span class="hud-turn-timer ${isUrgent ? "urgent" : ""}">⏱ ${timeFormatted}</span>` : ""}
				</div>
				${showTimer ? `<div class="hud-turn-progress"><div class="hud-turn-progress-bar" style="width:${pct}%"></div></div>` : ""}
			`;
			return;
		}

		if (isMyTurn) {
			hud.className = "my-turn" + (isUrgent ? " timer-urgent" : "");
			hud.innerHTML = `
				<div class="hud-turn-content">
					<span class="hud-turn-icon">⚔️</span>
					<span class="hud-turn-text">Sua Vez de Jogar</span>
					${showTimer ? `<span class="hud-turn-timer ${isUrgent ? "urgent" : ""}">⏱ ${timeFormatted}</span>` : ""}
				</div>
				${showTimer ? `<div class="hud-turn-progress"><div class="hud-turn-progress-bar" style="width:${pct}%"></div></div>` : ""}
			`;
		} else {
			hud.className = "op-turn" + (isUrgent ? " timer-urgent" : "");
			hud.innerHTML = `
				<div class="hud-turn-content">
					<span class="hud-turn-icon">⏳</span>
					<span class="hud-turn-text">Turno de ${opName}...</span>
					${showTimer ? `<span class="hud-turn-timer ${isUrgent ? "urgent" : ""}">⏱ ${timeFormatted}</span>` : ""}
				</div>
				${showTimer ? `<div class="hud-turn-progress"><div class="hud-turn-progress-bar" style="width:${pct}%"></div></div>` : ""}
			`;
		}
	}

	// -------------------------------------------------------------
	// FIM DE JOGO & REVANCHE
	// -------------------------------------------------------------
	static requestRematch() {
		VersusMode.rematchRequestedByMe = true;
		VersusMode.sendPacket("REMATCH_REQUEST");

		const rematchBtn = document.getElementById("end-btn-rematch");
		if (rematchBtn) {
			rematchBtn.innerText = "Aguardando Oponente...";
			rematchBtn.disabled = true;
		}

		if (VersusMode.rematchRequestedByRemote) {
			if (VersusMode.isHost) {
				VersusMode.initiateMatchAsHost(!VersusMode.isFirstTurn);
			} else {
				VersusMode.sendPacket("REMATCH_ACCEPT");
			}
		}
	}

	static onRemoteRematchRequested() {
		if (VersusMode.rematchRequestedByMe) {
			if (VersusMode.isHost) {
				VersusMode.initiateMatchAsHost(!VersusMode.isFirstTurn);
			} else {
				VersusMode.sendPacket("REMATCH_ACCEPT");
			}
			return;
		}
		const rematchBtn = document.getElementById("end-btn-rematch");
		if (rematchBtn) {
			rematchBtn.innerText = "⚔ Aceitar Revanche!";
			rematchBtn.classList.add("highlight");
			rematchBtn.disabled = false;
		}
	}

	// Retorna da partida de volta à tela de preparação (Lobby)
	static returnToPreMatchLobby(notifyPeer = true) {
		VersusMode.stopAllTimers();
		VersusMode.isActive = false;
		VersusMode.hideTurnHUD();
		VersusMode.resetEmotesUI();

		if (notifyPeer) {
			VersusMode.sendPacket("RETURN_TO_LOBBY");
		}

		// Fecha tabuleiro e tela de fim
		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.add("hide");

		const endScreen = document.getElementById("end-screen");
		if (endScreen) {
			endScreen.classList.add("hide");
			endScreen.style.opacity = 0;
		}

		// Mantém menu principal fechado
		const mainMenu = document.getElementById("main-menu");
		if (mainMenu) mainMenu.classList.add("hide");

		// Reabre o modal de lobby no painel de pré-partida
		const modal = document.getElementById("versus-lobby-modal");
		if (modal) modal.classList.remove("hide");

		VersusMode.openPreMatchLobby();
	}

	static exitVersusToMenu() {
		VersusMode.stopAllTimers();
		VersusMode.isActive = false;
		VersusMode.cleanupPeer();
		VersusMode.hideTurnHUD();
		VersusMode.resetEmotesUI();

		// Oculta modal de alerta de desconexão e modal de lobby
		const alertModal = document.getElementById("versus-alert-modal");
		if (alertModal) alertModal.classList.add("hide");

		const lobbyModal = document.getElementById("versus-lobby-modal");
		if (lobbyModal) lobbyModal.classList.add("hide");

		// Fecha tabuleiro e tela de fim
		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.add("hide");

		const endScreen = document.getElementById("end-screen");
		if (endScreen) {
			endScreen.classList.add("hide");
			endScreen.style.opacity = 0;
		}

		// Retorna ao menu
		if (typeof MenuController !== "undefined") {
			MenuController.returnToMainMenu();
		}
	}

	// -------------------------------------------------------------
	// -------------------------------------------------------------
	// TRATAMENTO DE DESCONEXÃO & RECONEXÃO COM GRACE PERIOD (45s)
	// -------------------------------------------------------------
	static isReconnecting = false;
	static reconnectGraceTimer = null;
	static reconnectSecondsLeft = 45;

	static onPeerDisconnected() {
		VersusMode.stopAllTimers();
		const wasInMatch = VersusMode.isActive;

		// Se estava apenas na sala pré-jogo (ainda não iniciou a partida), volta às abas do Lobby
		const lobbyModal = document.getElementById("versus-lobby-modal");
		if (!wasInMatch && lobbyModal && !lobbyModal.classList.contains("hide")) {
			VersusMode.isActive = false;
			VersusMode.leaveRoomToInitialLobby();
			const statusElem = document.getElementById("versus-host-status");
			if (statusElem) statusElem.innerText = "O adversário saiu da sala. Aguardando novo oponente...";
			return;
		}

		// Se a partida estava em andamento, abre janela de carência de 45 segundos para reconexão!
		if (wasInMatch) {
			VersusMode.startReconnectionGracePeriod();
			return;
		}

		VersusMode.isActive = false;
		VersusMode.hideTurnHUD();
		VersusMode.resetEmotesUI();

		const modal = document.getElementById("versus-alert-modal");
		if (modal) {
			modal.classList.remove("hide");
		} else {
			alert("O adversário desconectou-se da partida.");
			VersusMode.exitVersusToMenu();
		}
	}

	static startReconnectionGracePeriod() {
		VersusMode.stopAllTimers();
		VersusMode.isReconnecting = true;
		VersusMode.reconnectSecondsLeft = 45;

		const modal = document.getElementById("versus-alert-modal");
		if (modal) {
			modal.classList.remove("hide");
			const title = modal.querySelector(".versus-alert-title");
			const desc = modal.querySelector(".versus-alert-desc");
			const btn = modal.querySelector("button");
			if (title) title.innerText = "Conexão Interrompida";
			if (desc) desc.innerHTML = 'O sinal com o adversário oscilou ou foi interrompido.<br>Tentando restabelecer conexão automaticamente...<br><br><strong style="font-size: 1.35rem; color: #ffd700;">Aguardando retorno: <span id="reconnect-countdown">45</span>s</strong>';
			if (btn) {
				btn.innerText = "Reivindicar Vitória (W.O.)";
				btn.onclick = () => VersusMode.claimDisconnectVictory();
			}
		}

		if (VersusMode.peer && VersusMode.peer.disconnected) {
			try { VersusMode.peer.reconnect(); } catch (e) {}
		}

		if (VersusMode.reconnectGraceTimer) clearInterval(VersusMode.reconnectGraceTimer);
		VersusMode.reconnectGraceTimer = setInterval(() => {
			VersusMode.reconnectSecondsLeft--;
			const span = document.getElementById("reconnect-countdown");
			if (span) span.innerText = String(Math.max(0, VersusMode.reconnectSecondsLeft));

			if (VersusMode.conn && VersusMode.conn.open) {
				VersusMode.onReconnectionSuccessful();
				return;
			}

			if (VersusMode.reconnectSecondsLeft <= 0) {
				clearInterval(VersusMode.reconnectGraceTimer);
				VersusMode.reconnectGraceTimer = null;
				VersusMode.claimDisconnectVictory();
			}
		}, 1000);
	}

	static onReconnectionSuccessful() {
		if (VersusMode.reconnectGraceTimer) {
			clearInterval(VersusMode.reconnectGraceTimer);
			VersusMode.reconnectGraceTimer = null;
		}
		VersusMode.isReconnecting = false;
		const modal = document.getElementById("versus-alert-modal");
		if (modal) modal.classList.add("hide");

		VersusMode.isActive = true;
		VersusMode.showTurnHUD();
		VersusMode.updateTurnHUD(game.currPlayer === player_me);
		if (typeof triggerHaptic === "function") triggerHaptic("medium");
		console.log("[VersusMode] Conexão P2P restabelecida com sucesso!");
	}

	static claimDisconnectVictory() {
		if (VersusMode.reconnectGraceTimer) {
			clearInterval(VersusMode.reconnectGraceTimer);
			VersusMode.reconnectGraceTimer = null;
		}
		VersusMode.isReconnecting = false;
		VersusMode.isActive = false;
		VersusMode.hideTurnHUD();
		VersusMode.resetEmotesUI();

		const modal = document.getElementById("versus-alert-modal");
		if (modal) {
			const title = modal.querySelector(".versus-alert-title");
			const desc = modal.querySelector(".versus-alert-desc");
			const btn = modal.querySelector("button");
			if (title) title.innerText = "Vitória por Desconexão (W.O.)";
			if (desc) desc.innerHTML = "O adversário não retornou à partida.<br>A vitória deste confronto foi concedida a você!";
			if (btn) {
				btn.innerText = "Voltar ao Menu Principal";
				btn.onclick = () => VersusMode.exitVersusToMenu();
			}
		} else {
			alert("O oponente não retornou. Vitória por W.O.!");
			VersusMode.exitVersusToMenu();
		}
		if (typeof triggerHaptic === "function") triggerHaptic("round_win");
	}

	// SISTEMA DE EMOTES RADIAIS (VERSUS P2P)
	// -------------------------------------------------------------
	static VERSUS_EMOTES = [
		{ id: "well_played", icon: "👏", text: "Boa jogada!", sub: "Elogio" },
		{ id: "thanks", icon: "🍻", text: "Obrigado.", sub: "Cortesia" },
		{ id: "luck_decide", icon: "🎲", text: "Que a sorte decida!", sub: "Desafio" },
		{ id: "another_pint", icon: "🍺", text: "Mais um hidromel?", sub: "Taverna" },
		{ id: "tough_round", icon: "⚔️", text: "Uma rodada difícil!", sub: "Tensão" },
		{ id: "damn_spy", icon: "🕵️", text: "Maldito espião!", sub: "Reação" },
		{ id: "surprise", icon: "⚡", text: "Não contava com isso!", sub: "Surpresa" },
		{ id: "hmm", icon: "🐺", text: "Hmm...", sub: "Geralt" }
	];

	static selectedEmoteIndex = 0;
	static lastEmoteSentTime = 0;
	static bubbleTimerMe = null;
	static bubbleTimerOp = null;
	static emotesInitialized = false;

	static initEmotes() {
		if (VersusMode.emotesInitialized) return;
		VersusMode.emotesInitialized = true;

		const slicesContainer = document.getElementById("versus-emote-slices");
		if (slicesContainer) {
			slicesContainer.innerHTML = "";
			const total = VersusMode.VERSUS_EMOTES.length;
			const radius = 152; // pixels

			VersusMode.VERSUS_EMOTES.forEach((emote, i) => {
				// -90deg is top (index 0)
				const angleDeg = -90 + (i * (360 / total));
				const angleRad = angleDeg * (Math.PI / 180);
				const x = Math.round(radius * Math.cos(angleRad));
				const y = Math.round(radius * Math.sin(angleRad));

				const sliceBtn = document.createElement("button");
				sliceBtn.type = "button";
				sliceBtn.className = `versus-emote-slice ${i === 0 ? "active" : ""}`;
				sliceBtn.dataset.index = String(i);
				sliceBtn.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

				sliceBtn.innerHTML = `
					<span class="versus-emote-slice-icon">${emote.icon}</span>
					<span class="versus-emote-slice-label">${emote.text}</span>
				`;

				sliceBtn.addEventListener("mouseenter", () => {
					VersusMode.selectEmoteByIndex(i);
				});

				sliceBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					VersusMode.selectEmoteByIndex(i);
					VersusMode.sendSelectedEmote();
				});

				slicesContainer.appendChild(sliceBtn);
			});
		}

		// Polar angle detection when moving mouse over the wheel
		const wheelEl = document.querySelector(".versus-emote-wheel");
		if (wheelEl) {
			wheelEl.addEventListener("mousemove", (e) => {
				const rect = wheelEl.getBoundingClientRect();
				const cx = rect.left + rect.width / 2;
				const cy = rect.top + rect.height / 2;
				const dx = e.clientX - cx;
				const dy = e.clientY - cy;
				const dist = Math.sqrt(dx * dx + dy * dy);

				// Only update if mouse is moved out of deadzone
				if (dist > 35) {
					const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
					// Normalize so -90deg (top) is 0:
					const norm = (angleDeg + 90 + 360 + 22.5) % 360;
					const idx = Math.floor(norm / 45);
					if (idx !== VersusMode.selectedEmoteIndex) {
						VersusMode.selectEmoteByIndex(idx);
					}
				}
			});
		}

		// Click on trigger button on board
		const triggerBtn = document.getElementById("btn-versus-emote-trigger");
		if (triggerBtn) {
			triggerBtn.onclick = (e) => {
				e.stopPropagation();
				VersusMode.toggleEmoteWheel();
			};
		}

		// Keyboard shortcut 'E' and number keys 1-8
		window.addEventListener("keydown", (e) => {
			if (!VersusMode.isActive) return;
			// Ignore if user is typing in an input
			const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
			if (tag === "input" || tag === "textarea") return;

			const wheelModal = document.getElementById("versus-emote-wheel-container");
			const isOpen = wheelModal && !wheelModal.classList.contains("hide");

			if (e.key === "e" || e.key === "E") {
				e.preventDefault();
				VersusMode.toggleEmoteWheel();
				return;
			}

			if (isOpen) {
				if (e.key === "Escape") {
					e.preventDefault();
					VersusMode.closeEmoteWheel();
					return;
				}
				if (e.key >= "1" && e.key <= "8") {
					e.preventDefault();
					const idx = parseInt(e.key, 10) - 1;
					VersusMode.selectEmoteByIndex(idx);
					VersusMode.sendSelectedEmote();
					return;
				}
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					VersusMode.sendSelectedEmote();
					return;
				}
			}
		});

		VersusMode.selectEmoteByIndex(0, false);
	}

	static openEmoteWheel() {
		if (!VersusMode.isActive) return;
		const wheelModal = document.getElementById("versus-emote-wheel-container");
		if (!wheelModal) return;

		VersusMode.initEmotes();
		wheelModal.classList.remove("hide");
		VersusMode.selectEmoteByIndex(VersusMode.selectedEmoteIndex || 0, false);

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static closeEmoteWheel() {
		const wheelModal = document.getElementById("versus-emote-wheel-container");
		if (wheelModal && !wheelModal.classList.contains("hide")) {
			wheelModal.classList.add("hide");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_back");
			}
		}
	}

	static toggleEmoteWheel() {
		const wheelModal = document.getElementById("versus-emote-wheel-container");
		if (!wheelModal) return;
		if (wheelModal.classList.contains("hide")) {
			VersusMode.openEmoteWheel();
		} else {
			VersusMode.closeEmoteWheel();
		}
	}

	static selectEmoteByIndex(idx, playSound = true) {
		const total = VersusMode.VERSUS_EMOTES.length;
		idx = ((idx % total) + total) % total;
		VersusMode.selectedEmoteIndex = idx;

		const emote = VersusMode.VERSUS_EMOTES[idx];
		if (!emote) return;

		// Update slice buttons styling
		const slices = document.querySelectorAll(".versus-emote-slice");
		slices.forEach((s, i) => {
			if (i === idx) {
				s.classList.add("active");
			} else {
				s.classList.remove("active");
			}
		});

		// Update center medallion
		const iconEl = document.getElementById("versus-emote-center-icon");
		if (iconEl) iconEl.textContent = emote.icon;

		const titleEl = document.getElementById("versus-emote-center-title");
		if (titleEl) titleEl.textContent = emote.text;

		const subEl = document.getElementById("versus-emote-center-sub");
		if (subEl) subEl.textContent = emote.sub || "Reação";

		if (playSound && typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_hover");
		}
	}

	static sendSelectedEmote() {
		const emote = VersusMode.VERSUS_EMOTES[VersusMode.selectedEmoteIndex];
		if (emote) {
			VersusMode.sendEmote(emote.id);
		}
	}

	static sendEmote(emoteId) {
		if (!VersusMode.isActive) return;
		const now = Date.now();
		if (now - VersusMode.lastEmoteSentTime < 1200) {
			// Anti-spam protection
			return;
		}
		VersusMode.lastEmoteSentTime = now;

		const emote = VersusMode.VERSUS_EMOTES.find(e => e.id === emoteId);
		if (!emote) return;

		// Transmit via PeerJS packet
		VersusMode.sendPacket("EMOTE", {
			emoteId: emote.id,
			text: emote.text,
			icon: emote.icon
		});

		// Render bubble for local player
		VersusMode.displaySpeechBubble("me", emote);

		// Dismiss wheel
		VersusMode.closeEmoteWheel();
	}

	static onRemoteEmoteReceived(payload) {
		if (!payload || !payload.text) return;
		VersusMode.displaySpeechBubble("op", payload);
	}

	static displaySpeechBubble(who, data) {
		const bubbleId = who === "me" ? "versus-speech-bubble-me" : "versus-speech-bubble-op";
		const bubble = document.getElementById(bubbleId);
		if (!bubble) return;

		const iconEl = bubble.querySelector(".bubble-icon");
		if (iconEl) iconEl.textContent = data.icon || "💬";

		const textEl = bubble.querySelector(".bubble-text");
		if (textEl) textEl.textContent = `"${data.text}"`;

		bubble.classList.remove("hide");
		// Reflow to restart animation smoothly
		void bubble.offsetWidth;
		bubble.classList.add("bubble-show");

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}

		if (who === "me") {
			if (VersusMode.bubbleTimerMe) clearTimeout(VersusMode.bubbleTimerMe);
			VersusMode.bubbleTimerMe = setTimeout(() => {
				bubble.classList.remove("bubble-show");
				setTimeout(() => bubble.classList.add("hide"), 250);
			}, 3500);
		} else {
			if (VersusMode.bubbleTimerOp) clearTimeout(VersusMode.bubbleTimerOp);
			VersusMode.bubbleTimerOp = setTimeout(() => {
				bubble.classList.remove("bubble-show");
				setTimeout(() => bubble.classList.add("hide"), 250);
			}, 3500);
		}
	}

	static resetEmotesUI() {
		const triggerBtn = document.getElementById("btn-versus-emote-trigger");
		if (triggerBtn) triggerBtn.classList.add("hide");

		VersusMode.closeEmoteWheel();

		const bMe = document.getElementById("versus-speech-bubble-me");
		if (bMe) {
			bMe.classList.remove("bubble-show");
			bMe.classList.add("hide");
		}
		const bOp = document.getElementById("versus-speech-bubble-op");
		if (bOp) {
			bOp.classList.remove("bubble-show");
			bOp.classList.add("hide");
		}

		if (VersusMode.bubbleTimerMe) clearTimeout(VersusMode.bubbleTimerMe);
		if (VersusMode.bubbleTimerOp) clearTimeout(VersusMode.bubbleTimerOp);
	}

}

// Exporta globalmente para o window
window.ControllerPeer = ControllerPeer;
window.VersusMode = VersusMode;

// Inicializa quando o documento estiver pronto (ou imediatamente se já carregado)
if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => VersusMode.init());
	} else {
		VersusMode.init();
	}
}
