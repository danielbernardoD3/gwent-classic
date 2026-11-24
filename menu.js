"use strict";

class MenuController {
	static init() {
		// Initialize Language
		I18N.init();

		// Synchronize Version Badge on Main Menu
		if (typeof InGameUpdater !== "undefined" && typeof InGameUpdater.syncVersionUI === "function") {
			InGameUpdater.syncVersionUI();
		}

		// Load saved settings into UI
		MenuController.loadSettingsIntoUI();

		// Attach Witcher sound effects to all interactive menu elements
		const interactiveElements = document.querySelectorAll(
			".witcher-menu-btn, .witcher-select, .witcher-checkbox, .witcher-slider, .credit-card, .deck-options, .ach-filter-btn"
		);
		interactiveElements.forEach(btn => {
			btn.addEventListener("mouseenter", () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					const hoverSfx = Math.random() > 0.5 ? 'witcher_hover' : 'witcher_hover2';
					AudioManager.playSFX(hoverSfx);
				}
			});
		});

		// Attach audio to selects & checkboxes
		document.querySelectorAll(".witcher-select").forEach(sel => {
			sel.addEventListener("change", () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_switch");
				}
			});
		});

		document.querySelectorAll(".witcher-checkbox").forEach(chk => {
			chk.addEventListener("change", () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX(chk.checked ? "witcher_toggle_on" : "witcher_toggle_off");
				}
			});
		});

		// Add "Main Menu" button to deck customization screen
		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom && !document.getElementById("btn-back-to-menu")) {
			const backMenuBtn = document.createElement("button");
			backMenuBtn.id = "btn-back-to-menu";
			backMenuBtn.className = "deck-options";
			backMenuBtn.style.position = "absolute";
			backMenuBtn.style.top = "2vh";
			backMenuBtn.style.left = "2vw";
			backMenuBtn.style.zIndex = "100";
			backMenuBtn.textContent = I18N.t("btn_main_menu");
			backMenuBtn.setAttribute("data-i18n", "btn_main_menu");
			backMenuBtn.addEventListener("mouseenter", () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_hover");
				}
			});
			backMenuBtn.addEventListener("click", () => {
				MenuController.returnToMainMenu();
			});
			deckCustom.appendChild(backMenuBtn);
		}

		// Ensure game canvas/deck maker starts hidden until play is clicked
		if (deckCustom) {
			deckCustom.classList.add("hide");
		}

		// Initialize Story Mode
		if (typeof StoryMode !== "undefined") {
			StoryMode.init();
		}

		// Initialize Subtle Main Menu Particles (Embers & Golden Dust)
		MenuController.initMenuParticles();

		// Override native browser alert() so all notifications render in-game
		window.showInGameAlert = (msg, title, icon, onOk) => MenuController.showAlert(msg, title, icon, onOk);
		window.showInGameConfirm = (msg, title, onConfirm, onCancel, confirmText, cancelText, icon) =>
			MenuController.showConfirm(msg, title, onConfirm, onCancel, confirmText, cancelText, icon);
		window.alert = (msg) => MenuController.showAlert(msg);
	}

	static showAlert(message, title = "AVISO DO CONTINENTE", icon = "🐺", onOk = null) {
		const modal = document.getElementById("ingame-dialog-modal");
		if (!modal) return;

		const titleEl = document.getElementById("ingame-dialog-title");
		const iconEl = document.getElementById("ingame-dialog-icon");
		const msgEl = document.getElementById("ingame-dialog-message");
		const confirmBtn = document.getElementById("ingame-dialog-confirm-btn");
		const cancelBtn = document.getElementById("ingame-dialog-cancel-btn");

		if (titleEl) titleEl.textContent = title || "AVISO DO CONTINENTE";
		if (iconEl) {
			if (icon && (icon.endsWith(".png") || icon.includes("/"))) {
				iconEl.innerHTML = `<img src="${icon}" class="ingame-dialog-icon-img" alt="Ícone" />`;
			} else if (icon === "🐺") {
				iconEl.innerHTML = `<img src="img/hud-icons/Medallion.png" class="ingame-dialog-icon-img" alt="Medalhão" />`;
			} else if (icon === "⚔" || icon === "⚔️") {
				iconEl.innerHTML = `<img src="img/hud-icons/Duel.png" class="ingame-dialog-icon-img" alt="Duelo" />`;
			} else {
				iconEl.textContent = icon || "🐺";
			}
		}
		if (msgEl) msgEl.textContent = String(message || "");

		if (cancelBtn) {
			cancelBtn.classList.add("hide");
			cancelBtn.onclick = null;
		}
		if (confirmBtn) {
			confirmBtn.textContent = "Entendido";
			confirmBtn.onclick = () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_confirm");
				}
				modal.classList.add("hide");
				if (typeof onOk === "function") onOk();
			};
		}

		modal.classList.remove("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static showConfirm(
		message,
		title = "CONFIRMAÇÃO",
		onConfirm = null,
		onCancel = null,
		confirmText = "Confirmar",
		cancelText = "Cancelar",
		icon = "⚔️"
	) {
		const modal = document.getElementById("ingame-dialog-modal");
		if (!modal) {
			if (typeof onConfirm === "function") onConfirm();
			return;
		}

		const titleEl = document.getElementById("ingame-dialog-title");
		const iconEl = document.getElementById("ingame-dialog-icon");
		const msgEl = document.getElementById("ingame-dialog-message");
		const confirmBtn = document.getElementById("ingame-dialog-confirm-btn");
		const cancelBtn = document.getElementById("ingame-dialog-cancel-btn");

		if (titleEl) titleEl.textContent = title || "CONFIRMAÇÃO";
		if (iconEl) {
			if (icon && (icon.endsWith(".png") || icon.includes("/"))) {
				iconEl.innerHTML = `<img src="${icon}" class="ingame-dialog-icon-img" alt="Ícone" />`;
			} else if (icon === "🐺") {
				iconEl.innerHTML = `<img src="img/hud-icons/Medallion.png" class="ingame-dialog-icon-img" alt="Medalhão" />`;
			} else if (icon === "⚔" || icon === "⚔️") {
				iconEl.innerHTML = `<img src="img/hud-icons/Duel.png" class="ingame-dialog-icon-img" alt="Duelo" />`;
			} else {
				iconEl.textContent = icon || "⚔️";
			}
		}
		if (msgEl) msgEl.textContent = String(message || "");

		if (cancelBtn) {
			cancelBtn.textContent = cancelText || "Cancelar";
			cancelBtn.classList.remove("hide");
			cancelBtn.onclick = () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_back");
				}
				modal.classList.add("hide");
				if (typeof onCancel === "function") onCancel();
			};
		}
		if (confirmBtn) {
			confirmBtn.textContent = confirmText || "Confirmar";
			confirmBtn.onclick = () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_confirm");
				}
				modal.classList.add("hide");
				if (typeof onConfirm === "function") onConfirm();
			};
		}

		modal.classList.remove("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static openStoryMode() {
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_click");
		}
		if (typeof StoryMode !== "undefined") {
			StoryMode.startNewCampaignFromMenu();
		}
	}

	static openVersusMode() {
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_click");
		}
		if (typeof VersusMode !== "undefined") {
			VersusMode.openLobby();
		} else {
			console.error("VersusMode não inicializado.");
		}
	}

	static showView(viewName) {
		const views = document.querySelectorAll(".menu-view");
		views.forEach(v => v.classList.remove("active"));

		const target = document.getElementById("menu-" + viewName);
		if (target) {
			target.classList.add("active");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				if (viewName === "nav") {
					AudioManager.playSFX("witcher_back");
				} else if (viewName === "play") {
					AudioManager.playSFX("witcher_click");
				} else {
					AudioManager.playSFX("witcher_tab_open");
				}
			}
		}

		if (viewName === "achievements" && typeof Achievements !== "undefined") {
			Achievements.renderUI(Achievements.currentFilter || "all");
		}
	}

	static closeAchievements() {
		const storyMap = document.getElementById("story-map-screen");
		if (storyMap && !storyMap.classList.contains("hide")) {
			const mainMenu = document.getElementById("main-menu");
			if (mainMenu) mainMenu.classList.add("hide");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_back");
			}
			return;
		}
		MenuController.showView("nav");
	}

	static startGame(difficulty = "medium") {
		if (typeof Settings !== "undefined" && Settings.difficulty) {
			Settings.difficulty.set(difficulty);
		} else {
			localStorage.setItem("gc-difficulty", difficulty);
		}

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_slash");
		}

		// Hide Main Menu
		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.add("hide");

		if (typeof ScreenManager !== "undefined") {
			ScreenManager.setScreen("deck");
		} else if (document.body) {
			document.body.setAttribute("data-screen", "deck");
		}

		// Show Deck Customization
		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.remove("story-deck-mode");
			deckCustom.classList.remove("versus-deck-mode");
			deckCustom.classList.remove("hide");
		}

		if (typeof StoryMode !== "undefined") {
			StoryMode.isCustomizingCampaign = false;
			StoryMode.activeMatch = null;
		}
		if (typeof VersusMode !== "undefined") {
			VersusMode.isCustomizingDeck = false;
			VersusMode.isActive = false;
		}

		if (typeof AvatarManager !== "undefined") {
			AvatarManager.syncAllPlayerAvatarUI();
		}

		// Hide Story map if it was open and restore full sandbox collection in DeckMaker
		const storyMap = document.getElementById("story-map-screen");
		if (storyMap) storyMap.classList.add("hide");

		const uploadDeckBtn = document.getElementById("upload-deck");
		if (uploadDeckBtn) {
			uploadDeckBtn.classList.remove("hide");
			uploadDeckBtn.style.display = "";
		}

		if (typeof window.dm !== "undefined" && window.dm) {
			const lastFac = (typeof Settings !== "undefined" && Settings.lastFaction)
				? Settings.lastFaction.get()
				: "realms";
			window.dm.loadFactionDeck(lastFac || "realms", true);
			window.dm.updateFilter("all");
			if (typeof window.dm.updateQuickBoardUI === "function") {
				window.dm.updateQuickBoardUI();
			}
			window.dm.makeVisible();
		}

		const vsTopBack = document.getElementById("btn-versus-top-back");
		if (vsTopBack) vsTopBack.classList.add("hide");

		const vsDeckConfirm = document.getElementById("btn-versus-deck-confirm");
		if (vsDeckConfirm) vsDeckConfirm.classList.add("hide");

		const startBtn = document.getElementById("start-game");
		if (startBtn) {
			startBtn.classList.remove("hide");
			startBtn.style.display = "";
		}

		const opPreview = document.getElementById("opponent-preview");
		if (opPreview) {
			opPreview.classList.remove("hide");
			opPreview.style.display = "";
		}

		const boardPreview = document.getElementById("board-preview");
		if (boardPreview) {
			boardPreview.classList.remove("hide");
			boardPreview.style.display = "";
		}

		const standardBack = document.getElementById("btn-back-to-menu");
		if (standardBack) {
			standardBack.classList.remove("hide");
			standardBack.style.display = "";
		}

		const storyBackToMap = document.getElementById("btn-story-back-to-map");
		if (storyBackToMap) storyBackToMap.classList.add("hide");

		const storyDeckConfirm = document.getElementById("btn-story-deck-confirm");
		if (storyDeckConfirm) storyDeckConfirm.classList.add("hide");

		// Hide board gear/bell while in deck builder
		const openSetBtn = document.getElementById("open-game-settings");
		if (openSetBtn) openSetBtn.classList.add("deck-menu");
		const toggleNotifBtn = document.getElementById("toggle-notifications");
		if (toggleNotifBtn) toggleNotifBtn.classList.add("deck-menu");

		// Ensure background music is playing if enabled
		if (typeof MusicManager !== "undefined") {
			MusicManager.play();
		}
	}

	static returnToMainMenu() {
		if (typeof game !== "undefined" && game && typeof GameState !== "undefined" && typeof game.setState === "function") {
			game.setState(GameState.CUSTOMIZE);
		}
		if (typeof ScreenManager !== "undefined") {
			ScreenManager.setScreen("menu");
		} else if (document.body) {
			document.body.setAttribute("data-screen", "menu");
		}

		// Hide game & deck customization
		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.add("hide");
			deckCustom.classList.remove("story-deck-mode");
			deckCustom.classList.remove("versus-deck-mode");
		}

		const openSetBtn = document.getElementById("open-game-settings");
		if (openSetBtn) openSetBtn.classList.add("deck-menu");
		const toggleNotifBtn = document.getElementById("toggle-notifications");
		if (toggleNotifBtn) toggleNotifBtn.classList.add("deck-menu");

		const vsTopBack = document.getElementById("btn-versus-top-back");
		if (vsTopBack) vsTopBack.classList.add("hide");

		const vsDeckConfirm = document.getElementById("btn-versus-deck-confirm");
		if (vsDeckConfirm) vsDeckConfirm.classList.add("hide");

		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.add("hide");

		// Hide story mode map and modals
		const storyMap = document.getElementById("story-map-screen");
		if (storyMap) storyMap.classList.add("hide");
		if (typeof StoryMode !== "undefined") {
			StoryMode.closeAllModals();
			StoryMode.isCustomizingCampaign = false;
			StoryMode.updateContinueButton();
		}

		if (typeof VersusMode !== "undefined") {
			const vsModal = document.getElementById("versus-lobby-modal");
			if (vsModal) vsModal.classList.add("hide");
			if (VersusMode.isActive) {
				VersusMode.isActive = false;
				VersusMode.cleanupPeer();
				VersusMode.hideTurnHUD();
			}
		}

		const startBtn = document.getElementById("start-game");
		if (startBtn) {
			startBtn.classList.remove("hide");
			startBtn.style.display = "";
		}

		const opPreview = document.getElementById("opponent-preview");
		if (opPreview) {
			opPreview.classList.remove("hide");
			opPreview.style.display = "";
		}

		const standardBack = document.getElementById("btn-back-to-menu");
		if (standardBack) {
			standardBack.classList.remove("hide");
			standardBack.style.display = "";
		}

		const storyBackToMap = document.getElementById("btn-story-back-to-map");
		if (storyBackToMap) storyBackToMap.classList.add("hide");

		const storyDeckConfirm = document.getElementById("btn-story-deck-confirm");
		if (storyDeckConfirm) storyDeckConfirm.classList.add("hide");

		// Show Main Menu
		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.remove("hide");

		MenuController.showView("nav");
		if (typeof MusicManager !== "undefined") {
			MusicManager.playMenuMusic();
		}
	}

	static openSettingsOverlay(context = "deck") {
		MenuController.settingsReturnContext = context;
		const modal = document.getElementById("settings-modal-overlay");
		if (modal) {
			MenuController.loadSettingsIntoUI();
			modal.classList.remove("hide");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_tab_open");
			}
		}
	}

	static closeSettingsOverlay() {
		const modal = document.getElementById("settings-modal-overlay");
		if (modal) {
			MenuController.saveSettings(true);
			modal.classList.add("hide");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_back");
			}
		}
	}

	static loadSettingsIntoUI() {
		const syncVal = (ids, val) => {
			ids.forEach(id => {
				const el = document.getElementById(id);
				if (el) el.value = val;
			});
		};

		// Display mode
		const savedDisplay = localStorage.getItem("gc-display-mode") || "window";
		syncVal(["setting-display-mode", "setting-display-mode-overlay"], savedDisplay);

		// Resolution
		const savedRes = localStorage.getItem("gc-resolution") || "1366x768";
		syncVal(["setting-resolution", "setting-resolution-overlay"], savedRes);

		// Language
		const savedLang = localStorage.getItem("gc-language") || "en";
		syncVal(["setting-language", "setting-language-overlay"], savedLang);

		// Music Checkbox
		const musicEnabled = (typeof Settings !== "undefined" && Settings.music) 
			? Settings.music.isEnabled() 
			: (localStorage.getItem("gc-music") !== "false");
		["setting-music-toggle", "setting-music-toggle-overlay"].forEach(id => {
			const chk = document.getElementById(id);
			if (chk) chk.checked = musicEnabled;
		});

		// Music Volume Slider
		const savedMusicVol = localStorage.getItem("gc-music-volume") || "60";
		["setting-music-volume", "setting-music-volume-overlay"].forEach((id, idx) => {
			const slider = document.getElementById(id);
			const dispId = idx === 0 ? "music-volume-display" : "music-volume-display-overlay";
			const display = document.getElementById(dispId);
			if (slider) {
				slider.value = savedMusicVol;
				if (display) display.textContent = savedMusicVol + "%";
				slider.oninput = function() {
					const disp1 = document.getElementById("music-volume-display");
					const disp2 = document.getElementById("music-volume-display-overlay");
					if (disp1) disp1.textContent = this.value + "%";
					if (disp2) disp2.textContent = this.value + "%";
					const s1 = document.getElementById("setting-music-volume");
					const s2 = document.getElementById("setting-music-volume-overlay");
					if (s1) s1.value = this.value;
					if (s2) s2.value = this.value;
					if (typeof MusicManager !== "undefined") {
						MusicManager.setVolume(this.value);
					}
				};
			}
		});

		// SFX Checkbox
		const sfxEnabled = (typeof Settings !== "undefined" && Settings.soundEffects) 
			? Settings.soundEffects.isEnabled() 
			: (localStorage.getItem("gc-sound-effects") !== "false");
		["setting-sfx-toggle", "setting-sfx-toggle-overlay"].forEach(id => {
			const chk = document.getElementById(id);
			if (chk) chk.checked = sfxEnabled;
		});

		// SFX Volume Slider
		const savedSfxVol = localStorage.getItem("gc-sfx-volume") || "80";
		["setting-sfx-volume", "setting-sfx-volume-overlay"].forEach((id, idx) => {
			const slider = document.getElementById(id);
			const dispId = idx === 0 ? "sfx-volume-display" : "sfx-volume-display-overlay";
			const display = document.getElementById(dispId);
			if (slider) {
				slider.value = savedSfxVol;
				if (display) display.textContent = savedSfxVol + "%";
				slider.oninput = function() {
					const disp1 = document.getElementById("sfx-volume-display");
					const disp2 = document.getElementById("sfx-volume-display-overlay");
					if (disp1) disp1.textContent = this.value + "%";
					if (disp2) disp2.textContent = this.value + "%";
					const s1 = document.getElementById("setting-sfx-volume");
					const s2 = document.getElementById("setting-sfx-volume-overlay");
					if (s1) s1.value = this.value;
					if (s2) s2.value = this.value;
					if (typeof AudioManager !== "undefined") {
						AudioManager.setVolume(this.value);
					}
				};
				slider.onchange = function() {
					if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
						AudioManager.playSFX("witcher_click");
					}
				};
			}
		});

		// Jukebox Track
		const savedTrack = localStorage.getItem("gc-jukebox-track") || "all";
		syncVal(["setting-jukebox-track", "setting-jukebox-track-overlay"], savedTrack);

		// Game Speed (Fast Forward) Slider
		const savedGameSpeed = localStorage.getItem("gc-game-speed") || "1.0";
		["setting-game-speed", "setting-game-speed-overlay"].forEach((id, idx) => {
			const slider = document.getElementById(id);
			const dispId = idx === 0 ? "game-speed-display" : "game-speed-display-overlay";
			const display = document.getElementById(dispId);
			if (slider) {
				slider.value = savedGameSpeed;
				if (display) display.textContent = parseFloat(savedGameSpeed).toFixed(1) + "x";
				slider.oninput = function() {
					const val = parseFloat(this.value).toFixed(1);
					const disp1 = document.getElementById("game-speed-display");
					const disp2 = document.getElementById("game-speed-display-overlay");
					if (disp1) disp1.textContent = val + "x";
					if (disp2) disp2.textContent = val + "x";
					const s1 = document.getElementById("setting-game-speed");
					const s2 = document.getElementById("setting-game-speed-overlay");
					if (s1) s1.value = val;
					if (s2) s2.value = val;
					if (typeof GameSpeed !== "undefined" && GameSpeed.setMultiplier) {
						GameSpeed.setMultiplier(val);
					} else {
						localStorage.setItem("gc-game-speed", val);
					}
				};
				slider.onchange = function() {
					if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
						AudioManager.playSFX("witcher_click");
					}
				};
			}
		});

		// Score Diff Checkbox
		const scoreDiffEnabled = (typeof Settings !== "undefined" && Settings.showScoreDiff) 
			? Settings.showScoreDiff.isEnabled() 
			: (localStorage.getItem("gc-score-diff") === "true");
		["setting-score-diff", "setting-score-diff-overlay"].forEach(id => {
			const chk = document.getElementById(id);
			if (chk) {
				chk.checked = scoreDiffEnabled;
				chk.onchange = function() {
					const isChecked = this.checked;
					["setting-score-diff", "setting-score-diff-overlay"].forEach(otherId => {
						const otherChk = document.getElementById(otherId);
						if (otherChk) otherChk.checked = isChecked;
					});
					if (typeof Settings !== "undefined" && Settings.showScoreDiff) {
						Settings.showScoreDiff.setEnabled(isChecked);
					} else {
						localStorage.setItem("gc-score-diff", isChecked ? "true" : "false");
					}
					if (typeof board !== "undefined" && board && typeof board.updateScoreDiff === "function") {
						board.updateScoreDiff();
					}
				};
			}
		});
	}

	static saveSettings(fromOverlay = false) {
		const suffix = fromOverlay ? "-overlay" : "";

		// Display Mode
		const dispSelect = document.getElementById("setting-display-mode" + suffix) || document.getElementById("setting-display-mode");
		if (dispSelect) {
			const mode = dispSelect.value;
			localStorage.setItem("gc-display-mode", mode);
			MenuController.sendIpc("display:" + mode);
		}

		// Resolution
		const resSelect = document.getElementById("setting-resolution" + suffix) || document.getElementById("setting-resolution");
		if (resSelect) {
			const res = resSelect.value;
			localStorage.setItem("gc-resolution", res);
			MenuController.sendIpc("resolution:" + res);
		}

		// Language
		const langSelect = document.getElementById("setting-language" + suffix) || document.getElementById("setting-language");
		if (langSelect) {
			const lang = langSelect.value;
			I18N.setLanguage(lang);
		}

		// Music
		const musicCheck = document.getElementById("setting-music-toggle" + suffix) || document.getElementById("setting-music-toggle");
		if (musicCheck) {
			const enabled = musicCheck.checked;
			if (typeof Settings !== "undefined" && Settings.music) {
				Settings.music.setEnabled(enabled);
			} else {
				localStorage.setItem("gc-music", enabled ? "true" : "false");
			}
			if (typeof MusicManager !== "undefined") {
				if (enabled) MusicManager.play(); else MusicManager.pause();
			}
		}

		// Music Volume
		const musicSlider = document.getElementById("setting-music-volume" + suffix) || document.getElementById("setting-music-volume");
		if (musicSlider && typeof MusicManager !== "undefined") {
			MusicManager.setVolume(musicSlider.value);
		}

		// SFX
		const sfxCheck = document.getElementById("setting-sfx-toggle" + suffix) || document.getElementById("setting-sfx-toggle");
		if (sfxCheck) {
			const enabled = sfxCheck.checked;
			if (typeof Settings !== "undefined" && Settings.soundEffects) {
				Settings.soundEffects.setEnabled(enabled);
			} else {
				localStorage.setItem("gc-sound-effects", enabled ? "true" : "false");
			}
		}

		// SFX Volume
		const sfxSlider = document.getElementById("setting-sfx-volume" + suffix) || document.getElementById("setting-sfx-volume");
		if (sfxSlider && typeof AudioManager !== "undefined") {
			AudioManager.setVolume(sfxSlider.value);
		}

		// Jukebox Track
		const jukeSelect = document.getElementById("setting-jukebox-track" + suffix) || document.getElementById("setting-jukebox-track");
		if (jukeSelect) {
			const track = jukeSelect.value;
			localStorage.setItem("gc-jukebox-track", track);
			if (typeof MusicManager !== "undefined") {
				MusicManager.setTrack(track);
			}
		}

		// Game Speed
		const speedSlider = document.getElementById("setting-game-speed" + suffix) || document.getElementById("setting-game-speed");
		if (speedSlider) {
			const spd = parseFloat(speedSlider.value).toFixed(1);
			if (typeof GameSpeed !== "undefined" && GameSpeed.setMultiplier) {
				GameSpeed.setMultiplier(spd);
			} else {
				localStorage.setItem("gc-game-speed", spd);
			}
		}

		// Score Diff
		const scoreDiffCheck = document.getElementById("setting-score-diff" + suffix) || document.getElementById("setting-score-diff");
		if (scoreDiffCheck) {
			const diffEnabled = scoreDiffCheck.checked;
			if (typeof Settings !== "undefined" && Settings.showScoreDiff) {
				Settings.showScoreDiff.setEnabled(diffEnabled);
			} else {
				localStorage.setItem("gc-score-diff", diffEnabled ? "true" : "false");
			}
			if (typeof board !== "undefined" && board && typeof board.updateScoreDiff === "function") {
				board.updateScoreDiff();
			}
		}

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}

		if (!fromOverlay) {
			MenuController.showView("nav");
		}
	}

	static sendIpc(message) {
		try {
			if (window.chrome && window.chrome.webview) {
				window.chrome.webview.postMessage(message);
			}
		} catch (e) {
			console.log("IPC send error:", e);
		}
	}

	static quitGame() {
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_back");
		}
		setTimeout(() => {
			if (window.chrome && window.chrome.webview) {
				window.chrome.webview.postMessage("quit");
			} else {
				window.close();
			}
		}, 300);
	}

	static versionClickCount = 0;
	static versionClickTimer = null;
	static singleClickTimer = null;

	static handleVersionBadgeClick(event) {
		if (event) {
			try { event.preventDefault(); } catch (_) { }
		}

		MenuController.versionClickCount = (MenuController.versionClickCount || 0) + 1;

		if (MenuController.versionClickTimer) clearTimeout(MenuController.versionClickTimer);
		MenuController.versionClickTimer = setTimeout(() => {
			MenuController.versionClickCount = 0;
		}, 2000);

		// Single click check: If it was just a single casual click, trigger update check after a short delay
		if (MenuController.versionClickCount === 1) {
			if (MenuController.singleClickTimer) clearTimeout(MenuController.singleClickTimer);
			MenuController.singleClickTimer = setTimeout(() => {
				if (MenuController.versionClickCount < 3 && typeof InGameUpdater !== "undefined" && InGameUpdater.checkForUpdates) {
					InGameUpdater.checkForUpdates(true);
				}
			}, 400);
		} else {
			if (MenuController.singleClickTimer) {
				clearTimeout(MenuController.singleClickTimer);
				MenuController.singleClickTimer = null;
			}
		}

		// Android-style developer unlock countdown toasts
		if (MenuController.versionClickCount >= 4 && MenuController.versionClickCount < 7) {
			const remaining = 7 - MenuController.versionClickCount;
			if (typeof GwentDebugger !== "undefined" && GwentDebugger.showToast) {
				GwentDebugger.showToast(`Você está a ${remaining} toque${remaining > 1 ? 's' : ''} de se tornar um desenvolvedor.`);
			}
		} else if (MenuController.versionClickCount >= 7) {
			MenuController.versionClickCount = 0;
			if (MenuController.versionClickTimer) clearTimeout(MenuController.versionClickTimer);

			if (typeof GwentDebugger !== "undefined") {
				GwentDebugger.toggleDebugMode();
			}
		}
	}

	// =========================================================================
	// SUBTLE MAIN MENU PARTICLES (EMBERS & GOLDEN GLOW DUST)
	// Layered strictly inside #main-menu (z-index: 10000), above the background
	// and behind the Logo (10001) and Menu Buttons (10002).
	// Automatically pauses when #main-menu is hidden.
	// =========================================================================
	static initMenuParticles() {
		const canvas = document.getElementById("main-menu-particles");
		const mainMenu = document.getElementById("main-menu");
		if (!canvas || !mainMenu) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = 0;
		let height = 0;
		let particles = [];
		const PARTICLE_COUNT = 58;

		// Paleta sutil de brasas quentes e poeira dourada (The Witcher 3 Tavern / Hearth)
		const PALETTES = [
			{ core: "255, 244, 200", mid: "255, 195, 75", outer: "230, 105, 20" },  // Brasa âmbar dourada
			{ core: "255, 232, 180", mid: "245, 150, 45", outer: "205, 65, 15" },   // Brasa viva alaranjada
			{ core: "255, 250, 225", mid: "218, 175, 85", outer: "160, 115, 35" }   // Brilho dourado suave
		];

		function createParticle(randomY = false) {
			const isEmber = Math.random() < 0.62; // 62% brasas ascendentes suaves, 38% poeira de luz flutuante
			const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
			const radius = isEmber
				? (1.1 + Math.random() * 2.2)
				: (0.7 + Math.random() * 1.4);

			return {
				x: Math.random() * (width || window.innerWidth),
				y: randomY
					? Math.random() * (height || window.innerHeight)
					: (height || window.innerHeight) + 10 + Math.random() * 40,
				radius,
				isEmber,
				palette,
				// Movimento lento, orgânico e sutil
				vy: isEmber
					? -(0.22 + Math.random() * 0.52)
					: -(0.08 + Math.random() * 0.24),
				vx: (Math.random() - 0.42) * 0.28,
				swayAmp: 0.15 + Math.random() * 0.42,
				swayFreq: 0.006 + Math.random() * 0.014,
				swayPhase: Math.random() * Math.PI * 2,
				// Cintilação / respiração suave da brasa
				baseAlpha: isEmber
					? (0.22 + Math.random() * 0.42)
					: (0.14 + Math.random() * 0.28),
				pulseSpeed: 0.015 + Math.random() * 0.03,
				pulsePhase: Math.random() * Math.PI * 2
			};
		}

		function resizeCanvas() {
			width = window.innerWidth || document.documentElement.clientWidth || 1280;
			height = window.innerHeight || document.documentElement.clientHeight || 720;
			canvas.width = width;
			canvas.height = height;
		}

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			particles.push(createParticle(true));
		}

		function renderFrame() {
			// Executa apenas quando a tela do Menu Principal está visível
			const isMenuVisible = !mainMenu.classList.contains("hide") &&
				(!document.body.getAttribute("data-screen") || document.body.getAttribute("data-screen") === "menu");

			if (isMenuVisible && width > 0 && height > 0) {
				ctx.clearRect(0, 0, width, height);
				ctx.save();
				ctx.globalCompositeOperation = "lighter";

				for (let i = 0; i < particles.length; i++) {
					const p = particles[i];
					p.swayPhase += p.swayFreq;
					p.pulsePhase += p.pulseSpeed;

					p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp;
					p.y += p.vy;

					// Recicla partícula quando sai da tela
					if (p.y < -25 || p.x < -40 || p.x > width + 40) {
						particles[i] = createParticle(false);
						continue;
					}

					// Fade suave nas bordas superior e inferior da tela
					const verticalRatio = Math.max(0, Math.min(1, p.y / height));
					const edgeFade = Math.sin(verticalRatio * Math.PI);
					const pulse = 0.72 + 0.28 * Math.sin(p.pulsePhase);
					const alpha = Math.max(0, Math.min(0.85, p.baseAlpha * pulse * edgeFade));

					if (alpha <= 0.01) continue;

					// Halo / brilho externo difuso da brasa
					const glowRadius = p.radius * (p.isEmber ? 4.2 : 3.0);
					const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
					grad.addColorStop(0, `rgba(${p.palette.core}, ${alpha})`);
					grad.addColorStop(0.32, `rgba(${p.palette.mid}, ${(alpha * 0.65).toFixed(3)})`);
					grad.addColorStop(0.7, `rgba(${p.palette.outer}, ${(alpha * 0.22).toFixed(3)})`);
					grad.addColorStop(1, `rgba(${p.palette.outer}, 0)`);

					ctx.fillStyle = grad;
					ctx.beginPath();
					ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
					ctx.fill();
				}

				ctx.restore();
			}

			requestAnimationFrame(renderFrame);
		}

		requestAnimationFrame(renderFrame);
	}
}

window.addEventListener("DOMContentLoaded", () => {
	MenuController.init();
});
