"use strict"

class Enum {constructor(val){this.val = val;} toString(){return this.val;}};

const DURATION_CARD_PLACEMENT = 1000;

const DUR_FADE_STEP = 10;

const CLICK_EVENT_SFX = () => {
	const s = Math.random() > 0.5 ? 'witcher_hover' : 'witcher_hover2';
	AudioManager.playSFX(s);
};

const addMouseEnterSFXBySelector = selector => {
	[...document.querySelectorAll(selector)].forEach(e =>
	e.addEventListener('mouseenter', CLICK_EVENT_SFX));
};

class Controller {}

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

// Can make actions during turns like playing cards that it owns
class Player {
	constructor(id, name, deck) {
		this.id = id;
		this.tag = (id === 0) ? "me" : "op";
		this.controller = (id === 0) ? new Controller() : new ControllerAI(this);
		
		this.hand = (id === 0) ? new Hand(document.getElementById("hand-row")) : new HandAI();
		this.grave =  new Grave( document.getElementById("grave-" + this.tag));
		this.deck = new Deck(deck.faction, document.getElementById("deck-" + this.tag));
		this.deck_data = deck;
		
		this.leader = new Card(deck.leader, this);
		this.elem_leader = document.getElementById("leader-" + this.tag);
		this.elem_leader.children[0].appendChild( this.leader.elem );

		this.reset();
		
		const defaultMeName = (typeof I18N !== "undefined") ? I18N.t("player_name") : "Geralt";
		const defaultOpName = (typeof I18N !== "undefined") ? I18N.t("opponent_name") : "Opponent";
		const savedCustomName = (this.tag === "me" && typeof localStorage !== "undefined") ? localStorage.getItem("gc-player-name") : null;
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			this.name = name || ((this.tag === "me") ? (savedCustomName || defaultMeName) : defaultOpName);
		} else if (this.tag === "me") {
			this.name = (name && name !== "Player 1" && name !== "Geralt") ? name : (savedCustomName || defaultMeName);
		} else {
			this.name = (name && name !== "Player 2" && name !== "Opponent" && name !== "Adversário") ? name : defaultOpName;
		}
		document.getElementById("name-" + this.tag).innerHTML = this.name;
		
		document.getElementById("deck-name-" +this.tag).innerHTML = factions[deck.faction].name;
		document.getElementById("stats-" + this.tag).getElementsByClassName("profile-img")[0].children[0].children[0];
		let x = document.querySelector("#stats-" +this.tag+ " .profile-img > div > div");
		x.style.backgroundImage = iconURL("deck_shield_" + deck.faction);
	}
	
	// Sets default values
	reset(){
		this.grave.reset();
		this.hand.reset();
		this.deck.reset();
		this.deck.initializeFromID(this.deck_data.cards, this);
		
		this.health = 2;
		this.total = 0;
		this.passed = false;
		this.handsize = 10;
		this.winning = false;
		this.turnPlayed = false;
		this.isPlayingCard = false;
	
		this.enableLeader();
		const passedElem = document.getElementById("passed-" + this.tag);
		if (passedElem) passedElem.classList.remove("passed");
		const scoreElem = document.getElementById("score-total-" + this.tag);
		if (scoreElem) {
			scoreElem.classList.remove("score-leader");
			if (scoreElem.children[0]) scoreElem.children[0].innerHTML = "0";
		}
		const statsElem = document.getElementById("stats-" + this.tag);
		if (statsElem) statsElem.classList.remove("current-turn");
		document.getElementById("gem1-" +this.tag).classList.add("gem-on");
		document.getElementById("gem2-" +this.tag).classList.add("gem-on");
	}
	
	// Returns the opponent Player
	opponent(){
		return board.opponent(this);
	}
	
	// Updates the player's total score and notifies the gamee
	updateTotal(n){
		this.total += n;
		document.getElementById("score-total-" + this.tag).children[0].innerHTML = this.total;
		board.updateLeader();
		if (this === player_me && typeof Achievements !== "undefined") {
			Achievements.checkScore(this.total);
		}
	}
	
	// Puts the player in the winning state
	setWinning(isWinning) {
		if (this.winning ^ isWinning)
			document.getElementById("score-total-" + this.tag).classList.toggle("score-leader");
		this.winning = isWinning;
	}
	
	// Puts the player in the passed state
	setPassed(hasPassed) {
		if (this.passed ^ hasPassed)
			document.getElementById("passed-" + this.tag).classList.toggle("passed");
		this.passed = hasPassed;
	}
	
	// Sets up board for turn
	async startTurn(){
		this.turnPlayed = false;
		this.isPlayingCard = false;
		if (!this.canPlay() && !(typeof ControllerPeer !== "undefined" && this.controller instanceof ControllerPeer)) {
			this.passRound(true);
			return;
		}
		document.getElementById("stats-" + this.tag).classList.add("current-turn");
		if (this.leaderAvailable)
			this.elem_leader.children[1].classList.remove("hide");
		
		if (this === player_me) {
			document.getElementById("pass-button").classList.remove("noclick");
		}
		if (typeof VersusMode !== "undefined") {
			VersusMode.startTurnTimer(this === player_me);
		}
		
		if (this.controller instanceof ControllerAI) {
			try {
				await this.controller.startTurn(this);
			} catch (aiErr) {
				console.error("[Player.startTurn] Erro no controlador IA:", aiErr);
				this.passRound(true);
			}
			if (game && game.state === GameState.PLAYING && game.currPlayer === this && !this.turnPlayed && !this.passed) {
				console.warn("[Player.startTurn] IA encerrou processamento sem realizar jogada. Forçando passe de segurança.");
				this.passRound(true);
			}
		} else if (typeof ControllerPeer !== "undefined" && this.controller instanceof ControllerPeer) {
			await this.controller.startTurn(this);
		}
	}
	
	// Passes the round and ends the turn
	passRound(force = false){
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) return;
		if (!force && (game.isActionInProgress || game.isTurnTransitioning || game.isCardBeingPlayed || this.isPlayingCard || this.turnPlayed)) return;
		if (game.currPlayer !== this) return;
		if (this.passed) return;
		game.isActionInProgress = true;
		if (typeof VersusMode !== "undefined") {
			VersusMode.stopTurnTimer();
		}
		ui.enablePlayer(false);
		this.setPassed(true);
		EventManager.roundPassed.dispatch(this, game.roundCount);
		if (this === player_me && typeof VersusMode !== "undefined" && VersusMode.isActive) {
			VersusMode.onLocalPass();
		}
		this.endTurn();
	}
	
	// Plays a scorch card
	async playScorch(card){
		await this.playCardAction(card, async () => await ability_dict["scorch"].activated(card));
	}
	
	// Plays a card to a specific row
	async playCardToRow(card, row){
		await this.playCardAction(card, async () => await board.moveTo(card, row, this.hand));
	}
	
	// Plays a card to the board
	async playCard(card){
		await this.playCardAction(card, async () => await card.autoplay(this.hand));
	}
	
	// Shows a preview of the card being played, plays it to the board and ends the turn
	async playCardAction(card, action){
		if (typeof game !== "undefined") game.isCardBeingPlayed = true;
		if (this === player_me) this.isPlayingCard = true;
		if (typeof VersusMode !== "undefined" && VersusMode.stopTurnTimer) {
			VersusMode.stopTurnTimer();
		}
		try {
			ui.showPreviewVisuals(card);
			await sleep(1000);
			ui.hidePreview(card);
			await action();
			if (this === player_me) {
				if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
					VersusMode.onLocalCardPlayed(card);
				}
				if (card.abilities && card.abilities.includes("spy")) {
					if (typeof Achievements !== "undefined") {
						Achievements.recordSpyPlayed();
					}
				}
				if (card.name === "Roach" || (card.muster && card.muster === "Roach")) {
					if (typeof Achievements !== "undefined") {
						Achievements.recordRoach();
					}
				}
			}
		} finally {
			if (typeof game !== "undefined") game.isCardBeingPlayed = false;
			if (this === player_me) this.isPlayingCard = false;
		}
		this.endTurn();
	}
	
	// Handles end of turn visuals and behavior the notifies the game
	endTurn(){
		if (this.turnPlayed) {
			console.warn(`[Player.endTurn] Jogador ${this.tag} já encerrou este turno. Ignorando chamada duplicada.`);
			return;
		}
		this.turnPlayed = true;

		if (typeof VersusMode !== "undefined") {
			VersusMode.stopTurnTimer();
		}
		if (!this.passed && !this.canPlay()) {
			this.setPassed(true);
			EventManager.roundPassed.dispatch(this, game.roundCount);
			if (this === player_me && typeof VersusMode !== "undefined" && VersusMode.isActive) {
				VersusMode.onLocalPass();
			}
		}
		if (this === player_me){
			document.getElementById("pass-button").classList.add("noclick");
		}
		document.getElementById("stats-" + this.tag).classList.remove("current-turn");
		this.elem_leader.children[1].classList.add("hide");
		game.endTurn(this);
	}
	
	// Tells the the Player if it won the round. May damage health.
	endRound(win){
		if (!win) {
			if (this.health < 1)
				return;
			document.getElementById("gem" + this.health + "-" +this.tag).classList.remove("gem-on");
			this.health--;
		}
		this.setPassed(false);
		this.setWinning(false);
	}
	
	// Returns true if the Player can make any action other than passing
	canPlay() {
		return this.hand.cards.length > 0 || this.leaderAvailable;
	}
	
	// Use a leader's Activate ability, then disable the leader
	async activateLeader() {
		if (typeof game === "undefined" || game.state !== GameState.PLAYING) return;
		if (game.currPlayer !== this || this.turnPlayed || !this.leaderAvailable) return;
		if (this === player_me && (game.isActionInProgress || game.isTurnTransitioning || game.isCardBeingPlayed || this.isPlayingCard)) return;

		game.isActionInProgress = true;
		game.isCardBeingPlayed = true;
		if (this === player_me) {
			this.isPlayingCard = true;
			ui.enablePlayer(false);
		}
		if (typeof VersusMode !== "undefined") {
			VersusMode.stopTurnTimer();
			VersusMode.pendingLeaderData = {};
			VersusMode.isActionExecuting = true;
			VersusMode.actionStartTime = Date.now();
		}
		try {
			if (!this.leader || !this.leader.activated || !this.leader.activated[0]) {
				console.warn("[Player.activateLeader] Líder não possui habilidade ativa.");
				this.disableLeader();
				this.endTurn();
				return;
			}
			ui.showPreviewVisuals(this.leader);
			await sleep(1500);
			ui.hidePreview(this.leader);
			await this.leader.activated[0](this.leader, this);
			if (this === player_me) {
				if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
					VersusMode.onLocalLeader(VersusMode.pendingLeaderData || {});
				}
				if (typeof Achievements !== "undefined") {
					Achievements.recordLeaderUsed();
				}
			}
			this.disableLeader();
			this.endTurn();
		} finally {
			if (typeof game !== "undefined") {
				game.isCardBeingPlayed = false;
				if (!game.isTurnTransitioning) {
					game.isActionInProgress = false;
				}
			}
			if (this === player_me) {
				this.isPlayingCard = false;
			}
			if (typeof VersusMode !== "undefined") {
				VersusMode.isActionExecuting = false;
				if (VersusMode.pendingTurnSync) {
					const sync = VersusMode.pendingTurnSync;
					VersusMode.pendingTurnSync = null;
					VersusMode.onTurnSyncReceived(sync);
				}
			}
		}
	}
	
	// Disable access to leader ability and toggles leader visuals to off state
	disableLeader(){
		this.leaderAvailable = false;
		let elem = this.elem_leader.cloneNode(true);
		this.elem_leader.parentNode.replaceChild(elem, this.elem_leader);
		this.elem_leader = elem;
		this.elem_leader.children[0].classList.add("fade");
		this.elem_leader.children[1].classList.add("hide");
		this.elem_leader.addEventListener("click", async () => await ui.viewCard(this.leader), false);
		this.elem_leader.addEventListener('mouseenter', CLICK_EVENT_SFX);
		this.elem_leader.children[0].setAttribute('data-title', "View leader");
	}
	
	// Enable access to leader ability and toggles leader visuals to on state
	enableLeader() {
		this.leaderAvailable = this.leader.activated.length > 0;
		let elem = this.elem_leader.cloneNode(true);
		this.elem_leader.parentNode.replaceChild(elem, this.elem_leader);
		this.elem_leader = elem;
		this.elem_leader.children[0].classList.remove("fade");
		this.elem_leader.children[1].classList.remove("hide");
		
		if (this.id === 0 && this.leader.activated.length > 0){
			this.elem_leader.addEventListener("click", 
				async () => await ui.viewCard(this.leader, async () => {
					AudioManager.playSFX('open');
					await this.activateLeader();
		}	), false);
			this.elem_leader.children[0].setAttribute('data-title', "Play leader");
		} else {
			this.elem_leader.addEventListener("click", async () => await ui.viewCard(this.leader), false);
		}
		this.elem_leader.addEventListener('mouseenter', CLICK_EVENT_SFX);
		
		// TODO set crown color
	}
	
}

// Handles the adding, removing and formatting of cards in a container
class CardContainer {
	constructor(elem) {
		this.elem = elem;
		this.cards = [];
	}
	
	// Returns the first card that satisfies the predcicate. Does not modify container.
	findCard(predicate){
		for (let i=this.cards.length-1; i>=0; --i)
			if (predicate(this.cards[i]))
				return this.cards[i];
	}
	
	// Returns a list of cards that satisfy the predicate. Does not modify container.
	findCards(predicate){
		return this.cards.filter(predicate);
	}
	
	// Returns a list of up to n cards that satisfy the predicate. Does not modify container.
	findCardsRandom(predicate, n){
		let valid = predicate ? this.cards.filter(predicate) : this.cards;
		if (valid.length === 0)
			return [];
		if (!n || n === 1)
			return [valid[randomInt(valid.length)]];
		let out = [];
		for (let i=Math.min(n, valid.length); i>0 ; --i){
			let index = randomInt(valid.length);
			out.push( valid.splice(index,1)[0] );
		}
		return out;
	}
	
	// Removes and returns a list of cards that satisy the predicate.
	getCards(predicate){
		return this.cards.reduce((a,c,i) => ( predicate(c,i)?[i]:[] ).concat(a), []).map( i => this.removeCard(i));
	}
	
	// Removes and returns a card that satisfies the predicate.
	getCard(predicate) {
		for (let i=this.cards.length-1; i>=0; --i)
			if (predicate(this.cards[i]))
				return this.removeCard(i);
	}
	
	// Removes and returns any cards up to n that satisfy the predicate.
	getCardsRandom(predicate, n) {
		return this.findCardsRandom(predicate, n).map( c => this.removeCard(c) );
	}
	
	// Adds a card to the container along with its associated HTML element.
	addCard(card, index){
		if (!card)
			return;
		index = index ? clamp(0, this.cards.length, index) : 0;
		this.cards.splice(index, 0, card);
		this.addCardElement(card, index);
		this.resize();
	}
	
	// Removes a card from the container along with its associated HTML element.
	removeCard(card, index){
		if (this.cards.length === 0)
			throw "Cannot draw from empty " + this.constructor.name;
		card = this.cards.splice( isNumber(card)? card : this.cards.indexOf(card) , 1)[0];
		this.removeCardElement(card, index?index:0);
		this.resize();
		return card;
	}
	
	// Adds a card to a pre-sorted CardContainer
	addCardSorted(card){
		let i = this.getSortedIndex(card);
		this.cards.splice(i, 0, card);
		return i;
	}
	
	// Returns the expected index of a card in a sorted CardContainer
	getSortedIndex(card){
		for (var i=0; i<this.cards.length; ++i)
			if (Card.compare(card, this.cards[i]) < 0)
				break;
		return i;
	}
	
	// Adds a card to a random index of the CardContainer
	addCardRandom(card){
		this.cards.push(card);
		let index = randomInt(this.cards.length);
		if (index !== this.cards.length-1) {
			let t = this.cards[this.cards.length-1];
			this.cards[this.cards.length-1] = this.cards[index];
			this.cards[index] = t;
		}
		return index;
	}
	
	// Removes the HTML elemenet associated with the card from this CardContainer
	removeCardElement(card, index){
		if (this.elem)
			this.elem.removeChild(card.elem);
	}
	
	// Adds the HTML elemenet associated with the card to this CardContainer
	addCardElement(card, index){
		if (this.elem){
			if (index === this.cards.length)
				this.elem.appendChild(card.elem);
			else
				this.elem.insertBefore(card.elem, this.elem.children[index]);
		}
	}
	
	// Empty function to be overried by subclasses that resize their content
	resize(){}
	
	// Modifies the margin of card elements inside a row-like container to stack properly
	resizeCardContainer(overlap_count, gap, coef) {
		let n = this.elem.children.length;
		let param = (n < overlap_count) ?  "" + gap+"vw" : defineCardRowMargin(n, coef);
		let children = this.elem.getElementsByClassName("card");
		for (let x of children)
			x.style.marginLeft = x.style.marginRight = param;
		
		function defineCardRowMargin(n, coef = 0){
			return "calc((100% - (4.45vw * " + n + ")) / (2*" +n+ ") - (" +coef+ "vw * " +n+ "))";
		}
	}
	
	// Allows the row to be clicked
	setSelectable(){
		this.elem.classList.add("row-selectable");
	}
	
	// Disallows teh row to be clicked
	clearSelectable() {
		this.elem.classList.remove("row-selectable");
		for (let card of this.cards)
			card.elem.classList.add("noclick");
	}
	
	// Returns the container to its default, empty state
	reset() {
		while(this.cards.length)
			this.removeCard(0);
		if (this.elem)
			while(this.elem.firstChild)
				this.elem.removeChild(this.elem.firstChild);
		this.cards = [];
		this.resize();
	}
	
}

// Contians all used cards in the order that they were discarded
class Grave extends CardContainer {
	constructor(elem) {
		super(elem)
		elem.addEventListener("click", () => ui.viewCardsInContainer(this), false);
	}
	
	// Override
	addCard(card){
		this.setCardOffset(card, this.cards.length);
		if (card && this.cards.length === 0)
		{
			this.elem.addEventListener('mouseenter', CLICK_EVENT_SFX);
		}
		super.addCard(card, this.cards.length);
	}
	
	// Override
	removeCard(card){
		let n = isNumber(card) ? card : this.cards.indexOf(card);
		if (n > -1 && this.cards.length === 1)
		{
			this.elem.removeEventListener('mouseenter', CLICK_EVENT_SFX);
		}
		return super.removeCard(card, n);
	}
	
	// Override
	removeCardElement(card, index){
		card.elem.style.left = "";
		super.removeCardElement(card, index);
		for (let i=index; i<this.cards.length; ++i){
//			if (!this.cards[i])
//				console.log(i, index, card, this.cards[i]);
			this.setCardOffset(this.cards[i], i);
		}
	}
	
	// Offsets the card element in the deck
	setCardOffset(card, n){
		card.elem.style.left =  -0.03 * n +"vw";
	}

}

// Contains a randomized set of cards to be drawn from
class Deck extends CardContainer {
	constructor(faction, elem){
		super(elem);
		this.faction = faction;

		this.counter = document.createElement("div");
		this.counter.classList = "deck-counter center";
		this.counter.appendChild( document.createTextNode(this.cards.length) );
		this.elem.appendChild(this.counter);
	}
	
	// Creates duplicates of cards with a count of more than one, then initializes deck
	initializeFromID(card_id_list, player){
		this.initialize(Card.expandIDCounts(card_id_list), player);
	}
	
	// Populates a this deck with a list of card data and associated those cards with the owner of this deck.
	initialize(card_data_list, player){
		for (let i=0; i<card_data_list.length; ++i) {
			let card = new Card(card_data_list[i], player);
			this.addCardRandom(card);
			this.addCardElement();
		}
		this.resize();
	}

	reorderCards(nameList) {
		if (!nameList || !Array.isArray(nameList)) return;
		const reordered = [];
		const pool = [...this.cards];
		for (const name of nameList) {
			const idx = pool.findIndex(c => c.name === name);
			if (idx !== -1) {
				reordered.push(pool.splice(idx, 1)[0]);
			}
		}
		this.cards = reordered.concat(pool);
	}
	
