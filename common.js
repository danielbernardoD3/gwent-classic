"use strict"

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
// RESPONSIVE GAME BOARD FITTER (LETTERBOXING / PILLARBOXING COM BARRAS PRETAS)
// Garante que todo o tabuleiro 16:9 caiba verticalmente na tela sem rolagem,
// centralizando e gerando barras pretas nas laterais em telas ultrawide e celulares.
// ---------------------------------------------------------------------------
function fitGameBoard() {
	const main = document.querySelector("main");
	const deckCust = document.getElementById("deck-customization");
	const w = window.innerWidth;
	const h = window.innerHeight;
	if (!w || !h) return;

	const baseAspect = 1920 / 1080;
	const currentAspect = w / h;

	// Se a tela for mais larga que 16:9 (celulares 19.5:9, 20:9 ou ultrawide):
	// O tabuleiro (100vw) ultrapassaria a altura. Escalamos para caber 100% em 100vh.
	const scale = currentAspect > baseAspect ? (h * 1920) / (w * 1080) : 1;

	[main, deckCust].forEach(elem => {
		if (!elem) return;
		elem.style.left = "50%";
		elem.style.top = "50%";
		elem.style.transform = `translate(-50%, -50%) scale(${scale})`;
		elem.style.transformOrigin = "center center";
	});
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
}
window.showQuickCardInspect = showQuickCardInspect;

function hideQuickCardInspect() {
	const modal = document.getElementById("quick-card-inspect-modal");
	if (modal) modal.classList.add("hide");
}
window.hideQuickCardInspect = hideQuickCardInspect;

