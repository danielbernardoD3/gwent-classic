"use strict";

// Mobile environment detection (for hiding desktop-only settings and adjusting touch UI)
(function checkMobileEnvironment() {
	function isMobile() {
		if (typeof window === "undefined") return false;
		if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return true;
		if (window.AndroidAppUpdater) return true;
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return true;
		if (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches && window.innerWidth <= 1024) return true;
		return false;
	}

	function applyMobileClass() {
		if (isMobile()) {
			document.documentElement.classList.add("is-mobile");
			if (document.body) {
				document.body.classList.add("is-mobile");
			} else {
				document.addEventListener("DOMContentLoaded", function () {
					document.body.classList.add("is-mobile");
				});
			}
		}
	}

	applyMobileClass();
})();



Array.prototype.remove = function (elem) {
	const index = this.indexOf(elem);
	if (index !== -1)
		this.splice(index, 1);
}

function isEmpty(obj) {
	for (const property in obj) {
		if (Object.hasOwn(obj, property))
			return false;
	}
	return true;
}

class RGBA {
	constructor(r, g, b, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	setAlpha(a) {
		this.a = a;
	}
	toString() {
		const hasAlpha = this.a < 1;
		return (hasAlpha ? "rgba(" : "rgb(")
			+ this.r + ',' + this.g + ',' + this.b
			+ (hasAlpha ? "," + this.a : "")
			+ ")";
	}
}

// returns val or the min/max it is closest to. Flips inverted min/max values.
function clamp(min, max, val) {
	if (min > max)
		return clamp(max, min, val);
	return Math.min(max, Math.max(min, val));
}

// Returns the linear interpolation of t from a to b (unclamped)
function lerp(a, b, t) {
	return (1 - t) * a + t * b;
}

// Returns the normalized value of t from the range [a,b]
function inverseLerp(a, b, t) {
	return (t - a) / (b - a);
}

// Returns the lerp() of [y,z] using the normalized value of t in [a,b] as the param
function map(a, b, y, z, t) {
	return lerp(y, z, inverseLerp(a, b, t));
}


// Returns true if n is an Number
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

// Returns true if s is a String
function isString(s) {
	return typeof (s) === 'string' || s instanceof String;
}

// Interprets passed string as an interger. Empty strings return 0, null string return NaN
function toInteger(str) {
	if (str === '')
		return 0;
	else if (!str)
		return NaN;
	return Number.parseInt(str);
}

// Returns a random integer in the range [0,n)
function randomInt(n) {
	return Math.floor(Math.random() * n);
}


// ---------------------------------------------------------------------------
// SCREEN ISOLATION MANAGER (SEPARAÇÃO ESTRITA ENTRE MENU, MAPA, BARALHO E TABULEIRO)
// Garante que a Tela do Mapa (#story-map-screen) e a Tela do Tabuleiro (<main>)
// fiquem 100% desligadas uma da outra quando não estão ativas.
// ---------------------------------------------------------------------------
const ScreenManager = {
	current: "menu",
	setScreen(mode) {
		this.current = mode;
		if (document.body) {
			document.body.setAttribute("data-screen", mode);
		}
		const mainBoard = document.querySelector("main");
		const mapScreen = document.getElementById("story-map-screen");
		const deckCustom = document.getElementById("deck-customization");

		if (mode !== "map") {
			if (typeof StoryMode !== "undefined" && typeof StoryMode.suspendMapRendering === "function") {
				StoryMode.suspendMapRendering();
			}
			if (mapScreen) mapScreen.classList.add("hide");
		}
		if (mode !== "board") {
			if (mainBoard) mainBoard.classList.add("hide");
		} else {
			if (mainBoard) mainBoard.classList.remove("hide");
			fitGameBoard();
		}
		if (mode !== "deck" && deckCustom && mode !== "menu") {
			deckCustom.classList.add("hide");
		}
	}
};
window.ScreenManager = ScreenManager;

// ---------------------------------------------------------------------------
// RESPONSIVE GAME BOARD FITTER (LETTERBOXING / PILLARBOXING COM BARRAS PRETAS)
// Garante que todo o tabuleiro 16:9 caiba verticalmente na tela sem rolagem,
// centralizando e gerando barras pretas nas laterais em telas ultrawide e celulares.
// ---------------------------------------------------------------------------
function fitGameBoard() {
	if (document.body && document.body.getAttribute("data-screen") === "map") return;
	const main = document.querySelector("main");
	const deckCust = document.getElementById("deck-customization");
	const w = window.innerWidth;
	const h = window.innerHeight;
	if (!w || !h) return;

	const baseAspect = 1920 / 1080;
	const currentAspect = w / h;

	// Se a tela for mais larga que 16:9 (celulares 19.5:9, 20:9 ou ultrawide):
	// O tabuleiro (100vw) ultrapassaria a altura. Escalamos apenas o <main> para caber 100% em 100vh.
	const scale = currentAspect > baseAspect ? (h * 1920) / (w * 1080) : 1;

	if (main) {
		main.style.left = "50%";
		main.style.top = "50%";
		main.style.transform = `translate(-50%, -50%) scale(${scale})`;
		main.style.transformOrigin = "center center";
	}

	if (deckCust) {
		deckCust.style.transform = "none";
		deckCust.style.left = "0";
		deckCust.style.top = "0";
	}
}

window.addEventListener("resize", fitGameBoard);
window.addEventListener("orientationchange", () => setTimeout(fitGameBoard, 150));
document.addEventListener("DOMContentLoaded", fitGameBoard);
window.fitGameBoard = fitGameBoard;


// ===========================================================================
// HAPTIC FEEDBACK (VIBRAÇÃO TÁTIL NO CELULAR)
// ===========================================================================
function triggerHaptic(type = "light") {
	if (!navigator || !navigator.vibrate) return;
	try {
		const hapticsEnabled = localStorage.getItem("gwent_haptics_enabled");
		if (hapticsEnabled === "false") return;

		switch (type) {
			case "light":      // Toque em carta, seleção
				navigator.vibrate(22);
				break;
			case "medium":     // Baixar carta, passar a vez, líder
				navigator.vibrate(35);
				break;
			case "heavy":      // Scorch, clima, queima de fileira, corneta
				navigator.vibrate([35, 25, 45]);
				break;
			case "round_win":  // Vitória de rodada / partida
				navigator.vibrate([40, 30, 60]);
				break;
			case "round_loss": // Derrota de rodada
				navigator.vibrate(65);
				break;
		}
	} catch (e) { }
}
window.triggerHaptic = triggerHaptic;

function toggleHapticsSetting(enabled) {
	localStorage.setItem("gwent_haptics_enabled", enabled ? "true" : "false");
	if (enabled) triggerHaptic("medium");
}
window.toggleHapticsSetting = toggleHapticsSetting;

// ===========================================================================
// QUICK CARD INSPECTOR (LONG-PRESS NO MOBILE / CLIQUE COM BOTÃO DIREITO NO PC)
// ===========================================================================
let inspectTimer = null;
let inspectTouchStartPos = { x: 0, y: 0 };

function getCardDataFromElem(elem) {
	if (!elem) return null;
	if (elem.card) return elem.card;
	if (elem._card) return elem._card;
	if (elem._cardData) return elem._cardData;

	const title = elem.getAttribute("data-title") || elem.getAttribute("title");
	if (title && typeof card_dict !== "undefined") {
		const found = card_dict.find(c => c.name === title);
		if (found) return found;
	}
	return null;
}

function showQuickCardInspect(card) {
	if (!card) return;
	triggerHaptic("light");

	const modal = document.getElementById("quick-card-inspect-modal");
	if (!modal) return;

	const artElem = document.getElementById("quick-inspect-art");
	const titleElem = document.getElementById("quick-inspect-title");
	const powerElem = document.getElementById("quick-inspect-power");
	const factionElem = document.getElementById("quick-inspect-faction");
	const rowElem = document.getElementById("quick-inspect-row");
	const typeElem = document.getElementById("quick-inspect-type");
	const abilityNameElem = document.getElementById("quick-inspect-ability-name");
	const abilityDescElem = document.getElementById("quick-inspect-ability-desc");

	// Card visual
	const filename = card.filename || "";
	const faction = card.faction || card.deck || "neutral";
	if (artElem && typeof largeURL === "function") {
		artElem.style.backgroundImage = largeURL(faction + "_" + filename);
	}

	// Name
	const localizedTitle = (typeof I18N !== "undefined" && typeof I18N.getCardName === "function") ? I18N.getCardName(card.name) : card.name;
	if (titleElem) titleElem.innerText = localizedTitle || card.name || "Gwent Card";

	// Power
	const pwr = (card.power !== undefined) ? card.power : ((card.strength !== undefined) ? card.strength : card.basePower);
	if (powerElem) {
		if (card.row === "weather" || card.row === "leader" || card.faction === "special" || card.deck === "special" || pwr === undefined || pwr === "") {
			powerElem.style.display = "none";
		} else {
			powerElem.style.display = "inline-flex";
			powerElem.innerText = pwr;
		}
	}

	// Faction
	const factionNames = {
		northern_realms: "Reinos do Norte",
		nilfgaard: "Nilfgaard",
		scoiatael: "Scoia'tael",
		monsters: "Monstros",
		skellige: "Skellige",
		neutral: "Neutro",
		special: "Especial",
		weather: "Clima"
	};
	if (factionElem) factionElem.innerText = factionNames[faction] || faction;

	// Row & Type
	const rowNames = {
		close: "Corpo a Corpo",
		ranged: "Longa Distância",
		siege: "Cerco",
		agile: "Ágil (Meele/Ranged)",
		leader: "Carta de Líder",
		weather: "Carta de Clima"
	};
	if (rowElem) rowElem.innerText = rowNames[card.row] || card.row || "Especial";
	if (typeElem) {
		typeElem.innerText = card.hero ? "⭐ Carta Herói" : ((card.row === "leader") ? "👑 Líder" : "Tropa Regular");
	}

	// Ability
	let abName = card.desc_name;
	let abDesc = card.desc;
	if (!abDesc && card.ability && typeof ability_dict !== "undefined") {
		const abList = card.ability.split(" ");
		const lastAb = abList[abList.length - 1];
		if (ability_dict[lastAb]) {
			abName = ability_dict[lastAb].name;
			abDesc = ability_dict[lastAb].description;
		}
	}
	if (!abDesc && card.abilities && typeof ability_dict !== "undefined" && card.abilities.length > 0) {
		const lastAb = card.abilities[card.abilities.length - 1];
		if (ability_dict[lastAb]) {
			abName = ability_dict[lastAb].name;
			abDesc = ability_dict[lastAb].description;
		}
	}
	if (abilityNameElem) abilityNameElem.innerText = abName || (card.hero ? "Carta Herói" : "Sem Habilidade Especial");
	if (abilityDescElem) abilityDescElem.innerText = abDesc || (card.hero ? "Imune a cartas especiais e efeitos de clima." : "Unidade regular de combate no campo de batalha.");

	modal.classList.remove("hide");
	modal.style.display = "flex";
}
window.showQuickCardInspect = showQuickCardInspect;

function hideQuickCardInspect() {
	const modal = document.getElementById("quick-card-inspect-modal");
	if (modal) {
		modal.classList.add("hide");
		modal.style.display = "none";
	}
}
window.hideQuickCardInspect = hideQuickCardInspect;

function setupCardInspectorListeners() {
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" || e.code === "Escape") {
			hideQuickCardInspect();
		}
	});

	document.addEventListener("touchstart", (e) => {
		const cardElem = e.target.closest(".card, .leader, .story-preview-leader-card, .compendium-card-thumb, #leader-me, #leader-op");
		if (!cardElem) return;

		const touch = e.touches[0];
		inspectTouchStartPos = { x: touch.clientX, y: touch.clientY };

		clearTimeout(inspectTimer);
		inspectTimer = setTimeout(() => {
			const data = getCardDataFromElem(cardElem);
			if (data) {
				showQuickCardInspect(data);
			}
		}, 380);
	}, { passive: true });

	document.addEventListener("touchmove", (e) => {
		if (!inspectTimer) return;
		const touch = e.touches[0];
		const dx = Math.abs(touch.clientX - inspectTouchStartPos.x);
		const dy = Math.abs(touch.clientY - inspectTouchStartPos.y);
		if (dx > 12 || dy > 12) {
			clearTimeout(inspectTimer);
			inspectTimer = null;
		}
	}, { passive: true });

	document.addEventListener("touchend", () => {
		clearTimeout(inspectTimer);
		inspectTimer = null;
	}, { passive: true });

	document.addEventListener("touchcancel", () => {
		clearTimeout(inspectTimer);
		inspectTimer = null;
	}, { passive: true });

	document.addEventListener("contextmenu", (e) => {
		const cardElem = e.target.closest(".card, .leader, .story-preview-leader-card, .compendium-card-thumb, #leader-me, #leader-op");
		if (!cardElem) return;
		const data = getCardDataFromElem(cardElem);
		if (data) {
			e.preventDefault();
			showQuickCardInspect(data);
		}
	});
}

