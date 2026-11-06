// ============================================================================
// GWENT CLASSIC — BACKUP OFICIAL DA IA (v1.2.8 — ANTES DA REFORMULAÇÃO v1.3.0)
// Gerado em: 2026-11-06T02:26:14.011Z
// Contém:
//   1. ControllerAI completo (gwent.js linhas 21-550)
//   2. DeckMaker.constructOpponentDeck (gwent.js linhas 4442-4480)
//   3. StoryMode.startMatch (story.js linhas 2448-2575)
//   4. premade_deck completo (decks.js)
// ============================================================================

// --- [1] ControllerAI (gwent.js:21-550) ---
// Makes decisions for the AI opponent player
class ControllerAI {
	constructor(player) {
		this.player = player;
	}
	
	async fallbackPlayOrPass(player, excludeCard = null) {
		const playable = player.hand.cards.filter(c => c !== excludeCard && (c.isUnit() || c.isHero() || c.row === "weather"));
		if (playable.length > 0) {
			await player.playCard(playable[0]);
		} else {
			player.passRound(true);
		}
	}

	// Collects data and weighs options before taking a weighted random action
	async startTurn(player){
		try {
			if (player.opponent().passed && (player.winning || 
					player.deck.faction === "nilfgaard" && player.total === player.opponent().total) ){
				await player.passRound();
				return;
			}
			let data_max = this.getMaximums();
			let data_board = this.getBoardData();
			let weights = player.hand.cards.map(c => 
				({weight: Math.max(0, this.weightCard(c, data_max, data_board) || 0), action: async () => await this.playCard(c, data_max, data_board)}) );
			if (player.leaderAvailable && player.leader && player.leader.activated && player.leader.activated.length > 0) {
				const lWeight = Math.max(0, this.weightLeader(player.leader, data_max, data_board) || 0);
				weights.push( {weight: lWeight, action: async () => await player.activateLeader()} );
			}
			weights.push( {weight: Math.max(0, this.weightPass() || 0), action: async () => await player.passRound()} );
			let weightTotal = weights.reduce( (a,c) => a + c.weight, 0);
			if (weightTotal <= 0){
				for (let i=0; i<player.hand.cards.length; ++i) {
					let card = player.hand.cards[i];
					if (card.row === "weather" && this.weightWeather(card) > -1 || card.abilities.includes("avenger")) {
						await weights[i].action();
						return;
					}
				}
				await this.fallbackPlayOrPass(player);
			} else {
				const diff = (typeof Settings !== "undefined" && Settings.difficulty) 
					? Settings.difficulty.value 
					: (localStorage.getItem("gc-difficulty") || "medium");

				if (diff === "hard") {
					// Hard: Sort actions by calculated weight descending and pick optimal move
					weights.sort((a,b) => b.weight - a.weight);
					let chosen = (weights.length > 1 && Math.random() < 0.12 && weights[1].weight > 0) ? weights[1] : weights[0];
					await (chosen ? chosen.action() : this.fallbackPlayOrPass(player));
				} else if (diff === "easy") {
					// Easy: Relaxed strategy with 35% chance to play casually/suboptimally
					if (Math.random() < 0.35 && weights.length > 1) {
						let playWeights = weights.filter(w => w.weight > 0);
						if (playWeights.length > 0) {
							let randIdx = randomInt(playWeights.length);
							await playWeights[randIdx].action();
						} else {
							await (weights[0] ? weights[0].action() : this.fallbackPlayOrPass(player));
						}
					} else {
						let rand = randomInt(weightTotal);
						let chosenAction = null;
						for (var i=0; i < weights.length; ++i) {
							rand -= weights[i].weight;
							if (rand < 0) {
								chosenAction = weights[i].action;
								break;
							}
						}
						await (chosenAction ? chosenAction() : (weights[0] ? weights[0].action() : this.fallbackPlayOrPass(player)));
					}
				} else {
					// Medium: Original weighted random logic
					let rand = randomInt(weightTotal);
					let chosenAction = null;
					for (var i=0; i < weights.length; ++i) {
						rand -= weights[i].weight;
						if (rand < 0) {
							chosenAction = weights[i].action;
							break;
						}
					}
					await (chosenAction ? chosenAction() : (weights[0] ? weights[0].action() : this.fallbackPlayOrPass(player)));
				}
			}
		} catch (err) {
			console.error("[ControllerAI] Erro durante o turno da IA:", err);
			await this.fallbackPlayOrPass(player);
		}
	}
	
