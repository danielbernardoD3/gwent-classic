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

// Preset balanced AI decks of varying power tiers across all 5 factions
const AI_DECKS = {
    realms_easy: makeDeck("realms", 22, [
        [40, 2], [42, 1], [43, 1], [34, 1], [35, 1], [36, 1], [44, 1], [53, 1],
        [27, 1], [54, 1], [38, 1], [46, 1], [48, 1], [52, 1], [16, 1], [13, 1],
        [2, 1], [9, 1], [4, 1], [1, 1]
    ]),
    realms_med: makeDeck("realms", 24, [
        [28, 2], [30, 2], [29, 1], [32, 1], [41, 1], [50, 1], [27, 2], [47, 1],
        [34, 2], [44, 1], [53, 1], [38, 1], [48, 1], [52, 1], [16, 1], [13, 1],
        [1, 1], [5, 1], [10, 1]
    ]),
    realms_hard: makeDeck("realms", 23, [
        [51, 1], [37, 1], [39, 1], [33, 1], [28, 3], [30, 3], [29, 2], [32, 1],
        [45, 1], [41, 1], [50, 1], [31, 1], [47, 1], [16, 1], [6, 1], [1, 2], [5, 1], [10, 1]
    ]),
    nilfgaard_easy: makeDeck("nilfgaard", 57, [
        [71, 2], [76, 2], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [91, 1],
        [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [89, 1], [16, 1], [13, 1],
        [2, 1], [9, 1], [4, 1], [1, 1]
    ]),
    nilfgaard_med: makeDeck("nilfgaard", 58, [
        [71, 3], [76, 3], [91, 1], [92, 1], [68, 1], [69, 1], [83, 1], [90, 1],
        [82, 1], [70, 1], [64, 1], [88, 1], [87, 1], [16, 1], [13, 1], [1, 2], [5, 1], [10, 1]
    ]),
    nilfgaard_hard: makeDeck("nilfgaard", 59, [
        [72, 1], [73, 1], [75, 1], [86, 1], [71, 4], [76, 3], [91, 1], [92, 1],
        [90, 1], [82, 1], [84, 1], [68, 1], [69, 1], [83, 1], [64, 1], [63, 1],
        [0, 1], [15, 1], [1, 2], [5, 1], [10, 1]
    ]),
    monsters_easy: makeDeck("monsters", 93, [
        [117, 1], [118, 1], [127, 1], [128, 1], [98, 1], [99, 1], [122, 1], [113, 1],
        [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [103, 1], [104, 1], [110, 1],
        [116, 1], [123, 1], [16, 1], [2, 1], [9, 1], [4, 1]
    ]),
    monsters_med: makeDeck("monsters", 95, [
        [135, 1], [131, 1], [132, 1], [133, 1], [134, 1], [97, 1], [98, 1], [99, 1],
        [100, 1], [127, 1], [128, 1], [129, 1], [105, 1], [106, 1], [107, 1], [112, 1],
        [109, 1], [16, 1], [13, 1], [2, 1], [5, 1], [10, 1]
    ]),
    monsters_hard: makeDeck("monsters", 94, [
        [108, 1], [124, 1], [125, 1], [126, 1], [135, 1], [131, 1], [132, 1], [133, 1],
        [134, 1], [97, 1], [98, 1], [99, 1], [100, 1], [105, 1], [106, 1], [107, 1],
        [112, 1], [115, 1], [8, 1], [3, 1], [5, 2], [10, 1]
    ]),
    scoiatael_easy: makeDeck("scoiatael", 141, [
        [151, 1], [152, 1], [177, 1], [175, 1], [162, 1], [163, 1], [148, 1], [149, 1],
        [147, 1], [145, 1], [146, 1], [144, 1], [158, 1], [165, 1], [168, 1], [169, 1],
        [176, 1], [16, 1], [13, 1], [11, 1], [4, 1], [1, 1]
    ]),
    scoiatael_med: makeDeck("scoiatael", 140, [
        [151, 1], [152, 1], [153, 1], [155, 1], [156, 1], [157, 1], [162, 1], [163, 1],
        [164, 1], [159, 1], [160, 1], [171, 1], [179, 1], [146, 1], [168, 1], [169, 1],
        [16, 1], [6, 1], [1, 2], [5, 1], [10, 1]
    ]),
    scoiatael_hard: makeDeck("scoiatael", 139, [
        [154, 1], [166, 1], [167, 1], [172, 1], [171, 1], [213, 1], [151, 1], [152, 1],
        [153, 1], [155, 1], [156, 1], [157, 1], [162, 1], [163, 1], [164, 1], [159, 1],
        [160, 1], [161, 1], [0, 1], [14, 1], [1, 2], [5, 1]
    ]),
    skellige_easy: makeDeck("skellige", 211, [
        [192, 2], [185, 2], [186, 1], [200, 2], [209, 2], [183, 1], [193, 1], [190, 1],
        [191, 1], [181, 1], [205, 1], [208, 1], [198, 1], [16, 1], [202, 1], [204, 1],
        [4, 1], [1, 1]
    ]),
    skellige_med: makeDeck("skellige", 211, [
        [192, 3], [200, 3], [208, 2], [209, 3], [183, 1], [195, 1], [181, 1], [194, 1],
        [201, 1], [182, 1], [190, 1], [198, 1], [202, 2], [204, 1], [1, 1]
    ]),
    skellige_hard: makeDeck("skellige", 212, [
        [184, 1], [187, 1], [188, 1], [189, 1], [195, 1], [197, 1], [203, 1], [199, 1],
        [192, 3], [200, 3], [208, 3], [181, 1], [194, 1], [214, 1], [0, 1], [202, 2], [1, 1], [5, 1]
    ])
};

const STORY_DATA = {
    STARTING_CROWNS: 2000,
    MAP_WIDTH: 2894,
    MAP_HEIGHT: 4096,

    // Faction starting nodes on WitcherMap_8k_borders.jpg
    STARTER_NODES: {
        realms: "nr_white_orchard",
        nilfgaard: "nilf_capital_tavern",
        skellige: "skel_kaer_trolde_port",
        monsters: "tous_corvo_bianco",
        scoiatael: "aed_dol_blathanna"
    },

    STARTER_REGIONS_INFO: {
        realms: "Teméria & Redânia (Pomar Branco)",
        nilfgaard: "Império de Nilfgaard (Cidade das Torres Douradas)",
        skellige: "Arquipélago de Skellige (Porto de Kaer Trolde)",
        monsters: "Ducado de Toussaint (Vinhedo Corvo Bianco)",
        scoiatael: "Aedirn & Vale das Flores (Dol Blathanna)"
    },

    // Starter decks: zero duplicate unique cards (Dethmold removed from realms starter so only 1 exists!)
    STARTER_DECKS: {
        realms: {
            name: "Reinos do Norte",
            leader: 22, // Foltest - King of Temeria
            cards: [
                [40, 2], [42, 1], [43, 1], [34, 1], [35, 1], [36, 1], [44, 1], [53, 1],
                [27, 1], [54, 1], [38, 1], [41, 1], [46, 1], [48, 1], [52, 1],
                [16, 1], [13, 1], [2, 1], [9, 1], [4, 1], [1, 1]
            ]
        },
        nilfgaard: {
            name: "Império de Nilfgaard",
            leader: 57, // Emhyr var Emreis - Emperor of Nilfgaard
            cards: [
                [71, 2], [76, 2], [61, 1], [85, 1], [74, 1], [77, 1], [80, 1], [91, 1],
                [92, 1], [65, 1], [67, 1], [69, 1], [87, 1], [89, 1],
                [16, 1], [13, 1], [2, 1], [9, 1], [4, 1], [1, 1]
            ]
        },
        monsters: {
            name: "Monstros",
            leader: 93, // Eredin - Commander of the Red Riders
            cards: [
                [117, 1], [118, 1], [127, 1], [128, 1], [98, 1], [99, 1], [122, 1], [113, 1],
                [137, 1], [114, 1], [121, 1], [136, 1], [102, 1], [103, 1], [104, 1], [110, 1],
                [116, 1], [123, 1], [16, 1], [2, 1], [9, 1], [10, 1]
            ]
        },
        scoiatael: {
            name: "Scoia'tael",
            leader: 141, // Francesca Findabair - Daisy of the Valley
            cards: [
                [151, 1], [152, 1], [177, 1], [175, 1], [162, 1], [163, 1], [148, 1], [149, 1],
                [147, 1], [145, 1], [146, 1], [144, 1], [158, 1], [165, 1], [168, 1], [169, 1],
                [176, 1], [16, 1], [13, 1], [11, 1], [4, 1], [1, 1]
            ]
        },
        skellige: {
            name: "Skellige",
            leader: 211, // Crach an Craite
            cards: [
                [192, 2], [185, 2], [186, 1], [200, 2], [209, 2], [183, 1], [193, 1], [190, 1],
                [191, 1], [181, 1], [205, 1], [208, 1], [198, 1],
                [16, 1], [202, 1], [204, 1], [4, 1], [1, 1]
            ]
        }
    },

    // 5 Collectible Regional Insignias (Won in the 5 7-Match Regional Tournaments)
    TROPHIES: {
        insignia_temeria: {
            id: "insignia_temeria",
            title: "Insígnia Real de Teméria",
            region: "Teméria",
            icon: "⚜️",
            image: "img/hud-icons/Temeria-Badge.png",
            desc: "Insígnia dos Lírios de Prata conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Teméria."
        },
        insignia_redania: {
            id: "insignia_redania",
            title: "Insígnia da Águia Redaniana",
            region: "Redânia",
            icon: "🦅",
            image: "img/hud-icons/Redania-Badge.png",
            desc: "Insígnia Real da Águia conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional da Redânia."
        },
        insignia_skellige: {
            id: "insignia_skellige",
            title: "Insígnia dos Clãs de Skellige",
            region: "Skellige",
            icon: "🛡️",
            image: "img/hud-icons/Skellige-Badge.png",
            desc: "Insígnia Ancestral de Kaer Trolde conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Skellige."
        },
        insignia_toussaint: {
            id: "insignia_toussaint",
            title: "Insígnia Ducal de Toussaint",
            region: "Toussaint",
            icon: "🍷",
            image: "img/hud-icons/Toussaint-badge.png",
            desc: "Insígnia Ducal de Beauclair conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Toussaint."
        },
        insignia_nilfgaard: {
            id: "insignia_nilfgaard",
            title: "Insígnia do Grande Sol de Nilfgaard",
            region: "Nilfgaard",
            icon: "☀️",
            image: "img/hud-icons/Nilfgaard-Badge.png",
            desc: "Insígnia Imperial de Ouro conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Nilfgaard."
        }
    },

    SHOPS: {},
    NODES: {}
};

// =========================================================================
// BUILD NODES ACROSS THE CONTINENT (2894 x 4096 coordinate space)
// =========================================================================
const rawNodes = [
    // ---------------------------------------------------------------------
    // REGION 1: TEMÉRIA & VELEN (Início dos Reinos do Norte)
    // ---------------------------------------------------------------------
    {
        id: "nr_white_orchard",
        region: "Teméria",
        name: "Estalagem de Pomar Branco",
        lore: "Ponto de partida nos Reinos do Norte. O estudioso Aldert Geert desafia viajantes na estalagem local com táticas clássicas da infantaria temeriana.",
        type: "battle",
        x: 1655,
        y: 1185,
        opponent: {
            name: "Estudioso Aldert Geert",
            avatar: "img/sm/realms_poor_infantry.jpg",
            faction: "realms",
            leader: 22,
            deck: AI_DECKS.realms_easy
        },
        crownsReward: 220,
        crownsReplay: 50,
        crownsLoss: 40,
        cardDrop: { index: 28, count: 1, name: "Blue Stripes Commando" },
        connections: ["nr_murky_waters", "nr_vizima_palace", "nr_maribor_fort", "tourney_2_pomar_branco"]
    },
    {
        id: "tourney_2_pomar_branco",
        region: "Teméria",
        name: "Torneio da Guarnição de Pomar Branco",
        lore: "Um torneio rápido de 2 batalhas seguidas organizado pelos veteranos locais. Vença os dois oponentes sem perder para ganhar a carta de prêmio!",
        type: "tournament",
        isRegional: false,
        x: 1735,
        y: 1170,
        entryFee: 150,
        roundWinCrownsFirst: 250,
        roundWinCrownsRepeat: 35,
        grandPrizeCrowns: 600,
        grandPrizeCards: [
            { index: 28, count: 1, name: "Blue Stripes Commando" }
        ],
        rounds: [
            { opponentName: "Ferreiro Willis", faction: "realms", leader: 22, deck: AI_DECKS.realms_easy },
            { opponentName: "Capitão Peter Saar Gwynleve", faction: "nilfgaard", leader: 57, deck: AI_DECKS.nilfgaard_easy }
        ],
        connections: ["nr_white_orchard"]
    },
    {
        id: "nr_murky_waters",
        region: "Teméria",
        name: "Aldeia de Águas Turvas",
        lore: "Às margens do lago de Vízima, pescadores e mercenários apostam coroas contra batedores Scoia'tael infiltrados.",
        type: "battle",
        x: 1505,
        y: 1205,
        opponent: {
            name: "Chefe Tobias Hoffman",
            avatar: "img/sm/scoiatael_vrihedd_brigade.jpg",
            faction: "scoiatael",
            leader: 141,
            deck: AI_DECKS.scoiatael_easy
        },
        crownsReward: 240,
        crownsReplay: 55,
        crownsLoss: 45,
        cardDrop: { index: 30, count: 1, name: "Crinfrid Reavers Dragon Hunter" },
        connections: ["nr_white_orchard", "nr_vizima_palace", "vel_crows_perch", "vel_gors_velen"]
    },
    {
        id: "nr_vizima_palace",
        region: "Teméria",
        name: "Palácio Real de Vízima",
        lore: "Na antiga corte do Rei Foltest, o camareiro imperial e os nobres temerianos duelam com precisão militar.",
        type: "battle",
        x: 1585,
        y: 1125,
        opponent: {
            name: "Camareiro Emreis de Vízima",
            avatar: "img/sm/nilfgaard_albrich.jpg",
            faction: "nilfgaard",
            leader: 57,
            deck: AI_DECKS.nilfgaard_easy
        },
        crownsReward: 280,
        crownsReplay: 65,
        crownsLoss: 55,
        cardDrop: { index: 32, count: 1, name: "Dun Banner Medic" },
        connections: ["nr_white_orchard", "nr_murky_waters", "nr_la_valette", "shop_temeria", "regional_tourney_temeria"]
    },
    {
        id: "shop_temeria",
        region: "Teméria",
        name: "Empório Real de Vízima",
        lore: "Fornecedor oficial de cartas de cerco, infantaria temeriana e reforços táticos dos Reinos do Norte.",
        type: "shop",
        x: 1515,
        y: 1090,
        connections: ["nr_vizima_palace", "red_oxenfurt"]
    },
    {
        id: "regional_tourney_temeria",
        region: "Teméria",
        name: "Torneio Regional de Teméria",
        lore: "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O grande campeonato real de Vízima! Derrote 7 mestres consecutivamente sem perder para conquistar 10.000 Coroas, o Líder Foltest Mestre do Cerco e a Insígnia Real de Teméria!",
        type: "tournament",
        isRegional: true,
        x: 1645,
        y: 1085,
        entryFee: 1000,
        roundWinCrownsFirst: 500,
        roundWinCrownsRepeat: 60,
        grandPrizeCrowns: 10000,
        grandPrizeCards: [
            { index: 24, count: 1, name: "Foltest - The Siegemaster (Líder)" }
        ],
        trophyId: "insignia_temeria",
        rounds: [
            { opponentName: "Sargento de Maribor", faction: "realms", leader: 22, deck: AI_DECKS.realms_easy },
            { opponentName: "Adivinho de Benkelham", faction: "monsters", leader: 93, deck: AI_DECKS.monsters_easy },
            { opponentName: "Mercador de Gors Velen", faction: "scoiatael", leader: 141, deck: AI_DECKS.scoiatael_med },
            { opponentName: "Barão Sanguinário (Phillip Strenger)", faction: "realms", leader: 24, deck: AI_DECKS.realms_med },
            { opponentName: "Embaixador var Attre", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Comandante Vernon Roche", faction: "realms", leader: 23, deck: AI_DECKS.realms_hard },
            { opponentName: "Grão-Coudel John Natalis", faction: "realms", leader: 24, deck: AI_DECKS.realms_hard }
        ],
        connections: ["nr_vizima_palace"]
    },
    {
        id: "nr_maribor_fort",
        region: "Teméria",
        name: "Fortaleza de Maribor",
        lore: "Bastião militar do sul da Teméria. Ves e os Listras Azuis treinam cercos pesados entre uma rodada de Gwent e outra.",
        type: "battle",
        x: 1715,
        y: 1345,
        opponent: {
            name: "Tenente Ves (Listras Azuis)",
            avatar: "img/sm/realms_ves.jpg",
            faction: "realms",
            leader: 22,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 270,
        crownsReplay: 60,
        crownsLoss: 50,
        cardDrop: { index: 29, count: 1, name: "Catapult" },
        connections: ["nr_white_orchard", "sod_sodden_hill", "aed_mahakam"]
    },
    {
        id: "nr_la_valette",
        region: "Teméria",
        name: "Castelo La Valette",
        lore: "Às margens do rio Pontar, o estrategista Aryan La Valette aposta suas melhores máquinas de cerco.",
        type: "battle",
        x: 1585,
        y: 990,
        opponent: {
            name: "Barão Aryan La Valette",
            avatar: "img/sm/realms_siege_tower.jpg",
            faction: "realms",
            leader: 24,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 280,
        crownsReplay: 65,
        crownsLoss: 55,
        cardDrop: { index: 47, count: 1, name: "Siege Tower" },
        connections: ["nr_vizima_palace", "nr_ellander", "red_tretogor", "red_oxenfurt"]
    },
    {
        id: "nr_ellander",
        region: "Teméria",
        name: "Templo de Melitele em Ellander",
        lore: "Sob a proteção da Madre Nenneke, viajantes do leste e do oeste se encontram em paz para duelos de sabedoria.",
        type: "battle",
        x: 1815,
        y: 965,
        opponent: {
            name: "Madre Nenneke",
            avatar: "img/sm/realms_banner_nurse.jpg",
            faction: "scoiatael",
            leader: 141,
            deck: AI_DECKS.scoiatael_med
        },
        crownsReward: 300,
        crownsReplay: 70,
        crownsLoss: 60,
        cardDrop: { index: 27, count: 1, name: "Ballista" },
        connections: ["nr_la_valette", "aed_flotsam", "aed_mahakam"]
    },
    {
        id: "vel_crows_perch",
        region: "Velen",
        name: "Poleiro do Corvo (Velen)",
        lore: "No coração devastado de Velen, o autoproclamado Barão Sanguinário é famoso por jamais recusar uma aposta alta no Gwent.",
        type: "battle",
        x: 1160,
        y: 1125,
        opponent: {
            name: "Barão Sanguinário",
            avatar: "img/sm/realms_dijkstra.jpg",
            faction: "realms",
            leader: 24,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 300,
        crownsReplay: 70,
        crownsLoss: 60,
        cardDrop: { index: 45, count: 1, name: "Sigismund Dijkstra (Spy 4)" },
        connections: ["nr_murky_waters", "vel_gors_velen", "red_oxenfurt", "tourney_2_velen"]
    },
    {
        id: "tourney_2_velen",
        region: "Velen",
        name: "Torneio dos Senhores de Velen",
        lore: "Torneio local de 2 batalhas seguidas nas terras pantanosas de Velen. Vença os dois adversários seguidamente para ganhar 1 carta!",
        type: "tournament",
        isRegional: false,
        x: 1265,
        y: 1140,
        entryFee: 200,
        roundWinCrownsFirst: 280,
        roundWinCrownsRepeat: 40,
        grandPrizeCrowns: 750,
        grandPrizeCards: [
            { index: 30, count: 1, name: "Crinfrid Reavers Dragon Hunter" }
        ],
        rounds: [
            { opponentName: "Construtor de Barcos de Minério", faction: "monsters", leader: 93, deck: AI_DECKS.monsters_easy },
            { opponentName: "Velho Sábio de Benkelham", faction: "monsters", leader: 95, deck: AI_DECKS.monsters_med }
        ],
        connections: ["vel_crows_perch"]
    },
    {
        id: "vel_gors_velen",
        region: "Velen",
        name: "Gors Velen & Ilha de Thanedd",
        lore: "Perto da lendária Torre da Gaivota em Thanedd, a feiticeira Keira Metz joga com feitiços devastadores e espiões.",
        type: "battle",
        x: 1195,
        y: 1245,
        opponent: {
            name: "Feiticeira Keira Metz",
            avatar: "img/sm/realms_keira.jpg",
            faction: "realms",
            leader: 22,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 320,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 37, count: 1, name: "John Natalis (Hero 10)" },
        connections: ["vel_crows_perch", "nr_murky_waters", "vel_cidaris", "aed_brokilon"]
    },
    {
        id: "vel_cidaris",
        region: "Cidaris",
        name: "Porto Real de Cidaris",
        lore: "Principal porto marítimo que liga os Reinos do Norte às Ilhas de Skellige. Marinheiros e corsários duelam no cais.",
        type: "battle",
        x: 985,
        y: 1295,
        opponent: {
            name: "Almirante de Cidaris",
            avatar: "img/sm/realms_vernon.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_med
        },
        crownsReward: 340,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 51, count: 1, name: "Vernon Roche (Hero 10)" },
        connections: ["vel_gors_velen", "skel_bremervoord"]
    },

    // ---------------------------------------------------------------------
    // REGION 2: REDÂNIA, NOVIGRAD, KAEDWEN & KAER MORHEN
    // ---------------------------------------------------------------------
    {
        id: "red_oxenfurt",
        region: "Redânia",
        name: "Academia de Oxenfurt",
        lore: "Cidade universitária da Redânia. A médica Shani e o espião Thaler costumam jogar na taverna Alquimia.",
        type: "battle",
        x: 1225,
        y: 1065,
        opponent: {
            name: "Médica Shani",
            avatar: "img/sm/realms_thaler.jpg",
            faction: "realms",
            leader: 24,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 320,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 50, count: 1, name: "Thaler (Spy 1)" },
        connections: ["vel_crows_perch", "shop_temeria", "nr_la_valette", "red_novigrad_docks"]
    },
    {
        id: "red_novigrad_docks",
        region: "Redânia",
        name: "Porto Livre de Novigrad",
        lore: "Na maior metrópole do mundo, o bardo Dandelion e Zoltan Chivay comandam mesas de apostas animadas no Camomila e Tomilho.",
        type: "battle",
        x: 1135,
        y: 1055,
        opponent: {
            name: "Bardo Dandelion",
            avatar: "img/sm/neutral_dandelion.jpg",
            faction: "scoiatael",
            leader: 141,
            deck: AI_DECKS.scoiatael_med
        },
        crownsReward: 350,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 6, count: 1, name: "Dandelion (Horn 2)" },
        connections: ["red_oxenfurt", "red_rosemarie", "shop_novigrad", "regional_tourney_redania"]
    },
    {
        id: "shop_novigrad",
        region: "Redânia",
        name: "Empório da Praça do Hierarca",
        lore: "As cartas neutras, especiais e relíquias mais cobiçadas de Novigrad e da Redânia.",
        type: "shop",
        x: 1075,
        y: 1010,
        connections: ["red_novigrad_docks"]
    },
    {
        id: "red_rosemarie",
        region: "Redânia",
        name: "Salão de Madame Serenity (Novigrad)",
        lore: "Nos salões dourados de Novigrad, a astuta estrategista Madame Sasha desafia os melhores jogadores com espionagem implacável.",
        type: "battle",
        x: 1185,
        y: 965,
        opponent: {
            name: "Madame Sasha (Cantarella)",
            avatar: "img/sm/realms_esterad.jpg",
            faction: "nilfgaard",
            leader: 59,
            deck: AI_DECKS.nilfgaard_med
        },
        crownsReward: 380,
        crownsReplay: 85,
        crownsLoss: 75,
        cardDrop: { index: 33, count: 1, name: "Esterad Thyssen (Hero 10)" },
        connections: ["red_novigrad_docks", "red_tretogor", "red_blaviken", "regional_tourney_redania"]
    },
    {
        id: "regional_tourney_redania",
        region: "Redânia",
        name: "Torneio Regional da Redânia (Passiflora)",
        lore: "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O lendário Grande Torneio de Altas Apostas do Passiflora em Novigrad! Vença 7 mestres seguidamente para conquistar 10.000 Coroas, o Líder Foltest Comandante do Norte e a Insígnia da Águia Redaniana!",
        type: "tournament",
        isRegional: true,
        x: 1130,
        y: 895,
        entryFee: 1200,
        roundWinCrownsFirst: 550,
        roundWinCrownsRepeat: 70,
        grandPrizeCrowns: 10000,
        grandPrizeCards: [
            { index: 23, count: 1, name: "Foltest - Lord Commander of the North (Líder)" }
        ],
        trophyId: "insignia_redania",
        rounds: [
            { opponentName: "Mercador Halfling Bernard Tulle", faction: "scoiatael", leader: 141, deck: AI_DECKS.scoiatael_med },
            { opponentName: "escriba Marcus T.K. Hodgson", faction: "realms", leader: 22, deck: AI_DECKS.realms_med },
            { opponentName: "Alquimista Gremist Visitante", faction: "skellige", leader: 211, deck: AI_DECKS.skellige_med },
            { opponentName: "Agente Imperial Cantarella", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Conde Tybalt de Novigrad", faction: "monsters", leader: 95, deck: AI_DECKS.monsters_hard },
            { opponentName: "Mestre Espião Sigismund Dijkstra", faction: "realms", leader: 24, deck: AI_DECKS.realms_hard },
            { opponentName: "Rei Radovid V o Severo", faction: "realms", leader: 23, deck: AI_DECKS.realms_hard }
        ],
        connections: ["red_novigrad_docks", "red_rosemarie"]
    },
    {
        id: "red_tretogor",
        region: "Redânia",
        name: "Capital Real de Tretogor",
        lore: "Sede do poder real da Redânia. A feiticeira Philippa Eilhart domina a política e o tabuleiro com inteligência letal.",
        type: "battle",
        x: 1485,
        y: 855,
        opponent: {
            name: "Feiticeira Philippa Eilhart",
            avatar: "img/sm/realms_philippa.jpg",
            faction: "realms",
            leader: 23,
            deck: AI_DECKS.realms_hard
        },
        crownsReward: 400,
        crownsReplay: 90,
        crownsLoss: 80,
        cardDrop: { index: 39, count: 1, name: "Philippa Eilhart (Hero 10)" },
        connections: ["nr_la_valette", "red_rosemarie", "red_drakenborg"]
    },
    {
        id: "red_blaviken",
        region: "Redânia",
        name: "Porto de Blaviken & Kovir",
        lore: "Na cidade costeira onde Geralt ficou conhecido como o Carniceiro de Blaviken, o mago Stregobor guarda cartas raras do norte.",
        type: "battle",
        x: 1285,
        y: 580,
        opponent: {
            name: "Mestre Mago Stregobor",
            avatar: "img/sm/realms_sheldon.jpg",
            faction: "realms",
            leader: 24,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 360,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 29, count: 1, name: "Catapult" },
        connections: ["red_rosemarie", "red_drakenborg"]
    },
    {
        id: "red_drakenborg",
        region: "Redânia",
        name: "Fortaleza de Drakenborg",
        lore: "Nas sombras das Montanhas Kestrel, a feiticeira Síle de Tansarville testa a mente dos viajantes rumo a Kaedwen.",
        type: "battle",
        x: 1700,
        y: 745,
        opponent: {
            name: "Síle de Tansarville",
            avatar: "img/sm/realms_sile.jpg",
            faction: "realms",
            leader: 24,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 380,
        crownsReplay: 85,
        crownsLoss: 75,
        cardDrop: { index: 49, count: 1, name: "Síle de Tansarville" },
        connections: ["red_tretogor", "red_blaviken", "kaed_ard_carraigh", "aed_flotsam"]
    },
    {
        id: "kaed_ard_carraigh",
        region: "Kaedwen",
        name: "Cidadela de Ard Carraigh (Kaedwen)",
        lore: "Capital do reino montanhoso de Kaedwen. O Rei Henselt orgulha-se das melhores baterias de artilharia de cerco do norte.",
        type: "battle",
        x: 2270,
        y: 445,
        opponent: {
            name: "Rei Henselt de Kaedwen",
            avatar: "img/sm/realms_kaedwen_siege.jpg",
            faction: "realms",
            leader: 24,
            deck: AI_DECKS.realms_hard
        },
        crownsReward: 420,
        crownsReplay: 95,
        crownsLoss: 85,
        cardDrop: { index: 34, count: 1, name: "Kaedweni Siege Expert" },
        connections: ["red_drakenborg", "kaed_ban_ard", "km_fortress"]
    },
    {
        id: "kaed_ban_ard",
        region: "Kaedwen",
        name: "Academia de Magos de Ban Ard",
        lore: "O conselheiro real Mago Dethmold governa os arquivos arcanos de Kaedwen. Derrote-o para conquistar sua carta única!",
        type: "battle",
        x: 2530,
        y: 670,
        opponent: {
            name: "Mago Dethmold",
            avatar: "img/sm/realms_dethmold.jpg",
            faction: "realms",
            leader: 23,
            deck: AI_DECKS.realms_hard
        },
        crownsReward: 450,
        crownsReplay: 100,
        crownsLoss: 90,
        // PEDIDO BÔNUS: Única cópia de Dethmold no jogo!
        cardDrop: { index: 31, count: 1, name: "Dethmold" },
        connections: ["kaed_ard_carraigh", "aed_loc_muinne", "aed_vergen"]
    },
    {
        id: "km_fortress",
        region: "Kaer Morhen",
        name: "Fortaleza de Kaer Morhen",
        lore: "No refúgio ancestral da Escola do Lobo nas Montanhas Azuis, Lambert, Eskel e Vesemir disputam partidas memoráveis de inverno.",
        type: "battle",
        x: 2545,
        y: 285,
        opponent: {
            name: "Mestre Bruxo Vesemir",
            avatar: "img/sm/neutral_vesemir.jpg",
            faction: "monsters",
            leader: 94,
            deck: AI_DECKS.monsters_hard
        },
        crownsReward: 500,
        crownsReplay: 110,
        crownsLoss: 95,
        cardDrop: { index: 12, count: 1, name: "Triss Merigold (Hero 7)" },
        connections: ["kaed_ard_carraigh", "tourney_5_kaer_morhen"]
    },
    {
        id: "tourney_5_kaer_morhen",
        region: "Kaer Morhen",
        name: "Torneio dos Bruxos de Kaer Morhen",
        lore: "Torneio de Elite de 5 Partidas Seguidas na Fortaleza da Escola do Lobo! Vença os 5 bruxos e feiticeiras em sequência para ganhar 3 cartas lendárias!",
        type: "tournament",
        isRegional: false,
        x: 2420,
        y: 315,
        entryFee: 600,
        roundWinCrownsFirst: 420,
        roundWinCrownsRepeat: 50,
        grandPrizeCrowns: 2800,
        grandPrizeCards: [
            { index: 8, count: 1, name: "Geralt of Rivia (Hero 15)" },
            { index: 15, count: 1, name: "Yennefer of Vengerberg (Hero Medic 7)" },
            { index: 214, count: 1, name: "Roach (Carpeado)" }
        ],
        rounds: [
            { opponentName: "Bruxo Lambert", faction: "monsters", leader: 93, deck: AI_DECKS.monsters_med },
            { opponentName: "Bruxo Eskel", faction: "scoiatael", leader: 140, deck: AI_DECKS.scoiatael_med },
            { opponentName: "Bruxo Coën de Poviss", faction: "realms", leader: 24, deck: AI_DECKS.realms_med },
            { opponentName: "Feiticeira Triss Merigold", faction: "realms", leader: 23, deck: AI_DECKS.realms_hard },
            { opponentName: "Mestre Vesemir de Kaer Morhen", faction: "monsters", leader: 94, deck: AI_DECKS.monsters_hard }
        ],
        connections: ["km_fortress"]
    },

    // ---------------------------------------------------------------------
    // REGION 3: AEDIRN, DOL BLATHANNA, MAHAKAM & BROKILON (Início Scoia'tael)
    // ---------------------------------------------------------------------
    {
        id: "aed_dol_blathanna",
        region: "Aedirn & Dol Blathanna",
        name: "Santuário de Dol Blathanna (Vale das Flores)",
        lore: "Ponto de partida dos Scoia'tael no leste de Aedirn. O líder élfico Filavandrel recebe aliados nas fronteiras floridas do vale.",
        type: "battle",
        x: 2555,
        y: 985,
        opponent: {
            name: "Rei Élfico Filavandrel",
            avatar: "img/sm/scoiatael_filavandrel.jpg",
            faction: "scoiatael",
            leader: 141,
            deck: AI_DECKS.scoiatael_easy
        },
        crownsReward: 220,
        crownsReplay: 50,
        crownsLoss: 40,
        cardDrop: { index: 155, count: 1, name: "Elven Skirmisher" },
        connections: ["aed_upper_posada", "aed_gulet", "shop_dol_blathanna", "tourney_3_dol_blathanna"]
    },
    {
        id: "shop_dol_blathanna",
        region: "Aedirn & Dol Blathanna",
        name: "Mercador Élfico de Dol Blathanna",
        lore: "Artesão Aen Seidhe que negocia cartas ágeis, curandeiros Havekar e guerreiros de Mahakam.",
        type: "shop",
        x: 2450,
        y: 965,
        connections: ["aed_dol_blathanna", "aed_gulet"]
    },
    {
        id: "tourney_3_dol_blathanna",
        region: "Aedirn & Dol Blathanna",
        name: "Torneio Élfico do Vale das Flores",
        lore: "Torneio de 3 batalhas seguidas sob as árvores douradas de Dol Blathanna. Vença os 3 desafios consecutivamente para ganhar 2 cartas Scoia'tael!",
        type: "tournament",
        isRegional: false,
        x: 2635,
        y: 1030,
        entryFee: 300,
        roundWinCrownsFirst: 320,
        roundWinCrownsRepeat: 40,
        grandPrizeCrowns: 1200,
        grandPrizeCards: [
            { index: 157, count: 1, name: "Elven Skirmisher" },
            { index: 150, count: 1, name: "Dol Blathanna Scout" }
        ],
        rounds: [
            { opponentName: "Batedora Toruviel", faction: "scoiatael", leader: 141, deck: AI_DECKS.scoiatael_easy },
            { opponentName: "Sábia Ida Emean aep Sivney", faction: "scoiatael", leader: 140, deck: AI_DECKS.scoiatael_med },
            { opponentName: "Rainha Francesca Findabair", faction: "scoiatael", leader: 139, deck: AI_DECKS.scoiatael_med }
        ],
        connections: ["aed_dol_blathanna"]
    },
    {
        id: "aed_upper_posada",
        region: "Aedirn & Dol Blathanna",
        name: "Aldeia de Posada Alta",
        lore: "Nos campos férteis nos limites do Mundo Livre, camponeses e silvanos pregam peças e jogam Gwent nas estalagens.",
        type: "battle",
        x: 2545,
        y: 910,
        opponent: {
            name: "Torque o Silvano",
            avatar: "img/sm/scoiatael_dol_archer.jpg",
            faction: "monsters",
            leader: 93,
            deck: AI_DECKS.monsters_easy
        },
        crownsReward: 240,
        crownsReplay: 55,
        crownsLoss: 45,
        cardDrop: { index: 156, count: 1, name: "Elven Skirmisher" },
        connections: ["aed_dol_blathanna", "aed_loc_muinne", "aed_vergen"]
    },
    {
        id: "aed_gulet",
        region: "Aedirn",
        name: "Encruzilhada de Gulet",
        lore: "Cidade comercial de Aedirn. O orgulhoso estrategista élfico Yaevinn desafia viajantes com emboscadas ágeis.",
        type: "battle",
        x: 2350,
        y: 1085,
        opponent: {
            name: "Comandante Yaevinn",
            avatar: "img/sm/scoiatael_yaevinn.jpg",
            faction: "scoiatael",
            leader: 140,
            deck: AI_DECKS.scoiatael_easy
        },
        crownsReward: 260,
        crownsReplay: 60,
        crownsLoss: 50,
        cardDrop: { index: 179, count: 1, name: "Yaevinn (Agile 6)" },
        connections: ["aed_dol_blathanna", "shop_dol_blathanna", "aed_vengerberg", "aed_vergen"]
    },
    {
        id: "aed_vengerberg",
        region: "Aedirn",
        name: "Capital Real de Vengerberg",
        lore: "A imponente capital de Aedirn, terra natal de Yennefer. Mercadores e nobres disputam partidas refinadas.",
        type: "battle",
        x: 2300,
        y: 1185,
        opponent: {
            name: "Senescal de Vengerberg",
            avatar: "img/sm/scoiatael_havekar_nurse.jpg",
            faction: "realms",
            leader: 22,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 280,
        crownsReplay: 65,
        crownsLoss: 55,
        cardDrop: { index: 160, count: 1, name: "Havekar Healer (Medic)" },
        connections: ["aed_gulet", "aed_mahakam", "aed_rivia"]
    },
    {
        id: "aed_vergen",
        region: "Alto Aedirn (Lormark)",
        name: "Cidadela de Vergen",
        lore: "Cercada por cânions rochosos, Vergen é defendida por Saskia, a Virgem de Aedirn, que inspira anões, elfos e humanos.",
        type: "battle",
        x: 2120,
        y: 880,
        opponent: {
            name: "Saskia (A Caçadora de Dragões)",
            avatar: "img/sm/scoiatael_saesenthessis.jpg",
            faction: "scoiatael",
            leader: 140,
            deck: AI_DECKS.scoiatael_med
        },
        crownsReward: 340,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 172, count: 1, name: "Saesenthessis (Hero 10)" },
        connections: ["aed_upper_posada", "aed_gulet", "aed_flotsam", "kaed_ban_ard"]
    },
    {
        id: "aed_flotsam",
        region: "Vale do Pontar",
        name: "Entreposto Comercial de Flotsam",
        lore: "Nas densas florestas às margens do Pontar, o comandante Scoia'tael Iorveth aguarda adversários dignos.",
        type: "battle",
        x: 1895,
        y: 895,
        opponent: {
            name: "Comandante Iorveth",
            avatar: "img/sm/scoiatael_iorveth.jpg",
            faction: "scoiatael",
            leader: 139,
            deck: AI_DECKS.scoiatael_med
        },
        crownsReward: 350,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 166, count: 1, name: "Iorveth (Hero 10)" },
        connections: ["aed_vergen", "nr_ellander", "red_drakenborg"]
    },
    {
        id: "aed_loc_muinne",
        region: "Montanhas Azuis",
        name: "Anfiteatro Élfico de Loc Muinne",
        lore: "Nas ruínas élficas milenares das montanhas, o lendário Marechal de Ferro Isengrim Faoiltiarna joga com precisão cirúrgica.",
        type: "battle",
        x: 2600,
        y: 735,
        opponent: {
            name: "Isengrim Faoiltiarna",
            avatar: "img/sm/scoiatael_isengrim.jpg",
            faction: "scoiatael",
            leader: 139,
            deck: AI_DECKS.scoiatael_hard
        },
        crownsReward: 420,
        crownsReplay: 95,
        crownsLoss: 85,
        cardDrop: { index: 167, count: 1, name: "Isengrim Faoiltiarna (Hero Morale 10)" },
        connections: ["aed_upper_posada", "kaed_ban_ard", "tourney_5_loc_muinne"]
    },
    {
        id: "tourney_5_loc_muinne",
        region: "Montanhas Azuis",
        name: "Torneio da Cúpula de Loc Muinne",
        lore: "Torneio de Elite de 5 Partidas Seguidas durante o Conclave de Loc Muinne! Vença os 5 mestres consecutivamente para ganhar 3 cartas raras Scoia'tael!",
        type: "tournament",
        isRegional: false,
        x: 2665,
        y: 795,
        entryFee: 600,
        roundWinCrownsFirst: 420,
        roundWinCrownsRepeat: 50,
        grandPrizeCrowns: 2800,
        grandPrizeCards: [
            { index: 213, count: 1, name: "Schirrú (Scorch Siege 8)" },
            { index: 159, count: 1, name: "Havekar Healer (Medic)" },
            { index: 164, count: 1, name: "Havekar Smuggler" }
        ],
        rounds: [
            { opponentName: "Guardião de Loc Muinne", faction: "scoiatael", leader: 141, deck: AI_DECKS.scoiatael_med },
            { opponentName: "Mago Cynthia de Nilfgaard", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Capitão Dennis Cranmer", faction: "scoiatael", leader: 140, deck: AI_DECKS.scoiatael_med },
            { opponentName: "Feiticeira Ida Emean", faction: "scoiatael", leader: 139, deck: AI_DECKS.scoiatael_hard },
            { opponentName: "O Operador de Loc Muinne", faction: "monsters", leader: 94, deck: AI_DECKS.monsters_hard }
        ],
        connections: ["aed_loc_muinne"]
    },
    {
        id: "aed_mahakam",
        region: "Mahakam",
        name: "Forjas Subterrâneas do Monte Carbon",
        lore: "Reduto inexpugnável dos anões de Mahakam. Yarpen Zigrin e Brouver Hoog apostam ouro puro nas tavernas da montanha.",
        type: "battle",
        x: 1980,
        y: 1210,
        opponent: {
            name: "Ancião Brouver Hoog",
            avatar: "img/sm/scoiatael_milva.jpg",
            faction: "scoiatael",
            leader: 140,
            deck: AI_DECKS.scoiatael_med
        },
        crownsReward: 320,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 171, count: 1, name: "Milva (Morale 10)" },
        connections: ["nr_ellander", "nr_maribor_fort", "aed_vengerberg", "tourney_3_mahakam"]
    },
    {
        id: "tourney_3_mahakam",
        region: "Mahakam",
        name: "Torneio da Grande Forja de Mahakam",
        lore: "Torneio de 3 batalhas seguidas nos salões de pedra de Mahakam. Vença os 3 mestres anões para conquistar 2 cartas de infantaria anã!",
        type: "tournament",
        isRegional: false,
        x: 2055,
        y: 1255,
        entryFee: 320,
        roundWinCrownsFirst: 330,
        roundWinCrownsRepeat: 40,
        grandPrizeCrowns: 1300,
        grandPrizeCards: [
            { index: 153, count: 1, name: "Dwarven Skirmisher" },
            { index: 170, count: 1, name: "Mahakaman Defender" }
        ],
        rounds: [
            { opponentName: "Ferreiro de Mahakam", faction: "scoiatael", leader: 141, deck: AI_DECKS.scoiatael_easy },
            { opponentName: "Veterano Sheldon Skaggs", faction: "realms", leader: 24, deck: AI_DECKS.realms_med },
            { opponentName: "Capitão Barclay Els", faction: "scoiatael", leader: 140, deck: AI_DECKS.scoiatael_med }
        ],
        connections: ["aed_mahakam"]
    },
    {
        id: "aed_rivia",
        region: "Lyria & Rívia",
        name: "Castelo Real de Rívia",
        lore: "Onde Geralt recebeu seu título de cavaleiro da Rainha Meve na Batalha da Ponte do Yaruga.",
        type: "battle",
        x: 2220,
        y: 1385,
        opponent: {
            name: "Rainha Meve de Lyria e Rívia",
            avatar: "img/sm/realms_sabrina.jpg",
            faction: "realms",
            leader: 25,
            deck: AI_DECKS.realms_med
        },
        crownsReward: 330,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 161, count: 1, name: "Havekar Healer (Medic)" },
        connections: ["aed_vengerberg", "ang_caed_dhu"]
    },
    {
        id: "aed_brokilon",
        region: "Floresta de Brokilon",
        name: "Águas Sagradas de Duén Canell",
        lore: "No coração místico da floresta primordial de Brokilon, a Rainha das Dríades Eithné desafia a sabedoria dos forasteiros.",
        type: "battle",
        x: 1340,
        y: 1560,
        opponent: {
            name: "Rainha Eithné de Brokilon",
            avatar: "img/sm/scoiatael_eithne.jpg",
            faction: "scoiatael",
            leader: 139,
            deck: AI_DECKS.scoiatael_hard
        },
        crownsReward: 400,
        crownsReplay: 90,
        crownsLoss: 80,
        cardDrop: { index: 154, count: 1, name: "Eithné (Hero 10)" },
        connections: ["vel_gors_velen", "sod_sodden_hill", "cin_cintra_capital"]
    },

    // ---------------------------------------------------------------------
    // REGION 4: ILHAS DE SKELLIGE (Início Skellige)
    // ---------------------------------------------------------------------
    {
        id: "skel_kaer_trolde_port",
        region: "Skellige",
        name: "Porto de Kaer Trolde (Ard Skellig)",
        lore: "Ponto de partida nas Ilhas de Skellige. Ao pé da grande fortaleza do Clã an Craite, guerreiros e navegadores testam sua coragem no Gwent.",
        type: "battle",
        x: 630,
        y: 1595,
        opponent: {
            name: "Jarl Crach an Craite",
            avatar: "img/sm/skellige_crach_an_craite.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_easy
        },
        crownsReward: 220,
        crownsReplay: 50,
        crownsLoss: 40,
        cardDrop: { index: 192, count: 1, name: "Clan an Craite Warrior" },
        connections: ["skel_gedyneith", "skel_spikeroog", "skel_an_skellig", "skel_hindarsfjall", "shop_skellige", "regional_tourney_skellige"]
    },
    {
        id: "shop_skellige",
        region: "Skellige",
        name: "Feirante Marítimo de Kaer Trolde",
        lore: "Mercador das ilhas com estoque de drakkares, guerreiros dos clãs, Mardroeme e tempestades de Skellige.",
        type: "shop",
        x: 575,
        y: 1565,
        connections: ["skel_kaer_trolde_port", "skel_spikeroog"]
    },
    {
        id: "skel_gedyneith",
        region: "Skellige",
        name: "Bosque Sagrado de Gedyneith",
        lore: "Debaixo do carvalho sagrado de Ard Skellig, o arquidruida Ermion domina as transformações de Berserkers com Mardroeme.",
        type: "battle",
        x: 645,
        y: 1650,
        opponent: {
            name: "Arquidruida Ermion",
            avatar: "img/sm/skellige_ermion.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_easy
        },
        crownsReward: 250,
        crownsReplay: 55,
        crownsLoss: 45,
        cardDrop: { index: 195, count: 1, name: "Ermion (Hero Mardroeme 8)" },
        connections: ["skel_kaer_trolde_port", "skel_fyresdal", "skel_faroe"]
    },
    {
        id: "skel_fyresdal",
        region: "Skellige",
        name: "Fortaleza de Kaer Muire",
        lore: "No extremo sul rochoso de Ard Skellig, o explosivo Madman Lugos joga no ataque total com o Clã Drummond.",
        type: "battle",
        x: 575,
        y: 1710,
        opponent: {
            name: "Madman Lugos",
            avatar: "img/sm/skellige_madmad_lugos.jpg",
            faction: "skellige",
            leader: 212,
            deck: AI_DECKS.skellige_med
        },
        crownsReward: 280,
        crownsReplay: 65,
        crownsLoss: 55,
        cardDrop: { index: 201, count: 1, name: "Madman Lugos" },
        connections: ["skel_gedyneith", "skel_undvik", "skel_faroe"]
    },
    {
        id: "skel_hindarsfjall",
        region: "Skellige",
        name: "Jardim de Freya (Hindarsfjall)",
        lore: "Na ilha sagrada da deusa Freya, o venerável Jarl Donar an Hindar mantém as tradições mais antigas do arquipélago.",
        type: "battle",
        x: 735,
        y: 1620,
        opponent: {
            name: "Jarl Donar an Hindar",
            avatar: "img/sm/skellige_donar.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_easy
        },
        crownsReward: 250,
        crownsReplay: 55,
        crownsLoss: 45,
        cardDrop: { index: 194, count: 1, name: "Donar an Hindar" },
        connections: ["skel_kaer_trolde_port", "skel_an_skellig", "skel_faroe"]
    },
    {
        id: "skel_an_skellig",
        region: "Skellige",
        name: "Porto de Urialla (An Skellig)",
        lore: "Ilha dos construtores navais do Clã Tuirseach. Seus navios de guerra dominam a fileira de cerco.",
        type: "battle",
        x: 725,
        y: 1495,
        opponent: {
            name: "Capitão de Urialla",
            avatar: "img/sm/skellige_light_longship.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_med
        },
        crownsReward: 280,
        crownsReplay: 65,
        crownsLoss: 55,
        cardDrop: { index: 187, count: 1, name: "Clan Drummond Shieldmaiden" },
        connections: ["skel_kaer_trolde_port", "skel_hindarsfjall", "skel_bremervoord"]
    },
    {
        id: "skel_spikeroog",
        region: "Skellige",
        name: "Povoado de Svorlag (Spikeroog)",
        lore: "Na ilha ocidental de Spikeroog, a destemida Cerys an Craite lidera suas escudeiras em batalhas implacáveis.",
        type: "battle",
        x: 535,
        y: 1510,
        opponent: {
            name: "Cerys an Craite",
            avatar: "img/sm/skellige_cerys.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_med
        },
        crownsReward: 320,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 184, count: 1, name: "Cerys (Hero Muster 10)" },
        connections: ["skel_kaer_trolde_port", "shop_skellige", "tourney_2_spikeroog"]
    },
    {
        id: "tourney_2_spikeroog",
        region: "Skellige",
        name: "Torneio dos Navegadores de Spikeroog",
        lore: "Torneio rápido de 2 batalhas seguidas nas tavernas de Svorlag. Vença os 2 desafios para ganhar uma Escudeira Drummond!",
        type: "tournament",
        isRegional: false,
        x: 485,
        y: 1465,
        entryFee: 180,
        roundWinCrownsFirst: 260,
        roundWinCrownsRepeat: 35,
        grandPrizeCrowns: 700,
        grandPrizeCards: [
            { index: 188, count: 1, name: "Clan Drummond Shieldmaiden" }
        ],
        rounds: [
            { opponentName: "Escudeira de Svorlag", faction: "skellige", leader: 211, deck: AI_DECKS.skellige_easy },
            { opponentName: "Mestre Druida Gremist", faction: "skellige", leader: 212, deck: AI_DECKS.skellige_med }
        ],
        connections: ["skel_spikeroog"]
    },
    {
        id: "skel_faroe",
        region: "Skellige",
        name: "Enseada de Harviken (Faroe)",
        lore: "Reduto dos corsários do Clã Dimun no sul do arquipélago. Blueboy Lugos aposta tesouros saqueados nos mares.",
        type: "battle",
        x: 680,
        y: 1715,
        opponent: {
            name: "Blueboy Lugos",
            avatar: "img/sm/skellige_blueboy.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_med
        },
        crownsReward: 300,
        crownsReplay: 70,
        crownsLoss: 60,
        cardDrop: { index: 182, count: 1, name: "Blueboy Lugos" },
        connections: ["skel_gedyneith", "skel_fyresdal", "skel_hindarsfjall"]
    },
    {
        id: "skel_undvik",
        region: "Skellige",
        name: "Forja Gelada de Undvik",
        lore: "Nas ruínas tomadas pelo gelo em Undvik, Hjalmar an Craite desafia o próprio frio e os gigantes em busca de glória eterna.",
        type: "battle",
        x: 505,
        y: 1765,
        opponent: {
            name: "Hjalmar an Craite",
            avatar: "img/sm/skellige_hjalmar.jpg",
            faction: "skellige",
            leader: 212,
            deck: AI_DECKS.skellige_hard
        },
        crownsReward: 380,
        crownsReplay: 85,
        crownsLoss: 75,
        cardDrop: { index: 197, count: 1, name: "Hjalmar (Hero 10)" },
        connections: ["skel_fyresdal"]
    },
    {
        id: "skel_bremervoord",
        region: "Costa do Mar do Norte",
        name: "Península de Bremervoord",
        lore: "Entre o continente e as Ilhas de Skellige, navegadores e bardos contam a lenda do galo dourado Kambi e de Hemdall.",
        type: "battle",
        x: 875,
        y: 1385,
        opponent: {
            name: "Capitão Mercante de Bremervoord",
            avatar: "img/sm/skellige_kambi.jpg",
            faction: "skellige",
            leader: 211,
            deck: AI_DECKS.skellige_med
        },
        crownsReward: 330,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 199, count: 1, name: "Kambi (Invoca Hemdall)" },
        connections: ["skel_an_skellig", "vel_cidaris"]
    },
    {
        id: "regional_tourney_skellige",
        region: "Skellige",
        name: "Torneio Regional de Skellige",
        lore: "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O grande banquete dos Jarls em Kaer Trolde! Derrote os 7 maiores campeões das ilhas em sequência para ganhar 10.000 Coroas, o Líder Rei Bran e a Insígnia dos Clãs de Skellige!",
        type: "tournament",
        isRegional: true,
        x: 655,
        y: 1545,
        entryFee: 1200,
        roundWinCrownsFirst: 550,
        roundWinCrownsRepeat: 70,
        grandPrizeCrowns: 10000,
        grandPrizeCards: [
            { index: 212, count: 1, name: "King Bran (Líder)" }
        ],
        trophyId: "insignia_skellige",
        rounds: [
            { opponentName: "Escaldo Draig Bon-Dhu", faction: "skellige", leader: 211, deck: AI_DECKS.skellige_easy },
            { opponentName: "Jarl Holger Mão-Negra", faction: "skellige", leader: 211, deck: AI_DECKS.skellige_med },
            { opponentName: "Rainha Viúva Birna Bran", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Guerreiro Hjalmar an Craite", faction: "skellige", leader: 211, deck: AI_DECKS.skellige_med },
            { opponentName: "Arquidruida Ermion", faction: "skellige", leader: 211, deck: AI_DECKS.skellige_hard },
            { opponentName: "Rainha Cerys an Craite", faction: "skellige", leader: 212, deck: AI_DECKS.skellige_hard },
            { opponentName: "Jarl Supremo Crach an Craite", faction: "skellige", leader: 212, deck: AI_DECKS.skellige_hard }
        ],
        connections: ["skel_kaer_trolde_port"]
    },

    // ---------------------------------------------------------------------
    // REGION 5: TOUSSAINT, ANGREN, SODDEN & CINTRA (Início Monstros)
    // ---------------------------------------------------------------------
    {
        id: "tous_corvo_bianco",
        region: "Toussaint",
        name: "Vinhedo Corvo Bianco",
        lore: "Ponto de partida do baralho de Monstros em Toussaint (Blood and Wine). Nas adegas escuras da propriedade, criaturas da noite e vampiros espreitam.",
        type: "battle",
        x: 2440,
        y: 2260,
        opponent: {
            name: "Mordomo Barnabas-Basil",
            avatar: "img/sm/monsters_katakan.jpg",
            faction: "monsters",
            leader: 93,
            deck: AI_DECKS.monsters_easy
        },
        crownsReward: 220,
        crownsReplay: 50,
        crownsLoss: 40,
        cardDrop: { index: 135, count: 1, name: "Vampire: Katakan" },
        connections: ["tous_fox_hollow", "tous_beauclair_palace", "shop_toussaint"]
    },
    {
        id: "shop_toussaint",
        region: "Toussaint",
        name: "Boutique Ducal de Beauclair",
        lore: "Colecionador de Beauclair especializado em criaturas raras, vampiros de Toussaint e líderes lendários.",
        type: "shop",
        x: 2340,
        y: 2225,
        connections: ["tous_corvo_bianco", "tous_beauclair_palace", "tous_fox_hollow"]
    },
    {
        id: "tous_fox_hollow",
        region: "Toussaint",
        name: "Estalagem da Raposa (Fox Hollow)",
        lore: "No cemitério de Mère-Lachaiselongue perto de Fox Hollow, o sábio vampiro superior Emiel Regis aprecia uma partida intelectual.",
        type: "battle",
        x: 2215,
        y: 2145,
        opponent: {
            name: "Emiel Regis Rohellec Terzieff",
            avatar: "img/sm/neutral_regis.jpg",
            faction: "monsters",
            leader: 95,
            deck: AI_DECKS.monsters_easy
        },
        crownsReward: 250,
        crownsReplay: 55,
        crownsLoss: 45,
        cardDrop: { index: 131, count: 1, name: "Vampire: Bruxa" },
        connections: ["tous_corvo_bianco", "shop_toussaint", "tous_dun_tynne", "tous_belhaven", "nilf_assengard"]
    },
    {
        id: "tous_dun_tynne",
        region: "Toussaint",
        name: "Castelo de Dun Tynne",
        lore: "Nas ruínas tomadas pela tempestade em Dun Tynne, a Fera de Beauclair, Dettlaff van der Eretein, comanda hordas de vampiros.",
        type: "battle",
        x: 2315,
        y: 2095,
        opponent: {
            name: "Dettlaff van der Eretein",
            avatar: "img/sm/monsters_ekimmara.jpg",
            faction: "monsters",
            leader: 94,
            deck: AI_DECKS.monsters_med
        },
        crownsReward: 290,
        crownsReplay: 65,
        crownsLoss: 55,
        cardDrop: { index: 132, count: 1, name: "Vampire: Ekimmara" },
        connections: ["tous_fox_hollow", "tous_beauclair_palace", "tous_belhaven"]
    },
    {
        id: "tous_beauclair_palace",
        region: "Toussaint",
        name: "Palácio Ducal de Beauclair",
        lore: "Nos salões perfumados de Beauclair, a enigmática Orianna esconde segredos imortais por trás de um sorriso encantador.",
        type: "battle",
        x: 2385,
        y: 2175,
        opponent: {
            name: "Senhora Orianna de Beauclair",
            avatar: "img/sm/monsters_fleder.jpg",
            faction: "monsters",
            leader: 95,
            deck: AI_DECKS.monsters_med
        },
        crownsReward: 310,
        crownsReplay: 70,
        crownsLoss: 60,
        cardDrop: { index: 133, count: 1, name: "Vampire: Fleder" },
        connections: ["tous_corvo_bianco", "shop_toussaint", "tous_dun_tynne", "regional_tourney_toussaint"]
    },
    {
        id: "tous_belhaven",
        region: "Toussaint",
        name: "Caverna do Ancião Oculto (Belhaven)",
        lore: "Nas profundezas subterrâneas junto ao rio Sansretour, o Ancião Oculto guarda o portal entre os mundos.",
        type: "battle",
        x: 2115,
        y: 1995,
        opponent: {
            name: "O Ancião Oculto (Unseen Elder)",
            avatar: "img/sm/monsters_garkain.jpg",
            faction: "monsters",
            leader: 94,
            deck: AI_DECKS.monsters_med
        },
        crownsReward: 340,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 134, count: 1, name: "Vampire: Garkain" },
        connections: ["tous_fox_hollow", "tous_dun_tynne", "tous_mount_gorgon", "nilf_assengard"]
    },
    {
        id: "tous_mount_gorgon",
        region: "Toussaint",
        name: "Encostas do Monte Gorgon",
        lore: "Sob os picos nevados do Monte Gorgon, espíritos antigos da floresta como o Leshen desafiam qualquer caçador.",
        type: "battle",
        x: 2165,
        y: 1875,
        opponent: {
            name: "Guardião do Monte Gorgon",
            avatar: "img/sm/monsters_leshen.jpg",
            faction: "monsters",
            leader: 95,
            deck: AI_DECKS.monsters_med
        },
        crownsReward: 360,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 126, count: 1, name: "Leshen (Hero 10)" },
        connections: ["tous_belhaven", "ang_caed_dhu"]
    },
    {
        id: "regional_tourney_toussaint",
        region: "Toussaint",
        name: "Torneio Regional de Toussaint",
        lore: "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O Magnífico Grande Torneio Ducal de Beauclair apadrinhado por Anna Henrietta! Vença 7 duelos consecutivos para conquistar 10.000 Coroas, o Líder Eredin Portador da Morte e a Insígnia Ducal de Toussaint!",
        type: "tournament",
        isRegional: true,
        x: 2475,
        y: 2165,
        entryFee: 1200,
        roundWinCrownsFirst: 550,
        roundWinCrownsRepeat: 70,
        grandPrizeCrowns: 10000,
        grandPrizeCards: [
            { index: 94, count: 1, name: "Eredin - Bringer of Death (Líder)" }
        ],
        trophyId: "insignia_toussaint",
        rounds: [
            { opponentName: "Cavaleiro Guillaume de Launfal", faction: "realms", leader: 25, deck: AI_DECKS.realms_med },
            { opponentName: "Cavaleiro Palmerin de Launfal", faction: "scoiatael", leader: 140, deck: AI_DECKS.scoiatael_med },
            { opponentName: "Conde de la Croix", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Capitão Damien de la Tour", faction: "realms", leader: 24, deck: AI_DECKS.realms_hard },
            { opponentName: "Princesa Sylvia Anna (Syanna)", faction: "nilfgaard", leader: 59, deck: AI_DECKS.nilfgaard_hard },
            { opponentName: "Vampiro Superior Dettlaff", faction: "monsters", leader: 95, deck: AI_DECKS.monsters_hard },
            { opponentName: "Grão-Duquesa Anna Henrietta", faction: "nilfgaard", leader: 59, deck: AI_DECKS.nilfgaard_hard }
        ],
        connections: ["tous_beauclair_palace"]
    },
    {
        id: "ang_caed_dhu",
        region: "Angren",
        name: "Pântanos de Angren & Ysgith",
        lore: "Nas matas alagadas de Angren, as três Moiras e os monstros insectoides atacam em enxames incessantes.",
        type: "battle",
        x: 2025,
        y: 1585,
        opponent: {
            name: "Tecelã dos Pântanos",
            avatar: "img/sm/monsters_kayran.jpg",
            faction: "monsters",
            leader: 95,
            deck: AI_DECKS.monsters_med
        },
        crownsReward: 360,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 125, count: 1, name: "Kayran (Hero Morale 8)" },
        connections: ["tous_mount_gorgon", "aed_rivia", "sod_sodden_hill"]
    },
    {
        id: "sod_sodden_hill",
        region: "Sodden",
        name: "Obelisco do Monte Sodden",
        lore: "Local da famosa Batalha do Monte Sodden. Os espectros de guerra e o temível Draug assombram o campo.",
        type: "battle",
        x: 1740,
        y: 1615,
        opponent: {
            name: "General Espectral Draug",
            avatar: "img/sm/monsters_draug.jpg",
            faction: "monsters",
            leader: 94,
            deck: AI_DECKS.monsters_hard
        },
        crownsReward: 380,
        crownsReplay: 85,
        crownsLoss: 75,
        cardDrop: { index: 108, count: 1, name: "Draug (Hero 10)" },
        connections: ["ang_caed_dhu", "nr_maribor_fort", "aed_brokilon", "cin_cintra_capital"]
    },
    {
        id: "cin_cintra_capital",
        region: "Cintra",
        name: "Cidadela Real de Cintra",
        lore: "Antigo trono da Rainha Calanthe e de Ciri. Os generais da Caçada Selvagem buscam o Sangue Ancestral nas ruínas.",
        type: "battle",
        x: 1265,
        y: 1795,
        opponent: {
            name: "General Imlerith (Caçada Selvagem)",
            avatar: "img/sm/monsters_imlerith.jpg",
            faction: "monsters",
            leader: 94,
            deck: AI_DECKS.monsters_hard
        },
        crownsReward: 400,
        crownsReplay: 90,
        crownsLoss: 80,
        cardDrop: { index: 124, count: 1, name: "Imlerith (Hero 10)" },
        connections: ["aed_brokilon", "sod_sodden_hill", "nilf_assengard", "tourney_3_cintra"]
    },
    {
        id: "tourney_3_cintra",
        region: "Cintra",
        name: "Torneio do Leão de Cintra",
        lore: "Torneio de 3 batalhas seguidas nas costas de Cintra. Vença os 3 comandantes em sequência para conquistar 2 cartas poderosas de Monstros!",
        type: "tournament",
        isRegional: false,
        x: 1410,
        y: 1815,
        entryFee: 350,
        roundWinCrownsFirst: 340,
        roundWinCrownsRepeat: 45,
        grandPrizeCrowns: 1400,
        grandPrizeCards: [
            { index: 97, count: 1, name: "Arachas Behemoth (Muster 6)" },
            { index: 105, count: 1, name: "Crone: Brewess (Muster 6)" }
        ],
        rounds: [
            { opponentName: "Castelão de Cintra", faction: "realms", leader: 22, deck: AI_DECKS.realms_med },
            { opponentName: "Navegador Caranthir", faction: "monsters", leader: 93, deck: AI_DECKS.monsters_med },
            { opponentName: "Príncipe Sapo (Ofeir)", faction: "monsters", leader: 95, deck: AI_DECKS.monsters_hard }
        ],
        connections: ["cin_cintra_capital"]
    },

    // ---------------------------------------------------------------------
    // REGION 6: IMPÉRIO DE NILFGAARD, VICOVARO, MAECHT & NAZAIR (Início Nilfgaard)
    // ---------------------------------------------------------------------
    {
        id: "nilf_capital_tavern",
        region: "Império de Nilfgaard",
        name: "Praça da Cidade das Torres Douradas",
        lore: "Ponto de partida do Império de Nilfgaard no extremo sul do continente. O aristocrata General Morvran Voorhis aprecia duelos de alta estratégia.",
        type: "battle",
        x: 1685,
        y: 3740,
        opponent: {
            name: "General Morvran Voorhis",
            avatar: "img/sm/nilfgaard_impera_brigade.jpg",
            faction: "nilfgaard",
            leader: 57,
            deck: AI_DECKS.nilfgaard_easy
        },
        crownsReward: 220,
        crownsReplay: 50,
        crownsLoss: 40,
        cardDrop: { index: 71, count: 1, name: "Impera Brigade Guard" },
        connections: ["nilf_castel_graupian", "nilf_tarnhann", "nilf_loc_grim", "shop_nilfgaard", "regional_tourney_nilfgaard"]
    },
    {
        id: "shop_nilfgaard",
        region: "Império de Nilfgaard",
        name: "Mercado Imperial das Torres Douradas",
        lore: "Fornecedor de elite do exército nilfgaardiano: brigadas Impera, espiões imperiais, arqueiros e líderes do Grande Sol.",
        type: "shop",
        x: 1610,
        y: 3695,
        connections: ["nilf_capital_tavern"]
    },
    {
        id: "nilf_castel_graupian",
        region: "Império de Nilfgaard",
        name: "Academia Militar de Castel Graupian",
        lore: "Nos campos de instrução da cavalaria imperial, o Duque Joachim de Wett comanda cargas da Brigada Nausicaa.",
        type: "battle",
        x: 1660,
        y: 3825,
        opponent: {
            name: "Duque Joachim de Wett",
            avatar: "img/sm/nilfgaard_nausicaa_2.jpg",
            faction: "nilfgaard",
            leader: 57,
            deck: AI_DECKS.nilfgaard_easy
        },
        crownsReward: 240,
        crownsReplay: 55,
        crownsLoss: 45,
        cardDrop: { index: 76, count: 1, name: "Nausicaa Cavalry Rider" },
        connections: ["nilf_capital_tavern", "nilf_tarnhann"]
    },
    {
        id: "nilf_tarnhann",
        region: "Império de Nilfgaard",
        name: "Palácio Senatorial de Tarnhann",
        lore: "O experiente diplomata Shilard Fitz-Oesterlen usa sua rede de informantes para dominar a vantagem de cartas.",
        type: "battle",
        x: 1775,
        y: 3785,
        opponent: {
            name: "Embaixador Shilard Fitz-Oesterlen",
            avatar: "img/sm/nilfgaard_shilard.jpg",
            faction: "nilfgaard",
            leader: 58,
            deck: AI_DECKS.nilfgaard_easy
        },
        crownsReward: 260,
        crownsReplay: 60,
        crownsLoss: 50,
        cardDrop: { index: 82, count: 1, name: "Shilard Fitz-Oesterlen (Spy 7)" },
        connections: ["nilf_capital_tavern", "nilf_castel_graupian", "nilf_loc_grim"]
    },
    {
        id: "nilf_loc_grim",
        region: "Império de Nilfgaard",
        name: "Palácio Imperial de Loc Grim",
        lore: "Residência de verão do Imperador junto ao Rio Alba. O chefe do serviço secreto Vattier de Rideaux observa cada movimento.",
        type: "battle",
        x: 1870,
        y: 3620,
        opponent: {
            name: "Vattier de Rideaux",
            avatar: "img/sm/nilfgaard_vattier.jpg",
            faction: "nilfgaard",
            leader: 58,
            deck: AI_DECKS.nilfgaard_med
        },
        crownsReward: 290,
        crownsReplay: 65,
        crownsLoss: 55,
        cardDrop: { index: 90, count: 1, name: "Vattier de Rideaux (Spy 4)" },
        connections: ["nilf_capital_tavern", "nilf_tarnhann", "nilf_vicovaro", "nilf_gemmera"]
    },
    {
        id: "nilf_vicovaro",
        region: "Vicovaro",
        name: "Academia Imperial de Vicovaro",
        lore: "Centro de medicina de campanha e magia imperial. As feiticeiras Fringilla Vigo e Assire var Anahid dominam o conhecimento arcano.",
        type: "battle",
        x: 2270,
        y: 3530,
        opponent: {
            name: "Feiticeira Fringilla Vigo",
            avatar: "img/sm/nilfgaard_fringilla.jpg",
            faction: "nilfgaard",
            leader: 58,
            deck: AI_DECKS.nilfgaard_med
        },
        crownsReward: 310,
        crownsReplay: 70,
        crownsLoss: 60,
        cardDrop: { index: 70, count: 1, name: "Fringilla Vigo" },
        connections: ["nilf_loc_grim", "nilf_darn_dyffra", "tourney_3_vicovaro"]
    },
    {
        id: "tourney_3_vicovaro",
        region: "Vicovaro",
        name: "Torneio da Academia de Vicovaro",
        lore: "Torneio de 3 batalhas seguidas entre os médicos e arcanistas de Vicovaro. Vença as 3 partidas para conquistar 2 cartas táticas de Nilfgaard!",
        type: "tournament",
        isRegional: false,
        x: 2355,
        y: 3575,
        entryFee: 300,
        roundWinCrownsFirst: 320,
        roundWinCrownsRepeat: 40,
        grandPrizeCrowns: 1250,
        grandPrizeCards: [
            { index: 63, count: 1, name: "Assire var Anahid" },
            { index: 83, count: 1, name: "Siege Technician (Medic)" }
        ],
        rounds: [
            { opponentName: "Cirurgião de Vicovaro", faction: "nilfgaard", leader: 57, deck: AI_DECKS.nilfgaard_easy },
            { opponentName: "Mago Renuald aep Matsen", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Mestra Assire var Anahid", faction: "nilfgaard", leader: 59, deck: AI_DECKS.nilfgaard_med }
        ],
        connections: ["nilf_vicovaro"]
    },
    {
        id: "nilf_darn_dyffra",
        region: "Vicovaro",
        name: "Fortaleza de Darn Dyffra",
        lore: "O Marechal de Campo Menno Coehoorn coordena daqui as legiões imperiais que marcham rumo ao norte.",
        type: "battle",
        x: 2350,
        y: 3360,
        opponent: {
            name: "Marechal Menno Coehoorn",
            avatar: "img/sm/nilfgaard_menno.jpg",
            faction: "nilfgaard",
            leader: 59,
            deck: AI_DECKS.nilfgaard_med
        },
        crownsReward: 340,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 73, count: 1, name: "Menno Coehoorn (Hero Medic 10)" },
        connections: ["nilf_vicovaro", "nilf_gemmera", "nilf_maecht"]
    },
    {
        id: "nilf_gemmera",
        region: "Gemmera",
        name: "Guarnição de Gemmera",
        lore: "Nas terras áridas de Gemmera, o bruxo regicida Letho de Gulet testa sua frieza implacável nas cartas.",
        type: "battle",
        x: 1915,
        y: 3230,
        opponent: {
            name: "Letho de Gulet",
            avatar: "img/sm/nilfgaard_letho.jpg",
            faction: "nilfgaard",
            leader: 60,
            deck: AI_DECKS.nilfgaard_hard
        },
        crownsReward: 370,
        crownsReplay: 85,
        crownsLoss: 75,
        cardDrop: { index: 72, count: 1, name: "Letho of Gulet (Hero 10)" },
        connections: ["nilf_loc_grim", "nilf_darn_dyffra", "nilf_stygga", "nilf_maecht"]
    },
    {
        id: "nilf_stygga",
        region: "Ebbing & Salm",
        name: "Castelo Stygga",
        lore: "A sinistra cidadela costeira onde o mago renegado Vilgefortz e o agente Stefan Skellen tramam seus planos.",
        type: "battle",
        x: 1745,
        y: 3110,
        opponent: {
            name: "Stefan Skellen (Coruja)",
            avatar: "img/sm/nilfgaard_stefan.jpg",
            faction: "nilfgaard",
            leader: 59,
            deck: AI_DECKS.nilfgaard_med
        },
        crownsReward: 360,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 84, count: 1, name: "Stefan Skellen (Spy 9)" },
        connections: ["nilf_gemmera", "nilf_claremont"]
    },
    {
        id: "nilf_maecht",
        region: "Maecht",
        name: "Cidadela Real de Maecht",
        lore: "O impetuoso Coronel Tibor Eggebracht lidera a cavalaria pesada de Alba a partir das muralhas de Maecht.",
        type: "battle",
        x: 1990,
        y: 2975,
        opponent: {
            name: "Coronel Tibor Eggebracht",
            avatar: "img/sm/nilfgaard_tibor.jpg",
            faction: "nilfgaard",
            leader: 58,
            deck: AI_DECKS.nilfgaard_hard
        },
        crownsReward: 380,
        crownsReplay: 85,
        crownsLoss: 75,
        cardDrop: { index: 86, count: 1, name: "Tibor Eggebracht (Hero 10)" },
        connections: ["nilf_darn_dyffra", "nilf_gemmera", "nilf_claremont", "tourney_5_maecht"]
    },
    {
        id: "nilf_claremont",
        region: "Ebbing",
        name: "Arena de Claremont (Ebbing)",
        lore: "Em Claremont, o temido caçador de recompensas Leo Bonhart desafia qualquer um que ouse cruzar seu caminho.",
        type: "battle",
        x: 1560,
        y: 2790,
        opponent: {
            name: "Caçador Leo Bonhart",
            avatar: "img/sm/nilfgaard_moorvran.jpg",
            faction: "nilfgaard",
            leader: 60,
            deck: AI_DECKS.nilfgaard_hard
        },
        crownsReward: 390,
        crownsReplay: 85,
        crownsLoss: 75,
        cardDrop: { index: 75, count: 1, name: "Morvran Voorhis (Hero 10)" },
        connections: ["nilf_stygga", "nilf_maecht", "nilf_metinna", "tourney_5_maecht"]
    },
    {
        id: "tourney_5_maecht",
        region: "Maecht & Metinna",
        name: "Torneio dos Generais do Sul",
        lore: "Torneio de Elite de 5 Partidas Seguidas reunindo os comandantes das províncias imperiais! Vença as 5 batalhas sem perder para ganhar 3 cartas de elite!",
        type: "tournament",
        isRegional: false,
        x: 1855,
        y: 2740,
        entryFee: 550,
        roundWinCrownsFirst: 400,
        roundWinCrownsRepeat: 50,
        grandPrizeCrowns: 2600,
        grandPrizeCards: [
            { index: 71, count: 1, name: "Impera Brigade Guard" },
            { index: 68, count: 1, name: "Etolian Auxiliary Archers (Medic)" },
            { index: 79, count: 1, name: "Heavy Zerrikanian Fire Scorpion" }
        ],
        rounds: [
            { opponentName: "Capitão Sweers", faction: "nilfgaard", leader: 57, deck: AI_DECKS.nilfgaard_easy },
            { opponentName: "Comandante Vreemde", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Cavaleiro Cahir aep Ceallach", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "General Menno Coehoorn", faction: "nilfgaard", leader: 59, deck: AI_DECKS.nilfgaard_hard },
            { opponentName: "Mago Vilgefortz de Roggeveen", faction: "nilfgaard", leader: 60, deck: AI_DECKS.nilfgaard_hard }
        ],
        connections: ["nilf_maecht", "nilf_claremont", "nilf_metinna"]
    },
    {
        id: "nilf_metinna",
        region: "Metinna",
        name: "Planícies dos Cavalos de Metinna",
        lore: "Terra dos mais velozes ginetes e arqueiros do império. Os esquadrões de arco longo negro nunca erram o alvo.",
        type: "battle",
        x: 1725,
        y: 2505,
        opponent: {
            name: "Mestre Arqueiro de Metinna",
            avatar: "img/sm/nilfgaard_black_archer.jpg",
            faction: "nilfgaard",
            leader: 58,
            deck: AI_DECKS.nilfgaard_med
        },
        crownsReward: 340,
        crownsReplay: 75,
        crownsLoss: 65,
        cardDrop: { index: 64, count: 1, name: "Black Infantry Archer" },
        connections: ["nilf_claremont", "tourney_5_maecht", "nilf_tor_zireael"]
    },
    {
        id: "nilf_tor_zireael",
        region: "Nazair",
        name: "Lago Tarn Mira & Tor Zireael",
        lore: "Junto ao lendário Lago Sem Fundo onde se ergue a Torre da Andorinha, o sábio élfico Avallac'h guarda cartas de poder ancestral.",
        type: "battle",
        x: 1685,
        y: 2325,
        opponent: {
            name: "Sábio Aen Elle Avallac'h",
            avatar: "img/sm/neutral_mysterious_elf.jpg",
            faction: "scoiatael",
            leader: 139,
            deck: AI_DECKS.scoiatael_hard
        },
        crownsReward: 420,
        crownsReplay: 95,
        crownsLoss: 85,
        cardDrop: { index: 3, count: 1, name: "Cirilla Fiona Elen Riannon (Hero 15)" },
        connections: ["nilf_metinna", "nilf_assengard"]
    },
    {
        id: "nilf_assengard",
        region: "Nazair",
        name: "Passo Montanhoso de Assengard",
        lore: "Encruzilhada estratégica ao sul da Cordilheira Amell, conectando o Império de Nilfgaard a Cintra e ao Ducado de Toussaint.",
        type: "battle",
        x: 1695,
        y: 2170,
        opponent: {
            name: "Astrólogo Imperial Xarthisius",
            avatar: "img/sm/nilfgaard_nauzicaa.jpg",
            faction: "nilfgaard",
            leader: 58,
            deck: AI_DECKS.nilfgaard_med
        },
        crownsReward: 350,
        crownsReplay: 80,
        crownsLoss: 70,
        cardDrop: { index: 88, count: 1, name: "Black Infantry Archer" },
        connections: ["nilf_tor_zireael", "cin_cintra_capital", "tous_belhaven", "tous_fox_hollow"]
    },
    {
        id: "regional_tourney_nilfgaard",
        region: "Império de Nilfgaard",
        name: "Torneio Regional de Nilfgaard",
        lore: "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O Grande Torneio Imperial da Cidade das Torres Douradas, presidido pelo próprio Imperador Emhyr var Emreis! Vença 7 duelos seguidos para conquistar 10.000 Coroas, o Líder Emhyr O Implacável e a Insígnia do Grande Sol!",
        type: "tournament",
        isRegional: true,
        x: 1755,
        y: 3685,
        entryFee: 1200,
        roundWinCrownsFirst: 550,
        roundWinCrownsRepeat: 70,
        grandPrizeCrowns: 10000,
        grandPrizeCards: [
            { index: 59, count: 1, name: "Emhyr var Emreis - The Relentless (Líder)" }
        ],
        trophyId: "insignia_nilfgaard",
        rounds: [
            { opponentName: "Duque Joachim de Wett", faction: "nilfgaard", leader: 57, deck: AI_DECKS.nilfgaard_easy },
            { opponentName: "Embaixador Shilard Fitz-Oesterlen", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "Mestre de Espiões Vattier de Rideaux", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_med },
            { opponentName: "General Morvran Voorhis", faction: "nilfgaard", leader: 58, deck: AI_DECKS.nilfgaard_hard },
            { opponentName: "Bruxo Letho de Gulet", faction: "nilfgaard", leader: 60, deck: AI_DECKS.nilfgaard_hard },
            { opponentName: "Marechal Menno Coehoorn", faction: "nilfgaard", leader: 59, deck: AI_DECKS.nilfgaard_hard },
            { opponentName: "Imperador Emhyr var Emreis", faction: "nilfgaard", leader: 59, deck: AI_DECKS.nilfgaard_hard }
        ],
        connections: ["nilf_capital_tavern"]
    }
];

// Populate STORY_DATA.NODES and ensure symmetric bidirectional connections
rawNodes.forEach(n => {
    STORY_DATA.NODES[n.id] = n;
});

for (const node of Object.values(STORY_DATA.NODES)) {
    (node.connections || []).forEach(targetId => {
        const target = STORY_DATA.NODES[targetId];
        if (!target) {
            throw new Error(`Invalid connection target ${targetId} from ${node.id}`);
        }
        if (!target.connections.includes(node.id)) {
            target.connections.push(node.id);
        }
    });
}

// =========================================================================
// BUILD REGIONAL SHOPS SO 100% OF ALL 216 CARDS ARE OBTAINABLE
// AND ZERO CARDS EVER EXCEED THEIR MAX COPIES
// =========================================================================
// Track how many copies of each card are already awarded via battles & tournaments
const battleAndTourneyCounts = {};
for (const node of Object.values(STORY_DATA.NODES)) {
    if (node.cardDrop) {
        battleAndTourneyCounts[node.cardDrop.index] = (battleAndTourneyCounts[node.cardDrop.index] || 0) + (node.cardDrop.count || 1);
    }
    if (node.grandPrizeCards) {
        node.grandPrizeCards.forEach(c => {
            battleAndTourneyCounts[c.index] = (battleAndTourneyCounts[c.index] || 0) + (c.count || 1);
        });
    }
}

// Price estimator based on card type and strength
function getCardShopPrice(card) {
    if (card.row === "leader") return 1800;
    const isHero = (card.ability || "").includes("hero");
    const isSpy = (card.ability || "").includes("spy");
    const str = Number(card.str) || 0;
    if (isHero) return 1400;
    if (isSpy) return 950;
    if (card.deck === "special" || card.deck === "weather") return 450;
    if (str >= 8) return 650;
    if (str >= 5) return 400;
    return 250;
}

const SHOP_REQUIREMENTS = {
    shop_temeria: {
        "Foltest - The Steel-Forged": { type: "faction_wins", faction: "realms", count: 2, desc: "Vença 2 duelos contra Reinos do Norte" },
        "Foltest - Son of Medell": { type: "faction_wins", faction: "realms", count: 4, desc: "Vença 4 duelos contra Reinos do Norte" },
        "Prince Stennis": { type: "total_wins", count: 5, desc: "Vença 5 duelos no Continente" },
        "Ballista": { type: "total_wins", count: 3, desc: "Vença 3 duelos no Continente" }
    },
    shop_novigrad: {
        "Mysterious Elf": { type: "total_wins", count: 12, desc: "Vença 12 duelos no Continente" },
        "Villentretenmerth": { type: "tourneys_won", count: 1, desc: "Vença 1 Torneio no Continente" },
        "Scorch": { type: "faction_wins", faction: "monsters", count: 3, desc: "Vença 3 duelos contra Monstros" },
        "Olgierd von Everec": { type: "total_wins", count: 6, desc: "Vença 6 duelos no Continente" },
        "Commander's Horn": { type: "total_wins", count: 4, desc: "Vença 4 duelos no Continente" }
    },
    shop_nilfgaard: {
        "Emhyr var Emreis - Emperor of Nilfgaard": { type: "faction_wins", faction: "nilfgaard", count: 2, desc: "Vença 2 duelos contra Nilfgaard" },
        "Emhyr var Emreis - the White Flame": { type: "faction_wins", faction: "nilfgaard", count: 4, desc: "Vença 4 duelos contra Nilfgaard" },
        "Shilard Fitz-Oesterlen": { type: "total_wins", count: 5, desc: "Vença 5 duelos no Continente" },
        "Zerrikanian Fire Scorpion": { type: "faction_wins", faction: "nilfgaard", count: 3, desc: "Vença 3 duelos contra Nilfgaard" }
    },
    shop_skellige: {
        "Crach an Craite": { type: "faction_wins", faction: "skellige", count: 3, desc: "Vença 3 duelos contra Skellige" },
        "Olaf": { type: "total_wins", count: 5, desc: "Vença 5 duelos no Continente" },
        "War Longship": { type: "faction_wins", faction: "skellige", count: 2, desc: "Vença 2 duelos contra Skellige" },
        "Blueboy Lugos": { type: "total_wins", count: 3, desc: "Vença 3 duelos no Continente" }
    },
    shop_dol_blathanna: {
        "Francesca Findabair - the Beautiful": { type: "faction_wins", faction: "scoiatael", count: 2, desc: "Vença 2 duelos contra Scoia'tael" },
        "Francesca Findabair - Pureblood Elf": { type: "faction_wins", faction: "scoiatael", count: 4, desc: "Vença 4 duelos contra Scoia'tael" },
        "Milva": { type: "faction_wins", faction: "scoiatael", count: 3, desc: "Vença 3 duelos contra Scoia'tael" },
        "Saesenthessis": { type: "total_wins", count: 8, desc: "Vença 8 duelos no Continente" }
    },
    shop_toussaint: {
        "Eredin - Destroyer of Worlds": { type: "faction_wins", faction: "monsters", count: 2, desc: "Vença 2 duelos contra Monstros" },
        "Eredin - King of the Wild Hunt": { type: "faction_wins", faction: "monsters", count: 4, desc: "Vença 4 duelos contra Monstros" },
        "Frightener": { type: "faction_wins", faction: "monsters", count: 3, desc: "Vença 3 duelos contra Monstros" },
        "Ice Giant": { type: "total_wins", count: 6, desc: "Vença 6 duelos no Continente" }
    }
};

const shopConfigs = {
    shop_temeria: {
        id: "shop_temeria",
        name: "Empório Real de Vízima",
        region: "Teméria",
        greeting: "Bem-vindo a Vízima! Temos todas as tropas, máquinas de cerco e líderes dos Reinos do Norte para reforçar seu exército.",
        decks: ["realms"],
        items: []
    },
    shop_novigrad: {
        id: "shop_novigrad",
        name: "Empório da Praça do Hierarca",
        region: "Redânia & Novigrad",
        greeting: "Ouro fala mais alto em Novigrad! Aqui você encontra heróis neutros, cartas de clima e relíquias especiais de todo o Continente.",
        decks: ["neutral", "special", "weather"],
        items: []
    },
    shop_dol_blathanna: {
        id: "shop_dol_blathanna",
        name: "Mercador Élfico de Dol Blathanna",
        region: "Aedirn & Dol Blathanna",
        greeting: "Que a sabedoria dos Aen Seidhe guie sua mão. Temos arqueiros élficos, defensores de Mahakam e líderes Scoia'tael.",
        decks: ["scoiatael"],
        items: []
    },
    shop_skellige: {
        id: "shop_skellige",
        name: "Feirante Marítimo de Kaer Trolde",
        region: "Skellige",
        greeting: "Pelo sangue de Freya! Drakkares de guerra, guerreiros dos clãs e ervas de Mardroeme forjados nas ilhas.",
        decks: ["skellige"],
        items: []
    },
    shop_toussaint: {
        id: "shop_toussaint",
        name: "Boutique Ducal de Beauclair",
        region: "Toussaint",
        greeting: "Ah, cavalheiro! Em Beauclair reunimos espécimes raros de criaturas, vampiros e líderes da Caçada Selvagem.",
        decks: ["monsters"],
        items: []
    },
    shop_nilfgaard: {
        id: "shop_nilfgaard",
        name: "Mercado Imperial das Torres Douradas",
        region: "Império de Nilfgaard",
        greeting: "Pela glória do Grande Sol! Todo o poderio tático, brigadas e líderes do Império de Nilfgaard estão à sua disposição.",
        decks: ["nilfgaard"],
        items: []
    }
};

// Distribute all remaining playable cards into their respective regional shops
// Note: cards that are in a starter deck are ALSO placed in that faction's shop with max = maxCopies - battleAndTourneyCounts,
// and the game engine dynamically caps shop stock by (maxAllowed - playerOwnedCount), so:
// 1. If the player started with that faction, they already own the starter copies (so they can't buy duplicates).
// 2. If the player started with ANOTHER faction, they can buy that faction's starter cards in the regional shop to complete 216/216!
list.forEach(c => {
    const idx = c.i;
    // Skip the 4 summoned token cards (they unlock automatically with their summoner)
    if ([21, 196, 206, 207].includes(idx)) return;

    const maxAllowed = c.row === "leader" ? 1 : (Number(c.count) || 1);
    const fromBattlesAndTourneys = battleAndTourneyCounts[idx] || 0;
    const neededInShop = Math.max(0, maxAllowed - fromBattlesAndTourneys);

    if (neededInShop > 0) {
        const targetShop = Object.values(shopConfigs).find(s => s.decks.includes(c.deck));
        if (targetShop) {
            const itemObj = {
                cardIndex: idx,
                price: getCardShopPrice(c),
                max: neededInShop,
                name: c.name
            };
            const req = (SHOP_REQUIREMENTS[targetShop.id] && SHOP_REQUIREMENTS[targetShop.id][c.name]);
            if (req) itemObj.requirement = req;
            targetShop.items.push(itemObj);
        }
    }
});

STORY_DATA.SHOPS = shopConfigs;

// Generate compendium hints mapping
const COMPENDIUM_HINTS = {};
list.forEach(c => {
    COMPENDIUM_HINTS[c.i] = {
        name: c.name,
        deck: c.deck,
        str: c.str,
        ability: c.ability,
        row: c.row,
        maxCount: c.row === "leader" ? 1 : Number(c.count)
    };
});

// Map where cards are dropped or sold
for (const node of Object.values(STORY_DATA.NODES)) {
    if (node.cardDrop) {
        COMPENDIUM_HINTS[node.cardDrop.index].source = `Vença ${node.opponent.name} em ${node.name} (${node.region})`;
    }
    if (node.type === "tournament" && node.grandPrizeCards) {
        node.grandPrizeCards.forEach(card => {
            COMPENDIUM_HINTS[card.index].source = `Prêmio de Campeão: ${node.name} (${node.region})`;
        });
    }
}
for (const shop of Object.values(STORY_DATA.SHOPS)) {
    shop.items.forEach(item => {
        if (!COMPENDIUM_HINTS[item.cardIndex].source) {
            COMPENDIUM_HINTS[item.cardIndex].source = `Disponível em ${shop.name} (${shop.region})`;
        } else {
            COMPENDIUM_HINTS[item.cardIndex].source += ` / ${shop.name}`;
        }
    });
}
// Token hints
COMPENDIUM_HINTS[21].source = "Invocada automaticamente pela carta Vaca (Cow).";
COMPENDIUM_HINTS[196].source = "Invocado automaticamente pela carta Kambi.";
COMPENDIUM_HINTS[206].source = "Invocado ao transformar Berserker com Mardroeme.";
COMPENDIUM_HINTS[207].source = "Invocado ao transformar Jovem Berserker com Mardroeme.";

STORY_DATA.COMPENDIUM_HINTS = COMPENDIUM_HINTS;

// Write story_data.js
const fileContent = '// Story Mode Data for Gwent Classic\r\n"use strict";\r\n\r\nvar STORY_DATA = ' + JSON.stringify(STORY_DATA, null, 2) + ';\r\n\r\nif (typeof module !== "undefined" && module.exports) {\r\n\tmodule.exports = STORY_DATA;\r\n}\r\n';
fs.writeFileSync(__dirname + '/story_data.js', fileContent, 'utf-8');
console.log('story_data.js generated successfully! Total nodes:', Object.keys(STORY_DATA.NODES).length);
