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
		deckPanel: "bank", // 'bank' or 'deck' or 'top'
		deckBankIndex: 0,
		deckDeckIndex: 0,
		deckTopIndex: 0,
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

	// Story Map Modern Virtual Cursor State
	mapCursorX: 0,
	mapCursorY: 0,
	mapCursorInitialized: false,
	hoveredMapTarget: null,

	// Currently focused DOM element
	currentFocusedElem: null,

	init() {
		window.addEventListener("gamepadconnected", e => this.onConnected(e));
		window.addEventListener("gamepaddisconnected", e => this.onDisconnected(e));

		// Detect mouse movement to toggle controller HUD visibility gracefully
		let lastMouseX = 0, lastMouseY = 0;
		window.addEventListener("mousemove", e => {
			if (Math.abs(e.clientX - lastMouseX) > 8 || Math.abs(e.clientY - lastMouseY) > 8) {
				lastMouseX = e.clientX;
				lastMouseY = e.clientY;
				if (this.active && Date.now() - this.lastActiveTime > 2000) {
					this.setGamepadActive(false);
				}
			}
		});

		// Check initial gamepads
		const pads = navigator.getGamepads ? navigator.getGamepads() : [];
		for (let i = 0; i < pads.length; i++) {
			if (pads[i]) {
				this.gamepadIndex = pads[i].index;
				this.showToast((typeof I18N !== "undefined") ? I18N.t("pad_connected") : "Controller Connected");
				break;
			}
		}

		// Start polling loop
		this.startPolling();
	},

	onConnected(e) {
		this.gamepadIndex = e.gamepad.index;
		const name = e.gamepad.id || "Gamepad";
		const cleanName = name.includes("Xbox") ? "Xbox Controller" 
			: name.includes("DualSense") ? "PS5 DualSense"
			: name.includes("Wireless") ? "PlayStation Controller" : "Controller";
		this.showToast(((typeof I18N !== "undefined") ? I18N.t("pad_connected") : "Controller Connected") + ": " + cleanName);
		this.setGamepadActive(true);
	},

	onDisconnected(e) {
		if (this.gamepadIndex === e.gamepad.index) {
			this.gamepadIndex = null;
			this.setGamepadActive(false);
			this.showToast((typeof I18N !== "undefined") ? I18N.t("pad_disconnected") : "Controller Disconnected");
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
		const loop = () => {
			this.poll();
			this.rafId = requestAnimationFrame(loop);
		};
		this.rafId = requestAnimationFrame(loop);
	},

	getGamepad() {
		if (!navigator.getGamepads) return null;
		const pads = navigator.getGamepads();
		if (this.gamepadIndex !== null && pads[this.gamepadIndex]) {
			return pads[this.gamepadIndex];
		}
		for (let i = 0; i < pads.length; i++) {
			if (pads[i]) {
				this.gamepadIndex = i;
				return pads[i];
			}
		}
		return null;
	},

	// Identifies the active screen context
	getContext() {
		const ingameDialog = document.getElementById("ingame-dialog-modal");
		if (ingameDialog && !ingameDialog.classList.contains("hide")) return "INGAME_DIALOG";

		const versusAlert = document.getElementById("versus-alert-modal");
		if (versusAlert && !versusAlert.classList.contains("hide")) return "VERSUS_ALERT";

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
		const storyModals = ["story-battle-modal", "story-tournament-modal", "story-shop-modal", "story-compendium-modal"];
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
		const btnStart = isPressed(9);

		// Check if any controller input occurred
		const anyStick = (Math.abs(a[0] || 0) > 0.18 || Math.abs(a[1] || 0) > 0.18 || rStickMoved);
		const anyAction = dUp || dDown || dLeft || dRight || anyStick || btnA || btnB || btnX || btnY || btnLB || btnRB || btnLT || btnRT || btnStart;
		if (anyAction) {
			if (!this.active) {
				this.setGamepadActive(true);
			}
			this.lastActiveTime = Date.now();
		}

		if (!this.active) return;

		const context = this.getContext();
		this.updateHUD(context);

		// Continuous analog cursor & map pan/zoom when in STORY_MAP
		if (context === "STORY_MAP") {
			this.updateStoryMapCursor(pad);
		} else {
			this.hideMapCursor();
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
		checkEdge("Start", btnStart, () => this.handleAction("Start", context));
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
			case "VERSUS_ALERT":
				this.navVersusAlert(dir);
				break;
		}
	},

	handleAction(action, context) {
		switch (context) {
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
					if (typeof StoryMode !== "undefined") StoryMode.closeMapToMenu();
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
					if (isOutcome) {
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
					if (typeof Carousel !== "undefined" && Carousel.curr) {
						Carousel.curr.select({ stopPropagation: () => {} });
					}
				} else if (action === "B") {
					if (typeof Carousel !== "undefined" && Carousel.curr && Carousel.curr.bExit) {
						Carousel.curr.cancel();
					}
				}
				break;

			case "END_SCREEN":
				if (action === "A" && this.currentFocusedElem) {
					this.currentFocusedElem.click();
				}
				break;

			case "MENU_NAV":
				if (action === "A" && this.currentFocusedElem) {
					this.currentFocusedElem.click();
				}
				break;

			case "MENU_PLAY":
				if (action === "A" && this.currentFocusedElem) {
					this.currentFocusedElem.click();
				} else if (action === "B") {
					MenuController.showView("nav");
				}
				break;

			case "MENU_SETTINGS":
				if (action === "A" && this.currentFocusedElem) {
					if (this.currentFocusedElem.type === "checkbox") {
						this.currentFocusedElem.checked = !this.currentFocusedElem.checked;
						this.currentFocusedElem.dispatchEvent(new Event("change"));
					} else {
						this.currentFocusedElem.click();
					}
				} else if (action === "B") {
					MenuController.saveSettings();
					MenuController.showView("nav");
				}
				break;

			case "MENU_ACHIEVEMENTS":
				if (action === "LB") {
					this.cycleAchFilter(-1);
				} else if (action === "RB") {
					this.cycleAchFilter(1);
				} else if (action === "B") {
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
					if (this.currentFocusedElem) this.currentFocusedElem.click();
				} else if (action === "B") {
					if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
						StoryMode.closeCampaignDeckBuilder();
					} else if (typeof VersusMode !== "undefined" && VersusMode.isCustomizingDeck) {
						VersusMode.closeDeckBuilderForVersus();
					} else {
						MenuController.returnToMainMenu();
					}
				} else if (action === "LB") {
					this.switchDeckPanel("bank");
				} else if (action === "RB") {
					this.switchDeckPanel("deck");
				} else if (action === "X") {
					if (typeof dm !== "undefined" && dm.selectLeader) dm.selectLeader();
				} else if (action === "Y") {
					if (typeof dm !== "undefined" && dm.selectFaction) dm.selectFaction();
				} else if (action === "Start") {
					if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
						StoryMode.closeCampaignDeckBuilder();
					} else {
						const startBtn = document.getElementById("start-game");
						if (startBtn) startBtn.click();
					}
				}
				break;

			case "MATCH_HAND":
				if (action === "Start") {
					// Open Exit / Pause menu
					const exitBtn = document.getElementById("exit-game");
					if (exitBtn) exitBtn.click();
					return;
				}

				if (!this.isPlayerTurn()) return;

				if (action === "A") {
					if (this.currentFocusedElem) {
						this.currentFocusedElem.click();
						// Once clicked, give a tiny delay for gwent.js to set up selectable rows,
						// then auto-focus the first selectable destination!
						setTimeout(() => {
							if (this.getContext() === "MATCH_TARGETING") {
								this.navState.matchRowIndex = 0;
								this.applyContextFocus("MATCH_TARGETING");
							}
						}, 40);
					}
				} else if (action === "B") {
					// Cancel any card preview or dismiss background
					if (typeof ui !== "undefined" && ui.cancel) {
						ui.cancel();
					}
					const bg = document.getElementById("click-background");
					if (bg && !bg.classList.contains("noclick")) bg.click();
					this.applyContextFocus("MATCH_HAND");
				} else if (action === "Y") {
					// Pass Round shortcut
					const passBtn = document.getElementById("pass-button");
					if (passBtn && !passBtn.classList.contains("noclick")) passBtn.click();
				} else if (action === "X") {
					// Play Leader shortcut
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
					// Cancel targeting and card preview
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

	// -------------------------------------------------------------
	// Context Navigation Implementations
	// -------------------------------------------------------------

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
				const delta = (dir === "right") ? 5 : -5;
				const newVal = Math.max(0, Math.min(100, parseInt(item.value, 10) + delta));
				item.value = newVal;
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

	// 9. Deck Customization View
	switchDeckPanel(targetPanel) {
		this.navState.deckPanel = targetPanel;
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
		this.applyContextFocus("DECK_CUSTOMIZATION");
	},

	navDeckCustomization(dir) {
		const isStoryDeck = (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign);
		const topItems = [
			isStoryDeck ? document.getElementById("btn-story-back-to-map") : document.getElementById("btn-back-to-menu"),
			isStoryDeck ? null : document.getElementById("upload-deck"),
			document.getElementById("change-faction"),
			document.getElementById("download-deck"),
			isStoryDeck ? document.getElementById("btn-story-deck-confirm") : document.getElementById("start-game")
		].filter(el => el && !el.classList.contains("hide") && el.offsetParent !== null);

		if (this.navState.deckPanel === "top") {
			if (dir === "left") {
				this.navState.deckTopIndex = Math.max(0, this.navState.deckTopIndex - 1);
				this.setFocus(topItems[this.navState.deckTopIndex]);
			} else if (dir === "right") {
				this.navState.deckTopIndex = Math.min(topItems.length - 1, this.navState.deckTopIndex + 1);
				this.setFocus(topItems[this.navState.deckTopIndex]);
			} else if (dir === "down") {
				this.navState.deckPanel = (this.navState.deckTopIndex < 2) ? "bank" : "deck";
				this.applyContextFocus("DECK_CUSTOMIZATION");
			}
			return;
		}

		const panelId = (this.navState.deckPanel === "bank") ? "card-bank" : "card-deck";
		const cards = Array.from(document.querySelectorAll(`#${panelId} .card-lg:not(.hide):not(.empty)`));
		if (cards.length === 0) {
			if (dir === "up") {
				this.navState.deckPanel = "top";
				if (topItems.length > 0) this.setFocus(topItems[0]);
			}
			return;
		}

		let idx = (this.navState.deckPanel === "bank") ? this.navState.deckBankIndex : this.navState.deckDeckIndex;
		idx = Math.max(0, Math.min(cards.length - 1, idx));

		const cols = 3; // 3 columns in .card-array

		if (dir === "left") {
			if (idx % cols === 0 && this.navState.deckPanel === "deck") {
				// Jump from deck to bank
				this.navState.deckPanel = "bank";
				this.applyContextFocus("DECK_CUSTOMIZATION");
				return;
			}
			idx = Math.max(0, idx - 1);
		} else if (dir === "right") {
			if (idx % cols === cols - 1 && this.navState.deckPanel === "bank") {
				// Jump from bank to deck
				this.navState.deckPanel = "deck";
				this.applyContextFocus("DECK_CUSTOMIZATION");
				return;
			}
			idx = Math.min(cards.length - 1, idx + 1);
		} else if (dir === "up") {
			if (idx < cols) {
				// Jump to top controls
				this.navState.deckPanel = "top";
				this.navState.deckTopIndex = (panelId === "card-bank") ? 0 : Math.max(0, topItems.length - 1);
				if (topItems[this.navState.deckTopIndex]) {
					this.setFocus(topItems[this.navState.deckTopIndex]);
				}
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
		const leaderMe = document.getElementById("leader-me");

		// If currently focusing pass button or leader
		if (this.currentFocusedElem === passBtn || (leaderMe && leaderMe.contains(this.currentFocusedElem))) {
			if (dir === "down") {
				// Return focus to active hand card
				this.setFocus(cardElems[idx]);
				return;
			} else if (dir === "left" && this.currentFocusedElem === passBtn) {
				if (leaderMe && !leaderMe.classList.contains("noclick")) {
					const lCont = leaderMe.querySelector(".leader-container");
					if (lCont) this.setFocus(lCont);
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

		// Magnetic hit detection against map nodes and HUD/filter buttons
		let bestTarget = null;
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

		if (!bestTarget) {
			const uiBtns = document.querySelectorAll("#story-map-screen .story-hud-btn, #story-map-screen .story-filter-btn, #story-map-screen .story-map-control-btn");
			uiBtns.forEach(btn => {
				if (btn.offsetParent === null) return;
				const r = btn.getBoundingClientRect();
				if (this.mapCursorX >= r.left - 6 && this.mapCursorX <= r.right + 6 &&
					this.mapCursorY >= r.top - 6 && this.mapCursorY <= r.bottom + 6) {
					bestTarget = btn;
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

	// 13. Story Modal Navigation (Battle, Tournament, Shop, Compendium, Outcome)
	getActiveStoryModalButtons() {
		const modalIds = ["story-outcome-modal", "story-battle-modal", "story-tournament-modal", "story-shop-modal", "story-compendium-modal"];
		for (const id of modalIds) {
			const m = document.getElementById(id);
			if (m && !m.classList.contains("hide")) {
				return Array.from(m.querySelectorAll("button:not([disabled]):not(.hide)")).filter(b => b.offsetParent !== null);
			}
		}
		return [];
	},

	navStoryModal(dir) {
		const btns = this.getActiveStoryModalButtons();
		if (btns.length === 0) return;

		// Scroll compendium grid or tournament list if open
		const compModal = document.getElementById("story-compendium-modal");
		if (compModal && !compModal.classList.contains("hide")) {
			const grid = document.getElementById("story-comp-cards-grid");
			if (grid && (dir === "up" || dir === "down")) {
				grid.scrollTop += (dir === "down" ? 90 : -90);
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

	navVersusAlert(dir) {
		const btn = document.querySelector("#versus-alert-modal button");
		if (btn) this.setFocus(btn);
	},

	navVersusLobby(dir) {
		const prematch = document.getElementById("versus-prematch-panel");
		const isPrematch = prematch && getComputedStyle(prematch).display !== "none";

		if (isPrematch) {
			const btns = [
				document.querySelector(".versus-btn-leave-room"),
				document.querySelector(".versus-btn-deck"),
				document.getElementById("btn-versus-ready"),
				document.getElementById("btn-versus-start-match")
			].filter(b => b && !b.classList.contains("hide") && getComputedStyle(b).display !== "none");

			if (btns.length === 0) return;
			let idx = btns.indexOf(this.currentFocusedElem);
			if (idx === -1) idx = 0;

			if (dir === "left" || dir === "up") {
				idx = Math.max(0, idx - 1);
			} else if (dir === "right" || dir === "down") {
				idx = Math.min(btns.length - 1, idx + 1);
			}
			this.setFocus(btns[idx]);
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
			focusables = [nickInput, tabHost, tabJoin, copyBtn, closeBtn].filter(Boolean);
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
					const btn = document.getElementById("btn-back-to-menu");
					if (btn) this.setFocus(btn, false);
				} else {
					const panelId = (this.navState.deckPanel === "bank") ? "card-bank" : "card-deck";
					const cards = Array.from(document.querySelectorAll(`#${panelId} .card-lg:not(.hide):not(.empty)`));
					const idx = (this.navState.deckPanel === "bank") ? this.navState.deckBankIndex : this.navState.deckDeckIndex;
					if (cards.length > 0) this.setFocus(cards[Math.min(cards.length - 1, idx || 0)], false);
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
	}
};

// Auto-initialize when DOM is ready
if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => GamepadManager.init());
	} else {
		GamepadManager.init();
	}
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = GamepadManager;
}