	// Override
	addCard(card){
		this.addCardRandom(card);
		this.addCardElement();
		this.resize();
	}
	
	// Sends the top card to the passed hand
	async draw(hand){
		if (hand === player_op.hand)
			hand.addCard(this.removeCard(0));
		else
			await board.toHand(this.cards[0], this);
	}
	
	// Draws a card and sends it to the container before adding a card from the
	// container back to the deck.
	// NOTE: Used only in mulligan and adds card out of order
	swap(container, card){
		if (!card)
			return;
		const index = container.cards.indexOf(card);
		this.addCard(container.removeCard(card));
		const drawnCard = this.removeCard(0);
		container.addCard(drawnCard, index);
	}
	
	// Override
	addCardElement() {
		let elem = document.createElement("div");
		elem.classList.add("deck-card");
		elem.style.backgroundImage = iconURL("deck_back_" + this.faction, "jpg");
		this.setCardOffset(elem, this.cards.length-1);
		this.elem.insertBefore(elem, this.counter);
	}
	
	// Override
	removeCardElement(){
		this.elem.removeChild(this.elem.children[this.cards.length]).style.left = "";
	}
	
	// Offsets the card element in the deck
	setCardOffset(elem, n){
		elem.style.left =  -0.03 * n +"vw";
	}
	
	// Override
	resize(){
		this.counter.innerHTML = this.cards.length;
		this.setCardOffset(this.counter, this.cards.length);
	}
	
	// Override
	reset() {
		super.reset();
		this.elem.appendChild(this.counter);
	}
}

// Hand used by computer AI. Has an offscreen HTML element for card transitions.
class HandAI extends CardContainer {
	constructor() {
		super(undefined);
		this.counter = document.getElementById("hand-count-op"); 
		this.hidden_elem = document.getElementById("hand-op");
	}
	resize() {this.counter.innerHTML = this.cards.length; }
}

// Hand used by current player
class Hand extends CardContainer {
	constructor(elem){
		super(elem);
		this.counter = document.getElementById("hand-count-me");
	}
	
	// Override
	addCard(card, index){
		const sortedIndex = this.getSortedIndex(card);
		if (!index)
			index = this.addCardSorted(card);
		else
			super.addCard(card, index);
		this.addCardElement(card, sortedIndex);
		this.resize();
	}
	
	// Override
	resize() {
		this.counter.innerHTML = this.cards.length;
		this.resizeCardContainer(11, 0.075, .00225);
	}
}

// Contains active cards and effects. Calculates the current score of each card and the row.
class Row extends CardContainer {
	constructor(elem) {
		super(elem?.getElementsByClassName("row-cards")[0]);
		this.type = elem?.getAttribute('data-row');
		this.elem_parent = elem;
		this.elem_special = elem?.getElementsByClassName("row-special")[0];
		this.special = null;
		this.total = 0;
		this.effects = {weather:false, halfWeather: false, bond: {}, morale: 0, horn: 0, mardroeme: 0};
		this.elem?.addEventListener("click", () => ui.selectRow(this), true);
		this.elem_special?.addEventListener("click", () => ui.selectRow(this), false, true);
	}
	
	// Returns a copy of the row
	getVirtualCopy(predicate = c=>true)
	{
		const copy = new Row(null);
		copy.type = this.type;
		copy.effects = {...this.effects};
		copy.effects.bond = {...this.effects.bond};
		copy.cards = this.cards.filter(predicate);
		// remove status of filtered out cards
		this.cards.filter(c=>!predicate(c)).forEach(c=>copy.updateState(c, false));
		return copy;
	}
	
	// Override
	async addCard(card) {
		if (card.isSpecial()) {
			this.special = card;
			this.elem_special.appendChild(card.elem);
		} else {
			let index = this.addCardSorted(card);
			this.addCardElement(card, index);
			this.resize();
			if (card && card.isHero && card.isHero()) {
				animateHeroSpark(card.elem);
			}
			await this.playPlacementAudio(card);
		}
		this.updateState(card, true);
		game.placedEffectsActive = true;
		for (let x of card.placed) 
			await x(card, this);
		game.placedEffectsActive = false;
		card.elem.classList.add("noclick");
		await sleep(600);
		this.updateScore();
	}

	async playPlacementAudio(card)
	{
		let key;
		if (card.abilities.includes('spy') || card.abilities.includes('vildkarrl'))
			return;
		else if (card.abilities.includes('berserker') && this.effects.mardroeme >= 1)
			return;
		else if (card.abilities.includes('decoy'))
			key = 'decoy';
		else if (card.isHero())
		{
			key = "hero";
		}
		else
		{
			switch(this.type)
			{
				case "siege":
					key = "common_siege"; break;
				case "ranged":
					key = "common_ranged"; break;
				case "close":
					key = "common_close"; break;
				default:
					return;
			}
		}
		if (key)
		{
			return await AudioManager.playSFX(key, DURATION_CARD_PLACEMENT, true);
		}
	}

	// Override
	removeCard(card) {
		card = isNumber(card) ? card === -1 ? this.special : this.cards[card] : card;
		if (card.isSpecial()) {
			this.special = null;
			this.elem_special.removeChild(card.elem);
		} else {
			super.removeCard(card);
			card.resetPower();
		}
		this.updateState(card, false);
		for (let x of card.removed)
			x(card);
		this.updateScore();
		return card;
	}
	
	// Override
	removeCardElement(card, index) {
		super.removeCardElement(card, index);
		let x = card.elem;
		x.style.marginLeft = x.style.marginRight = "";
		x.classList.remove("noclick");
	}
	
	// Updates a card's effect on the row
	updateState(card, activate){
		for (let x of card.abilities){
			switch (x) {
				case "morale":
				case "horn":
				case "mardroeme": this.effects[x]+= activate ? 1 : -1; break;
				case "bond": 
					if (!this.effects.bond[card.id()])
						this.effects.bond[card.id()] = 0;
					this.effects.bond[card.id()] += activate ? 1 : -1;
					break;
			}
		}
	}
	
	// Activates weather effect and visuals
	addOverlay(overlay){
		this.effects.weather = true;
		const elem = this.elem_parent.getElementsByClassName("row-weather")[0];
		elem.classList.add(overlay);
		fadeIn(elem, 500);
		this.updateScore();
	}
	
	// Deactivates weather effect and visuals
	removeOverlay(overlay){
		this.effects.weather = false;
		const elem = this.elem_parent.getElementsByClassName("row-weather")[0];
		fadeOut(elem, 500).then(() => elem.classList.remove(overlay));	
		this.updateScore();
	}
	
	// Override
	resize(){
		this.resizeCardContainer(10, 0.075, .00325);
	}
	
	// Updates the row's score by summing the current power of its cards
	updateScore() {
		let total = 0;
		for (let card of this.cards) {
			total += this.cardScore(card);
		}
		let player = this.elem_parent.parentElement.id === "field-op" ? player_op : player_me;
		player.updateTotal(total - this.total);
		this.total = total;
		this.elem_parent.getElementsByClassName("row-score")[0].innerHTML = this.total;
	}
	
	// Calculates and set the card's current power
	cardScore(card){
		let total = this.calcCardScore(card);
		card.setPower(total);
		return total;
	}

	// Calculate total row score without updating
	calcScore()
	{
		return this.cards.reduce((sum, card) => sum + this.calcCardScore(card), 0);
	}
	
	// Calculates the current power of a card affected by row affects
	calcCardScore(card) {
		if (!card || card.name === "Decoy" || card.name === "decoy" || (card.abilities && card.abilities.includes("decoy")) || (card.isSpecial && card.isSpecial()))
			return 0;
		let total = card.basePower;
		if (card.hero)
			return total;
		if (this.effects.weather)
		{
			const weatherMin = this.effects.halfWeather ? Math.max(1, Math.floor(total / 2)) : 1;
			total = Math.min(weatherMin, total);
		}
		if (game.doubleSpyPower && card.abilities.includes("spy"))
			total *= 2;
		let bond = this.effects.bond[card.id()];
		if (isNumber(bond) && bond > 1)
			total *= Number(bond);
		total += Math.max(0, this.effects.morale + (card.abilities.includes("morale") ? -1 : 0 ));
		if (this.effects.horn - (card.abilities.includes("horn") ? 1 : 0) >  0 )
			total *= 2;
		return total;
	}
	
	// Applies a temporary leader horn affect that is removed at the end of the round
	async leaderHorn(){
		if (this.special !== null)
			return;
		let horn = new Card(card_dict[5], null);
		await this.addCard(horn);
		game.roundEnd.push( () => this.removeCard(horn) );
	}
	
	// Applies a local scorch effect to this row
	async scorch() {
		if (this.total >= 10)
			await Promise.all( this.maxUnits().map( async c => {
				await c.animate("scorch", true, false);
				await board.toGrave(c, this);
			}));
	}
	
	// Removes all cards and effects from this row
	async clear() {
		const toGrave  = this.cards.filter(c => !c.noRemove);
		if (this.special != null)
			toGrave.push(this.special);
		await Promise.all(toGrave.map(async c => await board.toGrave(c, this)));
	}

	// Returns all regular unit cards with the heighest power
	maxUnits(){
		let max = [];
		for (let i=0; i<this.cards.length; ++i){
			let card = this.cards[i];
			if (!card.isUnit())
				continue;
			if (!max[0] || max[0].power < card.power)
				max = [card];
			else if (max[0].power === card.power)
				max.push(card);
		}
		return max;
	}
	
	// Override
	reset(){
		super.reset();
		while(this.special)
			this.removeCard(this.special);
		if (this.elem_special) {
			while(this.elem_special.firstChild)
				this.elem_special.removeChild(this.elem_special.firstChild);
		}
		this.total = 0;
		if (this.elem_parent) {
			const rowScoreElem = this.elem_parent.getElementsByClassName("row-score")[0];
			if (rowScoreElem) rowScoreElem.innerHTML = "0";
			const weatherElem = this.elem_parent.getElementsByClassName("row-weather")[0];
			if (weatherElem) {
				weatherElem.classList.remove("rain", "fog", "frost");
				weatherElem.classList.add("hide");
				weatherElem.style.opacity = 0;
			}
		}
		this.effects = {weather: false, halfWeather: false, bond: {}, morale: 0, horn: 0, mardroeme: 0};
	}
}

// Handles how weather effects are added and removed
class Weather extends CardContainer {
	constructor(elem) {
		super(document.getElementById("weather"));
		this.types = {
			rain: {name:"rain", count: 0, rows: []},
			fog: {name:"fog", count: 0, rows: []},
			frost: {name:"frost", count: 0, rows: []}
		}
		let i=0;
		for (let key of Object.keys(this.types))
			this.types[key].rows = [board.row[i], board.row[5-i++]];
		
		this.elem.addEventListener("click",() => ui.selectRow(this), false);
	}
	
	// Adds a card if unique and clears all weather if 'clear weather' card added
	async addCard(card) {
		const isDuplicate = !!this.cards.find(c => c.name === card.name);
		super.addCard(card);
		AudioManager.playSFX(card.audio);
		card.elem.classList.add("noclick");
		if (card.name === "Clear Weather"){
			if (card.holder === player_me && typeof Achievements !== "undefined") {
				Achievements.recordClearWeather();
			}
			await sleep(500);
			this.clearWeather();
		} else {
			this.changeWeather(card, x => ++this.types[x].count === 1, (r,t) => r.addOverlay(t.name));
			if (isDuplicate)
			{
				await sleep(750);
				await board.toGrave(card, this);
			}
		}
		await sleep(1000);
	}
	
	// Override
	removeCard(card){
		card = super.removeCard(card);
		card.elem.classList.remove("noclick");
		this.changeWeather(card, x => --this.types[x].count === 0, (r,t) => r.removeOverlay(t.name));
		return card;
	}
	
	// Checks if a card's abilities are a weather type. If the predicate is met, perfom the action
	// on the type's associated rows
	changeWeather(card, predicate, action) {
		for (let x of card.abilities) {
			if (x in this.types && predicate(x)){
				for (let r of this.types[x].rows)
					action(r, this.types[x]);
			}
		}
	}
	
	// Removes all weather effects and cards
	async clearWeather() {
		await Promise.all(this.cards.map((c,i)=>this.cards[this.cards.length-i-1]).map(async c => await board.toGrave(c, this)));
	}
	
	// Override
	resize() {
		this.resizeCardContainer(4, 0.075, .045);
	}
	
	// Override
	reset(){
		super.reset();
		Object.keys(this.types).map(t => this.types[t].count = 0);
	}
}

// 
class Board {
	constructor() {
		this.op_score = 0;
		this.me_score = 0;
		this.row = [];
		for (let x=0; x<6; ++x) {
			let elem = document.getElementById( (x<3)?"field-op":"field-me" ).children[x%3];
			this.row[x] = new Row(elem);
		}
	}
	
	// Get the opponent of this Player
	opponent(player){
		return player === player_me ? player_op : player_me;
	}
	
	// Sends and translates a card from the source to the Deck of the card's holder
	async toDeck(card, source){
		await this.moveTo(card, "deck", source);
	}
	
	// Sends and translates a card from the source to the Grave of the card's holder
	async toGrave(card, source){
		await this.moveTo(card, "grave", source);
	}

	// Sends and translates a card from the source to the Hand of the card's holder
	async toHand(card, source) {
		await this.moveTo(card, "hand", source);
	}

	// Sends and translates a card from the source to Weather
	async toWeather(card, source) {
		await this.moveTo(card, weather, source);
	}
	
	// Sends and translates a card from the source to the Deck of the card's combat row
	async toRow(card, source) {
		let row = card.row;
		if (row === "agile")
		{
			if (card.holder.controller instanceof ControllerAI)
			{
				row = card.holder.controller.determineAgileRow(card).type;
			}
			else
			{
				row = "close";
			}
		}
		await this.moveTo(card, row, source);
	}
	
	// Sends and translates a card from the source to a specified row name or CardContainer
	async moveTo(card, dest, source) {
		if (isString(dest))
			dest = this.getRow(card, dest);
		await translateTo(card, source ? source : null, dest);
		let movedCard = source ? source.removeCard(card) : card;
		// Seamless handoff: clear in-flight transform and trigger landing punch
		if (card && card.elem) {
			card.elem.style.transition = "none";
			card.elem.style.transform = "";
			card.elem.style.zIndex = "";
			card.elem.style.boxShadow = "";
			card.elem.style.filter = "";
			card.elem.style.pointerEvents = "";
			card.elem.style.marginLeft = "";
			card.elem.style.marginRight = "";
		}
		await dest.addCard(movedCard);
		if (card && card.elem) {
			card.elem.classList.add("card-placed-anim");
			setTimeout(() => {
				if (card.elem) {
					card.elem.classList.remove("card-placed-anim");
					card.elem.style.transition = "";
				}
			}, 250);
		}
	}
	
	// Sends and translates a card from the source to a row name associated with the passed player
	async addCardToRow(card, row_name, player, source) {
		if (row_name === "agile") {
			row_name = (card && card.holder && card.holder.controller instanceof ControllerAI)
				? card.holder.controller.determineAgileRow(card).type
				: "close";
		}
		let row = this.getRow(card, row_name, player);
		if (!row) return;
		await translateTo(card, source, row);
		if (card && card.elem) {
			card.elem.style.transition = "none";
			card.elem.style.transform = "";
			card.elem.style.zIndex = "";
			card.elem.style.boxShadow = "";
			card.elem.style.filter = "";
			card.elem.style.pointerEvents = "";
			card.elem.style.marginLeft = "";
			card.elem.style.marginRight = "";
		}
		await row.addCard(card);
		if (card && card.elem) {
			card.elem.classList.add("card-placed-anim");
			setTimeout(() => {
				if (card.elem) {
					card.elem.classList.remove("card-placed-anim");
					card.elem.style.transition = "";
				}
			}, 250);
		}
	}
	
	// Returns the CardCard associated with the row name that the card would be sent to
	getRow(card, row_name, player){
		player = player ? player : card ? card.holder : player_me;
		let isMe = player === player_me;
		let isSpy = card.abilities.includes("spy");
		switch (row_name) {
			case "weather": return weather; break;
			case "close":  return this.row[ isMe^isSpy ? 3 : 2];
			case "ranged": return this.row[ isMe^isSpy ? 4 : 1];
			case "siege":  return this.row[ isMe^isSpy ? 5 : 0];
			case "grave": return player.grave;
			case "deck": return player.deck;
			case "hand": return player.hand;
			default: console.error( card.name + " sent to incorrect row \"" +row_name+ "\" by " +card.holder.name );
		}
	}
	
	// Updates which player currently is in the lead
	updateLeader() {
		let dif = player_me.total - player_op.total;
		player_me.setWinning(dif > 0);
		player_op.setWinning(dif < 0);
	}

	async clearRound()
	{
		await Promise.all([
			await weather.clearWeather(),
			...board.row.map(async row => await row.clear())
		]);
	}
}


class GameStateEnum extends Enum {};
const GameState = Object.freeze({
	CUSTOMIZE: new GameStateEnum(0),
	PLAYING: new GameStateEnum(10),
	END_SCREEN: new GameStateEnum(100)
});

class Game {
	constructor() {
		this.endScreen = document.getElementById("end-screen");
		let buttons = this.endScreen.getElementsByTagName("button");
		this.customize_elem = buttons[0];
		this.rematch_elem = buttons[1];
		this.newGame_elem = buttons[2];
		this.customize_elem.addEventListener("click", () => this.returnToCustomization(), false);
		this.rematch_elem.addEventListener("click", () => this.rematchGame(), false);
		this.newGame_elem.addEventListener("click", () => this.newOpponentGame(), false);
		this.state = GameState.CUSTOMIZE;
		this.reset();
	}
	
	reset() {
		this.firstPlayer = null;
		this.currPlayer = null;
		
		this.gameStart = [];
		this.roundStart = [];
		this.roundEnd = [];
		this.turnStart = [];
		this.turnEnd = [];
		
		this.roundCount = 0;
		this.roundHistory = [];
		
		this.randomRespawn = false;
		this.doubleSpyPower = false;

		this.placedEffectsActive = false;
		this._transitionToken = 0;
		this.isTurnTransitioning = false;
		this.isActionInProgress = false;
		this.isCardBeingPlayed = false;
		this.isAutoPlayingTimeout = false;
		this.isEndingRound = false;
		
		weather.reset();
		board.row.forEach(r => r.reset());
	}
	
	// Sets up player faction abilities and psasive leader abilities
	initPlayers(p1, p2){
		let l1 = ability_dict[p1.leader.abilities[0]];
		let l2 = ability_dict[p2.leader.abilities[0]];
		if (l1 === ability_dict["emhyr_whiteflame"] || l2 === ability_dict["emhyr_whiteflame"]){
			p1.disableLeader();
			p2.disableLeader();
		} else {
			initLeader(p1, l1);
			initLeader(p2, l2);
		}
		if (p1.deck.faction === p2.deck.faction && p1.deck.faction === "scoiatael")
			return;
		initFaction(p1);
		initFaction(p2);
		
		function initLeader(player, leader){
			if (leader.placed)
				leader.placed(player.leader);
			Object.keys(leader).filter(key => game[key]).map(key => game[key].push(leader[key]));
		}
		
		function initFaction(player){
			if (factions[player.deck.faction] && factions[player.deck.faction].factionAbility)
				factions[player.deck.faction].factionAbility(player);
		}
	}

	isPlaying()
	{
		return this.state === GameState.PLAYING;
	}

	setState(newState)
	{
		if (!(newState instanceof GameStateEnum) || this.state === newState)
			return;
		const oldState = this.state;
		this.state = newState;
		EventManager.gameStateChanged.dispatch(oldState, newState);
	}
	
	// Sets initializes player abilities, player hands and redraw
	async startGame() {
		if (typeof fitGameBoard === "function") fitGameBoard();
		const mainEl = document.querySelector("main");
		if (mainEl) mainEl.classList.remove("hide");
		const endScr = document.getElementById("end-screen");
		if (endScr) endScr.classList.add("hide");
		this.playerMeSpiesPlayed = 0;
		EventManager.gameOpened.dispatch();
		this.initPlayers(player_me, player_op);
		this.setState(GameState.PLAYING);
		if (typeof MusicManager !== "undefined") {
			MusicManager.playDuelMusic(true);
		}
		AudioManager.playSFX('game_opening');
		await this.runEffects(this.gameStart);
		await this.coinToss();
		AudioManager.playSFX('redraw');
		await Promise.all([...Array(10).keys()].map( async () => {
			await player_me.deck.draw(player_me.hand);
			await player_op.deck.draw(player_op.hand);
		}));
		AudioManager.playSFX("game_start");
		await this.initialRedraw();
		this.currPlayer = this.firstPlayer;
		this.startRound();
	}
	