	// Collects data about card with the hightest power on the board
	getMaximums(){
		let rmax = board.row.map(r =>  ({row: r, cards: r.cards.filter(c => c.isUnit()).reduce( (a,c) => 
			(!a.length|| a[0].power < c.power) ? [c] : a[0].power === c.power ? a.concat([c]) : a
		, []) }) );
		
		let max = rmax.filter((r,i) => r.cards.length && i < 3).reduce((a,r) => Math.max(a, r.cards[0].power), 0);
		let max_me = rmax.filter((r,i) => i < 3 && r.cards.length && r.cards[0].power === max).reduce((a,r) => 
			a.concat(r.cards.map(c => ({row:r, card:c})))
		, []);
		
		max = rmax.filter((r,i) => r.cards.length && i > 2).reduce((a,r) => Math.max(a, r.cards[0].power), 0);
		let max_op = rmax.filter((r,i) => i > 2 && r.cards.length && r.cards[0].power === max).reduce((a,r) => 
			a.concat(r.cards.map(c => ({row:r, card:c})))
		, []);
		
		return {rmax: rmax, me: max_me, op: max_op};
	}
	
	// Collects data about the types of cards on the board and in each player's graves
	getBoardData(){
		let data = this.countCards(new CardContainer());
		Object.keys([0,1,2]).map(i => board.row[i]).forEach(r => this.countCards(r, data));
		data.grave_me = this.countCards(this.player.grave);
		data.grave_op = this.countCards(this.player.opponent().grave);
		return data;
	}
	
	// Catalogs the kinds of cards in a given CardContainer
	countCards(container, data){
		data = data ? data : {spy: [], medic: [], bond: {}, scorch: []};
		container.cards.filter(c => c.isUnit()).forEach(c => {
			for (let x of c.abilities) {
				switch (x) {
					case "spy":
					case "medic":
						data[x].push(c);
						break;
					case "scorch_r": case "scorch_c": case "scorch_s":
						data["scorch"].push(c);
						break;
					case "bond":
						if (!data.bond[c.name])
							data.bond[c.name] = 0;
						data.bond[c.name]++;
				}
			}
		});
		return data;
	}
	
	// Swaps a card from the hand with the deck if beneficial
	redraw() {
		const card = this.discardOrder({holder:this.player})[0];
		if (card && card.power < 15) {
			this.player.deck.swap(this.player.hand, card);
		}
	}
	
	// Orders discardable cards from most to least discardable
	discardOrder(card) {
		let cards = [];
		let groups = {};
		let musters = card.holder.hand.cards.filter(c => c.abilities.includes("muster"));
		while (musters.length > 0) {
			let curr = musters.pop();
			let i = curr.name.indexOf('-');
			let name = i === -1 ? curr.name : curr.name.substring(0, i).trim();
			if (!groups[name])
				groups[name] = [];
			let group = groups[name];
			group.push(curr);
			for (let j=musters.length-1; j>=0; j--)
				if (musters[j].name.startsWith(name))
					group.push( musters.splice(j,1)[0] );
		}
		
		for (let group of Object.values(groups)) {
			group.sort(Card.compare);
			group.pop();
			cards.push(...group);
		}
		
		let weathers = card.holder.hand.cards.filter(c => c.row === "weather");
		if (weathers.length > 1){
			weathers.splice(randomInt(weathers.length), 1);
			cards.push(...weathers);
		}
		
		let normal = card.holder.hand.cards.filter(c => c.abilities.length === 0);
		normal.sort(Card.compare);
		cards.push(...normal);
		return cards;
	}
	
