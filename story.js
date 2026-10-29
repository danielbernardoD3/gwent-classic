"use strict";

/**
 * Story Mode Controller for Gwent Classic
 * Manages Continent Map navigation, campaigns, tournaments, merchants, 
 * card compendium, deck builder synchronization, and rewards.
 */
class StoryMode {
	static SAVE_KEY = "gc-story-save";
	static activeMatch = null;
	static isCustomizingCampaign = false;
	static MAP_WIDTH = 2880;
	static MAP_HEIGHT = 3857;
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
		// Verify story data is loaded
		if (typeof STORY_DATA === "undefined") {
			console.error("STORY_DATA is not defined. Ensure story_data.js is loaded.");
			return;
		}

		// Initialize menu buttons and event listeners
		StoryMode.setupEventListeners();

		// Check if a saved campaign exists
		if (StoryMode.hasSave()) {
			const continueBtn = document.getElementById("btn-story-continue");
			if (continueBtn) continueBtn.classList.remove("hide");
		}
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
				// Ensure collection has proper defaults
				if (!StoryMode.save.collection) StoryMode.save.collection = {};
				if (!StoryMode.save.trophies) StoryMode.save.trophies = [];
				if (!StoryMode.save.completedNodes) StoryMode.save.completedNodes = [];
				if (!StoryMode.save.unlockedNodes) StoryMode.save.unlockedNodes = ["wo_tavern"];
				if (!StoryMode.save.winsCount) StoryMode.save.winsCount = {};
				if (!StoryMode.save.tournamentStates) StoryMode.save.tournamentStates = {};
				if (!StoryMode.save.purchasedShopItems) StoryMode.save.purchasedShopItems = {};
				return true;
			}
		} catch (e) {
			console.error("Error loading Story Mode save:", e);
		}
		return false;
	}

	static saveGame() {
		if (!StoryMode.save) return;
		try {
			localStorage.setItem(StoryMode.SAVE_KEY, JSON.stringify(StoryMode.save));
		} catch (e) {
			console.error("Error saving Story Mode:", e);
		}
	}

	static createNewCampaign(playerName, difficulty, faction) {
		const starter = STORY_DATA.STARTER_DECKS[faction];
		if (!starter) {
			alert("Facção inválida: " + faction);
			return;
		}

		// Build starting collection: exactly the 22 cards + starting leader
		const collection = {};
		collection[starter.leader] = 1;
		starter.cards.forEach(([idx, count]) => {
			collection[idx] = (collection[idx] || 0) + count;
		});

		// Build initial player deck
		const playerDeck = {
			faction: faction,
			leader: starter.leader,
			cards: starter.cards.map(([idx, count]) => [idx, count])
		};

		StoryMode.save = {
			playerName: playerName || "Geralt de Rívia",
			difficulty: difficulty || "medium",
			faction: faction,
			crowns: STORY_DATA.STARTING_CROWNS || 2000,
			currentNode: "wo_tavern",
			unlockedNodes: ["wo_tavern"],
			completedNodes: [],
			winsCount: {},
			trophies: [],
			collection: collection,
			playerDeck: playerDeck,
			purchasedShopItems: {},
			tournamentStates: {},
			stats: {
				matchesWon: 0,
				matchesLost: 0,
				crownsEarned: 0,
				crownsSpent: 0
			}
		};

		StoryMode.saveGame();

		// Update Continue button in menu
		const continueBtn = document.getElementById("btn-story-continue");
		if (continueBtn) continueBtn.classList.remove("hide");

		// Open Story Map
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
				// Don't drag if clicking directly on a pin, control button or modal
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

			// Keep map clamped if window resizes
			window.addEventListener("resize", () => {
				StoryMode.clampPan();
				StoryMode.applyMapTransform();
			});
		}
	}

	static updateFactionPreview(faction) {
		const starter = STORY_DATA.STARTER_DECKS[faction];
		if (!starter || typeof card_dict === "undefined") return;

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
			// Select default realms faction
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

		// Hide setup view
		const setupView = document.getElementById("story-setup-view");
		if (setupView) setupView.classList.add("hide");

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_slash");
		}

		StoryMode.createNewCampaign(name, difficulty, faction);
	}

	static continueCampaign() {
		if (!StoryMode.loadSave()) {
			alert("Nenhum jogo salvo encontrado.");
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

		// Ensure main menu is hidden
		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.add("hide");

		// Hide deck customization & main game canvas
		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) deckCustom.classList.add("hide");
		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.add("hide");

		// Show story map screen
		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.remove("hide");

		// Update HUD
		StoryMode.updateHUD();

		// Render Nodes and Road Paths on Map
		StoryMode.renderMapNodes();

		// Apply active visibility filters (Shops, Tournaments, Locked)
		StoryMode.applyFilters();

		// Center camera on current location
		StoryMode.focusCurrentNode();

		if (typeof MusicManager !== "undefined") {
			MusicManager.play();
		}
	}

	static closeMapToMenu() {
		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.add("hide");

		const menu = document.getElementById("main-menu");
		if (menu) menu.classList.remove("hide");

		if (typeof MenuController !== "undefined") {
			MenuController.showView("nav");
		}
	}

	static updateHUD() {
		if (!StoryMode.save) return;

		// Player name
		const nameEl = document.getElementById("story-hud-player-name");
		if (nameEl) nameEl.textContent = StoryMode.save.playerName;

		// Crowns balance
		const crownsEl = document.getElementById("story-hud-crowns-val");
		if (crownsEl) crownsEl.textContent = Number(StoryMode.save.crowns || 0).toLocaleString("pt-BR");

		// Current node & region
		const currentNodeData = STORY_DATA.NODES[StoryMode.save.currentNode] || STORY_DATA.NODES["wo_tavern"];
		const locationEl = document.getElementById("story-hud-location-name");
		if (locationEl && currentNodeData) {
			locationEl.textContent = `${currentNodeData.region} · ${currentNodeData.name}`;
		}

		// Compendium count
		const compendiumEl = document.getElementById("story-hud-compendium-val");
		if (compendiumEl) {
			const totalCards = 216;
			const ownedUnique = Object.keys(StoryMode.save.collection).filter(k => (StoryMode.save.collection[k] || 0) > 0).length;
			compendiumEl.textContent = `${ownedUnique} / ${totalCards}`;
		}

		// Trophies count & bar
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

			const pin = document.createElement("div");
			pin.id = `node-pin-${node.id}`;
			pin.className = `story-map-pin node-type-${node.type} ${isCompleted ? 'completed' : ''} ${isAvailable ? 'available' : ''} ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`;
			pin.style.left = node.x + "px";
			pin.style.top = node.y + "px";

			// Determine high-contrast pin icon & status text
			let pinIcon = "⚔";
			let statusBadge = "";

			if (node.type === "tournament") {
				pinIcon = isCompleted ? "🏆" : "👑";
				statusBadge = isCompleted ? '<span class="pin-status">✓ Campeão</span>' : '<span class="pin-status tourney">★ Grande Torneio</span>';
			} else if (node.type === "shop") {
				pinIcon = "💰";
				statusBadge = '<span class="pin-status shop">🪙 Mercador</span>';
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
			alert(`Localização Trancada! Vença os desafios anteriores no mapa para desbloquear o caminho até ${node.name}.`);
			return;
		}

		// Move player marker to this node
		StoryMode.save.currentNode = nodeId;
		StoryMode.saveGame();
		StoryMode.updateHUD();

		// Highlight current pin
		document.querySelectorAll(".story-map-pin").forEach(p => p.classList.remove("current"));
		const currentPin = document.getElementById(`node-pin-${nodeId}`);
		if (currentPin) currentPin.classList.add("current");

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
		const wins = StoryMode.save.winsCount[nodeId] || 0;

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

		// Wager & crowns display
		const firstWinCrowns = node.crownsReward || 200;
		const replayCrowns = node.crownsReplay || 50;
		const lossCrowns = node.crownsLoss || 50;

		document.getElementById("story-battle-reward-first").textContent = `+${firstWinCrowns} Coroas`;
		document.getElementById("story-battle-reward-replay").textContent = `+${replayCrowns} Coroas`;
		document.getElementById("story-battle-loss-penalty").textContent = `-${lossCrowns} Coroas`;

		// Card Drop Preview
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
		const state = StoryMode.save.tournamentStates[nodeId] || { roundIndex: 0, active: false };

		document.getElementById("story-tourney-title").textContent = node.name;
		document.getElementById("story-tourney-lore").textContent = node.lore;
		document.getElementById("story-tourney-fee").textContent = `${node.entryFee} Coroas`;
		document.getElementById("story-tourney-prize").textContent = `${node.grandPrizeCrowns} Coroas`;

		// Grand Prize Card Preview
		const grandCardEl = document.getElementById("story-tourney-grand-card");
		if (grandCardEl && node.grandPrizeCard && typeof card_dict !== "undefined") {
			const c = card_dict[node.grandPrizeCard.index];
			if (c) {
				grandCardEl.innerHTML = `
					<div class="story-tourney-card-thumb" style="background-image: url(img/sm/${c.deck}_${c.filename}.jpg)"></div>
					<div class="story-tourney-card-info">
						<span class="gold-text">🏆 Prêmio Máximo</span>
						<strong>${c.name}</strong>
						<small>${c.strength ? 'Força ' + c.strength : 'Especial'} · ${c.ability || ''}</small>
					</div>
				`;
			}
		}

		// Trophy Preview
		const trophyData = STORY_DATA.TROPHIES[node.trophyId];
		const trophyEl = document.getElementById("story-tourney-trophy-preview");
		if (trophyEl && trophyData) {
			trophyEl.innerHTML = `
				<div class="story-tourney-trophy-badge ${isCompleted ? 'earned' : ''}">
					<span class="trophy-icon">${trophyData.icon}</span>
					<div class="trophy-text">
						<strong>${trophyData.title}</strong>
						<small>${isCompleted ? '✓ Conquistado!' : 'Disputa Oficial'}</small>
					</div>
				</div>
			`;
		}

		// Rounds status list
		const roundsContainer = document.getElementById("story-tourney-rounds-list");
		if (roundsContainer) {
			roundsContainer.innerHTML = "";
			node.rounds.forEach((rnd, idx) => {
				const isWon = state.active && state.roundIndex > idx;
				const isCurrent = state.active && state.roundIndex === idx;
				const roundBox = document.createElement("div");
				roundBox.className = `story-tourney-round-box ${isWon ? 'won' : ''} ${isCurrent ? 'active' : ''}`;
				roundBox.innerHTML = `
					<div class="round-num">Batalha ${idx + 1}/3</div>
					<div class="round-op-name">${rnd.opponentName} (${rnd.faction})</div>
					<div class="round-status">${isWon ? '✓ Vencida' : (isCurrent ? '⚔ Luta Atual' : 'Em espera')}</div>
				`;
				roundsContainer.appendChild(roundBox);
			});
		}

		const enterBtn = document.getElementById("story-tourney-enter-btn");
		if (enterBtn) {
			if (isCompleted) {
				enterBtn.textContent = "Rejogar Torneio";
			} else if (state.active) {
				enterBtn.textContent = `Continuar Batalha ${state.roundIndex + 1}/3`;
			} else {
				enterBtn.textContent = `Pagar Inscrição (${node.entryFee} Coroas) & Jogar`;
			}

			enterBtn.onclick = () => {
				// Check entry fee if starting fresh
				if (!state.active) {
					if (StoryMode.save.crowns < node.entryFee) {
						if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
							AudioManager.playSFX("warning");
						}
						alert(`Coroas insuficientes! Você precisa de ${node.entryFee} Coroas para a taxa de inscrição.`);
						return;
					}
					StoryMode.save.crowns -= node.entryFee;
					StoryMode.save.tournamentStates[nodeId] = { roundIndex: 0, active: true };
					StoryMode.saveGame();
					StoryMode.updateHUD();
				}

				StoryMode.closeAllModals();
				const currRound = (StoryMode.save.tournamentStates[nodeId] || {}).roundIndex || 0;
				StoryMode.startMatch(nodeId, currRound);
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
				const remainingStock = Math.max(0, item.max - boughtCount);
				const canAfford = StoryMode.save.crowns >= item.price;
				const isSoldOut = remainingStock <= 0;

				const itemEl = document.createElement("div");
				itemEl.className = `story-shop-card ${isSoldOut ? 'sold-out' : ''}`;
				itemEl.innerHTML = `
					<div class="shop-card-preview" style="background-image: url(img/sm/${card.deck}_${card.filename}.jpg)">
						<span class="shop-card-power">${card.strength || '★'}</span>
					</div>
					<div class="shop-card-info">
						<strong class="shop-card-name">${card.name}</strong>
						<span class="shop-card-faction">${card.deck} · ${card.ability || 'Unidade'}</span>
						<div class="shop-card-price">🪙 ${item.price} Coroas</div>
						<div class="shop-card-stock">${isSoldOut ? 'ESGOTADO' : `Estoque: ${remainingStock}/${item.max}`}</div>
					</div>
					<button class="witcher-menu-btn shop-buy-btn" ${(!canAfford || isSoldOut) ? 'disabled' : ''}>
						${isSoldOut ? 'Vendido' : 'Comprar'}
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
			alert("Coroas insuficientes!");
			return;
		}

		const purchaseKey = `${shopId}_${itemIdx}`;
		const currentBought = StoryMode.save.purchasedShopItems[purchaseKey] || 0;
		if (currentBought >= item.max) {
			alert("Item esgotado!");
			return;
		}

		// Deduct crowns
		StoryMode.save.crowns -= item.price;
		StoryMode.save.purchasedShopItems[purchaseKey] = currentBought + 1;

		// Add card to player collection
		StoryMode.save.collection[item.cardIndex] = (StoryMode.save.collection[item.cardIndex] || 0) + 1;

		// Save and update
		StoryMode.saveGame();
		StoryMode.updateHUD();

		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}

		// Re-render shop
		StoryMode.openShopModal(shopId);
	}

	static openCompendiumModal(filterFaction = "all", filterStatus = "all") {
		const modal = document.getElementById("story-compendium-modal");
		if (!modal || typeof card_dict === "undefined") return;

		StoryMode.compendiumFilterFaction = filterFaction;
		StoryMode.compendiumFilterStatus = filterStatus;

		// Update progress header
		const totalCards = 216;
		const ownedUnique = Object.keys(StoryMode.save.collection).filter(k => (StoryMode.save.collection[k] || 0) > 0).length;
		const pct = Math.round((ownedUnique / totalCards) * 100);

		document.getElementById("story-comp-total-text").textContent = `${ownedUnique} / ${totalCards} Cartas (${pct}%)`;
		const barFill = document.getElementById("story-comp-progress-fill");
		if (barFill) barFill.style.width = `${pct}%`;

		// Filter buttons
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

		// Populate Cards Grid
		const grid = document.getElementById("story-comp-cards-grid");
		if (grid) {
			grid.innerHTML = "";
			card_dict.forEach((card, idx) => {
				// Faction filter
				if (filterFaction !== "all") {
					if (filterFaction === "neutral" && !["neutral", "special", "weather"].includes(card.deck)) return;
					if (filterFaction !== "neutral" && card.deck !== filterFaction) return;
				}

				const ownedCount = StoryMode.save.collection[idx] || 0;
				const isOwned = ownedCount > 0;

				// Status filter
				if (filterStatus === "owned" && !isOwned) return;
				if (filterStatus === "missing" && isOwned) return;

				const hintData = (STORY_DATA.COMPENDIUM_HINTS && STORY_DATA.COMPENDIUM_HINTS[idx]) || {};
				const sourceHint = hintData.source || "Disponível contra adversários e mercadores do Continente.";

				const cardBox = document.createElement("div");
				cardBox.className = `comp-card-item ${isOwned ? 'owned' : 'missing'}`;
				cardBox.innerHTML = `
					<div class="comp-card-thumb" style="background-image: url(img/sm/${card.deck}_${card.filename}.jpg)">
						<span class="comp-card-str">${card.strength || '★'}</span>
						${isOwned ? `<span class="comp-card-count">x${ownedCount}</span>` : '<span class="comp-card-lock">🔒</span>'}
					</div>
					<div class="comp-card-details">
						<strong class="comp-card-title">${card.name}</strong>
						<span class="comp-card-sub">${card.deck} · ${card.ability || card.row || 'Unidade'}</span>
						${isOwned ? '<span class="comp-acquired-tag">✓ Colecionada</span>' : `<span class="comp-hint-text">📍 ${sourceHint}</span>`}
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

		// Hide story map
		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.add("hide");

		// Show deck customization with story-deck-mode applied
		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.remove("hide");
			deckCustom.classList.add("story-deck-mode");
		}

		// Exclusively in Story Mode: hide the Start Game button!
		const startBtn = document.getElementById("start-game");
		if (startBtn) {
			startBtn.classList.add("hide");
			startBtn.style.display = "none";
		}

		// Hide opponent preview (opponents are chosen on map nodes)
		const opPreview = document.getElementById("opponent-preview");
		if (opPreview) {
			opPreview.classList.add("hide");
			opPreview.style.display = "none";
		}

		// Hide standard menu return button
		const standardBack = document.getElementById("btn-back-to-menu");
		if (standardBack) standardBack.classList.add("hide");

		// Show story map return button in top left
		const storyBackToMap = document.getElementById("btn-story-back-to-map");
		if (storyBackToMap) {
			storyBackToMap.classList.remove("hide");
			storyBackToMap.style.display = "inline-flex";
		}

		// Show story deck confirm / return button in center column
		const storyDeckConfirm = document.getElementById("btn-story-deck-confirm");
		if (storyDeckConfirm) {
			storyDeckConfirm.classList.remove("hide");
			storyDeckConfirm.style.display = "flex";
		}

		// Load campaign deck into DeckMaker
		if (window.dm && StoryMode.save) {
			window.dm.elem.classList.remove("hide");
			// Load player faction
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
		const faction = StoryMode.save.playerDeck.faction;

		// Filter all cards that can be used by this faction
		let cards = card_dict.map((c, i) => ({ card: c, index: i })).filter(
			p => [faction, "neutral", "weather", "special"].includes(p.card.deck) && p.card.row !== "leader"
		);

		cards.sort(function (id1, id2) {
			let a = card_dict[id1.index], b = card_dict[id2.index];
			let c1 = { name: a.name, basePower: -a.strength, faction: a.deck };
			let c2 = { name: b.name, basePower: -b.strength, faction: b.deck };
			return Card.compare(c1, c2);
		});

		// Build deck map from active campaign deck
		const deckMap = {};
		if (StoryMode.save.playerDeck.cards) {
			StoryMode.save.playerDeck.cards.forEach(([idx, count]) => {
				deckMap[idx] = count;
			});
		}

		// In Campaign Mode, the bank contains ONLY owned cards!
		cards.forEach(p => {
			const ownedTotal = StoryMode.save.collection[p.index] || 0;
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
		StoryMode.save.playerDeck = {
			faction: window.dm.faction,
			leader: window.dm.leader.index,
			cards: window.dm.deck.filter(x => x.count > 0).map(x => [x.index, x.count])
		};
		StoryMode.saveGame();
	}

	static closeCampaignDeckBuilder() {
		StoryMode.saveCampaignDeckFromCustomization();
		StoryMode.isCustomizingCampaign = false;

		const deckCustom = document.getElementById("deck-customization");
		if (deckCustom) {
			deckCustom.classList.add("hide");
			deckCustom.classList.remove("story-deck-mode");
		}

		// Restore standard elements for normal play outside Story Mode
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

		// Active match context
		StoryMode.activeMatch = {
			nodeId: nodeId,
			node: node,
			isTournament: node.type === "tournament",
			roundIndex: roundIndex,
			opponentName: opponentName,
			firstWin: !StoryMode.save.completedNodes.includes(nodeId)
		};

		// Construct player campaign deck
		const meDeckData = {
			faction: StoryMode.save.playerDeck.faction,
			leader: card_dict[StoryMode.save.playerDeck.leader],
			cards: StoryMode.save.playerDeck.cards.map(([idx, count]) => ({ index: idx, count: count }))
		};

		// Construct opponent deck
		const opDeck = {
			faction: opDeckData.faction,
			leader: card_dict[opDeckData.leader],
			cards: opDeckData.cards.map(c => ({ index: c.index, count: c.count }))
		};

		// Initialize players
		player_me = new Player(0, StoryMode.save.playerName, meDeckData);
		player_op = new Player(1, opponentName, opDeck);

		// Hide story map, show game canvas
		const mapScreen = document.getElementById("story-map-screen");
		if (mapScreen) mapScreen.classList.add("hide");

		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.remove("hide");

		// Start game
		if (typeof game !== "undefined") {
			game.startGame();
		}
	}

	static onMatchEnded(isWin) {
		if (!StoryMode.activeMatch || !StoryMode.save) return;

		const match = StoryMode.activeMatch;
		const node = match.node;

		if (isWin) {
			StoryMode.save.stats.matchesWon = (StoryMode.save.stats.matchesWon || 0) + 1;

			if (match.isTournament) {
				const isFinalRound = match.roundIndex >= (node.rounds.length - 1);
				if (isFinalRound) {
					// Tournament Grand Victory!
					StoryMode.save.crowns += node.grandPrizeCrowns;
					StoryMode.save.stats.crownsEarned += node.grandPrizeCrowns;

					// Award Grand Prize Card
					if (node.grandPrizeCard) {
						StoryMode.save.collection[node.grandPrizeCard.index] = (StoryMode.save.collection[node.grandPrizeCard.index] || 0) + (node.grandPrizeCard.count || 1);
					}

					// Award Regional Trophy
					if (node.trophyId && !StoryMode.save.trophies.includes(node.trophyId)) {
						StoryMode.save.trophies.push(node.trophyId);
					}

					// Mark node completed
					if (!StoryMode.save.completedNodes.includes(match.nodeId)) {
						StoryMode.save.completedNodes.push(match.nodeId);
					}
					StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: 0, active: false };

					// Unlock connected nodes
					(node.connections || []).forEach(connId => {
						if (!StoryMode.save.unlockedNodes.includes(connId)) {
							StoryMode.save.unlockedNodes.push(connId);
						}
					});

					StoryMode.saveGame();
					StoryMode.showVictoryOverlay(node.grandPrizeCrowns, node.grandPrizeCard, node.trophyId, true);
				} else {
					// Advance tournament round
					const nextRound = match.roundIndex + 1;
					StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: nextRound, active: true };
					StoryMode.saveGame();
					StoryMode.showVictoryOverlay(150, null, null, false, nextRound);
				}
			} else {
				// Regular battle victory
				const isFirstWin = !StoryMode.save.completedNodes.includes(match.nodeId);
				const crownsWon = isFirstWin ? (node.crownsReward || 200) : (node.crownsReplay || 50);

				StoryMode.save.crowns += crownsWon;
				StoryMode.save.stats.crownsEarned += crownsWon;
				StoryMode.save.winsCount[match.nodeId] = (StoryMode.save.winsCount[match.nodeId] || 0) + 1;

				let droppedCard = null;
				if (isFirstWin && node.cardDrop) {
					droppedCard = node.cardDrop;
					StoryMode.save.collection[node.cardDrop.index] = (StoryMode.save.collection[node.cardDrop.index] || 0) + (node.cardDrop.count || 1);
				}

				if (!StoryMode.save.completedNodes.includes(match.nodeId)) {
					StoryMode.save.completedNodes.push(match.nodeId);
				}

				// Unlock connected nodes
				(node.connections || []).forEach(connId => {
					if (!StoryMode.save.unlockedNodes.includes(connId)) {
						StoryMode.save.unlockedNodes.push(connId);
					}
				});

				StoryMode.saveGame();
				StoryMode.showVictoryOverlay(crownsWon, droppedCard, null, false);
			}
		} else {
			// Defeat penalty
			StoryMode.save.stats.matchesLost = (StoryMode.save.stats.matchesLost || 0) + 1;
			const lossPenalty = node.crownsLoss || 50;
			StoryMode.save.crowns = Math.max(0, StoryMode.save.crowns - lossPenalty);
			StoryMode.saveGame();

			StoryMode.showDefeatOverlay(lossPenalty, match.isTournament);
		}
	}

	static showVictoryOverlay(crownsWon, cardDrop, trophyId, isTourneyChampion, nextRound) {
		const modal = document.getElementById("story-outcome-modal");
		if (!modal) return;

		document.getElementById("story-outcome-title").textContent = isTourneyChampion ? "★ GRANDE CAMPEÃO DO TORNEIO! ★" : "VITÓRIA NO GWENT!";
		document.getElementById("story-outcome-crowns").textContent = `+${crownsWon} Coroas`;

		const cardContainer = document.getElementById("story-outcome-card-box");
		if (cardContainer) {
			if (cardDrop && typeof card_dict !== "undefined") {
				const c = card_dict[cardDrop.index];
				if (c) {
					cardContainer.classList.remove("hide");
					cardContainer.innerHTML = `
						<span class="gold-text">★ Nova Carta Conquistada!</span>
						<div class="story-outcome-card-thumb" style="background-image: url(img/lg/${c.deck}_${c.filename}.jpg)"></div>
						<strong>${c.name}</strong>
						<small>${c.deck} · ${c.strength ? 'Força ' + c.strength : 'Especial'} · ${c.ability || ''}</small>
					`;
				}
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
					<span class="gold-text">🏆 Troféu Regional Desbloqueado!</span>
					<div class="story-outcome-trophy-badge">
						<span class="trophy-big-icon">${t.icon}</span>
						<strong>${t.title}</strong>
						<small>${t.desc}</small>
					</div>
				`;
			} else {
				trophyBox.classList.add("hide");
				trophyBox.innerHTML = "";
			}
		}

		const actionBtn = document.getElementById("story-outcome-action-btn");
		if (actionBtn) {
			if (nextRound) {
				actionBtn.textContent = `Avançar para Batalha ${nextRound}/3`;
				actionBtn.onclick = () => {
					modal.classList.add("hide");
					StoryMode.startMatch(StoryMode.activeMatch.nodeId, nextRound - 1);
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

	static showDefeatOverlay(crownsLost, isTournament) {
		const modal = document.getElementById("story-outcome-modal");
		if (!modal) return;

		document.getElementById("story-outcome-title").textContent = "DERROTA NO TABULEIRO";
		document.getElementById("story-outcome-crowns").textContent = `-${crownsLost} Coroas perdidas na aposta`;

		const cardContainer = document.getElementById("story-outcome-card-box");
		if (cardContainer) {
			cardContainer.classList.remove("hide");
			cardContainer.innerHTML = `
				<p class="story-defeat-text">
					${isTournament ? 'Você foi eliminado desta rodada do torneio, mas não desista! Pode tentar novamente quando desejar.' : 'Seu adversário levou a melhor nesta rodada. Revise seu baralho e tente novamente!'}
				</p>
			`;
		}

		const trophyBox = document.getElementById("story-outcome-trophy-box");
		if (trophyBox) trophyBox.classList.add("hide");

		const actionBtn = document.getElementById("story-outcome-action-btn");
		if (actionBtn) {
			actionBtn.textContent = "Retornar ao Mapa da Campanha";
			actionBtn.onclick = () => {
				StoryMode.returnFromMatchToMap();
			};
		}

		modal.classList.remove("hide");
	}

	// Safe Return from Story Match directly back to the Continent Map
	static returnFromMatchToMap() {
		// Close outcome fanfare modal if open
		const outcomeModal = document.getElementById("story-outcome-modal");
		if (outcomeModal) outcomeModal.classList.add("hide");

		// Hide gwent end-screen
		const endScreen = document.getElementById("end-screen");
		if (endScreen) endScreen.classList.add("hide");

		// Hide gwent main board if visible
		const mainGame = document.querySelector("main");
		if (mainGame) mainGame.classList.add("hide");

		// Reset game engine and players cleanly
		if (typeof game !== "undefined") {
			game.reset();
			if (typeof player_me !== "undefined") player_me.reset();
			if (typeof player_op !== "undefined") player_op.reset();
		}

		// Clear active match
		StoryMode.activeMatch = null;

		// Reopen continent story map
		StoryMode.openMap();
	}

	// Map Layer Filters (Toggle visibility of Shops, Tournaments, Locked nodes)
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

	// Map Camera & Bounds Engine (Never leaves screen; exact cursor zoom)
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

		// Horizontal bounding: the map never reveals black void on left or right
		const minPanX = vW - scaledW;
		const maxPanX = 0;
		if (minPanX >= 0) {
			StoryMode.mapPanX = (vW - scaledW) / 2;
		} else {
			StoryMode.mapPanX = Math.min(maxPanX, Math.max(minPanX, StoryMode.mapPanX));
		}

		// Vertical bounding: the map never reveals black void on top or bottom
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

		// Pinpoint unscaled map coordinate under cursor
		const cursorX = (pivotX !== undefined && pivotX !== null) ? (pivotX - rect.left) : (rect.width / 2);
		const cursorY = (pivotY !== undefined && pivotY !== null) ? (pivotY - rect.top) : (rect.height / 2);

		const mapX = (cursorX - StoryMode.mapPanX) / StoryMode.mapZoom;
		const mapY = (cursorY - StoryMode.mapPanY) / StoryMode.mapZoom;

		const minZoom = StoryMode.getMinZoom();
		const maxZoom = 2.8;

		// Smooth exponential zoom factor
		const factor = delta > 0 ? (1 + Math.abs(delta)) : (1 / (1 + Math.abs(delta)));
		let newZoom = StoryMode.mapZoom * factor;
		newZoom = Math.min(maxZoom, Math.max(minZoom, newZoom));

		StoryMode.mapZoom = newZoom;
		// Keep the exact map point under cursor
		StoryMode.mapPanX = cursorX - (mapX * newZoom);
		StoryMode.mapPanY = cursorY - (mapY * newZoom);

		StoryMode.clampPan();
		StoryMode.applyMapTransform();
	}

	static focusCurrentNode() {
		const currentNodeData = STORY_DATA.NODES[StoryMode.save.currentNode] || STORY_DATA.NODES["wo_tavern"];
		if (!currentNodeData) return;

		const viewport = document.getElementById("story-map-viewport");
		const vWidth = viewport ? (viewport.clientWidth || window.innerWidth) : window.innerWidth;
		const vHeight = viewport ? (viewport.clientHeight || window.innerHeight) : window.innerHeight;

		const minZoom = StoryMode.getMinZoom();
		// Set comfortable zoom centered on current location
		StoryMode.mapZoom = Math.max(minZoom * 1.35, Math.min(1.2, minZoom + 0.35));

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
