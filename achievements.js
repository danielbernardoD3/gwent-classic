"use strict";

const ACHIEVEMENTS_DATA = [
	{
		id: "win_1",
		icon: "⚔️",
		type: "count",
		target: 1,
		getProgress: stats => stats.wins || 0,
		title: {
			pt: "Primeira Vitória",
			en: "First Blood",
			es: "Primera Victoria",
			pl: "Pierwsza Krew"
		},
		desc: {
			pt: "Vença 1 partida de Gwent.",
			en: "Win 1 match of Gwent.",
			es: "Gana 1 partida de Gwent.",
			pl: "Wygraj 1 mecz w Gwinta."
		},
		secret: {
			pt: "Um bom taverneiro sabe quando aceitar um desafio. Geralt sempre pede uma rodada.",
			en: "A good tavernkeeper knows when to accept a wager. Geralt never turns down a round.",
			es: "Un buen tabernero sabe cuándo aceptar una apuesta. Geralt nunca rechaza una partida.",
			pl: "Dobry karczmarz wie, kiedy przyjąć wyzwanie. Geralt nigdy nie odmawia partyjki."
		}
	},
	{
		id: "win_5",
		icon: "🏆",
		type: "count",
		target: 5,
		getProgress: stats => stats.wins || 0,
		title: {
			pt: "Apostador de Pomar Branco",
			en: "White Orchard Gambler",
			es: "Apostador de Huerto Blanco",
			pl: "Hazardzista z Białego Sadu"
		},
		desc: {
			pt: "Vença 5 partidas de Gwent.",
			en: "Win 5 matches of Gwent.",
			es: "Gana 5 partidas de Gwent.",
			pl: "Wygraj 5 meczów w Gwinta."
		},
		secret: {
			pt: "Seus bolsos já começam a tilintar com os orens ganhos nas tavernas locais.",
			en: "Your pockets are already jingling with orens won across local taverns.",
			es: "Tus bolsillos ya tintinean con los orenes ganados en las tabernas locales.",
			pl: "Twoje kieszenie już brzęczą orenami wygranymi w lokalnych karczmach."
		}
	},
	{
		id: "win_10",
		icon: "🎖️",
		type: "count",
		target: 10,
		getProgress: stats => stats.wins || 0,
		title: {
			pt: "Estrategista de Velen",
			en: "Strategist of Velen",
			es: "Estratega de Velen",
			pl: "Strateg z Velen"
		},
		desc: {
			pt: "Vença 10 partidas de Gwent.",
			en: "Win 10 matches of Gwent.",
			es: "Gana 10 partidas de Gwent.",
			pl: "Wygraj 10 meczów w Gwinta."
		},
		secret: {
			pt: "Nem os Barões nem os bruxos conseguem prever seus movimentos no tabuleiro da Terra de Ninguém.",
			en: "Neither Barons nor witchers can foresee your moves in No Man's Land.",
			es: "Ni los barones ni los brujos pueden prever tus movimientos en Tierra de Nadie.",
			pl: "Ani baronowie, ani wiedźmini nie są w stanie przewidzieć twoich ruchów na Ziemi Niczyjej."
		}
	},
	{
		id: "win_20",
		icon: "🛡️",
		type: "count",
		target: 20,
		getProgress: stats => stats.wins || 0,
		title: {
			pt: "Veterano dos Tabuleiros",
			en: "Board Veteran",
			es: "Veterano del Tablero",
			pl: "Weteran Planszy"
		},
		desc: {
			pt: "Vença 20 partidas de Gwent.",
			en: "Win 20 matches of Gwent.",
			es: "Gana 20 partidas de Gwent.",
			pl: "Wygraj 20 meczów w Gwinta."
		},
		secret: {
			pt: "Vinte vitórias e nenhuma cicatriz... ao menos nenhuma que um bom hidromel não cure.",
			en: "Twenty victories and not a single scar... at least none a mug of mead can't soothe.",
			es: "Veinte victorias y ni una sola cicatriz... al menos ninguna que un buen hidromiel no cure.",
			pl: "Dwadzieścia zwycięstw i ani jednej blizny... a przynajmniej żadnej, której nie uleczy dobry miód."
		}
	},
	{
		id: "win_50",
		icon: "👑",
		type: "count",
		target: 50,
		getProgress: stats => stats.wins || 0,
		title: {
			pt: "Campeão de Novigrad",
			en: "Champion of Novigrad",
			es: "Campeón de Novigrado",
			pl: "Mistrz Novigradu"
		},
		desc: {
			pt: "Vença 50 partidas de Gwent.",
			en: "Win 50 matches of Gwent.",
			es: "Gana 50 partidas de Gwent.",
			pl: "Wygraj 50 meczów w Gwinta."
		},
		secret: {
			pt: "Seu nome já é sussurrado nos becos sombrios e nas tavernas luxuosas da Cidade Livre.",
			en: "Your name is whispered in shadowy alleys and grand taverns throughout the Free City.",
			es: "Tu nombre ya se susurra en callejones oscuros y tabernas de la Ciudad Libre.",
			pl: "Twoje imię jest szeptane w ciemnych zaułkach i wielkich karczmach Wolnego Miasta."
		}
	},
	{
		id: "win_100",
		icon: "⚜️",
		type: "count",
		target: 100,
		getProgress: stats => stats.wins || 0,
		title: {
			pt: "Lenda Viva do Gwent",
			en: "Living Legend of Gwent",
			es: "Leyenda Viva del Gwent",
			pl: "Żywa Legenda Gwinta"
		},
		desc: {
			pt: "Vença 100 partidas de Gwent.",
			en: "Win 100 matches of Gwent.",
			es: "Gana 100 partidas de Gwent.",
			pl: "Wygraj 100 meczów w Gwinta."
		},
		secret: {
			pt: "O próprio Grande Torneio de Passiflora reservaria a mesa de honra para você. Insuperável!",
			en: "The High Stakes Tournament at the Passiflora would reserve the head table for you. Unmatched!",
			es: "El Gran Torneo de Passiflora te reservaría la mesa principal. ¡Insuperable!",
			pl: "Turniej w Passiflorze zarezerwowałby dla ciebie miejsce honorowe. Niezrównany mistrz!"
		}
	},
	{
		id: "win_realms",
		icon: "🏰",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.factionWins && stats.factionWins.realms) ? stats.factionWins.realms : 0,
		title: {
			pt: "Pela Glória do Norte",
			en: "Glory to the North",
			es: "Gloria al Norte",
			pl: "Chwała Północy"
		},
		desc: {
			pt: "Vença usando o Baralho 'Reinos do Norte'.",
			en: "Win using the 'Northern Realms' deck.",
			es: "Gana usando la baraja 'Reinos del Norte'.",
			pl: "Wygraj talią 'Królestwa Północy'."
		},
		secret: {
			pt: "Foltest sorri do além. O poder das catapultas e espiões temérios esmagou a oposição!",
			en: "Foltest smiles from beyond. Temerian catapults and spies crushed all opposition!",
			es: "Foltest sonríe desde el más allá. ¡Las catapultas y espías temerios aplastaron la oposición!",
			pl: "Foltest uśmiecha się z zaświatów. Temerskie katapulty i szpiedzy zmiażdżyli rywali!"
		}
	},
	{
		id: "win_nilfgaard",
		icon: "☀️",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.factionWins && stats.factionWins.nilfgaard) ? stats.factionWins.nilfgaard : 0,
		title: {
			pt: "A Chama Branca",
			en: "The White Flame",
			es: "La Llama Blanca",
			pl: "Biały Płomień"
		},
		desc: {
			pt: "Vença usando o Baralho 'Nilfgaard'.",
			en: "Win using the 'Nilfgaard' deck.",
			es: "Gana usando la baraja 'Nilfgaard'.",
			pl: "Wygraj talią 'Nilfgaard'."
		},
		secret: {
			pt: "A Grande Chama Dança Sobre os Túmulos dos Inimigos. Emhyr var Emreis aprova sua disciplina militar.",
			en: "The White Flame Dancing on the Barrows of his Enemies. Emhyr var Emreis commends your order.",
			es: "La Llama Blanca que Baila sobre los Túmulos de sus Enemigos aprueba tu disciplina militar.",
			pl: "Biały Płomień Tańczący na Kurhanach Wrogów. Emhyr var Emreis nagradza twoją dyscyplinę."
		}
	},
	{
		id: "win_monsters",
		icon: "👹",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.factionWins && stats.factionWins.monsters) ? stats.factionWins.monsters : 0,
		title: {
			pt: "Fúria das Sombras",
			en: "Fury of the Shadows",
			es: "Furia de las Sombras",
			pl: "Gniew Potworów"
		},
		desc: {
			pt: "Vença usando o Baralho 'Monstros'.",
			en: "Win using the 'Monsters' deck.",
			es: "Gana usando la baraja 'Monstruos'.",
			pl: "Wygraj talią 'Potwory'."
		},
		secret: {
			pt: "A horda se agrupa e devora tudo o que respira. As feras da floresta não conhecem misericórdia.",
			en: "The swarm gathers and devours everything that breathes. The wild beasts show no mercy.",
			es: "La horda se reúne y devora todo a su paso. Las bestias salvajes no conocen piedad.",
			pl: "Rój zbiera się i pożera wszystko, co oddycha. Dzikie bestie nie znają litości."
		}
	},
	{
		id: "win_scoiatael",
		icon: "🏹",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.factionWins && stats.factionWins.scoiatael) ? stats.factionWins.scoiatael : 0,
		title: {
			pt: "Os Esquilos Livres",
			en: "The Free Squirrels",
			es: "Las Ardillas Libres",
			pl: "Wolne Wiewiórki"
		},
		desc: {
			pt: "Vença usando o Baralho 'Scoia'tael'.",
			en: "Win using the 'Scoia'tael' deck.",
			es: "Gana usando la baraja 'Scoia'tael'.",
			pl: "Wygraj talią 'Scoia'tael'."
		},
		secret: {
			pt: "Flechas silenciosas e emboscadas fatais. A floresta responde apenas ao comando dos não-humanos!",
			en: "Silent arrows and deadly ambushes. The forest answers only to non-human command!",
			es: "Flechas silenciosas y emboscadas letales. ¡El bosque solo responde a los no humanos!",
			pl: "Ciche strzały i śmiertelne zasadzki. Las odpowiada tylko nieludziom!"
		}
	},
	{
		id: "win_skellige",
		icon: "⚓",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.factionWins && stats.factionWins.skellige) ? stats.factionWins.skellige : 0,
		title: {
			pt: "Fúria dos Mares",
			en: "Fury of the Seas",
			es: "Furia de los Mares",
			pl: "Furia Morza"
		},
		desc: {
			pt: "Vença usando o Baralho 'Skellige'.",
			en: "Win using the 'Skellige' deck.",
			es: "Gana usando la baraja 'Skellige'.",
			pl: "Wygraj talią 'Skellige'."
		},
		secret: {
			pt: "Pelo machado de Hemdall! Os guerreiros caídos retornam do além para clamar a honra do arquipélago!",
			en: "By Hemdall's axe! The fallen warriors return from the grave to claim island honor!",
			es: "¡Por el hacha de Hemdall! Los guerreros caídos regresan para reclamar el honor de las islas.",
			pl: "Na topór Hemdalla! Polegli wojownicy powracają z grobu, by sławić wyspy!"
		}
	},
	{
		id: "lose_1",
		icon: "💀",
		type: "count",
		target: 1,
		getProgress: stats => stats.losses || 0,
		title: {
			pt: "Um Tropeço na Senda",
			en: "A Stumble on the Path",
			es: "Un Tropiezo en la Senda",
			pl: "Potknięcie na Szlaku"
		},
		desc: {
			pt: "Seja derrotado uma vez.",
			en: "Be defeated once.",
			es: "Sé derrotado una vez.",
			pl: "Zostań pokonany jeden raz."
		},
		secret: {
			pt: "Até mesmo os bruxos mais lendários já perderam orens no jogo. Erga a cabeça e compre novas cartas.",
			en: "Even the greatest witchers have dropped coin at the table. Dust yourself off and draw again.",
			es: "Incluso los mejores brujos han perdido orenes en el juego. Levanta la cabeza y juega otra vez.",
			pl: "Nawet najwięksi wiedźmini tracili monety przy stole. Otrzep się i zagraj znowu."
		}
	},
	{
		id: "lose_10",
		icon: "🩸",
		type: "count",
		target: 10,
		getProgress: stats => stats.losses || 0,
		title: {
			pt: "Resiliência de Aço",
			en: "Resilience of Steel",
			es: "Resiliencia de Acero",
			pl: "Hart ze Stali"
		},
		desc: {
			pt: "Seja derrotado 10 vezes.",
			en: "Be defeated 10 times.",
			es: "Sé derrotado 10 veces.",
			pl: "Zostań pokonany 10 razy."
		},
		secret: {
			pt: "A derrota é a melhor professora de tática. Cada revés afia a sua espada para a próxima batalha.",
			en: "Defeat is the finest tactical tutor. Every setback hones your blade for the next duel.",
			es: "La derrota es la mejor maestra de táctica. Cada tropiezo afila tu espada.",
			pl: "Porażka to najlepszy nauczyciel taktyki. Każde potknięcie ostrzy twój miecz na kolejną walkę."
		}
	},
	{
		id: "scorch_kill",
		icon: "🔥",
		type: "boolean",
		target: 1,
		getProgress: stats => stats.scorchKills || 0,
		title: {
			pt: "Cinzas às Cinzas",
			en: "Ashes to Ashes",
			es: "Cenizas a las Cenizas",
			pl: "Z Prochu w Proch"
		},
		desc: {
			pt: "Acabe com as forças do inimigo usando a carta 'Queimar'.",
			en: "Destroy enemy forces using the 'Scorch' card.",
			es: "Destruye fuerzas enemigas usando la carta 'Abrasivo' (Queimar).",
			pl: "Zniszcz siły wroga za pomocą karty 'Pożoga'."
		},
		secret: {
			pt: "O fogo consome os mais orgulhosos sem piedade. Uma jogada fria, calculada e devastadora.",
			en: "Fire devours the proud without distinction. A cold, calculated, and devastating play.",
			es: "El fuego devora a los orgullosos sin distinción. Una jugada fría, calculada y devastadora.",
			pl: "Ogień pożera najdumniejszych bez litości. Zimne, wykalkulowane i druzgocące zagranie."
		}
	},
	{
		id: "weather_win",
		icon: "❄️",
		type: "boolean",
		target: 1,
		getProgress: stats => stats.weatherRoundWins || 0,
		title: {
			pt: "Sob a Tempestade",
			en: "Through the Storm",
			es: "Bajo la Tormenta",
			pl: "Przetrwać Burzę"
		},
		desc: {
			pt: "Vença um round com efeito climático no seu campo (Frio, Névoa, Chuva ou Tempestade).",
			en: "Win a round with a weather effect affecting your battlefield.",
			es: "Gana una ronda con efecto de clima afectando tu campo.",
			pl: "Wygraj rundę z efektem pogodowym wpływającym na twoje pole bitwy."
		},
		secret: {
			pt: "O vento gelado e a névoa sufocam exércitos, mas sua liderança suportou o rigor da própria natureza.",
			en: "Frost and blinding mist drown armies, yet your resolve withstood nature's wrath.",
			es: "La escarcha y la niebla asfixian ejércitos, pero tu liderazgo resistió la furia de la naturaleza.",
			pl: "Mróz i mgła dławią armie, lecz twoje dowództwo przetrwało gniew samej natury."
		}
	},
	{
		id: "score_80",
		icon: "⚡",
		type: "count",
		target: 80,
		getProgress: stats => stats.maxScore || 0,
		title: {
			pt: "Força de Combate",
			en: "Combat Might",
			es: "Poder de Combate",
			pl: "Siła Bojowa"
		},
		desc: {
			pt: "Alcance 80 no valor de ataque em um round.",
			en: "Reach 80 attack power in a single round.",
			es: "Alcanza 80 puntos de ataque en una ronda.",
			pl: "Osiągnij 80 punktów siły w jednej rundzie."
		},
		secret: {
			pt: "Uma fileira de guerra disciplinada que nenhum capitão comum ousaria desafiar.",
			en: "A disciplined battle formation that no ordinary captain would dare challenge.",
			es: "Una formación disciplinada que ningún capitán común se atrevería a desafiar.",
			pl: "Dyscyplina w szyku, której żaden zwykły kapitan nie odważyłby się wyzwać."
		}
	},
	{
		id: "score_100",
		icon: "💥",
		type: "count",
		target: 100,
		getProgress: stats => stats.maxScore || 0,
		title: {
			pt: "Poder Esmagador",
			en: "Overwhelming Power",
			es: "Poder Arrollador",
			pl: "Miażdżąca Potęga"
		},
		desc: {
			pt: "Alcance 100 no valor de ataque em um round.",
			en: "Reach 100 attack power in a single round.",
			es: "Alcanza 100 puntos de ataque en una ronda.",
			pl: "Osiągnij 100 punktów siły w jednej rundzie."
		},
		secret: {
			pt: "Centenas de homens marchando juntos em uníssono ao som das cornetas de batalha!",
			en: "A hundred strong marching in lockstep to the thunderous roar of battle horns!",
			es: "¡Cientos marchando al unísono al estruendo de los cuernos de guerra!",
			pl: "Setki wojowników maszerujących ramię w ramię przy dźwiękach bojowych rogów!"
		}
	},
	{
		id: "score_120",
		icon: "🌟",
		type: "count",
		target: 120,
		getProgress: stats => stats.maxScore || 0,
		title: {
			pt: "Exército Invencível",
			en: "Invincible Army",
			es: "Ejército Invencible",
			pl: "Niezwyciężona Armia"
		},
		desc: {
			pt: "Alcance 120 no valor de ataque em um round.",
			en: "Reach 120 attack power in a single round.",
			es: "Alcanza 120 puntos de ataque en una ronda.",
			pl: "Osiągnij 120 punktów siły w jednej rundzie."
		},
		secret: {
			pt: "Uma força colossal digna de canções épicas entoadas por Dandelion em todas as cortes.",
			en: "A colossal display of might worthy of ballads sung by Dandelion in every royal court.",
			es: "Una fuerza colosal digna de las baladas cantadas por Jaskier en todas las cortes.",
			pl: "Kolosalna siła godna ballad śpiewanych przez Jaskra na królewskich dworach."
		}
	},
	{
		id: "score_160",
		icon: "☄️",
		type: "count",
		target: 160,
		getProgress: stats => stats.maxScore || 0,
		title: {
			pt: "A Ira dos Deuses",
			en: "Wrath of the Gods",
			es: "La Ira de los Dioses",
			pl: "Gniew Bogów"
		},
		desc: {
			pt: "Alcance 160 no valor de ataque em um round.",
			en: "Reach 160 attack power in a single round.",
			es: "Alcanza 160 puntos de ataque en una ronda.",
			pl: "Osiągnij 160 punktów siły w jednej rundzie."
		},
		secret: {
			pt: "Um feito quase impossível! A potência do seu exército abalou os próprios alicerces do continente!",
			en: "A mythical feat! The sheer strength of your forces shook the foundations of the Continent!",
			es: "¡Una hazaña legendaria! El poder de tus tropas estremeció los cimientos del Continente.",
			pl: "Mityczny wyczyn! Potęga twoich wojsk wstrząsnęła posadami całego Kontynentu!"
		}
	},
	{
		id: "spies_3",
		icon: "🕵️",
		type: "count",
		target: 3,
		getProgress: () => (typeof game !== "undefined" && game.playerMeSpiesPlayed) ? game.playerMeSpiesPlayed : 0,
		title: {
			pt: "Mestre dos Espiões",
			en: "Master of Whispers",
			es: "Maestro de Espías",
			pl: "Mistrz Szpiegów"
		},
		desc: {
			pt: "Jogue 3 'cartas espião' durante o mesmo jogo.",
			en: "Play 3 'Spy cards' during the same match.",
			es: "Juega 3 'cartas espía' durante la misma partida.",
			pl: "Zagraj 3 'karty szpiegów' podczas tego samego meczu."
		},
		secret: {
			pt: "Dijkstra e Thaler teriam inveja da sua teia de intrigas. Informação vence guerras antes mesmo do combate.",
			en: "Dijkstra and Thaler would envy your network. Information wins wars long before steel clashes.",
			es: "Dijkstra y Thaler envidiarían tu red. La información gana guerras antes de que choquen las espadas.",
			pl: "Dijkstra i Talar pozazdrościliby twojej siatki. Informacja wygrywa wojny zanim skrzyżują się miecze."
		}
	},
	{
		id: "decoy_rescue",
		icon: "🎭",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.decoyRescues || 0),
		title: {
			pt: "A Arte do Engano",
			en: "Art of the Trickster",
			es: "El Arte del Engaño",
			pl: "Sztuka Fortelu"
		},
		desc: {
			pt: "Resgate uma carta usando a carta 'Isca'.",
			en: "Rescue a card from the battlefield using a 'Decoy' card.",
			es: "Rescata una carta usando la carta 'Señuelo' (Isca).",
			pl: "Uratuj kartę za pomocą karty 'Manekin'."
		},
		secret: {
			pt: "Um espantalho no lugar de um herói. O inimigo ataca o vazio enquanto seu guerreiro descansa seguro na sua mão.",
			en: "A scarecrow where a hero stood. The foe strikes empty air while your warrior rests safely in hand.",
			es: "Un muñeco donde estaba un héroe. El enemigo ataca la nada mientras tu guerrero descansa en tu mano.",
			pl: "Kukła w miejscu bohatera. Wróg bije w próżnię, podczas gdy twój wojownik odpoczywa w bezpiecznej dłoni."
		}
	},
	{
		id: "medic_revive",
		icon: "🩹",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.medicRevives || 0),
		title: {
			pt: "Sutura de Batalha",
			en: "Field Medic",
			es: "Médico de Campaña",
			pl: "Medyk Polowy"
		},
		desc: {
			pt: "Recupere suas tropas usando uma carta com a habilidade 'Médico'.",
			en: "Revive your troops from the graveyard using a 'Medic' card.",
			es: "Recupera tus tropas usando una carta con la habilidad 'Médico'.",
			pl: "Przywróć swoje wojska za pomocą karty z umiejętnością 'Medyk'."
		},
		secret: {
			pt: "Shani e as enfermeiras de campo provam que, no Gwent, a morte é apenas temporária.",
			en: "Shani and the front-line medics prove that on the Gwent board, death is merely temporary.",
			es: "Shani y las enfermeras demuestran que, en el Gwent, la muerte es solo temporal.",
			pl: "Shani i polowe sanitariuszki udowadniają, że w Gwincie śmierć bywa tylko tymczasowa."
		}
	},
	{
		id: "clear_weather",
		icon: "☀️",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.clearWeathers || 0),
		title: {
			pt: "O Sol de Meio-Dia",
			en: "Midday Sun",
			es: "Sol de Mediodía",
			pl: "Południowe Słońce"
		},
		desc: {
			pt: "Limpe o campo com a Carta 'Tempo Limpo'.",
			en: "Dispel all adverse conditions with the 'Clear Weather' card.",
			es: "Despeja el campo con la carta 'Clima Despejado'.",
			pl: "Oczyść pole bitwy za pomocą karty 'Czyste Niebo'."
		},
		secret: {
			pt: "A névoa se dissipa, o gelo derrete e os raios de sol revelam suas tropas em força máxima.",
			en: "The mist vanishes, frost melts, and blazing sunlight exposes your army in full glory.",
			es: "La niebla se disipa, la escarcha se funde y el sol revela a tus tropas en su máximo esplendor.",
			pl: "Mgła ustępuje, mróz topnieje, a promienie słońca odsłaniają twoje wojska w pełnej potędze."
		}
	},
	{
		id: "horns_3",
		icon: "📯",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.hornsPlayed || 0),
		title: {
			pt: "O Rugido dos Generais",
			en: "Roar of the Generals",
			es: "El Rugido de los Generales",
			pl: "Ryk Generałów"
		},
		desc: {
			pt: "Faça um fortalecimento máximo jogando 3 cartas 'Corneta do Comandante' no mesmo round.",
			en: "Achieve maximum boost by playing 3 'Commander's Horn' cards in the same round.",
			es: "Logra la máxima ventaja jugando 3 cartas 'Cuerno del Comandante' en la misma ronda.",
			pl: "Uzyskaj maksymalne wzmocnienie, zagrywając 3 karty 'Róg Dowódcy' w tej samej rundzie."
		},
		secret: {
			pt: "Três cornetas ecoando simultaneamente nas três fileiras de combate. Uma sinfonia ensurdecedora de pura glória marcial!",
			en: "Three battle horns sounding across all three combat rows. A deafening symphony of pure martial supremacy!",
			es: "¡Tres cuernos resonando a la vez en todas las filas! Una sinfonía ensordecedora de pura supremacía marcial.",
			pl: "Trzy rogi grzmiące jednocześnie we wszystkich rzędach. Ogłuszająca symfonia czystej potęgi wojennej!"
		}
	},
	{
		id: "cards_20_round",
		icon: "👥",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.cards20Round || 0),
		title: {
			pt: "Enxame Imparável",
			en: "Unstoppable Horde",
			es: "Enjambre Imparable",
			pl: "Niepowstrzymany Rój"
		},
		desc: {
			pt: "Vença um round com pelo menos 20 cartas em campo.",
			en: "Win a round with at least 20 cards on your side of the board.",
			es: "Gana una ronda con al menos 20 cartas en tu campo.",
			pl: "Wygraj rundę, mając co najmniej 20 kart na swoim polu bitwy."
		},
		secret: {
			pt: "Nem as muralhas de Vizima conteriam tantas tropas perfiladas. O tabuleiro tornou-se um mar infinito de soldados!",
			en: "Even Vizima's mighty walls could not hold such ranks. The board became an endless sea of warriors!",
			es: "Ni las murallas de Wyzima contendrían tantas tropas. ¡El tablero se convirtió en un mar infinito de guerreros!",
			pl: "Nawet mury Wyzimy nie pomieściłyby tylu szeregów. Plansza stała się bezkresnym morzem wojowników!"
		}
	},
	{
		id: "use_leader",
		icon: "👑",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.leaderUsed || 0),
		title: {
			pt: "Comando Supremo",
			en: "Supreme Command",
			es: "Mando Supremo",
			pl: "Najwyższy Rozkaz"
		},
		desc: {
			pt: "Utilize a habilidade especial de líder.",
			en: "Use your Leader's special ability during a match.",
			es: "Utiliza la habilidad especial del líder.",
			pl: "Użyj specjalnej zdolności dowódcy."
		},
		secret: {
			pt: "Um verdadeiro soberano não assiste passivamente. O comando do líder virou os rumos do confronto.",
			en: "A true sovereign does not sit idly by. The leader's order turned the very tide of battle.",
			es: "Un verdadero monarca no observa pasivamente. La orden del líder cambió el rumbo de la batalla.",
			pl: "Prawdziwy władca nie stoi bezczynnie. Rozkaz dowódcy odmienił losy całej potyczki."
		}
	},
	{
		id: "summon_roach",
		icon: "🐎",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.summonRoach || 0),
		title: {
			pt: "Vem, Carpeado!",
			en: "Whoa, Roach!",
			es: "¡Arre, Sardinilla!",
			pl: "Wio, Płotka!"
		},
		desc: {
			pt: "Chame o 'Carpeado'.",
			en: "Summon 'Roach' onto the battlefield.",
			es: "Invoca a 'Sardinilla' (Carpeado) al campo de batalla.",
			pl: "Przyzwij 'Płotkę' na pole bitwy."
		},
		secret: {
			pt: "Como esse cavalo foi parar em cima do telhado da taverna?! Clássico Carpeado, sempre aparecendo quando menos se espera.",
			en: "How did that mare get on top of the tavern roof?! Classic Roach, appearing right when you need her most.",
			es: "¿Cómo acabó ese caballo en el tejado de la taberna? Típica Sardinilla, apareciendo donde menos se espera.",
			pl: "Jak ten koń znowu wlazł na dach karczmy?! Klasyczna Płotka, zjawia się w najmniej spodziewanym momencie."
		}
	},
	{
		id: "comeback_win",
		icon: "🔄",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.comebackWins || 0),
		title: {
			pt: "A Grande Virada",
			en: "The Great Comeback",
			es: "La Gran Remontada",
			pl: "Wielki Powrót"
		},
		desc: {
			pt: "Vença uma partida depois de ter perdido 1 round.",
			en: "Win a match after having lost 1 round.",
			es: "Gana una partida después de haber perdido 1 ronda.",
			pl: "Wygraj mecz po przegraniu 1 rundy."
		},
		secret: {
			pt: "Perder uma rodada faz parte da armadilha. Geralt finge cansaço para desferir o golpe de misericórdia no terceiro round.",
			en: "Conceding a round was all part of the snare. A master feigns weakness only to strike decisively in round three.",
			es: "Perder una ronda era parte de la trampa. Geralt finge debilidad para rematar en el desempate.",
			pl: "Oddanie rundy było częścią pułapki. Mistrz udaje słabość, by zadać śmiertelny cios w trzeciej rundzie."
		}
	},
	{
		id: "choke_defeat",
		icon: "🥀",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.chokeDefeats || 0),
		title: {
			pt: "Gosto Amargo",
			en: "Bitter Aftertaste",
			es: "Sabor Amargo",
			pl: "Gorzka Lekcja"
		},
		desc: {
			pt: "Perca uma partida depois de ter vencido 1 round.",
			en: "Lose a match after having won 1 round.",
			es: "Pierde una partida después de haber ganado 1 ronda.",
			pl: "Przegraj mecz po wygraniu 1 rundy."
		},
		secret: {
			pt: "A falsa sensação de vitória antes do desastre. No Gwent, o excesso de confiança é o caminho mais rápido para a cova.",
			en: "The sweet scent of victory turned to ash. Overconfidence is the swiftest road to defeat.",
			es: "La dulce ilusión del triunfo convertida en cenizas. La soberbia es el camino más directo al fracaso.",
			pl: "Słodki smak zwycięstwa obrócony w popiół. Zbytnia pewność siebie to najszybsza droga do zguby."
		}
	},
	{
		id: "win_round_1_card",
		icon: "🐺",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.winRound1Card || 0),
		title: {
			pt: "Lobo Solitário",
			en: "Lone Wolf",
			es: "Lobo Solitario",
			pl: "Samotny Wilk"
		},
		desc: {
			pt: "Ganhe 1 round com apenas 1 carta em campo.",
			en: "Win a round with only 1 card on your side of the battlefield.",
			es: "Gana 1 ronda con solo 1 carta en tu campo.",
			pl: "Wygraj 1 rundę, mając tylko 1 kartę na swoim polu bitwy."
		},
		secret: {
			pt: "Um único herói no campo foi suficiente para fazer o exército rival bater em retirada. Eficiência cirúrgica!",
			en: "A single solitary legend stood firm, forcing the rival army into full retreat. Surgical efficiency!",
			es: "Una única leyenda se mantuvo en pie, obligando a todo el ejército rival a retirarse.",
			pl: "Jedna samotna legenda wystarczyła, by zmusić całą wrogą armię do odwrotu. Mistrzowska precyzja!"
		}
	},
	{
		id: "deck_20_cards",
		icon: "🗡️",
		type: "boolean",
		target: 1,
		getProgress: stats => (stats.deck20Wins || 0),
		title: {
			pt: "Minimalismo Letal",
			en: "Lethal Precision",
			es: "Precisión Letal",
			pl: "Zabójcza Precyzja"
		},
		desc: {
			pt: "Vença 1 partida com um baralho de no máximo 20 cartas.",
			en: "Win a match using a compact deck of at most 20 cards.",
			es: "Gana 1 partida con una baraja de máximo 20 cartas.",
			pl: "Wygraj 1 mecz z talią liczącą maksymalnie 20 kart."
		},
		secret: {
			pt: "Sem gordura, sem cartas descartáveis. Cada carta comprada foi uma estocada mortal no coração do inimigo.",
			en: "No fluff, no dead draws. Every card in hand was a sharpened dagger pointed straight at the enemy's heart.",
			es: "Sin relleno ni cartas muertas. Cada carta robada fue una estocada letal al corazón del oponente.",
			pl: "Żadnego zbędnego balastu. Każda dociągnięta karta była naostrzonym sztyletem prosto w serce wroga."
		}
	}
];