// ===========================================================================
// BACKUP & RESTORE DE SAVE (EXPORTAR / IMPORTAR EM JSON)
// ===========================================================================
function openBackupModal() {
	const modal = document.getElementById("backup-save-modal");
	if (!modal) return;
	const hapticsToggle = document.getElementById("backup-haptics-toggle");
	if (hapticsToggle) {
		hapticsToggle.checked = localStorage.getItem("gwent_haptics_enabled") !== "false";
	}
	const exportFeedback = document.getElementById("export-save-feedback");
	if (exportFeedback) exportFeedback.innerText = "";
	const importFeedback = document.getElementById("import-save-feedback");
	if (importFeedback) importFeedback.innerText = "";
	modal.classList.remove("hide");
}
window.openBackupModal = openBackupModal;

function closeBackupModal() {
	const modal = document.getElementById("backup-save-modal");
	if (modal) modal.classList.add("hide");
}
window.closeBackupModal = closeBackupModal;

function generateSaveBundle() {
	const bundle = {
		game: "Gwent Classic - The Witcher 3",
		version: "1.1.0",
		timestamp: new Date().toISOString(),
		storage: {}
	};
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key && (key.startsWith("gc-") || key.startsWith("gwent_") || ["northern_realms", "nilfgaard", "scoiatael", "monsters", "skellige"].includes(key))) {
			bundle.storage[key] = localStorage.getItem(key);
		}
	}
	return bundle;
}

