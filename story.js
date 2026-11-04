"use strict";

/**
 * Story Mode Controller for Gwent Classic
 * Manages Continent Map navigation (WitcherMap_8k_borders.jpg), faction-based starting regions,
 * consecutive tournament gauntlets (2, 3, 5, and 7-match Regional Tournaments),
 * regional merchants, card compendium (216 cards with strict max copy caps), and deck builder.
 */
class StoryMode {
	static MAX_SLOTS = 5;
	static SAVE_KEY = "gc-story-save";
	static activeSlot = 1;
	static targetSlotForNewGame = 1;
	static activeMatch = null;
	static isCustomizingCampaign = false;
	static MAP_WIDTH = 2894;
	static MAP_HEIGHT = 4096;
	static mapZoom = 1;
	static mapPanX = 0;
	static mapPanY = 0;
	static isDragging = false;
	static dragStartX = 0;
	static dragStartY = 0;
	static filters = {
		shops: true,
		tourneys: true,
		locked: true
	};

	static init() {
		if (typeof STORY_DATA === "undefined") {
			console.error("STORY_DATA is not defined. Ensure story_data.js is loaded.");
			return;
		}

		if (STORY_DATA.MAP_WIDTH) StoryMode.MAP_WIDTH = STORY_DATA.MAP_WIDTH;
		if (STORY_DATA.MAP_HEIGHT) StoryMode.MAP_HEIGHT = STORY_DATA.MAP_HEIGHT;

		StoryMode.migrateLegacySave();
		StoryMode.setupEventListeners();
		StoryMode.updateContinueButton();
	}

	/**
	 * Returns the maximum allowed copies of a given card index in the collection/deck.
	 * Enforces 1 copy max for Leaders, Heroes, and unique cards such as Dethmold (index 31).
	 */
	static getCardMaxCopies(cardIndex) {
		const idx = Number(cardIndex);
		if ([21, 196, 206, 207].includes(idx)) return 1;
		if (typeof card_dict !== "undefined" && card_dict[idx]) {
			const c = card_dict[idx];
			if (c.row === "leader") return 1;
			const max = Number(c.count);
			return max > 0 ? max : 1;
		}
		if (typeof STORY_DATA !== "undefined" && STORY_DATA.COMPENDIUM_HINTS && STORY_DATA.COMPENDIUM_HINTS[idx]) {
			return STORY_DATA.COMPENDIUM_HINTS[idx].maxCount || 1;
		}
		return 1;
	}

	/**
	 * Automatically unlocks the 4 token cards in the Compendium when their summoner is owned,
	 * and enforces strict maximum copy caps across all cards in the player's collection.
	 */
	static syncCollectionAndTokens() {
		if (!StoryMode.save || !StoryMode.save.collection) return;
		const col = StoryMode.save.collection;

		// Unlock summoned tokens when their summoner is owned
		if ((col[20] || 0) > 0) col[21] = 1;   // Cow -> Bovine Defense Force
		if ((col[199] || 0) > 0) col[196] = 1; // Kambi -> Hemdall
		if ((col[183] || 0) > 0) col[206] = 1; // Berserker -> Transformed Vildkaarl
		if ((col[209] || 0) > 0) col[207] = 1; // Young Berserker -> Transformed Young Vildkaarl

		// Clamp every card in the collection to its strict maximum allowed copies
		Object.keys(col).forEach(k => {
			const idx = Number(k);
			const maxAllowed = StoryMode.getCardMaxCopies(idx);
			if (col[idx] > maxAllowed) {
				col[idx] = maxAllowed;
			}
		});

		// Also ensure playerDeck does not exceed owned/max copies
		if (StoryMode.save.playerDeck && Array.isArray(StoryMode.save.playerDeck.cards)) {
			StoryMode.save.playerDeck.cards = StoryMode.save.playerDeck.cards
				.map(([idx, cnt]) => {
					const maxAllowed = Math.min(StoryMode.getCardMaxCopies(idx), col[idx] || 0);
					return [idx, Math.min(cnt, maxAllowed)];
				})
				.filter(([, cnt]) => cnt > 0);
		}
	}

	/**
	 * Safely awards copies of a card to the player's collection without exceeding its max limit.
	 */
	static awardCardToCollection(cardIndex, count = 1) {
		if (!StoryMode.save || !StoryMode.save.collection) return 0;
		const idx = Number(cardIndex);
		const maxAllowed = StoryMode.getCardMaxCopies(idx);
		const currentOwned = StoryMode.save.collection[idx] || 0;
		const newTotal = Math.min(maxAllowed, currentOwned + (count || 1));
		const added = Math.max(0, newTotal - currentOwned);
		StoryMode.save.collection[idx] = newTotal;
		StoryMode.syncCollectionAndTokens();
		return added;
	}

	/**
	 * Unlocks a node and, if that node (or any newly unlocked neighbor) is a shop,
	 * also unlocks the shop's neighbors so shops on roads never block progression.
	 */
	static unlockNodeWithConnections(nodeId) {
		if (!StoryMode.save) return;
		const node = STORY_DATA.NODES[nodeId];
		if (!node) return;

		if (!StoryMode.save.unlockedNodes.includes(nodeId)) {
			StoryMode.save.unlockedNodes.push(nodeId);
		}

		(node.connections || []).forEach(connId => {
			if (!StoryMode.save.unlockedNodes.includes(connId)) {
				StoryMode.save.unlockedNodes.push(connId);
			}
			const connNode = STORY_DATA.NODES[connId];
			if (connNode && connNode.type === "shop") {
				if (!StoryMode.save.completedNodes.includes(connId)) {
					StoryMode.save.completedNodes.push(connId);
				}
				(connNode.connections || []).forEach(shopConnId => {
					if (!StoryMode.save.unlockedNodes.includes(shopConnId)) {
						StoryMode.save.unlockedNodes.push(shopConnId);
					}
				});
			}
		});
	}

	static getSlotKey(slotId = null) {
		const s = Number(slotId !== null ? slotId : (StoryMode.activeSlot || 1));
		return "gc-story-save-slot-" + s;
	}

	static migrateLegacySave() {
		try {
			const legacy = localStorage.getItem(StoryMode.SAVE_KEY);
			const slot1 = localStorage.getItem("gc-story-save-slot-1");
			if (!slot1 && legacy && legacy.length > 10) {
				const parsed = JSON.parse(legacy);
				parsed.slotId = 1;
				if (!parsed.updatedAt) parsed.updatedAt = Date.now();
				localStorage.setItem("gc-story-save-slot-1", JSON.stringify(parsed));
			}
			const savedActive = localStorage.getItem("gc-story-active-slot");
			if (savedActive) {
				const num = Number(savedActive);
				if (num >= 1 && num <= StoryMode.MAX_SLOTS) {
					StoryMode.activeSlot = num;
				}
			}
		} catch (e) {
			console.error("Error migrating legacy save:", e);
		}
	}

	static hasSave(slotId = null) {
		const targetSlot = slotId !== null ? Number(slotId) : StoryMode.activeSlot;
		let raw = localStorage.getItem(StoryMode.getSlotKey(targetSlot));
		if (!raw && targetSlot === 1) {
			raw = localStorage.getItem(StoryMode.SAVE_KEY);
		}
		return !!(raw && raw.length > 10);
	}

	static hasAnySave() {
		for (let s = 1; s <= StoryMode.MAX_SLOTS; s++) {
			if (StoryMode.hasSave(s)) return true;
		}
		const legacy = localStorage.getItem(StoryMode.SAVE_KEY);
		return !!(legacy && legacy.length > 10);
	}

	static getFirstEmptySlot() {
		for (let s = 1; s <= StoryMode.MAX_SLOTS; s++) {
			if (!StoryMode.hasSave(s)) return s;
		}
		return null;
	}

	static getAllSaves() {
		const saves = [];
		for (let s = 1; s <= StoryMode.MAX_SLOTS; s++) {
			let raw = localStorage.getItem(StoryMode.getSlotKey(s));
			if (!raw && s === 1) {
				raw = localStorage.getItem(StoryMode.SAVE_KEY);
			}
			if (raw && raw.length > 10) {
				try {
					const data = JSON.parse(raw);
					saves.push({ slot: s, empty: false, data: data });
				} catch (e) {
					saves.push({ slot: s, empty: true, data: null });
				}
			} else {
				saves.push({ slot: s, empty: true, data: null });
			}
		}
		return saves;
	}

	static updateContinueButton() {
		const continueBtn = document.getElementById("btn-story-continue");
		if (continueBtn) {
			if (StoryMode.hasAnySave()) {
				continueBtn.classList.remove("hide");
				continueBtn.onclick = () => StoryMode.openSavesModal();
				const textSpan = continueBtn.querySelector(".btn-text");
				if (textSpan) textSpan.textContent = "Carregar Jornada";
			} else {
				continueBtn.classList.add("hide");
			}
		}
	}

	static loadSave(slotId = null) {
		try {
			if (slotId !== null) {
				StoryMode.activeSlot = Number(slotId);
				localStorage.setItem("gc-story-active-slot", String(StoryMode.activeSlot));
			}
			let raw = localStorage.getItem(StoryMode.getSlotKey(StoryMode.activeSlot));
			if (!raw && StoryMode.activeSlot === 1) {
				raw = localStorage.getItem(StoryMode.SAVE_KEY);
			}
			if (raw) {
				StoryMode.save = JSON.parse(raw);
				StoryMode.save.slotId = StoryMode.activeSlot;
				if (!StoryMode.save.playerName) StoryMode.save.playerName = "Geralt de Rívia";
				if (!StoryMode.save.collection) StoryMode.save.collection = {};
				if (!StoryMode.save.trophies) StoryMode.save.trophies = [];
				if (!StoryMode.save.completedNodes) StoryMode.save.completedNodes = [];
				if (!StoryMode.save.winsCount) StoryMode.save.winsCount = {};
				if (!StoryMode.save.tournamentStates) StoryMode.save.tournamentStates = {};
				if (!StoryMode.save.tournamentStageCleared) StoryMode.save.tournamentStageCleared = {};
				if (!StoryMode.save.purchasedShopItems) StoryMode.save.purchasedShopItems = {};
				if (!StoryMode.save.stats) {
					StoryMode.save.stats = { matchesWon: 0, matchesLost: 0, crownsEarned: 0, crownsSpent: 0 };
				}
				if (!StoryMode.save.stats.factionWins) {
					StoryMode.save.stats.factionWins = { realms: 0, nilfgaard: 0, monsters: 0, scoiatael: 0, skellige: 0 };
					if (Array.isArray(StoryMode.save.completedNodes)) {
						StoryMode.save.completedNodes.forEach(nodeId => {
							const n = STORY_DATA.NODES[nodeId];
							if (n && n.type === "battle" && n.opponent && n.opponent.faction) {
								const f = n.opponent.faction;
								if (StoryMode.save.stats.factionWins[f] !== undefined) {
									StoryMode.save.stats.factionWins[f] = (StoryMode.save.stats.factionWins[f] || 0) + (StoryMode.save.winsCount[nodeId] || 1);
								}
							}
						});
					}
				}

				const faction = StoryMode.save.faction || (StoryMode.save.playerDeck && StoryMode.save.playerDeck.faction) || "realms";
				const defaultStartNode = (STORY_DATA.STARTER_NODES && STORY_DATA.STARTER_NODES[faction]) || "nr_white_orchard";

				if (!StoryMode.save.unlockedNodes || !Array.isArray(StoryMode.save.unlockedNodes)) {
					StoryMode.save.unlockedNodes = [defaultStartNode];
				}
				// Filter out obsolete node IDs from older map versions
				StoryMode.save.unlockedNodes = StoryMode.save.unlockedNodes.filter(id => !!STORY_DATA.NODES[id]);
				StoryMode.save.completedNodes = StoryMode.save.completedNodes.filter(id => !!STORY_DATA.NODES[id]);

				if (StoryMode.save.unlockedNodes.length === 0) {
					StoryMode.save.unlockedNodes = [defaultStartNode];
				}
				if (!StoryMode.save.currentNode || !STORY_DATA.NODES[StoryMode.save.currentNode]) {
					StoryMode.save.currentNode = StoryMode.save.unlockedNodes[0] || defaultStartNode;
				}

				StoryMode.syncCollectionAndTokens();
				StoryMode.updateContinueButton();
				return true;
			}
		} catch (e) {
			console.error("Error loading Story Mode save:", e);
		}
		return false;
	}

	static showAlert(message, title = "AVISO DO CONTINENTE", icon = "🐺") {
		if (typeof MenuController !== "undefined" && typeof MenuController.showAlert === "function") {
			MenuController.showAlert(message, title, icon);
		}
	}

	static saveGame() {
		if (!StoryMode.save) return;
		try {
			StoryMode.syncCollectionAndTokens();
			const slot = StoryMode.activeSlot || StoryMode.save.slotId || 1;
			StoryMode.save.slotId = slot;
			StoryMode.save.updatedAt = Date.now();
			const jsonStr = JSON.stringify(StoryMode.save);
			localStorage.setItem(StoryMode.getSlotKey(slot), jsonStr);
			if (slot === 1) {
				localStorage.setItem(StoryMode.SAVE_KEY, jsonStr);
			}
			localStorage.setItem("gc-story-active-slot", String(slot));

			StoryMode.updateContinueButton();

			if (typeof Achievements !== "undefined" && typeof Achievements.checkStoryAchievements === "function") {
				Achievements.checkStoryAchievements(StoryMode.save);
			}
		} catch (e) {
			console.error("Error saving Story Mode:", e);
		}
	}

	static createNewCampaign(playerName, difficulty, faction, slotId = 1) {
		const starter = STORY_DATA.STARTER_DECKS[faction];
		if (!starter) {
			StoryMode.showAlert("Facção inválida: " + faction, "ERRO DE FACÇÃO", "⚠️");
			return;
		}

		const targetSlot = Number(slotId || StoryMode.targetSlotForNewGame || 1);
		StoryMode.activeSlot = targetSlot;
		localStorage.setItem("gc-story-active-slot", String(targetSlot));

		// Determine faction-specific starting node on the Continent Map
		const startNodeId = (STORY_DATA.STARTER_NODES && STORY_DATA.STARTER_NODES[faction]) || "nr_white_orchard";

		// Build starting collection: 22 starter cards + starting leader (respecting max copy caps)
		const collection = {};
		collection[starter.leader] = 1;
		starter.cards.forEach(([idx, count]) => {
			const maxAllowed = StoryMode.getCardMaxCopies(idx);
			collection[idx] = Math.min(maxAllowed, (collection[idx] || 0) + count);
		});

		const playerDeck = {
			faction: faction,
			leader: starter.leader,
			cards: starter.cards.map(([idx, count]) => [idx, Math.min(StoryMode.getCardMaxCopies(idx), count)])
		};

		StoryMode.save = {
			slotId: targetSlot,
			playerName: playerName || "Geralt de Rívia",
			difficulty: difficulty || "medium",
			faction: faction,
			crowns: STORY_DATA.STARTING_CROWNS || 2000,
			currentNode: startNodeId,
			unlockedNodes: [startNodeId],
			completedNodes: [],
			winsCount: {},
			trophies: [],
			collection: collection,
			playerDeck: playerDeck,
			purchasedShopItems: {},
			tournamentStates: {},
			tournamentStageCleared: {},
			createdAt: Date.now(),
			updatedAt: Date.now(),
			stats: {
				matchesWon: 0,
				matchesLost: 0,
				crownsEarned: 2000,
				crownsSpent: 0,
				factionWins: {
					realms: 0,
					nilfgaard: 0,
					monsters: 0,
					scoiatael: 0,
					skellige: 0
				}
			}
		};

		StoryMode.unlockNodeWithConnections(startNodeId);
		StoryMode.syncCollectionAndTokens();
		StoryMode.saveGame();

		StoryMode.updateContinueButton();
		StoryMode.openMap();
	}