class Achievements {
	static stats = {
		wins: 0,
		losses: 0,
		factionWins: {
			realms: 0,
			nilfgaard: 0,
			monsters: 0,
			scoiatael: 0,
			skellige: 0
		},
		maxScore: 0,
		scorchKills: 0,
		weatherRoundWins: 0,
		decoyRescues: 0,
		medicRevives: 0,
		clearWeathers: 0,
		hornsPlayed: 0,
		cards20Round: 0,
		leaderUsed: 0,
		summonRoach: 0,
		comebackWins: 0,
		chokeDefeats: 0,
		winRound1Card: 0,
		deck20Wins: 0
	};

	static unlocked = {};
	static currentFilter = 'all';

	static init() {
		// Load stats
		try {
			const savedStats = localStorage.getItem("gc-stats");
			if (savedStats) {
				const parsed = JSON.parse(savedStats);
				Achievements.stats = Object.assign(Achievements.stats, parsed);
				if (!Achievements.stats.factionWins) {
					Achievements.stats.factionWins = { realms: 0, nilfgaard: 0, monsters: 0, scoiatael: 0, skellige: 0 };
				}
			}
		} catch (e) {
			console.warn("Could not load stats:", e);
		}

		// Load unlocked achievements
		try {
			const savedAch = localStorage.getItem("gc-achievements");
			if (savedAch) {
				Achievements.unlocked = JSON.parse(savedAch);
			}
		} catch (e) {
			console.warn("Could not load achievements:", e);
		}

		// Initial check
		Achievements.checkStats();
	}