	// Tells the Player that this object controls to play a card
	async playCard(c, max, data){
		if (c.name === "Commander's Horn")
			await this.horn(c);
		else if (c.name === "Mardroeme")
			await this.mardroeme(c);
		else if (c.name === "Decoy")
			await this.decoy(c, max, data);
		else if (c.name === "Scorch")
			await this.scorch(c, max, data);
		else
			await this.player.playCard(c);
	}
	
	// Plays a Commander's Horn to the most beneficial row. Assumes at least one viable row.
	async horn(card){
		let rows = [0,1,2].map(i => board.row[i]).filter(r => r.special === null);
		let max_row = rows[0] || null;
		let max = 0;
		for (let i=0; i<rows.length; ++i) {
			let r = rows[i];
			let dif = [0, 0];
			this.calcRowPower(r, dif, true);
			r.effects.horn++;
			this.calcRowPower(r, dif, false);
			r.effects.horn--;
			let score = dif[1] - dif[0];
			if (max < score){
				max = score;
				max_row = r;
			}
		}
		if (!max_row) {
			await this.fallbackPlayOrPass(this.player, card);
			return;
		}
		await this.player.playCardToRow(card, max_row);
	}
	
	// Plays a Mardroeme to the most beneficial row. Assumes at least one viable row.
	async mardroeme(card){ // TODO skellige
		let row = board.row[1], max = 0;
		for (let i=1; i<3; i++){
			let curr = this.weightMardroemeRow(card, board.row[i]);
			if (curr > max){
				max = curr;
				row = board.row[i];
			}
		}
		if (!row) row = board.row[1];
		await this.player.playCardToRow(card, row);
	}
	
	// Selects a card to remove from a Grave. Assumes at least one valid card.
	medic(card, grave){
		let data = this.countCards(grave);
		let targ;
		if (data.spy.length){
			let min = data.spy.reduce( (a,c) => Math.min(a, c.power), Number.MAX_VALUE);
			targ = data.spy.filter(c => c.power === min)[0];
		} else if (data.medic.length) {
			let max = data.medic.reduce( (a,c) => Math.max(a, c.power), Number.MIN_VALUE);
			targ = data.medic.filter(c => c.power === max)[0];
		} else if (data.scorch.length) {
			targ = data.scorch[randomInt(data.scorch.length)];
		} else {
			let units = grave.findCards(c => c.isUnit());
			targ = units.reduce( (a,c) => a.power < c.power ? c : a, units[0] );
		}
		return targ;
	}
	
	// Selects a card to return to the Hand and replaces it with a Decoy. Assumes at least one valid card.
	async decoy(card, max, data) {
		let targ, row;
		if (data.spy.length){
			let min = data.spy.reduce( (a,c) => Math.min(a, c.power), Number.MAX_VALUE);
			targ = data.spy.filter(c => c.power === min)[0];
		} else if (data.medic.length) {
			targ = data.medic[randomInt(data.medic.length)];
		} else if (data.scorch.length) {
			targ = data.scorch[randomInt(data.scorch.length)];
		} else {
			let pairs = max.rmax.filter((r,i) => i<3 && r.cards.length).reduce((a,r) => 
				r.cards.map(c => ({r:r.row, c:c})).concat(a)
			, []);
			if (!pairs || pairs.length === 0) {
				let safeCard = this.player.hand.cards.find(c => c !== card && c.isUnit());
				if (safeCard) {
					await this.player.playCard(safeCard);
				} else {
					await this.player.passRound();
				}
				return;
			}
			let pair = pairs[randomInt(pairs.length)];
			targ = pair.c;
			row = pair.r;
		}
		
		for (let i = 0; !row && i < board.row.length; ++i){
			if (board.row[i] && board.row[i].cards && board.row[i].cards.indexOf(targ) !== -1){
				row = board.row[i];
				break;
			}
		}

		if (!row || !targ) {
			await this.fallbackPlayOrPass(this.player, card);
			return;
		}
		
		await this.player.playCardAction(card, async () => {
			await Promise.all([
				board.toHand(targ, row),
				board.moveTo(card, row, this.player.hand)
			]);
		});
	}
	
	// Tells the controlled Player to play the Scorch card
	async scorch(card, max, data){
		await this.player.playScorch(card);
	}

