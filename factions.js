"use strict";

var factions = {
	realms: {
		get name() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_realms_name") : "Northern Realms";
		},
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount > 1 && game.roundHistory[game.roundCount-2].winner === player) {
				player.deck.draw(player.hand);
				await ui.notification("north", 1200);
			}
			return false;
		}),
		get description() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_realms_desc") : "Draw a card from your deck whenever you win a round.";
		}
	},
	nilfgaard: {
		get name() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_nilfgaard_name") : "Nilfgaardian Empire";
		},
		get description() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_nilfgaard_desc") : "Wins any round that ends in a draw.";
		}
	},
	monsters: {
		get name() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_monsters_name") : "Monsters";
		},
		factionAbility: player => game.roundEnd.push(() => {
			const units = board.row.filter( (r,i) => player === player_me ^ i < 3)
				.reduce((a,r) => r.cards.filter(c => c.isUnit()).concat(a), []);
			if (units.length === 0)
				return;
			let card;
			if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
				const sorted = [...units].sort((a, b) => a.name.localeCompare(b.name) || (b.power - a.power));
				const idx = (game.roundCount + sorted.length) % sorted.length;
				card = sorted[idx];
			} else {
				card = units[randomInt(units.length)];
			}
			card.noRemove = true;
			game.roundStart.push( async () => {
				await ui.notification("monsters", 1200);
				delete card.noRemove;
				return true; 
			});
			return false;
		}),
		get description() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_monsters_desc") : "Keeps a random Unit Card out after each round.";
		}
	},
	scoiatael: {
		get name() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_scoiatael_name") : "Scoia'tael";
		},
		factionAbility: player => game.gameStart.push( async () => {
			let notif = "";
			if (player === player_me) {
				const yesText = (typeof I18N !== "undefined") ? I18N.t("scoiatael_popup_yes") : "Go First";
				const noText = (typeof I18N !== "undefined") ? I18N.t("scoiatael_popup_no") : "Let Opponent Start";
				const titleText = (typeof I18N !== "undefined") ? I18N.t("scoiatael_popup_title") : "Would you like to go first?";
				const descText = (typeof I18N !== "undefined") ? I18N.t("scoiatael_popup_desc") : "The Scoia'tael faction perk allows you to decide who will get to go first.";
				let autoTimer = null;
				if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
					autoTimer = setTimeout(() => {
						if (typeof Popup !== "undefined" && Popup.curr) {
							Popup.curr.selectYes();
						}
					}, 15000);
				}
				await ui.popup(yesText, () => game.firstPlayer = player, noText, () => game.firstPlayer = player.opponent(), titleText, descText, 0.55);
				if (autoTimer) clearTimeout(autoTimer);
				if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
					VersusMode.sendPacket("SCOIATAEL_CHOICE", {
						firstTurn: (game.firstPlayer === player_me) ? "opponent_op" : "opponent_me"
					});
				}
				notif = game.firstPlayer.tag + "-first";
			} else if (typeof VersusMode !== "undefined" && VersusMode.isActive) {
				const startWait = Date.now();
				while (VersusMode.scoiataelChoiceReceived === null && VersusMode.isActive && (Date.now() - startWait < 17000)) {
					await sleep(100);
				}
				if (VersusMode.scoiataelChoiceReceived === "opponent_me") {
					game.firstPlayer = player_me;
					notif = game.firstPlayer.tag + "-first";
				} else {
					game.firstPlayer = player_op;
					notif = "scoiatael";
				}
				VersusMode.scoiataelChoiceReceived = null;
			} else if (player.hand instanceof HandAI) {
				if (Math.random() < 0.5) {
					game.firstPlayer = player;
					notif = "scoiatael";
				} else {
					game.firstPlayer = player.opponent();
					notif = game.firstPlayer.tag + "-first";
				}
			}
			await ui.notification(notif, 1200);
			return true;
		}),
		get description() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_scoiatael_desc") : "Decides who takes first turn.";
		}
	},
	skellige: {
		get name() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_skellige_name") : "Skellige";
		},
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount != 3)
				return false;
			const currPlayer = game.currPlayer;
			game.currPlayer = player;
			await ui.notification("skellige-" + player.tag, 1200);
			if (typeof VersusMode !== "undefined" && VersusMode.isActive)
			{
				const validUnits = player.grave.findCards(c => c.isUnit()).slice(0, 2);
				for (const c of validUnits) {
					await board.toRow(c, player.grave);
				}
			}
			else if (player.controller instanceof ControllerAI)
			{
				await Promise.all(player.grave.findCardsRandom(c => c.isUnit(), 2).map(c => board.toRow(c, player.grave)));
			}
			else
			{
				await factions['skellige'].helper(player);
				await factions['skellige'].helper(player);
			}
			game.currPlayer = currPlayer;
			return true;
		}),
		helper: async player => {
			const units = player.grave.findCardsRandom(c => c.isUnit(), 1);
			if (units.length === 0)
				return;
			const card = units[0];
			if (card.row === 'agile')
			{
				if (player !== player_me || (typeof game !== "undefined" && game.isAutoPlayingTimeout) || (typeof VersusMode !== "undefined" && VersusMode.isActive))
				{
					const autoRow = board.getRow(card, "close", player);
					await board.moveTo(card, autoRow, player.grave);
				}
				else
				{
					const selectedRow = await ui.waitForRowSelection(card);
					if (selectedRow)
					{
						await board.moveTo(card, selectedRow, player.grave);
					}
					else
					{
						const fallbackRow = board.getRow(card, "close", player);
						await board.moveTo(card, fallbackRow, player.grave);
					}
				}
			}
			else
			{
				await board.toRow(card, player.grave);
			}
		},
		get description() {
			return (typeof I18N !== "undefined") ? I18N.t("faction_skellige_desc") : "2 random cards from the graveyard are placed on the battlefield at the start of the third round.";
		}
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = factions;
}