	static saveStats() {
		try {
			localStorage.setItem("gc-stats", JSON.stringify(Achievements.stats));
		} catch (e) {
			console.warn("Error saving stats:", e);
		}
	}

	static saveAchievements() {
		try {
			localStorage.setItem("gc-achievements", JSON.stringify(Achievements.unlocked));
		} catch (e) {
			console.warn("Error saving achievements:", e);
		}
	}

	static isUnlocked(id) {
		return !!(Achievements.unlocked[id] && Achievements.unlocked[id].unlocked);
	}

	static unlock(id) {
		if (Achievements.isUnlocked(id)) return;

		const def = ACHIEVEMENTS_DATA.find(a => a.id === id);
		if (!def) return;

		const now = new Date();
		const dateStr = now.toLocaleDateString();

		Achievements.unlocked[id] = {
			unlocked: true,
			unlockedAt: dateStr
		};

		Achievements.saveAchievements();

		// Play fanfare / confirm sound
		if (typeof AudioManager !== "undefined" && AudioManager.playSFX) {
			AudioManager.playSFX("witcher_confirm");
		}

		// Show in-game toast
		Achievements.showToast(def);

		// If achievements view is currently visible, refresh it
		if (typeof document !== "undefined") {
			const view = document.getElementById("menu-achievements");
			if (view && view.classList.contains("active")) {
				Achievements.renderUI(Achievements.currentFilter);
			}
		}
	}

