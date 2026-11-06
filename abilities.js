"use strict"

var ability_dict = {
	clear: {
		name: "Clear Weather",
		description: "Removes all Weather Cards (Biting Frost, Impenetrable Fog and Torrential Rain) effects. ",
		audio: "clear"
	},
	frost: {
		name: "Biting Frost",
		description: "Sets the strength of all Close Combat cards to 1 for both players. ",
		audio: "frost"
	},
	fog: {
		name: "Impenetrable Fog",
		description: "Sets the strength of all Ranged Combat cards to 1 for both players. ",
		audio: "fog"
	},
	rain: {
		name: "Torrential Rain",
		description: "Sets the strength of all Siege Combat cards to 1 for both players. ",
		audio: "rain"
	},
	storm: {
		name: "Skellige Storm",
		description: "Reduces the Strength of all Range and Siege Units to 1. ",
		audio: "rain"
	},
	hero: {
		name: "hero",
		description: "Not affected by any Special Cards or abilities. "
	},
	decoy: {
		name: "Decoy",
		audio: "decoy",
		description: "Swap with a card on the battlefield to return it to your hand. "
	},
	horn: {
		name: "Commander's Horn",
		description: "Doubles the strength of all unit cards in that row. Limited to 1 per row. ",
		audio: "horn",
		placed: async card => {
			if (card.holder === player_me && typeof Achievements !== "undefined") {
				Achievements.recordHorn();
			}
			await card.animate("horn");
		}
	},
	mardroeme: {
		name: "Mardroeme",
		description: "Triggers transformation of all Berserker cards on the same row. ",
		placed: async (card, row) => {
			const berserkers = row.findCards(c => c.abilities.includes("berserker"));
			await Promise.all(berserkers.map(async c => await ability_dict["berserker"].placed(c, row)));
		}
	},
	berserker: {
		name: "Berserker",
		description: "Transforms into a bear when a Mardroeme card is on its row. ",
		placed: async (card, row) => {
			if (!row || !row.effects || row.effects.mardroeme <= 0)
				return;
			row.removeCard(card);
			const isYoung = card.name && card.name.indexOf("Young") !== -1;
			const cardId = isYoung ? 207 : 206;
			const holder = card.holder || (row.elem_parent && row.elem_parent.parentElement && row.elem_parent.parentElement.id === "field-op" ? player_op : player_me);
			const bearCard = new Card(card_dict[cardId], holder);
			await row.addCard(bearCard);
		}
	},
	vildkarrl: {
		name: "Vildkaarl",
		description: "Berserker transformado em urso pela ação de Mardroeme.",
		placed: async (card, row) => {
			if (card && card.abilities && card.abilities.includes('vildkarrl'))
			{
				if (typeof card.abilities.remove === "function") {
					card.abilities.remove('vildkarrl');
				} else {
					const idx = card.abilities.indexOf('vildkarrl');
					if (idx !== -1) card.abilities.splice(idx, 1);
				}
				if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
					await AudioManager.playSFX("mardroeme", 1000);
				}
				setTimeout(() => {
					if (card.placed && typeof card.placed.remove === "function") {
						card.placed.remove(ability_dict['vildkarrl'].placed);
					} else if (card.placed && Array.isArray(card.placed)) {
						const idx = card.placed.indexOf(ability_dict['vildkarrl'].placed);
						if (idx !== -1) card.placed.splice(idx, 1);
					}
				}, 5000);
			}
		}
	},
	scorch: {
		name: "Scorch",
		description: "Discard after playing. Kills the strongest card(s) on the battlefield. ",
		activated: async card => {	
			await ability_dict["scorch"].placed(card);
			await board.toGrave(card, card.holder.hand);
		},
		placed: async (card, row) => {
			const getRowMaxExcludingSelf = (r) => {
				let max = [];
				for (let i = 0; i < r.cards.length; ++i) {
					let c = r.cards[i];
					if (c === card || !c.isUnit())
						continue;
					if (!max[0] || max[0].power < c.power)
						max = [c];
					else if (max[0].power === c.power)
						max.push(c);
				}
				return max;
			};
			let maxUnits = board.row.map( r => [r, getRowMaxExcludingSelf(r)] ).filter( p => p[1].length > 0);
			let maxPower = maxUnits.reduce( (a,p) => Math.max(a, p[1][0].power), 0 );
			let scorched = maxUnits.filter( p => p[1][0].power === maxPower);
			let cards = scorched.reduce( (a,p) => a.concat( p[1].map(u => [p[0], u])), []);
			
			if (cards.length)
			{
				if (card.holder === player_me && typeof Achievements !== "undefined") {
					const killedOpponentUnits = cards.some(u => u[0] && u[0].elem_parent && u[0].elem_parent.parentElement && u[0].elem_parent.parentElement.id === "field-op");
					if (killedOpponentUnits) {
						Achievements.recordScorchKill();
					}
				}
				await Promise.all(cards.map( async u => await u[1].animate("scorch", true, false)) );
				await Promise.all(cards.map( async u => await board.toGrave(u[1], u[0])) );
			}
		}
	},
	scorch_c: {
		name: "Scorch - Close Combat",
		description: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more. ",
		placed: async (card) => {
			const row = board.getRow(card, "close", card.holder.opponent());
			if (card.holder === player_me && row.total >= 10 && row.maxUnits().length > 0 && typeof Achievements !== "undefined") {
				Achievements.recordScorchKill();
			}
			await row.scorch();
		}
	},
	scorch_r: {
		name: "Scorch - Ranged",
		description: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more. ",
		placed: async (card) => {
			const row = board.getRow(card, "ranged", card.holder.opponent());
			if (card.holder === player_me && row.total >= 10 && row.maxUnits().length > 0 && typeof Achievements !== "undefined") {
				Achievements.recordScorchKill();
			}
			await row.scorch();
		}
	},
	scorch_s: {
		name: "Scorch - Siege",
		description: "Destroys your enemy's strongest Siege Combat unit(s) if the combined strength of all his or her Siege Combat units is 10 or more. ",
		placed: async (card) => {
			const row = board.getRow(card, "siege", card.holder.opponent());
			if (card.holder === player_me && row.total >= 10 && row.maxUnits().length > 0 && typeof Achievements !== "undefined") {
				Achievements.recordScorchKill();
			}
			await row.scorch();
		}
	},
	agile: {
		name:"agile", 
		description: "Can be placed in either the Close Combat or the Ranged Combat row. Cannot be moved once placed. "
	},
	muster: {
		name:"muster", 
		description: "Find any cards with the same name in your deck and play them instantly. ",
		placed: async (card) => {
			const trimmedCardName = card.name.trim();
			const lowerCardName = trimmedCardName.toLowerCase();
			let pred;

			// Invocação assimétrica:
			// - Gaunter O'Dimm (Cerco) puxa Gaunter O'Dimm - Darkness (e outro Gaunter se houver)
			// - Gaunter O'Dimm - Darkness (Longa Distância) só puxa outros Darkness (NUNCA a carta de Cerco)
			if (lowerCardName.includes("darkness")) {
				pred = c => c.name.toLowerCase().includes("darkness") && c.row !== "siege";
			} else if (lowerCardName.startsWith("gaunter")) {
				pred = c => c.name.toLowerCase().startsWith("gaunter");
			}
			// - Arachas- Behemoth (Cerco) puxa Arachas (Corpo a Corpo) (e outro Behemoth se houver)
			// - Arachas (Corpo a Corpo) só puxa outros Arachas (NUNCA Arachas- Behemoth de Cerco)
			else if (lowerCardName.includes("behemoth") || (lowerCardName.startsWith("aracha") && card.row === "siege")) {
				pred = c => c.name.toLowerCase().startsWith("aracha");
			} else if (lowerCardName.startsWith("aracha")) {
				pred = c => c.name.toLowerCase().startsWith("aracha") && !c.name.toLowerCase().includes("behemoth") && c.row !== "siege";
			}
			// Demais tropas de Reunir padrão (ex: Moiras, Vampiros, Nekkers, Ghouls, etc.)
			else {
				let i = card.name.indexOf('-');
				let cardName = (i === -1 ?  card.name : card.name.substring(0, i)).trim();
				if (card['muster'])
				{
					cardName = card['muster'].trim();
				}
				if (card.holder === player_me && cardName === "Roach" && typeof Achievements !== "undefined") {
					Achievements.recordRoach();
				}
				pred = c => c.name.trim().startsWith(cardName);
			}
			let units = card.holder.hand.getCards(pred).map(x => [card.holder.hand, x])
			.concat(card.holder.deck.getCards(pred).map( x => [card.holder.deck, x] ) );
			if (units.length === 0)
				return;
			await card.animate("muster");
			await Promise.all(units.map(async p => {
				const unitCard = p[1];
				const targetRowName = (unitCard.row === "agile")
					? ((unitCard.holder && typeof ControllerAI !== "undefined" && unitCard.holder.controller instanceof ControllerAI)
						? unitCard.holder.controller.determineAgileRow(unitCard).type
						: "close")
					: unitCard.row;
				await board.addCardToRow(unitCard, targetRowName, unitCard.holder, p[0]);
			}));
		}
	},
	spy: {
		name: "spy",
		description: "Place on your opponent's battlefield (counts towards your opponent's total) and draw 2 cards from your deck. ",
		audio: "spy",
		placed: async (card) => {
			await card.animate("spy");
			for (let i=0;i<2;i++) {
				if (card.holder.deck.cards.length > 0)
					await card.holder.deck.draw(card.holder.hand);
			}
			card.holder = card.holder.opponent();
			AudioManager.playSFX('draw');
		}
	},
	medic: {
		name: "medic",
		description: "Choose one card from your discard pile and play it instantly (no Heroes or Special Cards). ",
		audio: "medic",
		placed: async (card) => {
			let grave = board.getRow(card, "grave", card.holder);
			let units = card.holder.grave.findCards(c => c.isUnit());
			if (units.length <= 0)
				return;
			let wrapper = {card : null};
			let peerRowType = null;
			let localTargetEntry = null;
			if (game.randomRespawn) {
				const cards = grave.findCardsRandom(c => c.isUnit());
				if (cards.length > 0)
					wrapper.card = cards[0];
			} else if (card.holder.controller instanceof ControllerAI) {
				wrapper.card = card.holder.controller.medic(card, grave);
			} else if (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer) {
				const peerCtrl = card.holder.controller;
				let targetName = null;
				if (Array.isArray(peerCtrl.nextMedicTargets) && peerCtrl.nextMedicTargets.length > 0) {
					const entry = peerCtrl.nextMedicTargets.shift();
					if (typeof entry === "string") {
						targetName = entry;
					} else if (entry && entry.name) {
						targetName = entry.name;
						peerRowType = entry.rowType || null;
					}
				} else if (peerCtrl.nextMedicTarget) {
					targetName = peerCtrl.nextMedicTarget;
					peerCtrl.nextMedicTarget = null;
				}
				if (targetName) {
					wrapper.card = grave.cards.find(c => c.name === targetName && c.isUnit());
				}
				if (!wrapper.card) {
					wrapper.card = units[0];
				}
			} else if (game.isAutoPlayingTimeout) {
				wrapper.card = units[0];
				if (typeof VersusMode !== "undefined" && VersusMode.isActive && card.holder === player_me && wrapper.card) {
					VersusMode.pendingMedicTarget = wrapper.card.name;
					localTargetEntry = { name: wrapper.card.name, rowType: "close" };
					if (!Array.isArray(VersusMode.pendingMedicTargets)) VersusMode.pendingMedicTargets = [];
					VersusMode.pendingMedicTargets.push(localTargetEntry);
				}
			} else {
				await ui.queueCarousel(card.holder.grave, 1, (c, i) => {
					wrapper.card = c.cards[i];
					if (typeof VersusMode !== "undefined" && VersusMode.isActive && card.holder === player_me && wrapper.card) {
						VersusMode.pendingMedicTarget = wrapper.card.name;
						localTargetEntry = { name: wrapper.card.name, rowType: null };
						if (!Array.isArray(VersusMode.pendingMedicTargets)) VersusMode.pendingMedicTargets = [];
						VersusMode.pendingMedicTargets.push(localTargetEntry);
					}
				}, c => c.isUnit(), true);
			}
			if (wrapper.card)
			{
				if (card.holder === player_me && typeof Achievements !== "undefined") {
					Achievements.recordMedic();
				}
				// move card visual to top of grave
				const res = wrapper.card;
				grave.removeCard(res);
				grave.addCard(res);
				let selectedRow = null;
				const isAgile = wrapper.card.row === "agile";
				if (isAgile)
				{
					if (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer && peerRowType)
					{
						selectedRow = board.getRow(res, peerRowType, player_op);
					}
					else if (card.holder.controller instanceof ControllerAI || (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer) || (typeof game !== "undefined" && game.isAutoPlayingTimeout))
					{
						const holder = card.holder || player_me;
						const close = board.getRow(res, "close", holder);
						const ranged = board.getRow(res, "ranged", holder);
						const closeVirtual = close.getVirtualCopy();
						const rangedVirtual = ranged.getVirtualCopy();

						closeVirtual.cards.push(res);
						closeVirtual.updateState(res, true);
						rangedVirtual.cards.push(res);
						rangedVirtual.updateState(res, true);

						const closeDif = closeVirtual.calcScore() - close.calcScore();
						const rangedDif = rangedVirtual.calcScore() - ranged.calcScore();
						const rowName = closeDif > rangedDif ? "close" 
							: closeDif < rangedDif ? "ranged"
							: "close";
						selectedRow = board.getRow(res, rowName, holder);
						if (localTargetEntry && typeof VersusMode !== "undefined") {
							localTargetEntry.rowType = rowName;
						}
					}
					else
					{
						selectedRow = await ui.waitForRowSelection(wrapper.card);
						if (!selectedRow)
						{
							return;
						}
						if (localTargetEntry && typeof VersusMode !== "undefined") {
							localTargetEntry.rowType = VersusMode.getRowTypeFromRow(selectedRow);
						}
					}

				}
				await res.animate("medic");
				if (isAgile)
				{
					await board.moveTo(res, selectedRow, grave);
				}
				else
				{
					await res.autoplay(grave);
				}
			}
		}
	},
	morale: {
		name: "Morale",
		description: "Adds +1 to all units in the row (excluding itself). ",
		audio: "morale",
		placed: async card => {
			await card.animate("morale");
		}
	},
	bond: {
		name: "Tight Bond",
		description: "Place next to a card with the same name to double the strength of both cards. ",
		audio: "bond",
		placed: async (card, row) => {
			let targetRow = row || board.getRow(card, card.row === "agile" ? "close" : card.row, card.holder);
			if (!targetRow) return;
			let bonds = targetRow.findCards(c => c.name === card.name);
			if (bonds.length > 1)
				await Promise.all( bonds.map(c => c.animate("bond")) );
		}
	},
	avenger: {
		name: "Avenger",
		description: "When this card is removed from the battlefield, it summons a powerful new Unit Card to take its place. ",
		removed: async (card) => {
			if (typeof game === "undefined" || !game.isPlaying())
				return;
			let bdf = new Card(card_dict[21], card.holder);
			bdf.removed.push( () => setTimeout( () => {
				if (game.isPlaying() && bdf.holder && bdf.holder.grave && bdf.holder.grave.cards.includes(bdf))
					bdf.holder.grave.removeCard(bdf);
			}, 1001) );
			await board.addCardToRow(bdf, "close", card.holder);
		},
		weight: () => 50
	},
	avenger_kambi: {
		name: "Avenger",
		description: "When this card is removed from the battlefield, it summons a powerful new Unit Card to take its place. ",
		removed: async card => {
			if (typeof game === "undefined" || !game.isPlaying())
				return;
			let bdf = new Card(card_dict[196], card.holder);
			bdf.removed.push( () => setTimeout( () => {
				if (game.isPlaying() && bdf.holder && bdf.holder.grave && bdf.holder.grave.cards.includes(bdf))
					bdf.holder.grave.removeCard(bdf); 
			}, 1001) );
			await board.addCardToRow(bdf, "close", card.holder);
		},
		weight: () => 50
	},
	foltest_king: {
		description: "Pick an Impenetrable Fog card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Impenetrable Fog");
			if (out)
				await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "fog")
	},
	foltest_lord: {
		description: "Clear any weather effects (resulting from Biting Frost, Torrential Rain or Impenetrable Fog cards) in play.",
		activated: async () => await weather.clearWeather(),
		weight: (card, ai) =>  ai.weightCard( {row:"weather", name:"Clear Weather"} )
	},
	foltest_siegemaster: {
		description: "Doubles the strength of all your Siege units (unless a Commander's Horn is also present on that row).",
		activated: async card => await board.getRow(card, "siege", card.holder).leaderHorn(),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "siege", card.holder))
	},
	foltest_steelforged: {
		description: "Destroy your enemy's strongest Siege unit(s) if the combined strength of all his or her Siege units is 10 or more.",
		activated: async card => await ability_dict["scorch_s"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "siege")
	},
	foltest_son: {
		description: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more.",
		activated: async card => await ability_dict["scorch_r"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "ranged")
	},
	emhyr_imperial: {
		description: "Pick a Torrential Rain card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Torrential Rain");
			if (out)
				await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "rain")
	},
	emhyr_emperor: {
		description: "Look at 3 random cards from your opponent's hand.",
		activated: async card => {
			if (card.holder.controller instanceof ControllerAI || (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer))
				return;
			let container = new CardContainer();
			container.cards = card.holder.opponent().hand.findCardsRandom(() => true, 3);
			Carousel.curr?.cancel();
			await ui.viewCardsInContainer(container);
		},
		weight: card => {
			let count = card.holder.opponent().hand.cards.length;
			return count === 0 ? 0 : Math.max(10, 10 * (8 - count));
		}
	},
	emhyr_whiteflame: {
		description: "Cancel your opponent's Leader Ability."
	},
	emhyr_relentless: {
		description: "Draw a card from your opponent's discard pile.",
		activated: async card => {
			let grave = board.getRow(card, "grave", card.holder.opponent());
			const validUnits = grave.findCards(c => c.isUnit());
			if (validUnits.length === 0)
				return;
			if (card.holder.controller instanceof ControllerAI) {
				let newCard = card.holder.controller.medic(card, grave);
				newCard.holder = card.holder;
				await board.toHand(newCard, grave);
				return;
			}
			if (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer) {
				const lData = card.holder.controller.nextLeaderData || {};
				let newCard = lData.targetName ? grave.cards.find(c => c.name === lData.targetName && c.isUnit()) : null;
				if (!newCard) newCard = validUnits[0];
				if (newCard) {
					newCard.holder = card.holder;
					await board.toHand(newCard, grave);
				}
				return;
			}
			Carousel.curr?.cancel();
			await ui.queueCarousel(grave, 1, async (c,i) => {
				let newCard = c.cards[i];
				if (typeof VersusMode !== "undefined" && VersusMode.isActive && card.holder === player_me && newCard) {
					VersusMode.pendingLeaderData = { targetName: newCard.name };
				}
				newCard.holder = card.holder;
				await board.toHand(newCard, grave);
			}, c => c.isUnit(), true);
		},
		weight: (card, ai, max, data) => ai.weightMedic(data, 0, card.holder.opponent())
	},
	emhyr_invader: {
		description: "Abilities that restore a unit to the battlefield restore a randomly-chosen unit. Affects both players.",
		gameStart: () => game.randomRespawn = true
	},
	eredin_commander: {
		description: "Double the strength of all your Close Combat units (unless a Commander's horn is 	also present on that row).",
		activated: async card => await board.getRow(card, "close", card.holder).leaderHorn(),
		weight: (card, ai) => {
			const row = board.getRow(card, "close", card.holder);
			if (row.special !== null) return 0;
			return row.cards.filter(c => c.isUnit() && !c.isHero()).reduce((s, c) => s + c.power, 0);
		}
	},
	eredin_bringer_of_death: {
		name: "Eredin : Bringer of Death",
		description: "Restore a card from your discard pile to your hand.",
		activated: async card => {
			let newCard;
			const validUnits = card.holder.grave.findCards(c => c.isUnit());
			if (validUnits.length === 0) return;
			if (card.holder.controller instanceof ControllerAI) {
				newCard = card.holder.controller.medic(card, card.holder.grave);
			} else if (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer) {
				const lData = card.holder.controller.nextLeaderData || {};
				newCard = lData.targetName ? card.holder.grave.cards.find(c => c.name === lData.targetName && c.isUnit()) : validUnits[0];
			} else {
				Carousel.curr?.exit();
				await ui.queueCarousel(card.holder.grave, 1, (c,i) => {
					newCard = c.cards[i];
					if (typeof VersusMode !== "undefined" && VersusMode.isActive && card.holder === player_me && newCard) {
						VersusMode.pendingLeaderData = { targetName: newCard.name };
					}
				}, c => c.isUnit(), false, false);
			}
			if (newCard)
				await board.toHand(newCard, card.holder.grave);
		},
		weight: (card, ai, max, data) => Math.max(0, ai.weightMedic(data, 0, card.holder) || 0)
	},
	eredin_destroyer: {
		description: "Discard 2 card and draw 1 card of your choice from your deck.",
		activated: async (card) => {
			let hand = card.holder.hand;
			let deck = card.holder.deck;
			if (card.holder.controller instanceof ControllerAI) {
				let cards = card.holder.controller.discardOrder(card).splice(0,2).filter(c => c.basePower < 7);
				if (cards.length > 0) {
					await Promise.all(cards.map(async c => await board.toGrave(c, card.holder.hand)));
					if (card.holder.deck.cards.length > 0) {
						await card.holder.deck.draw(card.holder.hand);
					}
				}
				return;
			}
			if (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer) {
				const lData = card.holder.controller.nextLeaderData || {};
				const discarded = Array.isArray(lData.discardedNames) ? lData.discardedNames : [];
				for (const dName of discarded) {
					const found = hand.cards.find(c => c.name === dName);
					if (found) await board.toGrave(found, hand);
				}
				const drawn = lData.drawnName ? deck.cards.find(c => c.name === lData.drawnName) : deck.cards[0];
				if (drawn) await board.toHand(drawn, deck);
				return;
			}
			Carousel.curr?.exit();
			const discardedNames = [];
			let drawnName = null;
			const discardCount = Math.min(2, hand.cards.length);
			if (discardCount > 0) {
				await ui.queueCarousel(hand, discardCount, async (c,i) => {
					if (c.cards[i]) discardedNames.push(c.cards[i].name);
					await board.toGrave(c.cards[i], c);
				}, () => true);
			}
			if (deck.cards.length > 0) {
				await ui.queueCarousel(deck, 1, async (c,i) => {
					if (c.cards[i]) drawnName = c.cards[i].name;
					await board.toHand(c.cards[i], deck);
				}, () => true, true);
			}
			if (typeof VersusMode !== "undefined" && VersusMode.isActive && card.holder === player_me) {
				VersusMode.pendingLeaderData = { discardedNames, drawnName };
			}
		},
		weight: (card, ai) => {
			let cards = ai.discardOrder(card).splice(0,2).filter(c => c.basePower < 7);
			if (cards.length < 2)
				return 0;
			return cards[0].abilities.includes("muster") ? 50 : 25;
		}
	},
	eredin_king: {
		description: "Pick any weather card from your deck and play it instantly.",
		activated: async card => {
			let deck = card.holder.deck;
			if (card.holder.controller instanceof ControllerAI) {
				const h = ability_dict["eredin_king"].helper(card);
				if (h && h.card) {
					await h.card.autoplay(card.holder.deck);
				}
			} else if (typeof ControllerPeer !== "undefined" && card.holder.controller instanceof ControllerPeer) {
				const lData = card.holder.controller.nextLeaderData || {};
				const wCard = lData.weatherName
					? deck.cards.find(c => c.name === lData.weatherName)
					: deck.cards.find(c => c.faction === "weather" || c.row === "weather");
				if (wCard) await board.toWeather(wCard, deck);
			} else {
				Carousel.curr?.cancel();
				await ui.queueCarousel(deck, 1, async (c,i) => {
					if (typeof VersusMode !== "undefined" && VersusMode.isActive && card.holder === player_me && c.cards[i]) {
						VersusMode.pendingLeaderData = { weatherName: c.cards[i].name };
					}
					await board.toWeather(c.cards[i], deck);
				}, c => c.faction === "weather", true);
			}
		},
		weight: (card, ai, max) => Math.max(0, ability_dict["eredin_king"].helper(card)?.weight || 0),
		helper: card => {
			let weather = card.holder.deck.cards.filter(c => c.row === "weather").reduce((a,c) =>a.map(c => c.name).includes(c.name) ? a : a.concat([c]), [] );
			
			let out, weight = 0;
			weather.forEach( c => {
				let w = card.holder.controller.weightWeatherFromDeck(c, c.abilities[0]);
				if (w > weight) {
					weight = w;
					out = c;
				}
			});
			return {card: out, weight: Math.max(0, weight)};
		}			
	},
	eredin_treacherous: {
		description: "Doubles the strength of all spy cards (affects both players).",
		weight: () => 0,
		gameStart: () => game.doubleSpyPower = true
	},
	francesca_queen: {
		description: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more.",
		activated: async card => await ability_dict["scorch_c"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "close")
	},
	francesca_beautiful: {
		description: "Doubles the strength of all your Ranged Combat units (unless a Commander's Horn is also present on that row).",
		activated: async card => await board.getRow(card, "ranged", card.holder).leaderHorn(),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "ranged", card.holder))
	},
	francesca_daisy: {
		description: "Draw an extra card at the beginning of the battle.",
		placed: card => game.gameStart.push( () => {
			if (card.holder && card.holder.deck && card.holder.deck.cards.length > 0) {
				let draw = card.holder.deck.removeCard(0);
				card.holder.hand.addCard( draw );
			}
			return true;
		})
	},
	francesca_pureblood: {
		description: "Pick a Biting Frost card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Biting Frost");
			if (out)
				await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "frost")
	},
	francesca_hope: {
		description: "Move agile units to whichever valid row maximizes their strength (don't move units already in optimal row).",
		activated: async card => {
			const close = board.getRow(card, "close");
			const ranged =  board.getRow(card, "ranged");
			const solution = ability_dict["francesca_hope"].helper(card);
			await Promise.all(solution.cards.map(async p => await board.moveTo(p.card, p.row === close ? ranged : close, p.row) ) );
		},
		weight: card => {
			const {score, cards} = ability_dict["francesca_hope"].helper(card);
			return score;
		},
		helper: card => {
			const close = board.getRow(card, "close");
			const ranged = board.getRow(card, "ranged");
			const agileCards = close.cards.filter(c => c.row === "agile").concat(ranged.cards.filter(c => c.row === "agile"));
			const notAgilePred = c => c.row !== "agile";
			const closeNorm = close.getVirtualCopy(notAgilePred);
			const rangedNorm = ranged.getVirtualCopy(notAgilePred);
			const {score, pattern} = findBest(closeNorm, rangedNorm, agileCards);
			// filter for only cards that need to change row and return
			return {
				score: score,
				cards: agileCards.map((c)=> { return {card: c, row: close.cards.includes(c) ? close : ranged}; })
				.filter((pair, i) => (pair.row === close) !== (pattern[i]===0))
			};

			function findBest(close, ranged, agile, depth = 0, pattern=null)
			{
				if (agile.length === 0)
					return {score: -1, pattern: []};
				else if (agile.length === depth)
				{
					const closeCopy = close.getVirtualCopy();
					const rangedCopy = ranged.getVirtualCopy();
					for (let i=0; i <agile.length; ++i)
					{
						const row = pattern[i] === 0 ? closeCopy : rangedCopy;
						row.cards.push(agile[i]);
						row.updateState(agile[i], true);
					}
					return {score: closeCopy.calcScore() + rangedCopy.calcScore() - (close.calcScore() + ranged.calcScore()), pattern: pattern};
				}
				if (depth === 0)
				{
					pattern = Array(agile.length).fill(0);
				}
				const left = findBest(close, ranged, agile, depth + 1, pattern)
				const modPattern = pattern.slice();
				modPattern[depth] = 1;
				const right = findBest(close, ranged, agile, depth + 1, modPattern);
				return left.score >= right.score ? left : right;
			}
		}
	},
	crach_an_craite: {
		description: "Shuffle all cards from each player's graveyard back into their decks.",
		activated: async card => {
			AudioManager.playSFX('redraw');
			const myGraveCards = [...card.holder.grave.cards];
			const opGraveCards = [...card.holder.opponent().grave.cards];
			await Promise.all([
				...myGraveCards.map(c => board.toDeck(c, card.holder.grave)),
				...opGraveCards.map(c => board.toDeck(c, card.holder.opponent().grave))
			]);
		},
		weight: (card, ai, max, data) => {
			if( game.roundCount < 2)
				return 0;
			let medics = card.holder.hand.findCard(c => c.abilities.includes("medic"));
			if (medics !== undefined)
				return 0;
			let spies = card.holder.hand.findCard(c => c.abilities.includes("spy"));
			if (spies !== undefined)
				return 0;
			if (card.holder.hand.findCard(c => c.abilities.includes("decoy")) !== undefined && (data.medic.length || data.spy.length && card.holder.deck.findCard(c => c.abilities.includes("medic")) !== undefined) )
				return 0;
			return 15;
		}
	},
	king_bran: {
		description: "Units only lose half their Strength in bad weather conditions.",
		placed: card => board.row.filter((c,i) => card.holder === player_me ^ i<3).forEach(r => r.effects.halfWeather = true)
	}
};

// Automatically attach dynamic I18N getters for all abilities in ability_dict
for (const [key, obj] of Object.entries(ability_dict)) {
	const defaultName = obj.name;
	const defaultDesc = obj.description;

	if (defaultName !== undefined) {
		Object.defineProperty(obj, "name", {
			get() {
				const i18nKey = "ability_" + key + "_name";
				if (typeof I18N !== "undefined" && I18N.translations && I18N.translations.en && I18N.translations.en[i18nKey]) {
					return I18N.t(i18nKey);
				}
				return defaultName;
			},
			configurable: true
		});
	}

	if (defaultDesc !== undefined) {
		Object.defineProperty(obj, "description", {
			get() {
				const i18nKey = "ability_" + key + "_desc";
				if (typeof I18N !== "undefined" && I18N.translations && I18N.translations.en && I18N.translations.en[i18nKey]) {
					return I18N.t(i18nKey);
				}
				return defaultDesc;
			},
			configurable: true
		});
	}
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = ability_dict;
}