	// Gets the row that would be best for the passed agile card
	determineAgileRow(card)
	{
		const close = board.getRow(card, "close", card.holder);
		const ranged = board.getRow(card, "ranged", card.holder);
		const vClose = close.getVirtualCopy();
		const vRanged = ranged.getVirtualCopy();
		vClose.cards.push(card);
		vClose.updateState(card, true);
		vRanged.cards.push(card);
		vRanged.updateState(card, true);
		const dif = (vClose.calcScore() - close.calcScore()) - (vRanged.calcScore() - ranged.calcScore());
		return dif > 0 ? close : dif < 0 ? ranged : Math.random() >0.5 ? close : ranged; 
	}

	// Assigns a weight for how likely the conroller is to Pass the round
	weightPass(){
		if (this.player.health === 1)
			return 0;
		let dif = this.player.opponent().total - this.player.total;
		if (dif > 30)
			return 100;
		const oppCards = this.player.opponent().hand ? this.player.opponent().hand.cards.length : 0;
		const myCards = this.player.hand ? this.player.hand.cards.length : 0;
		if (dif < -30 && oppCards - myCards > 2)
			return 100;
		return Math.floor(Math.abs(dif));
	}
	
	// Assigns a weight for how likely the controller is to activate its leader ability
	weightLeader(card, max, data) {
		if (!card || !card.abilities || !card.abilities.length) return 0;
		const ab = ability_dict[card.abilities[0]];
		if (!ab) return 0;
		if (ab.weight) {
			let score = ab.weight(card, this, max, data);
			return Math.max(0, score || 0);
		}
		if (!card.activated || card.activated.length === 0) return 0;
		return Math.max(0, 10 + (Math.max(1, game.roundCount) - 1) * 15);
	}
	
	// Assigns a weight for how likely the controller will use a scorch-row card
	weightScorchRow(card, max, row_name) {
		let index = 3 + (row_name==="close" ? 0 : row_name==="ranged" ? 1 : 2);
		if (board.row[index].total < 10)
			return 0;
		let score = max.rmax[index].cards.reduce((a,c) => a + c.power, 0);
		return score;
	}
	
	// Calculates a weight for how likely the conroller will use horn on this row
	weightHornRow(card, row){
		return row.special !== null ? 0 : this.weightRowChange(card, row);
	}
	
	// Calculates weight for playing a card on a given row, min 0
	weightRowChange(card, row){
		return Math.max(0, this.weightRowChangeTrue(card, row));
	}
	
	// Calculates weight for playing a card on the given row
	weightRowChangeTrue(card, row) {
		let dif = [0,0];
		this.calcRowPower(row, dif, true);
		row.updateState(card, true);
		this.calcRowPower(row, dif, false);
		if (!card.isSpecial())
			dif[0] -= row.calcCardScore(card);
		row.updateState(card, false);
		return dif[1] - dif[0];
	}
	
	// Calculates the weight for playing a weather card
	weightWeather(card) {
		let rows;
		if (card.name === "Clear Weather")
			rows = Object.values(weather.types).filter(t => t.count > 0).flatMap(t => t.rows);
		else
			rows = Object.values(weather.types).filter(t => t.count === 0 && t.name === card.abilities[0]).flatMap(t => t.rows);
		if (!rows.length)
			return 1;
		let dif = [0,0];
		rows.forEach( r => {
			let state = r.effects.weather;
			this.calcRowPower(r, dif, true);
			r.effects.weather = !state;
			this.calcRowPower(r, dif, false);
			r.effects.weather = state;
		});
		return dif[1] - dif[0];
	}
	
	// Calculates the weight for playing a mardroeme card
	weightMardroemeRow(card, row){
		if (card.name === "Mardroeme" && row.special !== null)
			return 0;
		let ermion = card.holder.hand.cards.filter(c => c.name === "Ermion").length > 0;
		if (ermion && card.name !== "Ermion" && row === board.row[1])
			return 0;
		let name = row === board.row[1] ? "Young Berserker" : "Berserker";
		let n = row.cards.filter(c => c.name === name).length;
		let weight = row === board.row[2] ? 10*n : 8*n*n - 2*n
		return Math.max(1, weight);
	}
	
