"use strict";

/**
 * Story Mode Controller for Gwent Classic
 * Manages Continent Map navigation (WitcherMap_8k_borders.jpg), faction-based starting regions,
 * consecutive tournament gauntlets (2, 3, 5, and 7-match Regional Tournaments),
 * regional merchants, card compendium (216 cards with strict max copy caps), and deck builder.
 */
class StoryMode {
	static SAVE_KEY = "gc-story-save";
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

		StoryMode.setupEventListeners();

		if (StoryMode.hasSave()) {
			const continueBtn = document.getElementById("btn-story-continue");
			if (continueBtn) continueBtn.classList.remove("hide");
		}
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

	static hasSave() {
		const raw = localStorage.getItem(StoryMode.SAVE_KEY);
		return !!(raw && raw.length > 10);
	}

	static loadSave() {
		try {
			const raw = localStorage.getItem(StoryMode.SAVE_KEY);
			if (raw) {
				StoryMode.save = JSON.parse(raw);
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
			localStorage.setItem(StoryMode.SAVE_KEY, JSON.stringify(StoryMode.save));
			if (typeof Achievements !== "undefined" && typeof Achievements.checkStoryAchievements === "function") {
				Achievements.checkStoryAchievements(StoryMode.save);
			}
		} catch (e) {
			console.error("Error saving Story Mode:", e);
		}
	}

	static createNewCampaign(playerName, difficulty, faction) {
		const starter = STORY_DATA.STARTER_DECKS[faction];
		if (!starter) {
			StoryMode.showAlert("Facção inválida: " + faction, "ERRO DE FACÇÃO", "⚠️");
			return;
		}

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
			stats: {
				matchesWon: 0,
				matchesLost: 0,
				crownsEarned: 0,
				crownsSpent: 0
			}
		};

		StoryMode.syncCollectionAndTokens();
		StoryMode.saveGame();

		const continueBtn = document.getElementById("btn-story-continue");
		if (continueBtn) continueBtn.classList.remove("hide");

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

	static startNewGameDialog() {
		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.add("hide");

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

		StoryMode.createNewCampaign(name, difficulty, faction);
	}

	static continueCampaign() {
		if (!StoryMode.loadSave()) {
			StoryMode.showAlert("Nenhum jogo salvo encontrado.", "MODO HISTÓRIA", "📜");
			return;
		}

		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.add("hide");

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}

		StoryMode.openMap();
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
			MusicManager.play();
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
				badge.title = `${t.title} (${t.region}): ${t.desc}`;
				badge.innerHTML = `<span>${t.icon}</span>`;
				trophiesEl.appendChild(badge);
			});
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
			pin.className = `story-map-pin node-type-${node.type} ${isRegional ? 'regional-tourney' : ''} ${isCompleted ? 'completed' : ''} ${isAvailable ? 'available' : ''} ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`;
			pin.style.left = node.x + "px";
			pin.style.top = node.y + "px";

			let pinIcon = "⚔";
			let statusBadge = "";

			if (node.type === "tournament") {
				const numRounds = (node.rounds || []).length;
				if (isCompleted) {
					pinIcon = "🏆";
					statusBadge = `<span class="pin-status">✓ Campeão (${numRounds} Lutas)</span>`;
				} else if (isRegional) {
					pinIcon = "👑";
					statusBadge = `<span class="pin-status tourney">👑 Torneio Regional (${numRounds} Lutas)</span>`;
				} else {
					pinIcon = "🏆";
					statusBadge = `<span class="pin-status tourney">★ Torneio (${numRounds} Lutas)</span>`;
				}
			} else if (node.type === "shop") {
				pinIcon = "💰";
				statusBadge = '<span class="pin-status shop">🪙 Mercador Regional</span>';
			} else if (isCompleted) {
				pinIcon = "✓";
				statusBadge = '<span class="pin-status">✓ Concluído</span>';
			} else if (!isUnlocked) {
				pinIcon = "🔒";
				statusBadge = '<span class="pin-status locked">Bloqueado</span>';
			} else {
				pinIcon = "⚔";
				statusBadge = '<span class="pin-status" style="color:#ffd700;">⚔ Batalha de Gwent</span>';
			}

			pin.innerHTML = `
				<div class="pin-badge">
					${isCurrent ? '<div class="pin-wolf-avatar" title="Posição Atual do Geralt"></div>' : ''}
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

		document.getElementById("story-battle-reward-first").textContent = `+${firstWinCrowns} Coroas`;
		document.getElementById("story-battle-reward-replay").textContent = `+${replayCrowns} Coroas`;
		document.getElementById("story-battle-loss-penalty").textContent = `-${lossCrowns} Coroas`;

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
		document.getElementById("story-tourney-fee").textContent = `${Number(node.entryFee || 0).toLocaleString("pt-BR")} Coroas`;
		document.getElementById("story-tourney-prize").textContent = `${Number(node.grandPrizeCrowns || 0).toLocaleString("pt-BR")} Coroas`;

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
					<div class="story-tourney-trophy-badge ${isCompleted ? 'earned' : ''}" style="display:flex; align-items:center; gap:12px; background:rgba(30,18,12,0.9); border:1.5px solid #ffd700; padding:10px 14px; border-radius:4px; margin-top:8px;">
						<span class="trophy-icon" style="font-size:1.8rem;">${trophyData.icon}</span>
						<div class="trophy-text" style="display:flex; flex-direction:column;">
							<strong style="color:#ffd700; font-size:0.92rem;">${trophyData.title}</strong>
							<small style="color:#e0d0b0; font-size:0.78rem;">${isCompleted ? '✓ Insígnia Conquistada!' : 'Insígnia Regional Colecionável (1 de 5)'}</small>
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

				const roundBox = document.createElement("div");
				roundBox.className = `story-tourney-round-box ${stageAlreadyCleared ? 'won' : ''}`;
				roundBox.innerHTML = `
					<div class="round-num" style="font-weight:bold; color:#ffd700;">Batalha ${idx + 1}/${totalRounds}</div>
					<div class="round-op-name" style="color:#fff;">${rnd.opponentName} <span style="color:#c5a059; font-size:0.82rem;">(${factionNames[rnd.faction] || rnd.faction})</span></div>
					<div class="round-status" style="font-size:0.82rem; color:${stageAlreadyCleared ? '#aaa' : '#2ecc71'};">
						🪙 +${stageCrowns} Coroas ${stageAlreadyCleared ? '(2ª+ tentativa)' : '(1ª vitória)'}
					</div>
				`;
				roundsContainer.appendChild(roundBox);
			});
		}

		const enterBtn = document.getElementById("story-tourney-enter-btn");
		if (enterBtn) {
			enterBtn.textContent = isCompleted
				? `Rejogar Torneio (${node.entryFee} Coroas)`
				: `Pagar Inscrição (${node.entryFee} Coroas) & Iniciar 1/${totalRounds}`;

			enterBtn.onclick = () => {
				if (StoryMode.save.crowns < node.entryFee) {
					if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
						AudioManager.playSFX("warning");
					}
					StoryMode.showAlert(
						`Coroas insuficientes! Você precisa de ${node.entryFee} Coroas para pagar a taxa de inscrição deste torneio.`,
						"COROAS INSUFICIENTES",
						"🪙"
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

		document.getElementById("story-shop-title").textContent = shopData.name;
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

				const itemEl = document.createElement("div");
				itemEl.className = `story-shop-card ${isSoldOut ? 'sold-out' : ''}`;
				itemEl.innerHTML = `
					<div class="shop-card-preview" style="background-image: url(img/sm/${card.deck}_${card.filename}.jpg)">
						<span class="shop-card-power">${isLeader ? '👑' : (card.strength || '★')}</span>
					</div>
					<div class="shop-card-info">
						<strong class="shop-card-name">${card.name}</strong>
						<span class="shop-card-faction">${card.deck} · ${isLeader ? 'Líder' : (card.ability || 'Unidade')}</span>
						<div class="shop-card-price">🪙 ${item.price} Coroas</div>
						<div class="shop-card-stock">${isSoldOut ? (ownedCount >= maxAllowed ? 'COLEÇÃO MÁXIMA' : 'ESGOTADO') : `Disponível: ${remainingStock} (Você tem: ${ownedCount}/${maxAllowed})`}</div>
					</div>
					<button class="witcher-menu-btn shop-buy-btn" ${(!canAfford || isSoldOut) ? 'disabled' : ''}>
						${isSoldOut ? 'Adquirido' : 'Comprar'}
					</button>
				`;

				const buyBtn = itemEl.querySelector(".shop-buy-btn");
				if (buyBtn && !isSoldOut) {
					buyBtn.addEventListener("click", () => {
						StoryMode.buyShopItem(shopData.id, itemIdx, item);
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

	static buyShopItem(shopId, itemIdx, item) {
		if (StoryMode.save.crowns < item.price) {
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("warning");
			}
			StoryMode.showAlert("Coroas insuficientes para adquirir esta carta!", "COROAS INSUFICIENTES", "🪙");
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

		StoryMode.activeMatch = {
			nodeId: nodeId,
			node: node,
			isTournament: node.type === "tournament",
			roundIndex: roundIndex,
			opponentName: opponentName,
			firstWin: !StoryMode.save.completedNodes.includes(nodeId)
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
				const crownsWon = isFirstWin ? (node.crownsReward || 220) : (node.crownsReplay || 55);

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

			if (match.isTournament) {
				// Reset tournament progress to Battle 1!
				StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: 0, active: false };
				lossPenalty = 0; // Entry fee was already paid
			} else {
				StoryMode.save.crowns = Math.max(0, StoryMode.save.crowns - lossPenalty);
			}

			StoryMode.saveGame();
			StoryMode.showDefeatOverlay(lossPenalty, match.isTournament, match.roundIndex + 1, (node.rounds || []).length);
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
			if (nextRoundIndex !== null) {
				crownsEl.textContent = `+${Number(crownsWon).toLocaleString("pt-BR")} Coroas ${isFirstStageClear ? '(Bônus de 1ª Tentativa!)' : '(Fase Repetida)'}`;
			} else {
				crownsEl.textContent = `+${Number(crownsWon).toLocaleString("pt-BR")} Coroas`;
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
					<div style="background:radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(20,15,10,0.95) 100%); border:2px solid #ffd700; padding:12px 18px; border-radius:6px;">
						<div style="color:#ffd700; font-weight:bold; font-size:0.9rem;">🏆 INSÍGNIA REGIONAL CONQUISTADA!</div>
						<div style="font-size:2.2rem; margin:6px 0;">${t.icon}</div>
						<strong style="color:#fff; font-size:1.05rem; display:block;">${t.title}</strong>
						<small style="color:#e0d0b0; font-size:0.8rem;">${t.desc}</small>
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

	static showDefeatOverlay(crownsLost, isTournament, failedRoundNum = 1, totalRounds = 1) {
		const modal = document.getElementById("story-outcome-modal");
		if (!modal) return;

		document.getElementById("story-outcome-title").textContent = isTournament
			? "ELIMINADO DO TORNEIO!"
			: "DERROTA NO TABULEIRO";
		document.getElementById("story-outcome-crowns").textContent = isTournament
			? `Derrotado na Batalha ${failedRoundNum}/${totalRounds} · Torneio Reiniciado`
			: `-${crownsLost} Coroas perdidas na aposta`;

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