function exportSaveToFile() {
	try {
		const bundle = generateSaveBundle();
		const jsonStr = JSON.stringify(bundle, null, 2);
		const blob = new Blob([jsonStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `gwent_classic_save_${new Date().toISOString().slice(0, 10)}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		const fb = document.getElementById("export-save-feedback");
		if (fb) fb.innerText = "✓ Arquivo de save baixado com sucesso!";
		triggerHaptic("medium");
	} catch (e) {
		alert("Erro ao exportar arquivo: " + e.message);
	}
}
window.exportSaveToFile = exportSaveToFile;

/**
 * Copia texto para a área de transferência com compatibilidade total
 * (Clipboard API moderna em HTTPS + fallback document.execCommand e prompt).
 * @param {string} text - Texto a ser copiado.
 * @returns {Promise<boolean>}
 */
function copyToClipboard(text) {
	return new Promise((resolve) => {
		if (!text) {
			resolve(false);
			return;
		}

		// 1. Tentar Clipboard API moderna se disponível (contexto seguro / HTTPS)
		if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
			navigator.clipboard.writeText(text).then(() => {
				resolve(true);
			}).catch(() => {
				// Fallback caso a API moderna falhe
				resolve(fallbackClipboardCopy(text));
			});
			return;
		}

		// 2. Fallback via document.execCommand('copy')
		resolve(fallbackClipboardCopy(text));
	});
}

function fallbackClipboardCopy(text) {
	try {
		const ta = document.createElement("textarea");
		ta.value = text;
		ta.setAttribute("readonly", "");
		ta.style.position = "fixed";
		ta.style.top = "0";
		ta.style.left = "0";
		ta.style.opacity = "0";
		ta.style.pointerEvents = "none";
		document.body.appendChild(ta);
		ta.focus();
		ta.select();
		const success = document.execCommand("copy");
		document.body.removeChild(ta);
		return !!success;
	} catch (e) {
		console.warn("Fallback de cópia para área de transferência falhou:", e);
		return false;
	}
}
window.copyToClipboard = copyToClipboard;
window.fallbackClipboardCopy = fallbackClipboardCopy;

function exportSaveToClipboard() {
	try {
		const bundle = generateSaveBundle();
		const jsonStr = JSON.stringify(bundle);
		copyToClipboard(jsonStr).then((ok) => {
			if (ok) {
				const fb = document.getElementById("export-save-feedback");
				if (fb) fb.innerText = "✓ Código do Save copiado para a Área de Transferência!";
				triggerHaptic("medium");
			} else {
				prompt("Copie o código do seu save abaixo:", jsonStr);
			}
		}).catch(() => {
			prompt("Copie o código do seu save abaixo:", jsonStr);
		});
	} catch (e) {
		alert("Erro ao copiar save: " + e.message);
	}
}
window.exportSaveToClipboard = exportSaveToClipboard;

function restoreSaveBundle(bundle) {
	if (!bundle || !bundle.storage) {
		throw new Error("Arquivo ou código de save inválido.");
	}
	for (const [key, val] of Object.entries(bundle.storage)) {
		if (key && val !== undefined) {
			localStorage.setItem(key, val);
		}
	}
	if (typeof StoryMode !== "undefined" && StoryMode.initSaveSlots) {
		StoryMode.initSaveSlots();
		StoryMode.updateHUD();
	}
	if (typeof Achievements !== "undefined" && Achievements.load) {
		Achievements.load();
	}
	triggerHaptic("round_win");
}

function importSaveFromFile(event) {
	const file = event.target.files && event.target.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const bundle = JSON.parse(e.target.result);
			restoreSaveBundle(bundle);
			const fb = document.getElementById("import-save-feedback");
			if (fb) {
				fb.style.color = "#4cd137";
				fb.innerText = "✓ Save restaurado com sucesso! Atualizando...";
			}
			setTimeout(() => {
				closeBackupModal();
				location.reload();
			}, 1000);
		} catch (err) {
			const fb = document.getElementById("import-save-feedback");
			if (fb) {
				fb.style.color = "#e84118";
				fb.innerText = "✗ Erro ao restaurar: " + err.message;
			}
		}
	};
	reader.readAsText(file);
}
window.importSaveFromFile = importSaveFromFile;

function importSaveFromText() {
	const textarea = document.getElementById("import-save-textarea");
	const text = textarea ? textarea.value.trim() : "";
	const fb = document.getElementById("import-save-feedback");
	if (!text) {
		if (fb) {
			fb.style.color = "#e84118";
			fb.innerText = "Por favor, cole o código do save primeiro.";
		}
		return;
	}
	try {
		const bundle = JSON.parse(text);
		restoreSaveBundle(bundle);
		if (fb) {
			fb.style.color = "#4cd137";
			fb.innerText = "✓ Save restaurado com sucesso! Atualizando...";
		}
		setTimeout(() => {
			closeBackupModal();
			location.reload();
		}, 1000);
	} catch (err) {
		if (fb) {
			fb.style.color = "#e84118";
			fb.innerText = "✗ Código inválido: " + err.message;
		}
	}
}
window.importSaveFromText = importSaveFromText;

// ===========================================================================
// TRATAMENTO INTELIGENTE DO BOTÃO / GESTO VOLTAR DO ANDROID (BACK BUTTON)
// ===========================================================================
window.handleAndroidBackButton = function () {
	// 1. Modal de inspeção rápida de carta aberto?
	const quickInspect = document.getElementById("quick-card-inspect-modal");
	if (quickInspect && (!quickInspect.classList.contains("hide") && quickInspect.style.display !== "none")) {
		hideQuickCardInspect();
		return true;
	}

	// 2. Seletor de Avatares aberto?
	const avatarModal = document.getElementById("avatar-picker-modal");
	if (avatarModal && !avatarModal.classList.contains("hide")) {
		if (typeof AvatarManager !== "undefined" && typeof AvatarManager.closePicker === "function") {
			AvatarManager.closePicker();
		} else {
			avatarModal.classList.add("hide");
		}
		return true;
	}

	// 3. Dropdown do cabeçalho ou Gaveta de Estatísticas do Modo Exploração abertos?
	const dropdown = document.getElementById("story-hud-dropdown-menu");
	if (dropdown && !dropdown.classList.contains("hide")) {
		if (typeof StoryMode !== "undefined" && typeof StoryMode.closeHeaderDropdown === "function") {
			StoryMode.closeHeaderDropdown();
		} else {
			dropdown.classList.add("hide");
		}
		return true;
	}

	const statsDrawer = document.getElementById("story-player-stats-drawer");
	if (statsDrawer && !statsDrawer.classList.contains("hide")) {
		if (typeof StoryMode !== "undefined" && typeof StoryMode.toggleStatsDrawer === "function") {
			StoryMode.toggleStatsDrawer(false);
		} else {
			statsDrawer.classList.add("hide");
		}
		return true;
	}

	// 4. Popup ou Carrossel in-game ativo?
	if (typeof Popup !== "undefined" && Popup.curr) {
		Popup.curr.selectNo();
		return true;
	}
	if (typeof Carousel !== "undefined" && Carousel.curr) {
		Carousel.curr.cancel();
		return true;
	}

	// 5. Modais do sistema / Modo Exploração / Modo Versus abertos?
	const activeModals = [
		"ingame-dialog-modal",
		"game-updater-modal",
		"backup-save-modal",
		"rules-modal",
		"board-modal",
		"opponent-modal",
		"story-outcome-modal",
		"story-compendium-modal",
		"story-battle-modal",
		"story-tournament-modal",
		"story-shop-modal",
		"story-saves-modal",
		"versus-alert-modal",
		"versus-lobby-modal"
	];
	for (const id of activeModals) {
		const m = document.getElementById(id);
		if (m && !m.classList.contains("hide")) {
			if (id === "versus-lobby-modal" && typeof VersusMode !== "undefined" && typeof VersusMode.closeLobby === "function") {
				VersusMode.closeLobby();
			} else {
				m.classList.add("hide");
			}
			return true;
		}
	}

	// 6. Preview padrão de carta aberto no tabuleiro?
	const cardPreview = document.querySelector(".card-preview");
	if (cardPreview && !cardPreview.classList.contains("hide")) {
		if (typeof ui !== "undefined" && typeof ui.cancel === "function") {
			ui.cancel();
		} else if (typeof ui !== "undefined" && typeof ui.hidePreview === "function") {
			ui.hidePreview();
		} else {
			cardPreview.classList.add("hide");
		}
		return true;
	}

	// 7. Tela de customização de baralho (#deck-customization) ativa?
	const deckCust = document.getElementById("deck-customization");
	if (deckCust && !deckCust.classList.contains("hide")) {
		if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
			StoryMode.closeCampaignDeckBuilder();
		} else if (typeof VersusMode !== "undefined" && VersusMode.isCustomizingDeck) {
			VersusMode.closeDeckBuilderForVersus();
		} else if (typeof MenuController !== "undefined" && typeof MenuController.returnToMainMenu === "function") {
			MenuController.returnToMainMenu();
		} else {
			deckCust.classList.add("hide");
			const mainMenu = document.getElementById("main-menu");
			if (mainMenu) mainMenu.classList.remove("hide");
		}
		return true;
	}

	// 8. Partida em andamento (tabuleiro principal)?
	const gameBoard = document.querySelector("main");
	if (gameBoard && !gameBoard.classList.contains("hide")) {
		if (typeof game !== "undefined" && game && typeof game.exitGame === "function") {
			game.exitGame();
		} else if (typeof MenuController !== "undefined" && typeof MenuController.returnToMainMenu === "function") {
			MenuController.returnToMainMenu();
		}
		return true;
	}

	// 9. Mapa do Modo Exploração ou tela de criação de campanha ativos?
	const setupView = document.getElementById("story-setup-view");
	if (setupView && !setupView.classList.contains("hide")) {
		setupView.classList.add("hide");
		if (typeof MenuController !== "undefined" && typeof MenuController.returnToMainMenu === "function") {
			MenuController.returnToMainMenu();
		}
		return true;
	}

	const mapScreen = document.getElementById("story-map-screen");
	if (mapScreen && !mapScreen.classList.contains("hide")) {
		if (typeof StoryMode !== "undefined" && typeof StoryMode.closeMapToMenu === "function") {
			StoryMode.closeMapToMenu();
		} else {
			mapScreen.classList.add("hide");
			const mainMenu = document.getElementById("main-menu");
			if (mainMenu) mainMenu.classList.remove("hide");
		}
		return true;
	}

	// 10. No menu principal na tela raiz: retorna false para que o Android minimize suavemente
	return false;
};

document.addEventListener("DOMContentLoaded", () => {
	setupCardInspectorListeners();
});


// ===========================================================================
// IN-GAME AUTO-UPDATER (ATUALIZADOR AUTOMÁTICO IN-GAME)
// ===========================================================================
const InGameUpdater = {
	CURRENT_VERSION: "1.0.1",
	CURRENT_VERSION_CODE: 17,
	REMOTE_URL: "https://raw.githubusercontent.com/danielbernardoD3/gwent-classic/main/version.json",
	remoteData: null,
	isDownloading: false,

	syncVersionUI(v) {
		const ver = v || InGameUpdater.CURRENT_VERSION || "1.3.0";
		const formatted = "v" + String(ver).replace(/^v/, "");
		const badges = document.querySelectorAll(".menu-version-badge, #menu-version-badge");
		badges.forEach(b => {
			b.textContent = formatted;
			b.title = `Gwent Classic ${formatted} — Clique para verificar atualizações`;
		});
	},

	init() {
		// Sync version string to UI immediately
		InGameUpdater.syncVersionUI();

		// Asynchronously fetch local version.json to ensure it always matches workspace/git
		try {
			fetch("version.json?_t=" + Date.now(), { cache: "no-store" })
				.then(r => r.ok ? r.json() : null)
				.then(localData => {
					if (localData && localData.version) {
						InGameUpdater.CURRENT_VERSION = localData.version;
						if (localData.versionCode) InGameUpdater.CURRENT_VERSION_CODE = localData.versionCode;
						InGameUpdater.syncVersionUI(localData.version);
					}
				})
				.catch(() => {});
		} catch (_) {}

		// Auto-check on startup after 2.5 seconds
		setTimeout(() => {
			InGameUpdater.checkForUpdates(false);
		}, 2500);
	},

	async checkForUpdates(manual = false) {
		const btn1 = document.getElementById("check-updates-btn");
		const btn2 = document.getElementById("check-updates-btn-overlay");
		const setButtonsState = (disabled, text) => {
			if (btn1) { btn1.disabled = disabled; if (text) btn1.innerText = text; }
			if (btn2) { btn2.disabled = disabled; if (text) btn2.innerText = text; }
		};

		if (manual) {
			setButtonsState(true, "Verificando...");
		}

		try {
			let data = null;
			// 1. Tentar raw.githubusercontent.com
			try {
				const res = await fetch(InGameUpdater.REMOTE_URL + "?_t=" + Date.now(), { cache: "no-store" });
				if (res && res.ok) {
					data = await res.json();
				}
			} catch (fetchErr) {
				console.warn("[InGameUpdater] Falha no raw fetch, tentando GitHub API fallback...", fetchErr);
			}

			// 2. Fallback resiliente para GitHub Releases API
			if (!data) {
				try {
					const apiRes = await fetch("https://api.github.com/repos/danielbernardoD3/gwent-classic/releases/latest", { cache: "no-store" });
					if (apiRes && apiRes.ok) {
						const rel = await apiRes.json();
						const tagVer = (rel.tag_name || "").replace(/^v/, "");
						const apkAsset = (rel.assets || []).find(a => a.name && a.name.endsWith(".apk"));
						const pcAsset = (rel.assets || []).find(a => a.name && a.name.endsWith(".zip"));
						const notes = rel.body ? rel.body.split("\n").filter(l => l.trim().startsWith("- ")).map(l => l.replace(/^-\s*/, "").trim()) : [];
						data = {
							version: tagVer || InGameUpdater.CURRENT_VERSION || "1.2.6",
							versionCode: 999,
							title: "Gwent Classic",
							changelog: notes.length > 0 ? notes : ["Melhorias de desempenho e correções gerais."],
							apkUrl: apkAsset ? apkAsset.browser_download_url : "https://github.com/danielbernardoD3/gwent-classic/releases/latest/download/GwentClassic.apk",
							apkSize: apkAsset ? (apkAsset.size / 1024 / 1024).toFixed(0) + " MB" : "154 MB",
							pcUrl: pcAsset ? pcAsset.browser_download_url : "https://github.com/danielbernardoD3/gwent-classic/releases/latest/download/GwentClassic-PC.zip"
						};
					}
				} catch (apiErr) {
					console.warn("[InGameUpdater] Falha também no GitHub API fallback:", apiErr);
				}
			}

			if (!data) throw new Error("Não foi possível conectar ao servidor de atualizações.");

			InGameUpdater.remoteData = data;

			const hasUpdate = InGameUpdater.compareVersions(data.version, InGameUpdater.CURRENT_VERSION) > 0 
				|| (data.versionCode && data.versionCode > InGameUpdater.CURRENT_VERSION_CODE);

			if (hasUpdate) {
				InGameUpdater.showUpdateModal(data);
			} else {
				if (manual) {
					const msg = `Você já está jogando a versão mais recente do Gwent Classic (v${InGameUpdater.CURRENT_VERSION})!`;
					if (typeof MenuController !== "undefined" && typeof MenuController.showAlert === "function") {
						MenuController.showAlert(msg, "GWENT CLASSIC ATUALIZADO", "🐺");
					} else {
						alert(msg);
					}
				}
			}
		} catch (e) {
			console.warn("[InGameUpdater] Erro ao verificar atualizações:", e);
			if (manual) {
				const msg = (e && e.message && e.message.includes("404"))
					? "Servidor de atualizações não encontrado (Erro 404).\n\nVerifique as permissões de acesso ao repositório."
					: "Não foi possível conectar ao servidor de atualizações no momento. Verifique sua conexão à internet.";
				if (typeof MenuController !== "undefined" && typeof MenuController.showAlert === "function") {
					MenuController.showAlert(msg, "ATUALIZADOR DE GWENT", "🐺");
				} else {
					alert(msg);
				}
			}
		} finally {
			if (manual) {
				setButtonsState(false, "🔄 Verificar Atualizações");
			}
		}
	},

	compareVersions(v1, v2) {
		const p1 = (v1 || "0").split(".").map(Number);
		const p2 = (v2 || "0").split(".").map(Number);
		for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
			const num1 = p1[i] || 0;
			const num2 = p2[i] || 0;
			if (num1 > num2) return 1;
			if (num1 < num2) return -1;
		}
		return 0;
	},

	showUpdateModal(data) {
		const modal = document.getElementById("game-updater-modal");
		if (!modal) return;

		modal.style.zIndex = "60000";

		const titleElem = document.getElementById("updater-title");
		const versionBadge = document.getElementById("updater-version-badge");
		const changelogList = document.getElementById("updater-changelog-list");
		const sizeElem = document.getElementById("updater-size-text");
		const progressBox = document.getElementById("updater-progress-box");
		const actionBtn = document.getElementById("updater-action-btn");

		if (titleElem) titleElem.innerText = data.title ? `⚔️ ${data.title} Disponível` : "⚔️ Atualização de Gwent Classic Disponível!";
		if (versionBadge) versionBadge.innerText = `v${InGameUpdater.CURRENT_VERSION} ➔ v${data.version}`;
		if (sizeElem) sizeElem.innerText = data.apkSize ? `Tamanho do pacote: ${data.apkSize}` : "";

		if (changelogList) {
			changelogList.innerHTML = "";
			const notes = data.changelog || ["Melhorias gerais e correções de estabilidade."];
			notes.forEach(note => {
				const li = document.createElement("li");
				li.innerText = note;
				changelogList.appendChild(li);
			});
		}

		if (progressBox) progressBox.classList.add("hide");
		if (actionBtn) {
			actionBtn.disabled = false;
			actionBtn.innerText = "⚔️ Atualizar Agora";
		}

		modal.classList.remove("hide");
		if (typeof triggerHaptic === "function") triggerHaptic("medium");
	},

	closeUpdateModal() {
		if (InGameUpdater.isDownloading) {
			if (!confirm("O download da atualização está em andamento. Deseja cancelar?")) {
				return;
			}
		}
		const modal = document.getElementById("game-updater-modal");
		if (modal) modal.classList.add("hide");
		InGameUpdater.isDownloading = false;
	},

	startUpdate() {
		const data = InGameUpdater.remoteData;
		if (!data) return;

		const actionBtn = document.getElementById("updater-action-btn");
		const progressBox = document.getElementById("updater-progress-box");
		const progressBar = document.getElementById("updater-progress-fill");
		const progressText = document.getElementById("updater-progress-text");

		// Android Nativo (via JavascriptInterface ou Capacitor Plugin)
		const capUpdater = (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AppUpdater)
			? window.Capacitor.Plugins.AppUpdater
			: null;
		const hasNativeBridge = (window.AndroidAppUpdater && typeof window.AndroidAppUpdater.downloadAndInstall === "function")
			|| (capUpdater && typeof capUpdater.downloadAndInstall === "function");

		if (hasNativeBridge) {
			InGameUpdater.isDownloading = true;
			if (actionBtn) {
				actionBtn.disabled = true;
				actionBtn.innerText = "Baixando...";
			}
			if (progressBox) progressBox.classList.remove("hide");
			if (progressBar) progressBar.style.width = "0%";
			if (progressText) progressText.innerText = "Conectando ao servidor e iniciando download...";

			try {
				if (window.AndroidAppUpdater && typeof window.AndroidAppUpdater.downloadAndInstall === "function") {
					window.AndroidAppUpdater.downloadAndInstall(data.apkUrl);
				} else if (capUpdater) {
					capUpdater.downloadAndInstall({ apkUrl: data.apkUrl });
				}
			} catch (err) {
				console.error("[InGameUpdater] Erro ao disparar download nativo:", err);
				InGameUpdater.isDownloading = false;
				window.open(data.apkUrl, "_blank");
			}
		} else {
			// PC / Navegador ou fallback
			const isNative = (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
			const downloadUrl = isNative ? data.apkUrl : (data.pcUrl || data.apkUrl);
			window.open(downloadUrl, "_blank");
			InGameUpdater.closeUpdateModal();
		}
	}
};

window.InGameUpdater = InGameUpdater;

window.onUpdaterProgress = function(percent, currentBytes, totalBytes) {
	const progressBar = document.getElementById("updater-progress-fill");
	const progressText = document.getElementById("updater-progress-text");
	const actionBtn = document.getElementById("updater-action-btn");

	if (progressBar) {
		progressBar.style.width = Math.min(100, Math.max(0, percent)) + "%";
	}

	if (progressText) {
		const curMB = (currentBytes / (1024 * 1024)).toFixed(1);
		const totalMB = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) : "?";
		if (percent >= 100) {
			progressText.innerText = `Download concluído (${curMB} MB)! Abrindo instalador...`;
			if (actionBtn) actionBtn.innerText = "Instalando...";
		} else {
			progressText.innerText = `Baixando atualização: ${percent}% (${curMB} MB de ${totalMB} MB)`;
		}
	}
};

window.onUpdaterError = function(errorMsg) {
	InGameUpdater.isDownloading = false;
	const progressText = document.getElementById("updater-progress-text");
	const actionBtn = document.getElementById("updater-action-btn");
	if (progressText) {
		progressText.innerHTML = `<span style="color: #e84118;">Erro no download: ${errorMsg}</span>`;
	}
	if (actionBtn) {
		actionBtn.disabled = false;
		actionBtn.innerText = "Tentar Novamente";
	}
	alert("Não foi possível concluir o download da atualização: " + errorMsg);
};

document.addEventListener("DOMContentLoaded", () => {
	InGameUpdater.init();
	BoardManager.init();
	GameRules.init();
});

// ===========================================================================
// GERENCIADOR DE TABULEIROS DE BATALHA (CLASSIC, WOOD, STONE, ROYAL)
// ===========================================================================
const BoardManager = {
	BOARDS: {
		classic: {
			id: "classic",
			name: "Tabuleiro Clássico",
			shortName: "Clássico",
			subtitle: "Taverna tradicional do Continente",
			img: "img/boards/classic_board.png",
			file: "img/boards/classic_board.png"
		},
		wood: {
			id: "wood",
			name: "Tabuleiro de Madeira",
			shortName: "Madeira",
			subtitle: "Madeira rústica de estalagem",
			img: "img/boards/wood_board.png",
			file: "img/boards/wood_board.png"
		},
		stone: {
			id: "stone",
			name: "Tabuleiro de Pedra",
			shortName: "Pedra",
			subtitle: "Mesa esculpida para torneios",
			img: "img/boards/stone_board.png",
			file: "img/boards/stone_board.png"
		},
		royal: {
			id: "royal",
			name: "Tabuleiro Real",
			shortName: "Real",
			subtitle: "Salão nobre dos Torneios Regionais",
			img: "img/boards/royal_board.png",
			file: "img/boards/royal_board.png"
		}
	},
	ORDER: ["classic", "wood", "stone", "royal"],
	currentBoard: "classic",

	init() {
		const saved = this.getQuickMatchBoard();
		if (saved && this.BOARDS[saved]) {
			this.applyBoard(saved);
		} else {
			this.applyBoard("classic");
		}
	},

	isValidBoard(boardId) {
		return Boolean(boardId && this.BOARDS[boardId]);
	},

	getRandomBoard(pool = null) {
		const list = Array.isArray(pool) && pool.length > 0 ? pool : this.ORDER;
		return list[Math.floor(Math.random() * list.length)] || "classic";
	},

	applyBoard(boardId) {
		const resolved = this.isValidBoard(boardId) ? boardId : "classic";
		this.currentBoard = resolved;
		const mainEl = document.querySelector("main");
		if (mainEl) {
			mainEl.setAttribute("data-board", resolved);
			mainEl.style.backgroundImage = `url('${this.BOARDS[resolved].img}')`;
		}
		return resolved;
	},

	getQuickMatchBoard() {
		const saved = (typeof localStorage !== "undefined") ? localStorage.getItem("gc-quick-board") : null;
		if (saved === "random" || this.isValidBoard(saved)) {
			return saved;
		}
		return "classic";
	},

	setQuickMatchBoard(boardId) {
		const val = (boardId === "random" || this.isValidBoard(boardId)) ? boardId : "classic";
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("gc-quick-board", val);
		}
		return val;
	},

	applyQuickMatchBoard() {
		const choice = this.getQuickMatchBoard();
		const target = (choice === "random") ? this.getRandomBoard() : choice;
		return this.applyBoard(target);
	},

	resolveExplorationBoard(node, existingBoardId = null) {
		if (!node) return "classic";
		if (node.type === "tournament") {
			const roundCount = Array.isArray(node.rounds) ? node.rounds.length : 0;
			if (node.isRegional || roundCount >= 7) {
				return "royal";
			}
			if (roundCount === 3 || roundCount === 5) {
				return "stone";
			}
			if (roundCount === 2) {
				return "wood";
			}
			return "stone";
		}
		// Duelos normais: Classic ou Wood (mantém o mesmo em caso de revanche)
		if (existingBoardId && (existingBoardId === "classic" || existingBoardId === "wood")) {
			return existingBoardId;
		}
		return Math.random() < 0.5 ? "classic" : "wood";
	}
};

window.BoardManager = BoardManager;

// ===========================================================================
// REGRAS ADICIONAIS & MODIFICADORES DE PARTIDA (GAME RULES)
// ===========================================================================
const GameRules = {
	STORAGE_KEY: "gc_custom_match_rules",

	current: {
		noSpies: false,           // Proibido cartas de Espião
		tacticalSpies: false,     // Espião compra 1 carta em vez de 2
		noScorch: false,          // Proibido Queimar especial e habilidades Queimar
		clearSkies: false,        // Proibido cartas de Clima e líderes de clima
		noLeaderAbilities: false, // Proibido Habilidades de Líder
		noHeroes: false,          // Proibido Cartas Herói
		noMedics: false,          // Proibido Habilidade de Médico
		singleTroops: false       // Cartas de Tropa (Reunir) não invocam outras tropas
	},

	METADATA: {
		noSpies: {
			id: "noSpies",
			icon: "🕵️‍♂️",
			name: "Sem Espiões",
			desc: "Cartas com a habilidade Espião são banidas da partida."
		},
		tacticalSpies: {
			id: "tacticalSpies",
			icon: "📜",
			name: "Espião Tático (1 Carta)",
			desc: "Espiões compram apenas 1 carta do baralho em vez de 2.",
			disabledIf: "noSpies"
		},
		noScorch: {
			id: "noScorch",
			icon: "🔥",
			name: "Chamas Proibidas (Sem Queimar)",
			desc: "A carta Queimar e todas as tropas com efeito Queimar são banidas."
		},
		clearSkies: {
			id: "clearSkies",
			icon: "❄️",
			name: "Céu Limpo (Sem Clima)",
			desc: "Cartas de Clima e líderes com clima são banidos."
		},
		noLeaderAbilities: {
			id: "noLeaderAbilities",
			icon: "👑",
			name: "Líder Neutro (Sem Habilidades)",
			desc: "As habilidades dos Líderes ficam desativadas durante a partida."
		},
		noHeroes: {
			id: "noHeroes",
			icon: "⭐",
			name: "Batalha de Mortais (Sem Heróis)",
			desc: "Cartas de Herói douradas são banidas da partida."
		},
		noMedics: {
			id: "noMedics",
			icon: "💉",
			name: "Destino Selado (Sem Médicos)",
			desc: "Cartas com habilidade de Médico são banidas da partida."
		},
		singleTroops: {
			id: "singleTroops",
			icon: "🛡️",
			name: "Tropas Solitárias (Sem Reunir)",
			desc: "Cartas de Reunir podem ser jogadas, mas não convocam outras tropas."
		}
	},

	PRESETS: {
		default: {
			name: "Padrão",
			rules: { noSpies: false, tacticalSpies: false, noScorch: false, clearSkies: false, noLeaderAbilities: false, noHeroes: false, noMedics: false, singleTroops: false }
		},
		mortals: {
			name: "Batalha de Mortais",
			rules: { noSpies: true, tacticalSpies: false, noScorch: true, clearSkies: false, noLeaderAbilities: false, noHeroes: true, noMedics: false, singleTroops: false }
		},
		clear: {
			name: "Céu Aberto",
			rules: { noSpies: false, tacticalSpies: false, noScorch: false, clearSkies: true, noLeaderAbilities: false, noHeroes: false, noMedics: false, singleTroops: false }
		},
		pure: {
			name: "Duelo Tático",
			rules: { noSpies: false, tacticalSpies: true, noScorch: false, clearSkies: false, noLeaderAbilities: true, noHeroes: false, noMedics: true, singleTroops: true }
		}
	},

	init() {
		this.load();
	},

	load() {
		try {
			if (typeof localStorage !== "undefined") {
				const saved = localStorage.getItem(this.STORAGE_KEY);
				if (saved) {
					const parsed = JSON.parse(saved);
					for (const k in this.current) {
						if (typeof parsed[k] === "boolean") {
							this.current[k] = parsed[k];
						}
					}
					if (this.current.noSpies) this.current.tacticalSpies = false;
				}
			}
		} catch (e) {
			console.warn("[GameRules] Erro ao carregar regras:", e);
		}
	},

	save() {
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.current));
			}
		} catch (e) {
			console.warn("[GameRules] Erro ao salvar regras:", e);
		}
	},

	isActive(ruleKey) {
		if (typeof StoryMode !== "undefined" && StoryMode.activeMatch) return false;
		return Boolean(this.current && this.current[ruleKey]);
	},

	getActiveRulesList() {
		const list = [];
		for (const k in this.current) {
			if (this.isActive(k) && this.METADATA[k]) {
				list.push(this.METADATA[k]);
			}
		}
		return list;
	},

	getActiveCount() {
		return this.getActiveRulesList().length;
	},

	setRule(ruleKey, value) {
		if (this.current.hasOwnProperty(ruleKey)) {
			this.current[ruleKey] = Boolean(value);
			if (ruleKey === "noSpies" && value) {
				this.current.tacticalSpies = false;
			}
			this.save();
		}
	},

	setRules(newRules) {
		if (!newRules || typeof newRules !== "object") return;
		for (const k in this.current) {
			if (typeof newRules[k] === "boolean") {
				this.current[k] = newRules[k];
			}
		}
		if (this.current.noSpies) this.current.tacticalSpies = false;
		this.save();
	},

	applyPreset(presetKey) {
		const p = this.PRESETS[presetKey];
		if (!p) return;
		for (const k in p.rules) {
			this.current[k] = p.rules[k];
		}
		this.save();
	},

	reset() {
		this.applyPreset("default");
	},

	isWeatherLeaderAbility(card) {
		if (!card) return false;
		const abilityName = (typeof card === "string") ? card : (card.ability || (card.abilities && card.abilities[0]) || "");
		const weatherAbilities = ["foltest_king", "foltest_lord", "emhyr_imperial", "eredin_king", "francesca_pureblood", "king_bran"];
		return weatherAbilities.includes(abilityName);
	},

	isCardProhibited(card) {
		if (card == null) return false;
		if (typeof StoryMode !== "undefined" && StoryMode.activeMatch) return false;

		let cardObj = card;
		if (typeof card === "number") {
			cardObj = (typeof card_dict !== "undefined") ? card_dict[card] : null;
		} else if (typeof card === "object" && typeof card.index === "number" && !card.ability && !card.name) {
			cardObj = (typeof card_dict !== "undefined") ? card_dict[card.index] : null;
		}
		if (!cardObj) return false;

		const abilities = Array.isArray(cardObj.abilities) 
			? cardObj.abilities 
			: (cardObj.ability ? String(cardObj.ability).split(" ") : []);
		const isHero = abilities.includes("hero") || Boolean(cardObj.hero);
		const row = cardObj.row || "";
		const deck = cardObj.deck || "";
		const name = (cardObj.name || "").trim();

		// 1. Sem Espiões
		if (this.isActive("noSpies")) {
			if (abilities.includes("spy")) return true;
		}

		// 2. Chamas Proibidas (Sem Queimar)
		if (this.isActive("noScorch")) {
			if (name === "Scorch") return true;
			if (abilities.some(a => a.startsWith("scorch"))) return true;
		}

		// 3. Céu Limpo (Sem Clima)
		if (this.isActive("clearSkies")) {
			if (row === "weather" || deck === "weather") return true;
		}

		// 4. Batalha de Mortais (Sem Heróis)
		if (this.isActive("noHeroes")) {
			if (isHero) return true;
		}

		// 5. Destino Selado (Sem Médicos)
		if (this.isActive("noMedics")) {
			if (abilities.includes("medic")) return true;
		}

		return false;
	}
};

window.GameRules = GameRules;


/* ==========================================================================
   AVATAR MANAGER — Custom Circular Avatars & Selection System
   ========================================================================== */
const AvatarManager = {
	STORAGE_KEY: "gc_player_avatar",
	STORAGE_NAME_KEY: "gc_player_avatar_name",
	STORAGE_KEY_STORY: "gc_story_player_avatar",
	STORAGE_NAME_KEY_STORY: "gc_story_player_avatar_name",
	DEFAULT_AVATAR: "img/icons/profile.png",
	DEFAULT_NAME: "Geralt de Rívia",
	DEFAULT_OPPONENT_AVATAR: "img/avatars/Aldert-Geert.png",
	DEFAULT_OPPONENT_NAME: "Adversário",

	currentFilter: "all",
	searchQuery: "",
	originScreen: "story",

	CATALOG: [
    {
        "id": "geralt_classic",
        "name": "Geralt de Rívia (Clássico)",
        "file": "img/icons/profile.png",
        "faction": "neutral",
        "isPlayerOnly": true
    },
    {
        "id": "nr_white_orchard",
        "name": "Estudioso Aldert Geert",
        "file": "img/avatars/Aldert-Geert.png",
        "faction": "realms",
        "nodeId": "nr_white_orchard"
    },
    {
        "id": "nr_murky_waters",
        "name": "Chefe Tobias Hoffman",
        "file": "img/avatars/Tobias-Hoffman.png",
        "faction": "scoiatael",
        "nodeId": "nr_murky_waters"
    },
    {
        "id": "nr_vizima_palace",
        "name": "Camareiro Mererid",
        "file": "img/avatars/Mererid.png",
        "faction": "nilfgaard",
        "nodeId": "nr_vizima_palace"
    },
    {
        "id": "nr_maribor_fort",
        "name": "Tenente Ves (Listras Azuis)",
        "file": "img/avatars/Ves.png",
        "faction": "realms",
        "nodeId": "nr_maribor_fort"
    },
    {
        "id": "nr_la_valette",
        "name": "Barão Aryan La Valette",
        "file": "img/avatars/Aryan-La-Valette.png",
        "faction": "realms",
        "nodeId": "nr_la_valette"
    },
    {
        "id": "nr_ellander",
        "name": "Madre Nenneke",
        "file": "img/avatars/Madre-nenneke.png",
        "faction": "scoiatael",
        "nodeId": "nr_ellander"
    },
    {
        "id": "vel_crows_perch",
        "name": "Barão Sanguinário",
        "file": "img/avatars/Phillip-Strenger-Bloody-Baron.png",
        "faction": "realms",
        "nodeId": "vel_crows_perch"
    },
    {
        "id": "vel_gors_velen",
        "name": "Feiticeira Keira Metz",
        "file": "img/avatars/Keira-Metz.png",
        "faction": "realms",
        "nodeId": "vel_gors_velen"
    },
    {
        "id": "vel_cidaris",
        "name": "Jarl Holger Mão-Negra",
        "file": "img/avatars/Holger-Blackhand.png",
        "faction": "skellige",
        "nodeId": "vel_cidaris"
    },
    {
        "id": "red_oxenfurt",
        "name": "Médica Shani",
        "file": "img/avatars/Shani.png",
        "faction": "realms",
        "nodeId": "red_oxenfurt"
    },
    {
        "id": "red_novigrad_docks",
        "name": "Bardo Dandelion",
        "file": "img/avatars/Dandelion.png",
        "faction": "scoiatael",
        "nodeId": "red_novigrad_docks"
    },
    {
        "id": "red_rosemarie",
        "name": "Madame Sasha (Cantarella)",
        "file": "img/avatars/Sasha-Cantarella.png",
        "faction": "nilfgaard",
        "nodeId": "red_rosemarie"
    },
    {
        "id": "red_tretogor",
        "name": "Feiticeira Philippa Eilhart",
        "file": "img/avatars/Philippa-Eilhart.png",
        "faction": "realms",
        "nodeId": "red_tretogor"
    },
    {
        "id": "red_blaviken",
        "name": "Mestre Mago Stregobor",
        "file": "img/avatars/Mage-Stregobor.png",
        "faction": "realms",
        "nodeId": "red_blaviken"
    },
    {
        "id": "red_drakenborg",
        "name": "Síle de Tansarville",
        "file": "img/avatars/Sile-de-tansarville.png",
        "faction": "realms",
        "nodeId": "red_drakenborg"
    },
    {
        "id": "kaed_ard_carraigh",
        "name": "Rei Henselt de Kaedwen",
        "file": "img/avatars/King-Henselt.png",
        "faction": "realms",
        "nodeId": "kaed_ard_carraigh"
    },
    {
        "id": "kaed_ban_ard",
        "name": "Mago Dethmold",
        "file": "img/avatars/Dethmold.png",
        "faction": "realms",
        "nodeId": "kaed_ban_ard"
    },
    {
        "id": "km_fortress",
        "name": "Mestre Bruxo Vesemir",
        "file": "img/avatars/Vesemir.png",
        "faction": "monsters",
        "nodeId": "km_fortress"
    },
    {
        "id": "aed_dol_blathanna",
        "name": "Rei Élfico Filavandrel",
        "file": "img/avatars/Filavandrel-Elf-King.png",
        "faction": "scoiatael",
        "nodeId": "aed_dol_blathanna"
    },
    {
        "id": "aed_upper_posada",
        "name": "Torque o Silvano",
        "file": "img/avatars/Torque-o-Silvano.png",
        "faction": "monsters",
        "nodeId": "aed_upper_posada"
    },
    {
        "id": "aed_gulet",
        "name": "Comandante Yaevinn",
        "file": "img/avatars/Yaevinn.png",
        "faction": "scoiatael",
        "nodeId": "aed_gulet"
    },
    {
        "id": "aed_vengerberg",
        "name": "Rei Demavend III",
        "file": "img/avatars/Demavend.png",
        "faction": "realms",
        "nodeId": "aed_vengerberg"
    },
    {
        "id": "aed_vergen",
        "name": "Saskia (A Caçadora de Dragões)",
        "file": "img/avatars/Saskia-The-DragonSlayer.png",
        "faction": "scoiatael",
        "nodeId": "aed_vergen"
    },
    {
        "id": "aed_flotsam",
        "name": "Comandante Iorveth",
        "file": "img/avatars/Iorveth.png",
        "faction": "scoiatael",
        "nodeId": "aed_flotsam"
    },
    {
        "id": "aed_loc_muinne",
        "name": "Isengrim Faoiltiarna",
        "file": "img/avatars/Isengrim-Faoiltiarna.png",
        "faction": "scoiatael",
        "nodeId": "aed_loc_muinne"
    },
    {
        "id": "aed_mahakam",
        "name": "Ancião Brouver Hoog",
        "file": "img/avatars/Brouver-hoog.png",
        "faction": "scoiatael",
        "nodeId": "aed_mahakam"
    },
    {
        "id": "aed_rivia",
        "name": "Sabrina Glevissig",
        "file": "img/avatars/Sabrina-Glevissig.png",
        "faction": "realms",
        "nodeId": "aed_rivia"
    },
    {
        "id": "aed_brokilon",
        "name": "Rainha Eithné de Brokilon",
        "file": "img/avatars/Queen-Eithne-of-Brokilon.png",
        "faction": "scoiatael",
        "nodeId": "aed_brokilon"
    },
    {
        "id": "skel_kaer_trolde_port",
        "name": "Jarl Crach an Craite",
        "file": "img/avatars/Crach-an-Craite.png",
        "faction": "skellige",
        "nodeId": "skel_kaer_trolde_port"
    },
    {
        "id": "skel_gedyneith",
        "name": "Arquidruida Ermion",
        "file": "img/avatars/Arquidruida-Ermion.png",
        "faction": "skellige",
        "nodeId": "skel_gedyneith"
    },
    {
        "id": "skel_fyresdal",
        "name": "Madman Lugos",
        "file": "img/avatars/Madman-Lugos.png",
        "faction": "skellige",
        "nodeId": "skel_fyresdal"
    },
    {
        "id": "skel_hindarsfjall",
        "name": "Jarl Donar an Hindar",
        "file": "img/avatars/Donar-an-Hindar.png",
        "faction": "skellige",
        "nodeId": "skel_hindarsfjall"
    },
    {
        "id": "skel_an_skellig",
        "name": "Príncipe Svanrige Tuirseach",
        "file": "img/avatars/Svanrige-Tuirseach.png",
        "faction": "skellige",
        "nodeId": "skel_an_skellig"
    },
    {
        "id": "skel_spikeroog",
        "name": "Cerys an Craite",
        "file": "img/avatars/Cerys-an-Craite.png",
        "faction": "skellige",
        "nodeId": "skel_spikeroog"
    },
    {
        "id": "skel_faroe",
        "name": "Blueboy Lugos",
        "file": "img/avatars/Blueboy-Lugos.png",
        "faction": "skellige",
        "nodeId": "skel_faroe"
    },
    {
        "id": "skel_undvik",
        "name": "Hjalmar an Craite",
        "file": "img/avatars/Hjalmar-an-Craite.png",
        "faction": "skellige",
        "nodeId": "skel_undvik"
    },
    {
        "id": "skel_bremervoord",
        "name": "Duque Agloval",
        "file": "img/avatars/Duque-Agloval.png",
        "faction": "skellige",
        "nodeId": "skel_bremervoord"
    },
    {
        "id": "tous_corvo_bianco",
        "name": "Mordomo Barnabas-Basil",
        "file": "img/avatars/Barnabas-basil.png",
        "faction": "monsters",
        "nodeId": "tous_corvo_bianco"
    },
    {
        "id": "tous_fox_hollow",
        "name": "Emiel Regis Rohellec Terzieff",
        "file": "img/avatars/Emiel-Regis-Rohellec-Terzieff.png",
        "faction": "monsters",
        "nodeId": "tous_fox_hollow"
    },
    {
        "id": "tous_dun_tynne",
        "name": "Dettlaff van der Eretein",
        "file": "img/avatars/Dettlaff-van-der-Eretein.png",
        "faction": "monsters",
        "nodeId": "tous_dun_tynne"
    },
    {
        "id": "tous_beauclair_palace",
        "name": "Senhora Orianna de Beauclair",
        "file": "img/avatars/Orianna-de-Beauclair.png",
        "faction": "monsters",
        "nodeId": "tous_beauclair_palace"
    },
    {
        "id": "tous_belhaven",
        "name": "O Ancião Oculto (Unseen Elder)",
        "file": "img/avatars/Unseen-Elder.png",
        "faction": "monsters",
        "nodeId": "tous_belhaven"
    },
    {
        "id": "tous_mount_gorgon",
        "name": "Sir Peyrac Peyran",
        "file": "img/avatars/Sir-Peyrac-Peyran.png",
        "faction": "monsters",
        "nodeId": "tous_mount_gorgon"
    },
    {
        "id": "ang_caed_dhu",
        "name": "Johnny (Puero)",
        "file": "img/avatars/Johnny.png",
        "faction": "monsters",
        "nodeId": "ang_caed_dhu"
    },
    {
        "id": "sod_sodden_hill",
        "name": "Yarpen Zigrin",
        "file": "img/avatars/Yarpen-Zigrin.png",
        "faction": "monsters",
        "nodeId": "sod_sodden_hill"
    },
    {
        "id": "cin_cintra_capital",
        "name": "Rainha Calanthe",
        "file": "img/avatars/Queen-Calanthe.png",
        "faction": "monsters",
        "nodeId": "cin_cintra_capital"
    },
    {
        "id": "nilf_capital_tavern",
        "name": "General Morvran Voorhis",
        "file": "img/avatars/Morvran-Voorhis.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_capital_tavern"
    },
    {
        "id": "nilf_castel_graupian",
        "name": "Duque Joachim de Wett",
        "file": "img/avatars/Joachim-de-Wett.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_castel_graupian"
    },
    {
        "id": "nilf_tarnhann",
        "name": "Embaixador Shilard Fitz-Oesterlen",
        "file": "img/avatars/Shilard-Fitz-Oesterlen.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_tarnhann"
    },
    {
        "id": "nilf_loc_grim",
        "name": "Vattier de Rideaux",
        "file": "img/avatars/Vattier-de-rideaux.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_loc_grim"
    },
    {
        "id": "nilf_vicovaro",
        "name": "Feiticeira Fringilla Vigo",
        "file": "img/avatars/Fringilla-Vigo.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_vicovaro"
    },
    {
        "id": "nilf_darn_dyffra",
        "name": "Marechal Menno Coehoorn",
        "file": "img/avatars/Menno-Coehoorn.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_darn_dyffra"
    },
    {
        "id": "nilf_gemmera",
        "name": "Letho de Gulet",
        "file": "img/avatars/Letho-de-Gulet.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_gemmera"
    },
    {
        "id": "nilf_stygga",
        "name": "Stefan Skellen (Coruja)",
        "file": "img/avatars/Stefan-Skellen.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_stygga"
    },
    {
        "id": "nilf_maecht",
        "name": "Coronel Tibor Eggebracht",
        "file": "img/avatars/Tibor-Eggebracht.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_maecht"
    },
    {
        "id": "nilf_claremont",
        "name": "Caçador Leo Bonhart",
        "file": "img/avatars/Leo-Bonhart.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_claremont"
    },
    {
        "id": "nilf_metinna",
        "name": "Feiticeira Cynthia",
        "file": "img/avatars/Cynthia.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_metinna"
    },
    {
        "id": "nilf_tor_zireael",
        "name": "Sábio Aen Elle Avallac'h",
        "file": "img/avatars/Avallach.png",
        "faction": "scoiatael",
        "nodeId": "nilf_tor_zireael"
    },
    {
        "id": "nilf_assengard",
        "name": "Astrólogo Imperial Xarthisius",
        "file": "img/avatars/Xarthisius.png",
        "faction": "nilfgaard",
        "nodeId": "nilf_assengard"
    },
    // --- Avatares Adicionais (Player & IA) ---
    // Variantes de Geralt de Rívia (Exclusivas do Jogador)
    {
        "id": "geralt_rivia_1",
        "name": "Geralt de Rívia (Lobo Branco)",
        "file": "img/avatars/Geralt-de-rivia1.png",
        "faction": "neutral",
        "isPlayerOnly": true
    },
    {
        "id": "geralt_rivia_2",
        "name": "Geralt de Rívia (Manticora)",
        "file": "img/avatars/geralt-de-rivia2.png",
        "faction": "neutral",
        "isPlayerOnly": true
    },
    {
        "id": "geralt_rivia_3",
        "name": "Geralt de Rívia (Armadura de Lobo)",
        "file": "img/avatars/geralt-de-rivia3.png",
        "faction": "neutral",
        "isPlayerOnly": true
    },
    {
        "id": "geralt_rivia_4",
        "name": "Geralt de Rívia (Grão-Mestre)",
        "file": "img/avatars/geralt-de-rivia4.png",
        "faction": "neutral",
        "isPlayerOnly": true
    },

    // Variantes de Ciri (Player & IA)
    {
        "id": "ciri_1",
        "name": "Ciri (Andorinha de Cintra)",
        "file": "img/avatars/Ciri1.png",
        "faction": "neutral"
    },
    {
        "id": "ciri_2",
        "name": "Ciri (Dama do Tempo e Espaço)",
        "file": "img/avatars/Ciri2.png",
        "faction": "neutral"
    },
    {
        "id": "ciri_3",
        "name": "Ciri (Herdeira Imperial)",
        "file": "img/avatars/Ciri3.png",
        "faction": "nilfgaard"
    },
    {
        "id": "ciri_4",
        "name": "Ciri (Sangue Antigo)",
        "file": "img/avatars/Ciri4.png",
        "faction": "neutral"
    },

    // Variantes de Yennefer (Player & IA)
    {
        "id": "yennefer_1",
        "name": "Yennefer de Vengerberg",
        "file": "img/avatars/Yennefer1.png",
        "faction": "nilfgaard"
    },
    {
        "id": "yennefer_2",
        "name": "Yennefer (Feiticeira Imperial)",
        "file": "img/avatars/Yennefer2.png",
        "faction": "nilfgaard"
    },
    {
        "id": "yennefer_3",
        "name": "Yennefer (Lilás e Groselha)",
        "file": "img/avatars/Yennefer3.png",
        "faction": "neutral"
    },
    {
        "id": "yennefer_4",
        "name": "Yennefer (Senhora de Thanedd)",
        "file": "img/avatars/Yennefer4.png",
        "faction": "neutral"
    },

    // Variantes de Triss Merigold (Player & IA)
    {
        "id": "triss_1",
        "name": "Triss Merigold de Maribor",
        "file": "img/avatars/Triss-Merigold.png",
        "faction": "realms"
    },
    {
        "id": "triss_2",
        "name": "Triss Merigold (Maga da Corte)",
        "file": "img/avatars/Triss-Merigold2.png",
        "faction": "realms"
    },
    {
        "id": "triss_3",
        "name": "Triss Merigold (Catorze do Monte)",
        "file": "img/avatars/Triss-Merigold3.png",
        "faction": "realms"
    },

    // Personagens Notáveis do Continente (Player & IA)
    {
        "id": "zoltan_chivay",
        "name": "Guerreiro Anão Zoltan Chivay",
        "file": "img/avatars/Zoltan.png",
        "faction": "scoiatael"
    },
    {
        "id": "vernon_roche",
        "name": "Comandante Vernon Roche",
        "file": "img/avatars/Vernon-Roche.png",
        "faction": "realms"
    },
    {
        "id": "sigismund_dijkstra",
        "name": "Mestre Espião Sigismund Dijkstra",
        "file": "img/avatars/Djikstra.png",
        "faction": "realms"
    },
    {
        "id": "radovid_v",
        "name": "Rei Radovid V o Severo",
        "file": "img/avatars/Radovid.png",
        "faction": "realms"
    },
    {
        "id": "siegfried_denesle",
        "name": "Cavaleiro Siegfried de Denesle",
        "file": "img/avatars/Siegfried-de-denesle.png",
        "faction": "realms"
    },
    {
        "id": "princess_adda",
        "name": "Princesa Adda de Teméria",
        "file": "img/avatars/Princess-Adda.png",
        "faction": "realms"
    },
    {
        "id": "roderick_de_wett",
        "name": "Cavaleiro Roderick de Wett",
        "file": "img/avatars/Roderick-De-Wett.png",
        "faction": "nilfgaard"
    }
],

	init() {
		if (typeof localStorage !== "undefined") {
			if (!localStorage.getItem(this.STORAGE_KEY)) {
				localStorage.setItem(this.STORAGE_KEY, this.DEFAULT_AVATAR);
				localStorage.setItem(this.STORAGE_NAME_KEY, this.DEFAULT_NAME);
			}
			if (!localStorage.getItem(this.STORAGE_KEY_STORY)) {
				localStorage.setItem(this.STORAGE_KEY_STORY, this.DEFAULT_AVATAR);
				localStorage.setItem(this.STORAGE_NAME_KEY_STORY, this.DEFAULT_NAME);
			}
		}
		if (typeof document !== "undefined") {
			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", () => this.syncAllPlayerAvatarUI());
			} else {
				this.syncAllPlayerAvatarUI();
			}
		}
	},

	safeCssUrl(url) {
		if (!url) return "none";
		const clean = url.replace("Avallac'h.png", "Avallach.png");
		return "url('" + encodeURI(clean).replace(/'/g, "%27") + "')";
	},

	isStoryActive() {
		if (typeof StoryMode !== "undefined" && StoryMode.isActive) return true;
		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen && !mapScreen.classList.contains("hide")) return true;
		if (document.body && document.body.getAttribute("data-screen") === "story") return true;
		return false;
	},

	getStoryPlayerAvatar() {
		if (typeof StoryMode !== "undefined" && StoryMode.save && StoryMode.save.playerAvatar) {
			let saved = StoryMode.save.playerAvatar;
			if (saved.includes("Avallac'h.png")) saved = saved.replace("Avallac'h.png", "Avallach.png");
			return saved;
		}
		if (typeof localStorage !== "undefined") {
			let saved = localStorage.getItem(this.STORAGE_KEY_STORY);
			if (saved) {
				if (saved.includes("Avallac'h.png")) saved = saved.replace("Avallac'h.png", "Avallach.png");
				return saved;
			}
		}
		return this.DEFAULT_AVATAR;
	},

	getStoryPlayerAvatarName() {
		if (typeof StoryMode !== "undefined" && StoryMode.save && StoryMode.save.playerAvatarName) {
			return StoryMode.save.playerAvatarName;
		}
		if (typeof localStorage !== "undefined") {
			const saved = localStorage.getItem(this.STORAGE_NAME_KEY_STORY);
			if (saved) return saved;
		}
		const av = this.getAvatarByFile(this.getStoryPlayerAvatar());
		return av ? av.name : this.DEFAULT_NAME;
	},

	getBattlePlayerAvatar() {
		if (typeof localStorage !== "undefined") {
			let saved = localStorage.getItem(this.STORAGE_KEY);
			if (saved) {
				if (saved.includes("Avallac'h.png")) {
					saved = saved.replace("Avallac'h.png", "Avallach.png");
					localStorage.setItem(this.STORAGE_KEY, saved);
				}
				return saved;
			}
		}
		return this.DEFAULT_AVATAR;
	},

	getBattlePlayerAvatarName() {
		if (typeof localStorage !== "undefined") {
			const saved = localStorage.getItem(this.STORAGE_NAME_KEY);
			if (saved) return saved;
		}
		const av = this.getAvatarByFile(this.getBattlePlayerAvatar());
		return av ? av.name : this.DEFAULT_NAME;
	},

	getPlayerAvatar(scope = null) {
		const targetScope = scope || (this.originScreen === "story" ? "story" : (this.isStoryActive() ? "story" : "battle"));
		if (targetScope === "story") return this.getStoryPlayerAvatar();
		return this.getBattlePlayerAvatar();
	},

	getPlayerAvatarName(scope = null) {
		const targetScope = scope || (this.originScreen === "story" ? "story" : (this.isStoryActive() ? "story" : "battle"));
		if (targetScope === "story") return this.getStoryPlayerAvatarName();
		return this.getBattlePlayerAvatarName();
	},

	setPlayerAvatar(file, name = null, scope = null) {
		if (!file) return;
		const cleanFile = file.replace("Avallac'h.png", "Avallach.png");
		const targetScope = scope || ((this.originScreen === "story") ? "story" : "battle");

		let avatarName = name;
		if (!avatarName) {
			const found = this.CATALOG.find(a => a.file === cleanFile || a.file === file);
			avatarName = found ? found.name : this.DEFAULT_NAME;
		}

		if (targetScope === "story") {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(this.STORAGE_KEY_STORY, cleanFile);
				localStorage.setItem(this.STORAGE_NAME_KEY_STORY, avatarName);
			}
			if (typeof StoryMode !== "undefined" && StoryMode.save) {
				StoryMode.save.playerAvatar = cleanFile;
				StoryMode.save.playerAvatarName = avatarName;
				if (typeof StoryMode.saveGame === "function") StoryMode.saveGame();
			}
		} else {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(this.STORAGE_KEY, cleanFile);
				localStorage.setItem(this.STORAGE_NAME_KEY, avatarName);
			}
			if (typeof VersusMode !== "undefined") {
				if (typeof VersusMode.setLocalAvatar === "function") {
					VersusMode.setLocalAvatar(cleanFile);
				} else {
					VersusMode.localAvatar = cleanFile.startsWith("img/") ? cleanFile : `img/avatars/${cleanFile}`;
					if (typeof VersusMode.updatePreMatchUI === "function") VersusMode.updatePreMatchUI();
					if (typeof VersusMode.sendLobbySync === "function") VersusMode.sendLobbySync();
				}
			}
		}

		this.syncAllPlayerAvatarUI();
	},

	getAvatarByFile(file) {
		if (!file) return null;
		const cleanFile = file.replace("Avallac'h.png", "Avallach.png").toLowerCase();
		return this.CATALOG.find(a => a.file === file || a.file.toLowerCase() === cleanFile || a.file.toLowerCase() === file.toLowerCase());
	},

	isPlayerOnlyAvatar(fileOrId) {
		if (!fileOrId) return false;
		const clean = fileOrId.toLowerCase();
		return clean.includes("profile.png") || clean.includes("geralt");
	},

	// Pool oficial de oponentes da IA para Partidas Rápidas (Exclui estritamente Geralt)
	AI_QUICK_OPPONENTS: {
		realms: [
			{ name: "Rei Radovid V o Severo", avatar: "img/avatars/Radovid.png" },
			{ name: "Mestre Espião Sigismund Dijkstra", avatar: "img/avatars/Djikstra.png" },
			{ name: "Comandante Vernon Roche", avatar: "img/avatars/Vernon-Roche.png" },
			{ name: "Feiticeira Triss Merigold", avatar: "img/avatars/Triss-Merigold.png" },
			{ name: "Princesa Adda de Teméria", avatar: "img/avatars/Princess-Adda.png" },
			{ name: "Cavaleiro Siegfried de Denesle", avatar: "img/avatars/Siegfried-de-denesle.png" },
			{ name: "Rei Henselt de Kaedwen", avatar: "img/avatars/King-Henselt.png" },
			{ name: "Feiticeira Keira Metz", avatar: "img/avatars/Keira-Metz.png" },
			{ name: "Feiticeira Philippa Eilhart", avatar: "img/avatars/Philippa-Eilhart.png" },
			{ name: "Médica Shani", avatar: "img/avatars/Shani.png" }
		],
		nilfgaard: [
			{ name: "Feiticeira Yennefer de Vengerberg", avatar: "img/avatars/Yennefer1.png" },
			{ name: "General Morvran Voorhis", avatar: "img/avatars/Morvran-Voorhis.png" },
			{ name: "Marechal Menno Coehoorn", avatar: "img/avatars/Menno-Coehoorn.png" },
			{ name: "Bruxo Letho de Gulet", avatar: "img/avatars/Letho-de-Gulet.png" },
			{ name: "Cavaleiro Roderick de Wett", avatar: "img/avatars/Roderick-De-Wett.png" },
			{ name: "Feiticeira Fringilla Vigo", avatar: "img/avatars/Fringilla-Vigo.png" },
			{ name: "Duque Joachim de Wett", avatar: "img/avatars/Joachim-de-Wett.png" },
			{ name: "Embaixador Shilard Fitz-Oesterlen", avatar: "img/avatars/Shilard-Fitz-Oesterlen.png" },
			{ name: "Feiticeira Cynthia", avatar: "img/avatars/Cynthia.png" },
			{ name: "Mestre de Espiões Vattier de Rideaux", avatar: "img/avatars/Vattier-de-rideaux.png" }
		],
		monsters: [
			{ name: "Vampiro Superior Dettlaff", avatar: "img/avatars/Dettlaff-van-der-Eretein.png" },
			{ name: "O Ancião Oculto", avatar: "img/avatars/Unseen-Elder.png" },
			{ name: "Emiel Regis Rohellec Terzieff", avatar: "img/avatars/Emiel-Regis-Rohellec-Terzieff.png" },
			{ name: "Senhora Orianna de Beauclair", avatar: "img/avatars/Orianna-de-Beauclair.png" },
			{ name: "Mestre Bruxo Vesemir", avatar: "img/avatars/Vesemir.png" },
			{ name: "Johnny dos Pântanos", avatar: "img/avatars/Johnny.png" },
			{ name: "Torque o Silvano", avatar: "img/avatars/Torque-o-Silvano.png" },
			{ name: "Rainha Calanthe", avatar: "img/avatars/Queen-Calanthe.png" },
			{ name: "Yarpen Zigrin", avatar: "img/avatars/Yarpen-Zigrin.png" }
		],
		scoiatael: [
			{ name: "Ciri (Andorinha de Cintra)", avatar: "img/avatars/Ciri1.png" },
			{ name: "Comandante Iorveth", avatar: "img/avatars/Iorveth.png" },
			{ name: "Saskia a Caçadora de Dragões", avatar: "img/avatars/Saskia-The-DragonSlayer.png" },
			{ name: "Guerreiro Anão Zoltan Chivay", avatar: "img/avatars/Zoltan.png" },
			{ name: "Ancião Brouver Hoog", avatar: "img/avatars/Brouver-hoog.png" },
			{ name: "Rei Élfico Filavandrel", avatar: "img/avatars/Filavandrel-Elf-King.png" },
			{ name: "Rainha Eithné de Brokilon", avatar: "img/avatars/Queen-Eithne-of-Brokilon.png" },
			{ name: "Isengrim Faoiltiarna", avatar: "img/avatars/Isengrim-Faoiltiarna.png" },
			{ name: "Comandante Yaevinn", avatar: "img/avatars/Yaevinn.png" },
			{ name: "Bardo Dandelion", avatar: "img/avatars/Dandelion.png" }
		],
		skellige: [
			{ name: "Jarl Supremo Crach an Craite", avatar: "img/avatars/Crach-an-Craite.png" },
			{ name: "Rainha Cerys an Craite", avatar: "img/avatars/Cerys-an-Craite.png" },
			{ name: "Arquidruida Ermion", avatar: "img/avatars/Arquidruida-Ermion.png" },
			{ name: "Guerreiro Hjalmar an Craite", avatar: "img/avatars/Hjalmar-an-Craite.png" },
			{ name: "Madman Lugos", avatar: "img/avatars/Madman-Lugos.png" },
			{ name: "Jarl Donar an Hindar", avatar: "img/avatars/Donar-an-Hindar.png" },
			{ name: "Jarl Holger Mão-Negra", avatar: "img/avatars/Holger-Blackhand.png" },
			{ name: "Blueboy Lugos", avatar: "img/avatars/Blueboy-Lugos.png" },
			{ name: "Príncipe Svanrige Tuirseach", avatar: "img/avatars/Svanrige-Tuirseach.png" }
		]
	},

	pickQuickMatchOpponent(faction, leaderCard = null) {
		const fac = (faction && this.AI_QUICK_OPPONENTS[faction]) ? faction : "realms";
		const pool = this.AI_QUICK_OPPONENTS[fac] || this.AI_QUICK_OPPONENTS.realms;
		
		if (leaderCard && leaderCard.name) {
			const cleanLeader = leaderCard.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
			const found = pool.find(op => {
				const cleanOp = op.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
				return cleanLeader.includes(cleanOp) || cleanOp.includes(cleanLeader);
			});
			if (found) return found;
		}

		const randomIdx = Math.floor(Math.random() * pool.length);
		return pool[randomIdx] || pool[0];
	},

	resolveOpponentAvatar(name, deckData = null) {
		if (!name) return this.DEFAULT_OPPONENT_AVATAR;
		const cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		
		// Geralt nunca pode ser enfrentado pela IA
		if (cleanName.includes("geralt")) {
			return this.DEFAULT_OPPONENT_AVATAR;
		}

		// 1. Match exato ou de substring recíproca
		let match = this.CATALOG.find(a => {
			if (a.isPlayerOnly) return false;
			const aClean = a.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
			return cleanName.includes(aClean) || aClean.includes(cleanName);
		});
		if (match) return match.file;

		// 2. Match por tokens significativos de nome (ex: "Triss", "Yennefer", "Ciri", "Roche", "Dijkstra", "Zoltan")
		const nameTokens = cleanName.split(/[\s\-()]+/).filter(w => w.length >= 4 && !["mestre", "reino", "conde", "bruxo", "feiticeira", "rainha", "barão"].includes(w));
		match = this.CATALOG.find(a => {
			if (a.isPlayerOnly) return false;
			const aClean = a.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
			return nameTokens.some(token => aClean.includes(token));
		});
		if (match) return match.file;

		// 3. Fallback inteligente baseado na facção do baralho
		if (deckData && deckData.faction && this.AI_QUICK_OPPONENTS[deckData.faction]) {
			const pool = this.AI_QUICK_OPPONENTS[deckData.faction];
			if (pool && pool.length > 0) return pool[0].avatar;
		}

		return this.DEFAULT_OPPONENT_AVATAR;
	},

	resolveQuickMatchOpponentAvatar(faction, opponentData = null) {
		if (opponentData && opponentData.name) {
			const res = this.resolveOpponentAvatar(opponentData.name);
			if (res !== this.DEFAULT_OPPONENT_AVATAR) return res;
		}
		if (faction && this.AI_QUICK_OPPONENTS[faction]) {
			const pool = this.AI_QUICK_OPPONENTS[faction];
			if (pool.length > 0) {
				return pool[0].avatar;
			}
		}
		return this.DEFAULT_OPPONENT_AVATAR;
	},

	applyBoardAvatars(playerAvatarUrl = null, opponentAvatarUrl = null) {
		const targetScope = this.isStoryActive() ? "story" : "battle";
		const meAvatar = playerAvatarUrl || this.getPlayerAvatar(targetScope);
		const meEl = document.querySelector("#stats-me .profile-img");
		if (meEl) {
			meEl.style.backgroundImage = this.safeCssUrl(meAvatar);
			meEl.style.backgroundSize = "cover";
			meEl.style.backgroundPosition = "center";
		}

		const opAvatar = opponentAvatarUrl || this.DEFAULT_OPPONENT_AVATAR;
		const opEl = document.querySelector("#stats-op .profile-img");
		if (opEl) {
			opEl.style.backgroundImage = this.safeCssUrl(opAvatar);
			opEl.style.backgroundSize = "cover";
			opEl.style.backgroundPosition = "center";
		}
	},

	syncAllPlayerAvatarUI() {
		const storyAvatar = this.getStoryPlayerAvatar();
		const storyName = this.getStoryPlayerAvatarName();
		const battleAvatar = this.getBattlePlayerAvatar();
		const battleName = this.getBattlePlayerAvatarName();

		const bgStory = this.safeCssUrl(storyAvatar);
		const bgBattle = this.safeCssUrl(battleAvatar);

		// 1. Story Map HUD
		const storyHudAvatar = document.getElementById("story-hud-player-avatar");
		if (storyHudAvatar) storyHudAvatar.style.backgroundImage = bgStory;

		// 2. Story Stats Drawer
		const statsDrawerAvatar = document.getElementById("stats-drawer-player-avatar");
		if (statsDrawerAvatar) statsDrawerAvatar.style.backgroundImage = bgStory;

		// 3. Deck Maker top bar thumb (adaptável ao modo atual)
		const deckThumb = document.getElementById("deck-avatar-thumb");
		if (deckThumb) {
			deckThumb.style.backgroundImage = this.isStoryActive() ? bgStory : bgBattle;
		}

		// 4. Versus Lobby local player
		const vsP1Avatar = document.getElementById("versus-p1-avatar");
		if (vsP1Avatar) {
			const vsAvatar = (typeof VersusMode !== "undefined" && typeof VersusMode.getLocalAvatar === "function")
				? VersusMode.getLocalAvatar()
				: battleAvatar;
			vsP1Avatar.style.backgroundImage = this.safeCssUrl(vsAvatar);
		}

		// 5. Settings overlay preview
		const settingsAvatar = document.getElementById("settings-player-avatar-preview");
		if (settingsAvatar) {
			settingsAvatar.style.backgroundImage = this.isStoryActive() ? bgStory : bgBattle;
		}

		// 6. Current preview in avatar modal
		const isStoryModal = (this.originScreen === "story");
		const curAvatar = isStoryModal ? storyAvatar : battleAvatar;
		const curName = isStoryModal ? storyName : battleName;

		const currentPreview = document.getElementById("avatar-current-preview-circle");
		if (currentPreview) currentPreview.style.backgroundImage = this.safeCssUrl(curAvatar);
		const currentNameEl = document.getElementById("avatar-current-name");
		if (currentNameEl) currentNameEl.textContent = curName;
		const currentFactionEl = document.getElementById("avatar-current-faction");
		if (currentFactionEl) {
			const found = this.getAvatarByFile(curAvatar);
			const fac = found ? found.faction : "neutral";
			currentFactionEl.className = "story-faction-badge " + fac;
			currentFactionEl.textContent = this.getFactionLabel(fac);
		}

		const scopeBadge = document.getElementById("avatar-modal-scope-badge");
		if (scopeBadge) {
			scopeBadge.textContent = isStoryModal ? "Modo Exploração" : "Partida Rápida & Versus";
		}
	},

	getFactionLabel(faction) {
		const labels = {
			realms: "Reinos do Norte",
			nilfgaard: "Nilfgaard",
			monsters: "Monstros",
			scoiatael: "Scoia'tael",
			skellige: "Skellige",
			neutral: "Neutro"
		};
		return labels[faction] || "Neutro";
	},

	openPicker(origin = "story") {
		if (origin === "deck" || origin === "settings") {
			this.originScreen = this.isStoryActive() ? "story" : "battle";
		} else {
			this.originScreen = origin;
		}

		const modal = document.getElementById("avatar-picker-modal");
		if (!modal) return;

		this.currentFilter = "all";
		this.searchQuery = "";
		const searchInput = document.getElementById("avatar-search-input");
		if (searchInput) searchInput.value = "";

		document.querySelectorAll(".avatar-tab").forEach(tab => {
			tab.classList.toggle("active", tab.getAttribute("data-faction") === "all");
		});

		this.syncAllPlayerAvatarUI();
		this.renderGrid();
		modal.classList.remove("hide");

		setTimeout(() => {
			const activeCard = modal.querySelector(".avatar-picker-card.equipped") || modal.querySelector(".avatar-picker-card");
			if (activeCard) activeCard.focus();
		}, 80);
	},

	closePicker() {
		const modal = document.getElementById("avatar-picker-modal");
		if (modal) modal.classList.add("hide");

		if (this.originScreen === "deck") {
			const btn = document.getElementById("btn-deck-avatar");
			if (btn) btn.focus();
		} else if (this.originScreen === "versus") {
			const btn = document.getElementById("versus-p1-avatar-wrap");
			if (btn) btn.focus();
		} else if (this.originScreen === "story") {
			const btn = document.querySelector(".story-btn-change-avatar") || document.getElementById("stats-drawer-player-avatar");
			if (btn) btn.focus();
		}
	},

	setFilter(faction) {
		this.currentFilter = faction;
		document.querySelectorAll(".avatar-tab").forEach(tab => {
			tab.classList.toggle("active", tab.getAttribute("data-faction") === faction);
		});
		this.renderGrid();
	},

	onSearchInput(val) {
		this.searchQuery = (val || "").trim().toLowerCase();
		this.renderGrid();
	},

	onSearch(val) {
		this.onSearchInput(val);
	},

	renderGrid() {
		const grid = document.getElementById("avatar-picker-grid");
		if (!grid) return;

		const isStory = (this.originScreen === "story");
		const curAvatar = isStory
			? this.getStoryPlayerAvatar()
			: ((typeof VersusMode !== "undefined" && typeof VersusMode.getLocalAvatar === "function" && this.originScreen === "versus")
				? VersusMode.getLocalAvatar()
				: this.getBattlePlayerAvatar());
		const cleanCur = (curAvatar || "").replace("Avallac'h.png", "Avallach.png");
		const filtered = this.CATALOG.filter(item => {
			if (this.currentFilter !== "all" && item.faction !== this.currentFilter) return false;
			if (this.searchQuery) {
				const cleanQuery = this.searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
				const cleanName = item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
				if (!cleanName.includes(cleanQuery)) return false;
			}
			return true;
		});

		const countAll = document.getElementById("avatar-count-all");
		if (countAll) countAll.textContent = this.CATALOG.length;

		if (filtered.length === 0) {
			grid.innerHTML = '<div class="avatar-empty-search">Nenhum avatar encontrado para "' + this.searchQuery + '".</div>';
			return;
		}

		grid.innerHTML = filtered.map(item => {
			const isEquipped = item.file === curAvatar || item.file === cleanCur;
			const safeId = item.id.replace(/'/g, "\\'");
			const safeName = item.name.replace(/"/g, '&quot;');
			const factionTag = '<span class="avatar-picker-faction-tag ' + item.faction + '">' + this.getFactionLabel(item.faction) + '</span>';
			const checkmark = isEquipped ? '<div class="avatar-equipped-check" title="Equipado">✓</div>' : '';
			const bgCss = this.safeCssUrl(item.file);

			return '<div class="avatar-picker-card ' + (isEquipped ? 'equipped' : '') + '" ' +
				'data-avatar-id="' + safeId + '" ' +
				'onclick="AvatarManager.selectAvatar(\'' + safeId + '\')" ' +
				'tabindex="0" ' +
				'role="button" ' +
				'aria-label="' + safeName + ' (' + this.getFactionLabel(item.faction) + ')">' +
				'<div class="avatar-picker-circle-wrap">' +
					'<div class="avatar-picker-img" style="background-image: ' + bgCss + ';"></div>' +
					'<div class="avatar-picker-border"></div>' +
					checkmark +
				'</div>' +
				'<div class="avatar-picker-name" title="' + safeName + '">' + item.name + '</div>' +
				factionTag +
			'</div>';
		}).join("");
	},

	selectAvatar(avatarId) {
		const found = this.CATALOG.find(a => a.id === avatarId);
		if (!found) return;

		const targetScope = (this.originScreen === "story") ? "story" : "battle";
		this.setPlayerAvatar(found.file, found.name, targetScope);
		this.renderGrid();

		if (typeof playAudio === "function") {
			try { playAudio("click"); } catch (e) {}
		}
	}
};

window.AvatarManager = AvatarManager;
AvatarManager.init();