	static checkStats() {
		ACHIEVEMENTS_DATA.forEach(ach => {
			if (!Achievements.isUnlocked(ach.id)) {
				const current = ach.getProgress(Achievements.stats);
				if (current >= ach.target) {
					Achievements.unlock(ach.id);
				}
			}
		});
	}

	static recordWin(faction, lostARound = false, deckCardCount = 0) {
		Achievements.stats.wins = (Achievements.stats.wins || 0) + 1;
		if (faction) {
			if (!Achievements.stats.factionWins) Achievements.stats.factionWins = {};
			Achievements.stats.factionWins[faction] = (Achievements.stats.factionWins[faction] || 0) + 1;
		}
		if (lostARound) {
			Achievements.stats.comebackWins = (Achievements.stats.comebackWins || 0) + 1;
			Achievements.unlock("comeback_win");
		}
		if (deckCardCount > 0 && deckCardCount <= 20) {
			Achievements.stats.deck20Wins = (Achievements.stats.deck20Wins || 0) + 1;
			Achievements.unlock("deck_20_cards");
		}
		Achievements.saveStats();
		Achievements.checkStats();
	}

	static recordLoss(wonARound = false) {
		Achievements.stats.losses = (Achievements.stats.losses || 0) + 1;
		if (wonARound) {
			Achievements.stats.chokeDefeats = (Achievements.stats.chokeDefeats || 0) + 1;
			Achievements.unlock("choke_defeat");
		}
		Achievements.saveStats();
		Achievements.checkStats();
	}

