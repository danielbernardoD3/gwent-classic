const fs = require('fs');
const list = require('./cards_reference.json');

// Helper to make an opponent deck given faction, leader, and card pairs
function makeDeck(faction, leader, pairs) {
    return {
        faction,
        leader,
        cards: pairs.map(([idx, count]) => ({ index: idx, count }))
    };
}

const STORY_DATA = {
    STARTING_CROWNS: 2000,
    
    STARTER_DECKS: {
        realms: {
            name: "Reinos do Norte",
            leader: 22, // Foltest - King of Temeria
            cards: [[42, 1], [43, 1], [40, 2], [35, 1], [36, 1], [44, 1], [53, 1], [27, 1], [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [52, 1], [16, 1], [13, 1], [2, 1], [9, 1], [4, 1], [1, 1]]
        },
        nilfgaard: {
            name: "Império de Nilfgaard",
            leader: 57, // Emhyr var Emreis - Emperor of Nilfgaard
            cards: [[71, 2], [76, 2], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [89, 1], [90, 1], [16, 1], [13, 1], [2, 1], [9, 1], [4, 1], [1, 1]]
        },
        monsters: {
            name: "Monstros",
            leader: 93, // Eredin - Commander of the Red Riders
            cards: [[117, 2], [127, 2], [98, 2], [122, 1], [113, 1], [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [103, 1], [104, 1], [110, 1], [116, 1], [123, 1], [16, 1], [2, 1], [9, 1], [10, 1]]
        },
        scoiatael: {
            name: "Scoia'tael",
            leader: 141, // Francesca Findabair - Daisy of the Valley
            cards: [[151, 2], [177, 2], [162, 2], [148, 1], [149, 1], [147, 1], [145, 1], [146, 1], [144, 1], [158, 1], [165, 1], [168, 1], [169, 1], [176, 1], [16, 1], [13, 1], [11, 1], [4, 1], [1, 1]]
        },
        skellige: {
            name: "Skellige",
            leader: 211, // Crach an Craite
            cards: [[192, 2], [185, 2], [186, 1], [200, 2], [209, 2], [183, 1], [193, 1], [190, 1], [191, 1], [181, 1], [205, 1], [208, 1], [198, 1], [16, 1], [202, 1], [204, 1], [4, 1], [1, 1]]
        }
    },

    TROPHIES: {
        trophy_white_orchard: {
            id: "trophy_white_orchard",
            title: "Campeão de Pomar Branco",
            region: "Pomar Branco",
            icon: "🏆",
            desc: "Venceu o Torneio dos Pioneiros em Pomar Branco."
        },
        trophy_velen: {
            id: "trophy_velen",
            title: "Campeão de Velen",
            region: "Velen",
            icon: "⚔️",
            desc: "Derrotou os mais impiedosos senhores da guerra na Terra de Ninguém."
        },
        trophy_vizima: {
            id: "trophy_vizima",
            title: "Mestre da Corte de Vízima",
            region: "Vízima",
            icon: "👑",
            desc: "Triunfou sobre nobres e generais no Torneio Real de Vízima."
        },
        trophy_novigrad: {
            id: "trophy_novigrad",
            title: "Campeão do Passiflora",
            region: "Novigrad",
            icon: "⚜️",
            desc: "Consagrado no prestigiado Grande Torneio do Passiflora em Novigrad."
        },
        trophy_skellige: {
            id: "trophy_skellige",
            title: "Campeão dos Clãs de Skellige",
            region: "Skellige",
            icon: "🛡️",
            desc: "Provou seu valor lendário no Salão de Kaer Trolde contra os Jarls."
        },
        trophy_toussaint: {
            id: "trophy_toussaint",
            title: "Grande Campeão de Beauclair",
            region: "Toussaint",
            icon: "🍷",
            desc: "Alcançou a glória máxima no Magnífico Grande Torneio Ducal de Beauclair."
        }
    },

    SHOPS: {
        velen_shop: {
            id: "velen_shop",
            name: "Mercador de Valetorta",
            region: "Velen",
            greeting: "Saudações, viajante! Tenho cartas recuperadas dos campos de batalha da Terra de Ninguém.",
            items: [
                { cardIndex: 2, price: 350, max: 2, name: "Biting Frost" },
                { cardIndex: 40, price: 200, max: 2, name: "Poor Fucking Infantry" },
                { cardIndex: 7, price: 750, max: 1, name: "Emiel Regis Rohellec Terzieff" },
                { cardIndex: 74, price: 300, max: 1, name: "Morteisen" },
                { cardIndex: 20, price: 450, max: 1, name: "Cow" }
            ]
        },
        vizima_shop: {
            id: "vizima_shop",
            name: "Empório Real de Vízima",
            region: "Vízima",
            greeting: "Bem-vindo a Vízima! Apenas artigos de alta nobreza e tática refinada.",
            items: [
                { cardIndex: 5, price: 600, max: 1, name: "Commander's Horn" },
                { cardIndex: 10, price: 550, max: 1, name: "Scorch" },
                { cardIndex: 1, price: 450, max: 1, name: "Decoy" },
                { cardIndex: 13, price: 650, max: 1, name: "Vesemir" },
                { cardIndex: 49, price: 1100, max: 1, name: "Thaler (Spy 1)" }
            ]
        },
        nov_shop: {
            id: "nov_shop",
            name: "Empório da Praça do Hierarca",
            region: "Novigrad",
            greeting: "Ouro fala mais alto em Novigrad! As cartas mais cobiçadas do mercado livre estão aqui.",
            items: [
                { cardIndex: 14, price: 1300, max: 1, name: "Villentretenmerth (Scorch 7)" },
                { cardIndex: 0, price: 1900, max: 1, name: "Mysterious Elf / Avallac'h (Hero Spy 0)" },
                { cardIndex: 17, price: 1000, max: 1, name: "Olgierd von Everec" },
                { cardIndex: 18, price: 1200, max: 1, name: "Gaunter O'Dimm" },
                { cardIndex: 214, price: 700, max: 1, name: "Roach" }
            ]
        },
        skel_shop: {
            id: "skel_shop",
            name: "Feirante Marítimo de Kaer Trolde",
            region: "Skellige",
            greeting: "Pelo sangue de Freya! Cartas forjadas no vento e no mar salgado das ilhas.",
            items: [
                { cardIndex: 202, price: 400, max: 2, name: "Mardroeme" },
                { cardIndex: 204, price: 450, max: 1, name: "Skellige Storm" },
                { cardIndex: 197, price: 1500, max: 1, name: "Hjalmar an Craite (Hero 10)" },
                { cardIndex: 203, price: 1100, max: 1, name: "Olaf o Urso (12)" },
                { cardIndex: 212, price: 1700, max: 1, name: "King Bran (Líder)" }
            ]
        },
        tous_shop: {
            id: "tous_shop",
            name: "Boutique Ducal de Beauclair",
            region: "Toussaint",
            greeting: "Ah, cavalheiro! Em Beauclair apreciamos o vinho fino e líderes lendários do Gwent.",
            items: [
                { cardIndex: 139, price: 2100, max: 1, name: "Francesca - Queen of Dol Blathanna (Líder)" },
                { cardIndex: 25, price: 1900, max: 1, name: "Foltest - The Steel-Forged (Líder)" },
                { cardIndex: 26, price: 1900, max: 1, name: "Foltest - Son of Medell (Líder)" },
                { cardIndex: 60, price: 2300, max: 1, name: "Emhyr - Invader of the North (Líder)" },
                { cardIndex: 97, price: 2100, max: 1, name: "Eredin - The Treacherous (Líder)" }
            ]
        }
    },

    NODES: {
        // --- REGION 1: POMAR BRANCO ---
        wo_tavern: {
            id: "wo_tavern",
            region: "Pomar Branco",
            name: "Taverna de Pomar Branco",
            lore: "A estalagem onde tudo começou. Elsa gosta de desafiar viajantes para uma rodada amistosa com seu baralho de monstros.",
            type: "battle",
            x: 1700,
            y: 1300,
            opponent: {
                name: "Elsa (Taverneira)",
                avatar: "img/sm/monsters_katakan.jpg",
                faction: "monsters",
                leader: 93,
                deck: makeDeck("monsters", 93, [
                    [117, 1], [127, 2], [113, 1], [122, 1], [137, 1], [114, 1], [135, 1],
                    [102, 1], [103, 1], [104, 1], [110, 1], [116, 1], [123, 1], [121, 1],
                    [136, 1], [16, 1], [13, 1], [2, 1], [9, 1], [10, 1], [117, 1], [127, 1]
                ])
            },
            crownsReward: 200,
            crownsReplay: 50,
            crownsLoss: 50,
            cardDrop: { index: 135, count: 1, name: "Vampire - Katakan" },
            prereqs: [],
            connections: ["wo_garrison", "wo_blacksmith"]
        },

        wo_garrison: {
            id: "wo_garrison",
            region: "Pomar Branco",
            name: "Guarnição Nilfgaardiana",
            lore: "O estudioso Aldert Geert passa o tempo catalogando a história da guerra e jogando baralhos táticos dos Reinos do Norte.",
            type: "battle",
            x: 1640,
            y: 1260,
            opponent: {
                name: "Estudioso Aldert Geert",
                avatar: "img/sm/realms_dethmold.jpg",
                faction: "realms",
                leader: 22,
                deck: makeDeck("realms", 22, [
                    [42, 1], [43, 1], [40, 2], [35, 1], [36, 1], [44, 1], [53, 1], [27, 1],
                    [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [52, 1], [16, 1],
                    [13, 1], [2, 1], [9, 1], [4, 1], [1, 1], [35, 1]
                ])
            },
            crownsReward: 220,
            crownsReplay: 60,
            crownsLoss: 60,
            cardDrop: { index: 31, count: 1, name: "Dethmold" },
            prereqs: ["wo_tavern"],
            connections: ["wo_tavern", "wo_ford"]
        },

        wo_blacksmith: {
            id: "wo_blacksmith",
            region: "Pomar Branco",
            name: "Oficina do Ferreiro Willis",
            lore: "O habilidoso ferreiro anão Willis empunha o martelo de dia e cartas Scoia'tael à noite.",
            type: "battle",
            x: 1760,
            y: 1340,
            opponent: {
                name: "Ferreiro Willis",
                avatar: "img/sm/scoiatael_vrihedd_cadet.jpg",
                faction: "scoiatael",
                leader: 141,
                deck: makeDeck("scoiatael", 141, [
                    [151, 2], [177, 2], [162, 2], [148, 1], [149, 1], [147, 1], [145, 1],
                    [146, 1], [144, 1], [158, 1], [165, 1], [168, 1], [169, 1], [176, 1],
                    [16, 1], [13, 1], [11, 1], [4, 1], [1, 1], [151, 1]
                ])
            },
            crownsReward: 240,
            crownsReplay: 60,
            crownsLoss: 60,
            cardDrop: { index: 177, count: 1, name: "Vrihedd Brigade Recruit" },
            prereqs: ["wo_tavern"],
            connections: ["wo_tavern", "wo_ford", "pontar_flotsam"]
        },

        wo_ford: {
            id: "wo_ford",
            region: "Pomar Branco",
            name: "Ninho do Grifo de Pomar Branco",
            lore: "Um caçador local que rastreou o Grifo Real nas montanhas tem um baralho selvagem de monstros.",
            type: "battle",
            x: 1700,
            y: 1220,
            opponent: {
                name: "Caçador das Colinas",
                avatar: "img/sm/monsters_gryffin.jpg",
                faction: "monsters",
                leader: 94,
                deck: makeDeck("monsters", 94, [
                    [117, 2], [127, 2], [98, 2], [122, 1], [113, 1], [137, 1], [114, 1],
                    [121, 1], [136, 1], [102, 1], [103, 1], [104, 1], [110, 1], [116, 1],
                    [123, 1], [16, 1], [2, 1], [9, 1], [10, 1], [121, 1]
                ])
            },
            crownsReward: 280,
            crownsReplay: 70,
            crownsLoss: 70,
            cardDrop: { index: 121, count: 1, name: "Griffin" },
            prereqs: ["wo_garrison", "wo_blacksmith"],
            connections: ["wo_garrison", "wo_blacksmith", "wo_tourney", "velen_inn", "vizima_palace"]
        },

        wo_tourney: {
            id: "wo_tourney",
            region: "Pomar Branco",
            name: "Torneio dos Pioneiros de Pomar Branco",
            lore: "O primeiro grande torneio da sua jornada! Enfrente três oponentes consecutivos para conquistar o título e uma carta de líder lendária.",
            type: "tournament",
            x: 1610,
            y: 1350,
            entryFee: 400,
            grandPrizeCrowns: 1200,
            grandPrizeCard: { index: 23, count: 1, name: "Foltest - Lord Commander of the North" },
            trophyId: "trophy_white_orchard",
            rounds: [
                {
                    opponentName: "Guarda Temeriano",
                    faction: "realms",
                    leader: 22,
                    deck: makeDeck("realms", 22, [[42, 2], [40, 2], [35, 2], [44, 1], [53, 1], [27, 1], [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [16, 1], [13, 1], [2, 1], [9, 1], [1, 1]])
                },
                {
                    opponentName: "Caçador Mislav",
                    faction: "scoiatael",
                    leader: 141,
                    deck: makeDeck("scoiatael", 141, [[151, 2], [177, 2], [162, 2], [148, 2], [145, 1], [146, 1], [144, 1], [158, 1], [165, 1], [168, 1], [16, 1], [13, 1], [11, 1], [4, 1], [1, 1]])
                },
                {
                    opponentName: "Oficial Peter Saar Gwynleve",
                    faction: "nilfgaard",
                    leader: 57,
                    deck: makeDeck("nilfgaard", 57, [[71, 3], [76, 2], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [89, 1], [16, 1], [13, 1], [2, 1], [1, 1]])
                }
            ],
            prereqs: ["wo_ford"],
            connections: ["wo_ford", "velen_inn"]
        },

        // --- REGION 2: VELEN (TERRA DE NINGUÉM) ---
        velen_inn: {
            id: "velen_inn",
            region: "Velen",
            name: "Estalagem na Encruzilhada",
            lore: "Uma encruzilhada perigosa em Velen. O taverneiro mantém contato com patrulhas nilfgaardianas e coleciona cartas imperiais.",
            type: "battle",
            x: 1440,
            y: 1350,
            opponent: {
                name: "Taverneiro da Encruzilhada",
                avatar: "img/sm/nilfgaard_imperal_brigade.jpg",
                faction: "nilfgaard",
                leader: 57,
                deck: makeDeck("nilfgaard", 57, [
                    [71, 3], [76, 2], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1],
                    [65, 1], [67, 1], [69, 1], [87, 1], [89, 1], [90, 1], [16, 1], [13, 1],
                    [2, 1], [9, 1], [4, 1], [1, 1]
                ])
            },
            crownsReward: 300,
            crownsReplay: 75,
            crownsLoss: 80,
            cardDrop: { index: 71, count: 1, name: "Impera Brigade Guard" },
            prereqs: ["wo_ford"],
            connections: ["wo_tourney", "velen_blackbough", "velen_perch", "velen_shop"]
        },

        velen_blackbough: {
            id: "velen_blackbough",
            region: "Velen",
            name: "Aldeia de Blackbough",
            lore: "Uma vila rústica no coração de Velen. O artesão local troca flechas e segredos do Gwent Scoia'tael.",
            type: "battle",
            x: 1320,
            y: 1370,
            opponent: {
                name: "Artesão de Blackbough",
                avatar: "img/sm/scoiatael_dol_archer.jpg",
                faction: "scoiatael",
                leader: 141,
                deck: makeDeck("scoiatael", 141, [
                    [151, 3], [177, 2], [162, 2], [148, 2], [147, 1], [145, 1], [146, 1],
                    [144, 1], [158, 1], [165, 1], [168, 2], [176, 1], [16, 1], [13, 1],
                    [11, 1], [4, 1], [1, 1]
                ])
            },
            crownsReward: 320,
            crownsReplay: 80,
            crownsLoss: 80,
            cardDrop: { index: 147, count: 1, name: "Dol Blathanna Archer" },
            prereqs: ["velen_inn"],
            connections: ["velen_inn", "velen_soothsayer", "velen_perch"]
        },

        velen_perch: {
            id: "velen_perch",
            region: "Velen",
            name: "Poleiro do Corvo (Crow's Perch)",
            lore: "A fortaleza do infame Barão Sanguinário. Phillip Strenger é um jogador impetuoso que aposta alto seu espião mais valioso.",
            type: "battle",
            x: 1240,
            y: 1290,
            opponent: {
                name: "Barão Sanguinário (Phillip Strenger)",
                avatar: "img/sm/realms_dijkstra.jpg",
                faction: "monsters",
                leader: 95,
                deck: makeDeck("monsters", 95, [
                    [117, 3], [127, 3], [98, 3], [122, 1], [113, 1], [137, 1], [114, 1],
                    [121, 1], [136, 1], [102, 1], [103, 1], [104, 1], [110, 1], [116, 1],
                    [123, 1], [16, 1], [13, 1], [2, 1], [9, 1], [10, 1], [47, 1]
                ])
            },
            crownsReward: 450,
            crownsReplay: 120,
            crownsLoss: 100,
            cardDrop: { index: 47, count: 1, name: "Sigismund Dijkstra (Spy 4)" },
            prereqs: ["velen_inn"],
            connections: ["velen_inn", "velen_blackbough", "velen_bog", "velen_tourney", "nov_cats"]
        },

        velen_soothsayer: {
            id: "velen_soothsayer",
            region: "Velen",
            name: "Cabana do Vidente de Benek",
            lore: "O ermitão cego de Benek lê o destino nas estrelas e nas cartas mais sinistras das bruxas.",
            type: "battle",
            x: 1260,
            y: 1420,
            opponent: {
                name: "O Vidente de Benek",
                avatar: "img/sm/monsters_witch_velen_1.jpg",
                faction: "monsters",
                leader: 93,
                deck: makeDeck("monsters", 93, [
                    [105, 1], [106, 1], [107, 1], [117, 2], [127, 2], [98, 2], [122, 1],
                    [113, 1], [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [103, 1],
                    [104, 1], [16, 1], [2, 1], [9, 1], [10, 1]
                ])
            },
            crownsReward: 350,
            crownsReplay: 90,
            crownsLoss: 90,
            cardDrop: { index: 106, count: 1, name: "Crone - Weavess" },
            prereqs: ["velen_blackbough"],
            connections: ["velen_blackbough", "velen_bog"]
        },

        velen_bog: {
            id: "velen_bog",
            region: "Velen",
            name: "Pântano do Corcunda (Crookback Bog)",
            lore: "Um lamaçal enevoado onde habitam espíritos ancestrais da floresta. O Leshen guarda os segredos do pântano.",
            type: "battle",
            x: 1310,
            y: 1510,
            opponent: {
                name: "Bruxas do Pântano",
                avatar: "img/sm/monsters_leshen.jpg",
                faction: "monsters",
                leader: 96,
                deck: makeDeck("monsters", 96, [
                    [105, 1], [106, 1], [107, 1], [126, 1], [117, 3], [127, 3], [98, 3],
                    [122, 1], [113, 1], [137, 1], [114, 1], [121, 1], [136, 1], [123, 1],
                    [16, 1], [2, 1], [9, 1], [10, 1], [5, 1]
                ])
            },
            crownsReward: 400,
            crownsReplay: 100,
            crownsLoss: 100,
            cardDrop: { index: 126, count: 1, name: "Leshen (Hero 10)" },
            prereqs: ["velen_perch", "velen_soothsayer"],
            connections: ["velen_perch", "velen_soothsayer", "velen_tourney"]
        },

        velen_shop: {
            id: "velen_shop",
            region: "Velen",
            name: "Mercador de Valetorta",
            lore: "Compre cartas úteis que não são obtidas em batalhas com as coroas que juntou.",
            type: "shop",
            x: 1380,
            y: 1300,
            connections: ["velen_inn"]
        },

        velen_tourney: {
            id: "velen_tourney",
            region: "Velen",
            name: "Torneio dos Senhores da Guerra de Velen",
            lore: "Um torneio de apostas pesadas entre os guerreiros mais temidos da Terra de Ninguém. Três rodadas pela glória de Velen!",
            type: "tournament",
            x: 1190,
            y: 1460,
            entryFee: 600,
            grandPrizeCrowns: 1800,
            grandPrizeCard: { index: 15, count: 1, name: "Yennefer of Vengerberg (Hero Medic 7)" },
            trophyId: "trophy_velen",
            rounds: [
                {
                    opponentName: "Sargento Ardal",
                    faction: "nilfgaard",
                    leader: 57,
                    deck: makeDeck("nilfgaard", 57, [[71, 3], [76, 3], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [16, 1], [13, 1], [2, 1], [1, 1]])
                },
                {
                    opponentName: "Ronvid de Pequeno Vale",
                    faction: "realms",
                    leader: 22,
                    deck: makeDeck("realms", 22, [[42, 2], [40, 3], [35, 2], [44, 1], [53, 1], [27, 1], [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [16, 1], [13, 1], [2, 1], [1, 1]])
                },
                {
                    opponentName: "Phillip Strenger (Barão Sanguinário)",
                    faction: "monsters",
                    leader: 95,
                    deck: makeDeck("monsters", 95, [[117, 3], [127, 3], [98, 3], [122, 1], [113, 1], [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [123, 1], [16, 1], [13, 1], [2, 1], [10, 1]])
                }
            ],
            prereqs: ["velen_perch", "velen_bog"],
            connections: ["velen_perch", "velen_bog", "nov_cats"]
        },

        // --- REGION 3: VÍZIMA & VALE DO PONTAR ---
        vizima_palace: {
            id: "vizima_palace",
            region: "Vízima",
            name: "Castelo Real de Vízima",
            lore: "O embaixador Henry var Attre representa o poder do Sol Negro e joga com a elite da nobreza imperial.",
            type: "battle",
            x: 1520,
            y: 1210,
            opponent: {
                name: "Embaixador Henry var Attre",
                avatar: "img/sm/nilfgaard_stefan.jpg",
                faction: "nilfgaard",
                leader: 58,
                deck: makeDeck("nilfgaard", 58, [
                    [84, 1], [71, 3], [76, 3], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1],
                    [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [89, 1], [90, 1], [16, 1],
                    [13, 1], [2, 1], [9, 1], [4, 1], [1, 1]
                ])
            },
            crownsReward: 380,
            crownsReplay: 90,
            crownsLoss: 90,
            cardDrop: { index: 84, count: 1, name: "Stefan Skellen (Spy 9)" },
            prereqs: ["wo_ford"],
            connections: ["wo_ford", "vizima_chamberlain", "vizima_shop", "vizima_tourney"]
        },

        vizima_chamberlain: {
            id: "vizima_chamberlain",
            region: "Vízima",
            name: "Aposentos do Camareiro",
            lore: "O jovem e perspicaz general Morvran Voorhis é um estrategista nato que não aceita perder.",
            type: "battle",
            x: 1590,
            y: 1160,
            opponent: {
                name: "Camareiro Morvran Voorhis",
                avatar: "img/sm/nilfgaard_moorvran.jpg",
                faction: "nilfgaard",
                leader: 59,
                deck: makeDeck("nilfgaard", 59, [
                    [75, 1], [71, 3], [76, 3], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1],
                    [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [89, 1], [90, 1], [16, 1],
                    [13, 1], [2, 1], [9, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 420,
            crownsReplay: 100,
            crownsLoss: 100,
            cardDrop: { index: 75, count: 1, name: "Morvran Voorhis (Hero 10)" },
            prereqs: ["vizima_palace"],
            connections: ["vizima_palace", "vizima_tourney", "pontar_flotsam"]
        },

        pontar_flotsam: {
            id: "pontar_flotsam",
            region: "Vale do Pontar",
            name: "Posto Comercial de Flotsam",
            lore: "O posto fluvial disputado entre Reinos do Norte e Não-Humanos. O comandante Loredo aposta com a força do exército de Temeria.",
            type: "battle",
            x: 1880,
            y: 1070,
            opponent: {
                name: "Comandante Bernard Loredo",
                avatar: "img/sm/realms_vernon.jpg",
                faction: "realms",
                leader: 24,
                deck: makeDeck("realms", 24, [
                    [51, 1], [42, 2], [43, 2], [40, 3], [35, 2], [44, 1], [53, 1], [27, 1],
                    [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [52, 1], [16, 1],
                    [13, 1], [2, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 380,
            crownsReplay: 90,
            crownsLoss: 90,
            cardDrop: { index: 51, count: 1, name: "Vernon Roche (Hero 10)" },
            prereqs: ["wo_blacksmith", "vizima_chamberlain"],
            connections: ["wo_blacksmith", "vizima_chamberlain", "pontar_forest"]
        },

        pontar_forest: {
            id: "pontar_forest",
            region: "Vale do Pontar",
            name: "Floresta Escura de Flotsam",
            lore: "O elfo Cedric conhece cada trilha e cada truque da floresta, liderando uma guerrilha ágil com baralhos Scoia'tael.",
            type: "battle",
            x: 2000,
            y: 1040,
            opponent: {
                name: "Cedric de Flotsam",
                avatar: "img/sm/scoiatael_ciaran.jpg",
                faction: "scoiatael",
                leader: 141,
                deck: makeDeck("scoiatael", 141, [
                    [144, 1], [151, 3], [177, 2], [162, 2], [148, 2], [147, 1], [145, 1],
                    [146, 1], [158, 1], [165, 1], [168, 2], [176, 1], [16, 1], [13, 1],
                    [11, 1], [4, 1], [1, 1]
                ])
            },
            crownsReward: 400,
            crownsReplay: 95,
            crownsLoss: 90,
            cardDrop: { index: 144, count: 1, name: "Ciaran aep Easnillien (Agile 3)" },
            prereqs: ["pontar_flotsam"],
            connections: ["pontar_flotsam", "pontar_vergen"]
        },

        pontar_vergen: {
            id: "pontar_vergen",
            region: "Vale do Pontar",
            name: "Portões da Fortaleza de Vergen",
            lore: "O lendário comandante dos Esquilos Iorveth defende a cidade livre com os guerreiros mais letais da linhagem élfica.",
            type: "battle",
            x: 2140,
            y: 1060,
            opponent: {
                name: "Iorveth",
                avatar: "img/sm/scoiatael_isengrim.jpg",
                faction: "scoiatael",
                leader: 140,
                deck: makeDeck("scoiatael", 140, [
                    [167, 1], [144, 1], [151, 3], [177, 2], [162, 2], [148, 2], [147, 2],
                    [145, 1], [146, 1], [158, 1], [165, 1], [168, 2], [176, 1], [16, 1],
                    [13, 1], [11, 1], [4, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 460,
            crownsReplay: 110,
            crownsLoss: 100,
            cardDrop: { index: 167, count: 1, name: "Isengrim Faoiltiarna (Hero 10)" },
            prereqs: ["pontar_forest"],
            connections: ["pontar_forest", "km_courtyard", "oxen_alchemy"]
        },

        vizima_shop: {
            id: "vizima_shop",
            region: "Vízima",
            name: "Empório Real de Vízima",
            lore: "Compre cartas táticas imperiais e espiões renomados.",
            type: "shop",
            x: 1460,
            y: 1150,
            connections: ["vizima_palace"]
        },

        vizima_tourney: {
            id: "vizima_tourney",
            region: "Vízima",
            name: "Torneio Nobiliárquico de Vízima",
            lore: "A nobreza temeriana e os oficiais nilfgaardianos medem forças em três partidas de alto prestígio.",
            type: "tournament",
            x: 1530,
            y: 1100,
            entryFee: 800,
            grandPrizeCrowns: 2500,
            grandPrizeCard: { index: 59, count: 1, name: "Emhyr var Emreis - The Relentless" },
            trophyId: "trophy_vizima",
            rounds: [
                {
                    opponentName: "Escriba Imperial Nilfgaardiano",
                    faction: "nilfgaard",
                    leader: 57,
                    deck: makeDeck("nilfgaard", 57, [[71, 3], [76, 2], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [16, 1], [13, 1], [2, 1], [1, 1]])
                },
                {
                    opponentName: "Barão de La Valette",
                    faction: "realms",
                    leader: 22,
                    deck: makeDeck("realms", 22, [[42, 2], [40, 2], [35, 2], [44, 1], [53, 1], [27, 1], [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [52, 1], [16, 1], [13, 1], [2, 1], [1, 1]])
                },
                {
                    opponentName: "General Morvran Voorhis",
                    faction: "nilfgaard",
                    leader: 59,
                    deck: makeDeck("nilfgaard", 59, [[75, 1], [84, 1], [71, 3], [76, 3], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [16, 1], [13, 1], [2, 1], [1, 1]])
                }
            ],
            prereqs: ["vizima_palace", "vizima_chamberlain"],
            connections: ["vizima_palace", "vizima_chamberlain", "oxen_alchemy"]
        },

        // --- REGION 4: NOVIGRAD & OXENFURT ---
        nov_cats: {
            id: "nov_cats",
            region: "Novigrad",
            name: "Estalagem dos Sete Gatos",
            lore: "Às portas de Novigrad, mercadores e viajantes disputam rodadas com baralhos de cerco pesados.",
            type: "battle",
            x: 1240,
            y: 950,
            opponent: {
                name: "Taverneiro Ron",
                avatar: "img/sm/realms_catapult_1.jpg",
                faction: "realms",
                leader: 24,
                deck: makeDeck("realms", 24, [
                    [29, 2], [42, 2], [40, 2], [35, 2], [44, 1], [53, 1], [27, 1], [54, 1],
                    [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [52, 1], [16, 1], [13, 1],
                    [2, 1], [9, 1], [1, 1]
                ])
            },
            crownsReward: 420,
            crownsReplay: 100,
            crownsLoss: 90,
            cardDrop: { index: 29, count: 1, name: "Catapult (8)" },
            prereqs: ["velen_perch"],
            connections: ["velen_perch", "nov_port", "oxen_alchemy"]
        },

        nov_port: {
            id: "nov_port",
            region: "Novigrad",
            name: "Porto de Novigrad",
            lore: "O lendário armeiro élfico Hatori faz lâminas afiadas e joga com líderes de rara beleza de Dol Blathanna.",
            type: "battle",
            x: 1080,
            y: 850,
            opponent: {
                name: "Mestre Hatori",
                avatar: "img/sm/scoiatael_francesca_gold.jpg",
                faction: "scoiatael",
                leader: 140,
                deck: makeDeck("scoiatael", 140, [
                    [151, 3], [177, 2], [162, 2], [148, 2], [147, 2], [145, 1], [146, 1],
                    [144, 1], [158, 1], [165, 1], [168, 2], [176, 1], [16, 1], [13, 1],
                    [11, 1], [4, 1], [1, 1]
                ])
            },
            crownsReward: 460,
            crownsReplay: 110,
            crownsLoss: 100,
            cardDrop: { index: 140, count: 1, name: "Francesca Findabair - the Beautiful (Líder)" },
            prereqs: ["nov_cats"],
            connections: ["nov_cats", "nov_bank", "skel_port"]
        },

        nov_bank: {
            id: "nov_bank",
            region: "Novigrad",
            name: "Banco Vivaldi",
            lore: "O banqueiro anão Vimme Vivaldi entende de ouro e joga com a robusta infantaria anã de Mahakam.",
            type: "battle",
            x: 1120,
            y: 800,
            opponent: {
                name: "Vimme Vivaldi",
                avatar: "img/sm/scoiatael_barclay.jpg",
                faction: "scoiatael",
                leader: 139,
                deck: makeDeck("scoiatael", 139, [
                    [145, 1], [146, 1], [151, 3], [177, 2], [162, 2], [148, 2], [147, 2],
                    [144, 1], [158, 1], [165, 1], [168, 3], [176, 1], [16, 1], [13, 1],
                    [11, 1], [4, 1], [1, 1]
                ])
            },
            crownsReward: 480,
            crownsReplay: 115,
            crownsLoss: 100,
            cardDrop: { index: 145, count: 1, name: "Barclay Els (6)" },
            prereqs: ["nov_port"],
            connections: ["nov_port", "nov_baths", "nov_shop"]
        },

        nov_baths: {
            id: "nov_baths",
            region: "Novigrad",
            name: "Termas de Dijkstra",
            lore: "O chefe dos espiões de Redania não brinca em serviço. Seu baralho é recheado de espiões e magas poderosas.",
            type: "battle",
            x: 1190,
            y: 770,
            opponent: {
                name: "Sigismund Dijkstra",
                avatar: "img/sm/realms_philippa.jpg",
                faction: "realms",
                leader: 24,
                deck: makeDeck("realms", 24, [
                    [39, 1], [47, 1], [41, 1], [29, 2], [42, 2], [40, 2], [35, 2], [44, 1],
                    [53, 1], [27, 1], [54, 1], [31, 1], [38, 1], [46, 1], [48, 1], [52, 1],
                    [16, 1], [13, 1], [2, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 520,
            crownsReplay: 125,
            crownsLoss: 120,
            cardDrop: { index: 39, count: 1, name: "Philippa Eilhart (Hero 10)" },
            prereqs: ["nov_bank"],
            connections: ["nov_bank", "nov_tourney"]
        },

        oxen_alchemy: {
            id: "oxen_alchemy",
            region: "Oxenfurt",
            name: "Taverna do Alquimista",
            lore: "Na cidade universitária de Oxenfurt, o taverneiro Stjepan possui conexões imperiais e cartas raras.",
            type: "battle",
            x: 1360,
            y: 910,
            opponent: {
                name: "Stjepan o Alquimista",
                avatar: "img/sm/nilfgaard_tibor.jpg",
                faction: "nilfgaard",
                leader: 58,
                deck: makeDeck("nilfgaard", 58, [
                    [86, 1], [71, 3], [76, 3], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1],
                    [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [89, 1], [90, 1], [16, 1],
                    [13, 1], [2, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 440,
            crownsReplay: 105,
            crownsLoss: 100,
            cardDrop: { index: 86, count: 1, name: "Tibor Eggebracht (Hero 10)" },
            prereqs: ["nov_cats", "vizima_tourney"],
            connections: ["nov_cats", "vizima_tourney", "oxen_academy", "pontar_vergen"]
        },

        oxen_academy: {
            id: "oxen_academy",
            region: "Oxenfurt",
            name: "Academia de Oxenfurt",
            lore: "A brilhante médica Shani tem grande apreço pelo bardo Dandelion e joga partidas animadas e táticas.",
            type: "battle",
            x: 1440,
            y: 880,
            opponent: {
                name: "Shani",
                avatar: "img/sm/neutral_dandelion.jpg",
                faction: "realms",
                leader: 22,
                deck: makeDeck("realms", 22, [
                    [6, 1], [42, 2], [43, 2], [40, 2], [35, 2], [44, 1], [53, 1], [27, 1],
                    [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1], [52, 1], [16, 1],
                    [13, 1], [2, 1], [9, 1], [1, 1]
                ])
            },
            crownsReward: 480,
            crownsReplay: 115,
            crownsLoss: 100,
            cardDrop: { index: 6, count: 1, name: "Dandelion (Horn 2)" },
            prereqs: ["oxen_alchemy"],
            connections: ["oxen_alchemy", "nov_tourney"]
        },

        nov_shop: {
            id: "nov_shop",
            region: "Novigrad",
            name: "Empório da Praça do Hierarca",
            lore: "As cartas mais raras e místicas de Novigrad à venda por coroas.",
            type: "shop",
            x: 1140,
            y: 890,
            connections: ["nov_bank"]
        },

        nov_tourney: {
            id: "nov_tourney",
            region: "Novigrad",
            name: "O Grande Torneio do Passiflora",
            lore: "O evento de Gwent mais ilustre de Novigrad! Três batalhas consecutivas com os maiores colecionadores do continente valendo a lendária Ciri.",
            type: "tournament",
            x: 1100,
            y: 720,
            entryFee: 1000,
            grandPrizeCrowns: 3500,
            grandPrizeCard: { index: 3, count: 1, name: "Cirilla Fiona Elen Riannon (Hero 15)" },
            trophyId: "trophy_novigrad",
            rounds: [
                {
                    opponentName: "Bernard Tulle o Metade",
                    faction: "scoiatael",
                    leader: 140,
                    deck: makeDeck("scoiatael", 140, [[167, 1], [144, 1], [151, 3], [177, 2], [162, 2], [148, 2], [147, 2], [145, 1], [146, 1], [158, 1], [165, 1], [168, 2], [176, 1], [16, 1], [13, 1], [1, 1]])
                },
                {
                    opponentName: "Marquise Serenity",
                    faction: "monsters",
                    leader: 94,
                    deck: makeDeck("monsters", 94, [[126, 1], [117, 3], [127, 3], [98, 3], [122, 1], [113, 1], [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [103, 1], [104, 1], [16, 1], [2, 1], [10, 1]])
                },
                {
                    opponentName: "Conde Tybalt",
                    faction: "nilfgaard",
                    leader: 59,
                    deck: makeDeck("nilfgaard", 59, [[86, 1], [75, 1], [84, 1], [71, 3], [76, 3], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [16, 1], [1, 1], [5, 1]])
                }
            ],
            prereqs: ["nov_baths", "oxen_academy"],
            connections: ["nov_baths", "oxen_academy", "skel_port", "km_courtyard"]
        },

        // --- REGION 5: SKELLIGE ---
        skel_port: {
            id: "skel_port",
            region: "Skellige",
            name: "Porto de Kaer Trolde",
            lore: "O porto imponente sob os penhascos de Ard Skellig. O ferreiro an Craite usa guerreiros leais do clã.",
            type: "battle",
            x: 560,
            y: 1470,
            opponent: {
                name: "Ferreiro an Craite",
                avatar: "img/sm/skellige_craite_warrior.jpg",
                faction: "skellige",
                leader: 211,
                deck: makeDeck("skellige", 211, [
                    [192, 3], [185, 2], [186, 1], [200, 2], [209, 2], [183, 1], [193, 1],
                    [190, 1], [191, 1], [181, 1], [205, 1], [208, 1], [198, 1], [16, 1],
                    [202, 1], [204, 1], [4, 1], [1, 1]
                ])
            },
            crownsReward: 480,
            crownsReplay: 120,
            crownsLoss: 100,
            cardDrop: { index: 192, count: 1, name: "Clan an Craite Warrior" },
            prereqs: ["nov_port"],
            connections: ["nov_port", "skel_hall", "skel_shop"]
        },

        skel_hall: {
            id: "skel_hall",
            region: "Skellige",
            name: "Salão dos Heróis de Kaer Trolde",
            lore: "O Jarl de Kaer Trolde, Crach an Craite, desafia qualquer um que queira provar bravura ao redor da fogueira.",
            type: "battle",
            x: 600,
            y: 1420,
            opponent: {
                name: "Jarl Crach an Craite",
                avatar: "img/sm/skellige_crach_an_craite.jpg",
                faction: "skellige",
                leader: 211,
                deck: makeDeck("skellige", 211, [
                    [192, 3], [185, 2], [186, 1], [200, 3], [209, 3], [183, 1], [193, 1],
                    [190, 1], [191, 1], [181, 1], [205, 1], [208, 1], [198, 1], [16, 1],
                    [13, 1], [202, 2], [204, 1], [1, 1]
                ])
            },
            crownsReward: 550,
            crownsReplay: 130,
            crownsLoss: 120,
            cardDrop: { index: 211, count: 1, name: "Crach an Craite (Líder)" },
            prereqs: ["skel_port"],
            connections: ["skel_port", "skel_grove", "skel_svorlag"]
        },

        skel_grove: {
            id: "skel_grove",
            region: "Skellige",
            name: "Bosque Sagrado de Gedyneith",
            lore: "O arquidruida Ermion domina as ervas sagradas de Mardroeme que despertam a fúria dos ursos nas cartas.",
            type: "battle",
            x: 630,
            y: 1530,
            opponent: {
                name: "Arquidruida Ermion",
                avatar: "img/sm/skellige_ermion.jpg",
                faction: "skellige",
                leader: 211,
                deck: makeDeck("skellige", 211, [
                    [195, 1], [181, 1], [192, 3], [185, 2], [186, 1], [200, 2], [209, 2],
                    [183, 1], [193, 1], [190, 1], [191, 1], [205, 1], [208, 1], [198, 1],
                    [16, 1], [202, 3], [204, 1], [1, 1]
                ])
            },
            crownsReward: 540,
            crownsReplay: 130,
            crownsLoss: 120,
            cardDrop: { index: 195, count: 1, name: "Ermion (Hero Mardroeme 8)" },
            prereqs: ["skel_hall"],
            connections: ["skel_hall", "skel_muire"]
        },

        skel_muire: {
            id: "skel_muire",
            region: "Skellige",
            name: "Fortaleza de Kaer Muire",
            lore: "O truculento Madman Lugos não tem paciência para rodeios: parte para o ataque esmagador com fúria cega.",
            type: "battle",
            x: 540,
            y: 1590,
            opponent: {
                name: "Madman Lugos",
                avatar: "img/sm/skellige_madmad_lugos.jpg",
                faction: "skellige",
                leader: 212,
                deck: makeDeck("skellige", 212, [
                    [201, 1], [192, 3], [185, 2], [186, 1], [200, 3], [209, 2], [183, 1],
                    [193, 1], [190, 1], [191, 1], [181, 1], [205, 1], [208, 1], [16, 1],
                    [202, 2], [204, 1], [10, 1]
                ])
            },
            crownsReward: 560,
            crownsReplay: 135,
            crownsLoss: 130,
            cardDrop: { index: 201, count: 1, name: "Madman Lugos (6)" },
            prereqs: ["skel_grove"],
            connections: ["skel_grove", "skel_tourney"]
        },

        skel_svorlag: {
            id: "skel_svorlag",
            region: "Skellige",
            name: "Povoado de Svorlag (Spikeroog)",
            lore: "A decidida Cerys an Craite reúne escudeiras leais e combina coragem com inteligência aguçada.",
            type: "battle",
            x: 450,
            y: 1400,
            opponent: {
                name: "Cerys an Craite",
                avatar: "img/sm/skellige_cerys.jpg",
                faction: "skellige",
                leader: 211,
                deck: makeDeck("skellige", 211, [
                    [184, 1], [187, 1], [188, 1], [189, 1], [192, 3], [185, 2], [186, 1],
                    [200, 2], [209, 2], [183, 1], [193, 1], [190, 1], [191, 1], [205, 1],
                    [208, 1], [16, 1], [202, 1], [204, 1], [1, 1]
                ])
            },
            crownsReward: 550,
            crownsReplay: 130,
            crownsLoss: 120,
            cardDrop: { index: 184, count: 1, name: "Cerys (Hero Muster 10)" },
            prereqs: ["skel_hall"],
            connections: ["skel_hall", "skel_tourney"]
        },

        skel_shop: {
            id: "skel_shop",
            region: "Skellige",
            name: "Feirante Marítimo de Kaer Trolde",
            lore: "Ervas sagradas, tempestades das ilhas e heróis de Skellige.",
            type: "shop",
            x: 510,
            y: 1510,
            connections: ["skel_port"]
        },

        skel_tourney: {
            id: "skel_tourney",
            region: "Skellige",
            name: "Torneio dos Clãs de Skellige",
            lore: "O maior torneio das ilhas selvagens. Três batalhas ferozes contra os campeões de Skellige valendo a carta lendária de Geralt de Rívia!",
            type: "tournament",
            x: 580,
            y: 1660,
            entryFee: 1200,
            grandPrizeCrowns: 4000,
            grandPrizeCard: { index: 8, count: 1, name: "Geralt of Rivia (Hero 15)" },
            trophyId: "trophy_skellige",
            rounds: [
                {
                    opponentName: "Jarl Donar an Hindar",
                    faction: "skellige",
                    leader: 211,
                    deck: makeDeck("skellige", 211, [[192, 3], [185, 2], [186, 1], [200, 2], [209, 2], [183, 1], [193, 1], [190, 1], [191, 1], [181, 1], [205, 1], [208, 1], [198, 1], [16, 1], [202, 1], [1, 1]])
                },
                {
                    opponentName: "Guerreiro Hjalmar an Craite",
                    faction: "skellige",
                    leader: 211,
                    deck: makeDeck("skellige", 211, [[197, 1], [192, 3], [185, 2], [186, 1], [200, 3], [209, 3], [183, 1], [193, 1], [190, 1], [191, 1], [181, 1], [205, 1], [16, 1], [202, 2], [204, 1]])
                },
                {
                    opponentName: "Campeão das Ilhas Olaf",
                    faction: "skellige",
                    leader: 212,
                    deck: makeDeck("skellige", 212, [[203, 1], [184, 1], [187, 1], [188, 1], [189, 1], [192, 3], [185, 2], [186, 1], [200, 3], [209, 3], [183, 1], [193, 1], [181, 1], [16, 1], [202, 2], [10, 1]])
                }
            ],
            prereqs: ["skel_svorlag", "skel_muire"],
            connections: ["skel_svorlag", "skel_muire", "tous_vineyard"]
        },

        // --- REGION 6: KAER MORHEN ---
        km_courtyard: {
            id: "km_courtyard",
            region: "Kaer Morhen",
            name: "Pátio de Kaer Morhen",
            lore: "O pátio de treino dos bruxos da Escola do Lobo. Lambert adora provocar seus irmãos com jogadas inesperadas.",
            type: "battle",
            x: 2180,
            y: 520,
            opponent: {
                name: "Lambert o Bruxo",
                avatar: "img/sm/neutral_triss.jpg",
                faction: "monsters",
                leader: 94,
                deck: makeDeck("monsters", 94, [
                    [12, 1], [126, 1], [117, 3], [127, 3], [98, 3], [122, 1], [113, 1],
                    [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [123, 1], [16, 1],
                    [13, 1], [2, 1], [10, 1], [5, 1]
                ])
            },
            crownsReward: 600,
            crownsReplay: 140,
            crownsLoss: 140,
            cardDrop: { index: 12, count: 1, name: "Triss Merigold (Hero 7)" },
            prereqs: ["pontar_vergen", "nov_tourney"],
            connections: ["pontar_vergen", "nov_tourney", "km_tower"]
        },

        km_tower: {
            id: "km_tower",
            region: "Kaer Morhen",
            name: "Torre do Mago em Kaer Morhen",
            lore: "O calmo e experiente Eskel guarda os registros antigos dos bruxos e joga com paciência cirúrgica.",
            type: "battle",
            x: 2280,
            y: 480,
            opponent: {
                name: "Eskel o Bruxo",
                avatar: "img/sm/monsters_draug.jpg",
                faction: "scoiatael",
                leader: 141,
                deck: makeDeck("scoiatael", 141, [
                    [108, 1], [167, 1], [144, 1], [151, 3], [177, 2], [162, 2], [148, 2],
                    [147, 2], [145, 1], [146, 1], [158, 1], [165, 1], [168, 2], [176, 1],
                    [16, 1], [13, 1], [11, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 620,
            crownsReplay: 145,
            crownsLoss: 140,
            cardDrop: { index: 108, count: 1, name: "Draug (Hero 10)" },
            prereqs: ["km_courtyard"],
            connections: ["km_courtyard", "km_keep"]
        },

        km_keep: {
            id: "km_keep",
            region: "Kaer Morhen",
            name: "Salão da Fortaleza de Kaer Morhen",
            lore: "O venerável mestre Vesemir, o mais antigo de todos os bruxos, é um verdadeiro monumento de sabedoria e tática.",
            type: "battle",
            x: 2250,
            y: 410,
            opponent: {
                name: "Vesemir (Mestre dos Bruxos)",
                avatar: "img/sm/monsters_eredin_gold.jpg",
                faction: "realms",
                leader: 24,
                deck: makeDeck("realms", 24, [
                    [95, 1], [39, 1], [51, 1], [29, 2], [42, 2], [40, 2], [35, 2], [44, 1],
                    [53, 1], [27, 1], [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1],
                    [52, 1], [16, 1], [13, 1], [2, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 750,
            crownsReplay: 160,
            crownsLoss: 150,
            cardDrop: { index: 95, count: 1, name: "Eredin - Destroyer of Worlds (Líder)" },
            prereqs: ["km_tower"],
            connections: ["km_tower", "tous_vineyard"]
        },

        // --- REGION 7: TOUSSAINT ---
        tous_vineyard: {
            id: "tous_vineyard",
            region: "Toussaint",
            name: "Vinhedo Corvo Bianco",
            lore: "A ensolarada herdade sob o Monte Gorgon. O fiel mordomo Barnabas-Basil aprecia o melhor vintage e jogadas requintadas.",
            type: "battle",
            x: 1760,
            y: 2420,
            opponent: {
                name: "Mordomo Barnabas-Basil",
                avatar: "img/sm/nilfgaard_menno.jpg",
                faction: "nilfgaard",
                leader: 58,
                deck: makeDeck("nilfgaard", 58, [
                    [73, 1], [86, 1], [75, 1], [84, 1], [71, 3], [76, 3], [61, 1], [85, 1],
                    [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1],
                    [16, 1], [13, 1], [2, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 600,
            crownsReplay: 150,
            crownsLoss: 140,
            cardDrop: { index: 73, count: 1, name: "Menno Coehoorn (Hero Medic 10)" },
            prereqs: ["skel_tourney", "km_keep"],
            connections: ["skel_tourney", "km_keep", "tous_inn", "tous_shop"]
        },

        tous_inn: {
            id: "tous_inn",
            region: "Toussaint",
            name: "Taverna do Faisão em Beauclair",
            lore: "No coração da capital do ducado, o nobre Cavaleiro Guillaume defende as virtudes cavalheirescas no tabuleiro.",
            type: "battle",
            x: 1870,
            y: 2460,
            opponent: {
                name: "Cavaleiro Guillaume",
                avatar: "img/sm/realms_esterad.jpg",
                faction: "realms",
                leader: 25,
                deck: makeDeck("realms", 25, [
                    [33, 1], [39, 1], [51, 1], [29, 2], [42, 2], [40, 2], [35, 2], [44, 1],
                    [53, 1], [27, 1], [54, 1], [31, 1], [38, 1], [41, 1], [46, 1], [48, 1],
                    [52, 1], [16, 1], [13, 1], [2, 1], [1, 1], [5, 1]
                ])
            },
            crownsReward: 650,
            crownsReplay: 160,
            crownsLoss: 150,
            cardDrop: { index: 33, count: 1, name: "Esterad Thyssen (Hero 10)" },
            prereqs: ["tous_vineyard"],
            connections: ["tous_vineyard", "tous_tourney"]
        },

        tous_shop: {
            id: "tous_shop",
            region: "Toussaint",
            name: "Boutique Ducal de Beauclair",
            lore: "Líderes supremos e relíquias raras do Gwent disponíveis para colecionadores abastados.",
            type: "shop",
            x: 1820,
            y: 2380,
            connections: ["tous_vineyard"]
        },

        tous_tourney: {
            id: "tous_tourney",
            region: "Toussaint",
            name: "O Magnífico Grande Torneio de Beauclair",
            lore: "O ápice de toda a jornada! O mais grandioso torneio do continente, apadrinhado pela própria Grão-Duquesa Anna Henrietta. Três duelos épicos pela coroa eterna do Gwent!",
            type: "tournament",
            x: 1980,
            y: 2460,
            entryFee: 1500,
            grandPrizeCrowns: 5000,
            grandPrizeCard: { index: 213, count: 1, name: "Schirru (Scorch Siege 8)" },
            trophyId: "trophy_toussaint",
            rounds: [
                {
                    opponentName: "Conde Monnier",
                    faction: "monsters",
                    leader: 95,
                    deck: makeDeck("monsters", 95, [[108, 1], [126, 1], [117, 3], [127, 3], [98, 3], [122, 1], [113, 1], [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [123, 1], [16, 1], [13, 1], [2, 1], [10, 1]])
                },
                {
                    opponentName: "Madame Florette",
                    faction: "scoiatael",
                    leader: 140,
                    deck: makeDeck("scoiatael", 140, [[167, 1], [144, 1], [151, 3], [177, 2], [162, 2], [148, 2], [147, 2], [145, 1], [146, 1], [158, 1], [165, 1], [168, 2], [176, 1], [16, 1], [13, 1], [1, 1], [5, 1]])
                },
                {
                    opponentName: "Grão-Duquesa Anna Henrietta",
                    faction: "nilfgaard",
                    leader: 59,
                    deck: makeDeck("nilfgaard", 59, [[73, 1], [86, 1], [75, 1], [84, 1], [71, 3], [76, 3], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [16, 1], [13, 1], [1, 1], [5, 1]])
                }
            ],
            prereqs: ["tous_inn"],
            connections: ["tous_inn"]
        }
    }
};

// Generate compendium hints mapping
const COMPENDIUM_HINTS = {};
list.forEach(c => {
    COMPENDIUM_HINTS[c.i] = {
        name: c.name,
        deck: c.deck,
        str: c.str,
        ability: c.ability,
        row: c.row,
        maxCount: c.count
    };
});

// Map where cards are dropped or sold
for (const [nodeId, node] of Object.entries(STORY_DATA.NODES)) {
    if (node.cardDrop) {
        COMPENDIUM_HINTS[node.cardDrop.index].source = "Vença " + node.opponent.name + " em " + node.name;
    }
    if (node.type === "tournament" && node.grandPrizeCard) {
        COMPENDIUM_HINTS[node.grandPrizeCard.index].source = "Prêmio do " + node.name;
    }
}
for (const [shopId, shop] of Object.entries(STORY_DATA.SHOPS)) {
    shop.items.forEach(item => {
        if (!COMPENDIUM_HINTS[item.cardIndex].source) {
            COMPENDIUM_HINTS[item.cardIndex].source = "Disponível na loja " + shop.name + " (" + shop.region + ")";
        }
    });
}

STORY_DATA.COMPENDIUM_HINTS = COMPENDIUM_HINTS;

// Write story_data.js
const fileContent = '// Story Mode Data for Gwent Classic\n"use strict";\n\nvar STORY_DATA = ' + JSON.stringify(STORY_DATA, null, 2) + ';\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = STORY_DATA;\n}\n';
fs.writeFileSync('story_data.js', fileContent, 'utf-8');
console.log('story_data.js generated successfully!');