	// Calculates the weight for cards with the medic ability
	weightMedic(data, score, owner){
		let units = owner.grave.findCards(c => c.isUnit());
		let grave = data["grave_" + owner.opponent().tag];
		return !units.length ? Math.min(1,score) : score + (grave.spy.length ? 50 : grave.medic.length ? 15 : grave.scorch.length  ? 10 : this.player.health === 1 ? 1 : 0);
	}
	
	// Calculates the weight for cards with the berserker ability
	weightBerserker(card, row, score){
		if (card.holder.hand.cards.filter(c => c.abilities.includes("mardroeme")).length < 1 && !row.effects.mardroeme > 0)
			return score;
		score -= card.basePower;
		if (card.row === "close")
			score += 14;
		else {
			let n = 0;
			if (!row.effects.mardroeme)
				n = row.cards.filter(c => c.name === "Young Berserker").length;
			else
				n = row.cards.filter(c => c.name === "Transformed Young Vildkaarl").length;
			score = 8*((n+1)*(n+1) - n*n) + n*score;
		}
		return Math.max(1, score);
	}
	
	// Calculates the weight for a weather card if played from the deck
	weightWeatherFromDeck(card, weather_id) {
		if (card.holder.deck.findCard(c => c.abilities.includes(weather_id)) === undefined)
			return 0;
		return this.weightCard({abilities:[weather_id], row:"weather"});
	}
	
	// Assigns a weights for how likely the controller with play a card from its hand
	weightCard(card, max, data){
		if (card.name === "Decoy")
			return data.spy.length ? 50 : data.medic.length ? 15 : data.scorch.length  ? 10 : max.me.length ? 1 : 0;
		if (card.name === "Commander's Horn") {
			let rows = [0,1,2].map(i => board.row[i]).filter(r => r.special === null);
			if (!rows.length)
				return 0;
			rows = rows.map(r => this.weightHornRow(card, r) );
			return Math.max(...rows)/2;
		}
		
		if (card.abilities) {
			if (card.abilities.includes("scorch")) {
				let power_op = max.op.length ? max.op[0].card.power : 0;
				let power_me = max.me.length ? max.me[0].card.power : 0;
				let total_op = power_op * max.op.length;
				let total_me = power_me * max.me.length;
				let scorchVal = power_me > power_op ? 0 : power_me < power_op ? total_op : Math.max(0, total_op - total_me);
				if (card.name !== "Scorch" && card.isUnit()) {
					let unitRow = board.getRow(card, card.row === "agile" ? "close" : card.row, this.player);
					let bodyScore = unitRow ? unitRow.calcCardScore(card) : card.basePower;
					return power_me > power_op ? 0 : scorchVal + bodyScore;
				}
				return scorchVal;
			}
			if (card.abilities.includes("decoy")) {
				return data.spy.length ? 50 : data.medic.length ? 15 : data.scorch.length  ? 10 : max.me.length ? 1 : 0;
			}
			if (card.abilities.includes("mardroeme")) {
				let rows = [1,2].map(i => board.row[i]);
				return Math.max(...rows.map(r => this.weightMardroemeRow(card, r)) );
			}
		}
		
		if (card.row === "weather") {
			return Math.max(0, this.weightWeather(card));
		}
		
		let row;
		if (card.row === 'agile')
			row = this.determineAgileRow(card);
		else
			row = board.getRow(card, card.row === "agile" ? "close" : card.row, this.player);
		let score = row.calcCardScore(card);
		switch(card.abilities[card.abilities.length -1])
		{
			case "bond": 
			case "morale":
			case "horn":
				score = this.weightRowChange(card, row); break;
			case "medic": 
				score = this.weightMedic(data, score, card.holder);	break;
			case "spy": score = 15 + score; break;
			case "muster": score *= 3; break;
			case "scorch_c":
				score = Math.max(1, this.weightScorchRow(card, max, "close")); break;
			case "scorch_r": 
				score = Math.max(1, this.weightScorchRow(card, max, "ranged")); break;
			case "scorch_s":
				score = Math.max(1, this.weightScorchRow(card, max, "siege")); break;
			case "berserker":
				score = this.weightBerserker(card, row, score); break;
			case "avenger": case "avenger_kambi":
				return score + ability_dict[card.abilities[card.abilities.length -1]].weight();
		}
		
		return score;
	}
	