	static checkScore(score) {
		if (score > (Achievements.stats.maxScore || 0)) {
			Achievements.stats.maxScore = score;
			Achievements.saveStats();
		}
		Achievements.checkStats();
	}

	static recordSpyPlayed() {
		if (typeof game !== "undefined") {
			game.playerMeSpiesPlayed = (game.playerMeSpiesPlayed || 0) + 1;
			if (game.playerMeSpiesPlayed >= 3) {
				Achievements.unlock("spies_3");
			}
		}
	}

	static recordWeatherRoundWin() {
		Achievements.stats.weatherRoundWins = (Achievements.stats.weatherRoundWins || 0) + 1;
		Achievements.saveStats();
		Achievements.unlock("weather_win");
	}

	static recordScorchKill() {
		Achievements.stats.scorchKills = (Achievements.stats.scorchKills || 0) + 1;
		Achievements.saveStats();
		Achievements.unlock("scorch_kill");
	}

	static recordDecoy() {
		Achievements.stats.decoyRescues = (Achievements.stats.decoyRescues || 0) + 1;
		Achievements.saveStats();
		Achievements.unlock("decoy_rescue");
	}

	static recordMedic() {
		Achievements.stats.medicRevives = (Achievements.stats.medicRevives || 0) + 1;
		Achievements.saveStats();
		Achievements.unlock("medic_revive");
	}

