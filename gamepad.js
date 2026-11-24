"use strict";

/**
 * GamepadManager - Comprehensive Controller Support for Gwent Classic
 * Supports Xbox, PlayStation, and DirectInput / XInput gamepads.
 * Provides full navigation across Main Menu, Deck Customization, Match Board,
 * Carousels, Popups, and End Game screens.
 */
const GamepadManager = {
	active: false,
	gamepadIndex: null,
	rafId: null,

	// Button and Axis state tracking for debouncing
	lastButtons: {},
	lastAxes: [0, 0, 0, 0],
	repeatTimer: 0,
	repeatDir: null,
	lastActiveTime: 0,

	// Navigation state per screen
	navState: {
		matchHandIndex: 0,
		matchRowIndex: 0,
		deckPanel: "bank", // 'bank', 'center', 'deck', 'top', 'bank_filters', 'deck_filters'
		deckBankIndex: 0,
		deckDeckIndex: 0,
		deckTopIndex: 0,
		deckCenterIndex: 0,
		deckBankFilterIndex: 0,
		deckDeckFilterIndex: 0,
		storySavesRow: 0,
		storySavesCol: 0,
		rulesModalIndex: 0,
		boardModalIndex: 0,
		opponentModalIndex: 0,
		versusLobbyIndex: 0,
		menuNavIndex: 0,
		menuPlayIndex: 0,
		menuSettingsRow: 0,
		menuAchTab: 0,
		endScreenBtnIndex: 1, // default Rematch
		popupBtnIndex: 0,
		storyModalBtnIndex: 0,
		storySetupFactionIndex: 0,
		storySetupBtnIndex: 1
	},

	// On-Screen Keyboard (OSK) State
	oskActive: false,
	oskTargetInput: null,
	oskRow: 1,
	oskCol: 0,
	oskShift: false,
	oskValue: "",


	// Story Map Modern Virtual Cursor State
	mapCursorX: 0,
	mapCursorY: 0,
	mapCursorInitialized: false,
	hoveredMapTarget: null,

	// Currently focused DOM element
	initialized: false,
	lastContext: null,
	currentFocusedElem: null,

	init() {
		if (this.initialized) return;
		this.initialized = true;

		window.addEventListener("gamepadconnected", e => this.onConnected(e));
		window.addEventListener("gamepaddisconnected", e => this.onDisconnected(e));

		// Detect mouse movement to toggle controller HUD visibility gracefully
		let lastMouseX = 0, lastMouseY = 0;
		window.addEventListener("mousemove", e => {
			if (Math.abs(e.clientX - lastMouseX) > 8 || Math.abs(e.clientY - lastMouseY) > 8) {
				lastMouseX = e.clientX;
				lastMouseY = e.clientY;
				if (this.active && Date.now() - this.lastActiveTime > 2500) {
					this.setGamepadActive(false);
				}
			}
		});

		
		// Keyboard navigation support for OSK
		window.addEventListener("keydown", (e) => {
			if (!this.oskActive) return;
			if (e.key === "ArrowUp") { e.preventDefault(); this.navOSK("up"); }
			else if (e.key === "ArrowDown") { e.preventDefault(); this.navOSK("down"); }
			else if (e.key === "ArrowLeft") { e.preventDefault(); this.navOSK("left"); }
			else if (e.key === "ArrowRight") { e.preventDefault(); this.navOSK("right"); }
			else if (e.key === "Enter") { e.preventDefault(); this.closeOSK(true); }
			else if (e.key === "Escape") { e.preventDefault(); this.closeOSK(false); }
		});

		// Check initial gamepads
		let initialFound = false;
		try {
			const pads = navigator.getGamepads ? navigator.getGamepads() : [];
			for (let i = 0; i < pads.length; i++) {
				if (pads[i]) {
					this.gamepadIndex = pads[i].index;
					const name = pads[i].id || "Gamepad";
					const cleanName = name.includes("Xbox") ? "Xbox Controller" 
						: name.includes("DualSense") ? "PS5 DualSense"
						: name.includes("Wireless") ? "PlayStation Controller" : "Controle";
					this.showToast(((typeof I18N !== "undefined") ? I18N.t("pad_connected", "Controle Conectado") : "Controle Conectado") + ": " + cleanName);
					if (typeof Debugger !== "undefined" && Debugger.log) {
						Debugger.log(`🎮 Gamepad detectado: ${cleanName} [Slot ${pads[i].index}] (${name})`, "system");
					}
					this.setGamepadActive(true);
					initialFound = true;
					break;
				}
			}
		} catch (err) {
			console.warn("Erro ao ler gamepads iniciais:", err);
		}

		if (!initialFound && typeof Debugger !== "undefined" && Debugger.log) {
			Debugger.log("🎮 GamepadManager pronto. Pressione qualquer botão do controle para ativá-lo.", "system");
		}

		// Start polling loop
		this.startPolling();
	},

	onConnected(e) {
		this.gamepadIndex = e.gamepad.index;
		const name = e.gamepad.id || "Gamepad";
		const cleanName = name.includes("Xbox") ? "Xbox Controller" 
			: name.includes("DualSense") ? "PS5 DualSense"
			: name.includes("Wireless") ? "PlayStation Controller" : "Controle";
		this.showToast(((typeof I18N !== "undefined") ? I18N.t("pad_connected", "Controle Conectado") : "Controle Conectado") + ": " + cleanName);
		if (typeof Debugger !== "undefined" && Debugger.log) {
			Debugger.log(`🎮 Gamepad Conectado: ${cleanName} [Slot ${e.gamepad.index}] (${name})`, "system");
		}
		this.setGamepadActive(true);
	},

	onDisconnected(e) {
		if (this.gamepadIndex === e.gamepad.index) {
			const name = e.gamepad.id || "Gamepad";
			this.gamepadIndex = null;
			this.setGamepadActive(false);
			this.showToast((typeof I18N !== "undefined") ? I18N.t("pad_disconnected", "Controle Desconectado") : "Controle Desconectado");
			if (typeof Debugger !== "undefined" && Debugger.log) {
				Debugger.log(`🎮 Gamepad Desconectado: Slot ${e.gamepad.index} (${name})`, "warn");
			}
		}
	},

	showToast(text) {
		const toast = document.getElementById("gamepad-toast");
		const toastText = document.getElementById("gamepad-toast-text");
		if (toast && toastText) {
			toastText.textContent = text;
			toast.classList.remove("hide");
			toast.classList.add("show");
			setTimeout(() => {
				toast.classList.remove("show");
				setTimeout(() => toast.classList.add("hide"), 300);
			}, 3000);
		}
	},

	setGamepadActive(active) {
		this.active = active;
		const hud = document.getElementById("gamepad-hud");
		if (hud) {
			if (active) hud.classList.add("visible");
			else hud.classList.remove("visible");
		}
		if (!active) {
			this.clearFocus();
			this.hideMapCursor();
		} else {
			this.lastActiveTime = Date.now();
			this.refreshFocus();
		}
	},

	hideMapCursor() {
		const cursorEl = document.getElementById("story-gamepad-cursor");
		if (cursorEl) cursorEl.classList.add("hide");
		if (this.hoveredMapTarget) {
			this.hoveredMapTarget.classList.remove("gamepad-hover");
			this.hoveredMapTarget = null;
		}
	},

	startPolling() {
		if (this.rafId) cancelAnimationFrame(this.rafId);
		const loop = () => {
			this.poll();
			this.rafId = requestAnimationFrame(loop);
		};
		this.rafId = requestAnimationFrame(loop);
	},

	getGamepad() {
		if (!navigator.getGamepads) return null;
		let pads;
		try {
			pads = navigator.getGamepads();
		} catch (e) {
			return null;
		}
		if (!pads) return null;

		// 1. Verifica se há algum controle com ação/interação física recente
		let firstValid = null;
		for (let i = 0; i < pads.length; i++) {
			const pad = pads[i];
			if (!pad) continue;
			if (!firstValid) firstValid = pad;

			const anyBtn = pad.buttons && pad.buttons.some(b => b && (b.pressed || b.value > 0.35));
			const anyAxis = pad.axes && pad.axes.some(a => Math.abs(a) > 0.35);
			if (anyBtn || anyAxis) {
				if (this.gamepadIndex !== pad.index) {
					this.gamepadIndex = pad.index;
					if (typeof Debugger !== "undefined" && Debugger.log) {
						Debugger.log(`🎮 Gamepad ativo comutado para Slot ${pad.index} (${pad.id})`, "info");
					}
				}
				return pad;
			}
		}

		// 2. Se nenhum botão estiver sendo segurado agora, retorna o gamepad ativo
		if (this.gamepadIndex !== null && pads[this.gamepadIndex]) {
			return pads[this.gamepadIndex];
		}

		// 3. Fallback para o primeiro controle válido encontrado
		if (firstValid) {
			this.gamepadIndex = firstValid.index;
			return firstValid;
		}

		return null;
	},

	// Identifies the active screen context
	getContext() {
		// 1. Teclado Virtual (OSK) tem prioridade máxima quando aberto
		if (this.oskActive) {
			const osk = document.getElementById("gamepad-osk-modal");
			if (osk && !osk.classList.contains("hide")) return "OSK";
		}

		const ingameDialog = document.getElementById("ingame-dialog-modal");
		if (ingameDialog && !ingameDialog.classList.contains("hide")) return "INGAME_DIALOG";

		const rulesModal = document.getElementById("rules-modal");
		if (rulesModal && !rulesModal.classList.contains("hide")) return "RULES_MODAL";

		const boardModal = document.getElementById("board-modal");
		if (boardModal && !boardModal.classList.contains("hide")) return "BOARD_MODAL";

		const opponentModal = document.getElementById("opponent-modal");
		if (opponentModal && !opponentModal.classList.contains("hide")) return "OPPONENT_MODAL";

		const storySavesModal = document.getElementById("story-saves-modal");
		if (storySavesModal && !storySavesModal.classList.contains("hide")) return "STORY_SAVES";
		const versusAlert = document.getElementById("versus-alert-modal");
		if (versusAlert && !versusAlert.classList.contains("hide")) return "VERSUS_ALERT";

		const versusEmote = document.getElementById("versus-emote-wheel-container");
		if (versusEmote && !versusEmote.classList.contains("hide")) return "VERSUS_EMOTE";

		const versusLobby = document.getElementById("versus-lobby-modal");
		if (versusLobby && !versusLobby.classList.contains("hide")) return "VERSUS_LOBBY";

		const popup = document.getElementById("popup");
		if (popup && !popup.classList.contains("hide")) return "POPUP";

		const carousel = document.getElementById("carousel");
		if (carousel && !carousel.classList.contains("hide")) return "CAROUSEL";

		// Story Outcome Modal (renders above end-screen and match board)
		const outcomeModal = document.getElementById("story-outcome-modal");
		if (outcomeModal && !outcomeModal.classList.contains("hide")) return "STORY_MODAL";

		// Any open Story Modal (Battle, Tournament, Shop, Compendium)
		const storyModals = ["story-battle-modal", "story-tournament-modal", "story-shop-modal", "story-compendium-modal", "avatar-picker-modal"];
		for (const id of storyModals) {
			const m = document.getElementById(id);
			if (m && !m.classList.contains("hide")) return "STORY_MODAL";
		}

		// Story New Campaign Setup Screen
		const setupView = document.getElementById("story-setup-view");
		if (setupView && !setupView.classList.contains("hide")) return "STORY_SETUP";

		// Story Continent Map Screen
		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen && !mapScreen.classList.contains("hide")) return "STORY_MAP";

		const endScreen = document.getElementById("end-screen");
		if (endScreen && !endScreen.classList.contains("hide")) return "END_SCREEN";

		const mainMenu = document.getElementById("main-menu");
		if (mainMenu && !mainMenu.classList.contains("hide")) {
			const nav = document.getElementById("menu-nav");
			if (nav && nav.classList.contains("active")) return "MENU_NAV";
			const play = document.getElementById("menu-play");
			if (play && play.classList.contains("active")) return "MENU_PLAY";
			const set = document.getElementById("menu-settings");
			if (set && set.classList.contains("active")) return "MENU_SETTINGS";
			const ach = document.getElementById("menu-achievements");
			if (ach && ach.classList.contains("active")) return "MENU_ACHIEVEMENTS";
			const cred = document.getElementById("menu-credits");
			if (cred && cred.classList.contains("active")) return "MENU_CREDITS";
			return "MENU_NAV";
		}

		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom && !deckCustom.classList.contains("hide")) return "DECK_CUSTOMIZATION";

		// Match gameplay
		const cardPreview = document.querySelector(".card-preview");
		const isPreviewOpen = cardPreview && !cardPreview.classList.contains("hide");
		if (typeof ui !== "undefined" && ui.previewCard !== null && isPreviewOpen) {
			return "MATCH_TARGETING";
		}

		return "MATCH_HAND";
	},

	isPlayerTurn() {
		if (typeof game !== "undefined" && game && game.currPlayer) {
			return (game.currPlayer === player_me);
		}
		const main = document.querySelector("main");
		return main ? !main.classList.contains("noclick") : true;
	},

	poll() {
		const pad = this.getGamepad();
		if (!pad) return;

		// Button mappings (Standard Gamepad)
		// 0: A, 1: B, 2: X, 3: Y, 4: LB, 5: RB, 6: LT, 7: RT, 8: Back, 9: Start, 12: Up, 13: Down, 14: Left, 15: Right
		const b = pad.buttons;
		const a = pad.axes;

		// Digital stick conversion
		const stickLeft = (a[0] < -0.5);
		const stickRight = (a[0] > 0.5);
		const stickUp = (a[1] < -0.5);
		const stickDown = (a[1] > 0.5);
		const rStickMoved = (Math.abs(a[2] || 0) > 0.2 || Math.abs(a[3] || 0) > 0.2);

		const isPressed = (idx) => !!(b[idx] && (b[idx].pressed || b[idx].value > 0.35));

		const dUp = isPressed(12) || stickUp;
		const dDown = isPressed(13) || stickDown;
		const dLeft = isPressed(14) || stickLeft;
		const dRight = isPressed(15) || stickRight;

		const btnA = isPressed(0);
		const btnB = isPressed(1);
		const btnX = isPressed(2);
		const btnY = isPressed(3);
		const btnLB = isPressed(4);
		const btnRB = isPressed(5);
		const btnLT = isPressed(6);
		const btnRT = isPressed(7);
		const btnSelect = isPressed(8);
		const btnStart = isPressed(9);
		const btnLS = isPressed(10);
		const btnRS = isPressed(11);

		// Check if any controller input occurred
		const anyStick = (Math.abs(a[0] || 0) > 0.18 || Math.abs(a[1] || 0) > 0.18 || rStickMoved);
		const anyAction = dUp || dDown || dLeft || dRight || anyStick || btnA || btnB || btnX || btnY || btnLB || btnRB || btnLT || btnRT || btnSelect || btnStart || btnLS || btnRS;
		if (anyAction) {
			if (!this.active) {
				this.setGamepadActive(true);
			}
			this.lastActiveTime = Date.now();
		}

		if (!this.active) return;

		const context = this.getContext();
		if (this.lastContext !== context) {
			this.lastContext = context;
			this.applyContextFocus(context);
		}
		this.updateHUD(context);

		// Continuous analog cursor & map pan/zoom when in STORY_MAP
		if (context === "STORY_MAP") {
			this.updateStoryMapCursor(pad);
		} else {
			this.hideMapCursor();
			this.handleRightStickScroll(pad, context);
		}

		// Handle Directional inputs with repeat curve (260ms initial delay, 110ms repeat)
		const now = performance.now();
		let activeDir = null;
		if (context !== "STORY_MAP") {
			if (dUp) activeDir = "up";
			else if (dDown) activeDir = "down";
			else if (dLeft) activeDir = "left";
			else if (dRight) activeDir = "right";
		}

		if (activeDir) {
			if (this.repeatDir !== activeDir) {
				this.repeatDir = activeDir;
				this.repeatTimer = now + 260;
				this.handleDirection(activeDir, context);
			} else if (now > this.repeatTimer) {
				this.repeatTimer = now + 110;
				this.handleDirection(activeDir, context);
			}
		} else {
			this.repeatDir = null;
		}

		// Handle Action Buttons (Trigger on edge release -> press only)
		const checkEdge = (key, state, handler) => {
			if (state && !this.lastButtons[key]) {
				handler();
			}
			this.lastButtons[key] = state;
		};

		checkEdge("A", btnA, () => this.handleAction("A", context));
		checkEdge("B", btnB, () => this.handleAction("B", context));
		checkEdge("X", btnX, () => this.handleAction("X", context));
		checkEdge("Y", btnY, () => this.handleAction("Y", context));
		checkEdge("LB", btnLB, () => this.handleAction("LB", context));
		checkEdge("RB", btnRB, () => this.handleAction("RB", context));
		checkEdge("Select", btnSelect, () => this.handleAction("Select", context));
		checkEdge("Start", btnStart, () => this.handleAction("Start", context));
		checkEdge("LS", btnLS, () => this.handleAction("LS", context));
		checkEdge("RS", btnRS, () => this.handleAction("RS", context));
	},

	// Sets focus on a DOM element with Witcher gold highlight & audio
	setFocus(elem, playAudio = true) {
		if (!elem) return;
		if (this.currentFocusedElem === elem) return;

		if (this.currentFocusedElem) {
			this.currentFocusedElem.classList.remove("gamepad-focused");
		}

		this.currentFocusedElem = elem;
		elem.classList.add("gamepad-focused");

		if (elem.scrollIntoView) {
			elem.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
		}

		if (playAudio && typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_hover");
		}
	},

	clearFocus() {
		if (this.currentFocusedElem) {
			this.currentFocusedElem.classList.remove("gamepad-focused");
			this.currentFocusedElem = null;
		}
	},

	refreshFocus() {
		const context = this.getContext();
		this.applyContextFocus(context);
	},

	handleDirection(dir, context) {
		switch (context) {
			case "OSK":
				this.navOSK(dir);
				break;
			case "STORY_SAVES":
				this.navStorySaves(dir);
				break;
			case "RULES_MODAL":
				this.navRulesModal(dir);
				break;
			case "BOARD_MODAL":
				this.navBoardModal(dir);
				break;
			case "OPPONENT_MODAL":
				this.navOpponentModal(dir);
				break;
			case "INGAME_DIALOG":
				this.navInGameDialog(dir);
				break;
			case "POPUP":
				this.navPopup(dir);
				break;
			case "CAROUSEL":
				this.navCarousel(dir);
				break;
			case "END_SCREEN":
				this.navEndScreen(dir);
				break;
			case "MENU_NAV":
				this.navMenuNav(dir);
				break;
			case "MENU_PLAY":
				this.navMenuPlay(dir);
				break;
			case "MENU_SETTINGS":
				this.navMenuSettings(dir);
				break;
			case "MENU_ACHIEVEMENTS":
				this.navMenuAchievements(dir);
				break;
			case "MENU_CREDITS":
				this.navMenuCredits(dir);
				break;
			case "DECK_CUSTOMIZATION":
				this.navDeckCustomization(dir);
				break;
			case "MATCH_HAND":
				this.navMatchHand(dir);
				break;
			case "MATCH_TARGETING":
				this.navMatchTargeting(dir);
				break;
			case "STORY_MODAL":
				this.navStoryModal(dir);
				break;
			case "STORY_SETUP":
				this.navStorySetup(dir);
				break;
			case "VERSUS_LOBBY":
				this.navVersusLobby(dir);
				break;
			case "VERSUS_EMOTE":
				this.navVersusEmote(dir);
				break;
			case "VERSUS_ALERT":
				this.navVersusAlert(dir);
				break;
		}
	},

	handleAction(action, context) {
		// Se o Teclado Virtual (OSK) estiver ativo, delega as ações para o OSK
		if (context === "OSK") {
			this.handleActionOSK(action);
			return;
		}

		// Se o usuário apertar A sobre qualquer input ou textarea no jogo, abre o Teclado Virtual
		if (action === "A" && this.currentFocusedElem) {
			const tag = (this.currentFocusedElem.tagName || "").toLowerCase();
			if (tag === "input" || tag === "textarea") {
				this.openOSK(this.currentFocusedElem, "DIGITAR COM O CONTROLE");
				return;
			}
		}

		switch (context) {
			case "STORY_SAVES":
				if (action === "A") {
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				} else if (action === "Y") {
					if (typeof StoryMode !== "undefined") StoryMode.startNewCampaignFromMenu();
				} else if (action === "B") {
					if (typeof StoryMode !== "undefined") StoryMode.closeSavesModal();
				}
				break;

			case "RULES_MODAL":
				if (action === "A") {
					if (this.currentFocusedElem) {
						if (this.currentFocusedElem.classList && this.currentFocusedElem.classList.contains("rules-checkbox-item")) {
							const input = this.currentFocusedElem.querySelector("input[type='checkbox']");
							if (input) {
								input.checked = !input.checked;
								input.dispatchEvent(new Event("change", { bubbles: true }));
							} else {
								this.currentFocusedElem.click();
							}
						} else {
							this.currentFocusedElem.click();
						}
					}
				} else if (action === "B") {
					if (typeof DeckMaker !== "undefined" && DeckMaker.closeRulesModal) {
						DeckMaker.closeRulesModal();
					} else {
						const closeBtn = document.querySelector("#rules-modal .witcher-modal-close");
						if (closeBtn) closeBtn.click();
					}
				}
				break;

			case "BOARD_MODAL":
				if (action === "A") {
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				} else if (action === "B") {
					if (typeof DeckMaker !== "undefined" && DeckMaker.closeBoardModal) {
						DeckMaker.closeBoardModal();
					} else {
						const closeBtn = document.querySelector("#board-modal .witcher-modal-close");
						if (closeBtn) closeBtn.click();
					}
				}
				break;

			case "OPPONENT_MODAL":
				if (action === "A") {
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				} else if (action === "B") {
					if (typeof DeckMaker !== "undefined" && DeckMaker.closeOpponentModal) {
						DeckMaker.closeOpponentModal();
					} else {
						const closeBtn = document.querySelector("#opponent-modal .witcher-modal-close");
						if (closeBtn) closeBtn.click();
					}
				}
				break;

			case "INGAME_DIALOG": {
				const confirmBtn = document.getElementById("ingame-dialog-confirm-btn");
				const cancelBtn = document.getElementById("ingame-dialog-cancel-btn");
				const hasCancel = cancelBtn && !cancelBtn.classList.contains("hide");
				if (action === "A" || action === "Start") {
					if (this.currentFocusedElem && (this.currentFocusedElem === confirmBtn || (hasCancel && this.currentFocusedElem === cancelBtn))) {
						this.currentFocusedElem.click();
					} else if (confirmBtn) {
						confirmBtn.click();
					}
					setTimeout(() => this.refreshFocus(), 50);
				} else if (action === "B") {
					if (hasCancel) {
						cancelBtn.click();
					} else if (confirmBtn) {
						confirmBtn.click();
					}
					setTimeout(() => this.refreshFocus(), 50);
				}
				break;
			}

			case "STORY_MAP":
				if (action === "A") {
					if (this.hoveredMapTarget) {
						this.hoveredMapTarget.click();
					}
				} else if (action === "X") {
					if (typeof StoryMode !== "undefined") StoryMode.openCampaignDeckBuilder();
				} else if (action === "Y") {
					if (typeof StoryMode !== "undefined") StoryMode.openCompendiumModal("all", "all");
				} else if (action === "LB") {
					if (typeof StoryMode !== "undefined") {
						StoryMode.focusCurrentNode();
						this.mapCursorX = window.innerWidth / 2;
						this.mapCursorY = window.innerHeight / 2;
					}
				} else if (action === "RB") {
					if (typeof StoryMode !== "undefined") StoryMode.resetMapToContinent();
				} else if (action === "B" || action === "Start") {
					const statsDrawer = document.getElementById("story-player-stats-drawer");
					const headerDropdown = document.getElementById("story-hud-dropdown-menu");
					if (action === "B" && statsDrawer && !statsDrawer.classList.contains("hide")) {
						if (typeof StoryMode !== "undefined") StoryMode.toggleStatsDrawer(false);
					} else if (action === "B" && headerDropdown && !headerDropdown.classList.contains("hide")) {
						if (typeof StoryMode !== "undefined") StoryMode.closeHeaderDropdown();
					} else if (typeof StoryMode !== "undefined") {
						StoryMode.closeMapToMenu();
					}
				}
				break;

			case "STORY_MODAL": {
				const outcomeModal = document.getElementById("story-outcome-modal");
				const isOutcome = outcomeModal && !outcomeModal.classList.contains("hide");
				if (action === "A") {
					if (this.currentFocusedElem) {
						this.currentFocusedElem.click();
					} else if (isOutcome) {
						const actBtn = document.getElementById("story-outcome-action-btn");
						if (actBtn) actBtn.click();
					}
					setTimeout(() => this.refreshFocus(), 60);
				} else if (action === "B") {
					const avatarModal = document.getElementById("avatar-picker-modal");
					if (avatarModal && !avatarModal.classList.contains("hide")) {
						if (typeof AvatarManager !== "undefined") AvatarManager.closePicker();
					} else if (isOutcome) {
						const actBtn = document.getElementById("story-outcome-action-btn");
						if (actBtn) actBtn.click();
					} else if (typeof StoryMode !== "undefined") {
						StoryMode.closeAllModals();
					}
				}
				break;
			}

			case "STORY_SETUP":
				if (action === "A") {
					if (this.currentFocusedElem) {
						this.currentFocusedElem.click();
					} else if (typeof StoryMode !== "undefined") {
						StoryMode.confirmStartCampaign();
					}
				} else if (action === "Start") {
					if (typeof StoryMode !== "undefined") StoryMode.confirmStartCampaign();
				} else if (action === "LB") {
					this.cycleStorySetupFaction(-1);
				} else if (action === "RB") {
					this.cycleStorySetupFaction(1);
				} else if (action === "B") {
					const setupView = document.getElementById("story-setup-view");
					if (setupView) setupView.classList.add("hide");
					if (typeof MenuController !== "undefined") MenuController.returnToMainMenu();
				}
				break;

			case "POPUP":
				if (action === "A") {
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				} else if (action === "B") {
					if (typeof Popup !== "undefined" && Popup.curr) Popup.curr.selectNo();
				}
				break;

			case "CAROUSEL":
				if (action === "A") {
					if (typeof Carousel !== "undefined" && Carousel.curr) Carousel.curr.select({ stopPropagation: () => {} });
				} else if (action === "B") {
					if (typeof Carousel !== "undefined" && Carousel.curr) Carousel.curr.cancel();
				}
				break;

			case "END_SCREEN":
				if (action === "A") {
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				}
				break;

			case "MENU_NAV":
				if (action === "A") {
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				}
				break;

			case "MENU_PLAY":
				if (action === "A") {
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				} else if (action === "B") {
					MenuController.showView("nav");
				}
				break;

			case "MENU_SETTINGS":
				if (action === "B") {
					MenuController.showView("nav");
				}
				break;

			case "MENU_ACHIEVEMENTS":
				if (action === "B") {
					MenuController.showView("nav");
				}
				break;

			case "MENU_CREDITS":
				if (action === "B") {
					MenuController.showView("nav");
				}
				break;

			case "DECK_CUSTOMIZATION":
				if (action === "A") {
					if (this.currentFocusedElem) {
						const elem = this.currentFocusedElem;
						// Direct handler for Opponent, Board, Rules and Leader cards in Center Column
						if (elem.id === "op-preview-card" || elem.id === "opponent-preview" || (elem.closest && elem.closest("#opponent-preview"))) {
							if (typeof DeckMaker !== "undefined" && DeckMaker.openOpponentModal) {
								DeckMaker.openOpponentModal();
							} else {
								const b = document.getElementById("op-preview-card");
								if (b) b.click();
							}
							return;
						}
						if (elem.id === "board-preview-card" || elem.id === "board-preview" || (elem.closest && elem.closest("#board-preview"))) {
							if (typeof DeckMaker !== "undefined" && DeckMaker.openBoardModal) {
								DeckMaker.openBoardModal();
							} else {
								const b = document.getElementById("board-preview-card");
								if (b) b.click();
							}
							return;
						}
						if (elem.id === "rules-preview-card" || elem.id === "rules-preview" || (elem.closest && elem.closest("#rules-preview"))) {
							if (typeof DeckMaker !== "undefined" && DeckMaker.openRulesModal) {
								DeckMaker.openRulesModal();
							} else {
								const b = document.getElementById("rules-preview-card");
								if (b) b.click();
							}
							return;
						}
						if (elem.id === "card-leader" || (elem.closest && elem.closest("#card-leader"))) {
							if (typeof dm !== "undefined" && dm.cycleLeader) {
								dm.cycleLeader(1);
							} else {
								elem.click();
							}
							return;
						}

						elem.click();
						if (elem.classList.contains("card-lg")) {
							setTimeout(() => {
								const panelId = (this.navState.deckPanel === "bank") ? "card-bank" : "card-deck";
								const cards = Array.from(document.querySelectorAll(`#${panelId} .card-lg:not(.hide):not(.empty)`));
								if (cards.length > 0) {
									let idx = (this.navState.deckPanel === "bank") ? this.navState.deckBankIndex : this.navState.deckDeckIndex;
									idx = Math.max(0, Math.min(cards.length - 1, idx || 0));
									this.setFocus(cards[idx], false);
								} else {
									this.switchDeckPanel("center");
								}
							}, 60);
						}
					}
				} else if (action === "B") {
					if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
						StoryMode.closeCampaignDeckBuilder();
					} else if (typeof VersusMode !== "undefined" && VersusMode.isCustomizingDeck) {
						VersusMode.closeDeckBuilderForVersus();
					} else {
						MenuController.returnToMainMenu();
					}
				} else if (action === "LB") {
					this.cycleDeckMajorPanel(-1);
				} else if (action === "RB") {
					this.cycleDeckMajorPanel(1);
				} else if (action === "LT") {
					this.cycleDeckFilterTabs(-1);
				} else if (action === "RT") {
					this.cycleDeckFilterTabs(1);
				} else if (action === "X") {
					const nextLBtn = document.getElementById("btn-leader-next");
					if (nextLBtn) nextLBtn.click();
				} else if (action === "Y") {
					if (typeof dm !== "undefined" && dm.selectFaction) dm.selectFaction();
				} else if (action === "Start") {
					if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
						StoryMode.closeCampaignDeckBuilder();
					} else {
						const startBtn = document.getElementById("start-game") || document.getElementById("btn-versus-deck-confirm");
						if (startBtn) startBtn.click();
					}
				}
				break;

			case "MATCH_HAND":
				if (action === "Start") {
					const exitBtn = document.getElementById("exit-game");
					if (exitBtn) exitBtn.click();
					return;
				}
				if (action === "RS") {
					if (typeof VersusMode !== "undefined" && VersusMode.toggleEmoteWheel) {
						VersusMode.toggleEmoteWheel();
					}
					return;
				}

				if (action === "A" && this.currentFocusedElem && (
					this.currentFocusedElem.classList.contains("duel-utility-btn") ||
					this.currentFocusedElem.id === "forfeit-button" ||
					this.currentFocusedElem.id === "match-rules-indicator"
				)) {
					this.currentFocusedElem.click();
					return;
				}

				if (!this.isPlayerTurn()) return;

				if (action === "A") {
					if (this.currentFocusedElem) {
						this.currentFocusedElem.click();
						setTimeout(() => {
							if (this.getContext() === "MATCH_TARGETING") {
								this.navState.matchRowIndex = 0;
								this.applyContextFocus("MATCH_TARGETING");
							}
						}, 40);
					}
				} else if (action === "B") {
					if (typeof ui !== "undefined" && ui.cancel) {
						ui.cancel();
					}
					const bg = document.getElementById("click-background");
					if (bg && !bg.classList.contains("noclick")) bg.click();
					this.applyContextFocus("MATCH_HAND");
				} else if (action === "Y") {
					const passBtn = document.getElementById("pass-button");
					if (passBtn && !passBtn.classList.contains("noclick")) passBtn.click();
				} else if (action === "X") {
					const leaderMe = document.getElementById("leader-me");
					if (leaderMe && !leaderMe.classList.contains("noclick")) {
						const leaderContainer = leaderMe.querySelector(".leader-container");
						if (leaderContainer) leaderContainer.click();
					}
				}
				break;

			case "MATCH_TARGETING":
				if (action === "A") {
					const selectables = Array.from(document.querySelectorAll(".row-selectable, #field-me .card:not(.noclick)"));
					const targetElem = (this.currentFocusedElem && selectables.includes(this.currentFocusedElem))
						? this.currentFocusedElem
						: (selectables.length > 0 ? selectables[Math.min(selectables.length - 1, this.navState.matchRowIndex || 0)] : null);
					this.clearFocus();
					if (targetElem) {
						targetElem.click();
					}
					setTimeout(() => {
						this.navState.matchRowIndex = 0;
						this.applyContextFocus(this.getContext());
					}, 120);
				} else if (action === "B") {
					if (typeof ui !== "undefined" && ui.cancel) {
						ui.cancel();
					}
					const bg = document.getElementById("click-background");
					if (bg && !bg.classList.contains("noclick")) bg.click();
					this.clearFocus();
					this.navState.matchRowIndex = 0;
					setTimeout(() => {
						this.applyContextFocus("MATCH_HAND");
					}, 40);
				}
				break;

			case "VERSUS_EMOTE":
				if (action === "A") {
					if (typeof VersusMode !== "undefined" && VersusMode.sendSelectedEmote) {
						VersusMode.sendSelectedEmote();
					}
				} else if (action === "B" || action === "RS") {
					if (typeof VersusMode !== "undefined" && VersusMode.closeEmoteWheel) {
						VersusMode.closeEmoteWheel();
					}
				}
				break;

			case "VERSUS_ALERT":
				if (action === "A" || action === "B" || action === "Start") {
					if (typeof VersusMode !== "undefined" && VersusMode.exitVersusToMenu) {
						VersusMode.exitVersusToMenu();
					}
				}
				break;

			case "VERSUS_LOBBY": {
				const prematch = document.getElementById("versus-prematch-panel");
				const isPrematch = prematch && getComputedStyle(prematch).display !== "none";

				if (isPrematch) {
					if (action === "A") {
						if (this.currentFocusedElem) this.currentFocusedElem.click();
					} else if (action === "B") {
						if (typeof VersusMode !== "undefined" && VersusMode.leaveRoomToInitialLobby) {
							VersusMode.leaveRoomToInitialLobby();
						}
					} else if (action === "X") {
						if (typeof VersusMode !== "undefined" && VersusMode.openDeckBuilderForVersus) {
							VersusMode.openDeckBuilderForVersus();
						}
					} else if (action === "Y") {
						if (typeof VersusMode !== "undefined" && VersusMode.toggleReady) {
							VersusMode.toggleReady();
						}
					} else if (action === "Start") {
						const startBtn = document.getElementById("btn-versus-start-match");
						if (startBtn && !startBtn.classList.contains("hide") && !startBtn.disabled) {
							startBtn.click();
						}
					}
				} else {
					if (action === "LB") {
						const tabHost = document.getElementById("tab-versus-host");
						if (tabHost) tabHost.click();
						this.applyContextFocus("VERSUS_LOBBY");
					} else if (action === "RB") {
						const tabJoin = document.getElementById("tab-versus-join");
						if (tabJoin) tabJoin.click();
						this.applyContextFocus("VERSUS_LOBBY");
					} else if (action === "A") {
						if (this.currentFocusedElem) {
							if (this.currentFocusedElem.tagName === "INPUT") {
								this.currentFocusedElem.focus();
							} else {
								this.currentFocusedElem.click();
							}
						}
					} else if (action === "B") {
						if (typeof VersusMode !== "undefined" && VersusMode.closeLobby) {
							VersusMode.closeLobby();
						}
					} else if (action === "X") {
						const copyBtn = document.getElementById("btn-versus-copy");
						if (copyBtn && !copyBtn.classList.contains("hide")) copyBtn.click();
					}
				}
				break;
			}
		}
	},

	// 0. In-Game Dialog Modal Navigation
	navInGameDialog(dir) {
		const btns = Array.from(document.querySelectorAll("#ingame-dialog-modal .ingame-dialog-btn:not(.hide)"));
		if (btns.length === 0) return;
		if (btns.length === 1) {
			this.setFocus(btns[0]);
			return;
		}
		if (dir === "left" || dir === "up") {
			this.setFocus(btns[0]);
		} else if (dir === "right" || dir === "down") {
			this.setFocus(btns[btns.length - 1]);
		}
	},

	// 1. Popup Dialog Navigation
	navPopup(dir) {
		const buttons = Array.from(document.querySelectorAll("#popup button"));
		if (buttons.length < 2) return;
		if (dir === "left" || dir === "up") this.navState.popupBtnIndex = 0;
		if (dir === "right" || dir === "down") this.navState.popupBtnIndex = 1;
		this.setFocus(buttons[this.navState.popupBtnIndex]);
	},

	// 2. Carousel Navigation
	navCarousel(dir) {
		if (typeof Carousel === "undefined" || !Carousel.curr) return;
		if (dir === "left") {
			Carousel.curr.shift({ stopPropagation: () => {} }, -1);
		} else if (dir === "right") {
			Carousel.curr.shift({ stopPropagation: () => {} }, 1);
		}
	},

	// 3. End Game Screen
	navEndScreen(dir) {
		const buttons = Array.from(document.querySelectorAll("#end-screen button"));
		if (buttons.length === 0) return;
		if (dir === "left" || dir === "up") {
			this.navState.endScreenBtnIndex = (this.navState.endScreenBtnIndex - 1 + buttons.length) % buttons.length;
		} else if (dir === "right" || dir === "down") {
			this.navState.endScreenBtnIndex = (this.navState.endScreenBtnIndex + 1) % buttons.length;
		}
		this.setFocus(buttons[this.navState.endScreenBtnIndex]);
	},

	// 4. Main Menu Navigation
	navMenuNav(dir) {
		const buttons = Array.from(document.querySelectorAll("#menu-nav button"));
		if (buttons.length === 0) return;
		if (dir === "up") {
			this.navState.menuNavIndex = (this.navState.menuNavIndex - 1 + buttons.length) % buttons.length;
		} else if (dir === "down") {
			this.navState.menuNavIndex = (this.navState.menuNavIndex + 1) % buttons.length;
		}
		this.setFocus(buttons[this.navState.menuNavIndex]);
	},

	// 5. Difficulty View
	navMenuPlay(dir) {
		const buttons = Array.from(document.querySelectorAll("#menu-play button"));
		if (buttons.length === 0) return;
		if (dir === "up") {
			this.navState.menuPlayIndex = (this.navState.menuPlayIndex - 1 + buttons.length) % buttons.length;
		} else if (dir === "down") {
			this.navState.menuPlayIndex = (this.navState.menuPlayIndex + 1) % buttons.length;
		}
		this.setFocus(buttons[this.navState.menuPlayIndex]);
	},

	// 6. Settings View
	navMenuSettings(dir) {
		const rows = [
			document.getElementById("setting-display-mode"),
			document.getElementById("setting-resolution"),
			document.getElementById("setting-music-toggle"),
			document.getElementById("setting-music-volume"),
			document.getElementById("setting-sfx-toggle"),
			document.getElementById("setting-sfx-volume"),
			document.getElementById("setting-jukebox-track"),
			document.getElementById("setting-language"),
			document.getElementById("setting-game-speed"),
			document.getElementById("setting-score-diff"),
			...Array.from(document.querySelectorAll("#menu-settings .settings-actions button"))
		].filter(Boolean);

		if (rows.length === 0) return;

		if (dir === "up") {
			this.navState.menuSettingsRow = (this.navState.menuSettingsRow - 1 + rows.length) % rows.length;
			this.setFocus(rows[this.navState.menuSettingsRow]);
		} else if (dir === "down") {
			this.navState.menuSettingsRow = (this.navState.menuSettingsRow + 1) % rows.length;
			this.setFocus(rows[this.navState.menuSettingsRow]);
		} else if (dir === "left" || dir === "right") {
			const item = rows[this.navState.menuSettingsRow];
			if (!item) return;

			if (item.tagName === "SELECT") {
				const delta = (dir === "right") ? 1 : -1;
				const nextIndex = Math.max(0, Math.min(item.options.length - 1, item.selectedIndex + delta));
				if (nextIndex !== item.selectedIndex) {
					item.selectedIndex = nextIndex;
					item.dispatchEvent(new Event("change"));
				}
			} else if (item.type === "range") {
				if (item.id === "setting-game-speed" || item.id === "setting-game-speed-overlay") {
					const delta = (dir === "right") ? 0.1 : -0.1;
					const cur = parseFloat(item.value) || 1.0;
					const newVal = Math.min(2.0, Math.max(1.0, Math.round((cur + delta) * 10) / 10));
					item.value = newVal.toFixed(1);
				} else {
					const delta = (dir === "right") ? 5 : -5;
					const newVal = Math.max(0, Math.min(100, parseInt(item.value, 10) + delta));
					item.value = newVal;
				}
				if (item.oninput) item.oninput();
				if (item.onchange) item.onchange();
			} else if (item.type === "checkbox") {
				item.checked = !item.checked;
				item.dispatchEvent(new Event("change"));
			}
		}
	},

	// 7. Achievements View
	navMenuAchievements(dir) {
		const list = document.getElementById("achievements-list");
		if (list) {
			if (dir === "up") list.scrollTop -= 60;
			else if (dir === "down") list.scrollTop += 60;
		}
	},

	cycleAchFilter(delta) {
		const filters = ["all", "unlocked", "locked"];
		this.navState.menuAchTab = (this.navState.menuAchTab + delta + filters.length) % filters.length;
		const filter = filters[this.navState.menuAchTab];
		if (typeof Achievements !== "undefined") {
			Achievements.setFilter(filter);
		}
		const btn = document.querySelector(`.ach-filter-btn[data-filter="${filter}"]`);
		if (btn) this.setFocus(btn);
	},

	// 8. Credits View
	navMenuCredits(dir) {
		const cont = document.querySelector(".credits-scroll-container");
		if (cont) {
			if (dir === "up") cont.scrollTop -= 60;
			else if (dir === "down") cont.scrollTop += 60;
		}
	},

	// 9. Deck Customization View (Full Support)
	switchDeckPanel(targetPanel) {
		this.navState.deckPanel = targetPanel;
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
		this.applyContextFocus("DECK_CUSTOMIZATION");
	},

	cycleDeckMajorPanel(delta) {
		const order = ["bank", "center", "deck"];
		let cur = order.indexOf(this.navState.deckPanel);
		if (cur === -1) {
			if (this.navState.deckPanel === "bank_filters") cur = 0;
			else if (this.navState.deckPanel === "deck_filters") cur = 2;
			else cur = 1;
		}
		const next = (cur + delta + order.length) % order.length;
		this.switchDeckPanel(order[next]);
	},

	cycleDeckFilterTabs(delta) {
		const isDeck = (this.navState.deckPanel === "deck" || this.navState.deckPanel === "deck_filters");
		const containerId = isDeck ? "deck-filter-tabs" : "bank-filter-tabs";
		const tabs = Array.from(document.querySelectorAll(`#${containerId} .deck-filter-btn`)).filter(b => b.offsetParent !== null);
		if (tabs.length === 0) return;

		let curIdx = tabs.findIndex(b => b.classList.contains("active"));
		if (curIdx === -1) curIdx = 0;
		const nextIdx = (curIdx + delta + tabs.length) % tabs.length;
		tabs[nextIdx].click();
		if (this.navState.deckPanel === "bank_filters" || this.navState.deckPanel === "deck_filters") {
			this.setFocus(tabs[nextIdx]);
		}
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	},

	navDeckCustomization(dir) {
		const isStoryDeck = (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign);
		const isVersusDeck = (typeof VersusMode !== "undefined" && VersusMode.isActive);

		const topItems = [
			isVersusDeck ? document.getElementById("btn-versus-top-back")
				: (isStoryDeck ? document.getElementById("btn-story-back-to-map") : document.getElementById("btn-back-to-menu")),
			isStoryDeck ? null : document.getElementById("upload-deck"),
			document.getElementById("change-faction"),
			document.getElementById("download-deck"),
			document.getElementById("btn-deck-settings"),
			isVersusDeck ? document.getElementById("btn-versus-deck-confirm")
				: (isStoryDeck ? document.getElementById("btn-story-deck-confirm") : document.getElementById("start-game"))
		].filter(el => el && !el.classList.contains("hide") && el.offsetParent !== null && getComputedStyle(el).display !== "none");

		const bankFilterBtns = Array.from(document.querySelectorAll("#bank-filter-tabs .deck-filter-btn")).filter(b => b.offsetParent !== null);
		const deckFilterBtns = Array.from(document.querySelectorAll("#deck-filter-tabs .deck-filter-btn")).filter(b => b.offsetParent !== null);

		const centerItems = [
			document.getElementById("card-leader"),
			document.getElementById("op-preview-card") || document.getElementById("opponent-preview"),
			document.getElementById("board-preview-card") || document.getElementById("board-preview"),
			document.getElementById("rules-preview-card") || document.getElementById("rules-preview"),
			isVersusDeck ? document.getElementById("btn-versus-deck-confirm")
				: (isStoryDeck ? document.getElementById("btn-story-deck-confirm") : document.getElementById("start-game"))
		].filter(el => el && !el.classList.contains("hide") && el.offsetParent !== null && getComputedStyle(el).display !== "none");

		// 1. Top Panel
		if (this.navState.deckPanel === "top") {
			if (dir === "left") {
				this.navState.deckTopIndex = Math.max(0, this.navState.deckTopIndex - 1);
				this.setFocus(topItems[this.navState.deckTopIndex]);
			} else if (dir === "right") {
				this.navState.deckTopIndex = Math.min(topItems.length - 1, this.navState.deckTopIndex + 1);
				this.setFocus(topItems[this.navState.deckTopIndex]);
			} else if (dir === "down") {
				if (this.navState.deckTopIndex === 0) {
					this.switchDeckPanel("bank_filters");
				} else if (this.navState.deckTopIndex >= topItems.length - 2) {
					this.switchDeckPanel("deck_filters");
				} else {
					this.switchDeckPanel("center");
				}
			}
			return;
		}

		// 2. Bank Filter Tabs
		if (this.navState.deckPanel === "bank_filters") {
			if (dir === "left") {
				this.navState.deckBankFilterIndex = Math.max(0, (this.navState.deckBankFilterIndex || 0) - 1);
				const b = bankFilterBtns[this.navState.deckBankFilterIndex];
				if (b) { b.click(); this.setFocus(b); }
			} else if (dir === "right") {
				if ((this.navState.deckBankFilterIndex || 0) >= bankFilterBtns.length - 1) {
					this.switchDeckPanel("center");
					return;
				}
				this.navState.deckBankFilterIndex = Math.min(bankFilterBtns.length - 1, (this.navState.deckBankFilterIndex || 0) + 1);
				const b = bankFilterBtns[this.navState.deckBankFilterIndex];
				if (b) { b.click(); this.setFocus(b); }
			} else if (dir === "up") {
				this.switchDeckPanel("top");
			} else if (dir === "down") {
				this.switchDeckPanel("bank");
			}
			return;
		}

		// 3. Deck Filter Tabs
		if (this.navState.deckPanel === "deck_filters") {
			if (dir === "left") {
				if ((this.navState.deckDeckFilterIndex || 0) <= 0) {
					this.switchDeckPanel("center");
					return;
				}
				this.navState.deckDeckFilterIndex = Math.max(0, (this.navState.deckDeckFilterIndex || 0) - 1);
				const b = deckFilterBtns[this.navState.deckDeckFilterIndex];
				if (b) { b.click(); this.setFocus(b); }
			} else if (dir === "right") {
				this.navState.deckDeckFilterIndex = Math.min(deckFilterBtns.length - 1, (this.navState.deckDeckFilterIndex || 0) + 1);
				const b = deckFilterBtns[this.navState.deckDeckFilterIndex];
				if (b) { b.click(); this.setFocus(b); }
			} else if (dir === "up") {
				this.switchDeckPanel("top");
			} else if (dir === "down") {
				this.switchDeckPanel("deck");
			}
			return;
		}

		// 4. Center Panel (Leader, Opponent, Board, Rules, Start CTA)
		if (this.navState.deckPanel === "center") {
			if (centerItems.length === 0) {
				this.switchDeckPanel("bank");
				return;
			}
			let cIdx = this.navState.deckCenterIndex || 0;
			cIdx = Math.max(0, Math.min(centerItems.length - 1, cIdx));

			if (dir === "left") {
				if (centerItems[cIdx] && centerItems[cIdx].id === "card-leader" && document.getElementById("btn-leader-prev")) {
					document.getElementById("btn-leader-prev").click();
					this.setFocus(centerItems[cIdx]);
					return;
				}
				this.switchDeckPanel("bank");
				return;
			} else if (dir === "right") {
				if (centerItems[cIdx] && centerItems[cIdx].id === "card-leader" && document.getElementById("btn-leader-next")) {
					document.getElementById("btn-leader-next").click();
					this.setFocus(centerItems[cIdx]);
					return;
				}
				this.switchDeckPanel("deck");
				return;
			} else if (dir === "up") {
				if (cIdx === 0) {
					this.switchDeckPanel("top");
					return;
				}
				cIdx = Math.max(0, cIdx - 1);
			} else if (dir === "down") {
				cIdx = Math.min(centerItems.length - 1, cIdx + 1);
			}

			this.navState.deckCenterIndex = cIdx;
			const target = centerItems[cIdx];
			if (target) this.setFocus(target);
			return;
		}

		// 5. Card Bank & Card Deck Grids
		const panelId = (this.navState.deckPanel === "bank") ? "card-bank" : "card-deck";
		const cards = Array.from(document.querySelectorAll(`#${panelId} .card-lg:not(.hide):not(.empty)`));

		if (cards.length === 0) {
			if (dir === "up") this.switchDeckPanel((panelId === "card-bank") ? "bank_filters" : "deck_filters");
			else if (dir === "right" && this.navState.deckPanel === "bank") this.switchDeckPanel("center");
			else if (dir === "left" && this.navState.deckPanel === "deck") this.switchDeckPanel("center");
			return;
		}

		let idx = (this.navState.deckPanel === "bank") ? (this.navState.deckBankIndex || 0) : (this.navState.deckDeckIndex || 0);
		idx = Math.max(0, Math.min(cards.length - 1, idx));
		const cols = 3;

		if (dir === "left") {
			if (idx % cols === 0 && this.navState.deckPanel === "deck") {
				this.switchDeckPanel("center");
				return;
			}
			idx = Math.max(0, idx - 1);
		} else if (dir === "right") {
			if (idx % cols === cols - 1 && this.navState.deckPanel === "bank") {
				this.switchDeckPanel("center");
				return;
			}
			if (idx === cards.length - 1 && this.navState.deckPanel === "bank") {
				this.switchDeckPanel("center");
				return;
			}
			idx = Math.min(cards.length - 1, idx + 1);
		} else if (dir === "up") {
			if (idx < cols) {
				this.switchDeckPanel((panelId === "card-bank") ? "bank_filters" : "deck_filters");
				return;
			}
			idx = Math.max(0, idx - cols);
		} else if (dir === "down") {
			idx = Math.min(cards.length - 1, idx + cols);
		}

		if (this.navState.deckPanel === "bank") this.navState.deckBankIndex = idx;
		else this.navState.deckDeckIndex = idx;

		this.setFocus(cards[idx]);
	},
	
	// Helper: Returns the player's hand card DOM elements sorted strictly left-to-right on screen
	getOrderedHandCardElems() {
		const handRow = document.getElementById("hand-row");
		if (!handRow) return [];
		const elems = Array.from(handRow.querySelectorAll(".card:not(.hide)"));
		elems.sort((a, b) => {
			const ra = a.getBoundingClientRect();
			const rb = b.getBoundingClientRect();
			if (Math.abs(ra.left - rb.left) > 1) {
				return ra.left - rb.left;
			}
			return 0;
		});
		return elems;
	},

	// 10. Match Hand Navigation (Strictly follows visual left-to-right sequence)
	navMatchHand(dir) {
		const cardElems = this.getOrderedHandCardElems();
		if (cardElems.length === 0) return;

		let idx = cardElems.indexOf(this.currentFocusedElem);
		if (idx === -1) {
			idx = Math.max(0, Math.min(cardElems.length - 1, this.navState.matchHandIndex || 0));
		}

		const passBtn = document.getElementById("pass-button");
		const forfeitBtn = document.getElementById("forfeit-button");
		const rulesBtn = document.getElementById("match-rules-indicator");
		const leaderMe = document.getElementById("leader-me");
		const utilityBtns = Array.from(document.querySelectorAll("#duel-utility-controls .duel-utility-btn:not(.hide)"));

		// Se o foco estiver em um dos 3 botões utilitários empilhados à esquerda do Líder
		const utilIdx = utilityBtns.indexOf(this.currentFocusedElem);
		if (utilIdx !== -1) {
			if (dir === "up") {
				const prevIdx = Math.max(0, utilIdx - 1);
				this.setFocus(utilityBtns[prevIdx]);
				return;
			} else if (dir === "down") {
				if (utilIdx < utilityBtns.length - 1) {
					this.setFocus(utilityBtns[utilIdx + 1]);
				} else if (cardElems[idx]) {
					this.setFocus(cardElems[idx]);
				}
				return;
			} else if (dir === "right") {
				const lCont = leaderMe ? leaderMe.querySelector(".leader-container") : null;
				if (leaderMe && !leaderMe.classList.contains("noclick") && lCont) {
					this.setFocus(lCont);
					return;
				} else if (passBtn && !passBtn.classList.contains("noclick")) {
					this.setFocus(passBtn);
					return;
				} else if (cardElems[idx]) {
					this.setFocus(cardElems[idx]);
					return;
				}
			}
			return;
		}

		// If currently focusing pass button, forfeit button, rules button, or leader
		if (this.currentFocusedElem === passBtn || this.currentFocusedElem === forfeitBtn || this.currentFocusedElem === rulesBtn || (leaderMe && leaderMe.contains(this.currentFocusedElem))) {
			if (dir === "down") {
				if (this.currentFocusedElem === passBtn && forfeitBtn && !forfeitBtn.classList.contains("hide")) {
					this.setFocus(forfeitBtn);
					return;
				} else if (this.currentFocusedElem === forfeitBtn && rulesBtn && !rulesBtn.classList.contains("hide")) {
					this.setFocus(rulesBtn);
					return;
				}
				// Return focus to active hand card
				this.setFocus(cardElems[idx]);
				return;
			} else if (dir === "up") {
				if (this.currentFocusedElem === rulesBtn && forfeitBtn && !forfeitBtn.classList.contains("hide")) {
					this.setFocus(forfeitBtn);
					return;
				} else if (this.currentFocusedElem === forfeitBtn && passBtn && !passBtn.classList.contains("noclick")) {
					this.setFocus(passBtn);
					return;
				}
			} else if (dir === "left" && (this.currentFocusedElem === passBtn || this.currentFocusedElem === forfeitBtn || this.currentFocusedElem === rulesBtn)) {
				const lCont = leaderMe ? leaderMe.querySelector(".leader-container") : null;
				if (leaderMe && !leaderMe.classList.contains("noclick") && lCont) {
					this.setFocus(lCont);
					return;
				} else if (utilityBtns.length > 0) {
					this.setFocus(utilityBtns[0]);
					return;
				}
			} else if (dir === "left" && leaderMe && leaderMe.contains(this.currentFocusedElem)) {
				if (utilityBtns.length > 0) {
					this.setFocus(utilityBtns[0]);
					return;
				}
			} else if (dir === "right" && leaderMe && leaderMe.contains(this.currentFocusedElem)) {
				if (passBtn && !passBtn.classList.contains("noclick")) {
					this.setFocus(passBtn);
					return;
				}
			}
		}

		if (dir === "left") {
			idx = Math.max(0, idx - 1);
		} else if (dir === "right") {
			idx = Math.min(cardElems.length - 1, idx + 1);
		} else if (dir === "up") {
			// Move focus up to Pass button or Leader
			if (passBtn && !passBtn.classList.contains("noclick")) {
				this.setFocus(passBtn);
				return;
			} else if (leaderMe && !leaderMe.classList.contains("noclick")) {
				const lCont = leaderMe.querySelector(".leader-container");
				if (lCont) {
					this.setFocus(lCont);
					return;
				}
			}
		} else if (dir === "down") {
			// Stay in hand
		}

		this.navState.matchHandIndex = idx;
		if (cardElems[idx]) {
			this.setFocus(cardElems[idx]);
		}
	},

	// 11. Match Targeting (Agile / Decoy / Multi-row selection)
	navMatchTargeting(dir) {
		const selectables = Array.from(document.querySelectorAll(".row-selectable, #field-me .card:not(.noclick)"));
		if (selectables.length === 0) return;

		let idx = this.navState.matchRowIndex || 0;
		idx = Math.max(0, Math.min(selectables.length - 1, idx));

		if (dir === "up" || dir === "left") {
			idx = (idx - 1 + selectables.length) % selectables.length;
		} else if (dir === "down" || dir === "right") {
			idx = (idx + 1) % selectables.length;
		}

		this.navState.matchRowIndex = idx;
		this.setFocus(selectables[idx]);
	},

	// 12. Story Map Modern Virtual Cursor, Edge Panning & Magnetic Node Targeting
	updateStoryMapCursor(pad) {
		const cursorEl = document.getElementById("story-gamepad-cursor");
		if (!cursorEl) return;

		if (!this.mapCursorInitialized || this.mapCursorX <= 0 || this.mapCursorY <= 0) {
			this.mapCursorX = window.innerWidth / 2;
			this.mapCursorY = window.innerHeight / 2;
			this.mapCursorInitialized = true;
		}

		cursorEl.classList.remove("hide");

		const a = pad.axes || [0, 0, 0, 0];
		const b = pad.buttons || [];
		const isPressed = (idx) => !!(b[idx] && (b[idx].pressed || b[idx].value > 0.35));

		// Left Stick + D-Pad movement for virtual cursor
		let vx = (Math.abs(a[0] || 0) > 0.16) ? a[0] : 0;
		let vy = (Math.abs(a[1] || 0) > 0.16) ? a[1] : 0;
		if (isPressed(14)) vx = -0.85;
		if (isPressed(15)) vx = 0.85;
		if (isPressed(12)) vy = -0.85;
		if (isPressed(13)) vy = 0.85;

		// Magnetic slowdown when hovering over a pin so selecting nodes feels effortless
		const speedFactor = this.hoveredMapTarget ? 6.5 : 11.5;
		this.mapCursorX += vx * speedFactor;
		this.mapCursorY += vy * speedFactor;

		const vW = window.innerWidth;
		const vH = window.innerHeight;
		const margin = 16;
		this.mapCursorX = Math.max(margin, Math.min(vW - margin, this.mapCursorX));
		this.mapCursorY = Math.max(margin, Math.min(vH - margin, this.mapCursorY));

		cursorEl.style.left = `${this.mapCursorX}px`;
		cursorEl.style.top = `${this.mapCursorY}px`;

		// Automatic Edge Panning when cursor pushes near viewport edges
		if (typeof StoryMode !== "undefined") {
			let panned = false;
			const edgeZone = 85;
			const edgePanSpeed = 12;

			if (this.mapCursorX < edgeZone && vx < -0.1) {
				StoryMode.mapPanX += edgePanSpeed * Math.abs(vx);
				panned = true;
			} else if (this.mapCursorX > vW - edgeZone && vx > 0.1) {
				StoryMode.mapPanX -= edgePanSpeed * Math.abs(vx);
				panned = true;
			}

			if (this.mapCursorY < edgeZone + 60 && vy < -0.1) {
				StoryMode.mapPanY += edgePanSpeed * Math.abs(vy);
				panned = true;
			} else if (this.mapCursorY > vH - edgeZone && vy > 0.1) {
				StoryMode.mapPanY -= edgePanSpeed * Math.abs(vy);
				panned = true;
			}

			// Right Stick direct map camera panning
			const rx = (Math.abs(a[2] || 0) > 0.18) ? a[2] : 0;
			const ry = (Math.abs(a[3] || 0) > 0.18) ? a[3] : 0;
			if (rx !== 0 || ry !== 0) {
				StoryMode.mapPanX -= rx * 15;
				StoryMode.mapPanY -= ry * 15;
				panned = true;
			}

			if (panned) {
				StoryMode.clampPan();
				StoryMode.applyMapTransform();
			}

			// LT (6) / RT (7) smooth zoom centered on the virtual cursor
			const ltVal = b[6] ? (b[6].value || (b[6].pressed ? 1 : 0)) : 0;
			const rtVal = b[7] ? (b[7].value || (b[7].pressed ? 1 : 0)) : 0;
			if (rtVal > 0.15) {
				StoryMode.zoomMap(0.022 * rtVal, this.mapCursorX, this.mapCursorY);
			} else if (ltVal > 0.15) {
				StoryMode.zoomMap(-0.022 * ltVal, this.mapCursorX, this.mapCursorY);
			}
		}

		// Magnetic hit detection against HUD/Drawer/Dropdown/Filter buttons first (since HUD overlays the map), then map pins
		let bestTarget = null;

		const uiBtns = document.querySelectorAll(
			"#story-map-screen .story-player-badge, " +
			"#story-map-screen .story-hud-btn, " +
			"#story-map-screen .story-dropdown-item, " +
			"#story-map-screen .story-btn-change-avatar, " +
			"#story-map-screen .stats-drawer-close-btn, " +
			"#story-map-screen #stats-drawer-player-avatar, " +
			"#story-map-screen .story-filter-btn, " +
			"#story-map-screen .story-map-control-btn"
		);
		uiBtns.forEach(btn => {
			if (btn.offsetParent === null) return;
			const r = btn.getBoundingClientRect();
			if (r.width === 0 || r.height === 0) return;
			if (this.mapCursorX >= r.left - 6 && this.mapCursorX <= r.right + 6 &&
				this.mapCursorY >= r.top - 6 && this.mapCursorY <= r.bottom + 6) {
				bestTarget = btn;
			}
		});

		const statsDrawerEl = document.getElementById("story-player-stats-drawer");
		const isCursorOverOpenDrawer = statsDrawerEl && !statsDrawerEl.classList.contains("hide") && (() => {
			const dr = statsDrawerEl.getBoundingClientRect();
			return this.mapCursorX >= dr.left && this.mapCursorX <= dr.right && this.mapCursorY >= dr.top && this.mapCursorY <= dr.bottom;
		})();

		if (!bestTarget && !isCursorOverOpenDrawer) {
			let bestDist = 42; // 42px magnetic capture radius for pins
			const pins = document.querySelectorAll("#story-map-nodes-layer .story-map-pin");
			pins.forEach(pin => {
				if (pin.offsetParent === null) return; // hidden by filter
				const r = pin.getBoundingClientRect();
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				const dist = Math.hypot(this.mapCursorX - cx, this.mapCursorY - cy);
				if (dist < bestDist) {
					bestDist = dist;
					bestTarget = pin;
				}
			});
		}

		const labelEl = document.getElementById("story-gamepad-cursor-label");

		if (this.hoveredMapTarget !== bestTarget) {
			if (this.hoveredMapTarget) {
				this.hoveredMapTarget.classList.remove("gamepad-hover");
			}
			this.hoveredMapTarget = bestTarget;
			if (bestTarget) {
				bestTarget.classList.add("gamepad-hover");
				cursorEl.classList.add("target-locked");
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_hover");
				}
			} else {
				cursorEl.classList.remove("target-locked");
			}
		}

		if (labelEl) {
			if (bestTarget && bestTarget.classList.contains("story-map-pin")) {
				const isLocked = bestTarget.classList.contains("locked");
				labelEl.textContent = isLocked ? "🔒 Local Bloqueado" : "🅰 Abrir Local";
				labelEl.classList.remove("hide");
			} else if (bestTarget) {
				labelEl.textContent = "🅰 Selecionar";
				labelEl.classList.remove("hide");
			} else {
				labelEl.classList.add("hide");
			}
		}
	},

	// 13. Story Modal Navigation (Battle, Tournament, Shop, Compendium, Outcome, Avatar Picker)
	getActiveStoryModalButtons() {
		const modalIds = ["story-outcome-modal", "story-battle-modal", "story-tournament-modal", "story-shop-modal", "story-compendium-modal", "avatar-picker-modal"];
		for (const id of modalIds) {
			const m = document.getElementById(id);
			if (m && !m.classList.contains("hide")) {
				return Array.from(m.querySelectorAll("button:not([disabled]):not(.hide), .avatar-picker-card:not([disabled]):not(.hide)")).filter(b => b.offsetParent !== null);
			}
		}
		return [];
	},

	navStoryModal(dir) {
		const btns = this.getActiveStoryModalButtons();
		if (btns.length === 0) return;

		// Scroll compendium grid or avatar grid if open
		const compModal = document.getElementById("story-compendium-modal");
		if (compModal && !compModal.classList.contains("hide")) {
			const grid = document.getElementById("story-comp-cards-grid");
			if (grid && (dir === "up" || dir === "down")) {
				grid.scrollTop += (dir === "down" ? 90 : -90);
			}
		}
		const avatarModal = document.getElementById("avatar-picker-modal");
		if (avatarModal && !avatarModal.classList.contains("hide")) {
			const grid = document.getElementById("avatar-picker-grid");
			if (grid && (dir === "up" || dir === "down")) {
				grid.scrollTop += (dir === "down" ? 100 : -100);
			}
		}

		let idx = btns.indexOf(this.currentFocusedElem);
		if (idx === -1) idx = Math.min(btns.length - 1, this.navState.storyModalBtnIndex || 0);

		if (dir === "left" || dir === "up") {
			idx = (idx - 1 + btns.length) % btns.length;
		} else if (dir === "right" || dir === "down") {
			idx = (idx + 1) % btns.length;
		}

		this.navState.storyModalBtnIndex = idx;
		this.setFocus(btns[idx]);
	},

	// 14. Story New Campaign Setup Navigation
	cycleStorySetupFaction(delta) {
		const opts = Array.from(document.querySelectorAll("#story-setup-view .story-faction-opt"));
		if (opts.length === 0) return;
		let curr = opts.findIndex(o => o.classList.contains("active"));
		if (curr === -1) curr = 0;
		const next = (curr + delta + opts.length) % opts.length;
		opts[next].click();
		this.setFocus(opts[next]);
	},

	navVersusEmote(dir) {
		if (typeof VersusMode === "undefined") return;
		let cur = VersusMode.selectedEmoteIndex || 0;
		if (dir === "up") cur = 0;
		else if (dir === "right") cur = (cur + 1) % 8;
		else if (dir === "down") cur = 4;
		else if (dir === "left") cur = (cur - 1 + 8) % 8;
		VersusMode.selectEmoteByIndex(cur);
	},

	navVersusAlert(dir) {
		const btn = document.querySelector("#versus-alert-modal button");
		if (btn) this.setFocus(btn);
	},

	navVersusLobby(dir) {
		const prematch = document.getElementById("versus-prematch-panel");
		const isPrematch = prematch && getComputedStyle(prematch).display !== "none";

		if (isPrematch) {
			const avatarBtn = document.getElementById("versus-p1-avatar-wrap");
			const boardCards = Array.from(document.querySelectorAll("#versus-prematch-board-row .versus-board-card")).filter(b => b.offsetParent !== null);
			const rulesBtn = document.getElementById("btn-versus-open-rules");
			const actionBtns = [
				document.querySelector(".versus-btn-leave-room"),
				document.querySelector(".versus-btn-deck"),
				document.getElementById("btn-versus-ready"),
				document.getElementById("btn-versus-start-match")
			].filter(b => b && !b.classList.contains("hide") && getComputedStyle(b).display !== "none");

			const items = [avatarBtn, ...boardCards, rulesBtn, ...actionBtns].filter(Boolean);
			if (items.length === 0) return;

			let idx = items.indexOf(this.currentFocusedElem);
			if (idx === -1) idx = this.navState.versusLobbyIndex || 0;

			if (dir === "left" || dir === "up") {
				idx = Math.max(0, idx - 1);
			} else if (dir === "right" || dir === "down") {
				idx = Math.min(items.length - 1, idx + 1);
			}
			this.navState.versusLobbyIndex = idx;
			if (items[idx]) this.setFocus(items[idx]);
			return;
		}

		const isHostActive = document.getElementById("tab-versus-host")?.classList.contains("active");
		const nickInput = document.getElementById("versus-input-player-name");
		const tabHost = document.getElementById("tab-versus-host");
		const tabJoin = document.getElementById("tab-versus-join");
		const closeBtn = document.querySelector(".versus-close-btn");

		let focusables = [];
		if (isHostActive) {
			const copyBtn = document.getElementById("btn-versus-copy");
			const boardCards = Array.from(document.querySelectorAll(".versus-host-box .versus-board-card")).filter(b => b.offsetParent !== null);
			focusables = [nickInput, tabHost, tabJoin, copyBtn, ...boardCards, closeBtn].filter(Boolean);
		} else {
			const roomInput = document.getElementById("versus-input-room-code");
			const joinBtn = document.querySelector(".versus-join-btn");
			focusables = [nickInput, tabHost, tabJoin, roomInput, joinBtn, closeBtn].filter(Boolean);
		}

		if (focusables.length === 0) return;
		let idx = focusables.indexOf(this.currentFocusedElem);
		if (idx === -1) idx = 0;

		if (dir === "up") {
			idx = Math.max(0, idx - 1);
		} else if (dir === "down") {
			idx = Math.min(focusables.length - 1, idx + 1);
		} else if (dir === "left") {
			if (this.currentFocusedElem === tabJoin) idx = focusables.indexOf(tabHost);
			else idx = Math.max(0, idx - 1);
		} else if (dir === "right") {
			if (this.currentFocusedElem === tabHost) idx = focusables.indexOf(tabJoin);
			else idx = Math.min(focusables.length - 1, idx + 1);
		}
		if (focusables[idx]) this.setFocus(focusables[idx]);
	},

	navStorySetup(dir) {
		if (dir === "left") {
			this.cycleStorySetupFaction(-1);
		} else if (dir === "right") {
			this.cycleStorySetupFaction(1);
		} else if (dir === "up" || dir === "down") {
			const btns = Array.from(document.querySelectorAll("#story-setup-view button"));
			if (btns.length > 0) {
				this.navState.storySetupBtnIndex = (this.navState.storySetupBtnIndex + 1) % btns.length;
				this.setFocus(btns[this.navState.storySetupBtnIndex]);
			}
		}
	},

	// Applies focus automatically when entering or refreshing a context
	applyContextFocus(context) {
		switch (context) {
			case "OSK": {
				this.focusOSKKey();
				break;
			}
			case "STORY_SAVES": {
				const activeBtn = document.querySelector("#story-saves-slots-list .story-save-slot-card.active-slot .slot-play-btn")
					|| document.querySelector("#story-saves-slots-list .story-save-slot-card .slot-play-btn")
					|| document.querySelector("#story-saves-slots-list .story-save-slot-card .slot-create-btn")
					|| document.querySelector("#story-saves-slots-list button")
					|| document.querySelector("#story-saves-modal button");
				if (activeBtn) this.setFocus(activeBtn, false);
				break;
			}
			case "RULES_MODAL": {
				const firstItem = document.querySelector("#rules-modal .rules-preset-btn")
					|| document.querySelector("#rules-modal .rules-checkbox-item")
					|| document.querySelector("#rules-modal button");
				if (firstItem) this.setFocus(firstItem, false);
				break;
			}
			case "BOARD_MODAL": {
				const activeBoard = document.querySelector("#board-modal .board-option-card.active")
					|| document.querySelector("#board-modal .board-option-card")
					|| document.querySelector("#board-modal button");
				if (activeBoard) this.setFocus(activeBoard, false);
				break;
			}
			case "OPPONENT_MODAL": {
				const activeOpp = document.querySelector("#opponent-modal .opponent-option-card.active")
					|| document.querySelector("#opponent-modal .opponent-option-card")
					|| document.querySelector("#opponent-modal button");
				if (activeOpp) this.setFocus(activeOpp, false);
				break;
			}
			case "INGAME_DIALOG": {
				const confirmBtn = document.getElementById("ingame-dialog-confirm-btn");
				if (confirmBtn) this.setFocus(confirmBtn, false);
				break;
			}
			case "STORY_MAP":
				this.clearFocus();
				break;
			case "STORY_MODAL": {
				const btns = this.getActiveStoryModalButtons();
				if (btns.length > 0) {
					this.navState.storyModalBtnIndex = btns.length - 1;
					this.setFocus(btns[btns.length - 1], false);
				}
				break;
			}
			case "STORY_SETUP": {
				const btns = Array.from(document.querySelectorAll("#story-setup-view button"));
				if (btns.length > 0) {
					this.setFocus(btns[btns.length - 1], false);
				}
				break;
			}
			case "POPUP":
				this.navPopup("left");
				break;
			case "CAROUSEL":
				this.clearFocus();
				break;
			case "END_SCREEN":
				this.navEndScreen("right");
				break;
			case "MENU_NAV": {
				const btns = Array.from(document.querySelectorAll("#menu-nav button"));
				if (btns.length > 0) this.setFocus(btns[this.navState.menuNavIndex || 0], false);
				break;
			}
			case "MENU_PLAY": {
				const btns = Array.from(document.querySelectorAll("#menu-play button"));
				if (btns.length > 0) this.setFocus(btns[this.navState.menuPlayIndex || 0], false);
				break;
			}
			case "MENU_SETTINGS": {
				const rows = Array.from(document.querySelectorAll("#menu-settings .setting-row select, #menu-settings .setting-row input"));
				if (rows.length > 0) this.setFocus(rows[this.navState.menuSettingsRow || 0], false);
				break;
			}
			case "DECK_CUSTOMIZATION": {
				if (this.navState.deckPanel === "top") {
					const isStoryDeck = (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign);
					const isVersusDeck = (typeof VersusMode !== "undefined" && VersusMode.isActive);
					const btn = isVersusDeck ? document.getElementById("btn-versus-top-back")
						: (isStoryDeck ? document.getElementById("btn-story-back-to-map") : document.getElementById("btn-back-to-menu"));
					if (btn) this.setFocus(btn, false);
				} else if (this.navState.deckPanel === "center") {
					const isStoryDeck = (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign);
					const isVersusDeck = (typeof VersusMode !== "undefined" && VersusMode.isActive);
					const centerItems = [
						document.getElementById("card-leader"),
						document.getElementById("op-preview-card") || document.getElementById("opponent-preview"),
						document.getElementById("board-preview-card") || document.getElementById("board-preview"),
						document.getElementById("rules-preview-card") || document.getElementById("rules-preview"),
						isVersusDeck ? document.getElementById("btn-versus-deck-confirm")
							: (isStoryDeck ? document.getElementById("btn-story-deck-confirm") : document.getElementById("start-game"))
					].filter(el => el && !el.classList.contains("hide") && el.offsetParent !== null && getComputedStyle(el).display !== "none");
					const cIdx = Math.max(0, Math.min(centerItems.length - 1, this.navState.deckCenterIndex || 0));
					if (centerItems[cIdx]) this.setFocus(centerItems[cIdx], false);
				} else if (this.navState.deckPanel === "bank_filters") {
					const tab = document.querySelector("#bank-filter-tabs .deck-filter-btn.active") || document.querySelector("#bank-filter-tabs .deck-filter-btn");
					if (tab) this.setFocus(tab, false);
				} else if (this.navState.deckPanel === "deck_filters") {
					const tab = document.querySelector("#deck-filter-tabs .deck-filter-btn.active") || document.querySelector("#deck-filter-tabs .deck-filter-btn");
					if (tab) this.setFocus(tab, false);
				} else {
					const panelId = (this.navState.deckPanel === "bank") ? "card-bank" : "card-deck";
					const cards = Array.from(document.querySelectorAll(`#${panelId} .card-lg:not(.hide):not(.empty)`));
					const idx = (this.navState.deckPanel === "bank") ? this.navState.deckBankIndex : this.navState.deckDeckIndex;
					if (cards.length > 0) this.setFocus(cards[Math.min(cards.length - 1, idx || 0)], false);
					else {
						const fallback = document.getElementById("card-leader") || document.getElementById("start-game");
						if (fallback) this.setFocus(fallback, false);
					}
				}
				break;
			}
			case "MATCH_HAND": {
				const cardElems = this.getOrderedHandCardElems();
				if (cardElems.length > 0) {
					const idx = Math.max(0, Math.min(cardElems.length - 1, this.navState.matchHandIndex || 0));
					this.navState.matchHandIndex = idx;
					this.setFocus(cardElems[idx], false);
				}
				break;
			}
			case "VERSUS_EMOTE":
				this.clearFocus();
				break;

			case "VERSUS_ALERT": {
				const btn = document.querySelector("#versus-alert-modal button");
				if (btn) this.setFocus(btn, false);
				break;
			}
			case "VERSUS_LOBBY": {
				const prematch = document.getElementById("versus-prematch-panel");
				const isPrematch = prematch && getComputedStyle(prematch).display !== "none";
				if (isPrematch) {
					const readyBtn = document.getElementById("btn-versus-ready");
					const fallbackBtn = document.querySelector(".versus-prematch-actions button");
					if (readyBtn) this.setFocus(readyBtn, false);
					else if (fallbackBtn) this.setFocus(fallbackBtn, false);
				} else {
					const nickInput = document.getElementById("versus-input-player-name");
					const tabHost = document.getElementById("tab-versus-host");
					if (nickInput) this.setFocus(nickInput, false);
					else if (tabHost) this.setFocus(tabHost, false);
				}
				break;
			}
			case "MATCH_TARGETING": {
				const selectables = Array.from(document.querySelectorAll(".row-selectable, #field-me .card:not(.noclick)"));
				if (selectables.length > 0) {
					const idx = Math.min(selectables.length - 1, this.navState.matchRowIndex || 0);
					this.setFocus(selectables[idx], false);
				}
				break;
			}
		}
	},

	// Updates the bottom Controller Guide HUD with current context actions
	updateHUD(context) {
		const promptsCont = document.getElementById("pad-hud-prompts");
		if (!promptsCont) return;

		const t = (k, fb) => (typeof I18N !== "undefined" ? I18N.t(k) : fb);

		let items = [];
		switch (context) {
			case "OSK":
				items = [
					{ btn: "D-Pad / LS", text: "Navegar Teclas" },
					{ btn: "A", class: "pad-a", text: "Digitar" },
					{ btn: "X", class: "pad-x", text: "Apagar" },
					{ btn: "Y", class: "pad-y", text: "Espaço" },
					{ btn: "LB / RB", class: "pad-btn-rect", text: "Maiúsc/Minúsc" },
					{ btn: "Start", class: "pad-btn-rect", text: "Concluir" },
					{ btn: "B", class: "pad-b", text: "Cancelar" }
				];
				break;
			case "STORY_SAVES":
				items = [
					{ btn: "D-Pad / LS", text: "Selecionar Slot / Ação" },
					{ btn: "RS", text: "Rolar Slots" },
					{ btn: "A", class: "pad-a", text: "Confirmar / Carregar" },
					{ btn: "Y", class: "pad-y", text: "Nova Campanha" },
					{ btn: "B", class: "pad-b", text: "Voltar" }
				];
				break;
			case "RULES_MODAL":
				items = [
					{ btn: "D-Pad / LS", text: "Navegar Regras" },
					{ btn: "RS", text: "Rolar Regras" },
					{ btn: "A", class: "pad-a", text: "Alternar / Salvar" },
					{ btn: "B", class: "pad-b", text: "Fechar" }
				];
				break;
			case "BOARD_MODAL":
				items = [
					{ btn: "D-Pad / LS", text: "Escolher Tabuleiro" },
					{ btn: "RS", text: "Rolar" },
					{ btn: "A", class: "pad-a", text: "Selecionar" },
					{ btn: "B", class: "pad-b", text: "Fechar" }
				];
				break;
			case "OPPONENT_MODAL":
				items = [
					{ btn: "D-Pad / LS", text: "Escolher Oponente" },
					{ btn: "RS", text: "Rolar" },
					{ btn: "A", class: "pad-a", text: "Selecionar" },
					{ btn: "B", class: "pad-b", text: "Fechar" }
				];
				break;
			case "STORY_MAP":
				items = [
					{ btn: "LS / D-Pad", text: "Mover Cursor" },
					{ btn: "RS", text: "Mover Mapa" },
					{ btn: "LT / RT", class: "pad-btn-rect", text: "Zoom" },
					{ btn: "A", class: "pad-a", text: "Abrir Local" },
					{ btn: "X", class: "pad-x", text: "Baralho" },
					{ btn: "Y", class: "pad-y", text: "Coleção" },
					{ btn: "LB / RB", class: "pad-btn-rect", text: "Focar / Continente" },
					{ btn: "B", class: "pad-b", text: "Menu" }
				];
				break;
			case "STORY_MODAL":
				items = [
					{ btn: "D-Pad / LS", text: "Navegar" },
					{ btn: "A", class: "pad-a", text: "Confirmar" },
					{ btn: "B", class: "pad-b", text: "Fechar / Voltar" }
				];
				break;
			case "STORY_SETUP":
				items = [
					{ btn: "LB / RB / ◄►", class: "pad-btn-rect", text: "Facção Inicial" },
					{ btn: "Start / A", class: "pad-a", text: "Iniciar Jornada" },
					{ btn: "B", class: "pad-b", text: "Voltar" }
				];
				break;
			case "MATCH_HAND":
				items = [
					{ btn: "D-Pad / LS", text: t("pad_navigate_hand", "Cards") },
					{ btn: "A", class: "pad-a", text: t("pad_play_card", "Play Card") },
					{ btn: "Y", class: "pad-y", text: t("pad_pass", "Pass") },
					{ btn: "X", class: "pad-x", text: t("pad_leader", "Leader") },
					{ btn: "Start", class: "pad-btn-rect", text: t("pad_menu", "Menu") }
				];
				break;
			case "MATCH_TARGETING":
				items = [
					{ btn: "D-Pad", text: t("pad_choose_row", "Choose Row") },
					{ btn: "A", class: "pad-a", text: t("pad_confirm", "Confirm") },
					{ btn: "B", class: "pad-b", text: t("pad_cancel", "Cancel") }
				];
				break;
			case "DECK_CUSTOMIZATION":
				items = [
					{ btn: "LB / RB", class: "pad-btn-rect", text: t("pad_switch_panel", "Switch Panel") },
					{ btn: "D-Pad / LS", text: t("pad_navigate_hand", "Cards") },
					{ btn: "A", class: "pad-a", text: t("pad_select", "Select") },
					{ btn: "X", class: "pad-x", text: t("pad_leader", "Leader") },
					{ btn: "Y", class: "pad-y", text: t("pad_change_faction", "Faction") },
					{ btn: "Start", class: "pad-btn-rect", text: t("pad_start_game", "Start Game") },
					{ btn: "B", class: "pad-b", text: t("pad_back", "Back") }
				];
				break;
			case "VERSUS_LOBBY":
				items = [
					{ btn: "D-Pad / LS", text: "Navegar" },
					{ btn: "A", class: "pad-a", text: "Selecionar" },
					{ btn: "LB / RB", class: "pad-btn-rect", text: "Abas" },
					{ btn: "X", class: "pad-x", text: "Baralho / Copiar" },
					{ btn: "Y", class: "pad-y", text: "Pronto" },
					{ btn: "Start", class: "pad-btn-rect", text: "Iniciar Batalha" },
					{ btn: "B", class: "pad-b", text: "Voltar / Sair" }
				];
				break;
			case "VERSUS_EMOTE":
				items = [
					{ btn: "D-Pad", text: "Escolher Emote" },
					{ btn: "A", class: "pad-a", text: "Enviar" },
					{ btn: "B / RS", class: "pad-b", text: "Fechar" }
				];
				break;

			case "VERSUS_ALERT":
				items = [
					{ btn: "A / B / Start", class: "pad-a", text: "Voltar ao Menu" }
				];
				break;
			case "CAROUSEL":
				items = [
					{ btn: "D-Pad", text: t("pad_navigate_hand", "Cards") },
					{ btn: "A", class: "pad-a", text: t("pad_select", "Select") },
					{ btn: "B", class: "pad-b", text: t("pad_back", "Back") }
				];
				break;
			case "POPUP":
				items = [
					{ btn: "D-Pad", text: t("pad_navigate_hand", "Navigate") },
					{ btn: "A", class: "pad-a", text: t("pad_confirm", "Confirm") },
					{ btn: "B", class: "pad-b", text: t("pad_cancel", "Cancel") }
				];
				break;
			case "END_SCREEN":
				items = [
					{ btn: "D-Pad", text: t("pad_navigate_hand", "Navigate") },
					{ btn: "A", class: "pad-a", text: t("pad_select", "Select") }
				];
				break;
			default:
				// Main Menu views
				items = [
					{ btn: "D-Pad", text: t("pad_navigate_hand", "Navigate") },
					{ btn: "A", class: "pad-a", text: t("pad_confirm", "Confirm") },
					{ btn: "B", class: "pad-b", text: t("pad_back", "Back") }
				];
				break;
		}

		// Rebuild HTML only when items change
		const signature = items.map(i => i.btn + i.text).join("|");
		if (this.lastHudSignature === signature) return;
		this.lastHudSignature = signature;

		promptsCont.innerHTML = items.map(item => `
			<div class="pad-hint-item">
				<span class="pad-btn-badge ${item.class || ''}">${item.btn}</span>
				<span>${item.text}</span>
			</div>
		`).join("");
	},

	// =========================================================================
	// ANALOG RIGHT STICK SCREEN SCROLLING
	// =========================================================================
	handleRightStickScroll(pad, context) {
		const a = pad.axes || [0, 0, 0, 0];
		const rX = a[2] || 0;
		const rY = a[3] || 0;
		if (Math.abs(rX) < 0.16 && Math.abs(rY) < 0.16) return;

		let scrollTarget = null;

		// 1. Ancestor check from focused element
		if (this.currentFocusedElem) {
			let parent = this.currentFocusedElem.parentElement;
			while (parent && parent !== document.body) {
				const style = window.getComputedStyle(parent);
				const overflowY = style.overflowY;
				const overflowX = style.overflowX;
				const canScrollY = (overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight + 10;
				const canScrollX = (overflowX === "auto" || overflowX === "scroll") && parent.scrollWidth > parent.clientWidth + 10;
				if (canScrollY || canScrollX) {
					scrollTarget = parent;
					break;
				}
				parent = parent.parentElement;
			}
		}

		// 2. Context fallbacks
		if (!scrollTarget) {
			switch (context) {
				case "DECK_CUSTOMIZATION":
					if (this.navState.deckPanel === "bank" || this.navState.deckPanel === "bank_filters") {
						scrollTarget = document.getElementById("card-bank") || document.querySelector(".deck-column-bank");
					} else if (this.navState.deckPanel === "deck" || this.navState.deckPanel === "deck_filters") {
						scrollTarget = document.getElementById("card-deck") || document.querySelector(".deck-column-deck");
					} else {
						scrollTarget = document.querySelector(".deck-column-center");
					}
					break;
				case "STORY_SAVES":
					scrollTarget = document.getElementById("story-saves-slots-list") || document.querySelector(".saves-modal-frame");
					break;
				case "RULES_MODAL":
					scrollTarget = document.querySelector(".rules-categories-grid") || document.querySelector(".rules-modal-content");
					break;
				case "BOARD_MODAL":
					scrollTarget = document.querySelector(".board-options-grid") || document.querySelector(".board-modal-content");
					break;
				case "OPPONENT_MODAL":
					scrollTarget = document.querySelector(".opponent-options-grid") || document.querySelector(".opponent-modal-content");
					break;
				case "VERSUS_LOBBY":
					scrollTarget = document.getElementById("versus-prematch-panel") || document.querySelector(".versus-frame");
					break;
				case "MENU_SETTINGS":
					scrollTarget = document.getElementById("menu-settings");
					break;
				case "MENU_ACHIEVEMENTS":
					scrollTarget = document.getElementById("menu-achievements") || document.querySelector(".achievements-grid");
					break;
				case "STORY_MODAL":
					scrollTarget = document.getElementById("avatar-picker-grid") || document.querySelector(".compendium-cards-grid") || document.querySelector(".story-parchment-frame");
					break;
			}
		}

		if (scrollTarget) {
			const scrollSpeedY = 16 * (Math.abs(rY) > 0.65 ? 1.9 : 1.0);
			const scrollSpeedX = 14 * (Math.abs(rX) > 0.65 ? 1.9 : 1.0);
			if (Math.abs(rY) >= 0.16) {
				scrollTarget.scrollTop += rY * scrollSpeedY;
			}
			if (Math.abs(rX) >= 0.16) {
				scrollTarget.scrollLeft += rX * scrollSpeedX;
			}
		}
	},

	// =========================================================================
	// ON-SCREEN VIRTUAL KEYBOARD (OSK) ENGINE
	// =========================================================================
	oskLayoutLower: [
		["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
		["z", "x", "c", "v", "b", "n", "m", ",", ".", ";"],
		["SHIFT", "SPACE", "BACKSPACE", "CLEAR", "CONFIRM"]
	],
	oskLayoutUpper: [
		["!", "@", "#", "$", "%", "¨", "&", "*", "(", ")", "_", "+"],
		["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
		["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
		["Z", "X", "C", "V", "B", "N", "M", "<", ">", ":"],
		["SHIFT", "SPACE", "BACKSPACE", "CLEAR", "CONFIRM"]
	],

	openOSK(targetInput, title = "DIGITAR COM O CONTROLE") {
		if (!targetInput) return;
		this.oskActive = true;
		this.oskTargetInput = targetInput;
		this.oskValue = targetInput.value || "";
		this.oskRow = 1;
		this.oskCol = 0;
		this.oskShift = false;

		const modal = document.getElementById("gamepad-osk-modal");
		const titleEl = document.getElementById("gamepad-osk-title");
		const inputEl = document.getElementById("gamepad-osk-input");

		if (titleEl) titleEl.textContent = title.toUpperCase();
		if (inputEl) inputEl.value = this.oskValue;
		if (modal) modal.classList.remove("hide");

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}

		this.renderOSKGrid();
		this.updateHUD("OSK");
	},

	closeOSK(apply = true) {
		this.oskActive = false;
		const modal = document.getElementById("gamepad-osk-modal");
		if (modal) modal.classList.add("hide");

		if (apply && this.oskTargetInput) {
			this.oskTargetInput.value = this.oskValue;
			this.oskTargetInput.dispatchEvent(new Event("input", { bubbles: true }));
			this.oskTargetInput.dispatchEvent(new Event("change", { bubbles: true }));
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_confirm");
			}
		} else {
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("cancel");
			}
		}

		const restoredElem = this.oskTargetInput;
		this.oskTargetInput = null;
		const ctx = this.getContext();
		this.updateHUD(ctx);
		if (restoredElem) {
			this.setFocus(restoredElem);
		} else {
			this.applyContextFocus(ctx);
		}
	},

	renderOSKGrid() {
		const grid = document.getElementById("gamepad-osk-grid");
		if (!grid) return;
		grid.innerHTML = "";

		const layout = this.oskShift ? this.oskLayoutUpper : this.oskLayoutLower;

		layout.forEach((rowKeys, rIdx) => {
			const rowEl = document.createElement("div");
			rowEl.className = "gamepad-osk-row";
			rowKeys.forEach((key, cIdx) => {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = "gamepad-osk-key";
				btn.setAttribute("data-osk-r", rIdx);
				btn.setAttribute("data-osk-c", cIdx);

				if (key === "SPACE") {
					btn.classList.add("key-space");
					btn.textContent = "ESPAÇO";
				} else if (key === "BACKSPACE") {
					btn.classList.add("key-wide");
					btn.textContent = "⌫ APAGAR";
				} else if (key === "SHIFT") {
					btn.classList.add("key-wide");
					btn.textContent = this.oskShift ? "▲ SHIFT (ON)" : "△ SHIFT";
				} else if (key === "CLEAR") {
					btn.classList.add("key-wide");
					btn.textContent = "LIMPAR";
				} else if (key === "CONFIRM") {
					btn.classList.add("key-confirm");
					btn.textContent = "✔ CONFIRMAR";
				} else {
					btn.textContent = key;
				}

				btn.addEventListener("click", () => {
					this.pressOSKKey(key);
				});

				rowEl.appendChild(btn);
			});
			grid.appendChild(rowEl);
		});

		this.focusOSKKey();
	},

	focusOSKKey() {
		const layout = this.oskShift ? this.oskLayoutUpper : this.oskLayoutLower;
		this.oskRow = Math.max(0, Math.min(layout.length - 1, this.oskRow));
		this.oskCol = Math.max(0, Math.min(layout[this.oskRow].length - 1, this.oskCol));

		const btn = document.querySelector(`.gamepad-osk-key[data-osk-r="${this.oskRow}"][data-osk-c="${this.oskCol}"]`);
		if (btn) {
			this.setFocus(btn, false);
		}
	},

	navOSK(dir) {
		const layout = this.oskShift ? this.oskLayoutUpper : this.oskLayoutLower;
		if (dir === "up") {
			this.oskRow = (this.oskRow - 1 + layout.length) % layout.length;
			this.oskCol = Math.min(this.oskCol, layout[this.oskRow].length - 1);
		} else if (dir === "down") {
			this.oskRow = (this.oskRow + 1) % layout.length;
			this.oskCol = Math.min(this.oskCol, layout[this.oskRow].length - 1);
		} else if (dir === "left") {
			const rowLen = layout[this.oskRow].length;
			this.oskCol = (this.oskCol - 1 + rowLen) % rowLen;
		} else if (dir === "right") {
			const rowLen = layout[this.oskRow].length;
			this.oskCol = (this.oskCol + 1) % rowLen;
		}

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_hover");
		}
		this.focusOSKKey();
	},

	pressOSKKey(key) {
		if (key === "SHIFT") {
			this.oskShift = !this.oskShift;
			this.renderOSKGrid();
			return;
		} else if (key === "SPACE") {
			this.oskValue += " ";
		} else if (key === "BACKSPACE") {
			this.oskValue = this.oskValue.slice(0, -1);
		} else if (key === "CLEAR") {
			this.oskValue = "";
		} else if (key === "CONFIRM") {
			this.closeOSK(true);
			return;
		} else {
			this.oskValue += key;
		}

		const inputEl = document.getElementById("gamepad-osk-input");
		if (inputEl) inputEl.value = this.oskValue;

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_click");
		}
	},

	handleActionOSK(action) {
		if (action === "A") {
			const layout = this.oskShift ? this.oskLayoutUpper : this.oskLayoutLower;
			const key = layout[this.oskRow] && layout[this.oskRow][this.oskCol];
			if (key) this.pressOSKKey(key);
		} else if (action === "X") {
			this.pressOSKKey("BACKSPACE");
		} else if (action === "Y") {
			this.pressOSKKey("SPACE");
		} else if (action === "LB" || action === "RB") {
			this.pressOSKKey("SHIFT");
		} else if (action === "Start") {
			this.closeOSK(true);
		} else if (action === "B") {
			this.closeOSK(false);
		}
	},

	// =========================================================================
	// SALVAMENTOS DA JORNADA NAVIGATION (STORY_SAVES)
	// =========================================================================
	navStorySaves(dir) {
		const modal = document.getElementById("story-saves-modal");
		if (!modal || modal.classList.contains("hide")) return;

		const slotCards = Array.from(document.querySelectorAll("#story-saves-slots-list .story-save-slot-card"));
		const rows = [];

		slotCards.forEach(card => {
			const btns = Array.from(card.querySelectorAll("button")).filter(b => b.offsetParent !== null);
			if (btns.length > 0) rows.push(btns);
		});

		const footerBtns = Array.from(document.querySelectorAll(".saves-modal-actions button")).filter(b => b.offsetParent !== null);
		if (footerBtns.length > 0) rows.push(footerBtns);

		if (rows.length === 0) return;

		let rIdx = -1;
		let cIdx = -1;
		for (let r = 0; r < rows.length; r++) {
			const c = rows[r].indexOf(this.currentFocusedElem);
			if (c !== -1) {
				rIdx = r;
				cIdx = c;
				break;
			}
		}
		if (rIdx === -1) {
			rIdx = this.navState.storySavesRow || 0;
			cIdx = this.navState.storySavesCol || 0;
		}

		rIdx = Math.max(0, Math.min(rows.length - 1, rIdx));
		cIdx = Math.max(0, Math.min(rows[rIdx].length - 1, cIdx));

		if (dir === "up") {
			rIdx = Math.max(0, rIdx - 1);
			cIdx = Math.min(cIdx, rows[rIdx].length - 1);
		} else if (dir === "down") {
			rIdx = Math.min(rows.length - 1, rIdx + 1);
			cIdx = Math.min(cIdx, rows[rIdx].length - 1);
		} else if (dir === "left") {
			cIdx = Math.max(0, cIdx - 1);
		} else if (dir === "right") {
			cIdx = Math.min(rows[rIdx].length - 1, cIdx + 1);
		}

		this.navState.storySavesRow = rIdx;
		this.navState.storySavesCol = cIdx;

		const target = rows[rIdx][cIdx];
		if (target) {
			this.setFocus(target);
		}
	},

	// =========================================================================
	// REGRAS ADICIONAIS MODAL NAVIGATION (RULES_MODAL)
	// =========================================================================
	navRulesModal(dir) {
		const items = [
			document.querySelector("#rules-modal .witcher-modal-close"),
			...Array.from(document.querySelectorAll("#rules-modal .rules-preset-btn")),
			...Array.from(document.querySelectorAll("#rules-modal .rules-checkbox-item")),
			...Array.from(document.querySelectorAll("#rules-modal .rules-modal-actions button"))
		].filter(el => el && el.offsetParent !== null);

		if (items.length === 0) return;
		let idx = items.indexOf(this.currentFocusedElem);
		if (idx === -1) idx = this.navState.rulesModalIndex || 1;

		if (dir === "up" || dir === "left") {
			idx = Math.max(0, idx - 1);
		} else if (dir === "down" || dir === "right") {
			idx = Math.min(items.length - 1, idx + 1);
		}
		this.navState.rulesModalIndex = idx;
		if (items[idx]) this.setFocus(items[idx]);
	},

	// =========================================================================
	// TABULEIRO MODAL NAVIGATION (BOARD_MODAL)
	// =========================================================================
	navBoardModal(dir) {
		const items = [
			...Array.from(document.querySelectorAll("#board-modal .board-option-card")),
			document.querySelector("#board-modal .witcher-modal-close"),
			document.querySelector("#board-modal .opponent-modal-footer button")
		].filter(el => el && el.offsetParent !== null);

		if (items.length === 0) return;
		let idx = items.indexOf(this.currentFocusedElem);
		if (idx === -1) idx = this.navState.boardModalIndex || 0;

		if (dir === "left") idx = Math.max(0, idx - 1);
		else if (dir === "right") idx = Math.min(items.length - 1, idx + 1);
		else if (dir === "up") idx = Math.max(0, idx - 2);
		else if (dir === "down") idx = Math.min(items.length - 1, idx + 2);

		this.navState.boardModalIndex = idx;
		if (items[idx]) this.setFocus(items[idx]);
	},

	// =========================================================================
	// ADVERSÁRIO MODAL NAVIGATION (OPPONENT_MODAL)
	// =========================================================================
	navOpponentModal(dir) {
		const items = [
			...Array.from(document.querySelectorAll("#opponent-modal .opponent-option-card")),
			document.querySelector("#opponent-modal .witcher-modal-close"),
			document.querySelector("#opponent-modal .opponent-modal-footer button")
		].filter(el => el && el.offsetParent !== null);

		if (items.length === 0) return;
		let idx = items.indexOf(this.currentFocusedElem);
		if (idx === -1) idx = this.navState.opponentModalIndex || 0;

		if (dir === "left") idx = Math.max(0, idx - 1);
		else if (dir === "right") idx = Math.min(items.length - 1, idx + 1);
		else if (dir === "up") idx = Math.max(0, idx - 2);
		else if (dir === "down") idx = Math.min(items.length - 1, idx + 2);

		this.navState.opponentModalIndex = idx;
		if (items[idx]) this.setFocus(items[idx]);
	},

};

// Auto-initialize when DOM is ready
if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => GamepadManager.init());
	} else {
		GamepadManager.init();
	}
	window.addEventListener("load", () => {
		if (!GamepadManager.initialized) GamepadManager.init();
	});
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = GamepadManager;
}