	// Calculates the current power of a row associated with each Player
	calcRowPower(r, dif, add){
		r.findCards(c => c.isUnit()).forEach(c => {
			let p = r.calcCardScore(c); 
			c.holder === this.player ? (dif[0]+= add ? p : -p) : (dif[1]+= add ? p : -p);
		});
	}
}

// --- [2] DeckMaker.constructOpponentDeck (gwent.js:4442-4480) ---
	constructOpponentDeck(useCustom = true)
	{
		let op_deck;
		const factionChoice = this.selectedOpponentFaction || "random";

		// 1. If custom deck is active
		if (useCustom && !isEmpty(this.opponentData))
		{
			op_deck = {};
			op_deck.cards = this.opponentData.cards;
			op_deck.leader = card_dict[this.opponentData.leader];
			op_deck.faction = op_deck.leader.deck;
			return op_deck;
		}

		// 2. If a specific faction was chosen
		if (factionChoice !== "random" && typeof factions !== "undefined" && factions[factionChoice])
		{
			const factionDecks = premade_deck
				.map(d => JSON.parse(d))
				.filter(d => d.faction === factionChoice);
			
			if (factionDecks.length > 0)
			{
				op_deck = factionDecks[randomInt(factionDecks.length)];
				op_deck.cards = op_deck.cards.map(c => ({index: c[0], count: c[1]}));
				const leaders = card_dict.filter(c => c.row === "leader" && c.deck === op_deck.faction);
				op_deck.leader = leaders[randomInt(leaders.length)];
				return op_deck;
			}
		}

		// 3. Fallback: completely random
		op_deck = JSON.parse( premade_deck[randomInt(Object.keys(premade_deck).length)] );
		op_deck.cards = op_deck.cards.map(c => ({index:c[0], count:c[1]}) );
		const leaders = card_dict.filter(c => c.row === "leader" && c.deck === op_deck.faction);
		op_deck.leader = leaders[randomInt(leaders.length)];
		return op_deck;
	}