function setupCardInspectorListeners() {
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

function exportSaveToClipboard() {
	try {
		const bundle = generateSaveBundle();
		const jsonStr = JSON.stringify(bundle);
		navigator.clipboard.writeText(jsonStr).then(() => {
			const fb = document.getElementById("export-save-feedback");
			if (fb) fb.innerText = "✓ Código do Save copiado para a Área de Transferência!";
			triggerHaptic("medium");
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
	if (quickInspect && !quickInspect.classList.contains("hide")) {
		quickInspect.classList.add("hide");
		return true;
	}

	// 2. Dropdown do cabeçalho do mapa da história aberto?
	const dropdown = document.getElementById("story-hud-dropdown-menu");
	if (dropdown && dropdown.classList.contains("open")) {
		if (typeof StoryMode !== "undefined" && StoryMode.closeHeaderDropdown) {
			StoryMode.closeHeaderDropdown();
		} else {
			dropdown.classList.remove("open");
		}
		return true;
	}

	// 3. Modais do sistema / história / versus abertos?
	const activeModals = [
		"game-updater-modal",
		"backup-save-modal",
		"story-compendium-modal",
		"story-achievements-modal",
		"story-battle-modal",
		"story-deck-select-modal",
		"story-card-inspect-modal",
		"story-save-slots-modal",
		"story-congrats-modal",
		"story-rules-modal",
		"versus-lobby-modal",
		"versus-alert-modal"
	];
	for (const id of activeModals) {
		const m = document.getElementById(id);
		if (m && !m.classList.contains("hide")) {
			m.classList.add("hide");
			return true;
		}
	}

	// 4. Preview padrão de carta aberto?
	const cardPreview = document.querySelector(".card-preview");
	if (cardPreview && !cardPreview.classList.contains("hide")) {
		if (typeof ui !== "undefined" && ui.hidePreview) {
			ui.hidePreview();
		} else {
			cardPreview.classList.add("hide");
		}
		return true;
	}

	// 5. Tela de customização de baralho (#deck-customization) ativa?
	const deckCust = document.getElementById("deck-customization");
	if (deckCust && !deckCust.classList.contains("hide")) {
		if (typeof StoryMode !== "undefined" && StoryMode.active) {
			StoryMode.openMap();
		} else if (typeof Menu !== "undefined" && Menu.returnToMainMenu) {
			Menu.returnToMainMenu();
		} else {
			deckCust.classList.add("hide");
			const mainMenu = document.getElementById("main-menu");
			if (mainMenu) mainMenu.classList.remove("hide");
		}
		return true;
	}

	// 6. Partida em andamento (tabuleiro principal)?
	const gameBoard = document.querySelector("main");
	if (gameBoard && !gameBoard.classList.contains("hide")) {
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			if (confirm("Deseja desistir da partida online atual e voltar ao menu?")) {
				VersusMode.exitVersusToMenu();
			}
			return true;
		} else if (typeof StoryMode !== "undefined" && StoryMode.active) {
			if (confirm("Deseja abandonar este duelo e voltar ao mapa?")) {
				StoryMode.openMap();
			}
			return true;
		} else {
			if (confirm("Deseja encerrar a partida e voltar ao menu principal?")) {
				location.reload();
			}
			return true;
		}
	}

	// 7. Mapa da história ativo?
	const mapOverlay = document.getElementById("story-map-overlay");
	if (mapOverlay && !mapOverlay.classList.contains("hide")) {
		if (typeof StoryMode !== "undefined" && StoryMode.exitToMainMenu) {
			StoryMode.exitToMainMenu();
		} else {
			mapOverlay.classList.add("hide");
			const mainMenu = document.getElementById("main-menu");
			if (mainMenu) mainMenu.classList.remove("hide");
		}
		return true;
	}

	// 8. No menu principal na tela raiz: retorna false para que o Android minimize suavemente
	return false;
};

document.addEventListener("DOMContentLoaded", () => {
	setupCardInspectorListeners();
});


// ===========================================================================
// IN-GAME AUTO-UPDATER (ATUALIZADOR AUTOMÁTICO IN-GAME)
// ===========================================================================
const InGameUpdater = {
	CURRENT_VERSION: "1.1.0",
	CURRENT_VERSION_CODE: 2,
	REMOTE_URL: "https://raw.githubusercontent.com/danielbernardoD3/gwent-classic/main/version.json",
	remoteData: null,
	isDownloading: false,

	init() {
		// Auto-check on startup after 2.5 seconds
		setTimeout(() => {
			InGameUpdater.checkForUpdates(false);
		}, 2500);
	},

	async checkForUpdates(manual = false) {
		const btn = document.getElementById("check-updates-btn");
		if (manual && btn) {
			btn.disabled = true;
			btn.innerText = "Verificando...";
		}

		try {
			const res = await fetch(InGameUpdater.REMOTE_URL + "?_t=" + Date.now(), { cache: "no-store" });
			if (!res.ok) throw new Error("Status " + res.status);
			const data = await res.json();
			InGameUpdater.remoteData = data;

			const hasUpdate = InGameUpdater.compareVersions(data.version, InGameUpdater.CURRENT_VERSION) > 0 
				|| (data.versionCode && data.versionCode > InGameUpdater.CURRENT_VERSION_CODE);

			if (hasUpdate) {
				InGameUpdater.showUpdateModal(data);
			} else {
				if (manual) {
					alert(`Você já está jogando a versão mais recente do Gwent Classic (v${InGameUpdater.CURRENT_VERSION})!`);
				}
			}
		} catch (e) {
			console.warn("[InGameUpdater] Erro ao verificar atualizações:", e);
			if (manual) {
				alert("Não foi possível conectar ao servidor de atualizações no momento. Verifique sua conexão à internet.");
			}
		} finally {
			if (manual && btn) {
				btn.disabled = false;
				btn.innerText = "🔄 Verificar Atualizações";
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

		const titleElem = document.getElementById("updater-title");
		const versionBadge = document.getElementById("updater-version-badge");
		const changelogList = document.getElementById("updater-changelog-list");
		const sizeElem = document.getElementById("updater-size-text");
		const progressBox = document.getElementById("updater-progress-box");
		const actionBtn = document.getElementById("updater-action-btn");

		if (titleElem) titleElem.innerText = data.title || "Atualização de Gwent Classic Disponível!";
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

		// Android Nativo
		if (window.AndroidAppUpdater && typeof window.AndroidAppUpdater.downloadAndInstall === "function") {
			InGameUpdater.isDownloading = true;
			if (actionBtn) {
				actionBtn.disabled = true;
				actionBtn.innerText = "Baixando...";
			}
			if (progressBox) progressBox.classList.remove("hide");
			if (progressBar) progressBar.style.width = "0%";
			if (progressText) progressText.innerText = "Iniciando download...";

			window.AndroidAppUpdater.downloadAndInstall(data.apkUrl);
		} else {
			// PC / Navegador
			const downloadUrl = data.pcUrl || data.apkUrl;
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
});