	// Simulated coin toss to determine who starts game
	async coinToss(){
		if (this.firstPlayer)
			return;
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			this.firstPlayer = VersusMode.isFirstTurn ? player_me : player_op;
		} else {
			this.firstPlayer = (Math.random() < 0.5) ? player_me : player_op;
		}
		await ui.notification(this.firstPlayer.tag + "-coin", 1200);
	}
	
	// Allows the player to swap out up to two cards from their iniitial hand
	async initialRedraw(){
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			VersusMode.startMulliganTimer();
			await ui.queueCarousel(player_me.hand, 2, async (c, i) => { 
				AudioManager.playSFX('redraw');
				await player_me.deck.swap(c, c.cards[i]);
			}, c => true, false, true, (typeof I18N !== "undefined") ? I18N.t("redraw_title") : "Choose up to 2 cards to redraw.");
			VersusMode.stopMulliganTimer();
			ui.enablePlayer(false);
			VersusMode.onLocalMulliganDone();
			await VersusMode.waitForRemoteMulligan();
		} else {
			for (let i=0; i< 2; i++)
				player_op.controller.redraw();
			if (typeof VersusMode !== "undefined") {
				VersusMode.startMulliganTimer();
			}
			await ui.queueCarousel(player_me.hand, 2, async (c, i) => { 
				AudioManager.playSFX('redraw');
				await player_me.deck.swap(c, c.cards[i]);
			}, c => true, false, true, (typeof I18N !== "undefined") ? I18N.t("redraw_title") : "Choose up to 2 cards to redraw.");
			if (typeof VersusMode !== "undefined") {
				VersusMode.stopMulliganTimer();
				VersusMode.hideTurnHUD();
			}
			ui.enablePlayer(false);
		}
	}
	
	// Initiates a new round of the game
	async startRound(){
		if (this.state !== GameState.PLAYING) return;
		const myTransitionToken = (this._transitionToken = (this._transitionToken || 0) + 1);
		this.isTurnTransitioning = true;
		this.isActionInProgress = true;
		this.isCardBeingPlayed = false;
		ui.enablePlayer(false);
		try {
			if (typeof player_me !== "undefined" && player_me) { player_me.turnPlayed = false; player_me.isPlayingCard = false; }
			if (typeof player_op !== "undefined" && player_op) { player_op.turnPlayed = false; player_op.isPlayingCard = false; }
			this.playerMeHornsInRound = 0;
			this.firstPlayer = this.currPlayer;
			this.roundCount++;
			EventManager.roundStarted.dispatch(this.roundCount, this.currPlayer);
			if (this.roundCount === 1)
				AudioManager.playSFX("round1_start");
			await this.runEffects(this.roundStart);
			if (this.state !== GameState.PLAYING) return;
			
			if ( !player_me.canPlay() )
				player_me.setPassed(true);
			if ( !player_op.canPlay() )
				player_op.setPassed(true);
			
			if (player_op.passed && player_me.passed)
				return await this.endRound();
			
			if (this.currPlayer && this.currPlayer.passed)
				this.currPlayer = this.currPlayer.opponent();
			
			await ui.notification("round-start", 1200);
			if (this.state !== GameState.PLAYING) return;
			AudioManager.playSFX(this.currPlayer === player_me ? "turn_me" : "turn_op");
			await ui.notification(this.currPlayer.tag + "-turn", 1200);
			if (this.state !== GameState.PLAYING) return;
			await this.startTurn();
		} finally {
			if (this._transitionToken === myTransitionToken) {
				this.isTurnTransitioning = false;
				this.isActionInProgress = false;
				this.isCardBeingPlayed = false;
			}
		}
	}
	
	// Starts a new turn. Enables client interraction in client's turn.
	async startTurn() {
		if (this.state !== GameState.PLAYING) return;
		this.turnId = (this.turnId || 0) + 1;
		const thisTurnId = this.turnId;

		await this.runEffects(this.turnStart);
		if (this.turnId !== thisTurnId || this.state !== GameState.PLAYING) return;

		this._transitionToken = (this._transitionToken || 0) + 1;
		this.isTurnTransitioning = false;
		this.isActionInProgress = false;
		this.isCardBeingPlayed = false;
		if (this.currPlayer) {
			this.currPlayer.turnPlayed = false;
			this.currPlayer.isPlayingCard = false;
		}

		ui.enablePlayer(this.currPlayer === player_me);
		if (typeof VersusMode !== "undefined" && VersusMode.isActive && VersusMode.isHost) {
			VersusMode.broadcastTurnSync();
		}
		this.currPlayer.startTurn();
	}
	
	// Ends the current turn and may end round. Disables client interraction in client's turn.
	async endTurn(requestingPlayer) {
		if (this.isTurnTransitioning) {
			console.warn("[game.endTurn] Transição de turno já em andamento. Ignorando chamada concorrente.");
			return;
		}
		if (requestingPlayer && this.currPlayer && requestingPlayer !== this.currPlayer) {
			console.warn(`[game.endTurn] Jogador ${requestingPlayer.tag} tentou encerrar turno mas currPlayer é ${this.currPlayer.tag}. Ignorando.`);
			return;
		}
		const myTransitionToken = (this._transitionToken = (this._transitionToken || 0) + 1);
		this.isTurnTransitioning = true;
		this.isActionInProgress = true;
		if (typeof VersusMode !== "undefined") {
			VersusMode.stopTurnTimer();
		}

		try {
			if (this.currPlayer === player_me)
				ui.enablePlayer(false);
			await this.runEffects(this.turnEnd);
			if (this.state !== GameState.PLAYING) return;

			if (this.currPlayer && this.currPlayer.passed)
				await ui.notification(this.currPlayer.tag + "-pass", 1200);
			if (this.state !== GameState.PLAYING) return;

			if (player_op && player_me && player_op.passed && player_me.passed) {
				await this.endRound();
				return;
			}
			else
			{
				if (!this.currPlayer.opponent().passed)
				{
					this.currPlayer = this.currPlayer.opponent();
					AudioManager.playSFX(this.currPlayer === player_me ? "turn_me" : "turn_op");
					await ui.notification(this.currPlayer.tag + "-turn", 1200);
					if (this.state !== GameState.PLAYING) return;
				}
				await this.startTurn();
			}
		} finally {
			if (this._transitionToken === myTransitionToken) {
				this.isTurnTransitioning = false;
				this.isActionInProgress = false;
				this.isCardBeingPlayed = false;
			}
		}
	}
	
	// Ends the round and may end the game. Determines final scores and the round winner.
	async endRound() {
		if (typeof VersusMode !== "undefined") {
			VersusMode.stopTurnTimer();
		}
		let dif = player_me.total - player_op.total;
		if (dif === 0) {
			let nilf_me = player_me.deck && player_me.deck.faction === "nilfgaard";
			let nilf_op = player_op.deck && player_op.deck.faction === "nilfgaard";
			dif = nilf_me ^ nilf_op ? nilf_me ? 1 : -1 : 0;
		}

		let syncedResult = null;
		let nextStarter = null;
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			if (VersusMode.isHost) {
				const hostScore = player_me.total;
				const guestScore = player_op.total;
				const outcome = dif > 0 ? "host" : (dif < 0 ? "guest" : "draw");
				const hostHealth = player_me.health - (dif <= 0 ? 1 : 0);
				const guestHealth = player_op.health - (dif >= 0 ? 1 : 0);

				nextStarter = (dif > 0) ? "host" : ((dif < 0) ? "guest" : (this.firstPlayer === player_me ? "host" : "guest"));

				VersusMode.sendPacket("ROUND_RESULT", {
					roundCount: this.roundCount,
					outcome: outcome,
					nextStarter: nextStarter,
					hostDif: dif,
					hostScore: hostScore,
					guestScore: guestScore,
					hostHealth: Math.max(0, hostHealth),
					guestHealth: Math.max(0, guestHealth)
				});
			} else {
				syncedResult = await VersusMode.waitForHostRoundResult(this.roundCount);
				if (syncedResult) {
					if (syncedResult.outcome === "guest") {
						dif = 1;
					} else if (syncedResult.outcome === "host") {
						dif = -1;
					} else {
						dif = 0;
					}
					nextStarter = syncedResult.nextStarter;
					player_me.total = syncedResult.guestScore;
					player_op.total = syncedResult.hostScore;
				}
			}
		}

		let winner = dif > 0 ? player_me : dif < 0 ? player_op : null;
		let verdict = {winner: winner, score_me: player_me.total, score_op: player_op.total}
		this.roundHistory.push(verdict);
		
		await this.runEffects(this.roundEnd);
		
		player_me.endRound( dif > 0);
		player_op.endRound( dif < 0);

		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			if (!VersusMode.isHost && syncedResult) {
				if (syncedResult.guestHealth !== undefined) player_me.health = syncedResult.guestHealth;
				if (syncedResult.hostHealth !== undefined) player_op.health = syncedResult.hostHealth;
			}
			VersusMode.syncGemsUI();
		}
		
		let notificationKey = "";
		if (dif > 0)
		{
			if (typeof triggerHaptic === "function") triggerHaptic("round_win");
			AudioManager.playSFX("round_win");
			notificationKey = "win-round";
			if (typeof Achievements !== "undefined") {
				const hasWeather = (typeof weather !== "undefined") && (
					weather.cards.length > 0 ||
					weather.types.rain.count > 0 ||
					weather.types.fog.count > 0 ||
					weather.types.frost.count > 0
				);
				const myCardsCount = board.row[3].cards.length + board.row[4].cards.length + board.row[5].cards.length;
				Achievements.recordRoundWin(myCardsCount, hasWeather);
			}
		}	
		else if (dif < 0)
		{
			if (typeof triggerHaptic === "function") triggerHaptic("round_loss");
			AudioManager.playSFX("round_lose");
			notificationKey = "lose-round";
		}
		else
		{
			if (typeof triggerHaptic === "function") triggerHaptic("medium");
			AudioManager.playSFX("round_lose");
			notificationKey = "draw-round";
		}

		await Promise.all([
			board.clearRound(),
			ui.notification(notificationKey, 1200)
		]);

		EventManager.roundEnded.dispatch(this.roundCount, player_me.total, player_op.total);
		if (this.state !== GameState.PLAYING) return;
		if (player_me.health === 0 || player_op.health === 0)
			await this.endGame();
		else
		{
			if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
				if (VersusMode.isHost) {
					this.currPlayer = (nextStarter === "host") ? player_me : player_op;
				} else {
					if (nextStarter) {
						this.currPlayer = (nextStarter === "guest") ? player_me : player_op;
					} else {
						this.currPlayer = dif < 0 ? player_op : dif > 0 ? player_me : this.firstPlayer;
					}
				}
			} else {
				this.currPlayer = dif < 0 ? player_op : dif > 0 ? player_me : this.firstPlayer;
			}
			await this.startRound();
		}
	}
	
	// Sets up and displays the end-game screen
	async endGame() {
		if (typeof VersusMode !== "undefined") {
			VersusMode.stopAllTimers();
			VersusMode.hideTurnHUD();
		}
		let endScreen = document.getElementById("end-screen");
		let rows = endScreen.getElementsByTagName("tr");
		rows[1].children[0].innerHTML = (player_me && player_me.name) ? player_me.name : ((typeof I18N !== "undefined") ? I18N.t("player_name") : "Geralt");
		rows[2].children[0].innerHTML = (player_op && player_op.name) ? player_op.name : ((typeof I18N !== "undefined") ? I18N.t("opponent_name") : "Opponent");

		if (typeof I18N !== "undefined") {
			if (rows[0] && rows[0].children.length >= 4) {
				rows[0].children[1].innerHTML = I18N.t("round_1");
				rows[0].children[2].innerHTML = I18N.t("round_2");
				rows[0].children[3].innerHTML = I18N.t("round_3");
			}
			const drawTextElem = endScreen.getElementsByTagName("p")[0];
			if (drawTextElem) drawTextElem.innerHTML = I18N.t("end_draw_desc");
			const buttons = endScreen.getElementsByTagName("button");
			if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
				if (buttons[0]) buttons[0].innerHTML = I18N.t("btn_return_lobby") || "Voltar à Sala";
				if (buttons[1]) {
					buttons[1].innerHTML = I18N.t("btn_rematch") || "Revanche";
					buttons[1].disabled = false;
					buttons[1].classList.remove("highlight");
				}
				if (buttons[2]) buttons[2].innerHTML = I18N.t("btn_main_menu") || "Menu Principal";
			} else {
				if (buttons[0]) buttons[0].innerHTML = I18N.t("btn_customize");
				if (buttons[1]) {
					buttons[1].innerHTML = I18N.t("btn_rematch");
					buttons[1].disabled = false;
					buttons[1].classList.remove("highlight");
				}
				if (buttons[2]) buttons[2].innerHTML = I18N.t("btn_new_game");
			}
		}
		
		for (let i=1; i<4; ++i) {
			let round = this.roundHistory[i-1];
			rows[1].children[i].innerHTML = round ? round.score_me : 0;
			rows[1].children[i].style.color = round && round.winner === player_me ? "goldenrod" : "";
			
			rows[2].children[i].innerHTML = round ? round.score_op : 0;
			rows[2].children[i].style.color = round && round.winner === player_op ? "goldenrod" : "";
		}
		
		endScreen.children[0].className = "";
		if (player_op.health <= 0 && player_me.health <= 0) {
			endScreen.getElementsByTagName("p")[0].classList.remove("hide");
			AudioManager.playSFX("game_lose");
			endScreen.children[0].classList.add("end-draw");
		} else if (player_op.health === 0){
			AudioManager.playSFX("game_win");
			endScreen.children[0].classList.add("end-win");
			if (typeof Achievements !== "undefined") {
				const faction = (player_me && player_me.deck) ? player_me.deck.faction : null;
				const lostARound = this.roundHistory.some(r => r && r.winner === player_op);
				const deckCardCount = (player_me && player_me.deck_data && player_me.deck_data.cards) ? 
					player_me.deck_data.cards.reduce((sum, c) => sum + (c.count || 1), 0) : 0;
				Achievements.recordWin(faction, lostARound, deckCardCount);
			}
			if (typeof StoryMode !== "undefined" && StoryMode.activeMatch) {
				StoryMode.onMatchEnded(true);
			}
		} else {
			AudioManager.playSFX("game_lose");
			endScreen.children[0].classList.add("end-lose");
			if (typeof Achievements !== "undefined") {
				const wonARound = this.roundHistory.some(r => r && r.winner === player_me);
				Achievements.recordLoss(wonARound);
			}
			if (typeof StoryMode !== "undefined" && StoryMode.activeMatch) {
				StoryMode.onMatchEnded(false);
			}
		}
		
		const isStory = (typeof StoryMode !== "undefined" && StoryMode.activeMatch);
		const storyReturnBtn = document.getElementById("end-btn-story-return");

		if (isStory) {
			if (this.customize_elem) this.customize_elem.style.display = "none";
			if (this.rematch_elem) this.rematch_elem.style.display = "none";
			if (this.newGame_elem) this.newGame_elem.style.display = "none";
			if (storyReturnBtn) {
				storyReturnBtn.classList.remove("hide");
				storyReturnBtn.style.display = "block";
				const match = StoryMode.activeMatch;
				const wonMatch = (player_op.health === 0 && player_me.health > 0);
				if (match && match.isTournament && wonMatch && match.roundIndex < (match.node.rounds.length - 1)) {
					const nextR = match.roundIndex + 1;
					const totalR = match.node.rounds.length;
					storyReturnBtn.textContent = `⚔ Avançar para Batalha ${nextR + 1}/${totalR}`;
					storyReturnBtn.onclick = () => {
						StoryMode.advanceToNextTournamentMatch(match.nodeId, nextR);
					};
				} else {
					storyReturnBtn.textContent = "Retornar ao Mapa do Continente";
					storyReturnBtn.onclick = () => {
						StoryMode.returnFromMatchToMap();
					};
				}
			}
		} else {
			if (this.customize_elem) this.customize_elem.style.display = "";
			if (this.rematch_elem) this.rematch_elem.style.display = "";
			if (this.newGame_elem) this.newGame_elem.style.display = "";
			if (storyReturnBtn) {
				storyReturnBtn.classList.add("hide");
				storyReturnBtn.style.display = "none";
			}
		}

		fadeIn(endScreen, 300);
		ui.enablePlayer(true);
		this.setState(GameState.END_SCREEN);
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			VersusMode.onGameEnded();
		}
	}

	promptForfeit() {
		if (this.state !== GameState.PLAYING) return;
		AudioManager.playSFX('warning');
		const restoreBoardInteraction = () => {
			if (this.state === GameState.PLAYING && (this.currPlayer === player_me || (typeof Carousel !== "undefined" && Carousel.curr))) {
				ui.enablePlayer(true);
			}
		};
		const isStory = (typeof StoryMode !== "undefined" && StoryMode.activeMatch);
		const isTourney = isStory && StoryMode.activeMatch.isTournament;
		const resumeLabel = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_resume") : "Continuar Partida";
		const forfeitLabel = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_confirm") : "Desistir";
		const titleText = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_title") : "Desistir da Partida?";
		let descText;
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			descText = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_desc_versus") : "Se você desistir agora, a vitória será concedida imediatamente ao seu adversário.";
		} else if (isStory) {
			descText = isTourney
				? "Se você desistir agora, sofrerá derrota e o progresso atual do torneio será reiniciado da 1ª batalha."
				: "Se você desistir agora, a partida será encerrada como derrota e a penalidade de Coroas será aplicada.";
		} else {
			descText = (typeof I18N !== "undefined") ? I18N.t("forfeit_popup_desc") : "Você perderá a partida atual imediatamente.";
		}

		ui.popup(
			resumeLabel,
			restoreBoardInteraction,
			forfeitLabel,
			() => {
				this.executeForfeit();
			},
			titleText,
			descText
		);
	}

	executeForfeit() {
		if (typeof VersusMode !== "undefined") {
			VersusMode.stopAllTimers();
			VersusMode.hideTurnHUD();
			VersusMode.isActionExecuting = false;
			VersusMode.isHandlingTimeout = false;
		}
		this.isTurnTransitioning = false;
		this.isActionInProgress = false;
		this.isCardBeingPlayed = false;
		this.isAutoPlayingTimeout = false;
		this.placedEffectsActive = false;

		if (typeof Popup !== "undefined" && Popup.curr) {
			Popup.curr.clear();
		}
		if (typeof Carousel !== "undefined" && Carousel.curr) {
			Carousel.curr.exit();
		}
		if (typeof ui !== "undefined" && ui) {
			ui.hidePreview();
		}
		if (player_me) {
			player_me.health = 0;
			player_me.isPlayingCard = false;
			const gem1Me = document.getElementById("gem1-me");
			const gem2Me = document.getElementById("gem2-me");
			if (gem1Me) gem1Me.classList.remove("gem-on");
			if (gem2Me) gem2Me.classList.remove("gem-on");
		}
		if (player_op && player_op.health <= 0) {
			player_op.health = 1;
		}
		if (typeof VersusMode !== "undefined" && VersusMode.syncGemsUI) {
			VersusMode.syncGemsUI();
		}
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			VersusMode.sendPacket("ACTION_FORFEIT");
		}
		this.endGame();
	}

	exitGame()
	{
		const isStory = (typeof StoryMode !== "undefined" && StoryMode.activeMatch);
		if (isStory && this.state !== GameState.PLAYING) {
			StoryMode.returnFromMatchToMap();
			return;
		}
		AudioManager.playSFX('warning');
		const restoreBoardInteraction = () => {
			if (this.state === GameState.PLAYING && (this.currPlayer === player_me || (typeof Carousel !== "undefined" && Carousel.curr))) {
				ui.enablePlayer(true);
			}
		};
		if (isStory) {
			const isTourney = StoryMode.activeMatch && StoryMode.activeMatch.isTournament;
			ui.popup(
				"Continuar Partida", restoreBoardInteraction,
				"Desistir e Sair", () => {
					this.executeForfeit();
				},
				"Sair da Partida?", 
				isTourney
					? "Sair da partida equivale a desistir do torneio. Você sofrerá derrota e o progresso atual do torneio será reiniciado da 1ª batalha."
					: "Sair da partida no Modo Exploração equivale a desistir do duelo. A partida será encerrada como derrota com penalidade de Coroas."
			);
			return;
		}
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			if (this.state !== GameState.PLAYING) {
				VersusMode.returnToPreMatchLobby();
				return;
			}
			ui.popup(
				(typeof I18N !== "undefined") ? I18N.t("forfeit_popup_resume") : "Continuar Partida",
				restoreBoardInteraction,
				(typeof I18N !== "undefined") ? I18N.t("forfeit_popup_confirm") : "Desistir da Partida",
				() => {
					this.executeForfeit();
				},
				"Sair da Partida?",
				"Em partidas online, sair concederá vitória ao adversário."
			);
			return;
		}
		ui.popup(
			(typeof I18N !== "undefined") ? I18N.t("exit_popup_resume") : "Continuar",
			restoreBoardInteraction,
			(typeof I18N !== "undefined") ? I18N.t("btn_main_menu") || "Menu Principal" : "Menu Principal",
			() => {
				if (typeof VersusMode !== "undefined") {
					VersusMode.stopAllTimers();
					VersusMode.hideTurnHUD();
				}
				if (typeof Carousel !== "undefined" && Carousel.curr) {
					Carousel.curr.exit();
				}
				if (typeof ui !== "undefined" && ui) {
					ui.hidePreview();
				}
				this.reset();
				if (player_me) player_me.reset();
				if (player_op) player_op.reset();
				const mainEl = document.querySelector("main");
				if (mainEl) mainEl.classList.add("hide");
				if (this.endScreen) this.endScreen.classList.add("hide");
				if (typeof MenuController !== "undefined" && MenuController.returnToMainMenu) {
					MenuController.returnToMainMenu();
				} else {
					this.returnToCustomization();
				}
			},
			"Sair da Partida?", 
			"Deseja encerrar o duelo atual e voltar ao Menu Principal?"
		); 
	}
	
	// Returns the client to the deck customization screen
	returnToCustomization(){
		this.reset();
		player_me.reset();
		player_op.reset();
		this.endScreen.classList.add("hide");
		if (typeof StoryMode !== "undefined" && StoryMode.activeMatch) {
			StoryMode.returnFromMatchToMap();
			return;
		}
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			VersusMode.returnToPreMatchLobby();
			return;
		}
		if (typeof MusicManager !== "undefined") {
			MusicManager.playMenuMusic();
		}
		EventManager.customizationOpened.dispatch();
		document.getElementById("deck-customization").classList.remove("hide");
		AudioManager.playSFX('menu_opening');
		this.setState(GameState.CUSTOMIZE);
	}

	newOpponentGame()
	{
		if (typeof StoryMode !== "undefined" && StoryMode.activeMatch) {
			StoryMode.returnFromMatchToMap();
			return;
		}
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			VersusMode.exitVersusToMenu();
			return;
		}
		this.reset();
		player_me.reset();
		player_op = new Player('op', (typeof I18N !== "undefined") ? I18N.t("opponent_name") : 'Player 2', dm.constructOpponentDeck(false));
		this.endScreen.classList.add("hide");
		this.startGame();
	}
	
	// Restarts the last game with the same decks
	rematchGame(){
		if (typeof StoryMode !== "undefined" && StoryMode.activeMatch) {
			const nodeId = StoryMode.activeMatch.nodeId;
			const roundIdx = StoryMode.activeMatch.roundIndex || 0;
			this.reset();
			player_me.reset();
			player_op.reset();
			this.endScreen.classList.add("hide");
			StoryMode.startMatch(nodeId, roundIdx);
			return;
		}
		if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
			VersusMode.requestRematch();
			return;
		}
		this.reset();
		player_me.reset();
		player_op.reset();
		this.endScreen.classList.add("hide");
		this.startGame();
	}
	
	// Executes effects in list. If effect returns true, effect is removed.
	async runEffects(effects){
		for (let i=effects.length-1; i>=0; --i){
			let effect = effects[i];
			if (await effect())
				effects.splice(i,1)
		}
	}
	
}