	static recordClearWeather() {
		Achievements.stats.clearWeathers = (Achievements.stats.clearWeathers || 0) + 1;
		Achievements.saveStats();
		Achievements.unlock("clear_weather");
	}

	static recordHorn() {
		Achievements.stats.hornsPlayed = (Achievements.stats.hornsPlayed || 0) + 1;
		Achievements.saveStats();
		if (typeof game !== "undefined") {
			game.playerMeHornsInRound = (game.playerMeHornsInRound || 0) + 1;
			if (game.playerMeHornsInRound >= 3) {
				Achievements.unlock("horns_3");
			}
		} else {
			Achievements.unlock("horns_3");
		}
		if (typeof board !== "undefined" && board.row && board.row[3] && board.row[4] && board.row[5]) {
			if (board.row[3].effects && board.row[3].effects.horn > 0 &&
			    board.row[4].effects && board.row[4].effects.horn > 0 &&
			    board.row[5].effects && board.row[5].effects.horn > 0) {
				Achievements.unlock("horns_3");
			}
		}
	}

	static recordLeaderUsed() {
		Achievements.stats.leaderUsed = (Achievements.stats.leaderUsed || 0) + 1;
		Achievements.saveStats();
		Achievements.unlock("use_leader");
	}

	static recordRoach() {
		Achievements.stats.summonRoach = (Achievements.stats.summonRoach || 0) + 1;
		Achievements.saveStats();
		Achievements.unlock("summon_roach");
	}

