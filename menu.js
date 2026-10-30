"use strict";

class MenuController {
	static init() {
		// Initialize Language
		I18N.init();

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
		if (iconEl) iconEl.textContent = icon || "🐺";
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
		if (iconEl) iconEl.textContent = icon || "⚔️";
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
			if (StoryMode.hasSave()) {
				MenuController.showConfirm(
					"Existe uma jornada salva em andamento!\n\nDeseja continuar sua campanha existente ou iniciar uma Nova Jornada do zero?",
					"JORNADA NO CONTINENTE",
					() => StoryMode.continueCampaign(),
					() => StoryMode.startNewGameDialog(),
					"Continuar Jornada",
					"Nova Campanha",
					"🗺️"
				);
			} else {
				StoryMode.startNewGameDialog();
			}
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

		const standardBack = document.getElementById("btn-back-to-menu");
		if (standardBack) standardBack.classList.remove("hide");

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
		if (standardBack) standardBack.classList.remove("hide");

		const storyBackToMap = document.getElementById("btn-story-back-to-map");
		if (storyBackToMap) storyBackToMap.classList.add("hide");

		const storyDeckConfirm = document.getElementById("btn-story-deck-confirm");
		if (storyDeckConfirm) storyDeckConfirm.classList.add("hide");

		// Show Main Menu
		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.remove("hide");

		MenuController.showView("nav");
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
}

window.addEventListener("DOMContentLoaded", () => {
	MenuController.init();
});