// --- [3] StoryMode.startMatch (story.js:2448-2575) ---

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
		StoryMode.selectedWager = 0;
		if (wager > 0) {
			StoryMode.save.crowns = Math.max(0, StoryMode.save.crowns - wager);
			StoryMode.save.stats.crownsSpent = (StoryMode.save.stats.crownsSpent || 0) + wager;
			StoryMode.saveGame();
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

		if (typeof game !== "undefined") {
			game.reset();
		}
		player_me = new Player(0, StoryMode.save.playerName, meDeckData);
		player_op = new Player(1, opponentName, opDeck);

		StoryMode.suspendMapRendering();
		if (typeof ScreenManager !== "undefined") {
			ScreenManager.setScreen("board");
		} else if (document.body) {
			document.body.setAttribute("data-screen", "board");
		}

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
		if (typeof game !== "undefined" && typeof GameState !== "undefined" && game.state === GameState.PLAYING && typeof game.executeForfeit === "function") {
			game.executeForfeit();
			return;
		}
		if (StoryMode.activeMatch && StoryMode.save) {
			const match = StoryMode.activeMatch;
			const node = match.node;
			StoryMode.save.stats.matchesLost = (StoryMode.save.stats.matchesLost || 0) + 1;
			if (match.isTournament) {
				StoryMode.save.tournamentStates[match.nodeId] = { roundIndex: 0, active: false };
			} else if (!(match.wager > 0)) {
				const lossPenalty = node.crownsLoss || 45;
				StoryMode.save.crowns = Math.max(0, StoryMode.save.crowns - lossPenalty);
			}
			StoryMode.saveGame();
		}
		StoryMode.returnFromMatchToMap();
	}

	static onMatchEnded(isWin) {
		if (!StoryMode.activeMatch || !StoryMode.save) return;


// --- [4] premade_deck (decks.js) ---
let premade_deck = [
	 '{"faction":"realms","leader":24,"cards":[[5,1],[1,3],[2,1],[3,1],[8,1],[33,1],[34,1],[39,1],[51,1],[29,2],[12,1],[14,1],[15,1],[27,1],[17,1],[45,1],[54,1],[55,1],[30,3],[32,1],[41,1],[28,3],[19,3],[47,1],[6,1],[18,1],[49,1],[0,1],[214,1]]}'
	,'{"faction":"realms","leader":24,"cards":[[5,1],[1,3],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[33,1],[34,1],[39,1],[51,1],[29,2],[12,1],[14,1],[15,1],[27,1],[17,1],[45,1],[54,1],[55,1],[30,3],[32,1],[41,1],[28,3],[19,3],[47,1],[6,1],[18,1],[49,1],[0,1],[214,1]]}'
	,'{"faction":"nilfgaard","leader":59,"cards":[[5,1],[1,3],[10,1],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[63,1],[64,1],[70,1],[73,1],[75,1],[84,1],[81,1],[14,1],[15,1],[17,1],[90,1],[91,1],[19,3],[88,1],[71,4],[6,1],[18,1],[67,1],[68,1],[0,1],[83,1],[214,1]]}'
	,'{"faction":"nilfgaard","leader":58,"cards":[[5,1],[1,3],[10,2],[4,1],[9,1],[11,1],[3,1],[8,1],[63,1],[64,1],[70,1],[73,1],[75,1],[14,1],[15,1],[62,1],[65,1],[69,1],[17,1],[13,1],[90,1],[91,1],[88,1],[71,4],[6,1],[67,1],[68,1],[20,1],[0,1],[83,1],[214,1]]}'
	,'{"faction":"monsters","leader":93,"cards":[[5,1],[1,3],[10,1],[4,1],[9,1],[11,1],[3,1],[8,1],[124,1],[125,1],[138,1],[14,1],[15,1],[101,1],[105,1],[106,1],[107,1],[17,1],[135,1],[98,1],[99,1],[100,1],[102,1],[19,3],[131,1],[132,1],[133,1],[134,1],[6,1],[18,1],[127,1],[128,1],[129,1],[0,1]]}'
	,'{"faction":"monsters","leader":94,"cards":[[5,1],[1,1],[10,3],[4,1],[9,1],[11,1],[3,1],[8,1],[125,1],[14,1],[15,1],[101,1],[105,1],[106,1],[107,1],[17,1],[135,1],[98,1],[99,1],[100,1],[19,3],[131,1],[132,1],[133,1],[134,1],[0,1]]}'
	,'{"faction":"scoiatael","leader":141,"cards":[[5,1],[1,3],[10,1],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[167,1],[173,1],[213,1],[14,1],[15,1],[148,1],[17,1],[162,1],[163,1],[164,1],[19,3],[144,1],[151,1],[152,1],[153,1],[6,1],[18,1],[159,1],[160,1],[0,1]]}'
	,'{"faction":"scoiatael","leader":143,"cards":[[5,1],[1,3],[10,1],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[167,1],[173,1],[213,1],[14,1],[15,1],[148,1],[149,1],[150,1],[158,1],[17,1],[162,1],[163,1],[164,1],[19,3],[6,1],[18,1],[20,1],[159,1],[160,1],[0,1]]}'
	,'{"faction":"skellige","leader":211,"cards":[[5,1],[202,1],[10,1],[2,1],[204,1],[11,1],[3,1],[8,1],[203,1],[184,1],[195,1],[14,1],[15,1],[192,3],[186,1],[17,1],[187,1],[188,1],[189,1],[200,3],[182,1],[6,1],[210,3],[199,1],[0,1]]}'
	,'{"faction":"skellige","leader":211,"cards":[[5,1],[1,2],[3,1],[8,1],[203,1],[184,1],[14,1],[192,3],[186,1],[17,1],[209,3],[187,1],[188,1],[189,1],[19,3],[200,3],[182,1],[0,1]]}'
];