// Contians information and behavior of a Card
class Card {

	constructor(card_data, player) {
		this.name = card_data.name;
		this.basePower = this.power = Number(card_data.strength);
		this.faction = card_data.deck;
		this.abilities = (card_data.ability === "") ? [] : card_data.ability.split(" ");
		this.row = (card_data.deck === "weather") ? card_data.deck : card_data.row;
		this.filename = card_data.filename;
		if (card_data.muster)
		{
			this.muster = card_data.muster;
		}
		this.placed = [];
		this.removed = [];
		this.activated = [];
		this.holder = player;
		
		this.hero = false;
		if (this.abilities.length > 0) {
			this.audio = this.abilities[this.abilities.length-1];
			if (this.abilities[0] === "hero") {
				this.hero = true;
				this.abilities.splice(0, 1);
			}
			for (let x of this.abilities) {
				let ab = ability_dict[x];
				if ("placed" in ab) this.placed.push(ab.placed);
				if ("removed" in ab) this.removed.push(ab.removed);
				if ("activated" in ab) this.activated.push(ab.activated);
			}
		}
		
		Object.defineProperty(this, 'desc_name', {
			get() {
				if (this.row === "leader")
					return (typeof I18N !== "undefined") ? I18N.t("ability_leader_name") : "Leader Ability";
				else if (this.abilities.length > 0)
					return ability_dict[this.abilities[this.abilities.length-1]].name;
				else if (this.row === "agile")
					return (typeof I18N !== "undefined") ? I18N.t("ability_agile_name") : "Agile";
				else if (this.hero)
					return (typeof I18N !== "undefined") ? I18N.t("ability_hero_name") : "Hero";
				else
					return "";
			},
			configurable: true
		});
		
		Object.defineProperty(this, 'desc', {
			get() {
				let d = this.row === "agile" ? ability_dict["agile"].description : "";
				for (let i = this.abilities.length - 1; i >= 0; --i) {
					d += ability_dict[this.abilities[i]].description;
				}
				if (this.hero)
					d += ability_dict["hero"].description;
				return d;
			},
			configurable: true
		});
		
		this.elem = this.createCardElem(this);
	}
	
	// Returns the identifier for this type of card
	id() {
		return this.name;
	}
	
	// Sets and displays the current power of this card
	setPower(n){
		if (this.name === "Decoy")
			return;
		let elem = this.elem.children[0].children[0];
		if (n !== this.power) {
			this.power = n;
			elem.innerHTML = this.power;
		}
		elem.style.color = (n>this.basePower) ? "goldenrod" : (n<this.basePower) ? "red" : "";
	}
	
	// Resets the power of this card to default
	resetPower(){
		this.setPower(this.basePower);
	}
	
	// Automatically sends and translates this card to its apropriate row from the passed source
	async autoplay(source){
		await board.toRow(this, source);
	}
	
	// Animates an ability effect
	async animate(name, bFade = true, bExpand = true) {
		AudioManager.playSFX(name);
		if (name === "scorch") {
			return await this.scorch(name);
		}
		let anim = this.elem.children[3];
		anim.style.backgroundImage = iconURL("anim_" + name);
		await sleep(50);
		
		if (bFade) fadeIn(anim, 300);
		if (bExpand) anim.style.backgroundSize = "100% auto";
		await sleep(300);
		
		if (bExpand) anim.style.backgroundSize = "80% auto";
		await sleep(1000);
		
		if (bFade) fadeOut(anim, 300);
		if (bExpand) anim.style.backgroundSize = "40% auto";
		await sleep(300);
		
		anim.style.backgroundImage = "";
	}
	
	// Animates the scorch effect
	async scorch(name){
		let anim = this.elem.children[3];
		anim.style.backgroundSize = "cover";
		anim.style.backgroundImage = iconURL("anim_" + name);
		await sleep(50);
		
		fadeIn(anim, 300);
		await sleep(1300);
		
		fadeOut(anim, 300);
		await sleep(300);
		
		anim.style.backgroundSize = "";
		anim.style.backgroundImage = "";
	}
	
	// Returns true if this is a combat card that is not a Hero
	isUnit(){
		return !this.hero && (this.row === "close" || this.row === "ranged" || this.row === "siege" || this.row === "agile");
	}
	
	// Returns true if card is sent to a Row's special slot
	isSpecial() {
		return this.name === "Commander's Horn" || this.name === "Mardroeme";
	}

	isHero() { return this.hero; }

	// Compares by type then power then name
	static compare(a, b){
		var dif = factionRank(a) - factionRank(b);
		if (dif !== 0)
			return dif;
		dif = a.basePower - b.basePower;
		if (dif && dif !== 0)
			return dif;
		return a.name.localeCompare(b.name);
		
		function factionRank(c){ return c.faction === "special" ? -2 : (c.faction === "weather") ? -1 : 0; }
	}

	// Creates an HTML element based on the card's properties
	createCardElem(card){
		let elem = document.createElement("div");
		elem.card = card;
		elem.style.backgroundImage = smallURL(card.faction + "_" + card.filename);
		elem.classList.add("card");
		elem.setAttribute('data-title', card.name);
		elem.addEventListener("click", () => ui.selectCard(card), false);
		
		if (card.row === "leader")
			return elem;
		
		let power = document.createElement("div");
		elem.appendChild(power);
		let bg;
		if (card.hero) {
			bg = "power_hero";
			elem.classList.add("hero");
		} else if (card.faction === "weather") {
			bg = "power_" + card.abilities[0];
		} else if (card.faction === "special") {
			bg = "power_" + card.abilities[0];
			elem.classList.add("special");
		} else {
			bg = "power_normal";
		}
		power.style.backgroundImage = iconURL(bg);
		
		let row = document.createElement("div");
		elem.appendChild(row);
		if (card.row === "close" || card.row === "ranged" || card.row === "siege" || card.row === "agile") {
			let num = document.createElement("div");
			num.appendChild( document.createTextNode(card.basePower) );
			num.classList.add("center");
			power.appendChild(num);
			row.style.backgroundImage = iconURL("card_row_" + card.row);
		}

		let abi = document.createElement("div");
		elem.appendChild(abi);
		if (card.faction !== "special" && card.faction !== "weather" && card.abilities.length > 0) {
			let str =  card.abilities[card.abilities.length-1];
			if (str === "cerys")
				str = "muster";
			if (str.startsWith("avenger"))
				str = "avenger";
			if (str === "scorch_c" || str == "scorch_r" || str === "scorch_s")
				str = "scorch";
			abi.style.backgroundImage = iconURL("card_ability_" + str);
		} else if (card.row === "agile")
			abi.style.backgroundImage = iconURL("card_ability_" + "agile");
		
		elem.appendChild( document.createElement("div") ); // animation overlay
		elem.addEventListener('mouseenter', CLICK_EVENT_SFX);
		return elem;
	}

	
	// Takes ID-Count object pairs and expands to a list of corresponding IDs
	static expandIDCounts(card_id_list)
	{
		return card_id_list.reduce((a,c) => a.concat(clone(c.count, card_dict[c.index])), []);
		function clone(n ,elem) { for (var  i=0, a=[]; i<n; ++i) a.push(elem); return a; }
	}

	// Takes ID-Count object pairs and returns a list of corresponding Cards
	static getCardsFromIdCounts(card_id_list, player)
	{
		return Card.expandIDCounts(card_id_list).map(e => new Card(e, player));
	}
}

class MusicManager {
	static MENU_TRACK = 'music/gwent_main.mp3';

	static tracks = [
		// Tema Principal
		'music/gwent_main.mp3',
		// The Witcher 3: Wild Hunt - Trilhas de Gwent & Taverna
		'music/05 Aen Seidhe.mp3',
		'music/06 Commanding the Fury.mp3',
		'music/10 Silver for Monsters....mp3',
		'music/12 The Nightingale.mp3',
		'music/13 City of Intrigues.mp3',
		'music/16 Kaer Morhen.mp3',
		'music/17 Eyes of the Wolf.mp3',
		'music/22 Cloak and Dagger.mp3',
		'music/25 Welcome, Imlerith.mp3',
		'music/26 Drink Up, There_s More!.mp3',
		'music/28 Blood on the Cobblestones.mp3',
		'music/30 The Song of the Sword-Dancer.mp3',
		'music/31 The Hunt is Coming.mp3',
		'music/33 Ladies of the Woods.mp3',
		'music/34 Merchants of Novigrad.mp3',
		'music/35 Hunt Or Be Hunted.mp3',
		// Temas Clássicos Gwent
		'music/plots_and_intrigues.mp3',
		'music/northern_realms.mp3',
		'music/the_black_clads.mp3',
		'music/witcher_forest.mp3',
		'music/witcher_ocean.mp3'
	];

	static trackTitles = [
		'Tema Principal: How About a Round of Gwent',
		'05. Aen Seidhe',
		'06. Commanding the Fury',
		'10. Silver for Monsters...',
		'12. The Nightingale',
		'13. City of Intrigues',
		'16. Kaer Morhen',
		'17. Eyes of the Wolf',
		'22. Cloak and Dagger',
		'25. Welcome, Imlerith',
		'26. Drink Up, There\'s More!',
		'28. Blood on the Cobblestones',
		'30. The Song of the Sword-Dancer',
		'31. The Hunt is Coming',
		'33. Ladies of the Woods',
		'34. Merchants of Novigrad',
		'35. Hunt Or Be Hunted',
		'Gwent: Plots and Intrigues',
		'Gwent: Reinos do Norte',
		'Gwent: Nilfgaard (The Black Clads)',
		'Gwent: Bosques de Kaer Morhen',
		'Gwent: Ventos e Mares de Skellige'
	];

	static currTrackIndex = 0;
	static mapTrackIndex = 0;
	static audio = null;
	static isPlaying = false;
	static initialized = false;
	static selectedMode = 'all';
	static volume = 0.6;
	static isMenuMode = true;
	static currentMode = 'menu'; // 'menu' | 'map' | 'duel'

	// Trilhas exclusivas do Modo Exploração (Mapa do Continente)
	static MAP_TRACKS = [
		'music/02 Geralt of Rivia.mp3',
		'music/03 Eredin, King of the Hunt.mp3',
		'music/04 Wake Up, Ciri.mp3',
		'music/07 Emhyr var Emreis.mp3',
		'music/08 Spikeroog.mp3',
		'music/09 King Bran\'s Final Voyage.mp3',
		'music/11 Whispers of Oxenfurt.mp3',
		'music/14 The Hunter\'s Path.mp3',
		'music/16 Kaer Morhen.mp3',
		'music/18 Witch Hunters.mp3',
		'music/20 Fate Calls.mp3',
		'music/21 The Vagabond.mp3',
		'music/24 Yes, I Do....mp3',
		'music/27 After the Storm.mp3',
		'music/29 Farewell, Old Friend.mp3',
		'music/32 The Fields of Ard Skellig.mp3',
		'music/34 Merchants of Novigrad.mp3'
	];

	static init() {
		if (MusicManager.initialized) return;
		MusicManager.initialized = true;

		const saved = localStorage.getItem("gc-jukebox-track") || "all";
		MusicManager.selectedMode = saved;
		if (saved !== "all") {
			const idx = parseInt(saved, 10);
			if (isNaN(idx) || idx < 0 || idx >= MusicManager.tracks.length) {
				MusicManager.selectedMode = "all";
				MusicManager.currTrackIndex = 0;
				localStorage.setItem("gc-jukebox-track", "all");
			} else {
				MusicManager.currTrackIndex = idx;
			}
		}

		const savedVol = localStorage.getItem("gc-music-volume");
		MusicManager.volume = (savedVol !== null) ? (parseFloat(savedVol) / 100) : 0.6;

		MusicManager.audio = new Audio(MusicManager.MENU_TRACK);
		MusicManager.audio.volume = MusicManager.volume;
		MusicManager.audio.loop = true;

		MusicManager.audio.addEventListener('ended', () => {
			if (MusicManager.currentMode === 'menu' || MusicManager.isMenuMode) {
				MusicManager.audio.currentTime = 0;
				if (MusicManager.isPlaying) MusicManager.audio.play().catch(e => console.log(e));
			} else if (MusicManager.currentMode === 'map') {
				MusicManager.nextMapTrack();
			} else if (MusicManager.selectedMode === "all") {
				MusicManager.nextTrack();
			} else {
				MusicManager.audio.currentTime = 0;
				if (MusicManager.isPlaying) MusicManager.audio.play().catch(e => console.log(e));
			}
		});

		MusicManager.audio.addEventListener('error', (e) => {
			console.warn("Track failed to load, moving to next:", MusicManager.audio ? MusicManager.audio.src : "unknown");
			if (MusicManager.currentMode === 'map') {
				MusicManager.nextMapTrack();
			} else if (!MusicManager.isMenuMode) {
				MusicManager.nextTrack();
			}
		});
	}

	static setVolume(percent) {
		MusicManager.init();
		const vol = Math.max(0, Math.min(1, parseFloat(percent) / 100));
		MusicManager.volume = vol;
		if (MusicManager.audio) {
			MusicManager.audio.volume = vol;
		}
		localStorage.setItem("gc-music-volume", percent);
	}

	static playMenuMusic() {
		MusicManager.init();
		MusicManager.isMenuMode = true;
		MusicManager.currentMode = 'menu';
		if (typeof Settings !== "undefined" && !Settings.music.isEnabled()) return;

		if (MusicManager.audio) {
			const currentSrc = decodeURIComponent(MusicManager.audio.src || '');
			if (currentSrc.includes('gwent_main.mp3') && !MusicManager.audio.paused) {
				MusicManager.isPlaying = true;
				MusicManager.audio.loop = true;
				return;
			}
			MusicManager.audio.src = MusicManager.MENU_TRACK;
			MusicManager.audio.loop = true;
			MusicManager.audio.volume = MusicManager.volume;
			MusicManager.isPlaying = true;
			MusicManager.audio.play().catch(e => {
				console.log("Menu music waiting for user gesture:", e);
			});
		}
	}

	static playMapMusic(forceSwitch = false) {
		MusicManager.init();
		const wasMapMode = (MusicManager.currentMode === 'map');
		MusicManager.isMenuMode = false;
		MusicManager.currentMode = 'map';
		if (typeof Settings !== "undefined" && !Settings.music.isEnabled()) return;

		if (MusicManager.audio) {
			const currentSrc = decodeURIComponent(MusicManager.audio.src || '');
			const isAlreadyPlayingMap = !forceSwitch && wasMapMode && MusicManager.MAP_TRACKS.some(t => currentSrc.endsWith(t)) && !MusicManager.audio.paused;
			if (isAlreadyPlayingMap) {
				MusicManager.isPlaying = true;
				MusicManager.audio.loop = false;
				return;
			}
			MusicManager.isPlaying = true;
			MusicManager.nextMapTrack(currentSrc);
		}
	}

	static nextMapTrack(avoidSrc = '') {
		const currentSrc = avoidSrc || (MusicManager.audio ? decodeURIComponent(MusicManager.audio.src || '') : '');
		if (MusicManager.MAP_TRACKS.length > 1) {
			let nextIdx;
			let safety = 0;
			do {
				nextIdx = Math.floor(Math.random() * MusicManager.MAP_TRACKS.length);
				safety++;
			} while (
				safety < 25 &&
				(nextIdx === MusicManager.mapTrackIndex || (currentSrc && currentSrc.endsWith(MusicManager.MAP_TRACKS[nextIdx])))
			);
			MusicManager.mapTrackIndex = nextIdx;
		} else {
			MusicManager.mapTrackIndex = 0;
		}

		if (MusicManager.audio) {
			MusicManager.audio.src = MusicManager.MAP_TRACKS[MusicManager.mapTrackIndex];
			MusicManager.audio.volume = MusicManager.volume;
			MusicManager.audio.loop = false;
			MusicManager.isPlaying = true;
			MusicManager.audio.play().catch(e => console.log("Map music play error:", e));
		}
	}