	static setupEventListeners() {
		// New Game setup faction card preview selection
		document.querySelectorAll(".story-faction-opt").forEach(opt => {
			opt.addEventListener("click", () => {
				document.querySelectorAll(".story-faction-opt").forEach(o => o.classList.remove("active"));
				opt.classList.add("active");
				StoryMode.updateFactionPreview(opt.dataset.faction);
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_switch");
				}
			});
		});

		// Map panning & dragging
		const mapContainer = document.getElementById("story-map-viewport");
		if (mapContainer) {
			mapContainer.addEventListener("mousedown", (e) => {
				if (e.target.closest(".story-map-pin, .story-map-control-btn, .story-modal, button")) return;
				StoryMode.isDragging = true;
				StoryMode.dragStartX = e.clientX - StoryMode.mapPanX;
				StoryMode.dragStartY = e.clientY - StoryMode.mapPanY;
				mapContainer.style.cursor = "grabbing";
			});

			window.addEventListener("mousemove", (e) => {
				if (!StoryMode.isDragging) return;
				StoryMode.mapPanX = e.clientX - StoryMode.dragStartX;
				StoryMode.mapPanY = e.clientY - StoryMode.dragStartY;
				StoryMode.clampPan();
				StoryMode.applyMapTransform();
			});

			window.addEventListener("mouseup", () => {
				if (StoryMode.isDragging) {
					StoryMode.isDragging = false;
					if (mapContainer) mapContainer.style.cursor = "grab";
				}
			});

			// Touch panning & Pinch-to-zoom on Mobile
			let isTouchPanning = false;
			let isTouchPinching = false;
			let touchStartX = 0;
			let touchStartY = 0;
			let touchPanStartX = 0;
			let touchPanStartY = 0;
			let touchMoved = false;
			let initialPinchDistance = 0;
			let initialPinchZoom = 1;
			let pinchMidX = 0;
			let pinchMidY = 0;

			const getTouchDistance = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
			const getTouchMidpoint = (t1, t2) => ({
				x: (t1.clientX + t2.clientX) / 2,
				y: (t1.clientY + t2.clientY) / 2
			});

			mapContainer.addEventListener("touchstart", (e) => {
				if (e.target.closest(".story-modal, .story-map-control-btn, .story-hud-bar, .story-stats-drawer, button")) return;

				if (e.touches.length === 1) {
					isTouchPanning = true;
					isTouchPinching = false;
					touchMoved = false;
					touchStartX = e.touches[0].clientX;
					touchStartY = e.touches[0].clientY;
					touchPanStartX = StoryMode.mapPanX;
					touchPanStartY = StoryMode.mapPanY;
				} else if (e.touches.length >= 2) {
					isTouchPanning = false;
					isTouchPinching = true;
					touchMoved = true;
					initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
					initialPinchZoom = StoryMode.mapZoom;
					const mid = getTouchMidpoint(e.touches[0], e.touches[1]);
					pinchMidX = mid.x;
					pinchMidY = mid.y;
					touchPanStartX = StoryMode.mapPanX;
					touchPanStartY = StoryMode.mapPanY;
					e.preventDefault();
				}
			}, { passive: false });

			window.addEventListener("touchmove", (e) => {
				if (!isTouchPanning && !isTouchPinching) return;

				if (isTouchPinching && e.touches.length >= 2) {
					e.preventDefault();
					const curDist = getTouchDistance(e.touches[0], e.touches[1]);
					if (initialPinchDistance > 0) {
						const pinchRatio = curDist / initialPinchDistance;
						const minZoom = StoryMode.getMinZoom();
						const maxZoom = 2.8;
						const targetZoom = Math.min(maxZoom, Math.max(minZoom, initialPinchZoom * pinchRatio));

						const rect = mapContainer.getBoundingClientRect();
						const mid = getTouchMidpoint(e.touches[0], e.touches[1]);
						const cursorX = mid.x - rect.left;
						const cursorY = mid.y - rect.top;

						const mapX = (cursorX - StoryMode.mapPanX) / StoryMode.mapZoom;
						const mapY = (cursorY - StoryMode.mapPanY) / StoryMode.mapZoom;

						StoryMode.mapZoom = targetZoom;
						StoryMode.mapPanX = cursorX - (mapX * targetZoom);
						StoryMode.mapPanY = cursorY - (mapY * targetZoom);

						// Also follow midpoint pan movement
						StoryMode.mapPanX += (mid.x - pinchMidX) * 0.6;
						StoryMode.mapPanY += (mid.y - pinchMidY) * 0.6;
						pinchMidX = mid.x;
						pinchMidY = mid.y;

						StoryMode.clampPan();
						StoryMode.applyMapTransform();
					}
				} else if (isTouchPanning && e.touches.length === 1) {
					const dx = e.touches[0].clientX - touchStartX;
					const dy = e.touches[0].clientY - touchStartY;
					if (!touchMoved && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
						touchMoved = true;
					}
					if (touchMoved) {
						e.preventDefault();
						StoryMode.mapPanX = touchPanStartX + dx;
						StoryMode.mapPanY = touchPanStartY + dy;
						StoryMode.clampPan();
						StoryMode.applyMapTransform();
					}
				}
			}, { passive: false });

			window.addEventListener("touchend", (e) => {
				if (e.touches.length === 0) {
					isTouchPanning = false;
					isTouchPinching = false;
					initialPinchDistance = 0;
				} else if (e.touches.length === 1) {
					isTouchPinching = false;
					isTouchPanning = true;
					touchStartX = e.touches[0].clientX;
					touchStartY = e.touches[0].clientY;
					touchPanStartX = StoryMode.mapPanX;
					touchPanStartY = StoryMode.mapPanY;
				}
			});

			window.addEventListener("touchcancel", () => {
				isTouchPanning = false;
				isTouchPinching = false;
				initialPinchDistance = 0;
			});

			// Map wheel zoom: exact cursor-centered zoom
			mapContainer.addEventListener("wheel", (e) => {
				e.preventDefault();
				const zoomDelta = e.deltaY < 0 ? 0.16 : -0.16;
				StoryMode.zoomMap(zoomDelta, e.clientX, e.clientY);
			}, { passive: false });

			window.addEventListener("resize", () => {
				StoryMode.clampPan();
				StoryMode.applyMapTransform();
			});
		}
	}

	static updateFactionPreview(faction) {
		const starter = STORY_DATA.STARTER_DECKS[faction];
		if (!starter || typeof card_dict === "undefined") return;

		const regionTextEl = document.getElementById("story-preview-region-text");
		if (regionTextEl && STORY_DATA.STARTER_REGIONS_INFO) {
			regionTextEl.textContent = STORY_DATA.STARTER_REGIONS_INFO[faction] || "Continente";
		}

		const leaderCard = card_dict[starter.leader];
		const leaderEl = document.getElementById("story-preview-leader");
		if (leaderEl && leaderCard) {
			leaderEl.style.backgroundImage = `url(img/lg/${leaderCard.deck}_${leaderCard.filename}.jpg)`;
			const nameEl = document.getElementById("story-preview-leader-name");
			if (nameEl) nameEl.textContent = leaderCard.name;
		}

		const listEl = document.getElementById("story-preview-cards-list");
		if (listEl) {
			listEl.innerHTML = "";
			starter.cards.forEach(([idx, count]) => {
				const card = card_dict[idx];
				if (!card) return;
				const item = document.createElement("div");
				item.className = "story-preview-card-item";
				item.innerHTML = `
					<div class="story-preview-card-thumb" style="background-image: url(img/sm/${card.deck}_${card.filename}.jpg)"></div>
					<div class="story-preview-card-info">
						<span class="story-preview-card-name">${card.name}</span>
						<span class="story-preview-card-meta">${card.strength ? '⚔ ' + card.strength : '★ Especial'} · x${count}</span>
					</div>
				`;
				listEl.appendChild(item);
			});
		}
	}

	static startNewCampaignFromMenu() {
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_click");
		}
		const emptySlot = StoryMode.getFirstEmptySlot();
		if (emptySlot !== null) {
			StoryMode.startNewGameDialog(emptySlot);
		} else {
			StoryMode.showAlert(
				"Todos os 5 slots de salvamento estão ocupados! Escolha uma campanha para continuar ou exclua um salvamento para liberar espaço para uma nova jornada.",
				"SLOTS ESGOTADOS",
				"img/hud-icons/Map.png"
			);
			StoryMode.openSavesModal();
		}
	}

	static startNewGameDialog(targetSlot = null) {
		const emptySlot = targetSlot !== null ? Number(targetSlot) : (StoryMode.getFirstEmptySlot() || 1);
		StoryMode.targetSlotForNewGame = emptySlot;

		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.add("hide");

		const savesModal = document.getElementById("story-saves-modal");
		if (savesModal) savesModal.classList.add("hide");

		const slotIndicator = document.getElementById("story-setup-slot-indicator");
		if (slotIndicator) {
			slotIndicator.textContent = `Salvando no Slot ${emptySlot} de ${StoryMode.MAX_SLOTS}`;
		}

		const nameInput = document.getElementById("story-player-name-input");
		if (nameInput) {
			nameInput.value = "Geralt de Rívia";
		}

		const setupView = document.getElementById("story-setup-view");
		if (setupView) {
			setupView.classList.remove("hide");
			const firstOpt = document.querySelector(".story-faction-opt[data-faction='realms']");
			if (firstOpt) firstOpt.click();
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_tab_open");
			}
		}
	}

	static confirmStartCampaign() {
		const nameInput = document.getElementById("story-player-name-input");
		const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Geralt de Rívia";

		const diffSelect = document.getElementById("story-diff-select");
		const difficulty = diffSelect ? diffSelect.value : "medium";

		const activeFactionOpt = document.querySelector(".story-faction-opt.active");
		const faction = activeFactionOpt ? activeFactionOpt.dataset.faction : "realms";

		const setupView = document.getElementById("story-setup-view");
		if (setupView) setupView.classList.add("hide");

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_slash");
		}

		const slot = StoryMode.targetSlotForNewGame || StoryMode.getFirstEmptySlot() || 1;
		StoryMode.createNewCampaign(name, difficulty, faction, slot);
	}

	static continueCampaign() {
		StoryMode.openSavesModal();
	}

	static openSavesModal() {
		const modal = document.getElementById("story-saves-modal");
		if (!modal) return;

		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.add("hide");

		StoryMode.renderSavesSlots();
		modal.classList.remove("hide");

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static closeSavesModal() {
		const modal = document.getElementById("story-saves-modal");
		if (modal) modal.classList.add("hide");

		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.remove("hide");

		if (typeof MenuController !== "undefined") {
			MenuController.showView("nav");
		}
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_back");
		}
	}

	static renderSavesSlots() {
		const listEl = document.getElementById("story-saves-slots-list");
		if (!listEl) return;
		listEl.innerHTML = "";

		const saves = StoryMode.getAllSaves();
		const factionNames = {
			realms: "Reinos do Norte",
			nilfgaard: "Império de Nilfgaard",
			monsters: "Monstros de Toussaint",
			scoiatael: "Scoia'tael",
			skellige: "Clãs de Skellige"
		};
		const factionBadges = {
			realms: "img/hud-icons/Temeria-Badge.png",
			nilfgaard: "img/hud-icons/Nilfgaard-Badge.png",
			monsters: "img/hud-icons/Toussaint-badge.png",
			scoiatael: "img/hud-icons/Medallion.png",
			skellige: "img/hud-icons/Skellige-Badge.png"
		};
		const diffNames = {
			easy: "Fácil",
			medium: "Normal",
			hard: "Difícil"
		};

		saves.forEach(s => {
			const card = document.createElement("div");
			if (s.empty) {
				card.className = "story-save-slot-card empty-slot";
				card.innerHTML = `
					<div class="slot-left-info">
						<span class="slot-badge empty">SLOT ${s.slot}</span>
						<div class="slot-details">
							<span style="font-size:0.92rem; color:#888; font-style:italic;">Slot Disponível — Nenhum progresso salvo</span>
						</div>
					</div>
					<div class="slot-actions">
						<button class="slot-create-btn" onclick="StoryMode.startNewGameDialog(${s.slot})">+ Nova Campanha</button>
					</div>
				`;
			} else {
				const d = s.data;
				const isActive = StoryMode.activeSlot === s.slot;
				card.className = `story-save-slot-card ${isActive ? 'active-slot' : ''}`;
				const fBadge = factionBadges[d.faction] || "img/hud-icons/Player.png";
				const fName = factionNames[d.faction] || d.faction || "Reinos do Norte";
				const diffName = diffNames[d.difficulty] || "Normal";
				const nodeName = (STORY_DATA.NODES[d.currentNode] && STORY_DATA.NODES[d.currentNode].name) || "Continente";
				const cardCount = d.collection ? Object.keys(d.collection).length : 22;
				const trophiesCount = Array.isArray(d.trophies) ? d.trophies.length : 0;
				const crownsFormatted = Number(d.crowns || 0).toLocaleString("pt-BR");
				const dateFormatted = d.updatedAt ? new Date(d.updatedAt).toLocaleDateString("pt-BR") : "Recente";

				card.innerHTML = `
					<div class="slot-left-info">
						<span class="slot-badge">SLOT ${s.slot}</span>
						<img src="${fBadge}" class="slot-crest-img" alt="${fName}" />
						<div class="slot-details">
							<div class="slot-player-name-row">
								<span class="slot-player-name">${d.playerName || 'Geralt de Rívia'}</span>
								${isActive ? '<span class="slot-active-tag">Ativo</span>' : ''}
							</div>
							<div class="slot-meta-row">
								<span>🛡️ ${fName}</span>
								<span>⚔️ ${diffName}</span>
								<span>📍 ${nodeName}</span>
								<span>📅 ${dateFormatted}</span>
							</div>
							<div class="slot-chips-row">
								<span class="slot-chip"><img src="img/hud-icons/Coin.png" alt="" /> <strong>${crownsFormatted}</strong> Coroas</span>
								<span class="slot-chip"><img src="img/hud-icons/Collection.png" alt="" /> <strong>${cardCount}</strong> / 216 Cartas</span>
								<span class="slot-chip"><img src="img/hud-icons/Tournament.png" alt="" /> <strong>${trophiesCount}</strong> / 5 Insígnias</span>
							</div>
						</div>
					</div>
					<div class="slot-actions">
						<button class="slot-play-btn" onclick="StoryMode.loadSlotAndPlay(${s.slot})">Continuar ⚔</button>
						<button class="slot-del-btn" onclick="StoryMode.promptDeleteSlot(${s.slot})" title="Excluir este salvamento">🗑</button>
					</div>
				`;
			}
			listEl.appendChild(card);
		});
	}

	static loadSlotAndPlay(slotId) {
		const s = Number(slotId);
		if (StoryMode.loadSave(s)) {
			const modal = document.getElementById("story-saves-modal");
			if (modal) modal.classList.add("hide");

			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_confirm");
			}

			StoryMode.openMap();
		} else {
			StoryMode.showAlert("Falha ao carregar o salvamento do Slot " + s, "ERRO AO CARREGAR", "⚠️");
		}
	}

	static promptDeleteSlot(slotId) {
		const s = Number(slotId);
		const raw = localStorage.getItem(StoryMode.getSlotKey(s)) || (s === 1 ? localStorage.getItem(StoryMode.SAVE_KEY) : null);
		let pName = "Campanha";
		if (raw) {
			try {
				const d = JSON.parse(raw);
				if (d.playerName) pName = d.playerName;
			} catch (e) {}
		}

		if (typeof MenuController !== "undefined" && typeof MenuController.showConfirm === "function") {
			MenuController.showConfirm(
				`Tem certeza de que deseja EXCLUIR permanentemente o Salvamento do Slot ${s} (${pName})?\n\nTodo o progresso, cartas colecionadas e coroas desta jornada serão perdidos.`,
				"EXCLUIR JORNADA",
				() => StoryMode.deleteSlot(s),
				null,
				"Sim, Excluir",
				"Cancelar",
				"img/hud-icons/Tournament.png"
			);
		} else {
			if (confirm(`Excluir permanentemente o Slot ${s} (${pName})?`)) {
				StoryMode.deleteSlot(s);
			}
		}
	}

	static deleteSlot(slotId) {
		const s = Number(slotId);
		try {
			localStorage.removeItem(StoryMode.getSlotKey(s));
			if (s === 1) {
				localStorage.removeItem(StoryMode.SAVE_KEY);
			}
			if (StoryMode.activeSlot === s) {
				StoryMode.save = null;
				let nextActive = 1;
				for (let i = 1; i <= StoryMode.MAX_SLOTS; i++) {
					if (StoryMode.hasSave(i)) {
						nextActive = i;
						break;
					}
				}
				StoryMode.activeSlot = nextActive;
				localStorage.setItem("gc-story-active-slot", String(nextActive));
				if (StoryMode.hasSave(nextActive)) {
					StoryMode.loadSave(nextActive);
				}
			}

			StoryMode.updateContinueButton();
			StoryMode.renderSavesSlots();

			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_slash");
			}
		} catch (e) {
			console.error("Error deleting slot:", e);
		}
	}

	static openMap() {
		if (!StoryMode.save) StoryMode.loadSave();
		if (!StoryMode.save) {
			StoryMode.startNewGameDialog();
			return;
		}

		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.add("hide");

		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) deckCustom.classList.add("hide");
		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.add("hide");

		// Ensure board gear and notification bell are hidden on the map screen
		const openSetBtn = document.getElementById("open-game-settings");
		if (openSetBtn) openSetBtn.classList.add("deck-menu");
		const toggleNotifBtn = document.getElementById("toggle-notifications");
		if (toggleNotifBtn) toggleNotifBtn.classList.add("deck-menu");

		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.remove("hide");

		StoryMode.syncCollectionAndTokens();
		if (typeof Achievements !== "undefined" && typeof Achievements.checkStoryAchievements === "function") {
			Achievements.checkStoryAchievements(StoryMode.save);
		}
		StoryMode.updateHUD();
		StoryMode.renderMapNodes();
		StoryMode.applyFilters();
		StoryMode.focusCurrentNode();

		if (typeof MusicManager !== "undefined") {
			MusicManager.playMapMusic();
		}
	}

	static closeMapToMenu() {
		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.add("hide");

		const padCursor = document.getElementById("story-gamepad-cursor");
		if (padCursor) padCursor.classList.add("hide");

		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.remove("hide");

		if (typeof MenuController !== "undefined") {
			MenuController.showView("nav");
		}
		if (typeof MusicManager !== "undefined") MusicManager.playMenuMusic();
	}

	static updateHUD() {
		if (!StoryMode.save) return;

		StoryMode.syncCollectionAndTokens();

		const nameEl = document.getElementById("story-hud-player-name");
		if (nameEl) nameEl.textContent = StoryMode.save.playerName;

		const crownsEl = document.getElementById("story-hud-crowns-val");
		if (crownsEl) crownsEl.textContent = Number(StoryMode.save.crowns || 0).toLocaleString("pt-BR");

		const defaultStart = (STORY_DATA.STARTER_NODES && STORY_DATA.STARTER_NODES[StoryMode.save.faction]) || "nr_white_orchard";
		const currentNodeData = STORY_DATA.NODES[StoryMode.save.currentNode] || STORY_DATA.NODES[defaultStart];
		const locationEl = document.getElementById("story-hud-location-name");
		if (locationEl && currentNodeData) {
			locationEl.textContent = `${currentNodeData.region} · ${currentNodeData.name}`;
		}

		const compendiumEl = document.getElementById("story-hud-compendium-val");
		if (compendiumEl) {
			const totalCards = 216;
			const ownedUnique = Object.keys(StoryMode.save.collection).filter(k => (StoryMode.save.collection[k] || 0) > 0).length;
			compendiumEl.textContent = `${ownedUnique} / ${totalCards}`;
		}

		// 5 Collectible Regional Insignias in HUD
		const trophiesEl = document.getElementById("story-hud-trophies-container");
		if (trophiesEl) {
			trophiesEl.innerHTML = "";
			const allTrophies = Object.values(STORY_DATA.TROPHIES);
			allTrophies.forEach(t => {
				const hasWon = StoryMode.save.trophies.includes(t.id);
				const badge = document.createElement("div");
				badge.className = `story-trophy-badge ${hasWon ? 'earned' : 'locked'}`;
				badge.title = hasWon
					? `★ ${t.title} (${t.region}): ${t.desc}`
					: `🔒 ${t.title} (${t.region}): Vença o Grande Torneio Regional de 7 lutas para conquistar!`;
				badge.innerHTML = `<img class="story-trophy-img" src="${t.image}" alt="${t.title}" />`;
				badge.onclick = () => {
					if (typeof MenuController !== "undefined" && MenuController.showAlert) {
						const statusMsg = hasWon
							? `★ Insígnia Conquistada!\n\n${t.desc}`
							: `🔒 Insígnia Bloqueada\n\nVença todas as 7 batalhas consecutivas do Grande Torneio Regional de ${t.region} para conquistar esta insígnia!`;
						MenuController.showAlert(statusMsg, t.title, t.image);
					}
				};
				trophiesEl.appendChild(badge);
			});
		}

		// Refresh player statistics drawer if open
		const drawer = document.getElementById("story-player-stats-drawer");
		if (drawer && !drawer.classList.contains("hide")) {
			StoryMode.updateStatsDrawer();
		}
	}

	static openAchievementsModal() {
		if (typeof MenuController !== "undefined" && typeof MenuController.showView === "function") {
			MenuController.showView("achievements");
			const mainMenu = document.getElementById("main-menu");
			if (mainMenu) {
				mainMenu.classList.remove("hide");
			}
		}
	}

	static renderMapNodes() {
		const nodesLayer = document.getElementById("story-map-nodes-layer");
		const svgRoads = document.getElementById("story-map-svg-roads");
		if (!nodesLayer || !svgRoads) return;

		nodesLayer.innerHTML = "";
		svgRoads.innerHTML = "";

		// 1. Draw SVG road connections
		const drawnEdges = new Set();
		Object.values(STORY_DATA.NODES).forEach(node => {
			(node.connections || []).forEach(targetId => {
				const target = STORY_DATA.NODES[targetId];
				if (!target) return;

				const edgeKey = [node.id, target.id].sort().join("--");
				if (drawnEdges.has(edgeKey)) return;
				drawnEdges.add(edgeKey);

				const isNodeUnlocked = StoryMode.save.unlockedNodes.includes(node.id);
				const isTargetUnlocked = StoryMode.save.unlockedNodes.includes(target.id);
				const isRoadUnlocked = isNodeUnlocked && isTargetUnlocked;

				const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
				line.setAttribute("x1", node.x);
				line.setAttribute("y1", node.y);
				line.setAttribute("x2", target.x);
				line.setAttribute("y2", target.y);
				line.setAttribute("class", `story-road-line ${isRoadUnlocked ? 'unlocked' : 'locked'}`);
				svgRoads.appendChild(line);
			});
		});

		// 2. Render Node Pins
		Object.values(STORY_DATA.NODES).forEach(node => {
			const isCompleted = StoryMode.save.completedNodes.includes(node.id);
			const isUnlocked = StoryMode.save.unlockedNodes.includes(node.id);
			const isCurrent = StoryMode.save.currentNode === node.id;
			const isAvailable = isUnlocked && !isCompleted;
			const isRegional = !!(node.type === "tournament" && node.isRegional);

			const pin = document.createElement("div");
			pin.id = `node-pin-${node.id}`;
			pin.dataset.nodeId = node.id;
			pin.className = `story-map-pin node-type-${node.type} ${isRegional ? 'regional-tourney' : ''} ${node.isWagerable ? 'wagerable' : ''} ${isCompleted ? 'completed' : ''} ${isAvailable ? 'available' : ''} ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`;
			pin.style.left = node.x + "px";
			pin.style.top = node.y + "px";

			let pinIcon = `<img class="pin-icon-img" src="img/hud-icons/Duel.png" alt="Batalha" />`;
			let statusBadge = "";

			if (node.type === "tournament") {
				const numRounds = (node.rounds || []).length;
				if (isCompleted) {
					pinIcon = `<img class="pin-icon-img" src="img/hud-icons/Checked.png" alt="Campeão" />`;
					statusBadge = `<span class="pin-status">✓ Campeão (${numRounds} Lutas)</span>`;
				} else if (isRegional) {
					pinIcon = `<img class="pin-icon-img tourney-regional-img" src="img/hud-icons/Region-Tournament.png" alt="Torneio Regional" />`;
					statusBadge = `<span class="pin-status tourney">👑 Torneio Regional (${numRounds} Lutas)</span>`;
				} else {
					pinIcon = `<img class="pin-icon-img tourney-pin-img" src="img/hud-icons/Tournament.png" alt="Torneio" />`;
					statusBadge = `<span class="pin-status tourney">★ Torneio (${numRounds} Lutas)</span>`;
				}
			} else if (node.type === "shop") {
				pinIcon = `<img class="pin-icon-img shop-pin-img" src="img/hud-icons/shop.png" alt="Loja" />`;
				statusBadge = '<span class="pin-status shop"><img class="pin-status-icon-img" src="img/hud-icons/shop.png" alt="" /> Mercador Regional</span>';
			} else if (isCompleted) {
				pinIcon = `<img class="pin-icon-img" src="img/hud-icons/Checked.png" alt="Concluído" />`;
				statusBadge = '<span class="pin-status">✓ Concluído</span>';
			} else if (!isUnlocked) {
				pinIcon = "🔒";
				statusBadge = '<span class="pin-status locked">Bloqueado</span>';
			} else if (node.isWagerable) {
				pinIcon = `<img class="pin-icon-img" src="img/hud-icons/Duel.png" alt="Confronto Apostável" />`;
				statusBadge = '<span class="pin-status wagerable">🎲 Confronto Apostável</span>';
			} else {
				pinIcon = `<img class="pin-icon-img" src="img/hud-icons/Duel.png" alt="Batalha de Gwent" />`;
				statusBadge = '<span class="pin-status" style="color:#ffd700;">⚔ Batalha de Gwent</span>';
			}

			pin.innerHTML = `
				${isCurrent ? '<div class="pin-wolf-avatar" title="Posição Atual do Geralt"></div>' : ''}
				<div class="pin-badge">
					<span class="pin-icon">${pinIcon}</span>
				</div>
				<div class="pin-label">
					<span class="pin-name">${node.name}</span>
					${statusBadge}
				</div>
			`;

			pin.addEventListener("click", () => {
				StoryMode.onNodeClicked(node.id);
			});

			pin.addEventListener("mouseenter", () => {
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					AudioManager.playSFX("witcher_hover");
				}
			});

			nodesLayer.appendChild(pin);
		});
	}

	static onNodeClicked(nodeId) {
		const node = STORY_DATA.NODES[nodeId];
		if (!node) return;

		const isUnlocked = StoryMode.save.unlockedNodes.includes(nodeId);
		if (!isUnlocked) {
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("warning");
			}
			StoryMode.showAlert(
				`Localização trancada! Vença os desafios anteriores conectados no mapa para desbloquear o caminho até ${node.name}.`,
				"LOCALIZAÇÃO TRANCADA",
				"🔒"
			);
			return;
		}

		// Move player marker to this node
		StoryMode.save.currentNode = nodeId;

		// If visiting a shop node, mark it visited and unlock its connected road neighbors
		if (node.type === "shop") {
			if (!StoryMode.save.completedNodes.includes(nodeId)) {
				StoryMode.save.completedNodes.push(nodeId);
			}
			StoryMode.unlockNodeWithConnections(nodeId);
		}

		StoryMode.saveGame();
		StoryMode.updateHUD();
		StoryMode.renderMapNodes();
		StoryMode.applyFilters();

		// Open appropriate modal based on node type
		if (node.type === "tournament") {
			StoryMode.openTournamentModal(nodeId);
		} else if (node.type === "shop") {
			StoryMode.openShopModal(nodeId);
		} else {
			StoryMode.openBattleModal(nodeId);
		}
	}

	static openBattleModal(nodeId) {
		const node = STORY_DATA.NODES[nodeId];
		if (!node) return;

		const modal = document.getElementById("story-battle-modal");
		if (!modal) return;

		const isCompleted = StoryMode.save.completedNodes.includes(nodeId);

		document.getElementById("story-battle-title").textContent = node.name;
		document.getElementById("story-battle-region").textContent = `${node.region} · Desafio de Gwent`;
		document.getElementById("story-battle-lore").textContent = node.lore;
		document.getElementById("story-battle-op-name").textContent = node.opponent.name;

		const avatarEl = document.getElementById("story-battle-op-avatar");
		if (avatarEl) avatarEl.style.backgroundImage = `url(${node.opponent.avatar})`;

		const factionBadge = document.getElementById("story-battle-op-faction");
		if (factionBadge) {
			const factionNames = {
				realms: "Reinos do Norte",
				nilfgaard: "Império de Nilfgaard",
				monsters: "Monstros",
				scoiatael: "Scoia'tael",
				skellige: "Skellige"
			};
			factionBadge.textContent = factionNames[node.opponent.faction] || node.opponent.faction;
			factionBadge.className = `story-faction-badge ${node.opponent.faction}`;
		}

		const firstWinCrowns = node.crownsReward || 220;
		const replayCrowns = node.crownsReplay || 55;
		const lossCrowns = node.crownsLoss || 45;

		const coinImg = '<img src="img/hud-icons/Coin.png" class="coin-icon-small" alt="Coroas" />';
		document.getElementById("story-battle-reward-first").innerHTML = `${coinImg} +${Number(firstWinCrowns).toLocaleString("pt-BR")} Coroas`;
		document.getElementById("story-battle-reward-replay").innerHTML = `${coinImg} +${Number(replayCrowns).toLocaleString("pt-BR")} Coroas`;
		document.getElementById("story-battle-loss-penalty").innerHTML = `${coinImg} -${Number(lossCrowns).toLocaleString("pt-BR")} Coroas`;

		StoryMode.selectedWager = 0;
		const wagerBox = document.getElementById("story-battle-wager-container");
		if (wagerBox) {
			if (node.isWagerable) {
				wagerBox.classList.remove("hide");
				const playerCrowns = StoryMode.save.crowns || 0;
				const minWager = node.wagerMin || 50;
				const maxWager = node.wagerMax || 500;
				const maxAffordable = Math.min(maxWager, playerCrowns);
				const canAffordMin = playerCrowns >= minWager;

				const slider = document.getElementById("story-wager-slider");
				const displayEl = document.getElementById("story-wager-amount-display");
				const payoutEl = document.getElementById("story-wager-payout-text");
				const btnMin = document.getElementById("story-wager-btn-min");
				const btnMax = document.getElementById("story-wager-btn-max");
				const btnMinus = document.getElementById("story-wager-btn-minus");
				const btnPlus = document.getElementById("story-wager-btn-plus");
				const step = 25;

				if (slider) {
					slider.min = "0";
					slider.max = String(Math.max(0, maxAffordable));
					slider.step = String(step);
					slider.value = "0";
					slider.disabled = !canAffordMin;
				}

				const updateWagerDisplay = (val) => {
					val = Math.max(0, Math.min(Number(val), maxAffordable));
					if (val > 0 && val < minWager) {
						val = minWager;
					}
					StoryMode.selectedWager = val;
					if (slider) slider.value = String(val);

					if (displayEl) {
						displayEl.textContent = val > 0 ? `${Number(val).toLocaleString("pt-BR")} Coroas` : `0 Coroas (Sem Aposta)`;
					}

					if (payoutEl) {
						if (!canAffordMin) {
							payoutEl.innerHTML = `<span style="color:#e74c3c;">Coroas insuficientes para apostar (mín. ${minWager}).</span>`;
						} else if (val === 0) {
							payoutEl.innerHTML = `<span style="color:#aaa;">Sem aposta adicional. Ganho padrão: +${firstWinCrowns} / +${replayCrowns}.</span>`;
						} else {
							const winBase = isCompleted ? replayCrowns : firstWinCrowns;
							const winTotal = (val * 2) + winBase;
							payoutEl.innerHTML = `<span style="color:#2ecc71;">Vitória: +${winTotal.toLocaleString("pt-BR")} Coroas</span> <span style="color:#888;">|</span> <span style="color:#e74c3c;">Derrota: -${val.toLocaleString("pt-BR")} Coroas</span>`;
						}
					}
				};

				if (slider) {
					slider.oninput = (e) => updateWagerDisplay(e.target.value);
				}
				if (btnMin) {
					btnMin.onclick = () => updateWagerDisplay(canAffordMin ? minWager : 0);
				}
				if (btnMax) {
					btnMax.onclick = () => updateWagerDisplay(canAffordMin ? maxAffordable : 0);
				}
				if (btnMinus) {
					btnMinus.onclick = () => {
						const cur = Number(slider ? slider.value : StoryMode.selectedWager) || 0;
						let next = cur - step;
						if (next < minWager) next = 0;
						updateWagerDisplay(next);
					};
				}
				if (btnPlus) {
					btnPlus.onclick = () => {
						const cur = Number(slider ? slider.value : StoryMode.selectedWager) || 0;
						let next = cur === 0 ? minWager : cur + step;
						updateWagerDisplay(next);
					};
				}

				updateWagerDisplay(0);
			} else {
				wagerBox.classList.add("hide");
			}
		}

		const cardDropBox = document.getElementById("story-battle-card-drop-box");
		if (cardDropBox) {
			if (node.cardDrop && typeof card_dict !== "undefined") {
				const cardData = card_dict[node.cardDrop.index];
				if (cardData) {
					cardDropBox.innerHTML = `
						<div class="story-drop-preview ${isCompleted ? 'already-won' : 'new-card'}">
							<div class="story-drop-thumb" style="background-image: url(img/sm/${cardData.deck}_${cardData.filename}.jpg)"></div>
							<div class="story-drop-info">
								<span class="story-drop-label">${isCompleted ? '✓ Carta Já Conquistada' : '★ Carta em Disputa (1ª Vitória)'}</span>
								<strong class="story-drop-name">${cardData.name}</strong>
								<span class="story-drop-stats">${cardData.strength ? '⚔ ' + cardData.strength : '★ Especial'} · ${cardData.ability || 'Tropa Padrão'}</span>
							</div>
						</div>
					`;
				}
			} else {
				cardDropBox.innerHTML = `<span class="text-muted">Apenas Coroas como recompensa.</span>`;
			}
		}

		const playBtn = document.getElementById("story-battle-start-btn");
		if (playBtn) {
			playBtn.innerHTML = `<img class="btn-hud-icon" src="img/hud-icons/Duel.png" alt="Duelo" /> Jogar Gwent`;
			playBtn.onclick = () => {
				StoryMode.closeAllModals();
				StoryMode.startMatch(nodeId);
			};
		}

		modal.classList.remove("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static openTournamentModal(nodeId) {
		const node = STORY_DATA.NODES[nodeId];
		if (!node) return;

		const modal = document.getElementById("story-tournament-modal");
		if (!modal) return;

		const isCompleted = StoryMode.save.completedNodes.includes(nodeId);
		const totalRounds = (node.rounds || []).length;
		const isRegional = !!node.isRegional;

		// Consecutive tournament rule: entering from the map always starts at Battle 1
		StoryMode.save.tournamentStates[nodeId] = { roundIndex: 0, active: false };

		document.getElementById("story-tourney-title").textContent = node.name;
		const subEl = document.getElementById("story-tourney-subtitle");
		if (subEl) {
			subEl.textContent = isRegional
				? `★ Grande Torneio Regional Supremo · ${totalRounds} Batalhas Seguidas sem Perder ★`
				: `Disputa Oficial · ${totalRounds} Batalhas Consecutivas`;
		}

		document.getElementById("story-tourney-lore").textContent = node.lore;
		const tourneyCoinImg = '<img src="img/hud-icons/Coin.png" class="coin-icon-small" alt="Coroas" />';
		document.getElementById("story-tourney-fee").innerHTML = `${tourneyCoinImg} ${Number(node.entryFee || 0).toLocaleString("pt-BR")} Coroas`;
		document.getElementById("story-tourney-prize").innerHTML = `${tourneyCoinImg} ${Number(node.grandPrizeCrowns || 0).toLocaleString("pt-BR")} Coroas`;

		// Support multiple Grand Prize Cards (1 card for 2-match, 2 cards for 3-match, 3 cards for 5-match, 1 Leader for 7-match Regional)
		const prizeCards = node.grandPrizeCards || (node.grandPrizeCard ? [node.grandPrizeCard] : []);
		const grandCardEl = document.getElementById("story-tourney-grand-card");
		if (grandCardEl && typeof card_dict !== "undefined") {
			if (prizeCards.length > 0) {
				grandCardEl.style.flexDirection = "column";
				grandCardEl.style.alignItems = "stretch";
				const headerLabel = isCompleted
					? `✓ Cartas de Prêmio Já Conquistadas (${prizeCards.length})`
					: `🏆 Prêmio de Campeão (${prizeCards.length} ${prizeCards.length === 1 ? 'Carta' : 'Cartas'})`;
				const cardsHtml = prizeCards.map(pc => {
					const c = card_dict[pc.index];
					if (!c) return "";
					const isLeader = c.row === "leader";
					return `
						<div style="display:flex; gap:10px; align-items:center; background:rgba(20,15,10,0.75); border:1px solid ${isLeader ? '#ffd700' : 'rgba(197,160,89,0.4)'}; padding:6px 10px; border-radius:4px;">
							<div class="story-tourney-card-thumb" style="width:42px; height:58px; flex-shrink:0; background-image: url(img/sm/${c.deck}_${c.filename}.jpg)"></div>
							<div style="display:flex; flex-direction:column;">
								<strong style="color:#fff; font-size:0.88rem;">${c.name}</strong>
								<small style="color:#c5a059; font-size:0.76rem;">${isLeader ? '👑 Carta de Líder' : (c.strength ? '⚔ Força ' + c.strength : '★ Especial')} · ${c.deck}</small>
							</div>
						</div>
					`;
				}).join("");
				grandCardEl.innerHTML = `
					<div style="font-size:0.8rem; font-weight:bold; color:#ffd700; margin-bottom:4px;">${headerLabel}</div>
					<div style="display:flex; flex-direction:column; gap:6px; max-height:150px; overflow-y:auto;">${cardsHtml}</div>
				`;
			} else {
				grandCardEl.innerHTML = "";
			}
		}

		// Regional Insignia Preview (for the 5 Regional Tournaments)
		const trophyData = node.trophyId ? STORY_DATA.TROPHIES[node.trophyId] : null;
		const trophyEl = document.getElementById("story-tourney-trophy-preview");
		if (trophyEl) {
			if (trophyData) {
				trophyEl.innerHTML = `
					<div class="story-tourney-trophy-badge ${isCompleted ? 'earned' : ''}" style="display:flex; align-items:center; gap:14px; background:rgba(30,18,12,0.92); border:1.5px solid #ffd700; padding:10px 16px; border-radius:6px; margin-top:8px; box-shadow:0 0 14px rgba(255,215,0,0.3);">
						<img src="${trophyData.image}" alt="${trophyData.title}" class="trophy-preview-img" style="width:52px; height:52px; object-fit:contain; filter:drop-shadow(0 0 10px rgba(255,215,0,0.85));" />
						<div class="trophy-text" style="display:flex; flex-direction:column;">
							<strong style="color:#ffd700; font-size:0.98rem; letter-spacing:0.5px;">${trophyData.title}</strong>
							<small style="color:#e0d0b0; font-size:0.8rem; margin-top:2px;">${isCompleted ? '✓ Insígnia Já Conquistada em seu Painel!' : '★ Insígnia Regional Colecionável — Conquistada ao Vencer as 7 Lutas!'}</small>
						</div>
					</div>
				`;
			} else {
				trophyEl.innerHTML = `
					<div style="background:rgba(20,16,12,0.75); border:1px solid rgba(197,160,89,0.35); padding:8px 12px; border-radius:4px; font-size:0.8rem; color:#c5a059;">
						⚔ <strong>Regra de Eliminatória Seguida:</strong> Você enfrentará os ${totalRounds} oponentes em sequência sem voltar ao mapa. Se perder uma partida, o torneio reinicia da 1ª luta!
					</div>
				`;
			}
		}

		// Rounds status list showing first-time vs repeat stage rewards
		const roundsContainer = document.getElementById("story-tourney-rounds-list");
		if (roundsContainer) {
			roundsContainer.innerHTML = "";
			const factionNames = {
				realms: "Reinos do Norte",
				nilfgaard: "Nilfgaard",
				monsters: "Monstros",
				scoiatael: "Scoia'tael",
				skellige: "Skellige"
			};
			node.rounds.forEach((rnd, idx) => {
				const stageKey = `${nodeId}_r${idx}`;
				const stageAlreadyCleared = !!(StoryMode.save.tournamentStageCleared && StoryMode.save.tournamentStageCleared[stageKey]);
				const stageCrowns = stageAlreadyCleared ? (node.roundWinCrownsRepeat || 40) : (node.roundWinCrownsFirst || 300);
				const statusIcon = stageAlreadyCleared
					? `<img src="img/hud-icons/Checked.png" class="round-status-icon-img" alt="Vencida" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;" />`
					: `<img src="img/hud-icons/Coin.png" class="coin-icon-small" alt="" /> `;

				const roundBox = document.createElement("div");
				roundBox.className = `story-tourney-round-box ${stageAlreadyCleared ? 'won' : ''}`;
				roundBox.innerHTML = `
					<div class="round-num" style="font-weight:bold; color:#ffd700;">Batalha ${idx + 1}/${totalRounds}</div>
					<div class="round-op-name" style="color:#fff;">${rnd.opponentName} <span style="color:#c5a059; font-size:0.82rem;">(${factionNames[rnd.faction] || rnd.faction})</span></div>
					<div class="round-status" style="font-size:0.82rem; color:${stageAlreadyCleared ? '#aaa' : '#2ecc71'};">
						${statusIcon}+${stageCrowns} Coroas ${stageAlreadyCleared ? '(2ª+ tentativa)' : '(1ª vitória)'}
					</div>
				`;
				roundsContainer.appendChild(roundBox);
			});
		}

		const enterBtn = document.getElementById("story-tourney-enter-btn");
		if (enterBtn) {
			const btnIcon = isRegional ? "img/hud-icons/Region-Tournament.png" : "img/hud-icons/Tournament.png";
			const label = isCompleted
				? `Rejogar Torneio (${node.entryFee} Coroas)`
				: `Pagar Inscrição (${node.entryFee} Coroas) & Iniciar 1/${totalRounds}`;
			enterBtn.innerHTML = `<img class="btn-hud-icon" src="${btnIcon}" alt="Torneio" /> ${label}`;

			enterBtn.onclick = () => {
				if (StoryMode.save.crowns < node.entryFee) {
					if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
						AudioManager.playSFX("warning");
					}
					StoryMode.showAlert(
						`Coroas insuficientes! Você precisa de ${node.entryFee} Coroas para pagar a taxa de inscrição deste torneio.`,
						"COROAS INSUFICIENTES",
						"img/hud-icons/Coin.png"
					);
					return;
				}
				StoryMode.save.crowns -= node.entryFee;
				StoryMode.save.stats.crownsSpent = (StoryMode.save.stats.crownsSpent || 0) + node.entryFee;
				StoryMode.save.tournamentStates[nodeId] = { roundIndex: 0, active: true };
				StoryMode.saveGame();
				StoryMode.updateHUD();

				StoryMode.closeAllModals();
				StoryMode.startMatch(nodeId, 0);
			};
		}

		modal.classList.remove("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static openShopModal(shopNodeId) {
		const shopData = STORY_DATA.SHOPS[shopNodeId];
		if (!shopData) return;

		const modal = document.getElementById("story-shop-modal");
		if (!modal) return;

		StoryMode.syncCollectionAndTokens();

		document.getElementById("story-shop-title").innerHTML = `<img src="img/hud-icons/shop.png" class="modal-title-icon-img" alt="Loja" /> ${shopData.name}`;
		document.getElementById("story-shop-region").textContent = `${shopData.region} · Mercado Livre`;
		document.getElementById("story-shop-greeting").textContent = `"${shopData.greeting}"`;
		document.getElementById("story-shop-player-crowns").textContent = Number(StoryMode.save.crowns || 0).toLocaleString("pt-BR");

		const itemsGrid = document.getElementById("story-shop-items-grid");
		if (itemsGrid && typeof card_dict !== "undefined") {
			itemsGrid.innerHTML = "";
			shopData.items.forEach((item, itemIdx) => {
				const card = card_dict[item.cardIndex];
				if (!card) return;

				const purchaseKey = `${shopData.id}_${itemIdx}`;
				const boughtCount = StoryMode.save.purchasedShopItems[purchaseKey] || 0;
				const maxAllowed = StoryMode.getCardMaxCopies(item.cardIndex);
				const ownedCount = StoryMode.save.collection[item.cardIndex] || 0;

				// Clamp shop stock so the player can NEVER exceed the max allowed copies of any card
				const remainingStock = Math.max(0, Math.min(item.max - boughtCount, maxAllowed - ownedCount));
				const canAfford = StoryMode.save.crowns >= item.price;
				const isSoldOut = remainingStock <= 0;
				const isLeader = card.row === "leader";

				const reqStatus = StoryMode.checkItemRequirement(item);
				const isLockedReq = !reqStatus.met;

				const itemEl = document.createElement("div");
				itemEl.className = `story-shop-card ${isSoldOut ? 'sold-out' : ''} ${isLockedReq ? 'locked-req' : ''}`;
				itemEl.title = "Clique na carta para inspecionar arte e detalhes";

				let reqBadgeHtml = "";
				if (item.requirement) {
					reqBadgeHtml = `<div class="shop-card-req" title="${reqStatus.desc}">${reqStatus.met ? '✓ Liberado' : '🔒 ' + reqStatus.desc + ' (' + reqStatus.current + '/' + reqStatus.target + ')'}</div>`;
				}

				let btnText = "Comprar";
				let btnDisabled = false;
				if (isSoldOut) {
					btnText = (ownedCount >= maxAllowed) ? "Coleção Cheia" : "Esgotado";
					btnDisabled = true;
				} else if (isLockedReq) {
					btnText = "Bloqueado 🔒";
					btnDisabled = true;
				} else if (!canAfford) {
					btnText = "Sem Coroas";
					btnDisabled = true;
				}

				itemEl.innerHTML = `
					<div class="shop-card-preview" style="background-image: url(img/sm/${card.deck}_${card.filename}.jpg)">
						<span class="shop-card-power">${isLeader ? '👑' : (card.strength || '★')}</span>
					</div>
					<div class="shop-card-info">
						<strong class="shop-card-name">${card.name}</strong>
						<span class="shop-card-faction">${card.deck.toUpperCase()} · ${isLeader ? 'Líder' : (card.ability || 'Unidade')}</span>
						<div class="shop-card-price"><img src="img/hud-icons/Coin.png" class="shop-coin-img" alt="Coroas" /> ${Number(item.price).toLocaleString("pt-BR")} Coroas</div>
						${reqBadgeHtml}
						<div class="shop-card-stock">${isSoldOut ? (ownedCount >= maxAllowed ? 'COLEÇÃO MÁXIMA' : 'ESGOTADO') : `Estoque: ${remainingStock} (Você: ${ownedCount}/${maxAllowed})`}</div>
					</div>
					<button class="witcher-menu-btn shop-buy-btn" ${btnDisabled ? 'disabled' : ''}>
						${btnText}
					</button>
				`;

				// Clicking the card anywhere opens the inspection view
				itemEl.addEventListener("click", () => {
					StoryMode.inspectShopCard(card, item, shopData.id, itemIdx);
				});

				const buyBtn = itemEl.querySelector(".shop-buy-btn");
				if (buyBtn && !btnDisabled) {
					buyBtn.addEventListener("click", (e) => {
						e.stopPropagation();
						StoryMode.promptBuyConfirmation(shopData.id, itemIdx, item, card);
					});
				}

				itemsGrid.appendChild(itemEl);
			});
		}

		modal.classList.remove("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static promptBuyConfirmation(shopId, itemIdx, item, card) {
		const reqStatus = StoryMode.checkItemRequirement(item);
		if (!reqStatus.met) {
			StoryMode.showAlert(
				`Esta carta está bloqueada!\n\nCritério necessário:\n${reqStatus.desc} (${reqStatus.current}/${reqStatus.target})`,
				"REQUISITO BLOQUEADO",
				"🔒"
			);
			return;
		}

		if (StoryMode.save.crowns < item.price) {
			StoryMode.showAlert("Coroas insuficientes para adquirir esta carta!", "COROAS INSUFICIENTES", "img/hud-icons/Coin.png");
			return;
		}

		if (typeof MenuController !== "undefined" && typeof MenuController.showConfirm === "function") {
			MenuController.showConfirm(
				`Deseja comprar a carta "${card.name}" por ${Number(item.price).toLocaleString("pt-BR")} Coroas?\n\nEla será adicionada à sua coleção permanente do Continente.`,
				"CONFIRMAR COMPRA",
				() => StoryMode.buyShopItem(shopId, itemIdx, item),
				null,
				"Comprar Carta",
				"Cancelar",
				"img/hud-icons/Coin.png"
			);
		} else {
			StoryMode.buyShopItem(shopId, itemIdx, item);
		}
	}

	static buyShopItem(shopId, itemIdx, item) {
		if (StoryMode.save.crowns < item.price) {
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("warning");
			}
			StoryMode.showAlert("Coroas insuficientes para adquirir esta carta!", "COROAS INSUFICIENTES", "img/hud-icons/Coin.png");
			return;
		}

		const purchaseKey = `${shopId}_${itemIdx}`;
		const currentBought = StoryMode.save.purchasedShopItems[purchaseKey] || 0;
		const maxAllowed = StoryMode.getCardMaxCopies(item.cardIndex);
		const ownedCount = StoryMode.save.collection[item.cardIndex] || 0;

		if (currentBought >= item.max || ownedCount >= maxAllowed) {
			StoryMode.showAlert(
				"Você já possui o limite máximo desta carta na sua coleção!",
				"COLEÇÃO MÁXIMA",
				"🃏"
			);
			return;
		}

		StoryMode.save.crowns -= item.price;
		StoryMode.save.stats.crownsSpent = (StoryMode.save.stats.crownsSpent || 0) + item.price;
		StoryMode.save.purchasedShopItems[purchaseKey] = currentBought + 1;

		StoryMode.awardCardToCollection(item.cardIndex, 1);

		StoryMode.saveGame();
		StoryMode.updateHUD();

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}

		StoryMode.openShopModal(shopId);

		// If inspect modal is open, refresh it as well
		const inspectModal = document.getElementById("story-card-inspect-modal");
		if (inspectModal && !inspectModal.classList.contains("hide") && typeof card_dict !== "undefined") {
			const card = card_dict[item.cardIndex];
			if (card) {
				StoryMode.inspectShopCard(card, item, shopId, itemIdx);
			}
		}
	}

	static checkItemRequirement(item) {
		if (!item || !item.requirement) {
			return { met: true, current: 0, target: 0, desc: "" };
		}
		const req = item.requirement;
		const stats = (StoryMode.save && StoryMode.save.stats) || {};
		const factionWins = stats.factionWins || {};

		let current = 0;
		let target = req.count || 1;
		let met = false;

		switch (req.type) {
			case "faction_wins":
				current = factionWins[req.faction] || 0;
				met = current >= target;
				break;
			case "total_wins":
				current = stats.matchesWon || 0;
				met = current >= target;
				break;
			case "tourneys_won":
				const tourneysWon = (StoryMode.save.completedNodes || []).filter(id => {
					const n = STORY_DATA.NODES[id];
					return n && n.type === "tournament";
				}).length;
				current = tourneysWon;
				met = current >= target;
				break;
			case "trophy":
				const hasTrophy = (StoryMode.save.trophies || []).includes(req.trophy);
				current = hasTrophy ? 1 : 0;
				target = 1;
				met = hasTrophy;
				break;
			default:
				met = true;
				break;
		}

		return {
			met: met,
			current: current,
			target: target,
			desc: req.desc || ""
		};
	}

	static getCardAbilityDescription(card) {
		if (!card) return { title: "Carta", desc: "Sem informações." };

		if (card.row === "leader") {
			const leaderDescKey = `ability_${card.ability}_desc`;
			let leaderDesc = (typeof I18N !== "undefined" && I18N.t) ? I18N.t(leaderDescKey) : "";
			if (!leaderDesc || leaderDesc === leaderDescKey) {
				const leaderFallbacks = {
					foltest_king: "Pega uma carta Névoa Impenetrável do seu baralho e joga-a instantaneamente.",
					foltest_lord: "Limpa quaisquer efeitos climáticos (Frio Congelante, Chuva Torrencial ou Névoa Impenetrável) em jogo.",
					foltest_siegemaster: "Dobra a força de todas as suas unidades de cerco (a menos que uma Corneta do Comandante já esteja presente nessa fileira).",
					foltest_steelforged: "Destrói a(s) unidade(s) de cerco mais forte(s) do inimigo se a força total de cerco dele for 10 ou mais.",
					foltest_son: "Destrói a(s) unidade(s) de longa distância mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais.",
					emhyr_imperial: "Pega uma carta Chuva Torrencial do seu baralho e joga-a instantaneamente.",
					emhyr_emperor: "Olha 3 cartas aleatórias da mão do seu adversário.",
					emhyr_whiteflame: "Cancela a habilidade de líder do seu adversário.",
					emhyr_relentless: "Compra uma carta da pilha de descarte do adversário.",
					emhyr_invader: "Habilidades que ressuscitam uma unidade no campo ressuscitam uma unidade aleatória. Afeta ambos os jogadores.",
					eredin_commander: "Dobra a força de todas as suas unidades de combate corpo a corpo (a menos que uma Corneta do Comandante já esteja presente nessa fileira).",
					eredin_bringer_of_death: "Devolve uma carta da sua pilha de descarte para a sua mão.",
					eredin_destroyer: "Descarta 2 cartas e compra 1 carta à sua escolha do seu baralho.",
					eredin_king: "Pega qualquer carta climática do seu baralho e joga-a instantaneamente.",
					eredin_treacherous: "Dobra a força de todas as cartas de espião (afeta ambos os jogadores).",
					francesca_queen: "Destrói a(s) unidade(s) de combate corpo a corpo mais forte(s) do inimigo se a força total corpo a corpo dele for 10 ou mais.",
					francesca_beautiful: "Dobra a força de todas as suas unidades de combate à distância (a menos que uma Corneta do Comandante já esteja presente nessa fileira).",
					francesca_daisy: "Compra uma carta extra no início da batalha.",
					francesca_pureblood: "Pega uma carta Frio Congelante do seu baralho e joga-a instantaneamente.",
					francesca_hope: "Move unidades ágeis para a fileira que maximiza sua força.",
					crach_an_craite: "Embaralha todas as cartas dos cemitérios de ambos os jogadores de volta para seus baralhos.",
					king_bran: "Unidades perdem apenas metade da sua Força sob condições climáticas adversas."
				};
				leaderDesc = leaderFallbacks[card.ability] || "Habilidade tática única exercida pelo comandante do exército.";
			}
			return {
				title: "Habilidade de Líder",
				desc: leaderDesc
			};
		}

		if (!card.ability || card.ability.trim() === "") {
			return {
				title: "Tropa Regular",
				desc: "Esta unidade não possui habilidades mágicas ou especiais adicionais. Seu valor em combate baseia-se exclusivamente em sua pontuação de Força."
			};
		}

		const abilityTokens = card.ability.trim().split(/\s+/);
		const titles = [];
		const descs = [];

		const abilityDictionary = {
			hero: {
				name: "Herói Lendário",
				desc: "Não é afetado por nenhuma carta especial, clima ou habilidades de outras cartas."
			},
			spy: {
				name: "Espião",
				desc: "Colocado no campo de batalha do oponente (adiciona força a ele), mas permite que você compre 2 cartas do seu baralho imediatamente."
			},
			medic: {
				name: "Médico de Campo",
				desc: "Permite escolher uma carta não-herói da sua pilha de descarte e jogá-la imediatamente no campo de batalha."
			},
			morale: {
				name: "Moral do Comandante",
				desc: "Adiciona +1 de Força a todas as unidades nesta mesma fileira (exceto a si mesma)."
			},
			bond: {
				name: "Elo Estreito",
				desc: "Posicione ao lado de outra carta com o mesmo nome para dobrar a força de ambas."
			},
			muster: {
				name: "Reunir as Tropas",
				desc: "Procura todas as cartas de mesmo grupo/nome no seu baralho ou mão e as invoca para a batalha instantaneamente."
			},
			scorch: {
				name: "Queimar",
				desc: "Descarta após jogar. Destrói a(s) unidade(s) de maior força no campo de batalha de ambos os jogadores."
			},
			scorch_c: {
				name: "Queimar Corpo a Corpo",
				desc: "Destrói a(s) unidade(s) de combate corpo a corpo mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais."
			},
			scorch_r: {
				name: "Queimar Longa Distância",
				desc: "Destrói a(s) unidade(s) de combate à distância mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais."
			},
			scorch_s: {
				name: "Queimar Cerco",
				desc: "Destrói a(s) unidade(s) de cerco mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais."
			},
			decoy: {
				name: "Isca de Treinamento",
				desc: "Troque por qualquer carta de unidade sua já em campo para devolvê-la intacta para a sua mão."
			},
			horn: {
				name: "Corneta do Comandante",
				desc: "Dobra a força de todas as unidades nesta fileira (limite de 1 por fileira)."
			},
			agile: {
				name: "Ágil",
				desc: "Pode ser posicionada na fileira de combate corpo a corpo ou na fileira de longa distância conforme sua estratégia."
			},
			berserker: {
				name: "Berserker",
				desc: "Transforma-se em um urso feroz quando uma carta Mardroeme está na sua fileira."
			},
			mardroeme: {
				name: "Mardroeme",
				desc: "Provoca a transformação de todas as cartas Berserker na mesma fileira em ursos Vildkaarl."
			},
			avenger: {
				name: "Vingador",
				desc: "Quando esta unidade for destruída ou enviada ao cemitério, invoca um poderoso Chort de 8 de força em seu lugar."
			},
			frost: {
				name: "Frio Congelante",
				desc: "Reduz a força de todas as unidades de combate corpo a corpo para 1 para ambos os jogadores."
			},
			fog: {
				name: "Névoa Impenetrável",
				desc: "Reduz a força de todas as unidades de combate à distância para 1 para ambos os jogadores."
			},
			rain: {
				name: "Chuva Torrencial",
				desc: "Reduz a força de todas as unidades de cerco para 1 para ambos os jogadores."
			},
			storm: {
				name: "Tempestade de Skellige",
				desc: "Reduz a força de todas as unidades de combate à distância e de cerco para 1 para ambos os jogadores."
			},
			clear: {
				name: "Tempo Limpo",
				desc: "Remove instantaneamente todas as condições climáticas adversas em campo."
			}
		};

		abilityTokens.forEach(token => {
			if (abilityDictionary[token]) {
				titles.push(abilityDictionary[token].name);
				descs.push(`★ ${abilityDictionary[token].name}:\n${abilityDictionary[token].desc}`);
			} else {
				titles.push(token);
			}
		});

		return {
			title: titles.join(" · ") || "Habilidade Especial",
			desc: descs.join("\n\n") || "Habilidade especial em campo."
		};
	}

	static inspectShopCard(card, item, shopId, itemIdx) {
		const modal = document.getElementById("story-card-inspect-modal");
		if (!modal || !card) return;

		const isLeader = card.row === "leader";
		const maxAllowed = StoryMode.getCardMaxCopies(item.cardIndex);
		const ownedCount = StoryMode.save.collection[item.cardIndex] || 0;
		const purchaseKey = `${shopId}_${itemIdx}`;
		const boughtCount = StoryMode.save.purchasedShopItems[purchaseKey] || 0;
		const remainingStock = Math.max(0, Math.min(item.max - boughtCount, maxAllowed - ownedCount));
		const isSoldOut = remainingStock <= 0;
		const canAfford = StoryMode.save.crowns >= item.price;
		const reqStatus = StoryMode.checkItemRequirement(item);
		const isLockedReq = !reqStatus.met;

		document.getElementById("inspect-card-title").textContent = card.name;
		const factionNames = {
			realms: "Reinos do Norte",
			nilfgaard: "Império de Nilfgaard",
			monsters: "Monstros",
			scoiatael: "Scoia'tael",
			skellige: "Skellige",
			neutral: "Neutro",
			special: "Especial",
			weather: "Clima"
		};
		const factionName = factionNames[card.deck] || card.deck.toUpperCase();
		const typeSub = isLeader ? "Carta de Líder" : (card.ability && card.ability.includes("hero") ? "Carta de Herói Lendário" : "Unidade de Combate");
		document.getElementById("inspect-card-subtitle").textContent = `${factionName} · ${typeSub}`;

		const artEl = document.getElementById("inspect-card-art");
		if (artEl) {
			artEl.style.backgroundImage = `url(img/lg/${card.deck}_${card.filename}.jpg)`;
		}

		const ownershipEl = document.getElementById("inspect-card-ownership");
		if (ownershipEl) {
			ownershipEl.textContent = `Você possui: ${ownedCount} / ${maxAllowed} (Estoque do Mercador: ${remainingStock})`;
		}

		const powerEl = document.getElementById("inspect-card-power");
		if (powerEl) powerEl.textContent = isLeader ? "—" : (card.strength || "★");

		const rowNames = {
			close: "Corpo a Corpo",
			ranged: "Longa Distância",
			siege: "Cerco",
			agile: "Ágil (Corpo / Longa)",
			leader: "Comandante",
			"": "Especial / Clima"
		};
		const rowEl = document.getElementById("inspect-card-row");
		if (rowEl) rowEl.textContent = rowNames[card.row] || card.row || "Especial";

		const typeEl = document.getElementById("inspect-card-type");
		if (typeEl) {
			typeEl.textContent = isLeader ? "Líder" : (card.ability && card.ability.includes("hero") ? "Herói" : (card.deck === "weather" ? "Clima" : (card.deck === "special" ? "Especial" : "Unidade")));
		}

		const abilityInfo = StoryMode.getCardAbilityDescription(card);
		const abilityNameEl = document.getElementById("inspect-ability-name");
		if (abilityNameEl) abilityNameEl.textContent = abilityInfo.title;
		const abilityDescEl = document.getElementById("inspect-ability-desc");
		if (abilityDescEl) abilityDescEl.textContent = abilityInfo.desc;

		const reqBox = document.getElementById("inspect-requirement-box");
		if (reqBox) {
			if (item.requirement) {
				reqBox.classList.remove("hide");
				document.getElementById("inspect-requirement-desc").textContent = reqStatus.desc;
				const fillPct = Math.min(100, Math.round((reqStatus.current / reqStatus.target) * 100));
				document.getElementById("inspect-req-progress-fill").style.width = `${fillPct}%`;
				document.getElementById("inspect-req-progress-text").textContent = `${reqStatus.current} / ${reqStatus.target} Concluído ${reqStatus.met ? '(Liberado ✓)' : '(Bloqueado 🔒)'}`;
			} else {
				reqBox.classList.add("hide");
			}
		}

		const priceEl = document.getElementById("inspect-card-price");
		if (priceEl) priceEl.textContent = Number(item.price).toLocaleString("pt-BR");

		const buyBtn = document.getElementById("inspect-card-buy-btn");
		if (buyBtn) {
			if (isSoldOut) {
				buyBtn.disabled = true;
				buyBtn.innerHTML = (ownedCount >= maxAllowed) ? "Coleção Máxima" : "Esgotado";
			} else if (isLockedReq) {
				buyBtn.disabled = true;
				buyBtn.innerHTML = `🔒 Bloqueado (${reqStatus.current}/${reqStatus.target})`;
			} else if (!canAfford) {
				buyBtn.disabled = true;
				buyBtn.innerHTML = "Coroas Insuficientes";
			} else {
				buyBtn.disabled = false;
				buyBtn.innerHTML = `<img src="img/hud-icons/Coin.png" class="btn-hud-icon" alt="Comprar" /> Comprar Carta (${Number(item.price).toLocaleString("pt-BR")} Coroas)`;
				buyBtn.onclick = () => {
					StoryMode.promptBuyConfirmation(shopId, itemIdx, item, card);
				};
			}
		}

		modal.classList.remove("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static closeCardInspectModal() {
		const modal = document.getElementById("story-card-inspect-modal");
		if (modal) modal.classList.add("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_back");
		}
	}

	static toggleStatsDrawer(forceState) {
		const drawer = document.getElementById("story-player-stats-drawer");
		const chevron = document.getElementById("story-stats-chevron");
		if (!drawer) return;

		const isCurrentlyHidden = drawer.classList.contains("hide");
		const shouldShow = (typeof forceState === "boolean") ? forceState : isCurrentlyHidden;

		if (shouldShow) {
			StoryMode.updateStatsDrawer();
			drawer.classList.remove("hide");
			if (chevron) chevron.classList.add("open");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_tab_open");
			}
		} else {
			drawer.classList.add("hide");
			if (chevron) chevron.classList.remove("open");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_back");
			}
		}
	}

	static updateStatsDrawer() {
		if (!StoryMode.save) return;

		const save = StoryMode.save;
		const stats = save.stats || {};
		const factionWins = stats.factionWins || { realms: 0, nilfgaard: 0, monsters: 0, scoiatael: 0, skellige: 0 };

		const nameEl = document.getElementById("stats-drawer-player-name");
		if (nameEl) nameEl.textContent = save.playerName || "Geralt de Rívia";

		const factionMap = {
			realms: "Reinos do Norte",
			nilfgaard: "Império de Nilfgaard",
			monsters: "Monstros",
			scoiatael: "Scoia'tael",
			skellige: "Skellige"
		};
		const diffMap = {
			easy: "Fácil",
			medium: "Média",
			hard: "Difícil"
		};
		const subEl = document.getElementById("stats-drawer-faction-diff");
		if (subEl) {
			subEl.textContent = `${factionMap[save.faction] || save.faction} · Dificuldade ${diffMap[save.difficulty] || "Média"}`;
		}

		const allNodes = Object.values(STORY_DATA.NODES || {});
		const battleNodes = allNodes.filter(n => n.type === "battle");
		const completedBattleNodes = battleNodes.filter(n => save.completedNodes.includes(n.id));
		const battlesLeft = battleNodes.length - completedBattleNodes.length;

		const tourneyNodes = allNodes.filter(n => n.type === "tournament");
		const completedTourneys = tourneyNodes.filter(n => save.completedNodes.includes(n.id));
		const availableTourneys = tourneyNodes.filter(n => save.unlockedNodes.includes(n.id) && !save.completedNodes.includes(n.id));

		const shopNodes = allNodes.filter(n => n.type === "shop");
		const unlockedShops = shopNodes.filter(n => save.completedNodes.includes(n.id));

		const bEl = document.getElementById("stat-battles-val");
		if (bEl) bEl.textContent = `${completedBattleNodes.length} / ${battleNodes.length}`;
		const blEl = document.getElementById("stat-battles-left-val");
		if (blEl) blEl.textContent = `${battlesLeft}`;

		const tEl = document.getElementById("stat-tourneys-val");
		if (tEl) tEl.textContent = `${completedTourneys.length} / ${tourneyNodes.length}`;
		const tlEl = document.getElementById("stat-tourneys-left-val");
		if (tlEl) tlEl.textContent = `${availableTourneys.length}`;

		const trophEl = document.getElementById("stat-trophies-val");
		if (trophEl) trophEl.textContent = `${(save.trophies || []).length} / 5`;

		const shEl = document.getElementById("stat-shops-val");
		if (shEl) shEl.textContent = `${unlockedShops.length} / ${shopNodes.length}`;

		const wins = stats.matchesWon || 0;
		const losses = stats.matchesLost || 0;
		const totalMatches = wins + losses;
		const winrate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 100;

		const wEl = document.getElementById("stat-wins-val");
		if (wEl) wEl.textContent = String(wins);
		const lEl = document.getElementById("stat-losses-val");
		if (lEl) lEl.textContent = String(losses);
		const wrEl = document.getElementById("stat-winrate-val");
		if (wrEl) wrEl.textContent = `${winrate}%`;

		const fnr = document.getElementById("stat-fac-nr");
		if (fnr) fnr.textContent = String(factionWins.realms || 0);
		const fnilf = document.getElementById("stat-fac-nilf");
		if (fnilf) fnilf.textContent = String(factionWins.nilfgaard || 0);
		const fmon = document.getElementById("stat-fac-mon");
		if (fmon) fmon.textContent = String(factionWins.monsters || 0);
		const fsco = document.getElementById("stat-fac-sco");
		if (fsco) fsco.textContent = String(factionWins.scoiatael || 0);
		const fskel = document.getElementById("stat-fac-skel");
		if (fskel) fskel.textContent = String(factionWins.skellige || 0);

		const crEl = document.getElementById("stat-crowns-val");
		if (crEl) crEl.textContent = Number(save.crowns || 0).toLocaleString("pt-BR");
		const ceEl = document.getElementById("stat-crowns-earned-val");
		if (ceEl) ceEl.textContent = `+${Number(stats.crownsEarned || 0).toLocaleString("pt-BR")}`;
		const csEl = document.getElementById("stat-crowns-spent-val");
		if (csEl) csEl.textContent = `-${Number(stats.crownsSpent || 0).toLocaleString("pt-BR")}`;

		const totalCards = 216;
		const ownedUnique = Object.keys(save.collection || {}).filter(k => (save.collection[k] || 0) > 0).length;
		const pct = Math.round((ownedUnique / totalCards) * 100);

		const cdEl = document.getElementById("stat-cards-val");
		if (cdEl) cdEl.textContent = `${ownedUnique} / ${totalCards}`;
		const cpEl = document.getElementById("stat-compendium-pct-val");
		if (cpEl) cpEl.textContent = `${pct}%`;
	}

	static openCompendiumModal(filterFaction = "all", filterStatus = "all") {
		const modal = document.getElementById("story-compendium-modal");
		if (!modal || typeof card_dict === "undefined") return;

		StoryMode.syncCollectionAndTokens();
		StoryMode.compendiumFilterFaction = filterFaction;
		StoryMode.compendiumFilterStatus = filterStatus;

		const totalCards = 216;
		const ownedUnique = Object.keys(StoryMode.save.collection).filter(k => (StoryMode.save.collection[k] || 0) > 0).length;
		const pct = Math.round((ownedUnique / totalCards) * 100);

		document.getElementById("story-comp-total-text").textContent = `${ownedUnique} / ${totalCards} Cartas (${pct}%)`;
		const barFill = document.getElementById("story-comp-progress-fill");
		if (barFill) barFill.style.width = `${pct}%`;

		const setupTabs = (containerId, currentVal, onClick) => {
			const container = document.getElementById(containerId);
			if (!container) return;
			container.querySelectorAll(".witcher-tab-btn").forEach(btn => {
				if (btn.dataset.filter === currentVal) btn.classList.add("active");
				else btn.classList.remove("active");
				btn.onclick = () => onClick(btn.dataset.filter);
			});
		};

		setupTabs("story-comp-status-tabs", filterStatus, (s) => StoryMode.openCompendiumModal(StoryMode.compendiumFilterFaction, s));
		setupTabs("story-comp-faction-tabs", filterFaction, (f) => StoryMode.openCompendiumModal(f, StoryMode.compendiumFilterStatus));

		const grid = document.getElementById("story-comp-cards-grid");
		if (grid) {
			grid.innerHTML = "";
			card_dict.forEach((card, idx) => {
				if (filterFaction !== "all") {
					if (filterFaction === "neutral" && !["neutral", "special", "weather"].includes(card.deck)) return;
					if (filterFaction !== "neutral" && card.deck !== filterFaction) return;
				}

				const maxAllowed = StoryMode.getCardMaxCopies(idx);
				const ownedCount = Math.min(maxAllowed, StoryMode.save.collection[idx] || 0);
				const isOwned = ownedCount > 0;

				if (filterStatus === "owned" && !isOwned) return;
				if (filterStatus === "missing" && isOwned) return;

				const hintData = (STORY_DATA.COMPENDIUM_HINTS && STORY_DATA.COMPENDIUM_HINTS[idx]) || {};
				const sourceHint = hintData.source || "Disponível contra adversários e mercadores do Continente.";

				const cardBox = document.createElement("div");
				cardBox.className = `comp-card-item ${isOwned ? 'owned' : 'missing'}`;
				cardBox.innerHTML = `
					<div class="comp-card-thumb" style="background-image: url(img/sm/${card.deck}_${card.filename}.jpg)">
						<span class="comp-card-str">${card.row === 'leader' ? '👑' : (card.strength || '★')}</span>
						${isOwned ? `<span class="comp-card-count">${ownedCount}/${maxAllowed}</span>` : '<span class="comp-card-lock">🔒</span>'}
					</div>
					<div class="comp-card-details">
						<strong class="comp-card-title">${card.name}</strong>
						<span class="comp-card-sub">${card.deck} · ${card.ability || card.row || 'Unidade'}</span>
						${isOwned ? `<span class="comp-acquired-tag">✓ Colecionada (${ownedCount}/${maxAllowed})</span>` : `<span class="comp-hint-text">📍 ${sourceHint}</span>`}
					</div>
				`;

				grid.appendChild(cardBox);
			});
		}

		modal.classList.remove("hide");
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static closeAllModals() {
		document.querySelectorAll(".story-modal").forEach(m => m.classList.add("hide"));
		StoryMode.toggleStatsDrawer(false);
	}

	static openCampaignDeckBuilder() {
		StoryMode.isCustomizingCampaign = true;
		StoryMode.syncCollectionAndTokens();

		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.add("hide");

		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.remove("hide");
			deckCustom.classList.add("story-deck-mode");
		}

		const startBtn = document.getElementById("start-game");
		if (startBtn) {
			startBtn.classList.add("hide");
			startBtn.style.display = "none";
		}

		const uploadDeckBtn = document.getElementById("upload-deck");
		if (uploadDeckBtn) {
			uploadDeckBtn.classList.add("hide");
			uploadDeckBtn.style.display = "none";
		}

		const opPreview = document.getElementById("opponent-preview");
		if (opPreview) {
			opPreview.classList.add("hide");
			opPreview.style.display = "none";
		}

		const standardBack = document.getElementById("btn-back-to-menu");
		if (standardBack) standardBack.classList.add("hide");

		const storyBackToMap = document.getElementById("btn-story-back-to-map");
		if (storyBackToMap) {
			storyBackToMap.classList.remove("hide");
			storyBackToMap.style.display = "inline-flex";
		}

		const storyDeckConfirm = document.getElementById("btn-story-deck-confirm");
		if (storyDeckConfirm) {
			storyDeckConfirm.classList.remove("hide");
			storyDeckConfirm.style.display = "flex";
		}

		if (window.dm && StoryMode.save) {
			window.dm.elem.classList.remove("hide");
			window.dm.setFaction(StoryMode.save.playerDeck.faction, true);
			if (StoryMode.save.playerDeck.leader !== undefined) {
				window.dm.setLeader(StoryMode.save.playerDeck.leader);
			}
			StoryMode.buildCampaignBank(window.dm);
			window.dm.update();
		}

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_tab_open");
		}
	}

	static buildCampaignBank(deckMaker) {
		deckMaker.clear();
		StoryMode.syncCollectionAndTokens();
		const faction = deckMaker.faction || StoryMode.save.playerDeck.faction;

		// Filter playable cards for this faction (excluding leaders and 0-count summoned tokens)
		let cards = card_dict.map((c, i) => ({ card: c, index: i })).filter(
			p => [faction, "neutral", "weather", "special"].includes(p.card.deck)
				&& p.card.row !== "leader"
				&& Number(p.card.count) > 0
		);

		cards.sort(function (id1, id2) {
			let a = card_dict[id1.index], b = card_dict[id2.index];
			let c1 = { name: a.name, basePower: -a.strength, faction: a.deck };
			let c2 = { name: b.name, basePower: -b.strength, faction: b.deck };
			return Card.compare(c1, c2);
		});

		const deckMap = {};
		if (StoryMode.save.playerDeck.faction === faction && StoryMode.save.playerDeck.cards) {
			StoryMode.save.playerDeck.cards.forEach(([idx, count]) => {
				deckMap[idx] = count;
			});
		}

		cards.forEach(p => {
			const maxAllowed = StoryMode.getCardMaxCopies(p.index);
			const ownedTotal = Math.min(maxAllowed, StoryMode.save.collection[p.index] || 0);
			if (ownedTotal > 0) {
				const inDeck = Math.min(ownedTotal, deckMap[p.index] || 0);
				const inBank = ownedTotal - inDeck;
				deckMaker.makePreview(p.index, inBank, deckMaker.bank_elem, deckMaker.bank);
				deckMaker.makePreview(p.index, inDeck, deckMaker.deck_elem, deckMaker.deck);
			}
		});
	}

	static saveCampaignDeckFromCustomization() {
		if (!window.dm || !StoryMode.save) return;
		const newCards = window.dm.deck.filter(x => x.count > 0).map(x => [x.index, Math.min(StoryMode.getCardMaxCopies(x.index), x.count)]);
		const unitCount = newCards.reduce((sum, [idx, cnt]) => {
			const c = card_dict[idx];
			return (c && c.deck !== "special" && c.deck !== "weather") ? sum + cnt : sum;
		}, 0);

		if (unitCount >= 22) {
			StoryMode.save.playerDeck = {
				faction: window.dm.faction,
				leader: window.dm.leader ? window.dm.leader.index : StoryMode.save.playerDeck.leader,
				cards: newCards
			};
			StoryMode.saveGame();
		}
	}

	static closeCampaignDeckBuilder() {
		StoryMode.saveCampaignDeckFromCustomization();
		StoryMode.isCustomizingCampaign = false;

		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.add("hide");
			deckCustom.classList.remove("story-deck-mode");
		}

		const startBtn = document.getElementById("start-game");
		if (startBtn) {
			startBtn.classList.remove("hide");
			startBtn.style.display = "";
		}

		const uploadDeckBtn = document.getElementById("upload-deck");
		if (uploadDeckBtn) {
			uploadDeckBtn.classList.remove("hide");
			uploadDeckBtn.style.display = "";
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

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_click");
		}

		StoryMode.openMap();
	}

	static startMatch(nodeId, roundIndex = 0) {
		const node = STORY_DATA.NODES[nodeId];
		if (!node) return;

		let opDeckData;
		let opponentName;

		if (node.type === "tournament") {
			const roundData = node.rounds[roundIndex] || node.rounds[0];
			opDeckData = roundData.deck;
			opponentName = roundData.opponentName;
		} else {
			opDeckData = node.opponent.deck;
			opponentName = node.opponent.name;
		}

		const wager = StoryMode.selectedWager || 0;
		if (wager > 0) {
			StoryMode.save.crowns = Math.max(0, StoryMode.save.crowns - wager);
			StoryMode.save.stats.crownsSpent = (StoryMode.save.stats.crownsSpent || 0) + wager;
		}

		StoryMode.activeMatch = {
			nodeId: nodeId,
			node: node,
			isTournament: node.type === "tournament",
			roundIndex: roundIndex,
			opponentName: opponentName,
			opponentFaction: opDeckData.faction,
			firstWin: !StoryMode.save.completedNodes.includes(nodeId),
			wager: wager
		};

		const meDeckData = {
			faction: StoryMode.save.playerDeck.faction,
			leader: card_dict[StoryMode.save.playerDeck.leader],
			cards: StoryMode.save.playerDeck.cards.map(([idx, count]) => ({ index: idx, count: count }))
		};

		const opDeck = {
			faction: opDeckData.faction,
			leader: card_dict[opDeckData.leader],
			cards: opDeckData.cards.map(c => ({ index: c.index, count: c.count }))
		};

		// Hide modals & end-screen before starting
		const outcomeModal = document.getElementById("story-outcome-modal");
		if (outcomeModal) outcomeModal.classList.add("hide");
		const endScreen = document.getElementById("end-screen");
		if (endScreen) endScreen.classList.add("hide");

		player_me = new Player(0, StoryMode.save.playerName, meDeckData);
		player_op = new Player(1, opponentName, opDeck);

		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.add("hide");

		const padCursor = document.getElementById("story-gamepad-cursor");
		if (padCursor) padCursor.classList.add("hide");

		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.remove("hide");

		if (typeof MusicManager !== "undefined") {
			MusicManager.playDuelMusic();
		}

		if (typeof game !== "undefined") {
			game.startGame();
		}
	}

	/**
	 * Immediately transitions from a completed tournament battle to the next consecutive battle
	 * without returning to the Continent Map.
	 */
	static advanceToNextTournamentMatch(nodeId, nextRoundIndex) {
		const outcomeModal = document.getElementById("story-outcome-modal");
		if (outcomeModal) outcomeModal.classList.add("hide");

		const endScreen = document.getElementById("end-screen");
		if (endScreen) endScreen.classList.add("hide");

		if (typeof game !== "undefined") {
			game.reset();
			if (typeof player_me !== "undefined") player_me.reset();
			if (typeof player_op !== "undefined") player_op.reset();
		}

		StoryMode.startMatch(nodeId, nextRoundIndex);
	}

	/**
	 * Called if the player abandons an active match via the pause/exit popup.
	 * Resets tournament progress to Battle 1 and returns to the Continent Map.
	 */
	static onMatchAbandoned() {
		if (StoryMode.activeMatch && StoryMode.save) {
			const match = StoryMode.activeMatch;
			const node = match.node;
			StoryMode.save.stats.matchesLost = (StoryMode.save.stats.matchesLost || 0) + 1;
			if (match.isTournament) {
				StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: 0, active: false };
			} else {
				const lossPenalty = node.crownsLoss || 45;
				StoryMode.save.crowns = Math.max(0, StoryMode.save.crowns - lossPenalty);
			}
			StoryMode.saveGame();
		}
		StoryMode.returnFromMatchToMap();
	}

	static onMatchEnded(isWin) {
		if (!StoryMode.activeMatch || !StoryMode.save) return;

		const match = StoryMode.activeMatch;
		const node = match.node;

		if (isWin) {
			StoryMode.save.stats.matchesWon = (StoryMode.save.stats.matchesWon || 0) + 1;
			if (!StoryMode.save.stats.factionWins) {
				StoryMode.save.stats.factionWins = { realms: 0, nilfgaard: 0, monsters: 0, scoiatael: 0, skellige: 0 };
			}
			const opFaction = match.opponentFaction;
			if (opFaction && StoryMode.save.stats.factionWins[opFaction] !== undefined) {
				StoryMode.save.stats.factionWins[opFaction] = (StoryMode.save.stats.factionWins[opFaction] || 0) + 1;
			}
			if (typeof Achievements !== "undefined" && typeof Achievements.checkStoryAchievements === "function") {
				Achievements.checkStoryAchievements(StoryMode.save, true);
			}

			if (match.isTournament) {
				const totalRounds = node.rounds.length;
				const stageKey = `${match.nodeId}_r${match.roundIndex}`;
				const isFirstStageClear = !(StoryMode.save.tournamentStageCleared && StoryMode.save.tournamentStageCleared[stageKey]);
				const stageCrowns = isFirstStageClear ? (node.roundWinCrownsFirst || 300) : (node.roundWinCrownsRepeat || 40);

				if (!StoryMode.save.tournamentStageCleared) StoryMode.save.tournamentStageCleared = {};
				StoryMode.save.tournamentStageCleared[stageKey] = true;

				const isFinalRound = match.roundIndex >= (totalRounds - 1);
				if (isFinalRound) {
					const isFirstChampion = !StoryMode.save.completedNodes.includes(match.nodeId);
					const grandCrowns = isFirstChampion ? (node.grandPrizeCrowns || 1000) : Math.round((node.grandPrizeCrowns || 1000) * 0.1);
					const totalCrownsWon = stageCrowns + grandCrowns;

					StoryMode.save.crowns += totalCrownsWon;
					StoryMode.save.stats.crownsEarned = (StoryMode.save.stats.crownsEarned || 0) + totalCrownsWon;

					const prizeCards = node.grandPrizeCards || (node.grandPrizeCard ? [node.grandPrizeCard] : []);
					const awardedCards = [];
					if (isFirstChampion) {
						prizeCards.forEach(pc => {
							StoryMode.awardCardToCollection(pc.index, pc.count || 1);
							awardedCards.push(pc);
						});
					}

					if (node.trophyId && !StoryMode.save.trophies.includes(node.trophyId)) {
						StoryMode.save.trophies.push(node.trophyId);
					}

					if (!StoryMode.save.completedNodes.includes(match.nodeId)) {
						StoryMode.save.completedNodes.push(match.nodeId);
					}
					StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: 0, active: false };

					StoryMode.unlockNodeWithConnections(match.nodeId);
					StoryMode.saveGame();

					StoryMode.showVictoryOverlay({
						crownsWon: totalCrownsWon,
						cardsDropped: awardedCards,
						trophyId: isFirstChampion ? node.trophyId : null,
						isTourneyChampion: true,
						nextRoundIndex: null,
						totalRounds: totalRounds,
						isFirstStageClear: isFirstStageClear
					});
				} else {
					// Won current tournament stage -> proceed directly to next battle!
					const nextRoundIndex = match.roundIndex + 1;
					StoryMode.save.crowns += stageCrowns;
					StoryMode.save.stats.crownsEarned = (StoryMode.save.stats.crownsEarned || 0) + stageCrowns;
					StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: nextRoundIndex, active: true };
					StoryMode.saveGame();

					StoryMode.showVictoryOverlay({
						crownsWon: stageCrowns,
						cardsDropped: [],
						trophyId: null,
						isTourneyChampion: false,
						nextRoundIndex: nextRoundIndex,
						totalRounds: totalRounds,
						isFirstStageClear: isFirstStageClear,
						nextOpponent: node.rounds[nextRoundIndex]
					});
				}
			} else {
				// Standard Battle Node Victory
				const isFirstWin = !StoryMode.save.completedNodes.includes(match.nodeId);
				const baseCrowns = isFirstWin ? (node.crownsReward || 220) : (node.crownsReplay || 55);
				let crownsWon = baseCrowns;
				let wagerWon = 0;

				if (match.wager > 0) {
					wagerWon = match.wager * 2;
					crownsWon = baseCrowns + wagerWon;
				}

				StoryMode.save.crowns += crownsWon;
				StoryMode.save.stats.crownsEarned = (StoryMode.save.stats.crownsEarned || 0) + crownsWon;
				StoryMode.save.winsCount[match.nodeId] = (StoryMode.save.winsCount[match.nodeId] || 0) + 1;

				const awardedCards = [];
				if (isFirstWin && node.cardDrop) {
					StoryMode.awardCardToCollection(node.cardDrop.index, node.cardDrop.count || 1);
					awardedCards.push(node.cardDrop);
				}

				if (!StoryMode.save.completedNodes.includes(match.nodeId)) {
					StoryMode.save.completedNodes.push(match.nodeId);
				}

				StoryMode.unlockNodeWithConnections(match.nodeId);
				StoryMode.saveGame();

				StoryMode.showVictoryOverlay({
					crownsWon: crownsWon,
					wagerWon: wagerWon,
					cardsDropped: awardedCards,
					trophyId: null,
					isTourneyChampion: false,
					nextRoundIndex: null,
					totalRounds: 1
				});
			}
		} else {
			// Defeat
			StoryMode.save.stats.matchesLost = (StoryMode.save.stats.matchesLost || 0) + 1;
			let lossPenalty = node.crownsLoss || 45;
			let wasWager = false;

			if (match.isTournament) {
				// Reset tournament progress to Battle 1!
				StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: 0, active: false };
				lossPenalty = 0; // Entry fee was already paid
			} else if (match.wager > 0) {
				lossPenalty = match.wager;
				wasWager = true;
			} else {
				StoryMode.save.crowns = Math.max(0, StoryMode.save.crowns - lossPenalty);
			}

			StoryMode.saveGame();
			StoryMode.showDefeatOverlay(lossPenalty, match.isTournament, match.roundIndex + 1, (node.rounds || []).length, wasWager);
		}
	}

	static showVictoryOverlay(opts) {
		const modal = document.getElementById("story-outcome-modal");
		if (!modal) return;

		const {
			crownsWon,
			cardsDropped = [],
			trophyId = null,
			isTourneyChampion = false,
			nextRoundIndex = null,
			totalRounds = 1,
			isFirstStageClear = true,
			nextOpponent = null
		} = opts;

		const titleEl = document.getElementById("story-outcome-title");
		if (titleEl) {
			if (isTourneyChampion) {
				titleEl.textContent = "★ GRANDE CAMPEÃO DO TORNEIO! ★";
			} else if (nextRoundIndex !== null) {
				titleEl.textContent = `⚔ BATALHA ${nextRoundIndex}/${totalRounds} VENCIDA!`;
			} else {
				titleEl.textContent = "VITÓRIA NO GWENT!";
			}
		}

		const crownsEl = document.getElementById("story-outcome-crowns");
		if (crownsEl) {
			const coinImg = '<img src="img/hud-icons/Coin.png" class="coin-icon-small" alt="Coroas" />';
			if (opts.wagerWon && opts.wagerWon > 0) {
				crownsEl.innerHTML = `${coinImg} +${Number(crownsWon).toLocaleString("pt-BR")} Coroas <span style="display:block; font-size:0.85rem; color:#2ecc71;">(Inclui prêmio de aposta de +${Number(opts.wagerWon).toLocaleString("pt-BR")} Coroas!)</span>`;
			} else if (nextRoundIndex !== null) {
				crownsEl.innerHTML = `${coinImg} +${Number(crownsWon).toLocaleString("pt-BR")} Coroas ${isFirstStageClear ? '(Bônus de 1ª Tentativa!)' : '(Fase Repetida)'}`;
			} else {
				crownsEl.innerHTML = `${coinImg} +${Number(crownsWon).toLocaleString("pt-BR")} Coroas`;
			}
		}

		const cardContainer = document.getElementById("story-outcome-card-box");
		if (cardContainer) {
			if (cardsDropped.length > 0 && typeof card_dict !== "undefined") {
				cardContainer.classList.remove("hide");
				const headerText = cardsDropped.length === 1
					? "★ Nova Carta Conquistada!"
					: `★ ${cardsDropped.length} Novas Cartas Conquistadas!`;
				const cardsHtml = cardsDropped.map(drop => {
					const c = card_dict[drop.index];
					if (!c) return "";
					return `
						<div style="display:flex; flex-direction:column; align-items:center; width:135px;">
							<div class="story-outcome-card-thumb" style="width:120px; height:164px; margin:8px auto; background-image: url(img/lg/${c.deck}_${c.filename}.jpg)"></div>
							<strong style="color:#fff; font-size:0.88rem;">${c.name}</strong>
							<small style="color:#c5a059; font-size:0.74rem;">${c.row === 'leader' ? '👑 Líder' : (c.strength ? 'Força ' + c.strength : 'Especial')}</small>
						</div>
					`;
				}).join("");
				cardContainer.innerHTML = `
					<div style="color:#ffd700; font-weight:bold; margin-bottom:6px;">${headerText}</div>
					<div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap;">${cardsHtml}</div>
				`;
			} else if (nextRoundIndex !== null && nextOpponent) {
				cardContainer.classList.remove("hide");
				cardContainer.innerHTML = `
					<div style="background:rgba(20,16,12,0.85); border:1px solid #ffd700; padding:12px 18px; border-radius:6px; margin-top:8px;">
						<div style="color:#c5a059; font-size:0.82rem; text-transform:uppercase;">Próximo Desafio Consecutivo (${nextRoundIndex + 1}/${totalRounds}):</div>
						<strong style="color:#fff; font-size:1.15rem; display:block; margin-top:4px;">⚔ ${nextOpponent.opponentName}</strong>
						<span style="color:#ffd700; font-size:0.85rem;">Facção: ${nextOpponent.faction.toUpperCase()}</span>
					</div>
				`;
			} else {
				cardContainer.classList.add("hide");
				cardContainer.innerHTML = "";
			}
		}

		const trophyBox = document.getElementById("story-outcome-trophy-box");
		if (trophyBox) {
			if (trophyId && STORY_DATA.TROPHIES[trophyId]) {
				const t = STORY_DATA.TROPHIES[trophyId];
				trophyBox.classList.remove("hide");
				trophyBox.innerHTML = `
					<div style="background:radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(20,15,10,0.95) 100%); border:2px solid #ffd700; padding:16px 24px; border-radius:8px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow:0 0 24px rgba(255,215,0,0.5);">
						<div style="color:#ffd700; font-weight:bold; font-size:1rem; letter-spacing:1px; margin-bottom:8px;">★ INSÍGNIA REGIONAL CONQUISTADA! ★</div>
						<img src="${t.image}" alt="${t.title}" style="width:96px; height:96px; object-fit:contain; filter:drop-shadow(0 0 16px rgba(255,215,0,0.95)); margin:8px 0;" />
						<strong style="color:#fff; font-size:1.2rem; display:block; margin-top:4px;">${t.title}</strong>
						<small style="color:#e0d0b0; font-size:0.88rem; max-width:440px; margin-top:6px; line-height:1.4;">${t.desc}</small>
					</div>
				`;
			} else {
				trophyBox.classList.add("hide");
				trophyBox.innerHTML = "";
			}
		}

		const actionBtn = document.getElementById("story-outcome-action-btn");
		if (actionBtn) {
			if (nextRoundIndex !== null && StoryMode.activeMatch) {
				const targetNodeId = StoryMode.activeMatch.nodeId;
				actionBtn.textContent = `⚔ Avançar para Batalha ${nextRoundIndex + 1}/${totalRounds}`;
				actionBtn.onclick = () => {
					StoryMode.advanceToNextTournamentMatch(targetNodeId, nextRoundIndex);
				};
			} else {
				actionBtn.textContent = "Continuar Jornada (Retornar ao Mapa)";
				actionBtn.onclick = () => {
					StoryMode.returnFromMatchToMap();
				};
			}
		}

		modal.classList.remove("hide");
	}

	static showDefeatOverlay(crownsLost, isTournament, failedRoundNum = 1, totalRounds = 1, wasWager = false) {
		const modal = document.getElementById("story-outcome-modal");
		if (!modal) return;

		document.getElementById("story-outcome-title").textContent = isTournament
			? "ELIMINADO DO TORNEIO!"
			: (wasWager ? "DERROTA NA APOSTA!" : "DERROTA NO TABULEIRO");
		const coinLossImg = '<img src="img/hud-icons/Coin.png" class="coin-icon-small" alt="Coroas" />';
		document.getElementById("story-outcome-crowns").innerHTML = isTournament
			? `Derrotado na Batalha ${failedRoundNum}/${totalRounds} · Torneio Reiniciado`
			: (wasWager ? `${coinLossImg} -${Number(crownsLost).toLocaleString("pt-BR")} Coroas perdidas na aposta com o adversário` : `${coinLossImg} -${Number(crownsLost).toLocaleString("pt-BR")} Coroas perdidas`);

		const cardContainer = document.getElementById("story-outcome-card-box");
		if (cardContainer) {
			cardContainer.classList.remove("hide");
			cardContainer.innerHTML = `
				<p class="story-defeat-text">
					${isTournament
						? `Você caiu na Batalha ${failedRoundNum} de ${totalRounds}. Como as batalhas do torneio precisam ser vencidas seguidamente, você retornará ao mapa e o torneio reiniciará da 1ª partida.`
						: 'Seu adversário levou a melhor nesta rodada. Revise seu baralho e tente novamente!'}
				</p>
			`;
		}

		const trophyBox = document.getElementById("story-outcome-trophy-box");
		if (trophyBox) trophyBox.classList.add("hide");

		const actionBtn = document.getElementById("story-outcome-action-btn");
		if (actionBtn) {
			actionBtn.textContent = "Retornar ao Mapa do Continente";
			actionBtn.onclick = () => {
				StoryMode.returnFromMatchToMap();
			};
		}

		modal.classList.remove("hide");
	}

	static returnFromMatchToMap() {
		const outcomeModal = document.getElementById("story-outcome-modal");
		if (outcomeModal) outcomeModal.classList.add("hide");

		const endScreen = document.getElementById("end-screen");
		if (endScreen) endScreen.classList.add("hide");

		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.add("hide");

		if (typeof game !== "undefined") {
			game.reset();
			if (typeof player_me !== "undefined") player_me.reset();
			if (typeof player_op !== "undefined") player_op.reset();
		}

		StoryMode.activeMatch = null;
		StoryMode.openMap();
	}

	static toggleFilter(filterType) {
		if (typeof StoryMode.filters[filterType] === "undefined") return;
		StoryMode.filters[filterType] = !StoryMode.filters[filterType];

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX(StoryMode.filters[filterType] ? "witcher_toggle_on" : "witcher_toggle_off");
		}

		StoryMode.applyFilters();
	}

	static applyFilters() {
		const canvas = document.getElementById("story-map-canvas");
		if (!canvas) return;

		canvas.classList.toggle("filter-hide-shops", !StoryMode.filters.shops);
		canvas.classList.toggle("filter-hide-tourneys", !StoryMode.filters.tourneys);
		canvas.classList.toggle("filter-hide-locked", !StoryMode.filters.locked);

		const btnShops = document.getElementById("story-filter-shops");
		if (btnShops) {
			btnShops.classList.toggle("active", StoryMode.filters.shops);
			btnShops.classList.toggle("inactive", !StoryMode.filters.shops);
		}

		const btnTourneys = document.getElementById("story-filter-tourneys");
		if (btnTourneys) {
			btnTourneys.classList.toggle("active", StoryMode.filters.tourneys);
			btnTourneys.classList.toggle("inactive", !StoryMode.filters.tourneys);
		}

		const btnLocked = document.getElementById("story-filter-locked");
		if (btnLocked) {
			btnLocked.classList.toggle("active", StoryMode.filters.locked);
			btnLocked.classList.toggle("inactive", !StoryMode.filters.locked);
		}
	}

	static getMinZoom() {
		const viewport = document.getElementById("story-map-viewport");
		const vW = viewport ? (viewport.clientWidth || window.innerWidth) : window.innerWidth;
		const vH = viewport ? (viewport.clientHeight || window.innerHeight) : window.innerHeight;
		return Math.max(vW / StoryMode.MAP_WIDTH, vH / StoryMode.MAP_HEIGHT);
	}

	static clampPan() {
		const viewport = document.getElementById("story-map-viewport");
		const vW = viewport ? (viewport.clientWidth || window.innerWidth) : window.innerWidth;
		const vH = viewport ? (viewport.clientHeight || window.innerHeight) : window.innerHeight;

		const minZoom = StoryMode.getMinZoom();
		if (StoryMode.mapZoom < minZoom) {
			StoryMode.mapZoom = minZoom;
		}

		const scaledW = StoryMode.MAP_WIDTH * StoryMode.mapZoom;
		const scaledH = StoryMode.MAP_HEIGHT * StoryMode.mapZoom;

		const minPanX = vW - scaledW;
		const maxPanX = 0;
		if (minPanX >= 0) {
			StoryMode.mapPanX = (vW - scaledW) / 2;
		} else {
			StoryMode.mapPanX = Math.min(maxPanX, Math.max(minPanX, StoryMode.mapPanX));
		}

		const minPanY = vH - scaledH;
		const maxPanY = 0;
		if (minPanY >= 0) {
			StoryMode.mapPanY = (vH - scaledH) / 2;
		} else {
			StoryMode.mapPanY = Math.min(maxPanY, Math.max(minPanY, StoryMode.mapPanY));
		}
	}

	static applyMapTransform() {
		const mapCanvas = document.getElementById("story-map-canvas");
		if (!mapCanvas) return;
		mapCanvas.style.transform = `translate(${StoryMode.mapPanX}px, ${StoryMode.mapPanY}px) scale(${StoryMode.mapZoom})`;

		// Ajuste dinâmico do tamanho dos nós conforme o zoom:
		// Quanto maior o zoom, menor os nós (para não ficarem em cima uns dos outros).
		// Quanto menor o zoom, maiores os nós (com tamanho limite) para melhor visualização e toque.
		const nodeScale = Math.max(0.48, Math.min(2.1, Math.pow(1 / StoryMode.mapZoom, 0.65)));
		mapCanvas.style.setProperty('--node-scale', nodeScale.toFixed(3));
	}

	static zoomMap(delta, pivotX, pivotY) {
		const viewport = document.getElementById("story-map-viewport");
		const rect = viewport ? viewport.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

		const cursorX = (pivotX !== undefined && pivotX !== null) ? (pivotX - rect.left) : (rect.width / 2);
		const cursorY = (pivotY !== undefined && pivotY !== null) ? (pivotY - rect.top) : (rect.height / 2);

		const mapX = (cursorX - StoryMode.mapPanX) / StoryMode.mapZoom;
		const mapY = (cursorY - StoryMode.mapPanY) / StoryMode.mapZoom;

		const minZoom = StoryMode.getMinZoom();
		const maxZoom = 2.8;

		const factor = delta > 0 ? (1 + Math.abs(delta)) : (1 / (1 + Math.abs(delta)));
		let newZoom = StoryMode.mapZoom * factor;
		newZoom = Math.min(maxZoom, Math.max(minZoom, newZoom));

		StoryMode.mapZoom = newZoom;
		StoryMode.mapPanX = cursorX - (mapX * newZoom);
		StoryMode.mapPanY = cursorY - (mapY * newZoom);

		StoryMode.clampPan();
		StoryMode.applyMapTransform();
	}

	// -------------------------------------------------------------
	// MAP HEADER DROPDOWN MENU
	// -------------------------------------------------------------
	static toggleHeaderDropdown(event) {
		if (event) event.stopPropagation();
		const menu = document.getElementById("story-hud-dropdown-menu");
		const wrap = document.getElementById("story-hud-dropdown-wrap");
		if (!menu || !wrap) return;

		const isHidden = menu.classList.contains("hide");
		if (isHidden) {
			menu.classList.remove("hide");
			wrap.classList.add("active");
		} else {
			menu.classList.add("hide");
			wrap.classList.remove("active");
		}
	}

	static closeHeaderDropdown() {
		const menu = document.getElementById("story-hud-dropdown-menu");
		const wrap = document.getElementById("story-hud-dropdown-wrap");
		if (menu) menu.classList.add("hide");
		if (wrap) wrap.classList.remove("active");
	}

	static onDropdownItemClick(action) {
		StoryMode.closeHeaderDropdown();
		if (action === "achievements") {
			StoryMode.openAchievementsModal();
		} else if (action === "collection") {
			StoryMode.openCompendiumModal("all", "all");
		} else if (action === "backup") {
			if (typeof openBackupModal === "function") openBackupModal();
		} else if (action === "main-menu") {
			StoryMode.closeMapToMenu();
		}
	}

	static focusCurrentNode() {
		const defaultStart = (StoryMode.save && STORY_DATA.STARTER_NODES && STORY_DATA.STARTER_NODES[StoryMode.save.faction]) || "nr_white_orchard";
		const currentNodeData = (StoryMode.save && STORY_DATA.NODES[StoryMode.save.currentNode]) || STORY_DATA.NODES[defaultStart];
		if (!currentNodeData) return;

		const viewport = document.getElementById("story-map-viewport");
		const vWidth = viewport ? (viewport.clientWidth || window.innerWidth) : window.innerWidth;
		const vHeight = viewport ? (viewport.clientHeight || window.innerHeight) : window.innerHeight;

		const minZoom = StoryMode.getMinZoom();
		StoryMode.mapZoom = Math.max(minZoom * 1.35, Math.min(1.25, minZoom + 0.4));

		StoryMode.mapPanX = (vWidth / 2) - (currentNodeData.x * StoryMode.mapZoom);
		StoryMode.mapPanY = (vHeight / 2) - (currentNodeData.y * StoryMode.mapZoom);

		StoryMode.clampPan();
		StoryMode.applyMapTransform();
	}

	static resetMapToContinent() {
		const viewport = document.getElementById("story-map-viewport");
		const vWidth = viewport ? (viewport.clientWidth || window.innerWidth) : window.innerWidth;
		const vHeight = viewport ? (viewport.clientHeight || window.innerHeight) : window.innerHeight;

		StoryMode.mapZoom = StoryMode.getMinZoom();
		StoryMode.mapPanX = (vWidth - StoryMode.MAP_WIDTH * StoryMode.mapZoom) / 2;
		StoryMode.mapPanY = (vHeight - StoryMode.MAP_HEIGHT * StoryMode.mapZoom) / 2;

		StoryMode.clampPan();
		StoryMode.applyMapTransform();
	}
}

window.StoryMode = StoryMode;