	static recordRoundWin(myCardsCount, hasWeather) {
		if (hasWeather) {
			Achievements.recordWeatherRoundWin();
		}
		if (myCardsCount >= 20) {
			Achievements.stats.cards20Round = (Achievements.stats.cards20Round || 0) + 1;
			Achievements.saveStats();
			Achievements.unlock("cards_20_round");
		}
		if (myCardsCount === 1) {
			Achievements.stats.winRound1Card = (Achievements.stats.winRound1Card || 0) + 1;
			Achievements.saveStats();
			Achievements.unlock("win_round_1_card");
		}
	}

	static getLangKey() {
		const lang = localStorage.getItem("gc-language") || "en";
		if (lang.startsWith("pt")) return "pt";
		if (lang.startsWith("es")) return "es";
		if (lang.startsWith("pl")) return "pl";
		return "en";
	}

	static getText(obj) {
		if (!obj) return "";
		const l = Achievements.getLangKey();
		return obj[l] || obj["pt"] || obj["en"] || "";
	}

	static setFilter(filter) {
		Achievements.currentFilter = filter;
		document.querySelectorAll(".ach-filter-btn").forEach(btn => {
			if (btn.getAttribute("data-filter") === filter) {
				btn.classList.add("active");
			} else {
				btn.classList.remove("active");
			}
		});
		Achievements.renderUI(filter);
	}