	static playDuelMusic(forceSwitch = false) {
		MusicManager.init();
		const wasDuelMode = (MusicManager.currentMode === 'duel');
		MusicManager.isMenuMode = false;
		MusicManager.currentMode = 'duel';
		if (typeof Settings !== "undefined" && !Settings.music.isEnabled()) return;

		if (MusicManager.audio) {
			MusicManager.isPlaying = true;
			MusicManager.audio.loop = (MusicManager.selectedMode !== "all");
			const currentSrc = decodeURIComponent(MusicManager.audio.src || '');

			if (MusicManager.selectedMode === "all") {
				const isAlreadyPlayingDuel = !forceSwitch && wasDuelMode && MusicManager.tracks.some(t => currentSrc.endsWith(t)) && !MusicManager.audio.paused;
				if (isAlreadyPlayingDuel) {
					return;
				}
				MusicManager.nextTrack(currentSrc);
			} else {
				const idx = parseInt(MusicManager.selectedMode, 10) || 0;
				const safeIdx = Math.max(0, Math.min(MusicManager.tracks.length - 1, idx));
				MusicManager.currTrackIndex = safeIdx;
				const targetTrack = MusicManager.tracks[safeIdx];
				if (!forceSwitch && wasDuelMode && currentSrc.endsWith(targetTrack) && !MusicManager.audio.paused) {
					return;
				}
				MusicManager.audio.src = targetTrack;
				MusicManager.audio.volume = MusicManager.volume;
				MusicManager.audio.loop = true;
				MusicManager.audio.play().catch(e => console.log("Duel music play error:", e));
			}
		}
	}

	static playGameMusic(forceSwitch = false) {
		MusicManager.playDuelMusic(forceSwitch);
	}

	static setTrack(trackId) {
		MusicManager.init();
		MusicManager.selectedMode = trackId;
		if (trackId === "all") {
			if (MusicManager.currentMode === 'duel') {
				if (MusicManager.audio) MusicManager.audio.loop = false;
				if (MusicManager.audio && MusicManager.audio.paused && MusicManager.isPlaying) {
					MusicManager.nextTrack();
				}
			}
		} else {
			const idx = parseInt(trackId, 10) || 0;
			const safeIdx = Math.max(0, Math.min(MusicManager.tracks.length - 1, idx));
			MusicManager.currTrackIndex = safeIdx;
			if (MusicManager.currentMode === 'duel' && MusicManager.audio) {
				MusicManager.audio.src = MusicManager.tracks[safeIdx];
				MusicManager.audio.loop = true;
				MusicManager.audio.volume = MusicManager.volume;
				if (MusicManager.isPlaying && (typeof Settings === "undefined" || Settings.music.isEnabled())) {
					MusicManager.audio.play().catch(e => console.log(e));
				}
			}
		}
	}

	static nextTrack(avoidSrc = '') {
		const currentSrc = avoidSrc || (MusicManager.audio ? decodeURIComponent(MusicManager.audio.src || '') : '');
		if (MusicManager.selectedMode === "all") {
			// Shuffle inteligente garantindo troca real de faixa ao iniciar a partida
			let nextIdx;
			if (MusicManager.tracks.length > 1) {
				let safety = 0;
				do {
					nextIdx = Math.floor(Math.random() * MusicManager.tracks.length);
					safety++;
				} while (
					safety < 30 &&
					(nextIdx === MusicManager.currTrackIndex || (currentSrc && currentSrc.endsWith(MusicManager.tracks[nextIdx])))
				);
			} else {
				nextIdx = 0;
			}
			MusicManager.currTrackIndex = nextIdx;
		} else {
			MusicManager.currTrackIndex = (MusicManager.currTrackIndex + 1) % MusicManager.tracks.length;
		}

		if (MusicManager.audio) {
			MusicManager.audio.src = MusicManager.tracks[MusicManager.currTrackIndex];
			MusicManager.audio.volume = MusicManager.volume;
			MusicManager.audio.loop = (MusicManager.selectedMode !== "all");
			if (MusicManager.isPlaying && (typeof Settings === "undefined" || Settings.music.isEnabled())) {
				MusicManager.audio.play().catch(e => console.log("Duel nextTrack error:", e));
			}
		}
	}

	static play() {
		const isMapScreenVisible = (document.getElementById("story-map-screen") && !document.getElementById("story-map-screen").classList.contains("hide")) ||
			(typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign);
		const isBoardVisible = document.querySelector("main") && !document.querySelector("main").classList.contains("hide");
		if (isMapScreenVisible) {
			MusicManager.playMapMusic();
		} else if (isBoardVisible && typeof game !== "undefined" && (game.state === GameState.PLAYING || game.state === GameState.END_SCREEN)) {
			MusicManager.playDuelMusic(false);
		} else {
			MusicManager.playMenuMusic();
		}
	}

	static pause() {
		MusicManager.isPlaying = false;
		if (MusicManager.audio) {
			MusicManager.audio.pause();
		}
	}

	static toggle() {
		MusicManager.init();
		if (MusicManager.isPlaying && !MusicManager.audio.paused) {
			MusicManager.pause();
			return false;
		} else {
			MusicManager.play();
			return true;
		}
	}
}

class UI {
	constructor() {
		this.carousels = [];
		this.notif_elem = document.getElementById("notification-bar");
		const exitBtn = document.getElementById('exit-game');
		if (exitBtn) {
			const onExit = (e) => {
				if (e) { e.preventDefault(); e.stopPropagation(); }
				if (typeof game !== "undefined" && game.exitGame) game.exitGame();
			};
			exitBtn.addEventListener('click', onExit, false);
			exitBtn.addEventListener('touchend', onExit, { passive: false });
		}
		const forfeitBtn = document.getElementById("forfeit-button");
		if (forfeitBtn) {
			const onForfeit = (e) => {
				if (e) { e.preventDefault(); e.stopPropagation(); }
				if (typeof game !== "undefined" && game.promptForfeit) {
					game.promptForfeit();
				} else if (typeof VersusMode !== "undefined" && VersusMode.promptForfeit) {
					VersusMode.promptForfeit();
				} else if (typeof game !== "undefined" && game.exitGame) {
					game.exitGame();
				}
			};
			forfeitBtn.addEventListener('click', onForfeit, false);
			forfeitBtn.addEventListener('touchend', onForfeit, { passive: false });
		}
		this.preview = document.getElementsByClassName("card-preview")[0];
		this.previewCard = null;
		this.lastRow = null;
		this.toggleSettings = [];
		document.getElementById("pass-button").addEventListener("click", () => {
			if (typeof triggerHaptic === "function") triggerHaptic("medium");
			player_me.passRound();
			AudioManager.playSFX('pass');
		}, false);
		document.getElementById("click-background").addEventListener("click", () => ui.cancel(), false);
		this.youtube;
		this.ytActive;
		this.openSettings_elem = document.getElementById("open-game-settings");
		if (this.openSettings_elem) {
			this.toggleSettings.push(this.openSettings_elem);
		}
		this.toggleMusic_elem = document.getElementById("toggle-music");
		if (this.toggleMusic_elem) {
			this.toggleSettings.push(this.toggleMusic_elem);
			this.toggleMusic_elem.classList.add("fade");
			this.toggleMusic_elem.addEventListener("click", () => this.toggleMusic(), false);
		}
		this.toggleNotifications_elem = document.getElementById("toggle-notifications");
		if (this.toggleNotifications_elem) {
			this.toggleSettings.push(this.toggleNotifications_elem);
			this.toggleNotifications_elem.addEventListener("click", () => this.toggleNotifications(), false);
			if (!Settings.notifications.isEnabled())
				this.toggleNotifications_elem.classList.add("fade");
		}
		this.toggleSFX_elem = document.getElementById("toggle-sfx");
		if (this.toggleSFX_elem) {
			this.toggleSettings.push(this.toggleSFX_elem);
			this.toggleSFX_elem.addEventListener('click', () => this.toggleSFX());
			if (!Settings.soundEffects.isEnabled())
				this.toggleSFX_elem.classList.add("fade");
		}

		EventManager.gameOpened.bind(()=>this.toggleSettings.forEach(e=>e && e.classList.remove('deck-menu')));
		EventManager.customizationOpened.bind(()=>this.toggleSettings.forEach(e=>e && e.classList.add('deck-menu')));

		[	'.settings-button',
			'.deck-options',
			'#pass-button',
			'#forfeit-button',
			'#end-screen>button',
			'#op-preview-leader',
			'#opponent-preview button'
		].forEach(addMouseEnterSFXBySelector);
	}
	
	// Enables or disables client interration
	enablePlayer(enable){
		let main = document.getElementsByTagName("main")[0].classList;
		if (enable) {
			main.remove("noclick");
			if (player_me && player_me.hand && player_me.hand.cards) {
				player_me.hand.cards.forEach( c => {
					if (c && c.elem) c.elem.classList.remove("noclick");
				});
			}
			const passBtn = document.getElementById("pass-button");
			if (passBtn && player_me && !player_me.passed) {
				passBtn.classList.remove("noclick");
			}
		} else {
			main.add("noclick");
			const passBtn = document.getElementById("pass-button");
			if (passBtn) passBtn.classList.add("noclick");
		}
	}
	
	// Initializes the offline background music object
	initYouTube(){
		MusicManager.init();
		this.ytActive = true;
		
		const enabled = Settings.music.isEnabled();
		if (enabled) {
			if (this.toggleMusic_elem) this.toggleMusic_elem.classList.remove("fade");
			MusicManager.play();
			document.addEventListener('click', () => {
				if (Settings.music.isEnabled() && (!MusicManager.audio || MusicManager.audio.paused)) {
					MusicManager.play();
				}
			}, { once: true });
		} else {
			if (this.toggleMusic_elem) this.toggleMusic_elem.classList.add("fade");
		}
	}
	
	// Called when client toggles the music
	toggleMusic(){
		const playing = MusicManager.toggle();
		if (playing) {
			if (this.toggleMusic_elem) this.toggleMusic_elem.classList.remove("fade");
		} else {
			if (this.toggleMusic_elem) this.toggleMusic_elem.classList.add("fade");
		}
		Settings.music.setEnabled(playing);
	}

	toggleNotifications() {
		Settings.notifications.toggle();
		const useNotificaitons = Settings.notifications.isEnabled();
		if (useNotificaitons)
		{
			if (this.toggleNotifications_elem) this.toggleNotifications_elem.classList.remove("fade");
		}
		else
		{
			if (this.toggleNotifications_elem) this.toggleNotifications_elem.classList.add("fade");
		}
	}

	toggleSFX() {
		Settings.soundEffects.toggle();
		const useSFX = Settings.soundEffects.isEnabled();
		if (useSFX)
		{
			if (this.toggleSFX_elem) this.toggleSFX_elem.classList.remove("fade");
		}
		else
		{
			if (this.toggleSFX_elem) this.toggleSFX_elem.classList.add("fade");
		}
	}
	
	// Enables or disables backgorund music 
	setYouTubeEnabled(enable){
		if (enable) {
			if (Settings.music.isEnabled()) MusicManager.play();
		} else {
			MusicManager.pause();
		}
		this.ytActive = enable;
	}
	
	// Called when the player selects a selectable card
	async selectCard(card) {
		if (typeof game === "undefined" || game.state !== GameState.PLAYING)
			return;
		if (game.currPlayer !== player_me || game.placedEffectsActive || game.isActionInProgress || game.isTurnTransitioning || game.isCardBeingPlayed)
			return;
		if (!player_me || player_me.passed || player_me.turnPlayed || player_me.isPlayingCard)
			return;

		let row = board.row.find(r => r && r.cards && r.cards.includes(card)) || this.lastRow;
		let pCard = this.previewCard;
		if (card === pCard)
			return;
		if (pCard === null || (card.holder && card.holder.hand && card.holder.hand.cards.includes(card))) {
			this.setSelectable(null, false);
			this.showPreview(card);
		} else if (pCard.name === "Decoy") {
			if (!row || !card.isUnit()) return;
			game.isActionInProgress = true;
			game.isCardBeingPlayed = true;
			player_me.isPlayingCard = true;
			if (typeof VersusMode !== "undefined") {
				VersusMode.stopTurnTimer();
				VersusMode.isActionExecuting = true;
				VersusMode.actionStartTime = Date.now();
			}
			this.hidePreview(card);
			this.enablePlayer(false);
			try {
				if (pCard.holder === player_me && typeof Achievements !== "undefined") {
					Achievements.recordDecoy();
				}
				if (pCard.holder === player_me && typeof VersusMode !== "undefined" && VersusMode.isActive) {
					const rowType = (typeof VersusMode.getRowTypeFromRow === "function") ? VersusMode.getRowTypeFromRow(row) : "close";
					VersusMode.onLocalCardPlayed(pCard, {
						decoyTargetName: card.name,
						rowType: rowType
					});
				}
				await Promise.all([
					board.toHand(card, row),
					board.moveTo(pCard, row, pCard.holder.hand)
				]);
				pCard.holder.endTurn();
			} finally {
				game.isCardBeingPlayed = false;
				if (player_me) player_me.isPlayingCard = false;
				if (!game.isTurnTransitioning) {
					game.isActionInProgress = false;
				}
				if (typeof VersusMode !== "undefined") {
					VersusMode.isActionExecuting = false;
					if (VersusMode.pendingTurnSync) {
						const sync = VersusMode.pendingTurnSync;
						VersusMode.pendingTurnSync = null;
						VersusMode.onTurnSyncReceived(sync);
					}
				}
			}
		}
	}
	
	// Called when the player selects a selectable CardContainer
	async selectRow(row){
		EventManager.rowSelected.dispatch(row, player_me);
		if (game.placedEffectsActive || game.isActionInProgress || game.isTurnTransitioning || game.isCardBeingPlayed)
		{
			return;
		}
		this.lastRow = row;
		if (this.previewCard === null) {
			await ui.viewCardsInContainer(row);
			return;
		}
		if (game.state !== GameState.PLAYING || game.currPlayer !== player_me || !player_me || player_me.passed || player_me.turnPlayed || player_me.isPlayingCard) {
			return;
		}
		if (this.previewCard.name === "Decoy")
			return;
		const isRowValid = (row.elem && row.elem.classList.contains("row-selectable")) ||
		                   (row.elem_special && row.elem_special.classList.contains("row-selectable"));
		if (!isRowValid)
			return;

		// BLOQUEIO ATÔMICO IMEDIATO: O jogador confirmou a jogada da carta na fileira!
		game.isActionInProgress = true;
		game.isCardBeingPlayed = true;
		player_me.isPlayingCard = true;
		if (typeof VersusMode !== "undefined") {
			VersusMode.stopTurnTimer();
			VersusMode.isActionExecuting = true;
			VersusMode.actionStartTime = Date.now();
		}
		ui.enablePlayer(false);

		let card = this.previewCard;
		let holder = card.holder;
		this.hidePreview();

		try {
			if (card.name === "Scorch"){
				this.hidePreview();
				if (typeof triggerHaptic === "function") triggerHaptic("heavy");
				await ability_dict["scorch"].activated(card);
			} else if (card.name === "Decoy") {
				return;
			} else {
				if (typeof triggerHaptic === "function") triggerHaptic("medium");
				await board.moveTo(card, row, card.holder.hand);
				if (holder === player_me && typeof Achievements !== "undefined") {
					if (card.abilities && card.abilities.includes("spy")) {
						Achievements.recordSpyPlayed();
					}
					if (card.name === "Roach" || card.muster === "Roach") {
						Achievements.recordRoach();
					}
				}
			}
			if (holder === player_me && typeof VersusMode !== "undefined" && VersusMode.isActive) {
				const rowType = (card.name === "Scorch") ? "scorch" : (card.row === "weather" ? "weather" : ((typeof VersusMode.getRowTypeFromRow === "function") ? VersusMode.getRowTypeFromRow(row) : card.row));
				VersusMode.onLocalCardPlayed(card, {
					rowType: rowType,
					medicTargetName: VersusMode.pendingMedicTarget || null,
					medicTargets: VersusMode.pendingMedicTargets || []
				});
				VersusMode.pendingMedicTarget = null;
				VersusMode.pendingMedicTargets = [];
			}
			holder.endTurn();
		} finally {
			game.isCardBeingPlayed = false;
			if (player_me) player_me.isPlayingCard = false;
			if (!game.isTurnTransitioning) {
				game.isActionInProgress = false;
			}
			if (typeof VersusMode !== "undefined") {
				VersusMode.isActionExecuting = false;
				if (VersusMode.pendingTurnSync) {
					const sync = VersusMode.pendingTurnSync;
					VersusMode.pendingTurnSync = null;
					VersusMode.onTurnSyncReceived(sync);
				}
			}
		}
	}
	
	// Called when the client cancels out of a card-preview
	cancel(){
		this.hidePreview();
		EventManager.previewCancelled.dispatch();
	}
	
	// Displays a card preview then enables and highlights potential card destinations
	showPreview(card, allowClose = true) {
		this.showPreviewVisuals(card);
		this.setSelectable(card, true);
		AudioManager.playSFX('open');
		if (allowClose)
		{
			document.getElementById("click-background").classList.remove("noclick");
		}
		else
		{
			document.getElementById('leader-me').classList.add("noclick");
			document.getElementById('pass-button').classList.add("noclick");
			player_me.hand.cards.forEach( c => c.elem.classList.add("noclick") );
		}
	}
	
	// Sets up the graphics and description for a card preview
	showPreviewVisuals(card){
		this.previewCard = card;
		this.preview.classList.remove("hide");
		this.preview.getElementsByClassName("card-lg")[0].style.backgroundImage = largeURL(card.faction+"_"+card.filename);
		let desc_elem = this.preview.getElementsByClassName("card-description")[0];
		this.setDescription(card, desc_elem);
	}
	
	// Hides the card preview then disables and removes highlighting from card destinations
	hidePreview(){
		document.getElementById("click-background").classList.add("noclick");
		player_me.hand.cards.forEach( c => c.elem.classList.remove("noclick") );
		document.getElementById('leader-me').classList.remove("noclick");
		document.getElementById('pass-button').classList.remove("noclick");
		
		this.preview.classList.add("hide");
		this.setSelectable(null, false);
		this.previewCard = null;
		this.lastRow = null;
	}
	
	// Sets up description window for a card
	setDescription(card, desc){
		if (!card)
		{
			desc.children[1].innerHTML = "NULL";
			desc.children[2].innerHTML = "";
			return;
		}
		if (card.hero || card.row === "agile" || card.abilities.length > 0 || card.faction === "faction") {
			desc.classList.remove("hide");
			let str = card.row === "agile" ? "agile" : "";
			if (card.abilities.length)
				str = card.abilities[card.abilities.length-1];
			if (str === "cerys")
				str = "muster";
			if (str.startsWith("avenger"))
				str = "avenger";
			if (str === "scorch_c" || str == "scorch_r" || str === "scorch_s")
				str = "scorch";
			if (card.row === "leader" || card.faction === "faction" || card.abilities.length === 0 && card.row !== "agile")
				desc.children[0].style.backgroundImage = "";
			else
				desc.children[0].style.backgroundImage = iconURL("card_ability_" + str);
			desc.children[1].innerHTML = card.desc_name;
			desc.children[2].innerHTML = card.desc;
		} else {
			desc.classList.add("hide");
		}
	}
	
	// Displayed a timed notification to the client
	async notification(name, duration){
		if (!Settings.notifications.isEnabled())
			return;
		if (!duration)
			duration = 1200;
		const fadeSpeed = 150;
		duration = Math.max(400, duration - 2*fadeSpeed);
		const key = "notif_" + name.replace(/-/g, "_");
		const text = (typeof I18N !== "undefined") ? I18N.t(key) : "";
		this.notif_elem.children[0].id = "notif-" + name;
		if (text && text !== key) {
			this.notif_elem.children[0].setAttribute("data-text", text);
		} else {
			this.notif_elem.children[0].removeAttribute("data-text");
		}
		await fadeIn(this.notif_elem, fadeSpeed);
		await sleep(duration);
		await fadeOut(this.notif_elem, fadeSpeed);
	}
	
	// Displays a cancellable Carousel for a single card 
	async viewCard(card, action) {
		if (card === null)
			return;
		let container = new CardContainer();
		container.cards.push(card);
		await this.viewCardsInContainer(container, action);
	}
	
