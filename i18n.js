"use strict";

const I18N = {
	currentLang: "en",

	translations: {
		en: {
			// Brand
			game_title: "GWENT",
			game_subtitle: "THE WITCHER CARD GAME",

			// Main Menu
			menu_story_mode: "Story Mode",
			menu_continue_story: "Continue Journey",
			menu_play: "Play Gwent",
			menu_versus_mode: "Versus Mode (PvP)",
			menu_achievements: "Achievements",
			menu_settings: "Settings",
			menu_credits: "Credits",
			menu_quit: "Quit Game",

			// Achievements
			achievements_title: "ACHIEVEMENTS",
			ach_filter_all: "All",
			ach_filter_unlocked: "Unlocked",
			ach_filter_locked: "Locked",

			// Difficulty
			menu_difficulty: "Select Difficulty",
			diff_easy: "Easy",
			diff_easy_desc: "Casual opponent with forgiving strategy",
			diff_medium: "Medium",
			diff_medium_desc: "Standard Witcher 3 AI challenge",
			diff_hard: "Hard",
			diff_hard_desc: "Ruthless tactical intelligence & optimal plays",

			// Settings
			settings_title: "SETTINGS",
			settings_display: "Display Mode",
			disp_window: "Windowed",
			disp_borderless: "Borderless",
			disp_fullscreen: "Fullscreen",
			settings_resolution: "Resolution",
			settings_audio: "Audio & Jukebox",
			audio_music: "Music",
			audio_music_volume: "Music Volume",
			audio_sfx: "Sound Effects",
			audio_sfx_volume: "SFX Volume",
			audio_jukebox: "Jukebox Track",
			track_all: "♦ All Tracks (Loop & Shuffle)",
			track_gwent_main: "1. How About a Round of Gwent (Main Theme)",
			track_plots: "2. Plots and Intrigues",
			track_northern: "3. Northern Realms Theme",
			track_nilfgaard: "4. The Black Clads (Nilfgaard Theme)",
			track_witcher_forest: "5. Kaer Morhen / Forest Ambience",
			track_witcher_ocean: "6. Skellige Winds & Ocean",
			settings_language: "Language",
			lang_en: "English",
			lang_pt: "Português (Brasil)",
			lang_es: "Español",
			lang_pl: "Polski",
			btn_back: "← Back",
			btn_save: "Save & Close",

			// Credits
			credits_title: "CREDITS",
			credits_cdpr_title: "CD Projekt Red",
			credits_cdpr_role: "Original Creator of Gwent & The Witcher 3: Wild Hunt",
			credits_cdpr_desc: "For envisioning the incredible world of Geralt of Rivia and creating the timeless mini-game that captivated millions of players worldwide.",
			credits_arun_title: "Arun Sundaram",
			credits_arun_role: "Web Remake Author (arunsundaram.com)",
			credits_arun_desc: "For painstakingly implementing the full Gwent game logic, AI, card databases and animations for modern web browsers.",
			credits_creator_title: "Desktop Project Creator",
			credits_creator_role: "Desktop Edition, Native Launcher & Expansions",
			credits_creator_desc: "For taking this project further: reverse engineering the web bundle, building the native offline Windows executable, adding the offline Witcher 3 OST jukebox, creating the main menu, AI difficulty levels and multi-language support.",

			// Board & Tooltips
			player_name: "Geralt",
			opponent_name: "Opponent",
			passed_label: "Passed",
			btn_pass: "Pass",
			btn_forfeit: "Surrender",
			title_pass_round: "Pass round",
			title_forfeit_game: "Surrender match",
			title_exit_game: "Exit game",
			btn_return_lobby: "Return to Room",
			forfeit_popup_title: "Surrender Match?",
			forfeit_popup_desc: "You will immediately forfeit the current match.",
			forfeit_popup_desc_versus: "If you surrender now, victory will be granted immediately to your opponent.",
			forfeit_popup_resume: "Continue Match",
			forfeit_popup_confirm: "🏳 Surrender",
			title_view_leader: "View leader",
			title_play_leader: "Play leader",
			title_view_discards: "View discards",
			title_toggle_music: "Toggle music",
			title_toggle_sfx: "Toggle sound effects",
			title_toggle_notif: "Toggle game messages",

			// End Screen
			round_1: "Round 1",
			round_2: "Round 2",
			round_3: "Round 3",
			end_draw_desc: "The battle cannot end in a draw. You can play a rematch using the same decks or surrender.",
			btn_customize: "Customize",
			btn_rematch: "Rematch",
			btn_new_game: "New Game",

			// Deck Customization Screen
			btn_main_menu: "Main Menu",
			btn_start_game: "Start Game",
			btn_change_faction: "Change Faction",
			btn_upload_deck: "Upload Deck",
			btn_download_deck: "Download Deck",
			card_collection: "Card Collection",
			cards_in_deck: "Cards in Deck",
			leader_label: "Leader",
			deck_stats_header: "Deck Summary",
			deck_total_cards: "Total cards in deck",
			deck_unit_cards: "Number of Unit Cards",
			deck_special_cards: "Special Cards",
			deck_strength: "Total Unit Card Strength",
			deck_hero_cards: "Hero Cards",
			op_deck: "Opponent's Deck",
			random_label: "Random",
			title_view_opponent: "View opponent",
			title_upload_opponent: "Upload opponent",
			title_clear_opponent: "Clear opponent",
			warn_min_units: "Your deck must have at least 15 unit cards.",
			warn_max_specials: "Your deck must have no more than 10 special cards.",
			redraw_title: "Choose up to 2 cards to redraw.",
			view_opponent_deck_title: "Opponent's deck",
			err_deck_format: "Uploaded deck is not formatted correctly!",
			err_deck_parse: "Uploaded deck is not parsable!",
			confirm_import_deck: "Continue importing deck?",
			filter_all: "All Cards",
			filter_close: "Close Combat",
			filter_ranged: "Ranged Combat",
			filter_siege: "Siege Combat",
			filter_special: "Special & Weather",
			filter_hero: "Hero Cards",
			select_opponent_title: "CHOOSE OPPONENT DECK",
			select_opponent_desc: "Select which faction you want to face in battle:",
			opponent_random_desc: "Faction and leader chosen at random",
			btn_change_opponent: "Select Opponent",
			btn_import_json: "Import JSON",
			custom_deck_label: "Custom Deck",
			leader_change_hint: "Click to change Leader",
			btn_confirm: "Confirm",

			// Popups & Dialogs
			exit_popup_title: "Quit current game?",
			exit_popup_desc: "This will return you to the deck customization menu.",
			exit_popup_resume: "Resume",
			exit_popup_exit: "Exit",
			scoiatael_popup_title: "Would you like to go first?",
			scoiatael_popup_desc: "The Scoia'tael faction perk allows you to decide who will get to go first.",
			scoiatael_popup_yes: "Go First",
			scoiatael_popup_no: "Let Opponent Start",
			btn_yes: "Yes",
			btn_no: "No",

			// Floating Notifications
			notif_me_first: "You will go first",
			notif_op_first: "Your opponent will go first",
			notif_me_coin: "You will go first",
			notif_op_coin: "Your opponent will go first",
			notif_round_start: "Round Start",
			notif_me_pass: "Round passed",
			notif_op_pass: "Your opponent has passed",
			notif_win_round: "You won the round!",
			notif_lose_round: "Your opponent won the round",
			notif_draw_round: "The round ended in a draw",
			notif_me_turn: "Your turn!",
			notif_op_turn: "Opponent's turn",
			notif_north: "Northern Realms faction ability triggered - North draws an additional card.",
			notif_monsters: "Monsters faction ability triggered - one randomly-chosen Monster Unit Card stays on the board",
			notif_scoiatael: "Opponent used the Scoia'tael faction perk to go first.",
			notif_skellige_op: "Opponent Skellige Ability Triggered!",
			notif_skellige_me: "Skellige Ability Triggered!",

			// Factions
			faction_realms_name: "Northern Realms",
			faction_realms_desc: "Draw a card from your deck whenever you win a round.",
			faction_nilfgaard_name: "Nilfgaardian Empire",
			faction_nilfgaard_desc: "Wins any round that ends in a draw.",
			faction_monsters_name: "Monsters",
			faction_monsters_desc: "Keeps a random Unit Card out after each round.",
			faction_scoiatael_name: "Scoia'tael",
			faction_scoiatael_desc: "Decides who takes first turn.",
			faction_skellige_name: "Skellige",
			faction_skellige_desc: "2 random cards from the graveyard are placed on the battlefield at the start of the third round.",

			// Card Abilities
			ability_leader_name: "Leader Ability",
			ability_hero_name: "Hero",
			ability_hero_desc: "Not affected by any Special Cards or abilities. ",
			ability_decoy_name: "Decoy",
			ability_decoy_desc: "Swap with a card on the battlefield to return it to your hand. ",
			ability_horn_name: "Commander's Horn",
			ability_horn_desc: "Doubles the strength of all unit cards in that row. Limited to 1 per row. ",
			ability_clear_name: "Clear Weather",
			ability_clear_desc: "Removes all Weather Cards (Biting Frost, Impenetrable Fog and Torrential Rain) effects. ",
			ability_frost_name: "Biting Frost",
			ability_frost_desc: "Sets the strength of all Close Combat cards to 1 for both players. ",
			ability_fog_name: "Impenetrable Fog",
			ability_fog_desc: "Sets the strength of all Ranged Combat cards to 1 for both players. ",
			ability_rain_name: "Torrential Rain",
			ability_rain_desc: "Sets the strength of all Siege Combat cards to 1 for both players. ",
			ability_storm_name: "Skellige Storm",
			ability_storm_desc: "Reduces the Strength of all Range and Siege Units to 1. ",
			ability_mardroeme_name: "Mardroeme",
			ability_mardroeme_desc: "Triggers transformation of all Berserker cards on the same row. ",
			ability_berserker_name: "Berserker",
			ability_berserker_desc: "Transforms into a bear when a Mardroeme card is on its row. ",
			ability_scorch_name: "Scorch",
			ability_scorch_desc: "Discard after playing. Kills the strongest card(s) on the battlefield. ",
			ability_scorch_c_name: "Scorch - Close Combat",
			ability_scorch_c_desc: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more. ",
			ability_scorch_r_name: "Scorch - Ranged",
			ability_scorch_r_desc: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more. ",
			ability_scorch_s_name: "Scorch - Siege",
			ability_scorch_s_desc: "Destroys your enemy's strongest Siege Combat unit(s) if the combined strength of all his or her Siege Combat units is 10 or more. ",
			ability_agile_name: "Agile",
			ability_agile_desc: "Can be placed in either the Close Combat or the Ranged Combat row. Cannot be moved once placed. ",
			ability_muster_name: "Muster",
			ability_muster_desc: "Find any cards with the same name in your deck and play them instantly. ",
			ability_spy_name: "Spy",
			ability_spy_desc: "Place on your opponent's battlefield (counts towards your opponent's total) and draw 2 cards from your deck. ",
			ability_medic_name: "Medic",
			ability_medic_desc: "Choose one card from your discard pile and play it instantly (no Heroes or Special Cards). ",
			ability_morale_name: "Morale",
			ability_morale_desc: "Adds +1 to all units in the row (excluding itself). ",
			ability_bond_name: "Tight Bond",
			ability_bond_desc: "Place next to a card with the same name to double the strength of both cards. ",
			ability_avenger_name: "Avenger",
			ability_avenger_desc: "When this card is removed from the battlefield, it summons a powerful new Unit Card to take its place. ",

			// Leader Abilities
			ability_foltest_king_desc: "Pick an Impenetrable Fog card from your deck and play it instantly.",
			ability_foltest_lord_desc: "Clear any weather effects (resulting from Biting Frost, Torrential Rain or Impenetrable Fog cards) in play.",
			ability_foltest_siegemaster_desc: "Doubles the strength of all your Siege units (unless a Commander's Horn is also present on that row).",
			ability_foltest_steelforged_desc: "Destroy your enemy's strongest Siege unit(s) if the combined strength of all his or her Siege units is 10 or more.",
			ability_foltest_son_desc: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more.",
			ability_emhyr_imperial_desc: "Pick a Torrential Rain card from your deck and play it instantly.",
			ability_emhyr_emperor_desc: "Look at 3 random cards from your opponent's hand.",
			ability_emhyr_whiteflame_desc: "Cancel your opponent's Leader Ability.",
			ability_emhyr_relentless_desc: "Draw a card from your opponent's discard pile.",
			ability_emhyr_invader_desc: "Abilities that restore a unit to the battlefield restore a randomly-chosen unit. Affects both players.",
			ability_eredin_commander_desc: "Double the strength of all your Close Combat units (unless a Commander's horn is also present on that row).",
			ability_eredin_bringer_of_death_desc: "Restore a card from your discard pile to your hand.",
			ability_eredin_destroyer_desc: "Discard 2 card and draw 1 card of your choice from your deck.",
			ability_eredin_king_desc: "Pick any weather card from your deck and play it instantly.",
			ability_eredin_treacherous_desc: "Doubles the strength of all spy cards (affects both players).",
			ability_francesca_queen_desc: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more.",
			ability_francesca_beautiful_desc: "Doubles the strength of all your Ranged Combat units (unless a Commander's Horn is also present on that row).",
			ability_francesca_daisy_desc: "Draw an extra card at the beginning of the battle.",
			ability_francesca_pureblood_desc: "Pick a Biting Frost card from your deck and play it instantly.",
			ability_francesca_hope_desc: "Move agile units to whichever valid row maximizes their strength (don't move units already in optimal row).",
			ability_crach_an_craite_desc: "Shuffle all cards from each player's graveyard back into their decks.",
			ability_king_bran_desc: "Units only lose half their Strength in bad weather conditions.",

			// Controller / Gamepad HUD Prompts
			pad_connected: "Controller Connected",
			pad_disconnected: "Controller Disconnected",
			pad_navigate_hand: "Cards",
			pad_play_card: "Play Card",
			pad_pass: "Pass",
			pad_leader: "Leader",
			pad_menu: "Menu",
			pad_choose_row: "Choose Row",
			pad_confirm: "Confirm",
			pad_cancel: "Cancel",
			pad_switch_panel: "Switch Panel",
			pad_select: "Select",
			pad_change_faction: "Faction",
			pad_start_game: "Start Game",
			pad_back: "Back"
		},

		"pt-BR": {
			// Brand
			game_title: "GWENT",
			game_subtitle: "O JOGO DE CARTAS DE THE WITCHER",

			// Main Menu
			menu_story_mode: "Modo História",
			menu_continue_story: "Continuar Jornada",
			menu_play: "Jogar Gwent",
			menu_versus_mode: "Modo Versus (PvP)",
			menu_achievements: "Conquistas",
			menu_settings: "Configurações",
			menu_credits: "Créditos",
			menu_quit: "Sair do Jogo",

			// Achievements
			achievements_title: "CONQUISTAS",
			ach_filter_all: "Todas",
			ach_filter_unlocked: "Desbloqueadas",
			ach_filter_locked: "Bloqueadas",

			// Difficulty
			menu_difficulty: "Selecionar Dificuldade",
			diff_easy: "Fácil",
			diff_easy_desc: "Oponente casual com estratégia flexível",
			diff_medium: "Médio",
			diff_medium_desc: "O desafio clássico da IA de The Witcher 3",
			diff_hard: "Difícil",
			diff_hard_desc: "Inteligência tática impiedosa e jogadas ideais",

			// Settings
			settings_title: "CONFIGURAÇÕES",
			settings_display: "Modo de Exibição",
			disp_window: "Janela",
			disp_borderless: "Sem Bordas",
			disp_fullscreen: "Tela Cheia",
			settings_resolution: "Resolução",
			settings_audio: "Áudio & Jukebox",
			audio_music: "Música",
			audio_music_volume: "Volume da Música",
			audio_sfx: "Efeitos Sonoros",
			audio_sfx_volume: "Volume dos Efeitos",
			audio_jukebox: "Faixa da Jukebox",
			track_all: "♦ Todas as Músicas (Loop & Aleatório)",
			track_gwent_main: "1. How About a Round of Gwent (Tema Principal)",
			track_plots: "2. Plots and Intrigues",
			track_northern: "3. Reinos do Norte",
			track_nilfgaard: "4. Nilfgaard (The Black Clads)",
			track_witcher_forest: "5. Bosques de Kaer Morhen",
			track_witcher_ocean: "6. Ventos e Mares de Skellige",
			settings_language: "Idioma",
			lang_en: "English",
			lang_pt: "Português (Brasil)",
			lang_es: "Español",
			lang_pl: "Polski",
			btn_back: "← Voltar",
			btn_save: "Salvar e Fechar",

			// Credits
			credits_title: "CRÉDITOS",
			credits_cdpr_title: "CD Projekt Red",
			credits_cdpr_role: "Criadora Original de Gwent & The Witcher 3: Wild Hunt",
			credits_cdpr_desc: "Por conceber o lendário universo de Geralt de Rívia e criar este clássico minigame de cartas que conquistou milhões de jogadores ao redor do mundo.",
			credits_arun_title: "Arun Sundaram",
			credits_arun_role: "Autor do Remake Web (arunsundaram.com)",
			credits_arun_desc: "Pela brilhante recriação da lógica de regras, IA de cartas e animações do Gwent em HTML/JS para navegadores.",
			credits_creator_title: "Criador do Projeto Desktop",
			credits_creator_role: "Edição Executável, Launcher Nativo & Expansões",
			credits_creator_desc: "Por fazer este projeto ir além: engenharia reversa do pacote web, criação do executável nativo offline (.exe) para Windows, implementação da trilha sonora offline (Jukebox), criação do Menu Principal, seletor de dificuldade da IA e suporte a múltiplos idiomas.",

			// Board & Tooltips
			player_name: "Geralt",
			opponent_name: "Adversário",
			passed_label: "Passou",
			btn_pass: "Passar",
			btn_forfeit: "Desistir",
			title_pass_round: "Passar rodada",
			title_forfeit_game: "Desistir da partida",
			title_exit_game: "Sair do jogo",
			btn_return_lobby: "Voltar à Sala",
			forfeit_popup_title: "Desistir da Partida?",
			forfeit_popup_desc: "Você perderá a partida atual imediatamente.",
			forfeit_popup_desc_versus: "Se você desistir agora, a vitória será concedida imediatamente ao seu adversário.",
			forfeit_popup_resume: "Continuar Partida",
			forfeit_popup_confirm: "🏳 Desistir",
			title_view_leader: "Ver líder",
			title_play_leader: "Jogar líder",
			title_view_discards: "Ver descartes",
			title_toggle_music: "Alternar música",
			title_toggle_sfx: "Alternar efeitos sonoros",
			title_toggle_notif: "Alternar mensagens de jogo",

			// End Screen
			round_1: "Rodada 1",
			round_2: "Rodada 2",
			round_3: "Rodada 3",
			end_draw_desc: "A batalha não pode terminar em empate. Você pode jogar uma revanche com os mesmos baralhos ou render-se.",
			btn_customize: "Personalizar",
			btn_rematch: "Revanche",
			btn_new_game: "Novo Jogo",

			// Deck Customization Screen
			btn_main_menu: "Menu Principal",
			btn_start_game: "Iniciar Jogo",
			btn_change_faction: "Mudar Facção",
			btn_upload_deck: "Carregar Baralho",
			btn_download_deck: "Salvar Baralho",
			card_collection: "Coleção de Cartas",
			cards_in_deck: "Cartas no Baralho",
			leader_label: "Líder",
			deck_stats_header: "Resumo do Baralho",
			deck_total_cards: "Total de cartas no baralho",
			deck_unit_cards: "Número de Cartas de Unidade",
			deck_special_cards: "Cartas Especiais",
			deck_strength: "Poder Total das Unidades",
			deck_hero_cards: "Cartas de Herói",
			op_deck: "Baralho do Adversário",
			random_label: "Aleatório",
			title_view_opponent: "Ver adversário",
			title_upload_opponent: "Carregar adversário",
			title_clear_opponent: "Limpar adversário",
			warn_min_units: "Seu baralho deve ter pelo menos 15 cartas de unidade.",
			warn_max_specials: "Seu baralho não pode ter mais de 10 cartas especiais.",
			redraw_title: "Escolha até 2 cartas para trocar.",
			view_opponent_deck_title: "Baralho do adversário",
			err_deck_format: "O baralho carregado não está formatado corretamente!",
			err_deck_parse: "Não foi possível processar o baralho!",
			confirm_import_deck: "Continuar importando o baralho?",
			filter_all: "Todas as Cartas",
			filter_close: "Corpo a Corpo",
			filter_ranged: "Longa Distância",
			filter_siege: "Cerco",
			filter_special: "Especiais & Clima",
			filter_hero: "Cartas Herói",
			select_opponent_title: "ESCOLHER BARALHO ADVERSÁRIO",
			select_opponent_desc: "Selecione qual facção você deseja enfrentar na partida:",
			opponent_random_desc: "Facção e líder escolhidos ao acaso",
			btn_change_opponent: "Escolher Adversário",
			btn_import_json: "Importar JSON",
			custom_deck_label: "Baralho Personalizado",
			leader_change_hint: "Clique para trocar de Líder",
			btn_confirm: "Confirmar",

			// Popups & Dialogs
			exit_popup_title: "Abandonar a partida atual?",
			exit_popup_desc: "Isso retornará você ao menu de escolha de cartas.",
			exit_popup_resume: "Retomar",
			exit_popup_exit: "Sair",
			scoiatael_popup_title: "Deseja começar jogando?",
			scoiatael_popup_desc: "A habilidade da facção Scoia'tael permite que você decida quem joga primeiro.",
			scoiatael_popup_yes: "Começar",
			scoiatael_popup_no: "Deixar Adversário Começar",
			btn_yes: "Sim",
			btn_no: "Não",

			// Floating Notifications
			notif_me_first: "Você começará jogando",
			notif_op_first: "O adversário começará jogando",
			notif_me_coin: "Você começará jogando",
			notif_op_coin: "O adversário começará jogando",
			notif_round_start: "Início da Rodada",
			notif_me_pass: "Rodada passada",
			notif_op_pass: "O adversário passou",
			notif_win_round: "Você venceu a rodada!",
			notif_lose_round: "O adversário venceu a rodada",
			notif_draw_round: "A rodada terminou em empate",
			notif_me_turn: "Seu turno!",
			notif_op_turn: "Turno do adversário",
			notif_north: "Habilidade dos Reinos do Norte ativada - compra uma carta adicional.",
			notif_monsters: "Habilidade de Monstros ativada - uma unidade aleatória permanece em campo.",
			notif_scoiatael: "O adversário usou a habilidade de Scoia'tael para começar jogando.",
			notif_skellige_op: "Habilidade de Skellige do adversário ativada!",
			notif_skellige_me: "Habilidade de Skellige ativada!",

			// Factions
			faction_realms_name: "Reinos do Norte",
			faction_realms_desc: "Compre uma carta do seu baralho sempre que vencer uma rodada.",
			faction_nilfgaard_name: "Império de Nilfgaard",
			faction_nilfgaard_desc: "Vence qualquer rodada que termine em empate.",
			faction_monsters_name: "Monstros",
			faction_monsters_desc: "Mantém uma carta de unidade aleatória em campo após cada rodada.",
			faction_scoiatael_name: "Scoia'tael",
			faction_scoiatael_desc: "Decide quem joga o primeiro turno.",
			faction_skellige_name: "Skellige",
			faction_skellige_desc: "2 cartas aleatórias do cemitério são colocadas no campo de batalha no início da terceira rodada.",

			// Card Abilities
			ability_leader_name: "Habilidade de Líder",
			ability_hero_name: "Herói",
			ability_hero_desc: "Não é afetado por nenhuma carta especial ou habilidade. ",
			ability_decoy_name: "Isca",
			ability_decoy_desc: "Troque por uma carta no campo de batalha para devolvê-la à sua mão. ",
			ability_horn_name: "Corneta do Comandante",
			ability_horn_desc: "Dobra a força de todas as cartas de unidade nessa fileira. Limite de 1 por fileira. ",
			ability_clear_name: "Tempo Limpo",
			ability_clear_desc: "Remove todos os efeitos de cartas climáticas (Frio Congelante, Névoa Impenetrável e Chuva Torrencial). ",
			ability_frost_name: "Frio Congelante",
			ability_frost_desc: "Reduz a força de todas as cartas de combate corpo a corpo para 1 para ambos os jogadores. ",
			ability_fog_name: "Névoa Impenetrável",
			ability_fog_desc: "Reduz a força de todas as cartas de combate à distância para 1 para ambos os jogadores. ",
			ability_rain_name: "Chuva Torrencial",
			ability_rain_desc: "Reduz a força de todas as cartas de cerco para 1 para ambos os jogadores. ",
			ability_storm_name: "Tempestade de Skellige",
			ability_storm_desc: "Reduz a força de todas as unidades de combate à distância e cerco para 1. ",
			ability_mardroeme_name: "Mardroeme",
			ability_mardroeme_desc: "Provoca a transformação de todas as cartas Berserker na mesma fileira. ",
			ability_berserker_name: "Berserker",
			ability_berserker_desc: "Transforma-se em um urso quando uma carta Mardroeme está na sua fileira. ",
			ability_scorch_name: "Queimar",
			ability_scorch_desc: "Descarta após jogar. Destrói a(s) carta(s) mais forte(s) no campo de batalha. ",
			ability_scorch_c_name: "Queimar - Combate Corpo a Corpo",
			ability_scorch_c_desc: "Destrói a(s) unidade(s) de combate corpo a corpo mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais. ",
			ability_scorch_r_name: "Queimar - Longa Distância",
			ability_scorch_r_desc: "Destrói a(s) unidade(s) de combate à distância mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais. ",
			ability_scorch_s_name: "Queimar - Cerco",
			ability_scorch_s_desc: "Destrói a(s) unidade(s) de cerco mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais. ",
			ability_agile_name: "Ágil",
			ability_agile_desc: "Pode ser posicionado na fileira de combate corpo a corpo ou longa distância. Não pode ser movido após jogado. ",
			ability_muster_name: "Reunir",
			ability_muster_desc: "Encontra cartas com o mesmo nome no seu baralho e as joga instantaneamente. ",
			ability_spy_name: "Espião",
			ability_spy_desc: "Coloca no campo do adversário (conta para a pontuação dele) e compra 2 cartas do seu baralho. ",
			ability_medic_name: "Médico",
			ability_medic_desc: "Escolha uma carta da sua pilha de descarte e jogue-a instantaneamente (exceto Heróis ou Cartas Especiais). ",
			ability_morale_name: "Moral",
			ability_morale_desc: "Adiciona +1 a todas as unidades na fileira (exceto ela mesma). ",
			ability_bond_name: "Elo Estreito",
			ability_bond_desc: "Coloque ao lado de uma carta com o mesmo nome para dobrar a força de ambas. ",
			ability_avenger_name: "Vingador",
			ability_avenger_desc: "Quando esta carta é removida do campo, ela invoca uma poderosa nova unidade em seu lugar. ",

			// Leader Abilities
			ability_foltest_king_desc: "Pega uma carta Névoa Impenetrável do seu baralho e joga-a instantaneamente.",
			ability_foltest_lord_desc: "Limpa quaisquer efeitos climáticos (Frio Congelante, Chuva Torrencial ou Névoa Impenetrável) em jogo.",
			ability_foltest_siegemaster_desc: "Dobra a força de todas as suas unidades de cerco (a menos que uma Corneta do Comandante já esteja presente nessa fileira).",
			ability_foltest_steelforged_desc: "Destrói a(s) unidade(s) de cerco mais forte(s) do inimigo se a força total de cerco dele for 10 ou mais.",
			ability_foltest_son_desc: "Destrói a(s) unidade(s) de longa distância mais forte(s) do inimigo se a força total dessa fileira for 10 ou mais.",
			ability_emhyr_imperial_desc: "Pega uma carta Chuva Torrencial do seu baralho e joga-a instantaneamente.",
			ability_emhyr_emperor_desc: "Olha 3 cartas aleatórias da mão do seu adversário.",
			ability_emhyr_whiteflame_desc: "Cancela a habilidade de líder do seu adversário.",
			ability_emhyr_relentless_desc: "Compra uma carta da pilha de descarte do adversário.",
			ability_emhyr_invader_desc: "Habilidades que ressuscitam uma unidade no campo ressuscitam uma unidade aleatória. Afeta ambos os jogadores.",
			ability_eredin_commander_desc: "Dobra a força de todas as suas unidades de combate corpo a corpo (a menos que uma Corneta do Comandante já esteja presente nessa fileira).",
			ability_eredin_bringer_of_death_desc: "Devolve uma carta da sua pilha de descarte para a sua mão.",
			ability_eredin_destroyer_desc: "Descarta 2 cartas e compra 1 carta à sua escolha do seu baralho.",
			ability_eredin_king_desc: "Pega qualquer carta climática do seu baralho e joga-a instantaneamente.",
			ability_eredin_treacherous_desc: "Dobra a força de todas as cartas de espião (afeta ambos os jogadores).",
			ability_francesca_queen_desc: "Destrói a(s) unidade(s) de combate corpo a corpo mais forte(s) do inimigo se a força total corpo a corpo dele for 10 ou mais.",
			ability_francesca_beautiful_desc: "Dobra a força de todas as suas unidades de combate à distância (a menos que uma Corneta do Comandante já esteja presente nessa fileira).",
			ability_francesca_daisy_desc: "Compra uma carta extra no início da batalha.",
			ability_francesca_pureblood_desc: "Pega uma carta Frio Congelante do seu baralho e joga-a instantaneamente.",
			ability_francesca_hope_desc: "Move unidades ágeis para a fileira que maximiza sua força (não move unidades já na fileira ideal).",
			ability_crach_an_craite_desc: "Embaralha todas as cartas dos cemitérios de ambos os jogadores de volta para seus baralhos.",
			ability_king_bran_desc: "Unidades perdem apenas metade da sua Força sob condições climáticas adversas.",

			// Controller / Gamepad HUD Prompts
			pad_connected: "Controle Conectado",
			pad_disconnected: "Controle Desconectado",
			pad_navigate_hand: "Cartas",
			pad_play_card: "Jogar Carta",
			pad_pass: "Passar",
			pad_leader: "Líder",
			pad_menu: "Menu",
			pad_choose_row: "Escolher Fileira",
			pad_confirm: "Confirmar",
			pad_cancel: "Cancelar",
			pad_switch_panel: "Alternar Painel",
			pad_select: "Selecionar",
			pad_change_faction: "Facção",
			pad_start_game: "Iniciar Jogo",
			pad_back: "Voltar"
		},

		es: {
			// Brand
			game_title: "GWENT",
			game_subtitle: "EL JUEGO DE CARTAS DE THE WITCHER",

			// Main Menu
			menu_story_mode: "Modo Historia",
			menu_continue_story: "Continuar Viaje",
			menu_play: "Jugar Gwent",
			menu_achievements: "Logros",
			menu_settings: "Ajustes",
			menu_credits: "Créditos",
			menu_quit: "Salir del Juego",

			// Achievements
			achievements_title: "LOGROS",
			ach_filter_all: "Todos",
			ach_filter_unlocked: "Desbloqueados",
			ach_filter_locked: "Bloqueados",

			// Difficulty
			menu_difficulty: "Seleccionar Dificultad",
			diff_easy: "Fácil",
			diff_easy_desc: "Oponente casual con estrategia relajada",
			diff_medium: "Medio",
			diff_medium_desc: "El desafío clásico de The Witcher 3",
			diff_hard: "Difícil",
			diff_hard_desc: "Inteligencia táctica implacable y jugadas óptimas",

			// Settings
			settings_title: "AJUSTES",
			settings_display: "Modo de Pantalla",
			disp_window: "Ventana",
			disp_borderless: "Sin bordes",
			disp_fullscreen: "Pantalla completa",
			settings_resolution: "Resolución",
			settings_audio: "Audio y Jukebox",
			audio_music: "Música",
			audio_music_volume: "Volumen de Música",
			audio_sfx: "Efectos de Sonido",
			audio_sfx_volume: "Volumen de Efectos",
			audio_jukebox: "Pista de Jukebox",
			track_all: "♦ Todas las pistas (Bucle y Aleatorio)",
			track_gwent_main: "1. How About a Round of Gwent (Tema Principal)",
			track_plots: "2. Plots and Intrigues",
			track_northern: "3. Reinos del Norte",
			track_nilfgaard: "4. Nilfgaard (The Black Clads)",
			track_witcher_forest: "5. Bosques de Kaer Morhen",
			track_witcher_ocean: "6. Vientos y Mares de Skellige",
			settings_language: "Idioma",
			lang_en: "English",
			lang_pt: "Português (Brasil)",
			lang_es: "Español",
			lang_pl: "Polski",
			btn_back: "← Volver",
			btn_save: "Guardar y Cerrar",

			// Credits
			credits_title: "CRÉDITOS",
			credits_cdpr_title: "CD Projekt Red",
			credits_cdpr_role: "Creadores originales de Gwent & The Witcher 3: Wild Hunt",
			credits_cdpr_desc: "Por dar vida al increíble mundo de Geralt de Rivia y crear el inolvidable minijuego de cartas.",
			credits_arun_title: "Arun Sundaram",
			credits_arun_role: "Autor del Remake Web (arunsundaram.com)",
			credits_arun_desc: "Por programar la lógica del juego, inteligencia artificial y animaciones en navegadores.",
			credits_creator_title: "Creador del Proyecto Desktop",
			credits_creator_role: "Edición Ejecutable, Launcher y Expansiones",
			credits_creator_desc: "Por llevar el proyecto más allá: ingeniería inversa, ejecutable nativo offline, Jukebox con música original, menú principal, selector de dificultad y soporte multilingüe.",

			// Board & Tooltips
			player_name: "Geralt",
			opponent_name: "Oponente",
			passed_label: "Pasó",
			btn_pass: "Pasar",
			btn_forfeit: "Rendirse",
			title_pass_round: "Pasar ronda",
			title_forfeit_game: "Rendirse en la partida",
			title_exit_game: "Salir del juego",
			btn_return_lobby: "Volver a la Sala",
			forfeit_popup_title: "¿Rendirse en la Partida?",
			forfeit_popup_desc: "Perderás la partida actual inmediatamente.",
			forfeit_popup_desc_versus: "Si te rindes ahora, la victoria será concedida inmediatamente a tu oponente.",
			forfeit_popup_resume: "Continuar Partida",
			forfeit_popup_confirm: "🏳 Rendirse",
			title_view_leader: "Ver líder",
			title_play_leader: "Jugar líder",
			title_view_discards: "Ver descartes",
			title_toggle_music: "Alternar música",
			title_toggle_sfx: "Alternar efectos de sonido",
			title_toggle_notif: "Alternar mensajes del juego",

			// End Screen
			round_1: "Ronda 1",
			round_2: "Ronda 2",
			round_3: "Ronda 3",
			end_draw_desc: "La batalla no puede terminar en empate. Puedes jugar una revancha con los mismos mazos o rendirte.",
			btn_customize: "Personalizar",
			btn_rematch: "Revancha",
			btn_new_game: "Nueva Partida",

			// Deck Customization Screen
			btn_main_menu: "Menú Principal",
			btn_start_game: "Comenzar Juego",
			btn_change_faction: "Cambiar Facción",
			btn_upload_deck: "Cargar Baraja",
			btn_download_deck: "Guardar Baraja",
			card_collection: "Colección de Cartas",
			cards_in_deck: "Cartas en el Mazo",
			leader_label: "Líder",
			deck_stats_header: "Resumen de la Baraja",
			deck_total_cards: "Total de cartas en el mazo",
			deck_unit_cards: "Cartas de Unidad",
			deck_special_cards: "Cartas Especiales",
			deck_strength: "Fuerza Total de Unidades",
			deck_hero_cards: "Cartas de Héroe",
			op_deck: "Mazo del Oponente",
			random_label: "Aleatorio",
			title_view_opponent: "Ver oponente",
			title_upload_opponent: "Cargar oponente",
			title_clear_opponent: "Limpiar oponente",
			warn_min_units: "Tu mazo debe tener al menos 15 cartas de unidad.",
			warn_max_specials: "Tu mazo no debe tener más de 10 cartas especiales.",
			redraw_title: "Elige hasta 2 cartas para cambiar.",
			view_opponent_deck_title: "Mazo del oponente",
			err_deck_format: "¡El mazo cargado no tiene un formato correcto!",
			err_deck_parse: "¡No se pudo procesar el archivo del mazo!",
			confirm_import_deck: "¿Continuar importando el mazo?",
			filter_all: "Todas las Cartas",
			filter_close: "Cuerpo a Cuerpo",
			filter_ranged: "A Distancia",
			filter_siege: "Asedio",
			filter_special: "Especiales y Clima",
			filter_hero: "Cartas de Héroe",
			select_opponent_title: "ELEGIR BARAJA RIVAL",
			select_opponent_desc: "Selecciona a qué facción deseas enfrentarte en batalla:",
			opponent_random_desc: "Facción y líder elegidos al azar",
			btn_change_opponent: "Elegir Rival",
			btn_import_json: "Importar JSON",
			custom_deck_label: "Baraja Personalizada",
			leader_change_hint: "Haz clic para cambiar de Líder",
			btn_confirm: "Confirmar",

			// Popups & Dialogs
			exit_popup_title: "¿Abandonar la partida actual?",
			exit_popup_desc: "Esto te devolverá al menú de personalización de mazos.",
			exit_popup_resume: "Continuar",
			exit_popup_exit: "Salir",
			scoiatael_popup_title: "¿Deseas empezar primero?",
			scoiatael_popup_desc: "La habilidad de facción Scoia'tael te permite decidir quién juega primero.",
			scoiatael_popup_yes: "Empezar",
			scoiatael_popup_no: "Dejar que el oponente empiece",
			btn_yes: "Sí",
			btn_no: "No",

			// Floating Notifications
			notif_me_first: "Tú empezarás primero",
			notif_op_first: "El oponente empezará primero",
			notif_me_coin: "Tú empezarás primero",
			notif_op_coin: "El oponente empezará primero",
			notif_round_start: "Inicio de Ronda",
			notif_me_pass: "Ronda pasada",
			notif_op_pass: "El oponente ha pasado",
			notif_win_round: "¡Ganaste la ronda!",
			notif_lose_round: "El oponente ganó la ronda",
			notif_draw_round: "La ronda terminó en empate",
			notif_me_turn: "¡Tu turno!",
			notif_op_turn: "Turno del oponente",
			notif_north: "Habilidad de los Reinos del Norte activada - roba una carta adicional.",
			notif_monsters: "Habilidad de Monstruos activada - una unidad aleatoria permanece en el campo.",
			notif_scoiatael: "El oponente usó la habilidad de Scoia'tael para empezar primero.",
			notif_skellige_op: "¡Habilidad de Skellige del oponente activada!",
			notif_skellige_me: "¡Habilidad de Skellige activada!",

			// Factions
			faction_realms_name: "Reinos del Norte",
			faction_realms_desc: "Roba una carta de tu mazo cada vez que ganes una ronda.",
			faction_nilfgaard_name: "Imperio de Nilfgaard",
			faction_nilfgaard_desc: "Gana cualquier ronda que termine en empate.",
			faction_monsters_name: "Monstruos",
			faction_monsters_desc: "Mantiene una carta de unidad aleatoria en el campo tras cada ronda.",
			faction_scoiatael_name: "Scoia'tael",
			faction_scoiatael_desc: "Decide quién juega el primer turno.",
			faction_skellige_name: "Skellige",
			faction_skellige_desc: "2 cartas aleatorias del cementerio se colocan en el campo de batalla al inicio de la tercera ronda.",

			// Card Abilities
			ability_leader_name: "Habilidad de Líder",
			ability_hero_name: "Héroe",
			ability_hero_desc: "No se ve afectado por cartas especiales ni habilidades. ",
			ability_decoy_name: "Señuelo",
			ability_decoy_desc: "Intercambia con una carta en el campo de batalla para devolverla a tu mano. ",
			ability_horn_name: "Cuerno de comandante",
			ability_horn_desc: "Duplica la fuerza de todas las cartas de unidad en esa fila. Máximo 1 por fila. ",
			ability_clear_name: "Clima despejado",
			ability_clear_desc: "Elimina todos los efectos de cartas de clima (Frío penetrante, Niebla impenetrable y Lluvia torrencial). ",
			ability_frost_name: "Frío penetrante",
			ability_frost_desc: "Establece la fuerza de todas las cartas de combate cuerpo a cuerpo en 1 para ambos jugadores. ",
			ability_fog_name: "Niebla impenetrable",
			ability_fog_desc: "Establece la fuerza de todas las cartas de combate a distancia en 1 para ambos jugadores. ",
			ability_rain_name: "Lluvia torrencial",
			ability_rain_desc: "Establece la fuerza de todas las cartas de asedio en 1 para ambos jugadores. ",
			ability_storm_name: "Tormenta de Skellige",
			ability_storm_desc: "Reduce la fuerza de todas las unidades a distancia y asedio a 1. ",
			ability_mardroeme_name: "Mardroeme",
			ability_mardroeme_desc: "Activa la transformación de todas las cartas Berserker de la misma fila. ",
			ability_berserker_name: "Berserker",
			ability_berserker_desc: "Se transforma en oso cuando hay una carta Mardroeme en su fila. ",
			ability_scorch_name: "Abrasador",
			ability_scorch_desc: "Se descarta tras jugar. Destruye la(s) carta(s) más fuerte(s) del campo de batalla. ",
			ability_scorch_c_name: "Abrasador - Combate cuerpo a cuerpo",
			ability_scorch_c_desc: "Destruye la(s) unidad(es) de combate cuerpo a cuerpo más fuerte(s) del enemigo si la fuerza combinada es de 10 o más. ",
			ability_scorch_r_name: "Abrasador - A distancia",
			ability_scorch_r_desc: "Destruye la(s) unidad(es) de combate a distancia más fuerte(s) del enemigo si la fuerza combinada es de 10 o más. ",
			ability_scorch_s_name: "Abrasador - Asedio",
			ability_scorch_s_desc: "Destruye la(s) unidad(es) de asedio más fuerte(s) del enemigo si la fuerza combinada es de 10 o más. ",
			ability_agile_name: "Ágil",
			ability_agile_desc: "Se puede colocar en la fila de combate cuerpo a cuerpo o a distancia. No se puede mover una vez colocado. ",
			ability_muster_name: "Reagrupamiento",
			ability_muster_desc: "Busca cartas con el mismo nombre en tu mazo y las juega al instante. ",
			ability_spy_name: "Espía",
			ability_spy_desc: "Coloca en el campo de batalla enemigo (suma a su total) y roba 2 cartas de tu mazo. ",
			ability_medic_name: "Médico",
			ability_medic_desc: "Elige una carta de tu pila de descarte y juégala al instante (sin Héroes ni Cartas Especiales). ",
			ability_morale_name: "Moral",
			ability_morale_desc: "Añade +1 a todas las unidades de la fila (excepto a sí misma). ",
			ability_bond_name: "Vínculo estrecho",
			ability_bond_desc: "Coloca junto a una carta con el mismo nombre para duplicar la fuerza de ambas. ",
			ability_avenger_name: "Vengador",
			ability_avenger_desc: "Cuando esta carta es retirada del campo, invoca una poderosa nueva unidad en su lugar. ",

			// Leader Abilities
			ability_foltest_king_desc: "Elige una carta Niebla impenetrable de tu mazo y la juega al instante.",
			ability_foltest_lord_desc: "Limpia cualquier efecto de clima (Frío penetrante, Lluvia torrencial o Niebla impenetrable) en juego.",
			ability_foltest_siegemaster_desc: "Duplica la fuerza de todas tus unidades de asedio (salvo que ya haya un Cuerno de comandante en esa fila).",
			ability_foltest_steelforged_desc: "Destruye la(s) unidad(es) de asedio más fuerte(s) del enemigo si la fuerza total es de 10 o más.",
			ability_foltest_son_desc: "Destruye la(s) unidad(es) a distancia más fuerte(s) del enemigo si la fuerza total es de 10 o más.",
			ability_emhyr_imperial_desc: "Elige una carta Lluvia torrencial de tu mazo y la juega al instante.",
			ability_emhyr_emperor_desc: "Mira 3 cartas aleatorias de la mano de tu oponente.",
			ability_emhyr_whiteflame_desc: "Cancela la habilidad de líder de tu oponente.",
			ability_emhyr_relentless_desc: "Roba una carta de la pila de descarte del oponente.",
			ability_emhyr_invader_desc: "Las habilidades que restauran unidades traen una unidad al azar. Afecta a ambos jugadores.",
			ability_eredin_commander_desc: "Duplica la fuerza de todas tus unidades cuerpo a cuerpo (salvo que ya haya un Cuerno de comandante en esa fila).",
			ability_eredin_bringer_of_death_desc: "Recupera una carta de tu pila de descarte a tu mano.",
			ability_eredin_destroyer_desc: "Descarta 2 cartas y roba 1 carta a tu elección de tu mazo.",
			ability_eredin_king_desc: "Elige cualquier carta de clima de tu mazo y juégala al instante.",
			ability_eredin_treacherous_desc: "Duplica la fuerza de todas las cartas de espía (afecta a ambos jugadores).",
			ability_francesca_queen_desc: "Destruye la(s) unidad(es) cuerpo a cuerpo más fuerte(s) del enemigo si la fuerza total es de 10 o más.",
			ability_francesca_beautiful_desc: "Duplica la fuerza de todas tus unidades a distancia (salvo que ya haya un Cuerno de comandante en esa fila).",
			ability_francesca_daisy_desc: "Roba una carta adicional al inicio de la batalla.",
			ability_francesca_pureblood_desc: "Elige una carta Frío penetrante de tu mazo y juégala al instante.",
			ability_francesca_hope_desc: "Mueve unidades ágiles a la fila que maximice su fuerza.",
			ability_crach_an_craite_desc: "Baraja todas las cartas de los cementerios de ambos jugadores de vuelta a sus mazos.",
			ability_king_bran_desc: "Las unidades solo pierden la mitad de su Fuerza en condiciones de mal clima.",

			// Controller / Gamepad HUD Prompts
			pad_connected: "Mando Conectado",
			pad_disconnected: "Mando Desconectado",
			pad_navigate_hand: "Cartas",
			pad_play_card: "Jugar Carta",
			pad_pass: "Pasar",
			pad_leader: "Líder",
			pad_menu: "Menú",
			pad_choose_row: "Elegir Fila",
			pad_confirm: "Confirmar",
			pad_cancel: "Cancelar",
			pad_switch_panel: "Cambiar Panel",
			pad_select: "Seleccionar",
			pad_change_faction: "Facción",
			pad_start_game: "Empezar Partida",
			pad_back: "Atrás"
		},

		pl: {
			// Brand
			game_title: "GWINT",
			game_subtitle: "WIEDŹMIŃSKA GRA KARCIANA",

			// Main Menu
			menu_story_mode: "Tryb Opowieści",
			menu_continue_story: "Kontynuuj Podróż",
			menu_play: "Zagraj w Gwinta",
			menu_achievements: "Osiągnięcia",
			menu_settings: "Ustawienia",
			menu_credits: "Twórcy",
			menu_quit: "Wyjdź z Gry",

			// Achievements
			achievements_title: "OSIĄGNIĘCIA",
			ach_filter_all: "Wszystkie",
			ach_filter_unlocked: "Odblokowane",
			ach_filter_locked: "Zablokowane",

			// Difficulty
			menu_difficulty: "Wybierz Poziom Trudności",
			diff_easy: "Łatwy",
			diff_easy_desc: "Spokojny przeciwnik i łagodniejsza strategia",
			diff_medium: "Średni",
			diff_medium_desc: "Klasyczne wyzwanie SI z Wiedźmina 3",
			diff_hard: "Trudny",
			diff_hard_desc: "Bezwzględna taktyka i optymalne zagrania",

			// Settings
			settings_title: "USTAWIENIA",
			settings_display: "Tryb Wyświetlania",
			disp_window: "W oknie",
			disp_borderless: "Bez ramek",
			disp_fullscreen: "Pełny ekran",
			settings_resolution: "Rozdzielczość",
			settings_audio: "Dźwięk i Szafa Grająca",
			audio_music: "Muzyka",
			audio_music_volume: "Głośność Muzyki",
			audio_sfx: "Efekty Dźwiękowe",
			audio_sfx_volume: "Głośność Efektów",
			audio_jukebox: "Utwór w Szafie",
			track_all: "♦ Wszystkie Utwory (Losowo)",
			track_gwent_main: "1. How About a Round of Gwent (Motyw Główny)",
			track_plots: "2. Plots and Intrigues",
			track_northern: "3. Królestwa Północy",
			track_nilfgaard: "4. Nilfgaard (The Black Clads)",
			track_witcher_forest: "5. Lasy Kaer Morhen",
			track_witcher_ocean: "6. Wiatry i Oceany Skellige",
			settings_language: "Język",
			lang_en: "English",
			lang_pt: "Português (Brasil)",
			lang_es: "Español",
			lang_pl: "Polski",
			btn_back: "← Wstecz",
			btn_save: "Zapisz i Zamknij",

			// Credits
			credits_title: "TWÓRCY",
			credits_cdpr_title: "CD Projekt Red",
			credits_cdpr_role: "Twórcy Gwinta i Wiedźmina 3: Dziki Gon",
			credits_cdpr_desc: "Za stworzenie legendarnego uniwersum wiedźmińskiego i genialnej karcianki Gwint.",
			credits_arun_title: "Arun Sundaram",
			credits_arun_role: "Autor Web Remake (arunsundaram.com)",
			credits_arun_desc: "Za wierne odtworzenie logiki gry, SI i mechaniki Gwinta w przeglądarce.",
			credits_creator_title: "Twórca Wersji Desktop",
			credits_creator_role: "Wersja Wykonywalna, Launcher i Rozszerzenia",
			credits_creator_desc: "Za rozwinięcie projektu: inżynierię wsteczną, samodzielny plik .exe, szafę grającą z muzyką offline, menu główne, poziomy trudności i lokalizację.",

			// Board & Tooltips
			player_name: "Geralt",
			opponent_name: "Przeciwnik",
			passed_label: "Spasowano",
			btn_pass: "Pas",
			btn_forfeit: "Poddaj się",
			title_pass_round: "Spasuj rundę",
			title_forfeit_game: "Poddaj partię",
			title_exit_game: "Wyjdź z gry",
			btn_return_lobby: "Wróć do Pokoju",
			forfeit_popup_title: "Poddać Partię?",
			forfeit_popup_desc: "Natychmiast przegrasz obecną partię.",
			forfeit_popup_desc_versus: "Jeśli poddasz się teraz, zwycięstwo zostanie natychmiast przyznane przeciwnikowi.",
			forfeit_popup_resume: "Kontynuuj Grę",
			forfeit_popup_confirm: "🏳 Poddaj się",
			title_view_leader: "Zobacz dowódcę",
			title_play_leader: "Zagraj kartę dowódcy",
			title_view_discards: "Zobacz odrzucone karty",
			title_toggle_music: "Włącz/wyłącz muzykę",
			title_toggle_sfx: "Włącz/wyłącz efekty dźwiękowe",
			title_toggle_notif: "Włącz/wyłącz powiadomienia",

			// End Screen
			round_1: "Runda 1",
			round_2: "Ronda 2",
			round_3: "Runda 3",
			end_draw_desc: "Bitwa nie może zakończyć się remisem. Możesz rozegrać rewanż tymi samymi taliami lub się poddać.",
			btn_customize: "Dostosuj",
			btn_rematch: "Rewanż",
			btn_new_game: "Nowa Gra",

			// Deck Customization Screen
			btn_main_menu: "Menu Główne",
			btn_start_game: "Rozpocznij Grę",
			btn_change_faction: "Zmień Frakcję",
			btn_upload_deck: "Wczytaj Talię",
			btn_download_deck: "Zapisz Talię",
			card_collection: "Kolekcja Kart",
			cards_in_deck: "Karty w Talii",
			leader_label: "Dowódca",
			deck_stats_header: "Podsumowanie Talii",
			deck_total_cards: "Łączna liczba kart w talii",
			deck_unit_cards: "Liczba Kart Jednostek",
			deck_special_cards: "Karty Specjalne",
			deck_strength: "Łączna Siła Jednostek",
			deck_hero_cards: "Karty Bohaterów",
			op_deck: "Talia Przeciwnika",
			random_label: "Losowo",
			title_view_opponent: "Zobacz przeciwnika",
			title_upload_opponent: "Wczytaj przeciwnika",
			title_clear_opponent: "Wyczyść przeciwnika",
			warn_min_units: "Twoja talia musi zawierać co najmniej 15 kart jednostek.",
			warn_max_specials: "Twoja talia nie może zawierać więcej niż 10 kart specjalnych.",
			redraw_title: "Wybierz do 2 kart do wymiany.",
			view_opponent_deck_title: "Talia przeciwnika",
			err_deck_format: "Wczytana talia ma nieprawidłowy format!",
			err_deck_parse: "Nie udało się odczytać pliku talii!",
			confirm_import_deck: "Kontynuować importowanie talii?",
			filter_all: "Wszystkie Karty",
			filter_close: "Walka Wręcz",
			filter_ranged: "Walka Dystansowa",
			filter_siege: "Oblężenie",
			filter_special: "Karty Specjalne i Pogoda",
			filter_hero: "Karty Bohaterów",
			select_opponent_title: "WYBIERZ TALIĘ PRZECIWNIKA",
			select_opponent_desc: "Wybierz frakcję, z którą chcesz się zmierzyć w bitwie:",
			opponent_random_desc: "Losowa frakcja i dowódca",
			btn_change_opponent: "Wybierz Przeciwnika",
			btn_import_json: "Importuj JSON",
			custom_deck_label: "Własna Talia",
			leader_change_hint: "Kliknij, aby zmienić Dowódcę",
			btn_confirm: "Zatwierdź",

			// Popups & Dialogs
			exit_popup_title: "Opuścić obecną grę?",
			exit_popup_desc: "Powrócisz do menu tworzenia talii.",
			exit_popup_resume: "Wznów",
			exit_popup_exit: "Wyjdź",
			scoiatael_popup_title: "Czy chcesz zacząć pierwszy?",
			scoiatael_popup_desc: "Zdolność frakcji Scoia'tael pozwala zdecydować, kto zaczyna grę.",
			scoiatael_popup_yes: "Zacznij pierwszy",
			scoiatael_popup_no: "Niech przeciwnik zacznie",
			btn_yes: "Tak",
			btn_no: "Nie",

			// Floating Notifications
			notif_me_first: "Zaczniesz pierwszy",
			notif_op_first: "Twój przeciwnik zacznie pierwszy",
			notif_me_coin: "Zaczniesz pierwszy",
			notif_op_coin: "Twój przeciwnik zacznie pierwszy",
			notif_round_start: "Początek Rundy",
			notif_me_pass: "Spasowano rundę",
			notif_op_pass: "Przeciwnik spasował",
			notif_win_round: "Wygrałeś rundę!",
			notif_lose_round: "Przeciwnik wygrał rundę",
			notif_draw_round: "Runda zakończyła się remisem",
			notif_me_turn: "Twoja tura!",
			notif_op_turn: "Tura przeciwnika",
			notif_north: "Zdolność Królestw Północy aktywna - dobierasz dodatkową kartę.",
			notif_monsters: "Zdolność Potworów aktywna - jedna losowa jednostka pozostaje na polu bitwy.",
			notif_scoiatael: "Przeciwnik użył zdolności Scoia'tael, aby zacząć pierwszy.",
			notif_skellige_op: "Zdolność Skellige przeciwnika aktywna!",
			notif_skellige_me: "Zdolność Skellige aktywna!",

			// Factions
			faction_realms_name: "Królestwa Północy",
			faction_realms_desc: "Dobierz kartę z talii po każdej wygranej rundzie.",
			faction_nilfgaard_name: "Cesarstwo Nilfgaardu",
			faction_nilfgaard_desc: "Wygrywa każdą rundę zakończoną remisem.",
			faction_monsters_name: "Potwory",
			faction_monsters_desc: "Zostawia jedną losową kartę jednostki na polu bitwy po każdej rundzie.",
			faction_scoiatael_name: "Scoia'tael",
			faction_scoiatael_desc: "Decyduje, kto rozpoczyna grę.",
			faction_skellige_name: "Skellige",
			faction_skellige_desc: "2 losowe karty z cmentarza są umieszczane na polu bitwy na początku trzeciej rundy.",

			// Card Abilities
			ability_leader_name: "Zdolność Dowódcy",
			ability_hero_name: "Bohater",
			ability_hero_desc: "Niewrażliwy na żadne karty specjalne ani umiejętności. ",
			ability_decoy_name: "Manekin",
			ability_decoy_desc: "Wymień na kartę z pola bitwy, aby zwrócić ją do ręki. ",
			ability_horn_name: "Róg dowódcy",
			ability_horn_desc: "Podwaja siłę wszystkich jednostek w tym rzędzie. Ograniczenie do 1 na rząd. ",
			ability_clear_name: "Czyste niebo",
			ability_clear_desc: "Usuwa wszystkie efekty kart pogody (Trzaskający mróz, Gęsta mgła i Ulewny deszcz). ",
			ability_frost_name: "Trzaskający mróz",
			ability_frost_desc: "Zmniejsza siłę wszystkich jednostek walki w zwarciu do 1 dla obu graczy. ",
			ability_fog_name: "Gęsta mgła",
			ability_fog_desc: "Zmniejsza siłę wszystkich jednostek walki na dystans do 1 dla obu graczy. ",
			ability_rain_name: "Ulewny deszcz",
			ability_rain_desc: "Zmniejsza siłę wszystkich jednostek oblężniczych do 1 dla obu graczy. ",
			ability_storm_name: "Sztorm ze Skellige",
			ability_storm_desc: "Zmniejsza siłę wszystkich jednostek walki na dystans i oblężniczych do 1. ",
			ability_mardroeme_name: "Mardroeme",
			ability_mardroeme_desc: "Wywołuje przemianę wszystkich Berserkerów w tym samym rzędzie. ",
			ability_berserker_name: "Berserker",
			ability_berserker_desc: "Zmienia się w niedźwiedzia, gdy w rzędzie znajduje się karta Mardroeme. ",
			ability_scorch_name: "Pożoga",
			ability_scorch_desc: "Odrzuć po zagraniu. Niszczy najsilniejsze karty na polu bitwy. ",
			ability_scorch_c_name: "Pożoga - Walka w zwarciu",
			ability_scorch_c_desc: "Niszczy najsilniejsze jednostki w zwarciu przeciwnika, jeśli ich łączna siła w rzędzie wynosi 10 lub więcej. ",
			ability_scorch_r_name: "Pożoga - Walka na dystans",
			ability_scorch_r_desc: "Niszczy najsilniejsze jednostki na dystans przeciwnika, jeśli ich łączna siła w rzędzie wynosi 10 lub więcej. ",
			ability_scorch_s_name: "Pożoga - Oblężenie",
			ability_scorch_s_desc: "Niszczy najsilniejsze jednostki oblężnicze przeciwnika, jeśli ich łączna siła w rzędzie wynosi 10 lub więcej. ",
			ability_agile_name: "Zwinność",
			ability_agile_desc: "Może zostać umieszczona w rzędzie walki w zwarciu lub walki na dystans. Po zagraniu nie można jej przenieść. ",
			ability_muster_name: "Braterstwo",
			ability_muster_desc: "Wyszukuje w talii karty o tej samej nazwie i natychmiast je zagrywa. ",
			ability_spy_name: "Szpieg",
			ability_spy_desc: "Umieszcza na polu przeciwnika (liczy się do jego wyniku) i dobiera 2 karty z twojej talii. ",
			ability_medic_name: "Medyk",
			ability_medic_desc: "Wybierz kartę ze swojego cmentarza i natychmiast ją zagraj (bez Bohaterów i Kart Specjalnych). ",
			ability_morale_name: "Wysokie morale",
			ability_morale_desc: "Dodaje +1 do siły wszystkim jednostkom w rzędzie (z wyjątkiem samej siebie). ",
			ability_bond_name: "Braterstwo broni",
			ability_bond_desc: "Umieść obok karty o tej samej nazwie, aby podwoić siłę obu kart. ",
			ability_avenger_name: "Mściciel",
			ability_avenger_desc: "Gdy ta karta zostanie usunięta z pola bitwy, przyzywa potężną nową jednostkę. ",

			// Leader Abilities
			ability_foltest_king_desc: "Wybierz z talii kartę Gęsta mgła i zagraj ją natychmiast.",
			ability_foltest_lord_desc: "Usuwa wszelkie efekty pogodowe (Trzaskający mróz, Ulewny deszcz lub Gęsta mgła) z gry.",
			ability_foltest_siegemaster_desc: "Podwaja siłę wszystkich twoich jednostek oblężniczych (chyba że w rzędzie znajduje się już Róg dowódcy).",
			ability_foltest_steelforged_desc: "Niszczy najsilniejsze jednostki oblężnicze przeciwnika, jeśli ich łączna siła wynosi 10 lub więcej.",
			ability_foltest_son_desc: "Niszczy najsilniejsze jednostki na dystans przeciwnika, jeśli ich łączna siła wynosi 10 lub więcej.",
			ability_emhyr_imperial_desc: "Wybierz z talii kartę Ulewny deszcz i zagraj ją natychmiast.",
			ability_emhyr_emperor_desc: "Podejrzyj 3 losowe karty z ręki przeciwnika.",
			ability_emhyr_whiteflame_desc: "Blokuje zdolność dowódcy przeciwnika.",
			ability_emhyr_relentless_desc: "Dobierz kartę z cmentarza przeciwnika.",
			ability_emhyr_invader_desc: "Zdolności wskrzeszające przywracają losową jednostkę. Działa na obu graczy.",
			ability_eredin_commander_desc: "Podwaja siłę wszystkich twoich jednostek walki w zwarciu (chyba że w rzędzie znajduje się Róg dowódcy).",
			ability_eredin_bringer_of_death_desc: "Przywraca kartę z twojego cmentarza do twojej ręki.",
			ability_eredin_destroyer_desc: "Odrzuć 2 karty i dobierz 1 wybraną kartę ze swojej talii.",
			ability_eredin_king_desc: "Wybierz dowolną kartę pogody ze swojej talii i natychmiast ją zagraj.",
			ability_eredin_treacherous_desc: "Podwaja siłę wszystkich kart szpiegów (działa na obu graczy).",
			ability_francesca_queen_desc: "Niszczy najsilniejsze jednostki w zwarciu przeciwnika, jeśli ich siła wynosi 10 lub więcej.",
			ability_francesca_beautiful_desc: "Podwaja siłę wszystkich twoich jednostek walki na dystans (chyba że w rzędzie znajduje się Róg dowódcy).",
			ability_francesca_daisy_desc: "Dobierz dodatkową kartę na początku bitwy.",
			ability_francesca_pureblood_desc: "Wybierz z talii kartę Trzaskający mróz i zagraj ją natychmiast.",
			ability_francesca_hope_desc: "Przenosi jednostki zwinne do rzędu, który maksymalizuje ich siłę.",
			ability_crach_an_craite_desc: "Wtasowuje wszystkie karty z cmentarzy obu graczy z powrotem do ich talii.",
			ability_king_bran_desc: "Jednostki tracą tylko połowę swojej Siły przy złej pogodzie.",

			// Controller / Gamepad HUD Prompts
			pad_connected: "Kontroler podłączony",
			pad_disconnected: "Kontroler odłączony",
			pad_navigate_hand: "Karty",
			pad_play_card: "Zagraj kartę",
			pad_pass: "Spasuj",
			pad_leader: "Dowódca",
			pad_menu: "Menu",
			pad_choose_row: "Wybierz rząd",
			pad_confirm: "Zatwierdź",
			pad_cancel: "Anuluj",
			pad_switch_panel: "Przełącz panel",
			pad_select: "Wybierz",
			pad_change_faction: "Frakcja",
			pad_start_game: "Rozpocznij grę",
			pad_back: "Wstecz"
		}
	},

	init() {
		const saved = (typeof localStorage !== "undefined") ? (localStorage.getItem("gc-language") || "en") : "en";
		this.setLanguage(saved);
	},

	t(key) {
		const dict = this.translations[this.currentLang] || this.translations.en;
		return dict[key] || this.translations.en[key] || key;
	},

	setLanguage(lang) {
		if (!this.translations[lang]) lang = "en";
		this.currentLang = lang;
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("gc-language", lang);
		}

		if (typeof document === "undefined") return;

		// Apply to all elements with data-i18n (replaces inner text)
		document.querySelectorAll("[data-i18n]").forEach(elem => {
			const key = elem.getAttribute("data-i18n");
			const val = this.t(key);
			if (val) {
				elem.textContent = val;
			}
		});

		// Apply to elements with data-i18n-title (sets data-title attribute for tooltips)
		document.querySelectorAll("[data-i18n-title]").forEach(elem => {
			const key = elem.getAttribute("data-i18n-title");
			const val = this.t(key);
			if (val) {
				elem.setAttribute("data-title", val);
			}
		});

		// Board text elements
		const nameOp = document.getElementById("name-op");
		if (nameOp) {
			if (typeof VersusMode !== "undefined" && VersusMode.isActive && VersusMode.remotePlayerName) {
				nameOp.textContent = VersusMode.remotePlayerName;
			} else if (typeof player_op !== "undefined" && player_op && player_op.name) {
				nameOp.textContent = player_op.name;
			} else {
				nameOp.textContent = this.t("opponent_name");
			}
		}

		const nameMe = document.getElementById("name-me");
		if (nameMe) {
			const savedCustomName = (typeof localStorage !== "undefined") ? localStorage.getItem("gc-player-name") : null;
			if (typeof VersusMode !== "undefined" && VersusMode.isActive && VersusMode.localPlayerName) {
				nameMe.textContent = VersusMode.localPlayerName;
			} else if (typeof player_me !== "undefined" && player_me && player_me.name) {
				nameMe.textContent = player_me.name;
			} else if (savedCustomName) {
				nameMe.textContent = savedCustomName;
			}
		}

		const passedOp = document.getElementById("passed-op");
		if (passedOp) passedOp.textContent = this.t("passed_label");

		const passedMe = document.getElementById("passed-me");
		if (passedMe) passedMe.textContent = this.t("passed_label");

		const passBtn = document.getElementById("pass-button");
		if (passBtn) {
			passBtn.textContent = this.t("btn_pass");
			passBtn.setAttribute("data-title", this.t("title_pass_round"));
		}

		const forfeitBtn = document.getElementById("forfeit-button");
		if (forfeitBtn) {
			forfeitBtn.textContent = this.t("btn_forfeit");
			forfeitBtn.setAttribute("data-title", this.t("title_forfeit_game"));
		}

		const openSettingsBtn = document.getElementById("open-game-settings");
		if (openSettingsBtn) {
			openSettingsBtn.setAttribute("data-title", this.t("menu_settings"));
		}

		// Tooltips for in-game board controls
		const exitBtn = document.getElementById("exit-game");
		if (exitBtn) exitBtn.setAttribute("data-title", this.t("title_exit_game"));

		const leaderOp = document.querySelector("#leader-op .leader-container");
		if (leaderOp) leaderOp.setAttribute("data-title", this.t("title_view_leader"));

		const leaderMe = document.querySelector("#leader-me .leader-container");
		if (leaderMe) leaderMe.setAttribute("data-title", this.t("title_play_leader"));

		const graveOp = document.getElementById("grave-op");
		if (graveOp) graveOp.setAttribute("data-title", this.t("title_view_discards"));

		const graveMe = document.getElementById("grave-me");
		if (graveMe) graveMe.setAttribute("data-title", this.t("title_view_discards"));

		const toggleMusic = document.getElementById("toggle-music");
		if (toggleMusic) toggleMusic.setAttribute("data-title", this.t("title_toggle_music"));

		const toggleSfx = document.getElementById("toggle-sfx");
		if (toggleSfx) toggleSfx.setAttribute("data-title", this.t("title_toggle_sfx"));

		const toggleNotif = document.getElementById("toggle-notifications");
		if (toggleNotif) toggleNotif.setAttribute("data-title", this.t("title_toggle_notif"));

		// End screen
		const endRoundHeaders = document.querySelectorAll("#end-screen th");
		if (endRoundHeaders.length >= 4) {
			endRoundHeaders[1].textContent = this.t("round_1");
			endRoundHeaders[2].textContent = this.t("round_2");
			endRoundHeaders[3].textContent = this.t("round_3");
		}
		const endRows = document.querySelectorAll("#end-screen tr");
		if (endRows.length >= 3) {
			const thOp = endRows[2].querySelector("th");
			if (thOp) thOp.textContent = this.t("opponent_name");
		}
		const endDrawP = document.querySelector("#end-screen p");
		if (endDrawP) endDrawP.textContent = this.t("end_draw_desc");

		const endBtns = document.querySelectorAll("#end-screen button");
		if (endBtns.length >= 3) {
			endBtns[0].textContent = this.t("btn_customize");
			endBtns[1].textContent = this.t("btn_rematch");
			endBtns[2].textContent = this.t("btn_new_game");
		}

		// Deck Customization Screen elements
		const startBtn = document.getElementById("start-game");
		if (startBtn) startBtn.textContent = this.t("btn_start_game");

		const changeFactionBtn = document.getElementById("change-faction");
		if (changeFactionBtn) changeFactionBtn.textContent = this.t("btn_change_faction");

		const downloadDeckBtn = document.getElementById("download-deck");
		if (downloadDeckBtn) downloadDeckBtn.textContent = this.t("btn_download_deck");

		const cardBankTitle = document.getElementById("card-bank-title");
		if (cardBankTitle) cardBankTitle.textContent = this.t("card_collection");

		const cardDeckTitle = document.getElementById("card-deck-title");
		if (cardDeckTitle) cardDeckTitle.textContent = this.t("cards_in_deck");

		const leaderP = document.querySelector("#card-leader p");
		if (leaderP) leaderP.textContent = this.t("leader_label");

		const statsH = document.querySelector(".deck-stats-header p");
		if (statsH) statsH.textContent = this.t("deck_stats_header");

		const deckStats = document.getElementById("deck-stats");
		if (deckStats && deckStats.children.length >= 10) {
			deckStats.children[0].textContent = this.t("deck_total_cards");
			deckStats.children[2].textContent = this.t("deck_unit_cards");
			deckStats.children[4].textContent = this.t("deck_special_cards");
			deckStats.children[6].textContent = this.t("deck_strength");
			deckStats.children[8].textContent = this.t("deck_hero_cards");
		}

		const opDeckTitle = document.querySelector("#opponent-preview > div:first-child p");
		if (opDeckTitle) opDeckTitle.textContent = this.t("op_deck");

		const opViewBtn = document.getElementById("op-preview-open");
		if (opViewBtn) opViewBtn.setAttribute("data-title", this.t("title_view_opponent"));

		const opUploadLbl = document.getElementById("op-preview-leader");
		if (opUploadLbl) opUploadLbl.setAttribute("data-title", this.t("title_upload_opponent"));

		const opClearBtn = document.getElementById("op-preview-clear");
		if (opClearBtn) opClearBtn.setAttribute("data-title", this.t("title_clear_opponent"));

		// Active faction title and description in DeckMaker
		if (typeof dm !== "undefined" && dm && dm.faction && typeof factions !== "undefined" && factions[dm.faction]) {
			const factionH1 = dm.elem ? dm.elem.getElementsByTagName("h1")[0] : null;
			if (factionH1) factionH1.innerHTML = factions[dm.faction].name;

			const factionDesc = document.getElementById("faction-description");
			if (factionDesc) factionDesc.innerHTML = factions[dm.faction].description;

			if (typeof dm.updatedCustomOpponent === "function") {
				dm.updatedCustomOpponent();
			} else if (isEmpty(dm.opponentData)) {
				const randomP = document.querySelector("#op-preview-leader p");
				if (randomP) randomP.innerHTML = this.t("random_label");
			}
		}

		// Update achievements if loaded
		if (typeof Achievements !== "undefined") {
			Achievements.renderUI(Achievements.currentFilter || "all");
		}
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = I18N;
}