	static renderUI(filter = 'all') {
		Achievements.currentFilter = filter;
		const container = document.getElementById("achievements-list");
		const summaryElem = document.getElementById("achievements-summary");
		if (!container) return;

		const total = ACHIEVEMENTS_DATA.length;
		const unlockedCount = Object.keys(Achievements.unlocked).filter(k => Achievements.unlocked[k].unlocked).length;
		const percentage = Math.round((unlockedCount / total) * 100);

		if (summaryElem) {
			const lang = Achievements.getLangKey();
			let countText = `${unlockedCount} / ${total} (${percentage}%)`;
			if (lang === "pt") countText += " Desbloqueadas";
			else if (lang === "es") countText += " Desbloqueados";
			else if (lang === "pl") countText += " Odblokowane";
			else countText += " Unlocked";
			summaryElem.textContent = countText;
		}

		container.innerHTML = "";

		const itemsToRender = ACHIEVEMENTS_DATA.filter(ach => {
			const isUnl = Achievements.isUnlocked(ach.id);
			if (filter === "unlocked") return isUnl;
			if (filter === "locked") return !isUnl;
			return true;
		});

		itemsToRender.forEach(ach => {
			const isUnl = Achievements.isUnlocked(ach.id);
			const titleText = Achievements.getText(ach.title);
			const descText = Achievements.getText(ach.desc);
			const secretText = Achievements.getText(ach.secret);
			const unlockedData = Achievements.unlocked[ach.id];

			const card = document.createElement("div");
			card.className = "ach-card " + (isUnl ? "unlocked" : "locked");

			// Card header
			const header = document.createElement("div");
			header.className = "ach-card-header";

			const iconBadge = document.createElement("div");
			iconBadge.className = "ach-icon-badge";
			iconBadge.textContent = isUnl ? ach.icon : "🔒";

			const titleBox = document.createElement("div");
			titleBox.className = "ach-title-box";

			const titleElem = document.createElement("div");
			titleElem.className = "ach-card-title";
			titleElem.textContent = titleText;

			const statusBadge = document.createElement("span");
			statusBadge.className = "ach-status-badge " + (isUnl ? "badge-unlocked" : "badge-locked");
			if (isUnl) {
				statusBadge.textContent = "✓ " + (unlockedData && unlockedData.unlockedAt ? unlockedData.unlockedAt : "OK");
			} else {
				const current = Math.min(ach.target, ach.getProgress(Achievements.stats));
				statusBadge.textContent = ach.type === "count" ? `${current} / ${ach.target}` : "0 / 1";
			}

			titleBox.appendChild(titleElem);
			titleBox.appendChild(statusBadge);

			header.appendChild(iconBadge);
			header.appendChild(titleBox);
			card.appendChild(header);

			// Description
			const descElem = document.createElement("div");
			descElem.className = "ach-card-desc";
			descElem.textContent = descText;
			card.appendChild(descElem);

			// Progress bar if locked and count type
			if (!isUnl && ach.type === "count") {
				const current = Math.min(ach.target, ach.getProgress(Achievements.stats));
				const pct = Math.min(100, Math.round((current / ach.target) * 100));
				const barBox = document.createElement("div");
				barBox.className = "ach-progress-bar-box";
				barBox.innerHTML = `
					<div class="ach-progress-bar-fill" style="width: ${pct}%;"></div>
					<span class="ach-progress-text">${current} / ${ach.target}</span>
				`;
				card.appendChild(barBox);
			}

			// Secret Message Box (Only revealed after unlock!)
			const secretBox = document.createElement("div");
			secretBox.className = "ach-secret-box " + (isUnl ? "revealed" : "sealed");

			if (isUnl) {
				const lang = Achievements.getLangKey();
				let secretHeader = "📜 Mensagem Revelada:";
				if (lang === "en") secretHeader = "📜 Lore Message:";
				else if (lang === "es") secretHeader = "📜 Mensaje Revelado:";
				else if (lang === "pl") secretHeader = "📜 Odkryty Zapis:";

				secretBox.innerHTML = `
					<div class="ach-secret-header">${secretHeader}</div>
					<div class="ach-secret-content">"${secretText}"</div>
				`;
			} else {
				const lang = Achievements.getLangKey();
				let lockedMsg = "🔒 Mensagem secreta selada — Desbloqueie esta conquista para revelar.";
				if (lang === "en") lockedMsg = "🔒 Sealed secret message — Unlock this achievement to reveal.";
				else if (lang === "es") lockedMsg = "🔒 Mensaje secreto sellado — Desbloquea este logro para revelar.";
				else if (lang === "pl") lockedMsg = "🔒 Zapieczętowana wiadomość — Odblokuj to osiągnięcie, aby odkryć.";

				secretBox.innerHTML = `<span class="ach-sealed-text">${lockedMsg}</span>`;
			}

			card.appendChild(secretBox);
			container.appendChild(card);
		});
	}

	static showToast(ach) {
		if (typeof document === "undefined") return;
		let container = document.getElementById("achievement-toast-container");
		if (!container) {
			container = document.createElement("div");
			container.id = "achievement-toast-container";
			document.body.appendChild(container);
		}

		const lang = Achievements.getLangKey();
		let toastTitle = "CONQUISTA DESBLOQUEADA!";
		if (lang === "en") toastTitle = "ACHIEVEMENT UNLOCKED!";
		else if (lang === "es") toastTitle = "¡LOGRO DESBLOQUEADO!";
		else if (lang === "pl") toastTitle = "OSIĄGNIĘCIE ODBLOKOWANE!";

		const toast = document.createElement("div");
		toast.className = "ach-toast-card";

		const titleText = Achievements.getText(ach.title);
		const descText = Achievements.getText(ach.desc);

		toast.innerHTML = `
			<div class="ach-toast-icon">${ach.icon}</div>
			<div class="ach-toast-info">
				<div class="ach-toast-header">${toastTitle}</div>
				<div class="ach-toast-name">${titleText}</div>
				<div class="ach-toast-desc">${descText}</div>
			</div>
		`;

		container.appendChild(toast);

		setTimeout(() => {
			toast.classList.add("fade-out");
			setTimeout(() => {
				if (toast.parentElement) toast.parentElement.removeChild(toast);
			}, 600);
		}, 4200);
	}
}

// Auto init
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
	window.addEventListener("DOMContentLoaded", () => {
		Achievements.init();
	});
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = { Achievements, ACHIEVEMENTS_DATA };
}