	// Displays a cancellable Carousel for all cards in a container
	async viewCardsInContainer(container, action) {
		action = action ? action : function() {return this.cancel();};
		await this.queueCarousel(container, 1, action, () => true, false, true);
	}
	
	// Displays a Carousel menu of filtered container items that match the predicate.
	// Suspends gameplay until the Carousel is closed. Automatically picks random card if activated for AI player
	async queueCarousel(container, count, action, predicate, bSort, bQuit, title){
		if (game.currPlayer === player_op) {
			if (player_op.controller instanceof ControllerAI) {
				for (let i=0; i<count; ++i){
					let cards = container.cards.reduce((a,c,i) => !predicate || predicate(c) ? a.concat([i]) : a, []);
					if (cards.length === 0)
						break;
					await action(container, cards[randomInt(cards.length)]);
				}
			} else if (typeof ControllerPeer !== "undefined" && player_op.controller instanceof ControllerPeer) {
				const peerCtrl = player_op.controller;
				for (let i=0; i<count; ++i){
					let targetIdx = -1;
					if (peerCtrl.nextMedicTarget) {
						targetIdx = container.cards.findIndex(c => c.name === peerCtrl.nextMedicTarget);
						peerCtrl.nextMedicTarget = null;
					}
					if (targetIdx === -1) {
						const valid = container.cards.reduce((a,c,i) => !predicate || predicate(c) ? a.concat([i]) : a, []);
						if (valid.length > 0) targetIdx = valid[0];
					}
					if (targetIdx !== -1) {
						await action(container, targetIdx);
					}
				}
			}
			return;
		}
		let carousel = new Carousel(container, count, action, predicate, bSort, bQuit, title);
		if (Carousel.curr === undefined || Carousel.curr === null)
			carousel.start();
		else {
			this.carousels.push(carousel);
			return;
		}
		await sleepUntil( () => this.carousels.length === 0 && !Carousel.curr, 100);
	}
	
	// Starts the next queued Carousel
	quitCarousel(){
		if (this.carousels.length > 0) {
			this.carousels.shift().start();
		}
	}
	
	// Displays a custom confirmation menu 
	async popup(yesName, yes, noName, no, title, description, alpha = .95) {
		let p = new Popup(yesName, yes, noName, no, title, description, alpha);
		await sleepUntil( () => !Popup.curr) 
	}
	
	// Enables or disables selection and highlighting of rows specific to the card
	setSelectable(card, enable){
		if(!enable) {
			for (let row of board.row){
				row.elem.classList.remove("row-selectable");
				row.elem.classList.remove("noclick");
				row.elem_special.classList.remove("row-selectable");
				row.elem_special.classList.remove("noclick");
				row.elem.classList.add("card-selectable");
				
				for (let card of row.cards) {
					card.elem.classList.add("noclick");
				}
			}
			weather.elem.classList.remove("row-selectable");
			weather.elem.classList.remove("noclick");
			return;
		}
		if (card.faction === "weather") {
			for (let row of board.row){
				row.elem.classList.add("noclick");
				row.elem_special.classList.add("noclick");
			}
			weather.elem.classList.add("row-selectable");
			return;
		}
		
		weather.elem.classList.add("noclick");
		
		if (card.name === "Scorch") {
			for (let r of board.row){
				r.elem.classList.add("row-selectable");
				r.elem_special.classList.add("row-selectable");
			}
			return;
		}
		if (card.isSpecial()){
			for (let i=0; i<6; i++){
				let r = board.row[i];
				if (i < 3 || r.special !== null){
					r.elem.classList.add("noclick");
					r.elem_special.classList.add("noclick");
				} else {
					r.elem_special.classList.add("row-selectable");
				}
			}
			return;
		}
		
		board.row.forEach( r => r.elem_special.classList.add("noclick") );
		
		if (card.name === "Decoy"){
			for (let i=0; i<6; ++i) {
				let r = board.row[i];
				let units = r.cards.filter(c => c.isUnit());
				if (i < 3 || units.length === 0) {
					r.elem.classList.add("noclick");
					r.elem_special.classList.add("noclick");
					r.elem.classList.remove("card-selectable");
				} else {
					r.elem.classList.add("row-selectable");
					units.forEach( c => c.elem.classList.remove("noclick") );
				}
			}
			return;
		}
		
		let currRows = card.row === "agile" ? [board.getRow(card, "close", card.holder), board.getRow(card, "ranged", card.holder)] : [board.getRow(card, card.row, card.holder)];
		for (let i=0; i<6; i++){
			let row = board.row[i];
			if (currRows.includes(row)) {
				row.elem.classList.add("row-selectable");
			} else {
				row.elem.classList.add("noclick");
			}
		}
	}

	// used to handle row selection when resetoring agile units via medics
	async waitForRowSelection(card)
	{
		if (game.isAutoPlayingTimeout) {
			return board.getRow(card, "close", card ? card.holder : player_me);
		}
		game.placedEffectsActive = true;
		ui.setSelectable(null, false);
		ui.showPreview(card, false);
		ui.enablePlayer(true);
		let selectedRow = null;
		let bRowSelected = false;
		const rowSelect = event => {
			const {row, player} = event.detail;
			bRowSelected = true;
			selectedRow = row;
		};
		EventManager.rowSelected.bind(rowSelect);
		EventManager.previewCancelled.bind(rowSelect);
		await sleepUntil(() => bRowSelected === true || game.isAutoPlayingTimeout);
		EventManager.rowSelected.unbind(rowSelect);
		EventManager.previewCancelled.unbind(rowSelect);
		ui.hidePreview();
		game.placedEffectsActive = false;
		if (!selectedRow && game.isAutoPlayingTimeout) {
			selectedRow = board.getRow(card, "close", card ? card.holder : player_me);
		}
		return selectedRow;
	}
}

// Displays up to 5 cards for the client to cycle through and select to perform an action
// Clicking the middle card performs the action on that card "count" times
// Clicking adejacent cards shifts the menu to focus on that card
class Carousel {
	constructor(container, count, action, predicate, bSort, bExit = false, title) {
		if (count <= 0 || !container || !action || container.cards.length === 0)
			return ;
		this.container = container;
		this.count = count;
		this.action = action ? action : () => this.cancel();
		this.predicate = predicate;
		this.bSort = bSort;
		this.indices = [];
		this.index = 0;
		this.bExit = bExit;
		this.title = title;
		this.cancelled = false;
		
		if (!Carousel.elem) {
			Carousel.elem = document.getElementById("carousel");
			Carousel.elem.children[0].addEventListener("click", () => Carousel.curr.cancel(), false);
		}
		this.elem = Carousel.elem;
		document.getElementsByTagName("main")[0].classList.remove("noclick");
		
		this.elem.children[0].classList.remove("noclick");
		this.previews = this.elem.getElementsByClassName("card-lg");
		this.desc = this.elem.getElementsByClassName("card-description")[0];
		this.title_elem = this.elem.children[2];
		[...this.elem.children[0].children].forEach(e => e.addEventListener("mouseout", evt=>Carousel.curr?.nudge(0)));
		this.elem.children[0].style.setProperty('--carousel-trans-time', "0.25s");
	}
	
	// Initializes the current Carousel
	start(){
		if (!this.elem)
			return;
		this.indices = this.container.cards.reduce((a,c,i)=> (!this.predicate || this.predicate(c)) ? a.concat([i]) : a, []);
		if (this.indices.length <= 0)
			return this.exit();
		if (this.bSort)
			this.indices.sort( (a, b) => Card.compare(this.container.cards[a],this.container.cards[b]) );
		
		this.update();
		Carousel.setCurrent(this);
		
		if (this.title) {
			this.title_elem.innerHTML = this.title;
			this.title_elem.classList.remove("hide");
		} else {
			this.title_elem.classList.add("hide");
		}
		AudioManager.playSFX('open');
		this.elem.classList.remove("hide");
		ui.enablePlayer(true);
	}
	
	// Called by the client to cycle cards displayed by n
	shift(event, n){
		(event || window.event).stopPropagation();
		this.index = Math.max(0, Math.min(this.indices.length-1, this.index+n));
		AudioManager.playSFX('ui_card');
		this.update();
	}

	// called when mousing over/out of one of the carousel cards
	nudge(offset = 0)
	{
		const parentClasslist = this.elem.children[0].classList;
		parentClasslist.remove('left');
		parentClasslist.remove('right');
		const magnitude = (offset === 2) ? -1 * Math.sign(offset) : -0.6 * offset;
		this.elem.children[0].style.setProperty('--magnitude', magnitude);
		if (offset < 0)
		{
			parentClasslist.add('left');
		} else if (offset > 0)
		{
			parentClasslist.add('right')
		}
	}
	
	// Called by client to perform action on the middle card in focus
	async select(event) {
		(event || window.event).stopPropagation();
		--this.count;
		if (this.isLastSelection())
			this.elem.classList.add("hide");
		if (this.count <= 0)
			ui.enablePlayer(false);
		await this.action(this.container, this.indices[this.index]);
		if (this.isLastSelection() && !this.cancelled)
			return this.exit();
		this.update();
	}
	
	// Called by client to exit out of the current Carousel if allowed. Enables player interraction.
	cancel(){
		if (this.bExit){
			this.cancelled = true;
			AudioManager.playSFX('discard');
			this.exit();
		}
		ui.enablePlayer(true);
	}
	
	// Returns true if there are no more cards to view or select
	isLastSelection(){
		return this.count <= 0 || this.indices.length === 0;
	}
	
	// Updates the visuals of the current selection of cards
	update(){
		this.indices = this.container.cards.reduce((a,c,i)=> (!this.predicate || this.predicate(c)) ? a.concat([i]) : a, []);
		if (this.indices.length <= 0)
		{
			return this.exit();
		}
		if (this.index >= this.indices.length)
			this.index =  this.indices.length-1;
		for (let i=0; i<this.previews.length; i++) {
			let curr = this.index - 2 + i;
			if (curr >= 0 && curr < this.indices.length) {
				let card = this.container.cards[this.indices[curr]];
				this.previews[i].style.backgroundImage = largeURL(card.faction + "_" + card.filename);
				this.previews[i].classList.remove("hide");
				this.previews[i].classList.remove("noclick");
			} else {
				this.previews[i].style.backgroundImage = "";
				this.previews[i].classList.add("hide");
				this.previews[i].classList.add("noclick");
			}
		}
		ui.setDescription(this.container.cards[this.indices[this.index]], this.desc);
	}
	
	// Clears and quits the current carousel
	exit() {
		for (let x of this.previews)
			x.style.backgroundImage = "";
		this.elem.classList.add("hide");
		Carousel.clearCurrent();
		ui.quitCarousel();
	}
	
	// Statically sets the current carousel
	static setCurrent(curr) {
		this.curr = curr;
	}
	
	// Statically clears the current carousel
	static clearCurrent() {
		this.curr = null;
	}
}

// Custom confirmation windows
class Popup {
	constructor(yesName, yes, noName, no, header, description, alpha = .95){
		this.yes = yes ? yes : ()=>{};
		this.no = no ? no : ()=>{};
		
		this.elem = document.getElementById("popup");
		let main = this.elem.children[0];
		main.children[0].innerHTML = header ? header : "";
		main.children[1].innerHTML = description ? description : "";
		main.children[2].children[0].innerHTML = (yesName) ? yesName : "Yes";
		main.children[2].children[1].innerHTML = (noName) ? noName : "No";

		const bgColor = new RGBA(10, 10, 10, alpha);
		this.elem.style.backgroundColor = bgColor.toString();
		
		this.elem.classList.remove("hide");
		Popup.setCurrent(this);
		ui.enablePlayer(true);
	}
	
	// Sets this as the current popup window
	static setCurrent(curr){ this.curr = curr; }
	
	// Unsets this as the current popup window
	static clearCurrent()  { this.curr = null; }
	
	// Called when client selects the positive aciton
	selectYes() {
		this.clear()
		this.yes();
		return true;
	}
	
	// Called when client selects the negative option
	selectNo() {
		this.clear();
		this.no();
		return false;
	}
	
	// Clears the popup and diables player interraction
	clear() {
		ui.enablePlayer(false);
		this.elem.classList.add("hide");
		Popup.clearCurrent();
	}
	
}

