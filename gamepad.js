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
		popupBtnIndex: 0
	},

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
		} else {
			this.lastActiveTime = Date.now();
			this.refreshFocus();
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
		const popup = document.getElementById("popup");
		if (popup && !popup.classList.contains("hide")) return "POPUP";

		const carousel = document.getElementById("carousel");
		if (carousel && !carousel.classList.contains("hide")) return "CAROUSEL";

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
		// 0: A, 1: B, 2: X, 3: Y, 4: LB, 5: RB, 8: Back, 9: Start, 12: Up, 13: Down, 14: Left, 15: Right
		const b = pad.buttons;
		const a = pad.axes;

		// Digital stick conversion
		const stickLeft = (a[0] < -0.5);
		const stickRight = (a[0] > 0.5);
		const stickUp = (a[1] < -0.5);
		const stickDown = (a[1] > 0.5);

		const isPressed = (idx) => (b[idx] && b[idx].pressed);

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
		const btnStart = isPressed(9);

		// Check if any controller input occurred
		const anyAction = dUp || dDown || dLeft || dRight || btnA || btnB || btnX || btnY || btnLB || btnRB || btnStart;
		if (anyAction) {
			if (!this.active) {
				this.setGamepadActive(true);
			}
			this.lastActiveTime = Date.now();
		}

		if (!this.active) return;

		const context = this.getContext();
		this.updateHUD(context);

		// Handle Directional inputs with repeat curve (260ms initial delay, 110ms repeat)
		const now = performance.now();
		let activeDir = null;
		if (dUp) activeDir = "up";
		else if (dDown) activeDir = "down";
		else if (dLeft) activeDir = "left";
		else if (dRight) activeDir = "right";

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
		}
	},

	handleAction(action, context) {
		switch (context) {
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
		}
	},

	// -------------------------------------------------------------
	// Context Navigation Implementations
	// -------------------------------------------------------------

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
		const topItems = [
			document.getElementById("btn-back-to-menu"),
			document.getElementById("upload-deck"),
			document.getElementById("change-faction"),
			document.getElementById("download-deck"),
			document.getElementById("start-game")
		].filter(Boolean);

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
				this.setFocus(topItems[0]);
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
				this.navState.deckTopIndex = (panelId === "card-bank") ? 0 : 4;
				this.setFocus(topItems[this.navState.deckTopIndex]);
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

	// 10. Match Hand Navigation
	navMatchHand(dir) {
		if (typeof player_me === "undefined" || !player_me || !player_me.hand || !player_me.hand.cards) return;
		const cards = player_me.hand.cards;
		if (cards.length === 0) return;

		let idx = this.navState.matchHandIndex;
		idx = Math.max(0, Math.min(cards.length - 1, idx));

		const passBtn = document.getElementById("pass-button");
		const leaderMe = document.getElementById("leader-me");

		// If currently focusing pass button or leader
		if (this.currentFocusedElem === passBtn || (leaderMe && leaderMe.contains(this.currentFocusedElem))) {
			if (dir === "down") {
				// Return focus to active hand card
				this.setFocus(cards[idx].elem);
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
			idx = Math.min(cards.length - 1, idx + 1);
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
		const card = cards[idx];
		if (card && card.elem) {
			this.setFocus(card.elem);
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

	// Applies focus automatically when entering or refreshing a context
	applyContextFocus(context) {
		switch (context) {
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
				if (typeof player_me !== "undefined" && player_me && player_me.hand && player_me.hand.cards) {
					const cards = player_me.hand.cards;
					const idx = Math.max(0, Math.min(cards.length - 1, this.navState.matchHandIndex || 0));
					if (cards[idx] && cards[idx].elem) {
						this.setFocus(cards[idx].elem, false);
					}
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