// Screen used to customize, import and export deck contents
class DeckMaker {
	constructor() {
		this.elem = document.getElementById("deck-customization");
		this.bank_elem = document.getElementById("card-bank");
		this.deck_elem = document.getElementById("card-deck");
		this.leader_elem = document.getElementById("card-leader");
		const leaderThumb = document.getElementById("card-leader-thumb");
		if (leaderThumb) {
			leaderThumb.addEventListener("click", (e) => {
				e.stopPropagation();
				this.cycleLeader(1);
			}, false);
			leaderThumb.addEventListener('mouseenter', CLICK_EVENT_SFX);
		}
		if (this.leader_elem) {
			this.leader_elem.addEventListener("click", (e) => {
				if (e.target && (e.target.id === "btn-leader-prev" || e.target.id === "btn-leader-next")) return;
				this.cycleLeader(1);
			}, false);
			this.leader_elem.addEventListener('mouseenter', CLICK_EVENT_SFX);
		}
		const prevLBtn = document.getElementById("btn-leader-prev");
		if (prevLBtn) {
			prevLBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.cycleLeader(-1);
			}, false);
		}
		const nextLBtn = document.getElementById("btn-leader-next");
		if (nextLBtn) {
			nextLBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.cycleLeader(1);
			}, false);
		}

		this.bankFilter = "all";
		this.deckFilter = "all";
		this.initFilterTabs();

		this.selectedOpponentFaction = localStorage.getItem("gc-opponent-faction") || "random";
		this.opponentData = Settings.opponentDeckCustom.get();
		this.updatedCustomOpponent();

		const opCardBtn = document.getElementById("op-preview-card");
		if (opCardBtn) {
			opCardBtn.addEventListener("click", () => this.openOpponentModal(), false);
			opCardBtn.addEventListener("mouseenter", CLICK_EVENT_SFX, false);
		}

		document.getElementById('op-preview-clear').addEventListener('click', () => this.clearOpponentDeck());
		document.getElementById('op-preview-open').addEventListener('click', () => this.viewOponentCards());
		document.getElementById("add-opponent").addEventListener("change", () => this.uploadOpponentDeck(), false);

		this.change_elem = document.getElementById("change-faction");
		this.change_elem.addEventListener("click", () => this.selectFaction(), false);
		
		document.getElementById("download-deck").addEventListener("click", () => this.downloadDeck(), false);
		document.getElementById("add-file").addEventListener("change", () => this.uploadPlayerDeck(), false);
		document.getElementById("start-game").addEventListener("click", () => this.startNewGame(), false);
		document.getElementById("start-game").addEventListener("mouseenter", CLICK_EVENT_SFX, false);

		const backMenuBtn = document.getElementById("btn-back-to-menu");
		if (backMenuBtn) {
			backMenuBtn.addEventListener("click", () => {
				if (typeof MenuController !== "undefined") MenuController.returnToMainMenu();
			});
		}

		window.dm = this;
		DeckMaker.openOpponentModal = () => this.openOpponentModal();
		DeckMaker.closeOpponentModal = () => this.closeOpponentModal();
		DeckMaker.setOpponentFaction = (f) => this.setOpponentFaction(f);

		this.loadFactionDeck(Settings.lastFaction.get(), true);
	}

	initFilterTabs() {
		const setupTabs = (containerId, onSelect) => {
			const container = document.getElementById(containerId);
			if (!container) return;
			const tabs = container.querySelectorAll(".deck-filter-btn");
			tabs.forEach(btn => {
				btn.addEventListener("click", () => {
					tabs.forEach(t => t.classList.remove("active"));
					btn.classList.add("active");
					const filter = btn.dataset.filter || "all";
					onSelect(filter);
					if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
						AudioManager.playSFX("witcher_switch");
					}
					this.update();
				});
				btn.addEventListener("mouseenter", () => {
					if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
						AudioManager.playSFX("witcher_hover");
					}
				});
			});
		};

		setupTabs("bank-filter-tabs", f => { this.bankFilter = f; });
		setupTabs("deck-filter-tabs", f => { this.deckFilter = f; });
	}

	updateFilter(filter = "all") {
		this.bankFilter = filter || "all";
		this.deckFilter = filter || "all";
		["bank-filter-tabs", "deck-filter-tabs"].forEach(containerId => {
			const container = document.getElementById(containerId);
			if (!container) return;
			container.querySelectorAll(".deck-filter-btn").forEach(btn => {
				if ((btn.dataset && btn.dataset.filter) === this.bankFilter) {
					btn.classList.add("active");
				} else {
					btn.classList.remove("active");
				}
			});
		});
		this.update();
	}

	makeVisible() {
		if (this.elem) {
			this.elem.classList.remove("hide");
		}
	}

	matchesFilter(card, filter) {
		if (!filter || filter === "all") return true;
		if (filter === "close") {
			return card.row === "close" || card.row === "agile";
		}
		if (filter === "ranged") {
			return card.row === "ranged" || card.row === "agile";
		}
		if (filter === "siege") {
			return card.row === "siege";
		}
		if (filter === "special") {
			return card.deck === "special" || card.deck === "weather" || card.row === "" || !card.strength;
		}
		if (filter === "hero") {
			return card.ability && card.ability.split(" ").includes("hero");
		}
		return true;
	}

	openOpponentModal() {
		const modal = document.getElementById("opponent-modal");
		if (modal) {
			modal.classList.remove("hide");
			const current = this.selectedOpponentFaction || "random";
			modal.querySelectorAll(".opponent-option-card").forEach(card => {
				if (card.dataset.opponent === current) {
					card.classList.add("active");
				} else {
					card.classList.remove("active");
				}
			});
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_tab_open");
			}
		}
	}

	closeOpponentModal() {
		const modal = document.getElementById("opponent-modal");
		if (modal) {
			modal.classList.add("hide");
			if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
				AudioManager.playSFX("witcher_back");
			}
		}
	}

	setOpponentFaction(faction) {
		this.selectedOpponentFaction = faction;
		localStorage.setItem("gc-opponent-faction", faction);
		if (faction !== "custom") {
			Settings.opponentDeckCustom.clear();
			this.opponentData = null;
		}
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}
		this.updatedCustomOpponent();
		this.closeOpponentModal();
	}

	loadFactionDeck(faction, force = false)
	{
		if (!this.isValidFaction(faction))
			return;
		if (!this.setFaction(faction, true))
			return;
		const faction_deck = Settings.getFactionSettings(this.faction).get();
		this.setLeader(faction_deck.leader);
		this.makeBank(this.faction, faction_deck.cards);
		this.update();
	}

	isValidFaction(factionName)
	{
		switch(factionName) 
		{
		case "realms": case "nilfgaard": case "monsters": case "scoiatael": case "skellige":
			return true;
		default:
			return false;
		}
	}
	
	// Called when client selects a deck faction. Clears previous cards and makes valid cards available.
	setFaction(faction_name, force){
		if (!faction_name)
			return;
		if (!force && this.faction === faction_name)
			return false;
		this.elem.getElementsByTagName("h1")[0].innerHTML = factions[faction_name].name;
		this.elem.getElementsByTagName("h1")[0].style.backgroundImage = iconURL("deck_shield_" + faction_name);
		document.getElementById("faction-description").innerHTML = factions[faction_name].description;
		
		this.leaders = 
			card_dict.map((c,i) => ({index: i, card:c}) )
			.filter(c => c.card.deck === faction_name && c.card.row === "leader");
		this.faction = faction_name;
		Settings.lastFaction.set(faction_name);
		const available = this.getAvailableLeaders();
		if (!this.leader || !available.some(l => l.index === this.leader.index)) {
			this.leader = available[0] || this.leaders[0];
		}
		this.updateLeaderDisplay();
		return true;
	}

	getAvailableLeaders() {
		if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign && StoryMode.save) {
			const owned = (this.leaders || []).filter(c => (StoryMode.save.collection[c.index] || 0) > 0);
			if (owned.length > 0) return owned;
		}
		return this.leaders || [];
	}

	updateLeaderDisplay() {
		if (!this.leader_elem) return;
		const available = this.getAvailableLeaders();
		if (!this.leader || !available.some(l => l.index === this.leader.index)) {
			this.leader = available[0] || (this.leaders && this.leaders[0]);
		}
		if (!this.leader || !this.leader.card) return;

		const card = this.leader.card;
		const bg = largeURL(card.deck + "_" + card.filename);

		// Atualiza a arte estritamente no elemento da carta do líder
		const thumbEl = document.getElementById("card-leader-thumb") || (this.leader_elem && this.leader_elem.querySelector(".leader-card-img"));
		if (thumbEl) {
			thumbEl.style.backgroundImage = bg;
		}

		// Atualiza o nome do líder
		const nameEl = document.getElementById("card-leader-name");
		if (nameEl) nameEl.textContent = card.name;

		// Atualiza o texto da habilidade do líder
		const descEl = document.getElementById("card-leader-ability-desc");
		if (descEl) {
			const abilityKey = card.ability;
			let desc = "";
			if (typeof I18N !== "undefined") {
				const i18nDesc = I18N.t("ability_" + abilityKey + "_desc");
				if (i18nDesc && i18nDesc !== ("ability_" + abilityKey + "_desc")) {
					desc = i18nDesc;
				}
			}
			if (!desc && typeof ability_dict !== "undefined" && ability_dict[abilityKey]) {
				desc = ability_dict[abilityKey].description;
			}
			descEl.textContent = desc || "Sem habilidade especial.";
		}

		// Atualiza o contador de líderes disponíveis e setas de navegação
		const curIdx = available.findIndex(l => l.index === this.leader.index);
		const indicatorEl = document.getElementById("leader-cycle-indicator");
		if (indicatorEl) {
			indicatorEl.textContent = (available.length > 1) ? `${curIdx + 1} / ${available.length}` : "1 / 1";
			indicatorEl.style.display = (available.length > 1) ? "inline-block" : "none";
		}
		const prevBtn = document.getElementById("btn-leader-prev");
		const nextBtn = document.getElementById("btn-leader-next");
		if (prevBtn) prevBtn.style.display = (available.length > 1) ? "flex" : "none";
		if (nextBtn) nextBtn.style.display = (available.length > 1) ? "flex" : "none";

		// Aplica foco visual ao card
		this.leader_elem.classList.add("leader-focused");
	}

	cycleLeader(delta = 1) {
		const available = this.getAvailableLeaders();
		if (available.length <= 1) {
			this.updateLeaderDisplay();
			return;
		}
		let curIdx = available.findIndex(l => l.index === this.leader.index);
		if (curIdx === -1) curIdx = 0;
		curIdx = (curIdx + delta + available.length) % available.length;
		this.leader = available[curIdx];

		if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign && StoryMode.save) {
			StoryMode.save.playerDeck.leader = this.leader.index;
			StoryMode.saveGame();
		} else {
			Settings.getFactionSettings(this.leader.card.deck).setLeader(this.leader);
		}

		this.updateLeaderDisplay();
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX('ui_card_bank');
		}
	}
	
	// Sets current leader and updates UI
	setLeader(index){
		const available = this.getAvailableLeaders();
		this.leader = available.find(l => l.index == index) || (this.leaders && this.leaders.find(l => l.index == index)) || available[0];
		if (this.leader) {
			if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign && StoryMode.save) {
				StoryMode.save.playerDeck.leader = this.leader.index;
			} else {
				Settings.getFactionSettings(this.leader.card.deck).setLeader(this.leader);
			}
		}
		this.updateLeaderDisplay();
	}
	
	// Constructs a bank of cards that can be used by the faction's deck.
	// If a deck is provided, will not add cards to bank that are already in the deck.
	makeBank(faction, deck) {
		if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
			StoryMode.buildCampaignBank(this);
			return;
		}
		this.clear();
		let cards = card_dict.map((c,i) => ({card:c, index:i})).filter(
		p => [faction, "neutral", "weather", "special"].includes(p.card.deck) && p.card.row !== "leader");
		
		cards.sort( function(id1, id2) {
			let a = card_dict[id1.index], b = card_dict[id2.index];
			let c1 = {name: a.name, basePower: -a.strength, faction: a.deck};
			let c2 = {name: b.name, basePower: -b.strength, faction: b.deck};
			return Card.compare(c1, c2);
		});
		
		
		let deckMap = {};
		if (deck){
			for (let i of Object.keys(deck)) deckMap[deck[i].index] = deck[i].count;
		}
		cards.forEach( p => {
			let count = deckMap[p.index] !== undefined ? Number(deckMap[p.index]) : 0;
			this.makePreview(p.index, Number.parseInt(p.card.count) - count, this.bank_elem, this.bank,);
			this.makePreview(p.index, count, this.deck_elem, this.deck);
		});
	}
	
	// Creates HTML elements for the card previews
	makePreview(index, num, container_elem, cards){
		let card_data = card_dict[index];
		
		let elem = document.createElement("div");
		elem.style.backgroundImage = largeURL(card_data.deck + "_" + card_data.filename);
		elem.classList.add("card-lg");
		let count = document.createElement("div");
		elem.appendChild(count);
		container_elem.appendChild(elem);
		
		let bankID = {index: index, count: num, elem: elem};
		let isBank = cards === this.bank;
		count.innerHTML = bankID.count;
		cards.push(bankID);
		let cardIndex = cards.length-1;
		elem.addEventListener("click", () => this.select(cardIndex, isBank), false);
		elem.addEventListener("mouseenter", CLICK_EVENT_SFX, false);
		return bankID;
	}
	
	// Updates the card preview elements when any changes are made to the deck
	update(){
		let bankTotal = 0;
		for (let x of this.bank) {
			bankTotal += x.count;
			let card_data = card_dict[x.index];
			let matches = this.matchesFilter(card_data, this.bankFilter || "all");
			if (x.count && matches)
				x.elem.classList.remove("hide");
			else
				x.elem.classList.add("hide");
		}
		let total = 0, units = 0, special = 0, strength = 0, hero = 0;
		for (let x of this.deck) {
			let card_data = card_dict[x.index];
			let matches = this.matchesFilter(card_data, this.deckFilter || "all");
			if (x.count && matches)
				x.elem.classList.remove("hide");
			else
				x.elem.classList.add("hide");

			if (x.count) {
				total += x.count;
				if (card_data.deck === "special" || card_data.deck === "weather") {
					special += x.count;
					continue;
				}
				units += x.count;
				strength += card_data.strength * x.count;
				if (card_data.ability && card_data.ability.split(" ").includes("hero"))
					hero += x.count;
			}
		}
		this.stats = {total: total, units: units, special: special, strength: strength, hero: hero};

		const bankBadge = document.getElementById("bank-card-counter");
		if (bankBadge) bankBadge.textContent = bankTotal;

		const deckBadge = document.getElementById("deck-card-counter");
		if (deckBadge) deckBadge.textContent = total;

		this.updateFauxCard(this.bank_elem);
		this.updateFauxCard(this.deck_elem);
		this.updateStats();
	}

	// updates an empty card element to ensure correct alignment when count%3 == 2
	updateFauxCard(container)
	{
		let fauxCard = container.getElementsByClassName('empty')[0];
		if (!fauxCard)
		{
			fauxCard = document.createElement('div');
			fauxCard.classList.add('card-lg');
			fauxCard.classList.add('empty');
		}
		else
		{
			container.removeChild(fauxCard);
		}
		if (container.querySelectorAll(".card-lg:not(.hide)").length % 3 === 2)
		{
			container.appendChild(fauxCard);
		}
	}
	
	// Updates and displays the statistics describing the cards currently in the deck
	updateStats(){
		let stats = document.getElementById("deck-stats");
		stats.children[1].innerHTML = this.stats.total;
		stats.children[3].innerHTML = this.stats.units +(this.stats.units < 15 ? "/15" : "");
		stats.children[5].innerHTML = this.stats.special + "/10";
		stats.children[7].innerHTML = this.stats.strength;
		stats.children[9].innerHTML = this.stats.hero;
		
		stats.children[3].style.color = this.stats.units < 15 ? "red" : "";
		stats.children[5].style.color = (this.stats.special > 10) ? "red" : "";
	}
	
	// Opens a Carousel to allow the client to select a leader for their deck
	selectLeader(){
		const available = this.getAvailableLeaders();
		if (available.length <= 1) {
			this.updateLeaderDisplay();
			return;
		}
		let container = new CardContainer();
		container.cards = available.map(c => {
			let card = new Card(c.card, player_me);
			card.data = c;
			return card;
		});
		
		let index = available.findIndex(l => l.index === this.leader?.index);
		if (index === -1) index = 0;
		ui.queueCarousel(container, 1, (c,i) => {
			let data = c.cards[i].data;
			this.leader = data;
			if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign && StoryMode.save) {
				StoryMode.save.playerDeck.leader = this.leader.index;
				StoryMode.saveGame();
			} else {
				Settings.getFactionSettings(this.leader.card.deck).setLeader(this.leader);
			}
			this.updateLeaderDisplay();
			AudioManager.playSFX('ui_card_bank');
		}, () => true, false, true);
		Carousel.curr.index = index;
		Carousel.curr.update();
	}
	
	// Opens a Carousel to allow the client to select a faction for their deck
	selectFaction() {
		let container = new CardContainer();
		container.cards = Object.keys(factions).map( f => {
			return {
				abilities: [f], 
				filename: f, 
				get desc_name() { return factions[f].name; }, 
				get desc() { return factions[f].description; }, 
				faction: "faction"
			};
		});
		let index = container.cards.reduce((a,c,i) => c.filename === this.faction ? i : a, 0);
		ui.queueCarousel(container, 1, (c,i) => {
			this.loadFactionDeck(c.cards[i].filename);
		}, () => true, false, true);
		Carousel.curr.index = index;
		Carousel.curr.update();
	}
	
	// Called when client selects s a preview card. Moves it from bank to deck or vice-versa then updates;
	select(index, isBank){
		if (isBank)
		{
			this.add(index, this.deck);
			this.remove(index, this.bank);
			AudioManager.playSFX('ui_card_bank');
		}
		else
		{
			this.add(index, this.bank);
			this.remove(index, this.deck);
			AudioManager.playSFX('discard');
		}
		Settings.getFactionSettings(this.faction).setCards(this.deck.filter(x => x.count > 0));
		this.update();
	}
	
	// Adds a card to container (Bank or deck)
	add(index, cards) {
		let id = cards[index];
		id.elem.children[0].innerHTML = ++id.count;
	}
	
	// Removes a card from container (bank or deck)
	remove(index, cards) {
		let id = cards[index];
		id.elem.children[0].innerHTML = --id.count;
	}
	
	// Removes all elements in the bank and deck
	clear(){
		while (this.bank_elem.firstChild)
			this.bank_elem.removeChild(this.bank_elem.firstChild);
		while (this.deck_elem.firstChild)
			this.deck_elem.removeChild(this.deck_elem.firstChild);
		this.bank = [];
		this.deck = [];
		this.stats = {};
	}
	
	// Verifies current deck, creates the players and their decks, then starts a new game
	startNewGame(){
		if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
			console.warn("Iniciar partida comum bloqueado no Modo Exploração.");
			return;
		}
		let warning = "";
		if (this.stats.units < 15)
			warning += ((typeof I18N !== "undefined") ? I18N.t("warn_min_units") : "Your deck must have at least 15 unit cards.") + "\n";
		if (this.stats.special > 10)
			warning += ((typeof I18N !== "undefined") ? I18N.t("warn_max_specials") : "Your deck must have no more than 10 special cards.") + "\n";
		if (warning != "")
		{
			AudioManager.playSFX("warning");
			if (typeof MenuController !== "undefined" && typeof MenuController.showAlert === "function") {
				MenuController.showAlert(warning.trim(), "BARALHO INCOMPLETO", "⚠️");
			} else {
				alert(warning);
			}
			return;
		}
		
		if (typeof game !== "undefined" && typeof game.reset === "function") {
			game.reset();
		}

		const me_deck = { 
			faction: this.faction,
			leader: card_dict[this.leader.index], 
			cards: this.deck.filter(x => x.count > 0)
		};
		const op_deck = this.constructOpponentDeck(true);
		
		player_me = new Player(0, (typeof I18N !== "undefined") ? I18N.t("player_name") : "Geralt", me_deck);
		player_op = new Player(1, (typeof I18N !== "undefined") ? I18N.t("opponent_name") : "Opponent", op_deck);
		
		this.elem.classList.add("hide");
		const mainEl = document.querySelector("main");
		if (mainEl) mainEl.classList.remove("hide");
		game.startGame();
	}

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
	
	// Converts the current deck to a JSON string
	deckToJSON(){
		let obj = {
			faction: this.faction,
			leader: this.leader.index, 
			cards: this.deck.filter(x => x.count > 0).map(x => [x.index, x.count] )
		};
		return JSON.stringify(obj);
	}
	
	// Called by the client to downlaod the current deck as a JSON file
	downloadDeck(){
		let json = this.deckToJSON();
		let str = "data:text/json;charset=utf-8," + encodeURIComponent(json);
		let hidden_elem = document.getElementById('download-json');
		hidden_elem.href = str;
		hidden_elem.download = "GwentDeck.json";
		hidden_elem.click();
	}

	uploadDeck(id, callback)
	{
		let files = document.getElementById(id).files;
		if (files.length <= 0)
			return false;
		let fr = new FileReader();
		fr.onload = e => {
			try {
				const deck = this.deckFromJSON(e.target.result);
				if (deck)
					callback(deck);
				
			} catch (e) {
				alert((typeof I18N !== "undefined") ? I18N.t("err_deck_format") : "Uploaded deck is not formatted correctly!");
			}
			finally
			{
				document.getElementById(id).value = "";
			}
		}
		fr.readAsText(files.item(0));
	}
	
	// Called by the client to upload a JSON file representing a new deck
	uploadPlayerDeck() {
		if (typeof StoryMode !== "undefined" && StoryMode.isCustomizingCampaign) {
			return;
		}
		this.uploadDeck("add-file", deck => this.loadPlayerDeck(deck, false));
	}

	uploadOpponentDeck()
	{
		this.uploadDeck('add-opponent', deck => this.loadOpponentDeck(deck, false));
	}
	
	// Creates a deck from a JSON file's contents and sets that as the current deck
	// Notifies client with warnings if the deck is invalid
	deckFromJSON(json) {
		let deck;
		try {
			deck = JSON.parse(json);
			return deck;
		} catch (e) {
			AudioManager.playSFX('warning');
			if (typeof MenuController !== "undefined" && typeof MenuController.showAlert === "function") {
				MenuController.showAlert((typeof I18N !== "undefined") ? I18N.t("err_deck_parse") : "Uploaded deck is not parsable!", "ERRO NO ARQUIVO", "⚠️");
			} else {
				alert((typeof I18N !== "undefined") ? I18N.t("err_deck_parse") : "Uploaded deck is not parsable!");
			}
			return;
		}
	}

	loadDeck(deck, silent = true)
	{
		if (!deck)
			return null;
		let warning = "";
		// verify that leader card is actually a leader and that it's faction matches the deck faction
		if (card_dict[deck.leader].row !== "leader")
			warning += "'" + card_dict[deck.leader].name + "' is cannot be used as a leader\n";
		if (deck.faction != card_dict[deck.leader].deck)
			warning += "Leader '" + card_dict[deck.leader].name + "' doesn't match deck faction '" + deck.faction + "'.\n";
		// check if cards exist and have correct faction & count
		const cards = deck.cards.filter( c => {
			const card = card_dict[c[0]];
			if (!card) {
				warning += "ID " + c[0] + " does not correspond to a card.\n";
				return false
			}
			if (![deck.faction, "neutral", "special", "weather"].includes(card.deck)) {
				warning += "'" + card.name + "' cannot be used in a deck of faction type '" + deck.faction +"'\n";
				return false;
			}
			if (card.count < c[1]) {
				warning += "Deck contains " + c[1] + "/" + card.count + " available " + (card_dict[c[0]] ? card_dict[c[0]].name : "") + " cards\n";
				c[1] = card.count;
				return true;
			}
			return true;
		})
		.map(c => ({index:c[0], count:Math.min(c[1], card_dict[c[0]].count)}) );
		// prompt warning if necessary
		if (warning)
		{
			if (silent)
			{
				return null;
			}
			AudioManager.playSFX('warning');
			if (typeof MenuController !== "undefined" && typeof MenuController.showAlert === "function") {
				MenuController.showAlert(warning.trim(), "AVISO DE IMPORTAÇÃO", "⚠️");
			}
		}
		return {faction: deck.faction, leader: deck.leader, cards: cards};
	}

	loadPlayerDeck(deck, silent = true)
	{
		const loadedDeck = this.loadDeck(deck, silent);
		if (!loadedDeck)
			return;
		
		// Use deck to update current player faction and cards in deck maker
		this.setFaction(loadedDeck.faction, true);
		if (card_dict[loadedDeck.leader].row === "leader" && loadedDeck.faction === card_dict[loadedDeck.leader].deck){
			this.leader = this.leaders.filter(c => c.index === loadedDeck.leader)[0];
			this.updateLeaderDisplay();
		}
		this.makeBank(deck.faction, loadedDeck.cards);
		this.update();
	}

	loadOpponentDeck(deck, silent = true)
	{
		const loadedDeck = this.loadDeck(deck, silent);
		if (!loadedDeck)
			return;
		this.opponentData = loadedDeck;
		Settings.opponentDeckCustom.set(loadedDeck);
		this.updatedCustomOpponent();
	}

	async clearOpponentDeck()
	{
		Settings.opponentDeckCustom.clear();
		this.opponentData = null;
		this.selectedOpponentFaction = "random";
		localStorage.setItem("gc-opponent-faction", "random");
		this.updatedCustomOpponent();
	}

	updatedCustomOpponent()
	{
		const factionElem = document.getElementById('op-preview-faction');
		const titleElem = document.getElementById('op-preview-title');
		const subtitleElem = document.getElementById('op-preview-subtitle');
		const leaderElem = document.getElementById('op-preview-leader');
		const buttons = ['op-preview-clear', 'op-preview-open'].map(id => document.getElementById(id));
		
		const current = this.selectedOpponentFaction || "random";

		if (!isEmpty(this.opponentData))
		{
			if (factionElem) {
				factionElem.style.backgroundImage = iconURL('deck_shield_' + this.opponentData.faction);
				factionElem.innerHTML = '';
				factionElem.classList.remove('hide');
			}
			if (titleElem) titleElem.textContent = card_dict[this.opponentData.leader].name;
			if (subtitleElem) subtitleElem.textContent = (typeof I18N !== "undefined") ? I18N.t("custom_deck_label") : "Baralho Customizado";
			buttons.forEach(e => { if (e) e.classList.remove('hide'); });
		}
		else if (current === "random")
		{
			if (factionElem) {
				factionElem.style.backgroundImage = 'none';
				factionElem.innerHTML = '🎲';
				factionElem.classList.remove('hide');
			}
			if (titleElem) titleElem.textContent = (typeof I18N !== "undefined") ? I18N.t("random_label") : "Aleatório";
			if (subtitleElem) subtitleElem.textContent = (typeof I18N !== "undefined") ? I18N.t("opponent_random_desc") : "Facção e líder aleatórios";
			buttons.forEach(e => { if (e) e.classList.add('hide'); });
		}
		else if (typeof factions !== "undefined" && factions[current])
		{
			if (factionElem) {
				factionElem.style.backgroundImage = iconURL('deck_shield_' + current);
				factionElem.innerHTML = '';
				factionElem.classList.remove('hide');
			}
			if (titleElem) titleElem.textContent = factions[current].name;
			if (subtitleElem) subtitleElem.textContent = (typeof I18N !== "undefined") ? I18N.t("op_deck") : "Baralho Adversário";
			const clearBtn = document.getElementById('op-preview-clear');
			if (clearBtn) clearBtn.classList.remove('hide');
			const openBtn = document.getElementById('op-preview-open');
			if (openBtn) openBtn.classList.add('hide');
		}

		if (leaderElem && leaderElem.children && leaderElem.children[1]) {
			leaderElem.children[1].innerHTML = titleElem ? titleElem.textContent : "Random";
		}
	}

	viewOponentCards()
	{
		if (isEmpty(this.opponentData))
			return;
		// const leader = card_dict[this.opponentData.leader];
		const leader = {index: this.opponentData.leader, count:1};
		const container = new CardContainer();
		//container.cards = [leader, ...Card.this.opponentData.cards];
		container.cards = Card.getCardsFromIdCounts([leader, ...this.opponentData.cards]);
		ui.queueCarousel(container, 1, ()=>{}, ()=>true, false, true, (typeof I18N !== "undefined") ? I18N.t("view_opponent_deck_title") : "Oponent's deck");
	}
}

class AudioManager
{
	static source = {};
	static volume = 0.8;

	static init()
	{
		const saved = localStorage.getItem("gc-sfx-volume");
		if (saved !== null) {
			AudioManager.volume = Math.max(0, Math.min(1, parseFloat(saved) / 100));
		}
		[
			'turn_me', 'turn_op', "ui_card", 'ui_card_bank', 'open', 'draw',
			'clear', 'fog', 'frost', 'rain', 
			'horn', 'spy', 'medic', 'morale', 'scorch', 'bond', 'decoy', "mardroeme",
			'hero', 'common_close', 'common_ranged', 'common_siege',
			'witcher_click', 'witcher_hover', 'witcher_hover2', 'witcher_confirm',
			'witcher_switch', 'witcher_back', 'witcher_tab_open', 'witcher_slash',
			'witcher_toggle_on', 'witcher_toggle_off'
		].forEach(s => {
			const a = getAudio(s);
			a.volume = AudioManager.volume;
			AudioManager.source[s] = a;
		});
	}

	static setVolume(percent)
	{
		AudioManager.volume = Math.max(0, Math.min(1, parseFloat(percent) / 100));
		localStorage.setItem("gc-sfx-volume", percent);
		for (let k in AudioManager.source) {
			if (AudioManager.source[k] instanceof Audio) {
				AudioManager.source[k].volume = AudioManager.volume;
			}
		}
	}

	static async play(key, waitTime = -1, forceWait = false)
	{
		if (AudioManager.source[key])
		{
			const audio = AudioManager.source[key];
			if (!audio)
				return;
			if (audio instanceof Audio)
			{
				let soundToPlay = audio;
				if (audio.currentTime > 0 && !audio.paused && !audio.ended)
				{
					soundToPlay = audio.cloneNode();
					soundToPlay.volume = AudioManager.volume;
				}
				if (waitTime === -1 || (!forceWait && waitTime >= (soundToPlay.duration || 0) * 1000))
					return await asyncAudio(soundToPlay);
				else
				{
					soundToPlay.play().catch(() => {});
					return await sleep(waitTime);
				}
			}
		}
		else
		{
			return await playAudio(key)
		}
	}

	static async playSFX(key, waitTime = -1, forceWait = false)
	{
		if (Settings.soundEffects.isEnabled())
		{
			return await AudioManager.play(key, waitTime, forceWait);
		}
	}
}

class AudioCycle
{
	constructor(...paths)
	{
		this.sources = [];
		this.index = 0;
		for (let i = 0; i < paths.length; ++i)
		{
			this.sources.push(audioURL(paths[i]));
		}
	}

	play()
	{
		this.sources[this.index].play().then(a => {
			a.pause();
			a.currentTime = 0;
		});
		this.index = (this.index + 1) % this.sources.length;
	}

	pause()
	{
		this.sources.forEach(a => a.pause());
	}
}

class ToggleOption
{
	constructor(key, enableByDefault = true, action = ()=>{})
	{
		this.key = key;
		const saved = localStorage?.getItem(this.key);
		this.enabled = (saved !== null && saved !== undefined) ? saved==="true" : enableByDefault;
		this.action = action;
	}
	isEnabled() { return this.enabled; }
	setEnabled(enable)
	{
		if (this.enabled === enable)
		{
			return;
		}
		this.enabled = enable;
		if (localStorage)
		{
			localStorage.setItem(this.key, this.enabled);
		}
		this.action(this.enabled);
	}
	enable() { this.setEnabled(true); }
	disable() { this.setEnabled(false); }
	toggle() { this.setEnabled(!this.enabled); }
}

class SavedObject
{
	constructor(key, defaultValue = {}, action = ()=>{})
	{
		this.key = key;
		const saved = localStorage?.getItem(this.key);
		if (typeof defaultValue === "string" || defaultValue instanceof String)
			defaultValue = JSON.parse(defaultValue);
		this.obj = (saved !== null && saved !== undefined) ? JSON.parse(saved) : defaultValue;
		this.action = action;
	}
	get()
	{
		return this.obj;
	}
	set(newObj)
	{
		if (!this.key)
		{
			return;
		}
		if (newObj === null || newObj === undefined)
		{
			newObj = {};
		}
		localStorage?.setItem(this.key, JSON.stringify(newObj));
		if (this.action)
			this.action(this.obj);
	}
	clear()
	{
		this.obj = {};
		localStorage?.removeItem(this.key);
	}
}

class SavedDeck extends SavedObject
{
	constructor(key, defaultValue = {}, action = ()=>{})
	{
		super(key, defaultValue, action);
	}
	get()
	{
		const temp_deck = {...super.get()};
		if (temp_deck.cards)
		{
			temp_deck.cards = temp_deck.cards.map(c => ({index: c[0], count: c[1]}) );
		}
		return temp_deck;
	}
	set(newObj)
	{
		const temp_deck = {...newObj};
		temp_deck.cards = newObj.cards.map(c => [c.index, c.count]);
		super.set(temp_deck);
	}
	setCards(cards)
	{
		const deck = super.get();
		deck.cards = cards.map(c => [c.index, c.count]);
		super.set(deck);
	}
	setLeader(leader)
	{
		const deck = super.get();
		deck.leader = leader.index;
		super.set(deck);
	}
}

class SavedString
{
	constructor(key, defaultValue = "", action = ()=>{})
	{
		this.key = key;
		let saved = localStorage?.getItem(this.key);
		if (saved === null || saved === undefined)
			saved = defaultValue;
		this.value = saved;
		this.action = action;
	}
	get() { return this.value; }
	set(newValue)
	{
		if (this.value === newValue)
			return;
		this.value = newValue;
		localStorage?.setItem(this.key, newValue);
		if (this.action)
			this.action(this.value);
	}
}

class Settings
{
	static music = new ToggleOption("gc-music", true);
	static notifications = new ToggleOption("gc-notifications", true);
	static soundEffects = new ToggleOption("gc-sound-effects", true);
	static difficulty = new SavedString("gc-difficulty", "medium");
	static language = new SavedString("gc-language", "en");
	static displayMode = new SavedString("gc-display-mode", "window");
	static resolution = new SavedString("gc-resolution", "1366x768");
	static jukeboxTrack = new SavedString("gc-jukebox-track", "all");
	static lastFaction = new SavedString("gc-last-faction", "realms"); 
	static realmsDeck = new SavedDeck("gc-deck-realms", premade_deck[0]);
	static nilfgaardDeck = new SavedDeck("gc-deck-nilfgaard", premade_deck[2]);
	static monstersDeck = new SavedDeck("gc-deck-monsters", premade_deck[4]);
	static scoiataelDeck = new SavedDeck("gc-deck-scoiatael", premade_deck[6]);
	static skelligesDeck = new SavedDeck("gc-deck-skellige", premade_deck[8]);
	static opponentDeckCustom = new SavedDeck("gc-deck-opponent-custom");
	
	static getFactionSettings(factionName)
	{
		switch(factionName) {
			case "realms":
				return Settings.realmsDeck;
			case "nilfgaard":
				return Settings.nilfgaardDeck;
			case "monsters":
				return Settings.monstersDeck;
			case "scoiatael":
				return Settings.scoiataelDeck;
			case "skellige":
				return Settings.skelligesDeck;
		}
		return null;
	}
}

class GameEvent
{
	constructor(id, signature)
	{
		this.id = id;
		this.signature = signature;
		if (!signature)
		{
			throw "Must pass in a signature as an array of param names";
		}
	}
	bind(listenter)
	{
		window.addEventListener(this.id, listenter);
	}
	unbind(listenter)
	{
		window.removeEventListener(this.id, listenter);
	}
	dispatch(...params)
	{
		const detail = {};
		for (let i = 0; i < params.length && i < this.signature.length; i++)
		{
			detail[this.signature[i]] = params[i];
		}
		window.dispatchEvent(new CustomEvent(this.id, {detail: detail}));
	}
}

class EventManager 
{
	static rowSelected;
	static previewCancelled;

	constructor()
	{
		EventManager.rowSelected = new GameEvent("row-selected", ['row', 'player'])
		EventManager.previewCancelled = new GameEvent("preview-cancelled", []);
		EventManager.gameOpened = new GameEvent("game-opened", []);
		EventManager.customizationOpened = new GameEvent('customize-opened', []);
		EventManager.roundPassed = new GameEvent('round-passed', ['player', 'round']);
		EventManager.roundStarted = new GameEvent('round-started', ['round', 'starting-player']);
		EventManager.roundEnded = new GameEvent('round-ended', ['round', 'points-me', 'points-op']);
		EventManager.gameStateChanged = new GameEvent('game-state-changed', ['oldState', 'newState']);
	}
}

// Translates a card between two containers
async function translateTo(card, container_source, container_dest){
	if (!container_dest || !container_source)
		return;
	if (container_dest === player_op.hand && container_source === player_op.deck)
		return;
	
	let elem = card.elem;
	if (elem) elem.classList.remove("gamepad-focused");
	let source = !container_source ? card.elem : getSourceElem(card, container_source, container_dest);
	let dest = getDestinationElem(card, container_source, container_dest);
	if (!isInDocument(elem))
		source.appendChild(elem);
	let x = trueOffsetLeft(dest) - trueOffsetLeft(elem) +dest.offsetWidth/2 - elem.offsetWidth;
	let y = trueOffsetTop(dest) - trueOffsetTop(elem) +dest.offsetHeight/2 - elem.offsetHeight/2;
	if (container_dest instanceof Row && container_dest.cards.length !== 0 && !card.isSpecial() ){
		x += (container_dest.getSortedIndex(card) === container_dest.cards.length) ? elem.offsetWidth/2 : -elem.offsetWidth/2;
	}
	if (card.holder.controller instanceof ControllerAI)
		x += elem.offsetWidth/2;
	if (container_source instanceof Row && container_dest instanceof Grave && !card.isSpecial()) {
		let mid = trueOffset(container_source.elem, true) + container_source.elem.offsetWidth/2;
		x += trueOffset(elem, true) - mid;
	}
	if (container_source instanceof Row && container_dest === player_me.hand)
		y *= 7/8;
	await translate(elem, x, y);
	
	// Returns true if the element is visible in the viewport
	function isInDocument(elem){
		return elem.getBoundingClientRect().width !== 0;
	}
	
	// Returns the true offset of a nested element in the viewport
	function trueOffset(elem, left){
		let total =0
		let curr = elem;
		while (curr){
			total += (left ? curr.offsetLeft : curr.offsetTop);
			curr = curr.parentElement;
		}
		return total;
	}
	function trueOffsetLeft(elem) {	return trueOffset(elem, true); }
	function trueOffsetTop(elem) { return trueOffset(elem, false); }
	
	// Returns the source container's element to transition from
	function getSourceElem(card, source, dest){
		if (source instanceof HandAI)
			return source.hidden_elem;
		if (source instanceof Deck) {
			const deckCardIdx = source.elem.children.length - 2;
			return deckCardIdx >= 0 ? source.elem.children[deckCardIdx] : source.elem;
		}
		return source.elem;
	}

	// Returns the destination container's element to transition to
	function getDestinationElem(card, source, dest){
		if (dest instanceof HandAI)
			return dest.hidden_elem;
		if (card.isSpecial() && dest instanceof Row)
			return dest.elem_special;
		if (dest instanceof Row || dest instanceof Hand || dest instanceof Weather){
			if (dest.cards.length === 0)
				return dest.elem;
			let index = dest.getSortedIndex(card);
			let dcard = dest.cards[index === dest.cards.length ? index-1 : index];
			return (dcard && dcard.elem) ? dcard.elem : dest.elem;
		}
		return dest.elem;
	}
}

// Translates an element by x from the left and y from the top with smooth bezier easing
async function translate(elem, x, y){
	if (!elem) return;
	elem.classList.remove("gamepad-focused");
	let vw100 = 100 / document.getElementById("dimensions").offsetWidth;
	x *= vw100;
	y *= vw100;

	// In-flight styling: elevated z-index, realistic table shadow and subtle scale
	elem.style.zIndex = "9999";
	elem.style.pointerEvents = "none";
	elem.style.transition = "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.38s ease, filter 0.38s ease";
	elem.style.boxShadow = "0 16px 32px rgba(0, 0, 0, 0.8), 0 0 16px rgba(242, 201, 107, 0.6)";
	elem.style.filter = "brightness(1.1) drop-shadow(0 12px 24px rgba(0,0,0,0.7))";
	elem.style.transform = "translate(" + x + "vw, " + y + "vw) scale(1.05)";

	await sleep(380);

	// Safety fallback in case caller doesn't clean up
	setTimeout(() => {
		if (elem && elem.style.zIndex === "9999") {
			elem.style.transition = "none";
			elem.style.transform = "";
			elem.style.zIndex = "";
			elem.style.boxShadow = "";
			elem.style.filter = "";
			elem.style.pointerEvents = "";
		}
	}, 400);
}

// Fades out an element until hidden over the duration
async function fadeOut(elem, duration) {
	await fade(false, elem, duration);
}

// Fades in an element until opaque over the duration
async function fadeIn(elem, duration){
	await fade(true, elem, duration);
}

// Fades an element over a duration 
async function fade(fadeIn, elem, dur){
	if (!elem)
		return;
	return new Promise(res => {
		const startingOpacity = toInteger(elem.style.opacity);
		const endOpacity = fadeIn ? 1 : 0;
		const startTime = Date.now();
		const endTime = startTime + dur;
		if (fadeIn)
			elem.classList.remove('hide');
		const timer = setInterval(() => {
			const currTime = Date.now();
			const op = clamp(startingOpacity, endOpacity, map(startTime, endTime, startingOpacity, endOpacity, currTime));
			elem.style.opacity = op;
			if (op === endOpacity)
			{
				clearInterval(timer);
				if (!fadeIn)
					elem.classList.add('hide');
				res();
			}
		}, DUR_FADE_STEP);
	});
}

// Triggers the authentic Witcher 3 golden perimeter spark & ember animation for Hero cards
function animateHeroSpark(elem) {
	if (!elem) return;

	// Remove any existing fx
	const existing = elem.querySelector(".hero-spark-fx");
	if (existing) existing.remove();

	const fx = document.createElement("div");
	fx.className = "hero-spark-fx";
	fx.style.cssText = "position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; margin:0 !important; padding:0 !important; pointer-events:none !important; z-index:150 !important; overflow:visible !important; background:none !important;";

	fx.innerHTML = `
		<svg class="hero-spark-svg" viewBox="0 0 100 142" preserveAspectRatio="none" style="position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; margin:0 !important; padding:0 !important; overflow:visible !important; pointer-events:none !important;">
			<rect class="hero-spark-path hero-spark-glow" x="1" y="1" width="98" height="140" rx="4" ry="4" pathLength="100" />
			<rect class="hero-spark-path hero-spark-trail" x="1" y="1" width="98" height="140" rx="4" ry="4" pathLength="100" />
			<rect class="hero-spark-path hero-spark-head" x="1" y="1" width="98" height="140" rx="4" ry="4" pathLength="100" />
		</svg>
		<div class="hero-spark-flash" style="position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; margin:0 !important; pointer-events:none !important;"></div>
	`;

	const embersContainer = document.createElement("div");
	embersContainer.className = "hero-embers-container";
	embersContainer.style.cssText = "position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; margin:0 !important; padding:0 !important; pointer-events:none !important; overflow:visible !important; background:none !important;";

	const particleCount = 20;
	for (let i = 0; i < particleCount; i++) {
		const ember = document.createElement("span");
		ember.className = "hero-ember";
		ember.style.cssText = "position:absolute !important; margin:0 !important; pointer-events:none !important;";
		
		const progress = i / particleCount;
		const delay = (progress * 0.88).toFixed(3);
		
		let px, py, vx, vy;
		if (progress < 0.25) {
			px = (progress / 0.25) * 100;
			py = 1;
			vx = (Math.random() - 0.5) * 22;
			vy = -12 - Math.random() * 24;
		} else if (progress < 0.50) {
			px = 99;
			py = ((progress - 0.25) / 0.25) * 100;
			vx = 12 + Math.random() * 24;
			vy = (Math.random() - 0.5) * 22;
		} else if (progress < 0.75) {
			px = (1 - (progress - 0.50) / 0.25) * 100;
			py = 99;
			vx = (Math.random() - 0.5) * 22;
			vy = 12 + Math.random() * 24;
		} else {
			px = 1;
			py = (1 - (progress - 0.75) / 0.25) * 100;
			vx = -12 - Math.random() * 24;
			vy = (Math.random() - 0.5) * 22;
		}

		ember.style.left = px + "%";
		ember.style.top = py + "%";
		ember.style.setProperty("--vx", vx.toFixed(1) + "px");
		ember.style.setProperty("--vy", vy.toFixed(1) + "px");
		ember.style.animationDelay = delay + "s";
		embersContainer.appendChild(ember);
	}

	fx.appendChild(embersContainer);
	elem.appendChild(fx);

	setTimeout(() => {
		if (fx.parentNode) {
			fx.parentNode.removeChild(fx);
		}
	}, 1400);
}

//      Get Image paths   
function iconURL(name, ext = "png"){
	return imgURL("icons/" + name, ext);
}
function largeURL(name, ext="jpg"){
	return imgURL("lg/" + name, ext) 
}
function smallURL(name, ext="jpg"){
	return imgURL("sm/" + name, ext);
}
function imgURL(path, ext) {
	return "url('img/" + path + "." + ext + "')";
}

// get sound effect path
function audioURL(name, ext = "mp3") {
	if (typeof name === "string" || name instanceof String)
	{
		if (name.includes('.'))
		{
			return "sfx/" + name; 
		}
	}
	else if (name['name'])
	{
		if (name['ext'])
		{
			ext = name['ext'];
		}
		name = name['name'];
	}
	return "sfx/" + name + "." + ext;
}

// Get audio instance
function getAudio(name, ext = "mp3")
{
	const a = new Audio(audioURL(name, ext));
	if (typeof AudioManager !== "undefined" && AudioManager.volume !== undefined) {
		a.volume = AudioManager.volume;
	}
	return a;
}
// Play sound effect
async function playAudio(name, ext = "mp3")
{
	return await asyncAudio(getAudio(name, ext));
}

function asyncAudio(audio)
{
	if (!userInteracted || !audio)
		return;
	return new Promise(r => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			clearTimeout(safetyTimer);
			r();
		};
		const maxMs = (audio.duration && isFinite(audio.duration) && audio.duration > 0)
			? Math.min(4000, Math.ceil(audio.duration * 1000) + 250)
			: 1800;
		const safetyTimer = setTimeout(finish, maxMs);
		audio.onended = finish;
		audio.onerror = finish;
		try {
			const playPromise = audio.play();
			if (playPromise && typeof playPromise.catch === "function") {
				playPromise.catch(finish);
			}
		} catch (e) {
			finish();
		}
	});
}

// Pauses execution until the passed number of milliseconds as expired
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
  //return new Promise(resolve => setTimeout(() => {if (func) func(); return resolve();}, ms));
}

// Suspends execution until the predicate condition is met, checking every ms milliseconds
function sleepUntil(predicate, ms) {
	return new Promise(resolve => {
		let timer = setInterval( function () {
			if (predicate()) {
				clearInterval(timer);
				resolve();
			}
		}, ms)
	});
}

// Initializes the interractive YouTube object
function onYouTubeIframeAPIReady() {
	ui.initYouTube();
}

/*----------------------------------------------------*/


const eventManager = new EventManager(); 
let userInteracted = false;
var ui = new UI();
var board = new Board();
var weather = new Weather();
var game = new Game();
var player_me, player_op;
AudioManager.init();

ui.enablePlayer(false);
let dm = new DeckMaker();
ui.initYouTube();


const enableInteraction = () => { userInteracted = true; };
['click', 'pointerdown', 'mousemove', 'keydown'].forEach(evt => {
	document.addEventListener(evt, enableInteraction, { once: true, passive: true });
});
