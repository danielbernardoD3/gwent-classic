// Story Mode Data for Gwent Classic
"use strict";

var STORY_DATA = {
  "STARTING_CROWNS": 2000,
  "MAP_WIDTH": 2894,
  "MAP_HEIGHT": 4096,
  "STARTER_NODES": {
    "realms": "nr_white_orchard",
    "nilfgaard": "nilf_capital_tavern",
    "skellige": "skel_kaer_trolde_port",
    "monsters": "tous_corvo_bianco",
    "scoiatael": "aed_dol_blathanna"
  },
  "STARTER_REGIONS_INFO": {
    "realms": "Teméria & Redânia (Pomar Branco)",
    "nilfgaard": "Império de Nilfgaard (Cidade das Torres Douradas)",
    "skellige": "Arquipélago de Skellige (Porto de Kaer Trolde)",
    "monsters": "Ducado de Toussaint (Vinhedo Corvo Bianco)",
    "scoiatael": "Aedirn & Vale das Flores (Dol Blathanna)"
  },
  "STARTER_DECKS": {
    "realms": {
      "name": "Reinos do Norte",
      "leader": 22,
      "cards": [
        [
          40,
          2
        ],
        [
          42,
          1
        ],
        [
          43,
          1
        ],
        [
          34,
          1
        ],
        [
          35,
          1
        ],
        [
          36,
          1
        ],
        [
          44,
          1
        ],
        [
          53,
          1
        ],
        [
          27,
          1
        ],
        [
          54,
          1
        ],
        [
          38,
          1
        ],
        [
          41,
          1
        ],
        [
          46,
          1
        ],
        [
          48,
          1
        ],
        [
          52,
          1
        ],
        [
          16,
          1
        ],
        [
          13,
          1
        ],
        [
          2,
          1
        ],
        [
          9,
          1
        ],
        [
          4,
          1
        ],
        [
          1,
          1
        ]
      ]
    },
    "nilfgaard": {
      "name": "Império de Nilfgaard",
      "leader": 57,
      "cards": [
        [
          71,
          2
        ],
        [
          76,
          2
        ],
        [
          61,
          1
        ],
        [
          85,
          1
        ],
        [
          74,
          1
        ],
        [
          77,
          1
        ],
        [
          80,
          1
        ],
        [
          91,
          1
        ],
        [
          92,
          1
        ],
        [
          65,
          1
        ],
        [
          67,
          1
        ],
        [
          69,
          1
        ],
        [
          87,
          1
        ],
        [
          89,
          1
        ],
        [
          16,
          1
        ],
        [
          13,
          1
        ],
        [
          2,
          1
        ],
        [
          9,
          1
        ],
        [
          4,
          1
        ],
        [
          1,
          1
        ]
      ]
    },
    "monsters": {
      "name": "Monstros",
      "leader": 93,
      "cards": [
        [
          117,
          1
        ],
        [
          118,
          1
        ],
        [
          127,
          1
        ],
        [
          128,
          1
        ],
        [
          98,
          1
        ],
        [
          99,
          1
        ],
        [
          122,
          1
        ],
        [
          113,
          1
        ],
        [
          137,
          1
        ],
        [
          114,
          1
        ],
        [
          121,
          1
        ],
        [
          136,
          1
        ],
        [
          102,
          1
        ],
        [
          103,
          1
        ],
        [
          104,
          1
        ],
        [
          110,
          1
        ],
        [
          116,
          1
        ],
        [
          123,
          1
        ],
        [
          16,
          1
        ],
        [
          2,
          1
        ],
        [
          9,
          1
        ],
        [
          10,
          1
        ]
      ]
    },
    "scoiatael": {
      "name": "Scoia'tael",
      "leader": 141,
      "cards": [
        [
          151,
          1
        ],
        [
          152,
          1
        ],
        [
          177,
          1
        ],
        [
          175,
          1
        ],
        [
          162,
          1
        ],
        [
          163,
          1
        ],
        [
          148,
          1
        ],
        [
          149,
          1
        ],
        [
          147,
          1
        ],
        [
          145,
          1
        ],
        [
          146,
          1
        ],
        [
          144,
          1
        ],
        [
          158,
          1
        ],
        [
          165,
          1
        ],
        [
          168,
          1
        ],
        [
          169,
          1
        ],
        [
          176,
          1
        ],
        [
          16,
          1
        ],
        [
          13,
          1
        ],
        [
          11,
          1
        ],
        [
          4,
          1
        ],
        [
          1,
          1
        ]
      ]
    },
    "skellige": {
      "name": "Skellige",
      "leader": 211,
      "cards": [
        [
          192,
          2
        ],
        [
          185,
          2
        ],
        [
          186,
          1
        ],
        [
          200,
          2
        ],
        [
          209,
          2
        ],
        [
          183,
          1
        ],
        [
          193,
          1
        ],
        [
          190,
          1
        ],
        [
          191,
          1
        ],
        [
          181,
          1
        ],
        [
          205,
          1
        ],
        [
          208,
          1
        ],
        [
          198,
          1
        ],
        [
          16,
          1
        ],
        [
          202,
          1
        ],
        [
          204,
          1
        ],
        [
          4,
          1
        ],
        [
          1,
          1
        ]
      ]
    }
  },
  "TROPHIES": {
    "insignia_temeria": {
      "id": "insignia_temeria",
      "title": "Insígnia Real de Teméria",
      "region": "Teméria",
      "icon": "⚜️",
      "image": "img/hud-icons/Temeria-Badge.png",
      "desc": "Insígnia dos Lírios de Prata conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Teméria."
    },
    "insignia_redania": {
      "id": "insignia_redania",
      "title": "Insígnia da Águia Redaniana",
      "region": "Redânia",
      "icon": "🦅",
      "image": "img/hud-icons/Redania-Badge.png",
      "desc": "Insígnia Real da Águia conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional da Redânia."
    },
    "insignia_skellige": {
      "id": "insignia_skellige",
      "title": "Insígnia dos Clãs de Skellige",
      "region": "Skellige",
      "icon": "🛡️",
      "image": "img/hud-icons/Skellige-Badge.png",
      "desc": "Insígnia Ancestral de Kaer Trolde conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Skellige."
    },
    "insignia_toussaint": {
      "id": "insignia_toussaint",
      "title": "Insígnia Ducal de Toussaint",
      "region": "Toussaint",
      "icon": "🍷",
      "image": "img/hud-icons/Toussaint-badge.png",
      "desc": "Insígnia Ducal de Beauclair conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Toussaint."
    },
    "insignia_nilfgaard": {
      "id": "insignia_nilfgaard",
      "title": "Insígnia do Grande Sol de Nilfgaard",
      "region": "Nilfgaard",
      "icon": "☀️",
      "image": "img/hud-icons/Nilfgaard-Badge.png",
      "desc": "Insígnia Imperial de Ouro conquistada ao vencer as 7 batalhas seguidas do Grande Torneio Regional de Nilfgaard."
    }
  },
  "SHOPS": {
    "shop_temeria": {
      "id": "shop_temeria",
      "name": "Empório Real de Vízima",
      "region": "Teméria",
      "greeting": "Bem-vindo a Vízima! Temos todas as tropas, máquinas de cerco e líderes dos Reinos do Norte para reforçar seu exército.",
      "decks": [
        "realms"
      ],
      "items": [
        {
          "cardIndex": 22,
          "price": 1800,
          "max": 1,
          "name": "Foltest - King of Temeria"
        },
        {
          "cardIndex": 25,
          "price": 1800,
          "max": 1,
          "name": "Foltest - The Steel-Forged"
        },
        {
          "cardIndex": 26,
          "price": 1800,
          "max": 1,
          "name": "Foltest - Son of Medell"
        },
        {
          "cardIndex": 28,
          "price": 250,
          "max": 1,
          "name": "Blue Stripes Commando"
        },
        {
          "cardIndex": 30,
          "price": 400,
          "max": 1,
          "name": "Crinfrid Reavers Dragon Hunter"
        },
        {
          "cardIndex": 35,
          "price": 250,
          "max": 1,
          "name": "Kaedweni Siege Expert"
        },
        {
          "cardIndex": 36,
          "price": 250,
          "max": 1,
          "name": "Kaedweni Siege Expert"
        },
        {
          "cardIndex": 38,
          "price": 400,
          "max": 1,
          "name": "Keira Metz"
        },
        {
          "cardIndex": 40,
          "price": 250,
          "max": 4,
          "name": "Poor Fucking Infantry"
        },
        {
          "cardIndex": 41,
          "price": 950,
          "max": 1,
          "name": "Prince Stennis"
        },
        {
          "cardIndex": 42,
          "price": 250,
          "max": 1,
          "name": "Redanian Foot Soldier"
        },
        {
          "cardIndex": 43,
          "price": 250,
          "max": 1,
          "name": "Redanian Foot Soldier"
        },
        {
          "cardIndex": 44,
          "price": 250,
          "max": 1,
          "name": "Sheldon Skaggs"
        },
        {
          "cardIndex": 46,
          "price": 400,
          "max": 1,
          "name": "Siegfried of Denesle"
        },
        {
          "cardIndex": 48,
          "price": 400,
          "max": 1,
          "name": "Síle de Tansarville"
        },
        {
          "cardIndex": 52,
          "price": 400,
          "max": 1,
          "name": "Ves"
        },
        {
          "cardIndex": 53,
          "price": 250,
          "max": 1,
          "name": "Yarpen Zigrin"
        },
        {
          "cardIndex": 54,
          "price": 400,
          "max": 1,
          "name": "Trebuchet"
        },
        {
          "cardIndex": 55,
          "price": 400,
          "max": 1,
          "name": "Trebuchet"
        },
        {
          "cardIndex": 215,
          "price": 400,
          "max": 1,
          "name": "Ballista"
        }
      ]
    },
    "shop_novigrad": {
      "id": "shop_novigrad",
      "name": "Empório da Praça do Hierarca",
      "region": "Redânia & Novigrad",
      "greeting": "Ouro fala mais alto em Novigrad! Aqui você encontra heróis neutros, cartas de clima e relíquias especiais de todo o Continente.",
      "decks": [
        "neutral",
        "special",
        "weather"
      ],
      "items": [
        {
          "cardIndex": 0,
          "price": 1400,
          "max": 1,
          "name": "Mysterious Elf"
        },
        {
          "cardIndex": 1,
          "price": 450,
          "max": 3,
          "name": "Decoy"
        },
        {
          "cardIndex": 2,
          "price": 450,
          "max": 3,
          "name": "Biting Frost"
        },
        {
          "cardIndex": 4,
          "price": 450,
          "max": 3,
          "name": "Clear Weather"
        },
        {
          "cardIndex": 5,
          "price": 450,
          "max": 3,
          "name": "Commander's Horn"
        },
        {
          "cardIndex": 7,
          "price": 400,
          "max": 1,
          "name": "Emiel Regis Rohellec Terzieff"
        },
        {
          "cardIndex": 9,
          "price": 450,
          "max": 3,
          "name": "Impenetrable Fog"
        },
        {
          "cardIndex": 10,
          "price": 450,
          "max": 3,
          "name": "Scorch"
        },
        {
          "cardIndex": 11,
          "price": 450,
          "max": 3,
          "name": "Torrential Rain"
        },
        {
          "cardIndex": 13,
          "price": 400,
          "max": 1,
          "name": "Vesemir"
        },
        {
          "cardIndex": 14,
          "price": 400,
          "max": 1,
          "name": "Villentretenmerth"
        },
        {
          "cardIndex": 16,
          "price": 400,
          "max": 1,
          "name": "Zoltan Chivay"
        },
        {
          "cardIndex": 17,
          "price": 400,
          "max": 1,
          "name": "Olgierd von Everec"
        },
        {
          "cardIndex": 18,
          "price": 250,
          "max": 1,
          "name": "Gaunter O'Dimm"
        },
        {
          "cardIndex": 19,
          "price": 250,
          "max": 3,
          "name": "Gaunter O'Dimm - Darkness"
        },
        {
          "cardIndex": 20,
          "price": 250,
          "max": 1,
          "name": "Cow"
        },
        {
          "cardIndex": 202,
          "price": 450,
          "max": 3,
          "name": "Mardroeme"
        },
        {
          "cardIndex": 204,
          "price": 450,
          "max": 3,
          "name": "Skellige Storm"
        }
      ]
    },
    "shop_dol_blathanna": {
      "id": "shop_dol_blathanna",
      "name": "Mercador Élfico de Dol Blathanna",
      "region": "Aedirn & Dol Blathanna",
      "greeting": "Que a sabedoria dos Aen Seidhe guie sua mão. Temos arqueiros élficos, defensores de Mahakam e líderes Scoia'tael.",
      "decks": [
        "scoiatael"
      ],
      "items": [
        {
          "cardIndex": 139,
          "price": 1800,
          "max": 1,
          "name": "Francesca Findabair - Queen of Dol Blathanna"
        },
        {
          "cardIndex": 140,
          "price": 1800,
          "max": 1,
          "name": "Francesca Findabair - the Beautiful"
        },
        {
          "cardIndex": 141,
          "price": 1800,
          "max": 1,
          "name": "Francesca Findabair - Daisy of the Valley"
        },
        {
          "cardIndex": 142,
          "price": 1800,
          "max": 1,
          "name": "Francesca Findabair - Pureblood Elf"
        },
        {
          "cardIndex": 143,
          "price": 1800,
          "max": 1,
          "name": "Francesca Findabair - Hope of the Aen Seidhe"
        },
        {
          "cardIndex": 144,
          "price": 250,
          "max": 1,
          "name": "Ciaran aep Easnillien"
        },
        {
          "cardIndex": 145,
          "price": 400,
          "max": 1,
          "name": "Barclay Els"
        },
        {
          "cardIndex": 146,
          "price": 400,
          "max": 1,
          "name": "Dennis Cranmer"
        },
        {
          "cardIndex": 147,
          "price": 250,
          "max": 1,
          "name": "Dol Blathanna Archer"
        },
        {
          "cardIndex": 148,
          "price": 400,
          "max": 1,
          "name": "Dol Blathanna Scout"
        },
        {
          "cardIndex": 149,
          "price": 400,
          "max": 1,
          "name": "Dol Blathanna Scout"
        },
        {
          "cardIndex": 151,
          "price": 250,
          "max": 1,
          "name": "Dwarven Skirmisher"
        },
        {
          "cardIndex": 152,
          "price": 250,
          "max": 1,
          "name": "Dwarven Skirmisher"
        },
        {
          "cardIndex": 158,
          "price": 400,
          "max": 1,
          "name": "Filavandrel aen Fidhail"
        },
        {
          "cardIndex": 162,
          "price": 400,
          "max": 1,
          "name": "Havekar Smuggler"
        },
        {
          "cardIndex": 163,
          "price": 400,
          "max": 1,
          "name": "Havekar Smuggler"
        },
        {
          "cardIndex": 165,
          "price": 400,
          "max": 1,
          "name": "Ida Emean aep Sivney"
        },
        {
          "cardIndex": 168,
          "price": 400,
          "max": 1,
          "name": "Mahakaman Defender"
        },
        {
          "cardIndex": 169,
          "price": 400,
          "max": 1,
          "name": "Mahakaman Defender"
        },
        {
          "cardIndex": 173,
          "price": 650,
          "max": 1,
          "name": "Milva"
        },
        {
          "cardIndex": 174,
          "price": 250,
          "max": 1,
          "name": "Riordain"
        },
        {
          "cardIndex": 175,
          "price": 1400,
          "max": 1,
          "name": "Saesenthessis"
        },
        {
          "cardIndex": 176,
          "price": 250,
          "max": 1,
          "name": "Toruviel"
        },
        {
          "cardIndex": 177,
          "price": 250,
          "max": 1,
          "name": "Vrihedd Brigade Recruit"
        },
        {
          "cardIndex": 178,
          "price": 400,
          "max": 1,
          "name": "Vrihedd Brigade Veteran"
        },
        {
          "cardIndex": 180,
          "price": 400,
          "max": 1,
          "name": "Yaevinn"
        }
      ]
    },
    "shop_skellige": {
      "id": "shop_skellige",
      "name": "Feirante Marítimo de Kaer Trolde",
      "region": "Skellige",
      "greeting": "Pelo sangue de Freya! Drakkares de guerra, guerreiros dos clãs e ervas de Mardroeme forjados nas ilhas.",
      "decks": [
        "skellige"
      ],
      "items": [
        {
          "cardIndex": 181,
          "price": 250,
          "max": 1,
          "name": "Berserker"
        },
        {
          "cardIndex": 183,
          "price": 400,
          "max": 1,
          "name": "Blueboy Lugos"
        },
        {
          "cardIndex": 185,
          "price": 400,
          "max": 2,
          "name": "Clan Brokva Archer"
        },
        {
          "cardIndex": 186,
          "price": 400,
          "max": 1,
          "name": "Clan Dimun Pirate"
        },
        {
          "cardIndex": 189,
          "price": 250,
          "max": 1,
          "name": "Cerys - Clan Drummond Shield Maiden"
        },
        {
          "cardIndex": 190,
          "price": 250,
          "max": 1,
          "name": "Clan Heymaey Skald"
        },
        {
          "cardIndex": 191,
          "price": 250,
          "max": 1,
          "name": "Clan Tordarroch Armorsmith"
        },
        {
          "cardIndex": 192,
          "price": 400,
          "max": 2,
          "name": "Clan an Craite Warrior"
        },
        {
          "cardIndex": 193,
          "price": 250,
          "max": 1,
          "name": "Donar an Hindar"
        },
        {
          "cardIndex": 198,
          "price": 250,
          "max": 1,
          "name": "Holger Blackhand"
        },
        {
          "cardIndex": 200,
          "price": 250,
          "max": 3,
          "name": "Light Longship"
        },
        {
          "cardIndex": 203,
          "price": 650,
          "max": 1,
          "name": "Olaf"
        },
        {
          "cardIndex": 205,
          "price": 250,
          "max": 1,
          "name": "Svanrige"
        },
        {
          "cardIndex": 208,
          "price": 250,
          "max": 1,
          "name": "Udalryk"
        },
        {
          "cardIndex": 209,
          "price": 400,
          "max": 3,
          "name": "War Longship"
        },
        {
          "cardIndex": 210,
          "price": 250,
          "max": 3,
          "name": "Young Berserker"
        },
        {
          "cardIndex": 211,
          "price": 1800,
          "max": 1,
          "name": "Crach an Craite"
        }
      ]
    },
    "shop_toussaint": {
      "id": "shop_toussaint",
      "name": "Boutique Ducal de Beauclair",
      "region": "Toussaint",
      "greeting": "Ah, cavalheiro! Em Beauclair reunimos espécimes raros de criaturas, vampiros e líderes da Caçada Selvagem.",
      "decks": [
        "monsters"
      ],
      "items": [
        {
          "cardIndex": 93,
          "price": 1800,
          "max": 1,
          "name": "Eredin - Commander of the Red Riders"
        },
        {
          "cardIndex": 95,
          "price": 1800,
          "max": 1,
          "name": "Eredin - Destroyer of Worlds"
        },
        {
          "cardIndex": 96,
          "price": 1800,
          "max": 1,
          "name": "Eredin - King of the Wild Hunt"
        },
        {
          "cardIndex": 98,
          "price": 250,
          "max": 1,
          "name": "Arachas "
        },
        {
          "cardIndex": 99,
          "price": 250,
          "max": 1,
          "name": "Arachas "
        },
        {
          "cardIndex": 100,
          "price": 250,
          "max": 1,
          "name": "Arachas "
        },
        {
          "cardIndex": 101,
          "price": 400,
          "max": 1,
          "name": "Arachas- Behemoth"
        },
        {
          "cardIndex": 102,
          "price": 250,
          "max": 1,
          "name": "Botchling"
        },
        {
          "cardIndex": 103,
          "price": 250,
          "max": 1,
          "name": "Celaeno Harpy"
        },
        {
          "cardIndex": 104,
          "price": 250,
          "max": 1,
          "name": "Cockatrice"
        },
        {
          "cardIndex": 106,
          "price": 400,
          "max": 1,
          "name": "Crone - Weavess"
        },
        {
          "cardIndex": 107,
          "price": 400,
          "max": 1,
          "name": "Crone - Whispess"
        },
        {
          "cardIndex": 109,
          "price": 400,
          "max": 1,
          "name": "Earth Elemental"
        },
        {
          "cardIndex": 110,
          "price": 250,
          "max": 1,
          "name": "Endrega"
        },
        {
          "cardIndex": 111,
          "price": 400,
          "max": 1,
          "name": "Fiend"
        },
        {
          "cardIndex": 112,
          "price": 400,
          "max": 1,
          "name": "Fire Elemental"
        },
        {
          "cardIndex": 113,
          "price": 250,
          "max": 1,
          "name": "Foglet"
        },
        {
          "cardIndex": 114,
          "price": 400,
          "max": 1,
          "name": "Forktail"
        },
        {
          "cardIndex": 115,
          "price": 400,
          "max": 1,
          "name": "Frightener"
        },
        {
          "cardIndex": 116,
          "price": 250,
          "max": 1,
          "name": "Gargoyle"
        },
        {
          "cardIndex": 117,
          "price": 250,
          "max": 1,
          "name": "Ghoul"
        },
        {
          "cardIndex": 118,
          "price": 250,
          "max": 1,
          "name": "Ghoul"
        },
        {
          "cardIndex": 119,
          "price": 250,
          "max": 1,
          "name": "Ghoul"
        },
        {
          "cardIndex": 120,
          "price": 400,
          "max": 1,
          "name": "Grave Hag"
        },
        {
          "cardIndex": 121,
          "price": 400,
          "max": 1,
          "name": "Griffin"
        },
        {
          "cardIndex": 122,
          "price": 250,
          "max": 1,
          "name": "Harpy"
        },
        {
          "cardIndex": 123,
          "price": 400,
          "max": 1,
          "name": "Ice Giant"
        },
        {
          "cardIndex": 127,
          "price": 250,
          "max": 1,
          "name": "Nekker"
        },
        {
          "cardIndex": 128,
          "price": 250,
          "max": 1,
          "name": "Nekker"
        },
        {
          "cardIndex": 129,
          "price": 250,
          "max": 1,
          "name": "Nekker"
        },
        {
          "cardIndex": 130,
          "price": 400,
          "max": 1,
          "name": "Plague Maiden"
        },
        {
          "cardIndex": 136,
          "price": 400,
          "max": 1,
          "name": "Werewolf"
        },
        {
          "cardIndex": 137,
          "price": 250,
          "max": 1,
          "name": "Wyvern"
        },
        {
          "cardIndex": 138,
          "price": 400,
          "max": 1,
          "name": "Toad"
        }
      ]
    },
    "shop_nilfgaard": {
      "id": "shop_nilfgaard",
      "name": "Mercado Imperial das Torres Douradas",
      "region": "Império de Nilfgaard",
      "greeting": "Pela glória do Grande Sol! Todo o poderio tático, brigadas e líderes do Império de Nilfgaard estão à sua disposição.",
      "decks": [
        "nilfgaard"
      ],
      "items": [
        {
          "cardIndex": 56,
          "price": 1800,
          "max": 1,
          "name": "Emhyr var Emreis - His Imperial Majesty"
        },
        {
          "cardIndex": 57,
          "price": 1800,
          "max": 1,
          "name": "Emhyr var Emreis - Emperor of Nilfgaard"
        },
        {
          "cardIndex": 58,
          "price": 1800,
          "max": 1,
          "name": "Emhyr var Emreis - the White Flame"
        },
        {
          "cardIndex": 60,
          "price": 1800,
          "max": 1,
          "name": "Emhyr var Emreis - Invader of the North"
        },
        {
          "cardIndex": 61,
          "price": 250,
          "max": 1,
          "name": "Albrich"
        },
        {
          "cardIndex": 62,
          "price": 400,
          "max": 1,
          "name": "Assire var Anahid"
        },
        {
          "cardIndex": 65,
          "price": 400,
          "max": 1,
          "name": "Cahir Mawr Dyffryn aep Ceallach"
        },
        {
          "cardIndex": 66,
          "price": 250,
          "max": 1,
          "name": "Cynthia"
        },
        {
          "cardIndex": 67,
          "price": 250,
          "max": 1,
          "name": "Etolian Auxiliary Archers"
        },
        {
          "cardIndex": 69,
          "price": 400,
          "max": 1,
          "name": "Fringilla Vigo"
        },
        {
          "cardIndex": 71,
          "price": 250,
          "max": 2,
          "name": "Impera Brigade Guard"
        },
        {
          "cardIndex": 74,
          "price": 250,
          "max": 1,
          "name": "Morteisen"
        },
        {
          "cardIndex": 76,
          "price": 250,
          "max": 2,
          "name": "Nausicaa Cavalry Rider"
        },
        {
          "cardIndex": 77,
          "price": 250,
          "max": 1,
          "name": "Puttkammer"
        },
        {
          "cardIndex": 78,
          "price": 250,
          "max": 1,
          "name": "Rainfarn"
        },
        {
          "cardIndex": 80,
          "price": 250,
          "max": 1,
          "name": "Rotten Mangonel"
        },
        {
          "cardIndex": 81,
          "price": 950,
          "max": 1,
          "name": "Shilard Fitz-Oesterlen"
        },
        {
          "cardIndex": 85,
          "price": 250,
          "max": 1,
          "name": "Sweers"
        },
        {
          "cardIndex": 87,
          "price": 250,
          "max": 1,
          "name": "Vanhemar"
        },
        {
          "cardIndex": 89,
          "price": 250,
          "max": 1,
          "name": "Vreemde"
        },
        {
          "cardIndex": 91,
          "price": 400,
          "max": 1,
          "name": "Young Emissary"
        },
        {
          "cardIndex": 92,
          "price": 400,
          "max": 1,
          "name": "Zerrikanian Fire Scorpion"
        }
      ]
    }
  },
  "NODES": {
    "nr_white_orchard": {
      "id": "nr_white_orchard",
      "isWagerable": true,
      "wagerMin": 50,
      "wagerMax": 300,
      "region": "Teméria",
      "name": "Estalagem de Pomar Branco",
      "lore": "Ponto de partida nos Reinos do Norte. O estudioso Aldert Geert desafia viajantes na estalagem local com táticas clássicas da infantaria temeriana.",
      "type": "battle",
      "x": 1655,
      "y": 1185,
      "opponent": {
        "name": "Estudioso Aldert Geert",
        "avatar": "img/sm/realms_poor_infantry.jpg",
        "faction": "realms",
        "leader": 22,
        "deck": {
          "faction": "realms",
          "leader": 22,
          "cards": [
            {
              "index": 40,
              "count": 2
            },
            {
              "index": 42,
              "count": 1
            },
            {
              "index": 43,
              "count": 1
            },
            {
              "index": 34,
              "count": 1
            },
            {
              "index": 35,
              "count": 1
            },
            {
              "index": 36,
              "count": 1
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 27,
              "count": 1
            },
            {
              "index": 54,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 46,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 220,
      "crownsReplay": 50,
      "crownsLoss": 40,
      "cardDrop": {
        "index": 28,
        "count": 1,
        "name": "Blue Stripes Commando"
      },
      "connections": [
        "nr_murky_waters",
        "nr_vizima_palace",
        "nr_maribor_fort",
        "tourney_2_pomar_branco"
      ]
    },
    "tourney_2_pomar_branco": {
      "id": "tourney_2_pomar_branco",
      "region": "Teméria",
      "name": "Torneio da Guarnição de Pomar Branco",
      "lore": "Um torneio rápido de 2 batalhas seguidas organizado pelos veteranos locais. Vença os dois oponentes sem perder para ganhar a carta de prêmio!",
      "type": "tournament",
      "isRegional": false,
      "x": 1735,
      "y": 1170,
      "entryFee": 150,
      "roundWinCrownsFirst": 250,
      "roundWinCrownsRepeat": 35,
      "grandPrizeCrowns": 600,
      "grandPrizeCards": [
        {
          "index": 28,
          "count": 1,
          "name": "Blue Stripes Commando"
        }
      ],
      "rounds": [
        {
          "opponentName": "Ferreiro Willis",
          "faction": "realms",
          "leader": 22,
          "deck": {
            "faction": "realms",
            "leader": 22,
            "cards": [
              {
                "index": 40,
                "count": 2
              },
              {
                "index": 42,
                "count": 1
              },
              {
                "index": 43,
                "count": 1
              },
              {
                "index": 34,
                "count": 1
              },
              {
                "index": 35,
                "count": 1
              },
              {
                "index": 36,
                "count": 1
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 27,
                "count": 1
              },
              {
                "index": 54,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 46,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Capitão Peter Saar Gwynleve",
          "faction": "nilfgaard",
          "leader": 57,
          "deck": {
            "faction": "nilfgaard",
            "leader": 57,
            "cards": [
              {
                "index": 71,
                "count": 2
              },
              {
                "index": 76,
                "count": 2
              },
              {
                "index": 61,
                "count": 1
              },
              {
                "index": 85,
                "count": 1
              },
              {
                "index": 74,
                "count": 1
              },
              {
                "index": 77,
                "count": 1
              },
              {
                "index": 80,
                "count": 1
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 65,
                "count": 1
              },
              {
                "index": 67,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 89,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "nr_white_orchard"
      ]
    },
    "nr_murky_waters": {
      "id": "nr_murky_waters",
      "region": "Teméria",
      "name": "Aldeia de Águas Turvas",
      "lore": "Às margens do lago de Vízima, pescadores e mercenários apostam coroas contra batedores Scoia'tael infiltrados.",
      "type": "battle",
      "x": 1505,
      "y": 1205,
      "opponent": {
        "name": "Chefe Tobias Hoffman",
        "avatar": "img/sm/scoiatael_vrihedd_brigade.jpg",
        "faction": "scoiatael",
        "leader": 141,
        "deck": {
          "faction": "scoiatael",
          "leader": 141,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 177,
              "count": 1
            },
            {
              "index": 175,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 148,
              "count": 1
            },
            {
              "index": 149,
              "count": 1
            },
            {
              "index": 147,
              "count": 1
            },
            {
              "index": 145,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 144,
              "count": 1
            },
            {
              "index": 158,
              "count": 1
            },
            {
              "index": 165,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 176,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 11,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 240,
      "crownsReplay": 55,
      "crownsLoss": 45,
      "cardDrop": {
        "index": 30,
        "count": 1,
        "name": "Crinfrid Reavers Dragon Hunter"
      },
      "connections": [
        "nr_white_orchard",
        "nr_vizima_palace",
        "vel_crows_perch",
        "vel_gors_velen"
      ]
    },
    "nr_vizima_palace": {
      "id": "nr_vizima_palace",
      "region": "Teméria",
      "name": "Palácio Real de Vízima",
      "lore": "Na antiga corte do Rei Foltest, o camareiro imperial e os nobres temerianos duelam com precisão militar.",
      "type": "battle",
      "x": 1585,
      "y": 1125,
      "opponent": {
        "name": "Camareiro Emreis de Vízima",
        "avatar": "img/sm/nilfgaard_albrich.jpg",
        "faction": "nilfgaard",
        "leader": 57,
        "deck": {
          "faction": "nilfgaard",
          "leader": 57,
          "cards": [
            {
              "index": 71,
              "count": 2
            },
            {
              "index": 76,
              "count": 2
            },
            {
              "index": 61,
              "count": 1
            },
            {
              "index": 85,
              "count": 1
            },
            {
              "index": 74,
              "count": 1
            },
            {
              "index": 77,
              "count": 1
            },
            {
              "index": 80,
              "count": 1
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 65,
              "count": 1
            },
            {
              "index": 67,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 89,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 280,
      "crownsReplay": 65,
      "crownsLoss": 55,
      "cardDrop": {
        "index": 32,
        "count": 1,
        "name": "Dun Banner Medic"
      },
      "connections": [
        "nr_white_orchard",
        "nr_murky_waters",
        "nr_la_valette",
        "shop_temeria",
        "regional_tourney_temeria"
      ]
    },
    "shop_temeria": {
      "id": "shop_temeria",
      "region": "Teméria",
      "name": "Empório Real de Vízima",
      "lore": "Fornecedor oficial de cartas de cerco, infantaria temeriana e reforços táticos dos Reinos do Norte.",
      "type": "shop",
      "x": 1515,
      "y": 1090,
      "connections": [
        "nr_vizima_palace",
        "red_oxenfurt"
      ]
    },
    "regional_tourney_temeria": {
      "id": "regional_tourney_temeria",
      "region": "Teméria",
      "name": "Torneio Regional de Teméria",
      "lore": "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O grande campeonato real de Vízima! Derrote 7 mestres consecutivamente sem perder para conquistar 10.000 Coroas, o Líder Foltest Mestre do Cerco e a Insígnia Real de Teméria!",
      "type": "tournament",
      "isRegional": true,
      "x": 1645,
      "y": 1085,
      "entryFee": 1000,
      "roundWinCrownsFirst": 500,
      "roundWinCrownsRepeat": 60,
      "grandPrizeCrowns": 10000,
      "grandPrizeCards": [
        {
          "index": 24,
          "count": 1,
          "name": "Foltest - The Siegemaster (Líder)"
        }
      ],
      "trophyId": "insignia_temeria",
      "rounds": [
        {
          "opponentName": "Sargento de Maribor",
          "faction": "realms",
          "leader": 22,
          "deck": {
            "faction": "realms",
            "leader": 22,
            "cards": [
              {
                "index": 40,
                "count": 2
              },
              {
                "index": 42,
                "count": 1
              },
              {
                "index": 43,
                "count": 1
              },
              {
                "index": 34,
                "count": 1
              },
              {
                "index": 35,
                "count": 1
              },
              {
                "index": 36,
                "count": 1
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 27,
                "count": 1
              },
              {
                "index": 54,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 46,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Adivinho de Benkelham",
          "faction": "monsters",
          "leader": 93,
          "deck": {
            "faction": "monsters",
            "leader": 93,
            "cards": [
              {
                "index": 117,
                "count": 1
              },
              {
                "index": 118,
                "count": 1
              },
              {
                "index": 127,
                "count": 1
              },
              {
                "index": 128,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 122,
                "count": 1
              },
              {
                "index": 113,
                "count": 1
              },
              {
                "index": 137,
                "count": 1
              },
              {
                "index": 114,
                "count": 1
              },
              {
                "index": 121,
                "count": 1
              },
              {
                "index": 136,
                "count": 1
              },
              {
                "index": 102,
                "count": 1
              },
              {
                "index": 103,
                "count": 1
              },
              {
                "index": 104,
                "count": 1
              },
              {
                "index": 110,
                "count": 1
              },
              {
                "index": 116,
                "count": 1
              },
              {
                "index": 123,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mercador de Gors Velen",
          "faction": "scoiatael",
          "leader": 141,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Barão Sanguinário (Phillip Strenger)",
          "faction": "realms",
          "leader": 24,
          "deck": {
            "faction": "realms",
            "leader": 24,
            "cards": [
              {
                "index": 28,
                "count": 2
              },
              {
                "index": 30,
                "count": 2
              },
              {
                "index": 29,
                "count": 1
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 27,
                "count": 2
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 34,
                "count": 2
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Embaixador var Attre",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Comandante Vernon Roche",
          "faction": "realms",
          "leader": 23,
          "deck": {
            "faction": "realms",
            "leader": 23,
            "cards": [
              {
                "index": 51,
                "count": 1
              },
              {
                "index": 37,
                "count": 1
              },
              {
                "index": 39,
                "count": 1
              },
              {
                "index": 33,
                "count": 1
              },
              {
                "index": 28,
                "count": 3
              },
              {
                "index": 30,
                "count": 3
              },
              {
                "index": 29,
                "count": 2
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 45,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 31,
                "count": 1
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Grão-Coudel John Natalis",
          "faction": "realms",
          "leader": 24,
          "deck": {
            "faction": "realms",
            "leader": 23,
            "cards": [
              {
                "index": 51,
                "count": 1
              },
              {
                "index": 37,
                "count": 1
              },
              {
                "index": 39,
                "count": 1
              },
              {
                "index": 33,
                "count": 1
              },
              {
                "index": 28,
                "count": 3
              },
              {
                "index": 30,
                "count": 3
              },
              {
                "index": 29,
                "count": 2
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 45,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 31,
                "count": 1
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "nr_vizima_palace"
      ]
    },
    "nr_maribor_fort": {
      "id": "nr_maribor_fort",
      "region": "Teméria",
      "name": "Fortaleza de Maribor",
      "lore": "Bastião militar do sul da Teméria. Ves e os Listras Azuis treinam cercos pesados entre uma rodada de Gwent e outra.",
      "type": "battle",
      "x": 1715,
      "y": 1345,
      "opponent": {
        "name": "Tenente Ves (Listras Azuis)",
        "avatar": "img/sm/realms_ves.jpg",
        "faction": "realms",
        "leader": 22,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 270,
      "crownsReplay": 60,
      "crownsLoss": 50,
      "cardDrop": {
        "index": 29,
        "count": 1,
        "name": "Catapult"
      },
      "connections": [
        "nr_white_orchard",
        "sod_sodden_hill",
        "aed_mahakam"
      ]
    },
    "nr_la_valette": {
      "id": "nr_la_valette",
      "isWagerable": true,
      "wagerMin": 100,
      "wagerMax": 1000,
      "region": "Teméria",
      "name": "Castelo La Valette",
      "lore": "Às margens do rio Pontar, o estrategista Aryan La Valette aposta suas melhores máquinas de cerco.",
      "type": "battle",
      "x": 1585,
      "y": 990,
      "opponent": {
        "name": "Barão Aryan La Valette",
        "avatar": "img/sm/realms_siege_tower.jpg",
        "faction": "realms",
        "leader": 24,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 280,
      "crownsReplay": 65,
      "crownsLoss": 55,
      "cardDrop": {
        "index": 47,
        "count": 1,
        "name": "Siege Tower"
      },
      "connections": [
        "nr_vizima_palace",
        "nr_ellander",
        "red_tretogor",
        "red_oxenfurt"
      ]
    },
    "nr_ellander": {
      "id": "nr_ellander",
      "region": "Teméria",
      "name": "Templo de Melitele em Ellander",
      "lore": "Sob a proteção da Madre Nenneke, viajantes do leste e do oeste se encontram em paz para duelos de sabedoria.",
      "type": "battle",
      "x": 1815,
      "y": 965,
      "opponent": {
        "name": "Madre Nenneke",
        "avatar": "img/sm/realms_banner_nurse.jpg",
        "faction": "scoiatael",
        "leader": 141,
        "deck": {
          "faction": "scoiatael",
          "leader": 140,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 179,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 300,
      "crownsReplay": 70,
      "crownsLoss": 60,
      "cardDrop": {
        "index": 27,
        "count": 1,
        "name": "Ballista"
      },
      "connections": [
        "nr_la_valette",
        "aed_flotsam",
        "aed_mahakam"
      ]
    },
    "vel_crows_perch": {
      "id": "vel_crows_perch",
      "isWagerable": true,
      "wagerMin": 100,
      "wagerMax": 800,
      "region": "Velen",
      "name": "Poleiro do Corvo (Velen)",
      "lore": "No coração devastado de Velen, o autoproclamado Barão Sanguinário é famoso por jamais recusar uma aposta alta no Gwent.",
      "type": "battle",
      "x": 1160,
      "y": 1125,
      "opponent": {
        "name": "Barão Sanguinário",
        "avatar": "img/sm/realms_dijkstra.jpg",
        "faction": "realms",
        "leader": 24,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 300,
      "crownsReplay": 70,
      "crownsLoss": 60,
      "cardDrop": {
        "index": 45,
        "count": 1,
        "name": "Sigismund Dijkstra (Spy 4)"
      },
      "connections": [
        "nr_murky_waters",
        "vel_gors_velen",
        "red_oxenfurt",
        "tourney_2_velen"
      ]
    },
    "tourney_2_velen": {
      "id": "tourney_2_velen",
      "region": "Velen",
      "name": "Torneio dos Senhores de Velen",
      "lore": "Torneio local de 2 batalhas seguidas nas terras pantanosas de Velen. Vença os dois adversários seguidamente para ganhar 1 carta!",
      "type": "tournament",
      "isRegional": false,
      "x": 1265,
      "y": 1140,
      "entryFee": 200,
      "roundWinCrownsFirst": 280,
      "roundWinCrownsRepeat": 40,
      "grandPrizeCrowns": 750,
      "grandPrizeCards": [
        {
          "index": 30,
          "count": 1,
          "name": "Crinfrid Reavers Dragon Hunter"
        }
      ],
      "rounds": [
        {
          "opponentName": "Construtor de Barcos de Minério",
          "faction": "monsters",
          "leader": 93,
          "deck": {
            "faction": "monsters",
            "leader": 93,
            "cards": [
              {
                "index": 117,
                "count": 1
              },
              {
                "index": 118,
                "count": 1
              },
              {
                "index": 127,
                "count": 1
              },
              {
                "index": 128,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 122,
                "count": 1
              },
              {
                "index": 113,
                "count": 1
              },
              {
                "index": 137,
                "count": 1
              },
              {
                "index": 114,
                "count": 1
              },
              {
                "index": 121,
                "count": 1
              },
              {
                "index": 136,
                "count": 1
              },
              {
                "index": 102,
                "count": 1
              },
              {
                "index": 103,
                "count": 1
              },
              {
                "index": 104,
                "count": 1
              },
              {
                "index": 110,
                "count": 1
              },
              {
                "index": 116,
                "count": 1
              },
              {
                "index": 123,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Velho Sábio de Benkelham",
          "faction": "monsters",
          "leader": 95,
          "deck": {
            "faction": "monsters",
            "leader": 95,
            "cards": [
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 127,
                "count": 1
              },
              {
                "index": 128,
                "count": 1
              },
              {
                "index": 129,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 109,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "vel_crows_perch"
      ]
    },
    "vel_gors_velen": {
      "id": "vel_gors_velen",
      "region": "Velen",
      "name": "Gors Velen & Ilha de Thanedd",
      "lore": "Perto da lendária Torre da Gaivota em Thanedd, a feiticeira Keira Metz joga com feitiços devastadores e espiões.",
      "type": "battle",
      "x": 1195,
      "y": 1245,
      "opponent": {
        "name": "Feiticeira Keira Metz",
        "avatar": "img/sm/realms_keira.jpg",
        "faction": "realms",
        "leader": 22,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 320,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 37,
        "count": 1,
        "name": "John Natalis (Hero 10)"
      },
      "connections": [
        "vel_crows_perch",
        "nr_murky_waters",
        "vel_cidaris",
        "aed_brokilon"
      ]
    },
    "vel_cidaris": {
      "id": "vel_cidaris",
      "region": "Cidaris",
      "name": "Porto Real de Cidaris",
      "lore": "Principal porto marítimo que liga os Reinos do Norte às Ilhas de Skellige. Marinheiros e corsários duelam no cais.",
      "type": "battle",
      "x": 985,
      "y": 1295,
      "opponent": {
        "name": "Almirante de Cidaris",
        "avatar": "img/sm/realms_vernon.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 3
            },
            {
              "index": 200,
              "count": 3
            },
            {
              "index": 208,
              "count": 2
            },
            {
              "index": 209,
              "count": 3
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 195,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 194,
              "count": 1
            },
            {
              "index": 201,
              "count": 1
            },
            {
              "index": 182,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 202,
              "count": 2
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 340,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 51,
        "count": 1,
        "name": "Vernon Roche (Hero 10)"
      },
      "connections": [
        "vel_gors_velen",
        "skel_bremervoord"
      ]
    },
    "red_oxenfurt": {
      "id": "red_oxenfurt",
      "region": "Redânia",
      "name": "Academia de Oxenfurt",
      "lore": "Cidade universitária da Redânia. A médica Shani e o espião Thaler costumam jogar na taverna Alquimia.",
      "type": "battle",
      "x": 1225,
      "y": 1065,
      "opponent": {
        "name": "Médica Shani",
        "avatar": "img/sm/realms_thaler.jpg",
        "faction": "realms",
        "leader": 24,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 320,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 50,
        "count": 1,
        "name": "Thaler (Spy 1)"
      },
      "connections": [
        "vel_crows_perch",
        "shop_temeria",
        "nr_la_valette",
        "red_novigrad_docks"
      ]
    },
    "red_novigrad_docks": {
      "id": "red_novigrad_docks",
      "isWagerable": true,
      "wagerMin": 50,
      "wagerMax": 600,
      "region": "Redânia",
      "name": "Porto Livre de Novigrad",
      "lore": "Na maior metrópole do mundo, o bardo Dandelion e Zoltan Chivay comandam mesas de apostas animadas no Camomila e Tomilho.",
      "type": "battle",
      "x": 1135,
      "y": 1055,
      "opponent": {
        "name": "Bardo Dandelion",
        "avatar": "img/sm/neutral_dandelion.jpg",
        "faction": "scoiatael",
        "leader": 141,
        "deck": {
          "faction": "scoiatael",
          "leader": 140,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 179,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 350,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 6,
        "count": 1,
        "name": "Dandelion (Horn 2)"
      },
      "connections": [
        "red_oxenfurt",
        "red_rosemarie",
        "shop_novigrad",
        "regional_tourney_redania"
      ]
    },
    "shop_novigrad": {
      "id": "shop_novigrad",
      "region": "Redânia",
      "name": "Empório da Praça do Hierarca",
      "lore": "As cartas neutras, especiais e relíquias mais cobiçadas de Novigrad e da Redânia.",
      "type": "shop",
      "x": 1075,
      "y": 1010,
      "connections": [
        "red_novigrad_docks"
      ]
    },
    "red_rosemarie": {
      "id": "red_rosemarie",
      "isWagerable": true,
      "wagerMin": 200,
      "wagerMax": 1500,
      "region": "Redânia",
      "name": "Salão de Madame Serenity (Novigrad)",
      "lore": "Nos salões dourados de Novigrad, a astuta estrategista Madame Sasha desafia os melhores jogadores com espionagem implacável.",
      "type": "battle",
      "x": 1185,
      "y": 965,
      "opponent": {
        "name": "Madame Sasha (Cantarella)",
        "avatar": "img/sm/realms_esterad.jpg",
        "faction": "nilfgaard",
        "leader": 59,
        "deck": {
          "faction": "nilfgaard",
          "leader": 58,
          "cards": [
            {
              "index": 71,
              "count": 3
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 70,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 88,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 380,
      "crownsReplay": 85,
      "crownsLoss": 75,
      "cardDrop": {
        "index": 33,
        "count": 1,
        "name": "Esterad Thyssen (Hero 10)"
      },
      "connections": [
        "red_novigrad_docks",
        "red_tretogor",
        "red_blaviken",
        "regional_tourney_redania"
      ]
    },
    "regional_tourney_redania": {
      "id": "regional_tourney_redania",
      "region": "Redânia",
      "name": "Torneio Regional da Redânia (Passiflora)",
      "lore": "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O lendário Grande Torneio de Altas Apostas do Passiflora em Novigrad! Vença 7 mestres seguidamente para conquistar 10.000 Coroas, o Líder Foltest Comandante do Norte e a Insígnia da Águia Redaniana!",
      "type": "tournament",
      "isRegional": true,
      "x": 1130,
      "y": 895,
      "entryFee": 1200,
      "roundWinCrownsFirst": 550,
      "roundWinCrownsRepeat": 70,
      "grandPrizeCrowns": 10000,
      "grandPrizeCards": [
        {
          "index": 23,
          "count": 1,
          "name": "Foltest - Lord Commander of the North (Líder)"
        }
      ],
      "trophyId": "insignia_redania",
      "rounds": [
        {
          "opponentName": "Mercador Halfling Bernard Tulle",
          "faction": "scoiatael",
          "leader": 141,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "escriba Marcus T.K. Hodgson",
          "faction": "realms",
          "leader": 22,
          "deck": {
            "faction": "realms",
            "leader": 24,
            "cards": [
              {
                "index": 28,
                "count": 2
              },
              {
                "index": 30,
                "count": 2
              },
              {
                "index": 29,
                "count": 1
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 27,
                "count": 2
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 34,
                "count": 2
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Alquimista Gremist Visitante",
          "faction": "skellige",
          "leader": 211,
          "deck": {
            "faction": "skellige",
            "leader": 211,
            "cards": [
              {
                "index": 192,
                "count": 3
              },
              {
                "index": 200,
                "count": 3
              },
              {
                "index": 208,
                "count": 2
              },
              {
                "index": 209,
                "count": 3
              },
              {
                "index": 183,
                "count": 1
              },
              {
                "index": 195,
                "count": 1
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 194,
                "count": 1
              },
              {
                "index": 201,
                "count": 1
              },
              {
                "index": 182,
                "count": 1
              },
              {
                "index": 190,
                "count": 1
              },
              {
                "index": 198,
                "count": 1
              },
              {
                "index": 202,
                "count": 2
              },
              {
                "index": 204,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Agente Imperial Cantarella",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Conde Tybalt de Novigrad",
          "faction": "monsters",
          "leader": 95,
          "deck": {
            "faction": "monsters",
            "leader": 94,
            "cards": [
              {
                "index": 108,
                "count": 1
              },
              {
                "index": 124,
                "count": 1
              },
              {
                "index": 125,
                "count": 1
              },
              {
                "index": 126,
                "count": 1
              },
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 115,
                "count": 1
              },
              {
                "index": 8,
                "count": 1
              },
              {
                "index": 3,
                "count": 1
              },
              {
                "index": 5,
                "count": 2
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mestre Espião Sigismund Dijkstra",
          "faction": "realms",
          "leader": 24,
          "deck": {
            "faction": "realms",
            "leader": 23,
            "cards": [
              {
                "index": 51,
                "count": 1
              },
              {
                "index": 37,
                "count": 1
              },
              {
                "index": 39,
                "count": 1
              },
              {
                "index": 33,
                "count": 1
              },
              {
                "index": 28,
                "count": 3
              },
              {
                "index": 30,
                "count": 3
              },
              {
                "index": 29,
                "count": 2
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 45,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 31,
                "count": 1
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Rei Radovid V o Severo",
          "faction": "realms",
          "leader": 23,
          "deck": {
            "faction": "realms",
            "leader": 23,
            "cards": [
              {
                "index": 51,
                "count": 1
              },
              {
                "index": 37,
                "count": 1
              },
              {
                "index": 39,
                "count": 1
              },
              {
                "index": 33,
                "count": 1
              },
              {
                "index": 28,
                "count": 3
              },
              {
                "index": 30,
                "count": 3
              },
              {
                "index": 29,
                "count": 2
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 45,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 31,
                "count": 1
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "red_novigrad_docks",
        "red_rosemarie"
      ]
    },
    "red_tretogor": {
      "id": "red_tretogor",
      "region": "Redânia",
      "name": "Capital Real de Tretogor",
      "lore": "Sede do poder real da Redânia. A feiticeira Philippa Eilhart domina a política e o tabuleiro com inteligência letal.",
      "type": "battle",
      "x": 1485,
      "y": 855,
      "opponent": {
        "name": "Feiticeira Philippa Eilhart",
        "avatar": "img/sm/realms_philippa.jpg",
        "faction": "realms",
        "leader": 23,
        "deck": {
          "faction": "realms",
          "leader": 23,
          "cards": [
            {
              "index": 51,
              "count": 1
            },
            {
              "index": 37,
              "count": 1
            },
            {
              "index": 39,
              "count": 1
            },
            {
              "index": 33,
              "count": 1
            },
            {
              "index": 28,
              "count": 3
            },
            {
              "index": 30,
              "count": 3
            },
            {
              "index": 29,
              "count": 2
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 45,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 31,
              "count": 1
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 400,
      "crownsReplay": 90,
      "crownsLoss": 80,
      "cardDrop": {
        "index": 39,
        "count": 1,
        "name": "Philippa Eilhart (Hero 10)"
      },
      "connections": [
        "nr_la_valette",
        "red_rosemarie",
        "red_drakenborg"
      ]
    },
    "red_blaviken": {
      "id": "red_blaviken",
      "region": "Redânia",
      "name": "Porto de Blaviken & Kovir",
      "lore": "Na cidade costeira onde Geralt ficou conhecido como o Carniceiro de Blaviken, o mago Stregobor guarda cartas raras do norte.",
      "type": "battle",
      "x": 1285,
      "y": 580,
      "opponent": {
        "name": "Mestre Mago Stregobor",
        "avatar": "img/sm/realms_sheldon.jpg",
        "faction": "realms",
        "leader": 24,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 360,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 29,
        "count": 1,
        "name": "Catapult"
      },
      "connections": [
        "red_rosemarie",
        "red_drakenborg"
      ]
    },
    "red_drakenborg": {
      "id": "red_drakenborg",
      "region": "Redânia",
      "name": "Fortaleza de Drakenborg",
      "lore": "Nas sombras das Montanhas Kestrel, a feiticeira Síle de Tansarville testa a mente dos viajantes rumo a Kaedwen.",
      "type": "battle",
      "x": 1700,
      "y": 745,
      "opponent": {
        "name": "Síle de Tansarville",
        "avatar": "img/sm/realms_sile.jpg",
        "faction": "realms",
        "leader": 24,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 380,
      "crownsReplay": 85,
      "crownsLoss": 75,
      "cardDrop": {
        "index": 49,
        "count": 1,
        "name": "Síle de Tansarville"
      },
      "connections": [
        "red_tretogor",
        "red_blaviken",
        "kaed_ard_carraigh",
        "aed_flotsam"
      ]
    },
    "kaed_ard_carraigh": {
      "id": "kaed_ard_carraigh",
      "region": "Kaedwen",
      "name": "Cidadela de Ard Carraigh (Kaedwen)",
      "lore": "Capital do reino montanhoso de Kaedwen. O Rei Henselt orgulha-se das melhores baterias de artilharia de cerco do norte.",
      "type": "battle",
      "x": 2270,
      "y": 445,
      "opponent": {
        "name": "Rei Henselt de Kaedwen",
        "avatar": "img/sm/realms_kaedwen_siege.jpg",
        "faction": "realms",
        "leader": 24,
        "deck": {
          "faction": "realms",
          "leader": 23,
          "cards": [
            {
              "index": 51,
              "count": 1
            },
            {
              "index": 37,
              "count": 1
            },
            {
              "index": 39,
              "count": 1
            },
            {
              "index": 33,
              "count": 1
            },
            {
              "index": 28,
              "count": 3
            },
            {
              "index": 30,
              "count": 3
            },
            {
              "index": 29,
              "count": 2
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 45,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 31,
              "count": 1
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 420,
      "crownsReplay": 95,
      "crownsLoss": 85,
      "cardDrop": {
        "index": 34,
        "count": 1,
        "name": "Kaedweni Siege Expert"
      },
      "connections": [
        "red_drakenborg",
        "kaed_ban_ard",
        "km_fortress"
      ]
    },
    "kaed_ban_ard": {
      "id": "kaed_ban_ard",
      "region": "Kaedwen",
      "name": "Academia de Magos de Ban Ard",
      "lore": "O conselheiro real Mago Dethmold governa os arquivos arcanos de Kaedwen. Derrote-o para conquistar sua carta única!",
      "type": "battle",
      "x": 2530,
      "y": 670,
      "opponent": {
        "name": "Mago Dethmold",
        "avatar": "img/sm/realms_dethmold.jpg",
        "faction": "realms",
        "leader": 23,
        "deck": {
          "faction": "realms",
          "leader": 23,
          "cards": [
            {
              "index": 51,
              "count": 1
            },
            {
              "index": 37,
              "count": 1
            },
            {
              "index": 39,
              "count": 1
            },
            {
              "index": 33,
              "count": 1
            },
            {
              "index": 28,
              "count": 3
            },
            {
              "index": 30,
              "count": 3
            },
            {
              "index": 29,
              "count": 2
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 45,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 31,
              "count": 1
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 450,
      "crownsReplay": 100,
      "crownsLoss": 90,
      "cardDrop": {
        "index": 31,
        "count": 1,
        "name": "Dethmold"
      },
      "connections": [
        "kaed_ard_carraigh",
        "aed_loc_muinne",
        "aed_vergen"
      ]
    },
    "km_fortress": {
      "id": "km_fortress",
      "region": "Kaer Morhen",
      "name": "Fortaleza de Kaer Morhen",
      "lore": "No refúgio ancestral da Escola do Lobo nas Montanhas Azuis, Lambert, Eskel e Vesemir disputam partidas memoráveis de inverno.",
      "type": "battle",
      "x": 2545,
      "y": 285,
      "opponent": {
        "name": "Mestre Bruxo Vesemir",
        "avatar": "img/sm/neutral_vesemir.jpg",
        "faction": "monsters",
        "leader": 94,
        "deck": {
          "faction": "monsters",
          "leader": 94,
          "cards": [
            {
              "index": 108,
              "count": 1
            },
            {
              "index": 124,
              "count": 1
            },
            {
              "index": 125,
              "count": 1
            },
            {
              "index": 126,
              "count": 1
            },
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 115,
              "count": 1
            },
            {
              "index": 8,
              "count": 1
            },
            {
              "index": 3,
              "count": 1
            },
            {
              "index": 5,
              "count": 2
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 500,
      "crownsReplay": 110,
      "crownsLoss": 95,
      "cardDrop": {
        "index": 12,
        "count": 1,
        "name": "Triss Merigold (Hero 7)"
      },
      "connections": [
        "kaed_ard_carraigh",
        "tourney_5_kaer_morhen"
      ]
    },
    "tourney_5_kaer_morhen": {
      "id": "tourney_5_kaer_morhen",
      "region": "Kaer Morhen",
      "name": "Torneio dos Bruxos de Kaer Morhen",
      "lore": "Torneio de Elite de 5 Partidas Seguidas na Fortaleza da Escola do Lobo! Vença os 5 bruxos e feiticeiras em sequência para ganhar 3 cartas lendárias!",
      "type": "tournament",
      "isRegional": false,
      "x": 2420,
      "y": 315,
      "entryFee": 600,
      "roundWinCrownsFirst": 420,
      "roundWinCrownsRepeat": 50,
      "grandPrizeCrowns": 2800,
      "grandPrizeCards": [
        {
          "index": 8,
          "count": 1,
          "name": "Geralt of Rivia (Hero 15)"
        },
        {
          "index": 15,
          "count": 1,
          "name": "Yennefer of Vengerberg (Hero Medic 7)"
        },
        {
          "index": 214,
          "count": 1,
          "name": "Roach (Carpeado)"
        }
      ],
      "rounds": [
        {
          "opponentName": "Bruxo Lambert",
          "faction": "monsters",
          "leader": 93,
          "deck": {
            "faction": "monsters",
            "leader": 95,
            "cards": [
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 127,
                "count": 1
              },
              {
                "index": 128,
                "count": 1
              },
              {
                "index": 129,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 109,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Bruxo Eskel",
          "faction": "scoiatael",
          "leader": 140,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Bruxo Coën de Poviss",
          "faction": "realms",
          "leader": 24,
          "deck": {
            "faction": "realms",
            "leader": 24,
            "cards": [
              {
                "index": 28,
                "count": 2
              },
              {
                "index": 30,
                "count": 2
              },
              {
                "index": 29,
                "count": 1
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 27,
                "count": 2
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 34,
                "count": 2
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Feiticeira Triss Merigold",
          "faction": "realms",
          "leader": 23,
          "deck": {
            "faction": "realms",
            "leader": 23,
            "cards": [
              {
                "index": 51,
                "count": 1
              },
              {
                "index": 37,
                "count": 1
              },
              {
                "index": 39,
                "count": 1
              },
              {
                "index": 33,
                "count": 1
              },
              {
                "index": 28,
                "count": 3
              },
              {
                "index": 30,
                "count": 3
              },
              {
                "index": 29,
                "count": 2
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 45,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 31,
                "count": 1
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mestre Vesemir de Kaer Morhen",
          "faction": "monsters",
          "leader": 94,
          "deck": {
            "faction": "monsters",
            "leader": 94,
            "cards": [
              {
                "index": 108,
                "count": 1
              },
              {
                "index": 124,
                "count": 1
              },
              {
                "index": 125,
                "count": 1
              },
              {
                "index": 126,
                "count": 1
              },
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 115,
                "count": 1
              },
              {
                "index": 8,
                "count": 1
              },
              {
                "index": 3,
                "count": 1
              },
              {
                "index": 5,
                "count": 2
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "km_fortress"
      ]
    },
    "aed_dol_blathanna": {
      "id": "aed_dol_blathanna",
      "region": "Aedirn & Dol Blathanna",
      "name": "Santuário de Dol Blathanna (Vale das Flores)",
      "lore": "Ponto de partida dos Scoia'tael no leste de Aedirn. O líder élfico Filavandrel recebe aliados nas fronteiras floridas do vale.",
      "type": "battle",
      "x": 2555,
      "y": 985,
      "opponent": {
        "name": "Rei Élfico Filavandrel",
        "avatar": "img/sm/scoiatael_filavandrel.jpg",
        "faction": "scoiatael",
        "leader": 141,
        "deck": {
          "faction": "scoiatael",
          "leader": 141,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 177,
              "count": 1
            },
            {
              "index": 175,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 148,
              "count": 1
            },
            {
              "index": 149,
              "count": 1
            },
            {
              "index": 147,
              "count": 1
            },
            {
              "index": 145,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 144,
              "count": 1
            },
            {
              "index": 158,
              "count": 1
            },
            {
              "index": 165,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 176,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 11,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 220,
      "crownsReplay": 50,
      "crownsLoss": 40,
      "cardDrop": {
        "index": 155,
        "count": 1,
        "name": "Elven Skirmisher"
      },
      "connections": [
        "aed_upper_posada",
        "aed_gulet",
        "shop_dol_blathanna",
        "tourney_3_dol_blathanna"
      ]
    },
    "shop_dol_blathanna": {
      "id": "shop_dol_blathanna",
      "region": "Aedirn & Dol Blathanna",
      "name": "Mercador Élfico de Dol Blathanna",
      "lore": "Artesão Aen Seidhe que negocia cartas ágeis, curandeiros Havekar e guerreiros de Mahakam.",
      "type": "shop",
      "x": 2450,
      "y": 965,
      "connections": [
        "aed_dol_blathanna",
        "aed_gulet"
      ]
    },
    "tourney_3_dol_blathanna": {
      "id": "tourney_3_dol_blathanna",
      "region": "Aedirn & Dol Blathanna",
      "name": "Torneio Élfico do Vale das Flores",
      "lore": "Torneio de 3 batalhas seguidas sob as árvores douradas de Dol Blathanna. Vença os 3 desafios consecutivamente para ganhar 2 cartas Scoia'tael!",
      "type": "tournament",
      "isRegional": false,
      "x": 2635,
      "y": 1030,
      "entryFee": 300,
      "roundWinCrownsFirst": 320,
      "roundWinCrownsRepeat": 40,
      "grandPrizeCrowns": 1200,
      "grandPrizeCards": [
        {
          "index": 157,
          "count": 1,
          "name": "Elven Skirmisher"
        },
        {
          "index": 150,
          "count": 1,
          "name": "Dol Blathanna Scout"
        }
      ],
      "rounds": [
        {
          "opponentName": "Batedora Toruviel",
          "faction": "scoiatael",
          "leader": 141,
          "deck": {
            "faction": "scoiatael",
            "leader": 141,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 177,
                "count": 1
              },
              {
                "index": 175,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 148,
                "count": 1
              },
              {
                "index": 149,
                "count": 1
              },
              {
                "index": 147,
                "count": 1
              },
              {
                "index": 145,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 144,
                "count": 1
              },
              {
                "index": 158,
                "count": 1
              },
              {
                "index": 165,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 176,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 11,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Sábia Ida Emean aep Sivney",
          "faction": "scoiatael",
          "leader": 140,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Rainha Francesca Findabair",
          "faction": "scoiatael",
          "leader": 139,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "aed_dol_blathanna"
      ]
    },
    "aed_upper_posada": {
      "id": "aed_upper_posada",
      "region": "Aedirn & Dol Blathanna",
      "name": "Aldeia de Posada Alta",
      "lore": "Nos campos férteis nos limites do Mundo Livre, camponeses e silvanos pregam peças e jogam Gwent nas estalagens.",
      "type": "battle",
      "x": 2545,
      "y": 910,
      "opponent": {
        "name": "Torque o Silvano",
        "avatar": "img/sm/scoiatael_dol_archer.jpg",
        "faction": "monsters",
        "leader": 93,
        "deck": {
          "faction": "monsters",
          "leader": 93,
          "cards": [
            {
              "index": 117,
              "count": 1
            },
            {
              "index": 118,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 122,
              "count": 1
            },
            {
              "index": 113,
              "count": 1
            },
            {
              "index": 137,
              "count": 1
            },
            {
              "index": 114,
              "count": 1
            },
            {
              "index": 121,
              "count": 1
            },
            {
              "index": 136,
              "count": 1
            },
            {
              "index": 102,
              "count": 1
            },
            {
              "index": 103,
              "count": 1
            },
            {
              "index": 104,
              "count": 1
            },
            {
              "index": 110,
              "count": 1
            },
            {
              "index": 116,
              "count": 1
            },
            {
              "index": 123,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 240,
      "crownsReplay": 55,
      "crownsLoss": 45,
      "cardDrop": {
        "index": 156,
        "count": 1,
        "name": "Elven Skirmisher"
      },
      "connections": [
        "aed_dol_blathanna",
        "aed_loc_muinne",
        "aed_vergen"
      ]
    },
    "aed_gulet": {
      "id": "aed_gulet",
      "region": "Aedirn",
      "name": "Encruzilhada de Gulet",
      "lore": "Cidade comercial de Aedirn. O orgulhoso estrategista élfico Yaevinn desafia viajantes com emboscadas ágeis.",
      "type": "battle",
      "x": 2350,
      "y": 1085,
      "opponent": {
        "name": "Comandante Yaevinn",
        "avatar": "img/sm/scoiatael_yaevinn.jpg",
        "faction": "scoiatael",
        "leader": 140,
        "deck": {
          "faction": "scoiatael",
          "leader": 141,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 177,
              "count": 1
            },
            {
              "index": 175,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 148,
              "count": 1
            },
            {
              "index": 149,
              "count": 1
            },
            {
              "index": 147,
              "count": 1
            },
            {
              "index": 145,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 144,
              "count": 1
            },
            {
              "index": 158,
              "count": 1
            },
            {
              "index": 165,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 176,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 11,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 260,
      "crownsReplay": 60,
      "crownsLoss": 50,
      "cardDrop": {
        "index": 179,
        "count": 1,
        "name": "Yaevinn (Agile 6)"
      },
      "connections": [
        "aed_dol_blathanna",
        "shop_dol_blathanna",
        "aed_vengerberg",
        "aed_vergen"
      ]
    },
    "aed_vengerberg": {
      "id": "aed_vengerberg",
      "region": "Aedirn",
      "name": "Capital Real de Vengerberg",
      "lore": "A imponente capital de Aedirn, terra natal de Yennefer. Mercadores e nobres disputam partidas refinadas.",
      "type": "battle",
      "x": 2300,
      "y": 1185,
      "opponent": {
        "name": "Senescal de Vengerberg",
        "avatar": "img/sm/scoiatael_havekar_nurse.jpg",
        "faction": "realms",
        "leader": 22,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 280,
      "crownsReplay": 65,
      "crownsLoss": 55,
      "cardDrop": {
        "index": 160,
        "count": 1,
        "name": "Havekar Healer (Medic)"
      },
      "connections": [
        "aed_gulet",
        "aed_mahakam",
        "aed_rivia"
      ]
    },
    "aed_vergen": {
      "id": "aed_vergen",
      "region": "Alto Aedirn (Lormark)",
      "name": "Cidadela de Vergen",
      "lore": "Cercada por cânions rochosos, Vergen é defendida por Saskia, a Virgem de Aedirn, que inspira anões, elfos e humanos.",
      "type": "battle",
      "x": 2120,
      "y": 880,
      "opponent": {
        "name": "Saskia (A Caçadora de Dragões)",
        "avatar": "img/sm/scoiatael_saesenthessis.jpg",
        "faction": "scoiatael",
        "leader": 140,
        "deck": {
          "faction": "scoiatael",
          "leader": 140,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 179,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 340,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 172,
        "count": 1,
        "name": "Saesenthessis (Hero 10)"
      },
      "connections": [
        "aed_upper_posada",
        "aed_gulet",
        "aed_flotsam",
        "kaed_ban_ard"
      ]
    },
    "aed_flotsam": {
      "id": "aed_flotsam",
      "isWagerable": true,
      "wagerMin": 100,
      "wagerMax": 800,
      "region": "Vale do Pontar",
      "name": "Entreposto Comercial de Flotsam",
      "lore": "Nas densas florestas às margens do Pontar, o comandante Scoia'tael Iorveth aguarda adversários dignos.",
      "type": "battle",
      "x": 1895,
      "y": 895,
      "opponent": {
        "name": "Comandante Iorveth",
        "avatar": "img/sm/scoiatael_iorveth.jpg",
        "faction": "scoiatael",
        "leader": 139,
        "deck": {
          "faction": "scoiatael",
          "leader": 140,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 179,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 350,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 166,
        "count": 1,
        "name": "Iorveth (Hero 10)"
      },
      "connections": [
        "aed_vergen",
        "nr_ellander",
        "red_drakenborg"
      ]
    },
    "aed_loc_muinne": {
      "id": "aed_loc_muinne",
      "region": "Montanhas Azuis",
      "name": "Anfiteatro Élfico de Loc Muinne",
      "lore": "Nas ruínas élficas milenares das montanhas, o lendário Marechal de Ferro Isengrim Faoiltiarna joga com precisão cirúrgica.",
      "type": "battle",
      "x": 2600,
      "y": 735,
      "opponent": {
        "name": "Isengrim Faoiltiarna",
        "avatar": "img/sm/scoiatael_isengrim.jpg",
        "faction": "scoiatael",
        "leader": 139,
        "deck": {
          "faction": "scoiatael",
          "leader": 139,
          "cards": [
            {
              "index": 154,
              "count": 1
            },
            {
              "index": 166,
              "count": 1
            },
            {
              "index": 167,
              "count": 1
            },
            {
              "index": 172,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 213,
              "count": 1
            },
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 161,
              "count": 1
            },
            {
              "index": 0,
              "count": 1
            },
            {
              "index": 14,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 420,
      "crownsReplay": 95,
      "crownsLoss": 85,
      "cardDrop": {
        "index": 167,
        "count": 1,
        "name": "Isengrim Faoiltiarna (Hero Morale 10)"
      },
      "connections": [
        "aed_upper_posada",
        "kaed_ban_ard",
        "tourney_5_loc_muinne"
      ]
    },
    "tourney_5_loc_muinne": {
      "id": "tourney_5_loc_muinne",
      "region": "Montanhas Azuis",
      "name": "Torneio da Cúpula de Loc Muinne",
      "lore": "Torneio de Elite de 5 Partidas Seguidas durante o Conclave de Loc Muinne! Vença os 5 mestres consecutivamente para ganhar 3 cartas raras Scoia'tael!",
      "type": "tournament",
      "isRegional": false,
      "x": 2665,
      "y": 795,
      "entryFee": 600,
      "roundWinCrownsFirst": 420,
      "roundWinCrownsRepeat": 50,
      "grandPrizeCrowns": 2800,
      "grandPrizeCards": [
        {
          "index": 213,
          "count": 1,
          "name": "Schirrú (Scorch Siege 8)"
        },
        {
          "index": 159,
          "count": 1,
          "name": "Havekar Healer (Medic)"
        },
        {
          "index": 164,
          "count": 1,
          "name": "Havekar Smuggler"
        }
      ],
      "rounds": [
        {
          "opponentName": "Guardião de Loc Muinne",
          "faction": "scoiatael",
          "leader": 141,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mago Cynthia de Nilfgaard",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Capitão Dennis Cranmer",
          "faction": "scoiatael",
          "leader": 140,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Feiticeira Ida Emean",
          "faction": "scoiatael",
          "leader": 139,
          "deck": {
            "faction": "scoiatael",
            "leader": 139,
            "cards": [
              {
                "index": 154,
                "count": 1
              },
              {
                "index": 166,
                "count": 1
              },
              {
                "index": 167,
                "count": 1
              },
              {
                "index": 172,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 213,
                "count": 1
              },
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 161,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 14,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "O Operador de Loc Muinne",
          "faction": "monsters",
          "leader": 94,
          "deck": {
            "faction": "monsters",
            "leader": 94,
            "cards": [
              {
                "index": 108,
                "count": 1
              },
              {
                "index": 124,
                "count": 1
              },
              {
                "index": 125,
                "count": 1
              },
              {
                "index": 126,
                "count": 1
              },
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 115,
                "count": 1
              },
              {
                "index": 8,
                "count": 1
              },
              {
                "index": 3,
                "count": 1
              },
              {
                "index": 5,
                "count": 2
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "aed_loc_muinne"
      ]
    },
    "aed_mahakam": {
      "id": "aed_mahakam",
      "isWagerable": true,
      "wagerMin": 150,
      "wagerMax": 1200,
      "region": "Mahakam",
      "name": "Forjas Subterrâneas do Monte Carbon",
      "lore": "Reduto inexpugnável dos anões de Mahakam. Yarpen Zigrin e Brouver Hoog apostam ouro puro nas tavernas da montanha.",
      "type": "battle",
      "x": 1980,
      "y": 1210,
      "opponent": {
        "name": "Ancião Brouver Hoog",
        "avatar": "img/sm/scoiatael_milva.jpg",
        "faction": "scoiatael",
        "leader": 140,
        "deck": {
          "faction": "scoiatael",
          "leader": 140,
          "cards": [
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 179,
              "count": 1
            },
            {
              "index": 146,
              "count": 1
            },
            {
              "index": 168,
              "count": 1
            },
            {
              "index": 169,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 6,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 320,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 171,
        "count": 1,
        "name": "Milva (Morale 10)"
      },
      "connections": [
        "nr_ellander",
        "nr_maribor_fort",
        "aed_vengerberg",
        "tourney_3_mahakam"
      ]
    },
    "tourney_3_mahakam": {
      "id": "tourney_3_mahakam",
      "region": "Mahakam",
      "name": "Torneio da Grande Forja de Mahakam",
      "lore": "Torneio de 3 batalhas seguidas nos salões de pedra de Mahakam. Vença os 3 mestres anões para conquistar 2 cartas de infantaria anã!",
      "type": "tournament",
      "isRegional": false,
      "x": 2055,
      "y": 1255,
      "entryFee": 320,
      "roundWinCrownsFirst": 330,
      "roundWinCrownsRepeat": 40,
      "grandPrizeCrowns": 1300,
      "grandPrizeCards": [
        {
          "index": 153,
          "count": 1,
          "name": "Dwarven Skirmisher"
        },
        {
          "index": 170,
          "count": 1,
          "name": "Mahakaman Defender"
        }
      ],
      "rounds": [
        {
          "opponentName": "Ferreiro de Mahakam",
          "faction": "scoiatael",
          "leader": 141,
          "deck": {
            "faction": "scoiatael",
            "leader": 141,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 177,
                "count": 1
              },
              {
                "index": 175,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 148,
                "count": 1
              },
              {
                "index": 149,
                "count": 1
              },
              {
                "index": 147,
                "count": 1
              },
              {
                "index": 145,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 144,
                "count": 1
              },
              {
                "index": 158,
                "count": 1
              },
              {
                "index": 165,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 176,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 11,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Veterano Sheldon Skaggs",
          "faction": "realms",
          "leader": 24,
          "deck": {
            "faction": "realms",
            "leader": 24,
            "cards": [
              {
                "index": 28,
                "count": 2
              },
              {
                "index": 30,
                "count": 2
              },
              {
                "index": 29,
                "count": 1
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 27,
                "count": 2
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 34,
                "count": 2
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Capitão Barclay Els",
          "faction": "scoiatael",
          "leader": 140,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "aed_mahakam"
      ]
    },
    "aed_rivia": {
      "id": "aed_rivia",
      "region": "Lyria & Rívia",
      "name": "Castelo Real de Rívia",
      "lore": "Onde Geralt recebeu seu título de cavaleiro da Rainha Meve na Batalha da Ponte do Yaruga.",
      "type": "battle",
      "x": 2220,
      "y": 1385,
      "opponent": {
        "name": "Rainha Meve de Lyria e Rívia",
        "avatar": "img/sm/realms_sabrina.jpg",
        "faction": "realms",
        "leader": 25,
        "deck": {
          "faction": "realms",
          "leader": 24,
          "cards": [
            {
              "index": 28,
              "count": 2
            },
            {
              "index": 30,
              "count": 2
            },
            {
              "index": 29,
              "count": 1
            },
            {
              "index": 32,
              "count": 1
            },
            {
              "index": 41,
              "count": 1
            },
            {
              "index": 50,
              "count": 1
            },
            {
              "index": 27,
              "count": 2
            },
            {
              "index": 47,
              "count": 1
            },
            {
              "index": 34,
              "count": 2
            },
            {
              "index": 44,
              "count": 1
            },
            {
              "index": 53,
              "count": 1
            },
            {
              "index": 38,
              "count": 1
            },
            {
              "index": 48,
              "count": 1
            },
            {
              "index": 52,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 330,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 161,
        "count": 1,
        "name": "Havekar Healer (Medic)"
      },
      "connections": [
        "aed_vengerberg",
        "ang_caed_dhu"
      ]
    },
    "aed_brokilon": {
      "id": "aed_brokilon",
      "region": "Floresta de Brokilon",
      "name": "Águas Sagradas de Duén Canell",
      "lore": "No coração místico da floresta primordial de Brokilon, a Rainha das Dríades Eithné desafia a sabedoria dos forasteiros.",
      "type": "battle",
      "x": 1340,
      "y": 1560,
      "opponent": {
        "name": "Rainha Eithné de Brokilon",
        "avatar": "img/sm/scoiatael_eithne.jpg",
        "faction": "scoiatael",
        "leader": 139,
        "deck": {
          "faction": "scoiatael",
          "leader": 139,
          "cards": [
            {
              "index": 154,
              "count": 1
            },
            {
              "index": 166,
              "count": 1
            },
            {
              "index": 167,
              "count": 1
            },
            {
              "index": 172,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 213,
              "count": 1
            },
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 161,
              "count": 1
            },
            {
              "index": 0,
              "count": 1
            },
            {
              "index": 14,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 400,
      "crownsReplay": 90,
      "crownsLoss": 80,
      "cardDrop": {
        "index": 154,
        "count": 1,
        "name": "Eithné (Hero 10)"
      },
      "connections": [
        "vel_gors_velen",
        "sod_sodden_hill",
        "cin_cintra_capital"
      ]
    },
    "skel_kaer_trolde_port": {
      "id": "skel_kaer_trolde_port",
      "isWagerable": true,
      "wagerMin": 100,
      "wagerMax": 1000,
      "region": "Skellige",
      "name": "Porto de Kaer Trolde (Ard Skellig)",
      "lore": "Ponto de partida nas Ilhas de Skellige. Ao pé da grande fortaleza do Clã an Craite, guerreiros e navegadores testam sua coragem no Gwent.",
      "type": "battle",
      "x": 630,
      "y": 1595,
      "opponent": {
        "name": "Jarl Crach an Craite",
        "avatar": "img/sm/skellige_crach_an_craite.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 2
            },
            {
              "index": 185,
              "count": 2
            },
            {
              "index": 186,
              "count": 1
            },
            {
              "index": 200,
              "count": 2
            },
            {
              "index": 209,
              "count": 2
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 193,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 191,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 205,
              "count": 1
            },
            {
              "index": 208,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 202,
              "count": 1
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 220,
      "crownsReplay": 50,
      "crownsLoss": 40,
      "cardDrop": {
        "index": 192,
        "count": 1,
        "name": "Clan an Craite Warrior"
      },
      "connections": [
        "skel_gedyneith",
        "skel_spikeroog",
        "skel_an_skellig",
        "skel_hindarsfjall",
        "shop_skellige",
        "regional_tourney_skellige"
      ]
    },
    "shop_skellige": {
      "id": "shop_skellige",
      "region": "Skellige",
      "name": "Feirante Marítimo de Kaer Trolde",
      "lore": "Mercador das ilhas com estoque de drakkares, guerreiros dos clãs, Mardroeme e tempestades de Skellige.",
      "type": "shop",
      "x": 575,
      "y": 1565,
      "connections": [
        "skel_kaer_trolde_port",
        "skel_spikeroog"
      ]
    },
    "skel_gedyneith": {
      "id": "skel_gedyneith",
      "region": "Skellige",
      "name": "Bosque Sagrado de Gedyneith",
      "lore": "Debaixo do carvalho sagrado de Ard Skellig, o arquidruida Ermion domina as transformações de Berserkers com Mardroeme.",
      "type": "battle",
      "x": 645,
      "y": 1650,
      "opponent": {
        "name": "Arquidruida Ermion",
        "avatar": "img/sm/skellige_ermion.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 2
            },
            {
              "index": 185,
              "count": 2
            },
            {
              "index": 186,
              "count": 1
            },
            {
              "index": 200,
              "count": 2
            },
            {
              "index": 209,
              "count": 2
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 193,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 191,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 205,
              "count": 1
            },
            {
              "index": 208,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 202,
              "count": 1
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 250,
      "crownsReplay": 55,
      "crownsLoss": 45,
      "cardDrop": {
        "index": 195,
        "count": 1,
        "name": "Ermion (Hero Mardroeme 8)"
      },
      "connections": [
        "skel_kaer_trolde_port",
        "skel_fyresdal",
        "skel_faroe"
      ]
    },
    "skel_fyresdal": {
      "id": "skel_fyresdal",
      "region": "Skellige",
      "name": "Fortaleza de Kaer Muire",
      "lore": "No extremo sul rochoso de Ard Skellig, o explosivo Madman Lugos joga no ataque total com o Clã Drummond.",
      "type": "battle",
      "x": 575,
      "y": 1710,
      "opponent": {
        "name": "Madman Lugos",
        "avatar": "img/sm/skellige_madmad_lugos.jpg",
        "faction": "skellige",
        "leader": 212,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 3
            },
            {
              "index": 200,
              "count": 3
            },
            {
              "index": 208,
              "count": 2
            },
            {
              "index": 209,
              "count": 3
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 195,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 194,
              "count": 1
            },
            {
              "index": 201,
              "count": 1
            },
            {
              "index": 182,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 202,
              "count": 2
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 280,
      "crownsReplay": 65,
      "crownsLoss": 55,
      "cardDrop": {
        "index": 201,
        "count": 1,
        "name": "Madman Lugos"
      },
      "connections": [
        "skel_gedyneith",
        "skel_undvik",
        "skel_faroe"
      ]
    },
    "skel_hindarsfjall": {
      "id": "skel_hindarsfjall",
      "region": "Skellige",
      "name": "Jardim de Freya (Hindarsfjall)",
      "lore": "Na ilha sagrada da deusa Freya, o venerável Jarl Donar an Hindar mantém as tradições mais antigas do arquipélago.",
      "type": "battle",
      "x": 735,
      "y": 1620,
      "opponent": {
        "name": "Jarl Donar an Hindar",
        "avatar": "img/sm/skellige_donar.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 2
            },
            {
              "index": 185,
              "count": 2
            },
            {
              "index": 186,
              "count": 1
            },
            {
              "index": 200,
              "count": 2
            },
            {
              "index": 209,
              "count": 2
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 193,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 191,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 205,
              "count": 1
            },
            {
              "index": 208,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 202,
              "count": 1
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 250,
      "crownsReplay": 55,
      "crownsLoss": 45,
      "cardDrop": {
        "index": 194,
        "count": 1,
        "name": "Donar an Hindar"
      },
      "connections": [
        "skel_kaer_trolde_port",
        "skel_an_skellig",
        "skel_faroe"
      ]
    },
    "skel_an_skellig": {
      "id": "skel_an_skellig",
      "region": "Skellige",
      "name": "Porto de Urialla (An Skellig)",
      "lore": "Ilha dos construtores navais do Clã Tuirseach. Seus navios de guerra dominam a fileira de cerco.",
      "type": "battle",
      "x": 725,
      "y": 1495,
      "opponent": {
        "name": "Capitão de Urialla",
        "avatar": "img/sm/skellige_light_longship.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 3
            },
            {
              "index": 200,
              "count": 3
            },
            {
              "index": 208,
              "count": 2
            },
            {
              "index": 209,
              "count": 3
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 195,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 194,
              "count": 1
            },
            {
              "index": 201,
              "count": 1
            },
            {
              "index": 182,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 202,
              "count": 2
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 280,
      "crownsReplay": 65,
      "crownsLoss": 55,
      "cardDrop": {
        "index": 187,
        "count": 1,
        "name": "Clan Drummond Shieldmaiden"
      },
      "connections": [
        "skel_kaer_trolde_port",
        "skel_hindarsfjall",
        "skel_bremervoord"
      ]
    },
    "skel_spikeroog": {
      "id": "skel_spikeroog",
      "isWagerable": true,
      "wagerMin": 100,
      "wagerMax": 800,
      "region": "Skellige",
      "name": "Povoado de Svorlag (Spikeroog)",
      "lore": "Na ilha ocidental de Spikeroog, a destemida Cerys an Craite lidera suas escudeiras em batalhas implacáveis.",
      "type": "battle",
      "x": 535,
      "y": 1510,
      "opponent": {
        "name": "Cerys an Craite",
        "avatar": "img/sm/skellige_cerys.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 3
            },
            {
              "index": 200,
              "count": 3
            },
            {
              "index": 208,
              "count": 2
            },
            {
              "index": 209,
              "count": 3
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 195,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 194,
              "count": 1
            },
            {
              "index": 201,
              "count": 1
            },
            {
              "index": 182,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 202,
              "count": 2
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 320,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 184,
        "count": 1,
        "name": "Cerys (Hero Muster 10)"
      },
      "connections": [
        "skel_kaer_trolde_port",
        "shop_skellige",
        "tourney_2_spikeroog"
      ]
    },
    "tourney_2_spikeroog": {
      "id": "tourney_2_spikeroog",
      "region": "Skellige",
      "name": "Torneio dos Navegadores de Spikeroog",
      "lore": "Torneio rápido de 2 batalhas seguidas nas tavernas de Svorlag. Vença os 2 desafios para ganhar uma Escudeira Drummond!",
      "type": "tournament",
      "isRegional": false,
      "x": 485,
      "y": 1465,
      "entryFee": 180,
      "roundWinCrownsFirst": 260,
      "roundWinCrownsRepeat": 35,
      "grandPrizeCrowns": 700,
      "grandPrizeCards": [
        {
          "index": 188,
          "count": 1,
          "name": "Clan Drummond Shieldmaiden"
        }
      ],
      "rounds": [
        {
          "opponentName": "Escudeira de Svorlag",
          "faction": "skellige",
          "leader": 211,
          "deck": {
            "faction": "skellige",
            "leader": 211,
            "cards": [
              {
                "index": 192,
                "count": 2
              },
              {
                "index": 185,
                "count": 2
              },
              {
                "index": 186,
                "count": 1
              },
              {
                "index": 200,
                "count": 2
              },
              {
                "index": 209,
                "count": 2
              },
              {
                "index": 183,
                "count": 1
              },
              {
                "index": 193,
                "count": 1
              },
              {
                "index": 190,
                "count": 1
              },
              {
                "index": 191,
                "count": 1
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 205,
                "count": 1
              },
              {
                "index": 208,
                "count": 1
              },
              {
                "index": 198,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 202,
                "count": 1
              },
              {
                "index": 204,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mestre Druida Gremist",
          "faction": "skellige",
          "leader": 212,
          "deck": {
            "faction": "skellige",
            "leader": 211,
            "cards": [
              {
                "index": 192,
                "count": 3
              },
              {
                "index": 200,
                "count": 3
              },
              {
                "index": 208,
                "count": 2
              },
              {
                "index": 209,
                "count": 3
              },
              {
                "index": 183,
                "count": 1
              },
              {
                "index": 195,
                "count": 1
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 194,
                "count": 1
              },
              {
                "index": 201,
                "count": 1
              },
              {
                "index": 182,
                "count": 1
              },
              {
                "index": 190,
                "count": 1
              },
              {
                "index": 198,
                "count": 1
              },
              {
                "index": 202,
                "count": 2
              },
              {
                "index": 204,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "skel_spikeroog"
      ]
    },
    "skel_faroe": {
      "id": "skel_faroe",
      "region": "Skellige",
      "name": "Enseada de Harviken (Faroe)",
      "lore": "Reduto dos corsários do Clã Dimun no sul do arquipélago. Blueboy Lugos aposta tesouros saqueados nos mares.",
      "type": "battle",
      "x": 680,
      "y": 1715,
      "opponent": {
        "name": "Blueboy Lugos",
        "avatar": "img/sm/skellige_blueboy.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 3
            },
            {
              "index": 200,
              "count": 3
            },
            {
              "index": 208,
              "count": 2
            },
            {
              "index": 209,
              "count": 3
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 195,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 194,
              "count": 1
            },
            {
              "index": 201,
              "count": 1
            },
            {
              "index": 182,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 202,
              "count": 2
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 300,
      "crownsReplay": 70,
      "crownsLoss": 60,
      "cardDrop": {
        "index": 182,
        "count": 1,
        "name": "Blueboy Lugos"
      },
      "connections": [
        "skel_gedyneith",
        "skel_fyresdal",
        "skel_hindarsfjall"
      ]
    },
    "skel_undvik": {
      "id": "skel_undvik",
      "region": "Skellige",
      "name": "Forja Gelada de Undvik",
      "lore": "Nas ruínas tomadas pelo gelo em Undvik, Hjalmar an Craite desafia o próprio frio e os gigantes em busca de glória eterna.",
      "type": "battle",
      "x": 505,
      "y": 1765,
      "opponent": {
        "name": "Hjalmar an Craite",
        "avatar": "img/sm/skellige_hjalmar.jpg",
        "faction": "skellige",
        "leader": 212,
        "deck": {
          "faction": "skellige",
          "leader": 212,
          "cards": [
            {
              "index": 184,
              "count": 1
            },
            {
              "index": 187,
              "count": 1
            },
            {
              "index": 188,
              "count": 1
            },
            {
              "index": 189,
              "count": 1
            },
            {
              "index": 195,
              "count": 1
            },
            {
              "index": 197,
              "count": 1
            },
            {
              "index": 203,
              "count": 1
            },
            {
              "index": 199,
              "count": 1
            },
            {
              "index": 192,
              "count": 3
            },
            {
              "index": 200,
              "count": 3
            },
            {
              "index": 208,
              "count": 3
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 194,
              "count": 1
            },
            {
              "index": 214,
              "count": 1
            },
            {
              "index": 0,
              "count": 1
            },
            {
              "index": 202,
              "count": 2
            },
            {
              "index": 1,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 380,
      "crownsReplay": 85,
      "crownsLoss": 75,
      "cardDrop": {
        "index": 197,
        "count": 1,
        "name": "Hjalmar (Hero 10)"
      },
      "connections": [
        "skel_fyresdal"
      ]
    },
    "skel_bremervoord": {
      "id": "skel_bremervoord",
      "region": "Costa do Mar do Norte",
      "name": "Península de Bremervoord",
      "lore": "Entre o continente e as Ilhas de Skellige, navegadores e bardos contam a lenda do galo dourado Kambi e de Hemdall.",
      "type": "battle",
      "x": 875,
      "y": 1385,
      "opponent": {
        "name": "Capitão Mercante de Bremervoord",
        "avatar": "img/sm/skellige_kambi.jpg",
        "faction": "skellige",
        "leader": 211,
        "deck": {
          "faction": "skellige",
          "leader": 211,
          "cards": [
            {
              "index": 192,
              "count": 3
            },
            {
              "index": 200,
              "count": 3
            },
            {
              "index": 208,
              "count": 2
            },
            {
              "index": 209,
              "count": 3
            },
            {
              "index": 183,
              "count": 1
            },
            {
              "index": 195,
              "count": 1
            },
            {
              "index": 181,
              "count": 1
            },
            {
              "index": 194,
              "count": 1
            },
            {
              "index": 201,
              "count": 1
            },
            {
              "index": 182,
              "count": 1
            },
            {
              "index": 190,
              "count": 1
            },
            {
              "index": 198,
              "count": 1
            },
            {
              "index": 202,
              "count": 2
            },
            {
              "index": 204,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 330,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 199,
        "count": 1,
        "name": "Kambi (Invoca Hemdall)"
      },
      "connections": [
        "skel_an_skellig",
        "vel_cidaris"
      ]
    },
    "regional_tourney_skellige": {
      "id": "regional_tourney_skellige",
      "region": "Skellige",
      "name": "Torneio Regional de Skellige",
      "lore": "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O grande banquete dos Jarls em Kaer Trolde! Derrote os 7 maiores campeões das ilhas em sequência para ganhar 10.000 Coroas, o Líder Rei Bran e a Insígnia dos Clãs de Skellige!",
      "type": "tournament",
      "isRegional": true,
      "x": 655,
      "y": 1545,
      "entryFee": 1200,
      "roundWinCrownsFirst": 550,
      "roundWinCrownsRepeat": 70,
      "grandPrizeCrowns": 10000,
      "grandPrizeCards": [
        {
          "index": 212,
          "count": 1,
          "name": "King Bran (Líder)"
        }
      ],
      "trophyId": "insignia_skellige",
      "rounds": [
        {
          "opponentName": "Escaldo Draig Bon-Dhu",
          "faction": "skellige",
          "leader": 211,
          "deck": {
            "faction": "skellige",
            "leader": 211,
            "cards": [
              {
                "index": 192,
                "count": 2
              },
              {
                "index": 185,
                "count": 2
              },
              {
                "index": 186,
                "count": 1
              },
              {
                "index": 200,
                "count": 2
              },
              {
                "index": 209,
                "count": 2
              },
              {
                "index": 183,
                "count": 1
              },
              {
                "index": 193,
                "count": 1
              },
              {
                "index": 190,
                "count": 1
              },
              {
                "index": 191,
                "count": 1
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 205,
                "count": 1
              },
              {
                "index": 208,
                "count": 1
              },
              {
                "index": 198,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 202,
                "count": 1
              },
              {
                "index": 204,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Jarl Holger Mão-Negra",
          "faction": "skellige",
          "leader": 211,
          "deck": {
            "faction": "skellige",
            "leader": 211,
            "cards": [
              {
                "index": 192,
                "count": 3
              },
              {
                "index": 200,
                "count": 3
              },
              {
                "index": 208,
                "count": 2
              },
              {
                "index": 209,
                "count": 3
              },
              {
                "index": 183,
                "count": 1
              },
              {
                "index": 195,
                "count": 1
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 194,
                "count": 1
              },
              {
                "index": 201,
                "count": 1
              },
              {
                "index": 182,
                "count": 1
              },
              {
                "index": 190,
                "count": 1
              },
              {
                "index": 198,
                "count": 1
              },
              {
                "index": 202,
                "count": 2
              },
              {
                "index": 204,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Rainha Viúva Birna Bran",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Guerreiro Hjalmar an Craite",
          "faction": "skellige",
          "leader": 211,
          "deck": {
            "faction": "skellige",
            "leader": 211,
            "cards": [
              {
                "index": 192,
                "count": 3
              },
              {
                "index": 200,
                "count": 3
              },
              {
                "index": 208,
                "count": 2
              },
              {
                "index": 209,
                "count": 3
              },
              {
                "index": 183,
                "count": 1
              },
              {
                "index": 195,
                "count": 1
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 194,
                "count": 1
              },
              {
                "index": 201,
                "count": 1
              },
              {
                "index": 182,
                "count": 1
              },
              {
                "index": 190,
                "count": 1
              },
              {
                "index": 198,
                "count": 1
              },
              {
                "index": 202,
                "count": 2
              },
              {
                "index": 204,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Arquidruida Ermion",
          "faction": "skellige",
          "leader": 211,
          "deck": {
            "faction": "skellige",
            "leader": 212,
            "cards": [
              {
                "index": 184,
                "count": 1
              },
              {
                "index": 187,
                "count": 1
              },
              {
                "index": 188,
                "count": 1
              },
              {
                "index": 189,
                "count": 1
              },
              {
                "index": 195,
                "count": 1
              },
              {
                "index": 197,
                "count": 1
              },
              {
                "index": 203,
                "count": 1
              },
              {
                "index": 199,
                "count": 1
              },
              {
                "index": 192,
                "count": 3
              },
              {
                "index": 200,
                "count": 3
              },
              {
                "index": 208,
                "count": 3
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 194,
                "count": 1
              },
              {
                "index": 214,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 202,
                "count": 2
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Rainha Cerys an Craite",
          "faction": "skellige",
          "leader": 212,
          "deck": {
            "faction": "skellige",
            "leader": 212,
            "cards": [
              {
                "index": 184,
                "count": 1
              },
              {
                "index": 187,
                "count": 1
              },
              {
                "index": 188,
                "count": 1
              },
              {
                "index": 189,
                "count": 1
              },
              {
                "index": 195,
                "count": 1
              },
              {
                "index": 197,
                "count": 1
              },
              {
                "index": 203,
                "count": 1
              },
              {
                "index": 199,
                "count": 1
              },
              {
                "index": 192,
                "count": 3
              },
              {
                "index": 200,
                "count": 3
              },
              {
                "index": 208,
                "count": 3
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 194,
                "count": 1
              },
              {
                "index": 214,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 202,
                "count": 2
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Jarl Supremo Crach an Craite",
          "faction": "skellige",
          "leader": 212,
          "deck": {
            "faction": "skellige",
            "leader": 212,
            "cards": [
              {
                "index": 184,
                "count": 1
              },
              {
                "index": 187,
                "count": 1
              },
              {
                "index": 188,
                "count": 1
              },
              {
                "index": 189,
                "count": 1
              },
              {
                "index": 195,
                "count": 1
              },
              {
                "index": 197,
                "count": 1
              },
              {
                "index": 203,
                "count": 1
              },
              {
                "index": 199,
                "count": 1
              },
              {
                "index": 192,
                "count": 3
              },
              {
                "index": 200,
                "count": 3
              },
              {
                "index": 208,
                "count": 3
              },
              {
                "index": 181,
                "count": 1
              },
              {
                "index": 194,
                "count": 1
              },
              {
                "index": 214,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 202,
                "count": 2
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "skel_kaer_trolde_port"
      ]
    },
    "tous_corvo_bianco": {
      "id": "tous_corvo_bianco",
      "isWagerable": true,
      "wagerMin": 100,
      "wagerMax": 800,
      "region": "Toussaint",
      "name": "Vinhedo Corvo Bianco",
      "lore": "Ponto de partida do baralho de Monstros em Toussaint (Blood and Wine). Nas adegas escuras da propriedade, criaturas da noite e vampiros espreitam.",
      "type": "battle",
      "x": 2440,
      "y": 2260,
      "opponent": {
        "name": "Mordomo Barnabas-Basil",
        "avatar": "img/sm/monsters_katakan.jpg",
        "faction": "monsters",
        "leader": 93,
        "deck": {
          "faction": "monsters",
          "leader": 93,
          "cards": [
            {
              "index": 117,
              "count": 1
            },
            {
              "index": 118,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 122,
              "count": 1
            },
            {
              "index": 113,
              "count": 1
            },
            {
              "index": 137,
              "count": 1
            },
            {
              "index": 114,
              "count": 1
            },
            {
              "index": 121,
              "count": 1
            },
            {
              "index": 136,
              "count": 1
            },
            {
              "index": 102,
              "count": 1
            },
            {
              "index": 103,
              "count": 1
            },
            {
              "index": 104,
              "count": 1
            },
            {
              "index": 110,
              "count": 1
            },
            {
              "index": 116,
              "count": 1
            },
            {
              "index": 123,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 220,
      "crownsReplay": 50,
      "crownsLoss": 40,
      "cardDrop": {
        "index": 135,
        "count": 1,
        "name": "Vampire: Katakan"
      },
      "connections": [
        "tous_fox_hollow",
        "tous_beauclair_palace",
        "shop_toussaint"
      ]
    },
    "shop_toussaint": {
      "id": "shop_toussaint",
      "region": "Toussaint",
      "name": "Boutique Ducal de Beauclair",
      "lore": "Colecionador de Beauclair especializado em criaturas raras, vampiros de Toussaint e líderes lendários.",
      "type": "shop",
      "x": 2340,
      "y": 2225,
      "connections": [
        "tous_corvo_bianco",
        "tous_beauclair_palace",
        "tous_fox_hollow"
      ]
    },
    "tous_fox_hollow": {
      "id": "tous_fox_hollow",
      "region": "Toussaint",
      "name": "Estalagem da Raposa (Fox Hollow)",
      "lore": "No cemitério de Mère-Lachaiselongue perto de Fox Hollow, o sábio vampiro superior Emiel Regis aprecia uma partida intelectual.",
      "type": "battle",
      "x": 2215,
      "y": 2145,
      "opponent": {
        "name": "Emiel Regis Rohellec Terzieff",
        "avatar": "img/sm/neutral_regis.jpg",
        "faction": "monsters",
        "leader": 95,
        "deck": {
          "faction": "monsters",
          "leader": 93,
          "cards": [
            {
              "index": 117,
              "count": 1
            },
            {
              "index": 118,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 122,
              "count": 1
            },
            {
              "index": 113,
              "count": 1
            },
            {
              "index": 137,
              "count": 1
            },
            {
              "index": 114,
              "count": 1
            },
            {
              "index": 121,
              "count": 1
            },
            {
              "index": 136,
              "count": 1
            },
            {
              "index": 102,
              "count": 1
            },
            {
              "index": 103,
              "count": 1
            },
            {
              "index": 104,
              "count": 1
            },
            {
              "index": 110,
              "count": 1
            },
            {
              "index": 116,
              "count": 1
            },
            {
              "index": 123,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 250,
      "crownsReplay": 55,
      "crownsLoss": 45,
      "cardDrop": {
        "index": 131,
        "count": 1,
        "name": "Vampire: Bruxa"
      },
      "connections": [
        "tous_corvo_bianco",
        "shop_toussaint",
        "tous_dun_tynne",
        "tous_belhaven",
        "nilf_assengard"
      ]
    },
    "tous_dun_tynne": {
      "id": "tous_dun_tynne",
      "region": "Toussaint",
      "name": "Castelo de Dun Tynne",
      "lore": "Nas ruínas tomadas pela tempestade em Dun Tynne, a Fera de Beauclair, Dettlaff van der Eretein, comanda hordas de vampiros.",
      "type": "battle",
      "x": 2315,
      "y": 2095,
      "opponent": {
        "name": "Dettlaff van der Eretein",
        "avatar": "img/sm/monsters_ekimmara.jpg",
        "faction": "monsters",
        "leader": 94,
        "deck": {
          "faction": "monsters",
          "leader": 95,
          "cards": [
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 129,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 109,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 290,
      "crownsReplay": 65,
      "crownsLoss": 55,
      "cardDrop": {
        "index": 132,
        "count": 1,
        "name": "Vampire: Ekimmara"
      },
      "connections": [
        "tous_fox_hollow",
        "tous_beauclair_palace",
        "tous_belhaven"
      ]
    },
    "tous_beauclair_palace": {
      "id": "tous_beauclair_palace",
      "isWagerable": true,
      "wagerMin": 250,
      "wagerMax": 2000,
      "region": "Toussaint",
      "name": "Palácio Ducal de Beauclair",
      "lore": "Nos salões perfumados de Beauclair, a enigmática Orianna esconde segredos imortais por trás de um sorriso encantador.",
      "type": "battle",
      "x": 2385,
      "y": 2175,
      "opponent": {
        "name": "Senhora Orianna de Beauclair",
        "avatar": "img/sm/monsters_fleder.jpg",
        "faction": "monsters",
        "leader": 95,
        "deck": {
          "faction": "monsters",
          "leader": 95,
          "cards": [
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 129,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 109,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 310,
      "crownsReplay": 70,
      "crownsLoss": 60,
      "cardDrop": {
        "index": 133,
        "count": 1,
        "name": "Vampire: Fleder"
      },
      "connections": [
        "tous_corvo_bianco",
        "shop_toussaint",
        "tous_dun_tynne",
        "regional_tourney_toussaint"
      ]
    },
    "tous_belhaven": {
      "id": "tous_belhaven",
      "region": "Toussaint",
      "name": "Caverna do Ancião Oculto (Belhaven)",
      "lore": "Nas profundezas subterrâneas junto ao rio Sansretour, o Ancião Oculto guarda o portal entre os mundos.",
      "type": "battle",
      "x": 2115,
      "y": 1995,
      "opponent": {
        "name": "O Ancião Oculto (Unseen Elder)",
        "avatar": "img/sm/monsters_garkain.jpg",
        "faction": "monsters",
        "leader": 94,
        "deck": {
          "faction": "monsters",
          "leader": 95,
          "cards": [
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 129,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 109,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 340,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 134,
        "count": 1,
        "name": "Vampire: Garkain"
      },
      "connections": [
        "tous_fox_hollow",
        "tous_dun_tynne",
        "tous_mount_gorgon",
        "nilf_assengard"
      ]
    },
    "tous_mount_gorgon": {
      "id": "tous_mount_gorgon",
      "region": "Toussaint",
      "name": "Encostas do Monte Gorgon",
      "lore": "Sob os picos nevados do Monte Gorgon, espíritos antigos da floresta como o Leshen desafiam qualquer caçador.",
      "type": "battle",
      "x": 2165,
      "y": 1875,
      "opponent": {
        "name": "Guardião do Monte Gorgon",
        "avatar": "img/sm/monsters_leshen.jpg",
        "faction": "monsters",
        "leader": 95,
        "deck": {
          "faction": "monsters",
          "leader": 95,
          "cards": [
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 129,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 109,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 360,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 126,
        "count": 1,
        "name": "Leshen (Hero 10)"
      },
      "connections": [
        "tous_belhaven",
        "ang_caed_dhu"
      ]
    },
    "regional_tourney_toussaint": {
      "id": "regional_tourney_toussaint",
      "region": "Toussaint",
      "name": "Torneio Regional de Toussaint",
      "lore": "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O Magnífico Grande Torneio Ducal de Beauclair apadrinhado por Anna Henrietta! Vença 7 duelos consecutivos para conquistar 10.000 Coroas, o Líder Eredin Portador da Morte e a Insígnia Ducal de Toussaint!",
      "type": "tournament",
      "isRegional": true,
      "x": 2475,
      "y": 2165,
      "entryFee": 1200,
      "roundWinCrownsFirst": 550,
      "roundWinCrownsRepeat": 70,
      "grandPrizeCrowns": 10000,
      "grandPrizeCards": [
        {
          "index": 94,
          "count": 1,
          "name": "Eredin - Bringer of Death (Líder)"
        }
      ],
      "trophyId": "insignia_toussaint",
      "rounds": [
        {
          "opponentName": "Cavaleiro Guillaume de Launfal",
          "faction": "realms",
          "leader": 25,
          "deck": {
            "faction": "realms",
            "leader": 24,
            "cards": [
              {
                "index": 28,
                "count": 2
              },
              {
                "index": 30,
                "count": 2
              },
              {
                "index": 29,
                "count": 1
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 27,
                "count": 2
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 34,
                "count": 2
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Cavaleiro Palmerin de Launfal",
          "faction": "scoiatael",
          "leader": 140,
          "deck": {
            "faction": "scoiatael",
            "leader": 140,
            "cards": [
              {
                "index": 151,
                "count": 1
              },
              {
                "index": 152,
                "count": 1
              },
              {
                "index": 153,
                "count": 1
              },
              {
                "index": 155,
                "count": 1
              },
              {
                "index": 156,
                "count": 1
              },
              {
                "index": 157,
                "count": 1
              },
              {
                "index": 162,
                "count": 1
              },
              {
                "index": 163,
                "count": 1
              },
              {
                "index": 164,
                "count": 1
              },
              {
                "index": 159,
                "count": 1
              },
              {
                "index": 160,
                "count": 1
              },
              {
                "index": 171,
                "count": 1
              },
              {
                "index": 179,
                "count": 1
              },
              {
                "index": 146,
                "count": 1
              },
              {
                "index": 168,
                "count": 1
              },
              {
                "index": 169,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Conde de la Croix",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Capitão Damien de la Tour",
          "faction": "realms",
          "leader": 24,
          "deck": {
            "faction": "realms",
            "leader": 23,
            "cards": [
              {
                "index": 51,
                "count": 1
              },
              {
                "index": 37,
                "count": 1
              },
              {
                "index": 39,
                "count": 1
              },
              {
                "index": 33,
                "count": 1
              },
              {
                "index": 28,
                "count": 3
              },
              {
                "index": 30,
                "count": 3
              },
              {
                "index": 29,
                "count": 2
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 45,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 31,
                "count": 1
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 6,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Princesa Sylvia Anna (Syanna)",
          "faction": "nilfgaard",
          "leader": 59,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Vampiro Superior Dettlaff",
          "faction": "monsters",
          "leader": 95,
          "deck": {
            "faction": "monsters",
            "leader": 94,
            "cards": [
              {
                "index": 108,
                "count": 1
              },
              {
                "index": 124,
                "count": 1
              },
              {
                "index": 125,
                "count": 1
              },
              {
                "index": 126,
                "count": 1
              },
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 115,
                "count": 1
              },
              {
                "index": 8,
                "count": 1
              },
              {
                "index": 3,
                "count": 1
              },
              {
                "index": 5,
                "count": 2
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Grão-Duquesa Anna Henrietta",
          "faction": "nilfgaard",
          "leader": 59,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "tous_beauclair_palace"
      ]
    },
    "ang_caed_dhu": {
      "id": "ang_caed_dhu",
      "region": "Angren",
      "name": "Pântanos de Angren & Ysgith",
      "lore": "Nas matas alagadas de Angren, as três Moiras e os monstros insectoides atacam em enxames incessantes.",
      "type": "battle",
      "x": 2025,
      "y": 1585,
      "opponent": {
        "name": "Tecelã dos Pântanos",
        "avatar": "img/sm/monsters_kayran.jpg",
        "faction": "monsters",
        "leader": 95,
        "deck": {
          "faction": "monsters",
          "leader": 95,
          "cards": [
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 127,
              "count": 1
            },
            {
              "index": 128,
              "count": 1
            },
            {
              "index": 129,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 109,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 360,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 125,
        "count": 1,
        "name": "Kayran (Hero Morale 8)"
      },
      "connections": [
        "tous_mount_gorgon",
        "aed_rivia",
        "sod_sodden_hill"
      ]
    },
    "sod_sodden_hill": {
      "id": "sod_sodden_hill",
      "region": "Sodden",
      "name": "Obelisco do Monte Sodden",
      "lore": "Local da famosa Batalha do Monte Sodden. Os espectros de guerra e o temível Draug assombram o campo.",
      "type": "battle",
      "x": 1740,
      "y": 1615,
      "opponent": {
        "name": "General Espectral Draug",
        "avatar": "img/sm/monsters_draug.jpg",
        "faction": "monsters",
        "leader": 94,
        "deck": {
          "faction": "monsters",
          "leader": 94,
          "cards": [
            {
              "index": 108,
              "count": 1
            },
            {
              "index": 124,
              "count": 1
            },
            {
              "index": 125,
              "count": 1
            },
            {
              "index": 126,
              "count": 1
            },
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 115,
              "count": 1
            },
            {
              "index": 8,
              "count": 1
            },
            {
              "index": 3,
              "count": 1
            },
            {
              "index": 5,
              "count": 2
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 380,
      "crownsReplay": 85,
      "crownsLoss": 75,
      "cardDrop": {
        "index": 108,
        "count": 1,
        "name": "Draug (Hero 10)"
      },
      "connections": [
        "ang_caed_dhu",
        "nr_maribor_fort",
        "aed_brokilon",
        "cin_cintra_capital"
      ]
    },
    "cin_cintra_capital": {
      "id": "cin_cintra_capital",
      "region": "Cintra",
      "name": "Cidadela Real de Cintra",
      "lore": "Antigo trono da Rainha Calanthe e de Ciri. Os generais da Caçada Selvagem buscam o Sangue Ancestral nas ruínas.",
      "type": "battle",
      "x": 1265,
      "y": 1795,
      "opponent": {
        "name": "General Imlerith (Caçada Selvagem)",
        "avatar": "img/sm/monsters_imlerith.jpg",
        "faction": "monsters",
        "leader": 94,
        "deck": {
          "faction": "monsters",
          "leader": 94,
          "cards": [
            {
              "index": 108,
              "count": 1
            },
            {
              "index": 124,
              "count": 1
            },
            {
              "index": 125,
              "count": 1
            },
            {
              "index": 126,
              "count": 1
            },
            {
              "index": 135,
              "count": 1
            },
            {
              "index": 131,
              "count": 1
            },
            {
              "index": 132,
              "count": 1
            },
            {
              "index": 133,
              "count": 1
            },
            {
              "index": 134,
              "count": 1
            },
            {
              "index": 97,
              "count": 1
            },
            {
              "index": 98,
              "count": 1
            },
            {
              "index": 99,
              "count": 1
            },
            {
              "index": 100,
              "count": 1
            },
            {
              "index": 105,
              "count": 1
            },
            {
              "index": 106,
              "count": 1
            },
            {
              "index": 107,
              "count": 1
            },
            {
              "index": 112,
              "count": 1
            },
            {
              "index": 115,
              "count": 1
            },
            {
              "index": 8,
              "count": 1
            },
            {
              "index": 3,
              "count": 1
            },
            {
              "index": 5,
              "count": 2
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 400,
      "crownsReplay": 90,
      "crownsLoss": 80,
      "cardDrop": {
        "index": 124,
        "count": 1,
        "name": "Imlerith (Hero 10)"
      },
      "connections": [
        "aed_brokilon",
        "sod_sodden_hill",
        "nilf_assengard",
        "tourney_3_cintra"
      ]
    },
    "tourney_3_cintra": {
      "id": "tourney_3_cintra",
      "region": "Cintra",
      "name": "Torneio do Leão de Cintra",
      "lore": "Torneio de 3 batalhas seguidas nas costas de Cintra. Vença os 3 comandantes em sequência para conquistar 2 cartas poderosas de Monstros!",
      "type": "tournament",
      "isRegional": false,
      "x": 1410,
      "y": 1815,
      "entryFee": 350,
      "roundWinCrownsFirst": 340,
      "roundWinCrownsRepeat": 45,
      "grandPrizeCrowns": 1400,
      "grandPrizeCards": [
        {
          "index": 97,
          "count": 1,
          "name": "Arachas Behemoth (Muster 6)"
        },
        {
          "index": 105,
          "count": 1,
          "name": "Crone: Brewess (Muster 6)"
        }
      ],
      "rounds": [
        {
          "opponentName": "Castelão de Cintra",
          "faction": "realms",
          "leader": 22,
          "deck": {
            "faction": "realms",
            "leader": 24,
            "cards": [
              {
                "index": 28,
                "count": 2
              },
              {
                "index": 30,
                "count": 2
              },
              {
                "index": 29,
                "count": 1
              },
              {
                "index": 32,
                "count": 1
              },
              {
                "index": 41,
                "count": 1
              },
              {
                "index": 50,
                "count": 1
              },
              {
                "index": 27,
                "count": 2
              },
              {
                "index": 47,
                "count": 1
              },
              {
                "index": 34,
                "count": 2
              },
              {
                "index": 44,
                "count": 1
              },
              {
                "index": 53,
                "count": 1
              },
              {
                "index": 38,
                "count": 1
              },
              {
                "index": 48,
                "count": 1
              },
              {
                "index": 52,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Navegador Caranthir",
          "faction": "monsters",
          "leader": 93,
          "deck": {
            "faction": "monsters",
            "leader": 95,
            "cards": [
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 127,
                "count": 1
              },
              {
                "index": 128,
                "count": 1
              },
              {
                "index": 129,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 109,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Príncipe Sapo (Ofeir)",
          "faction": "monsters",
          "leader": 95,
          "deck": {
            "faction": "monsters",
            "leader": 94,
            "cards": [
              {
                "index": 108,
                "count": 1
              },
              {
                "index": 124,
                "count": 1
              },
              {
                "index": 125,
                "count": 1
              },
              {
                "index": 126,
                "count": 1
              },
              {
                "index": 135,
                "count": 1
              },
              {
                "index": 131,
                "count": 1
              },
              {
                "index": 132,
                "count": 1
              },
              {
                "index": 133,
                "count": 1
              },
              {
                "index": 134,
                "count": 1
              },
              {
                "index": 97,
                "count": 1
              },
              {
                "index": 98,
                "count": 1
              },
              {
                "index": 99,
                "count": 1
              },
              {
                "index": 100,
                "count": 1
              },
              {
                "index": 105,
                "count": 1
              },
              {
                "index": 106,
                "count": 1
              },
              {
                "index": 107,
                "count": 1
              },
              {
                "index": 112,
                "count": 1
              },
              {
                "index": 115,
                "count": 1
              },
              {
                "index": 8,
                "count": 1
              },
              {
                "index": 3,
                "count": 1
              },
              {
                "index": 5,
                "count": 2
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "cin_cintra_capital"
      ]
    },
    "nilf_capital_tavern": {
      "id": "nilf_capital_tavern",
      "isWagerable": true,
      "wagerMin": 150,
      "wagerMax": 1200,
      "region": "Império de Nilfgaard",
      "name": "Praça da Cidade das Torres Douradas",
      "lore": "Ponto de partida do Império de Nilfgaard no extremo sul do continente. O aristocrata General Morvran Voorhis aprecia duelos de alta estratégia.",
      "type": "battle",
      "x": 1685,
      "y": 3740,
      "opponent": {
        "name": "General Morvran Voorhis",
        "avatar": "img/sm/nilfgaard_impera_brigade.jpg",
        "faction": "nilfgaard",
        "leader": 57,
        "deck": {
          "faction": "nilfgaard",
          "leader": 57,
          "cards": [
            {
              "index": 71,
              "count": 2
            },
            {
              "index": 76,
              "count": 2
            },
            {
              "index": 61,
              "count": 1
            },
            {
              "index": 85,
              "count": 1
            },
            {
              "index": 74,
              "count": 1
            },
            {
              "index": 77,
              "count": 1
            },
            {
              "index": 80,
              "count": 1
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 65,
              "count": 1
            },
            {
              "index": 67,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 89,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 220,
      "crownsReplay": 50,
      "crownsLoss": 40,
      "cardDrop": {
        "index": 71,
        "count": 1,
        "name": "Impera Brigade Guard"
      },
      "connections": [
        "nilf_castel_graupian",
        "nilf_tarnhann",
        "nilf_loc_grim",
        "shop_nilfgaard",
        "regional_tourney_nilfgaard"
      ]
    },
    "shop_nilfgaard": {
      "id": "shop_nilfgaard",
      "region": "Império de Nilfgaard",
      "name": "Mercado Imperial das Torres Douradas",
      "lore": "Fornecedor de elite do exército nilfgaardiano: brigadas Impera, espiões imperiais, arqueiros e líderes do Grande Sol.",
      "type": "shop",
      "x": 1610,
      "y": 3695,
      "connections": [
        "nilf_capital_tavern"
      ]
    },
    "nilf_castel_graupian": {
      "id": "nilf_castel_graupian",
      "region": "Império de Nilfgaard",
      "name": "Academia Militar de Castel Graupian",
      "lore": "Nos campos de instrução da cavalaria imperial, o Duque Joachim de Wett comanda cargas da Brigada Nausicaa.",
      "type": "battle",
      "x": 1660,
      "y": 3825,
      "opponent": {
        "name": "Duque Joachim de Wett",
        "avatar": "img/sm/nilfgaard_nausicaa_2.jpg",
        "faction": "nilfgaard",
        "leader": 57,
        "deck": {
          "faction": "nilfgaard",
          "leader": 57,
          "cards": [
            {
              "index": 71,
              "count": 2
            },
            {
              "index": 76,
              "count": 2
            },
            {
              "index": 61,
              "count": 1
            },
            {
              "index": 85,
              "count": 1
            },
            {
              "index": 74,
              "count": 1
            },
            {
              "index": 77,
              "count": 1
            },
            {
              "index": 80,
              "count": 1
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 65,
              "count": 1
            },
            {
              "index": 67,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 89,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 240,
      "crownsReplay": 55,
      "crownsLoss": 45,
      "cardDrop": {
        "index": 76,
        "count": 1,
        "name": "Nausicaa Cavalry Rider"
      },
      "connections": [
        "nilf_capital_tavern",
        "nilf_tarnhann"
      ]
    },
    "nilf_tarnhann": {
      "id": "nilf_tarnhann",
      "region": "Império de Nilfgaard",
      "name": "Palácio Senatorial de Tarnhann",
      "lore": "O experiente diplomata Shilard Fitz-Oesterlen usa sua rede de informantes para dominar a vantagem de cartas.",
      "type": "battle",
      "x": 1775,
      "y": 3785,
      "opponent": {
        "name": "Embaixador Shilard Fitz-Oesterlen",
        "avatar": "img/sm/nilfgaard_shilard.jpg",
        "faction": "nilfgaard",
        "leader": 58,
        "deck": {
          "faction": "nilfgaard",
          "leader": 57,
          "cards": [
            {
              "index": 71,
              "count": 2
            },
            {
              "index": 76,
              "count": 2
            },
            {
              "index": 61,
              "count": 1
            },
            {
              "index": 85,
              "count": 1
            },
            {
              "index": 74,
              "count": 1
            },
            {
              "index": 77,
              "count": 1
            },
            {
              "index": 80,
              "count": 1
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 65,
              "count": 1
            },
            {
              "index": 67,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 89,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 2,
              "count": 1
            },
            {
              "index": 9,
              "count": 1
            },
            {
              "index": 4,
              "count": 1
            },
            {
              "index": 1,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 260,
      "crownsReplay": 60,
      "crownsLoss": 50,
      "cardDrop": {
        "index": 82,
        "count": 1,
        "name": "Shilard Fitz-Oesterlen (Spy 7)"
      },
      "connections": [
        "nilf_capital_tavern",
        "nilf_castel_graupian",
        "nilf_loc_grim"
      ]
    },
    "nilf_loc_grim": {
      "id": "nilf_loc_grim",
      "region": "Império de Nilfgaard",
      "name": "Palácio Imperial de Loc Grim",
      "lore": "Residência de verão do Imperador junto ao Rio Alba. O chefe do serviço secreto Vattier de Rideaux observa cada movimento.",
      "type": "battle",
      "x": 1870,
      "y": 3620,
      "opponent": {
        "name": "Vattier de Rideaux",
        "avatar": "img/sm/nilfgaard_vattier.jpg",
        "faction": "nilfgaard",
        "leader": 58,
        "deck": {
          "faction": "nilfgaard",
          "leader": 58,
          "cards": [
            {
              "index": 71,
              "count": 3
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 70,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 88,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 290,
      "crownsReplay": 65,
      "crownsLoss": 55,
      "cardDrop": {
        "index": 90,
        "count": 1,
        "name": "Vattier de Rideaux (Spy 4)"
      },
      "connections": [
        "nilf_capital_tavern",
        "nilf_tarnhann",
        "nilf_vicovaro",
        "nilf_gemmera"
      ]
    },
    "nilf_vicovaro": {
      "id": "nilf_vicovaro",
      "region": "Vicovaro",
      "name": "Academia Imperial de Vicovaro",
      "lore": "Centro de medicina de campanha e magia imperial. As feiticeiras Fringilla Vigo e Assire var Anahid dominam o conhecimento arcano.",
      "type": "battle",
      "x": 2270,
      "y": 3530,
      "opponent": {
        "name": "Feiticeira Fringilla Vigo",
        "avatar": "img/sm/nilfgaard_fringilla.jpg",
        "faction": "nilfgaard",
        "leader": 58,
        "deck": {
          "faction": "nilfgaard",
          "leader": 58,
          "cards": [
            {
              "index": 71,
              "count": 3
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 70,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 88,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 310,
      "crownsReplay": 70,
      "crownsLoss": 60,
      "cardDrop": {
        "index": 70,
        "count": 1,
        "name": "Fringilla Vigo"
      },
      "connections": [
        "nilf_loc_grim",
        "nilf_darn_dyffra",
        "tourney_3_vicovaro"
      ]
    },
    "tourney_3_vicovaro": {
      "id": "tourney_3_vicovaro",
      "region": "Vicovaro",
      "name": "Torneio da Academia de Vicovaro",
      "lore": "Torneio de 3 batalhas seguidas entre os médicos e arcanistas de Vicovaro. Vença as 3 partidas para conquistar 2 cartas táticas de Nilfgaard!",
      "type": "tournament",
      "isRegional": false,
      "x": 2355,
      "y": 3575,
      "entryFee": 300,
      "roundWinCrownsFirst": 320,
      "roundWinCrownsRepeat": 40,
      "grandPrizeCrowns": 1250,
      "grandPrizeCards": [
        {
          "index": 63,
          "count": 1,
          "name": "Assire var Anahid"
        },
        {
          "index": 83,
          "count": 1,
          "name": "Siege Technician (Medic)"
        }
      ],
      "rounds": [
        {
          "opponentName": "Cirurgião de Vicovaro",
          "faction": "nilfgaard",
          "leader": 57,
          "deck": {
            "faction": "nilfgaard",
            "leader": 57,
            "cards": [
              {
                "index": 71,
                "count": 2
              },
              {
                "index": 76,
                "count": 2
              },
              {
                "index": 61,
                "count": 1
              },
              {
                "index": 85,
                "count": 1
              },
              {
                "index": 74,
                "count": 1
              },
              {
                "index": 77,
                "count": 1
              },
              {
                "index": 80,
                "count": 1
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 65,
                "count": 1
              },
              {
                "index": 67,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 89,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mago Renuald aep Matsen",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mestra Assire var Anahid",
          "faction": "nilfgaard",
          "leader": 59,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "nilf_vicovaro"
      ]
    },
    "nilf_darn_dyffra": {
      "id": "nilf_darn_dyffra",
      "region": "Vicovaro",
      "name": "Fortaleza de Darn Dyffra",
      "lore": "O Marechal de Campo Menno Coehoorn coordena daqui as legiões imperiais que marcham rumo ao norte.",
      "type": "battle",
      "x": 2350,
      "y": 3360,
      "opponent": {
        "name": "Marechal Menno Coehoorn",
        "avatar": "img/sm/nilfgaard_menno.jpg",
        "faction": "nilfgaard",
        "leader": 59,
        "deck": {
          "faction": "nilfgaard",
          "leader": 58,
          "cards": [
            {
              "index": 71,
              "count": 3
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 70,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 88,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 340,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 73,
        "count": 1,
        "name": "Menno Coehoorn (Hero Medic 10)"
      },
      "connections": [
        "nilf_vicovaro",
        "nilf_gemmera",
        "nilf_maecht"
      ]
    },
    "nilf_gemmera": {
      "id": "nilf_gemmera",
      "region": "Gemmera",
      "name": "Guarnição de Gemmera",
      "lore": "Nas terras áridas de Gemmera, o bruxo regicida Letho de Gulet testa sua frieza implacável nas cartas.",
      "type": "battle",
      "x": 1915,
      "y": 3230,
      "opponent": {
        "name": "Letho de Gulet",
        "avatar": "img/sm/nilfgaard_letho.jpg",
        "faction": "nilfgaard",
        "leader": 60,
        "deck": {
          "faction": "nilfgaard",
          "leader": 59,
          "cards": [
            {
              "index": 72,
              "count": 1
            },
            {
              "index": 73,
              "count": 1
            },
            {
              "index": 75,
              "count": 1
            },
            {
              "index": 86,
              "count": 1
            },
            {
              "index": 71,
              "count": 4
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 84,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 63,
              "count": 1
            },
            {
              "index": 0,
              "count": 1
            },
            {
              "index": 15,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 370,
      "crownsReplay": 85,
      "crownsLoss": 75,
      "cardDrop": {
        "index": 72,
        "count": 1,
        "name": "Letho of Gulet (Hero 10)"
      },
      "connections": [
        "nilf_loc_grim",
        "nilf_darn_dyffra",
        "nilf_stygga",
        "nilf_maecht"
      ]
    },
    "nilf_stygga": {
      "id": "nilf_stygga",
      "region": "Ebbing & Salm",
      "name": "Castelo Stygga",
      "lore": "A sinistra cidadela costeira onde o mago renegado Vilgefortz e o agente Stefan Skellen tramam seus planos.",
      "type": "battle",
      "x": 1745,
      "y": 3110,
      "opponent": {
        "name": "Stefan Skellen (Coruja)",
        "avatar": "img/sm/nilfgaard_stefan.jpg",
        "faction": "nilfgaard",
        "leader": 59,
        "deck": {
          "faction": "nilfgaard",
          "leader": 58,
          "cards": [
            {
              "index": 71,
              "count": 3
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 70,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 88,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 360,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 84,
        "count": 1,
        "name": "Stefan Skellen (Spy 9)"
      },
      "connections": [
        "nilf_gemmera",
        "nilf_claremont"
      ]
    },
    "nilf_maecht": {
      "id": "nilf_maecht",
      "region": "Maecht",
      "name": "Cidadela Real de Maecht",
      "lore": "O impetuoso Coronel Tibor Eggebracht lidera a cavalaria pesada de Alba a partir das muralhas de Maecht.",
      "type": "battle",
      "x": 1990,
      "y": 2975,
      "opponent": {
        "name": "Coronel Tibor Eggebracht",
        "avatar": "img/sm/nilfgaard_tibor.jpg",
        "faction": "nilfgaard",
        "leader": 58,
        "deck": {
          "faction": "nilfgaard",
          "leader": 59,
          "cards": [
            {
              "index": 72,
              "count": 1
            },
            {
              "index": 73,
              "count": 1
            },
            {
              "index": 75,
              "count": 1
            },
            {
              "index": 86,
              "count": 1
            },
            {
              "index": 71,
              "count": 4
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 84,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 63,
              "count": 1
            },
            {
              "index": 0,
              "count": 1
            },
            {
              "index": 15,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 380,
      "crownsReplay": 85,
      "crownsLoss": 75,
      "cardDrop": {
        "index": 86,
        "count": 1,
        "name": "Tibor Eggebracht (Hero 10)"
      },
      "connections": [
        "nilf_darn_dyffra",
        "nilf_gemmera",
        "nilf_claremont",
        "tourney_5_maecht"
      ]
    },
    "nilf_claremont": {
      "id": "nilf_claremont",
      "isWagerable": true,
      "wagerMin": 200,
      "wagerMax": 1500,
      "region": "Ebbing",
      "name": "Arena de Claremont (Ebbing)",
      "lore": "Em Claremont, o temido caçador de recompensas Leo Bonhart desafia qualquer um que ouse cruzar seu caminho.",
      "type": "battle",
      "x": 1560,
      "y": 2790,
      "opponent": {
        "name": "Caçador Leo Bonhart",
        "avatar": "img/sm/nilfgaard_moorvran.jpg",
        "faction": "nilfgaard",
        "leader": 60,
        "deck": {
          "faction": "nilfgaard",
          "leader": 59,
          "cards": [
            {
              "index": 72,
              "count": 1
            },
            {
              "index": 73,
              "count": 1
            },
            {
              "index": 75,
              "count": 1
            },
            {
              "index": 86,
              "count": 1
            },
            {
              "index": 71,
              "count": 4
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 84,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 63,
              "count": 1
            },
            {
              "index": 0,
              "count": 1
            },
            {
              "index": 15,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 390,
      "crownsReplay": 85,
      "crownsLoss": 75,
      "cardDrop": {
        "index": 75,
        "count": 1,
        "name": "Morvran Voorhis (Hero 10)"
      },
      "connections": [
        "nilf_stygga",
        "nilf_maecht",
        "nilf_metinna",
        "tourney_5_maecht"
      ]
    },
    "tourney_5_maecht": {
      "id": "tourney_5_maecht",
      "region": "Maecht & Metinna",
      "name": "Torneio dos Generais do Sul",
      "lore": "Torneio de Elite de 5 Partidas Seguidas reunindo os comandantes das províncias imperiais! Vença as 5 batalhas sem perder para ganhar 3 cartas de elite!",
      "type": "tournament",
      "isRegional": false,
      "x": 1855,
      "y": 2740,
      "entryFee": 550,
      "roundWinCrownsFirst": 400,
      "roundWinCrownsRepeat": 50,
      "grandPrizeCrowns": 2600,
      "grandPrizeCards": [
        {
          "index": 71,
          "count": 1,
          "name": "Impera Brigade Guard"
        },
        {
          "index": 68,
          "count": 1,
          "name": "Etolian Auxiliary Archers (Medic)"
        },
        {
          "index": 79,
          "count": 1,
          "name": "Heavy Zerrikanian Fire Scorpion"
        }
      ],
      "rounds": [
        {
          "opponentName": "Capitão Sweers",
          "faction": "nilfgaard",
          "leader": 57,
          "deck": {
            "faction": "nilfgaard",
            "leader": 57,
            "cards": [
              {
                "index": 71,
                "count": 2
              },
              {
                "index": 76,
                "count": 2
              },
              {
                "index": 61,
                "count": 1
              },
              {
                "index": 85,
                "count": 1
              },
              {
                "index": 74,
                "count": 1
              },
              {
                "index": 77,
                "count": 1
              },
              {
                "index": 80,
                "count": 1
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 65,
                "count": 1
              },
              {
                "index": 67,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 89,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Comandante Vreemde",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Cavaleiro Cahir aep Ceallach",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "General Menno Coehoorn",
          "faction": "nilfgaard",
          "leader": 59,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mago Vilgefortz de Roggeveen",
          "faction": "nilfgaard",
          "leader": 60,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "nilf_maecht",
        "nilf_claremont",
        "nilf_metinna"
      ]
    },
    "nilf_metinna": {
      "id": "nilf_metinna",
      "region": "Metinna",
      "name": "Planícies dos Cavalos de Metinna",
      "lore": "Terra dos mais velozes ginetes e arqueiros do império. Os esquadrões de arco longo negro nunca erram o alvo.",
      "type": "battle",
      "x": 1725,
      "y": 2505,
      "opponent": {
        "name": "Mestre Arqueiro de Metinna",
        "avatar": "img/sm/nilfgaard_black_archer.jpg",
        "faction": "nilfgaard",
        "leader": 58,
        "deck": {
          "faction": "nilfgaard",
          "leader": 58,
          "cards": [
            {
              "index": 71,
              "count": 3
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 70,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 88,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 340,
      "crownsReplay": 75,
      "crownsLoss": 65,
      "cardDrop": {
        "index": 64,
        "count": 1,
        "name": "Black Infantry Archer"
      },
      "connections": [
        "nilf_claremont",
        "tourney_5_maecht",
        "nilf_tor_zireael"
      ]
    },
    "nilf_tor_zireael": {
      "id": "nilf_tor_zireael",
      "region": "Nazair",
      "name": "Lago Tarn Mira & Tor Zireael",
      "lore": "Junto ao lendário Lago Sem Fundo onde se ergue a Torre da Andorinha, o sábio élfico Avallac'h guarda cartas de poder ancestral.",
      "type": "battle",
      "x": 1685,
      "y": 2325,
      "opponent": {
        "name": "Sábio Aen Elle Avallac'h",
        "avatar": "img/sm/neutral_mysterious_elf.jpg",
        "faction": "scoiatael",
        "leader": 139,
        "deck": {
          "faction": "scoiatael",
          "leader": 139,
          "cards": [
            {
              "index": 154,
              "count": 1
            },
            {
              "index": 166,
              "count": 1
            },
            {
              "index": 167,
              "count": 1
            },
            {
              "index": 172,
              "count": 1
            },
            {
              "index": 171,
              "count": 1
            },
            {
              "index": 213,
              "count": 1
            },
            {
              "index": 151,
              "count": 1
            },
            {
              "index": 152,
              "count": 1
            },
            {
              "index": 153,
              "count": 1
            },
            {
              "index": 155,
              "count": 1
            },
            {
              "index": 156,
              "count": 1
            },
            {
              "index": 157,
              "count": 1
            },
            {
              "index": 162,
              "count": 1
            },
            {
              "index": 163,
              "count": 1
            },
            {
              "index": 164,
              "count": 1
            },
            {
              "index": 159,
              "count": 1
            },
            {
              "index": 160,
              "count": 1
            },
            {
              "index": 161,
              "count": 1
            },
            {
              "index": 0,
              "count": 1
            },
            {
              "index": 14,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 420,
      "crownsReplay": 95,
      "crownsLoss": 85,
      "cardDrop": {
        "index": 3,
        "count": 1,
        "name": "Cirilla Fiona Elen Riannon (Hero 15)"
      },
      "connections": [
        "nilf_metinna",
        "nilf_assengard"
      ]
    },
    "nilf_assengard": {
      "id": "nilf_assengard",
      "region": "Nazair",
      "name": "Passo Montanhoso de Assengard",
      "lore": "Encruzilhada estratégica ao sul da Cordilheira Amell, conectando o Império de Nilfgaard a Cintra e ao Ducado de Toussaint.",
      "type": "battle",
      "x": 1695,
      "y": 2170,
      "opponent": {
        "name": "Astrólogo Imperial Xarthisius",
        "avatar": "img/sm/nilfgaard_nauzicaa.jpg",
        "faction": "nilfgaard",
        "leader": 58,
        "deck": {
          "faction": "nilfgaard",
          "leader": 58,
          "cards": [
            {
              "index": 71,
              "count": 3
            },
            {
              "index": 76,
              "count": 3
            },
            {
              "index": 91,
              "count": 1
            },
            {
              "index": 92,
              "count": 1
            },
            {
              "index": 68,
              "count": 1
            },
            {
              "index": 69,
              "count": 1
            },
            {
              "index": 83,
              "count": 1
            },
            {
              "index": 90,
              "count": 1
            },
            {
              "index": 82,
              "count": 1
            },
            {
              "index": 70,
              "count": 1
            },
            {
              "index": 64,
              "count": 1
            },
            {
              "index": 88,
              "count": 1
            },
            {
              "index": 87,
              "count": 1
            },
            {
              "index": 16,
              "count": 1
            },
            {
              "index": 13,
              "count": 1
            },
            {
              "index": 1,
              "count": 2
            },
            {
              "index": 5,
              "count": 1
            },
            {
              "index": 10,
              "count": 1
            }
          ]
        }
      },
      "crownsReward": 350,
      "crownsReplay": 80,
      "crownsLoss": 70,
      "cardDrop": {
        "index": 88,
        "count": 1,
        "name": "Black Infantry Archer"
      },
      "connections": [
        "nilf_tor_zireael",
        "cin_cintra_capital",
        "tous_belhaven",
        "tous_fox_hollow"
      ]
    },
    "regional_tourney_nilfgaard": {
      "id": "regional_tourney_nilfgaard",
      "region": "Império de Nilfgaard",
      "name": "Torneio Regional de Nilfgaard",
      "lore": "DESAFIO REGIONAL SUPREMO (7 Partidas Seguidas): O Grande Torneio Imperial da Cidade das Torres Douradas, presidido pelo próprio Imperador Emhyr var Emreis! Vença 7 duelos seguidos para conquistar 10.000 Coroas, o Líder Emhyr O Implacável e a Insígnia do Grande Sol!",
      "type": "tournament",
      "isRegional": true,
      "x": 1755,
      "y": 3685,
      "entryFee": 1200,
      "roundWinCrownsFirst": 550,
      "roundWinCrownsRepeat": 70,
      "grandPrizeCrowns": 10000,
      "grandPrizeCards": [
        {
          "index": 59,
          "count": 1,
          "name": "Emhyr var Emreis - The Relentless (Líder)"
        }
      ],
      "trophyId": "insignia_nilfgaard",
      "rounds": [
        {
          "opponentName": "Duque Joachim de Wett",
          "faction": "nilfgaard",
          "leader": 57,
          "deck": {
            "faction": "nilfgaard",
            "leader": 57,
            "cards": [
              {
                "index": 71,
                "count": 2
              },
              {
                "index": 76,
                "count": 2
              },
              {
                "index": 61,
                "count": 1
              },
              {
                "index": 85,
                "count": 1
              },
              {
                "index": 74,
                "count": 1
              },
              {
                "index": 77,
                "count": 1
              },
              {
                "index": 80,
                "count": 1
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 65,
                "count": 1
              },
              {
                "index": 67,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 89,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 2,
                "count": 1
              },
              {
                "index": 9,
                "count": 1
              },
              {
                "index": 4,
                "count": 1
              },
              {
                "index": 1,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Embaixador Shilard Fitz-Oesterlen",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Mestre de Espiões Vattier de Rideaux",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 58,
            "cards": [
              {
                "index": 71,
                "count": 3
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 70,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 88,
                "count": 1
              },
              {
                "index": 87,
                "count": 1
              },
              {
                "index": 16,
                "count": 1
              },
              {
                "index": 13,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "General Morvran Voorhis",
          "faction": "nilfgaard",
          "leader": 58,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Bruxo Letho de Gulet",
          "faction": "nilfgaard",
          "leader": 60,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Marechal Menno Coehoorn",
          "faction": "nilfgaard",
          "leader": 59,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        },
        {
          "opponentName": "Imperador Emhyr var Emreis",
          "faction": "nilfgaard",
          "leader": 59,
          "deck": {
            "faction": "nilfgaard",
            "leader": 59,
            "cards": [
              {
                "index": 72,
                "count": 1
              },
              {
                "index": 73,
                "count": 1
              },
              {
                "index": 75,
                "count": 1
              },
              {
                "index": 86,
                "count": 1
              },
              {
                "index": 71,
                "count": 4
              },
              {
                "index": 76,
                "count": 3
              },
              {
                "index": 91,
                "count": 1
              },
              {
                "index": 92,
                "count": 1
              },
              {
                "index": 90,
                "count": 1
              },
              {
                "index": 82,
                "count": 1
              },
              {
                "index": 84,
                "count": 1
              },
              {
                "index": 68,
                "count": 1
              },
              {
                "index": 69,
                "count": 1
              },
              {
                "index": 83,
                "count": 1
              },
              {
                "index": 64,
                "count": 1
              },
              {
                "index": 63,
                "count": 1
              },
              {
                "index": 0,
                "count": 1
              },
              {
                "index": 15,
                "count": 1
              },
              {
                "index": 1,
                "count": 2
              },
              {
                "index": 5,
                "count": 1
              },
              {
                "index": 10,
                "count": 1
              }
            ]
          }
        }
      ],
      "connections": [
        "nilf_capital_tavern"
      ]
    }
  },
  "COMPENDIUM_HINTS": {
    "0": {
      "name": "Mysterious Elf",
      "deck": "neutral",
      "str": "0",
      "ability": "hero spy",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "1": {
      "name": "Decoy",
      "deck": "special",
      "str": "",
      "ability": "decoy",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "2": {
      "name": "Biting Frost",
      "deck": "weather",
      "str": "",
      "ability": "frost",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "3": {
      "name": "Cirilla Fiona Elen Riannon",
      "deck": "neutral",
      "str": "15",
      "ability": "hero muster",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Sábio Aen Elle Avallac'h em Lago Tarn Mira & Tor Zireael (Nazair)"
    },
    "4": {
      "name": "Clear Weather",
      "deck": "weather",
      "str": "",
      "ability": "clear",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "5": {
      "name": "Commander's Horn",
      "deck": "special",
      "str": "",
      "ability": "horn",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "6": {
      "name": "Dandelion",
      "deck": "neutral",
      "str": "2",
      "ability": "horn",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Bardo Dandelion em Porto Livre de Novigrad (Redânia)"
    },
    "7": {
      "name": "Emiel Regis Rohellec Terzieff",
      "deck": "neutral",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "8": {
      "name": "Geralt of Rivia",
      "deck": "neutral",
      "str": "15",
      "ability": "hero muster",
      "row": "close",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio dos Bruxos de Kaer Morhen (Kaer Morhen)"
    },
    "9": {
      "name": "Impenetrable Fog",
      "deck": "weather",
      "str": "",
      "ability": "fog",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "10": {
      "name": "Scorch",
      "deck": "special",
      "str": "",
      "ability": "scorch",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "11": {
      "name": "Torrential Rain",
      "deck": "weather",
      "str": "",
      "ability": "rain",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "12": {
      "name": "Triss Merigold",
      "deck": "neutral",
      "str": "7",
      "ability": "hero",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Mestre Bruxo Vesemir em Fortaleza de Kaer Morhen (Kaer Morhen)"
    },
    "13": {
      "name": "Vesemir",
      "deck": "neutral",
      "str": "6",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "14": {
      "name": "Villentretenmerth",
      "deck": "neutral",
      "str": "7",
      "ability": "scorch_c",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "15": {
      "name": "Yennefer of Vengerberg",
      "deck": "neutral",
      "str": "7",
      "ability": "hero medic",
      "row": "ranged",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio dos Bruxos de Kaer Morhen (Kaer Morhen)"
    },
    "16": {
      "name": "Zoltan Chivay",
      "deck": "neutral",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "17": {
      "name": "Olgierd von Everec",
      "deck": "neutral",
      "str": "6",
      "ability": "morale",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "18": {
      "name": "Gaunter O'Dimm",
      "deck": "neutral",
      "str": "2",
      "ability": "muster",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "19": {
      "name": "Gaunter O'Dimm - Darkness",
      "deck": "neutral",
      "str": "4",
      "ability": "muster",
      "row": "ranged",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "20": {
      "name": "Cow",
      "deck": "neutral",
      "str": "0",
      "ability": "avenger",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "21": {
      "name": "Bovine Defense Force",
      "deck": "neutral",
      "str": "8",
      "ability": "",
      "row": "close",
      "maxCount": 0,
      "source": "Invocada automaticamente pela carta Vaca (Cow)."
    },
    "22": {
      "name": "Foltest - King of Temeria",
      "deck": "realms",
      "str": "",
      "ability": "foltest_king",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "23": {
      "name": "Foltest - Lord Commander of the North",
      "deck": "realms",
      "str": "",
      "ability": "foltest_lord",
      "row": "leader",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio Regional da Redânia (Passiflora) (Redânia)"
    },
    "24": {
      "name": "Foltest - The Siegemaster",
      "deck": "realms",
      "str": "",
      "ability": "foltest_siegemaster",
      "row": "leader",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio Regional de Teméria (Teméria)"
    },
    "25": {
      "name": "Foltest - The Steel-Forged",
      "deck": "realms",
      "str": "",
      "ability": "foltest_steelforged",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "26": {
      "name": "Foltest - Son of Medell",
      "deck": "realms",
      "str": "",
      "ability": "foltest_son",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "27": {
      "name": "Ballista",
      "deck": "realms",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Madre Nenneke em Templo de Melitele em Ellander (Teméria)"
    },
    "28": {
      "name": "Blue Stripes Commando",
      "deck": "realms",
      "str": "4",
      "ability": "bond",
      "row": "close",
      "maxCount": 3,
      "source": "Prêmio de Campeão: Torneio da Guarnição de Pomar Branco (Teméria) / Empório Real de Vízima"
    },
    "29": {
      "name": "Catapult",
      "deck": "realms",
      "str": "8",
      "ability": "bond",
      "row": "siege",
      "maxCount": 2,
      "source": "Vença Mestre Mago Stregobor em Porto de Blaviken & Kovir (Redânia)"
    },
    "30": {
      "name": "Crinfrid Reavers Dragon Hunter",
      "deck": "realms",
      "str": "5",
      "ability": "bond",
      "row": "ranged",
      "maxCount": 3,
      "source": "Prêmio de Campeão: Torneio dos Senhores de Velen (Velen) / Empório Real de Vízima"
    },
    "31": {
      "name": "Dethmold",
      "deck": "realms",
      "str": "6",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Mago Dethmold em Academia de Magos de Ban Ard (Kaedwen)"
    },
    "32": {
      "name": "Dun Banner Medic",
      "deck": "realms",
      "str": "5",
      "ability": "medic",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Camareiro Emreis de Vízima em Palácio Real de Vízima (Teméria)"
    },
    "33": {
      "name": "Esterad Thyssen",
      "deck": "realms",
      "str": "10",
      "ability": "hero",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Madame Sasha (Cantarella) em Salão de Madame Serenity (Novigrad) (Redânia)"
    },
    "34": {
      "name": "John Natalis",
      "deck": "realms",
      "str": "10",
      "ability": "hero",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Rei Henselt de Kaedwen em Cidadela de Ard Carraigh (Kaedwen) (Kaedwen)"
    },
    "35": {
      "name": "Kaedweni Siege Expert",
      "deck": "realms",
      "str": "1",
      "ability": "morale",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "36": {
      "name": "Kaedweni Siege Expert",
      "deck": "realms",
      "str": "1",
      "ability": "morale",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "37": {
      "name": "Kaedweni Siege Expert",
      "deck": "realms",
      "str": "1",
      "ability": "morale",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Feiticeira Keira Metz em Gors Velen & Ilha de Thanedd (Velen)"
    },
    "38": {
      "name": "Keira Metz",
      "deck": "realms",
      "str": "5",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "39": {
      "name": "Philippa Eilhart",
      "deck": "realms",
      "str": "10",
      "ability": "hero",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Feiticeira Philippa Eilhart em Capital Real de Tretogor (Redânia)"
    },
    "40": {
      "name": "Poor Fucking Infantry",
      "deck": "realms",
      "str": "1",
      "ability": "bond",
      "row": "close",
      "maxCount": 4,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "41": {
      "name": "Prince Stennis",
      "deck": "realms",
      "str": "5",
      "ability": "spy",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "42": {
      "name": "Redanian Foot Soldier",
      "deck": "realms",
      "str": "1",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "43": {
      "name": "Redanian Foot Soldier",
      "deck": "realms",
      "str": "1",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "44": {
      "name": "Sheldon Skaggs",
      "deck": "realms",
      "str": "4",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "45": {
      "name": "Siege Tower",
      "deck": "realms",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Barão Sanguinário em Poleiro do Corvo (Velen) (Velen)"
    },
    "46": {
      "name": "Siegfried of Denesle",
      "deck": "realms",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "47": {
      "name": "Sigismund Dijkstra",
      "deck": "realms",
      "str": "4",
      "ability": "spy",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Barão Aryan La Valette em Castelo La Valette (Teméria)"
    },
    "48": {
      "name": "Síle de Tansarville",
      "deck": "realms",
      "str": "5",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "49": {
      "name": "Thaler",
      "deck": "realms",
      "str": "1",
      "ability": "spy",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Síle de Tansarville em Fortaleza de Drakenborg (Redânia)"
    },
    "50": {
      "name": "Sabrina Glevissig",
      "deck": "realms",
      "str": "4",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Médica Shani em Academia de Oxenfurt (Redânia)"
    },
    "51": {
      "name": "Vernon Roche",
      "deck": "realms",
      "str": "10",
      "ability": "hero",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Almirante de Cidaris em Porto Real de Cidaris (Cidaris)"
    },
    "52": {
      "name": "Ves",
      "deck": "realms",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "53": {
      "name": "Yarpen Zigrin",
      "deck": "realms",
      "str": "2",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "54": {
      "name": "Trebuchet",
      "deck": "realms",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "55": {
      "name": "Trebuchet",
      "deck": "realms",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    },
    "56": {
      "name": "Emhyr var Emreis - His Imperial Majesty",
      "deck": "nilfgaard",
      "str": "",
      "ability": "emhyr_imperial",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "57": {
      "name": "Emhyr var Emreis - Emperor of Nilfgaard",
      "deck": "nilfgaard",
      "str": "",
      "ability": "emhyr_emperor",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "58": {
      "name": "Emhyr var Emreis - the White Flame",
      "deck": "nilfgaard",
      "str": "",
      "ability": "emhyr_whiteflame",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "59": {
      "name": "Emhyr var Emreis - The Relentless",
      "deck": "nilfgaard",
      "str": "",
      "ability": "emhyr_relentless",
      "row": "leader",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio Regional de Nilfgaard (Império de Nilfgaard)"
    },
    "60": {
      "name": "Emhyr var Emreis - Invader of the North",
      "deck": "nilfgaard",
      "str": "",
      "ability": "emhyr_invader",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "61": {
      "name": "Albrich",
      "deck": "nilfgaard",
      "str": "2",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "62": {
      "name": "Assire var Anahid",
      "deck": "nilfgaard",
      "str": "6",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "63": {
      "name": "Black Infantry Archer",
      "deck": "nilfgaard",
      "str": "10",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio da Academia de Vicovaro (Vicovaro)"
    },
    "64": {
      "name": "Black Infantry Archer",
      "deck": "nilfgaard",
      "str": "10",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Mestre Arqueiro de Metinna em Planícies dos Cavalos de Metinna (Metinna)"
    },
    "65": {
      "name": "Cahir Mawr Dyffryn aep Ceallach",
      "deck": "nilfgaard",
      "str": "6",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "66": {
      "name": "Cynthia",
      "deck": "nilfgaard",
      "str": "4",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "67": {
      "name": "Etolian Auxiliary Archers",
      "deck": "nilfgaard",
      "str": "1",
      "ability": "medic",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "68": {
      "name": "Etolian Auxiliary Archers",
      "deck": "nilfgaard",
      "str": "1",
      "ability": "medic",
      "row": "ranged",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio dos Generais do Sul (Maecht & Metinna)"
    },
    "69": {
      "name": "Fringilla Vigo",
      "deck": "nilfgaard",
      "str": "6",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "70": {
      "name": "Heavy Zerrikanian Fire Scorpion",
      "deck": "nilfgaard",
      "str": "10",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Feiticeira Fringilla Vigo em Academia Imperial de Vicovaro (Vicovaro)"
    },
    "71": {
      "name": "Impera Brigade Guard",
      "deck": "nilfgaard",
      "str": "3",
      "ability": "bond",
      "row": "close",
      "maxCount": 4,
      "source": "Prêmio de Campeão: Torneio dos Generais do Sul (Maecht & Metinna) / Mercado Imperial das Torres Douradas"
    },
    "72": {
      "name": "Letho of Gulet",
      "deck": "nilfgaard",
      "str": "10",
      "ability": "hero",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Letho de Gulet em Guarnição de Gemmera (Gemmera)"
    },
    "73": {
      "name": "Menno Coehoorn",
      "deck": "nilfgaard",
      "str": "10",
      "ability": "hero medic",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Marechal Menno Coehoorn em Fortaleza de Darn Dyffra (Vicovaro)"
    },
    "74": {
      "name": "Morteisen",
      "deck": "nilfgaard",
      "str": "3",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "75": {
      "name": "Morvran Voorhis",
      "deck": "nilfgaard",
      "str": "10",
      "ability": "hero",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Caçador Leo Bonhart em Arena de Claremont (Ebbing) (Ebbing)"
    },
    "76": {
      "name": "Nausicaa Cavalry Rider",
      "deck": "nilfgaard",
      "str": "2",
      "ability": "bond",
      "row": "close",
      "maxCount": 3,
      "source": "Vença Duque Joachim de Wett em Academia Militar de Castel Graupian (Império de Nilfgaard) / Mercado Imperial das Torres Douradas"
    },
    "77": {
      "name": "Puttkammer",
      "deck": "nilfgaard",
      "str": "3",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "78": {
      "name": "Rainfarn",
      "deck": "nilfgaard",
      "str": "4",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "79": {
      "name": "Renuald aep Matsen",
      "deck": "nilfgaard",
      "str": "5",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio dos Generais do Sul (Maecht & Metinna)"
    },
    "80": {
      "name": "Rotten Mangonel",
      "deck": "nilfgaard",
      "str": "3",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "81": {
      "name": "Shilard Fitz-Oesterlen",
      "deck": "nilfgaard",
      "str": "7",
      "ability": "spy",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "82": {
      "name": "Siege Engineer",
      "deck": "nilfgaard",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Embaixador Shilard Fitz-Oesterlen em Palácio Senatorial de Tarnhann (Império de Nilfgaard)"
    },
    "83": {
      "name": "Siege Technician",
      "deck": "nilfgaard",
      "str": "0",
      "ability": "medic",
      "row": "siege",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio da Academia de Vicovaro (Vicovaro)"
    },
    "84": {
      "name": "Stefan Skellen",
      "deck": "nilfgaard",
      "str": "9",
      "ability": "spy",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Stefan Skellen (Coruja) em Castelo Stygga (Ebbing & Salm)"
    },
    "85": {
      "name": "Sweers",
      "deck": "nilfgaard",
      "str": "2",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "86": {
      "name": "Tibor Eggebracht",
      "deck": "nilfgaard",
      "str": "10",
      "ability": "hero",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Coronel Tibor Eggebracht em Cidadela Real de Maecht (Maecht)"
    },
    "87": {
      "name": "Vanhemar",
      "deck": "nilfgaard",
      "str": "4",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "88": {
      "name": "Vattier de Rideaux",
      "deck": "nilfgaard",
      "str": "4",
      "ability": "spy",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Astrólogo Imperial Xarthisius em Passo Montanhoso de Assengard (Nazair)"
    },
    "89": {
      "name": "Vreemde",
      "deck": "nilfgaard",
      "str": "2",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "90": {
      "name": "Young Emissary",
      "deck": "nilfgaard",
      "str": "5",
      "ability": "bond",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Vattier de Rideaux em Palácio Imperial de Loc Grim (Império de Nilfgaard)"
    },
    "91": {
      "name": "Young Emissary",
      "deck": "nilfgaard",
      "str": "5",
      "ability": "bond",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "92": {
      "name": "Zerrikanian Fire Scorpion",
      "deck": "nilfgaard",
      "str": "5",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Mercado Imperial das Torres Douradas (Império de Nilfgaard)"
    },
    "93": {
      "name": "Eredin - Commander of the Red Riders",
      "deck": "monsters",
      "str": "",
      "ability": "eredin_commander",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "94": {
      "name": "Eredin - Bringer of Death",
      "deck": "monsters",
      "str": "",
      "ability": "eredin_bringer_of_death",
      "row": "leader",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio Regional de Toussaint (Toussaint)"
    },
    "95": {
      "name": "Eredin - Destroyer of Worlds",
      "deck": "monsters",
      "str": "",
      "ability": "eredin_destroyer",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "96": {
      "name": "Eredin - King of the Wild Hunt",
      "deck": "monsters",
      "str": "",
      "ability": "eredin_king",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "97": {
      "name": "Eredin Bréacc Glas - The Treacherous",
      "deck": "monsters",
      "str": "",
      "ability": "eredin_treacherous",
      "row": "leader",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio do Leão de Cintra (Cintra)"
    },
    "98": {
      "name": "Arachas ",
      "deck": "monsters",
      "str": "4",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "99": {
      "name": "Arachas ",
      "deck": "monsters",
      "str": "4",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "100": {
      "name": "Arachas ",
      "deck": "monsters",
      "str": "4",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "101": {
      "name": "Arachas- Behemoth",
      "deck": "monsters",
      "str": "6",
      "ability": "muster",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "102": {
      "name": "Botchling",
      "deck": "monsters",
      "str": "4",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "103": {
      "name": "Celaeno Harpy",
      "deck": "monsters",
      "str": "2",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "104": {
      "name": "Cockatrice",
      "deck": "monsters",
      "str": "2",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "105": {
      "name": "Crone - Brewess",
      "deck": "monsters",
      "str": "6",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio do Leão de Cintra (Cintra)"
    },
    "106": {
      "name": "Crone - Weavess",
      "deck": "monsters",
      "str": "6",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "107": {
      "name": "Crone - Whispess",
      "deck": "monsters",
      "str": "6",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "108": {
      "name": "Draug",
      "deck": "monsters",
      "str": "10",
      "ability": "hero",
      "row": "close",
      "maxCount": 1,
      "source": "Vença General Espectral Draug em Obelisco do Monte Sodden (Sodden)"
    },
    "109": {
      "name": "Earth Elemental",
      "deck": "monsters",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "110": {
      "name": "Endrega",
      "deck": "monsters",
      "str": "2",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "111": {
      "name": "Fiend",
      "deck": "monsters",
      "str": "6",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "112": {
      "name": "Fire Elemental",
      "deck": "monsters",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "113": {
      "name": "Foglet",
      "deck": "monsters",
      "str": "2",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "114": {
      "name": "Forktail",
      "deck": "monsters",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "115": {
      "name": "Frightener",
      "deck": "monsters",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "116": {
      "name": "Gargoyle",
      "deck": "monsters",
      "str": "2",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "117": {
      "name": "Ghoul",
      "deck": "monsters",
      "str": "1",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "118": {
      "name": "Ghoul",
      "deck": "monsters",
      "str": "1",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "119": {
      "name": "Ghoul",
      "deck": "monsters",
      "str": "1",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "120": {
      "name": "Grave Hag",
      "deck": "monsters",
      "str": "5",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "121": {
      "name": "Griffin",
      "deck": "monsters",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "122": {
      "name": "Harpy",
      "deck": "monsters",
      "str": "2",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "123": {
      "name": "Ice Giant",
      "deck": "monsters",
      "str": "5",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "124": {
      "name": "Imlerith",
      "deck": "monsters",
      "str": "10",
      "ability": "hero",
      "row": "close",
      "maxCount": 1,
      "source": "Vença General Imlerith (Caçada Selvagem) em Cidadela Real de Cintra (Cintra)"
    },
    "125": {
      "name": "Kayran",
      "deck": "monsters",
      "str": "8",
      "ability": "hero morale",
      "row": "agile",
      "maxCount": 1,
      "source": "Vença Tecelã dos Pântanos em Pântanos de Angren & Ysgith (Angren)"
    },
    "126": {
      "name": "Leshen",
      "deck": "monsters",
      "str": "10",
      "ability": "hero",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Guardião do Monte Gorgon em Encostas do Monte Gorgon (Toussaint)"
    },
    "127": {
      "name": "Nekker",
      "deck": "monsters",
      "str": "2",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "128": {
      "name": "Nekker",
      "deck": "monsters",
      "str": "2",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "129": {
      "name": "Nekker",
      "deck": "monsters",
      "str": "2",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "130": {
      "name": "Plague Maiden",
      "deck": "monsters",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "131": {
      "name": "Vampire - Bruxa",
      "deck": "monsters",
      "str": "4",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Emiel Regis Rohellec Terzieff em Estalagem da Raposa (Fox Hollow) (Toussaint)"
    },
    "132": {
      "name": "Vampire - Ekimmara",
      "deck": "monsters",
      "str": "4",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Dettlaff van der Eretein em Castelo de Dun Tynne (Toussaint)"
    },
    "133": {
      "name": "Vampire - Fleder",
      "deck": "monsters",
      "str": "4",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Senhora Orianna de Beauclair em Palácio Ducal de Beauclair (Toussaint)"
    },
    "134": {
      "name": "Vampire - Garkain",
      "deck": "monsters",
      "str": "4",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Vença O Ancião Oculto (Unseen Elder) em Caverna do Ancião Oculto (Belhaven) (Toussaint)"
    },
    "135": {
      "name": "Vampire - Katakan",
      "deck": "monsters",
      "str": "5",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Mordomo Barnabas-Basil em Vinhedo Corvo Bianco (Toussaint)"
    },
    "136": {
      "name": "Werewolf",
      "deck": "monsters",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "137": {
      "name": "Wyvern",
      "deck": "monsters",
      "str": "2",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "138": {
      "name": "Toad",
      "deck": "monsters",
      "str": "7",
      "ability": "scorch_r",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Boutique Ducal de Beauclair (Toussaint)"
    },
    "139": {
      "name": "Francesca Findabair - Queen of Dol Blathanna",
      "deck": "scoiatael",
      "str": "",
      "ability": "francesca_queen",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "140": {
      "name": "Francesca Findabair - the Beautiful",
      "deck": "scoiatael",
      "str": "",
      "ability": "francesca_beautiful",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "141": {
      "name": "Francesca Findabair - Daisy of the Valley",
      "deck": "scoiatael",
      "str": "",
      "ability": "francesca_daisy",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "142": {
      "name": "Francesca Findabair - Pureblood Elf",
      "deck": "scoiatael",
      "str": "",
      "ability": "francesca_pureblood",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "143": {
      "name": "Francesca Findabair - Hope of the Aen Seidhe",
      "deck": "scoiatael",
      "str": "",
      "ability": "francesca_hope",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "144": {
      "name": "Ciaran aep Easnillien",
      "deck": "scoiatael",
      "str": "3",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "145": {
      "name": "Barclay Els",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "146": {
      "name": "Dennis Cranmer",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "147": {
      "name": "Dol Blathanna Archer",
      "deck": "scoiatael",
      "str": "4",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "148": {
      "name": "Dol Blathanna Scout",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "149": {
      "name": "Dol Blathanna Scout",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "150": {
      "name": "Dol Blathanna Scout",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio Élfico do Vale das Flores (Aedirn & Dol Blathanna)"
    },
    "151": {
      "name": "Dwarven Skirmisher",
      "deck": "scoiatael",
      "str": "3",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "152": {
      "name": "Dwarven Skirmisher",
      "deck": "scoiatael",
      "str": "3",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "153": {
      "name": "Dwarven Skirmisher",
      "deck": "scoiatael",
      "str": "3",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio da Grande Forja de Mahakam (Mahakam)"
    },
    "154": {
      "name": "Eithné",
      "deck": "scoiatael",
      "str": "10",
      "ability": "hero",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Rainha Eithné de Brokilon em Águas Sagradas de Duén Canell (Floresta de Brokilon)"
    },
    "155": {
      "name": "Elven Skirmisher",
      "deck": "scoiatael",
      "str": "2",
      "ability": "muster",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Rei Élfico Filavandrel em Santuário de Dol Blathanna (Vale das Flores) (Aedirn & Dol Blathanna)"
    },
    "156": {
      "name": "Elven Skirmisher",
      "deck": "scoiatael",
      "str": "2",
      "ability": "muster",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Torque o Silvano em Aldeia de Posada Alta (Aedirn & Dol Blathanna)"
    },
    "157": {
      "name": "Elven Skirmisher",
      "deck": "scoiatael",
      "str": "2",
      "ability": "muster",
      "row": "ranged",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio Élfico do Vale das Flores (Aedirn & Dol Blathanna)"
    },
    "158": {
      "name": "Filavandrel aen Fidhail",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "159": {
      "name": "Havekar Healer",
      "deck": "scoiatael",
      "str": "0",
      "ability": "medic",
      "row": "ranged",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio da Cúpula de Loc Muinne (Montanhas Azuis)"
    },
    "160": {
      "name": "Havekar Healer",
      "deck": "scoiatael",
      "str": "0",
      "ability": "medic",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Senescal de Vengerberg em Capital Real de Vengerberg (Aedirn)"
    },
    "161": {
      "name": "Havekar Healer",
      "deck": "scoiatael",
      "str": "0",
      "ability": "medic",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Rainha Meve de Lyria e Rívia em Castelo Real de Rívia (Lyria & Rívia)"
    },
    "162": {
      "name": "Havekar Smuggler",
      "deck": "scoiatael",
      "str": "5",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "163": {
      "name": "Havekar Smuggler",
      "deck": "scoiatael",
      "str": "5",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "164": {
      "name": "Havekar Smuggler",
      "deck": "scoiatael",
      "str": "5",
      "ability": "muster",
      "row": "close",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio da Cúpula de Loc Muinne (Montanhas Azuis)"
    },
    "165": {
      "name": "Ida Emean aep Sivney",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "166": {
      "name": "Iorveth",
      "deck": "scoiatael",
      "str": "10",
      "ability": "hero",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Comandante Iorveth em Entreposto Comercial de Flotsam (Vale do Pontar)"
    },
    "167": {
      "name": "Isengrim Faoiltiarna",
      "deck": "scoiatael",
      "str": "10",
      "ability": "hero morale",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Isengrim Faoiltiarna em Anfiteatro Élfico de Loc Muinne (Montanhas Azuis)"
    },
    "168": {
      "name": "Mahakaman Defender",
      "deck": "scoiatael",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "169": {
      "name": "Mahakaman Defender",
      "deck": "scoiatael",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "170": {
      "name": "Mahakaman Defender",
      "deck": "scoiatael",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio da Grande Forja de Mahakam (Mahakam)"
    },
    "171": {
      "name": "Mahakaman Defender",
      "deck": "scoiatael",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Ancião Brouver Hoog em Forjas Subterrâneas do Monte Carbon (Mahakam)"
    },
    "172": {
      "name": "Mahakaman Defender",
      "deck": "scoiatael",
      "str": "5",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Saskia (A Caçadora de Dragões) em Cidadela de Vergen (Alto Aedirn (Lormark))"
    },
    "173": {
      "name": "Milva",
      "deck": "scoiatael",
      "str": "10",
      "ability": "morale",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "174": {
      "name": "Riordain",
      "deck": "scoiatael",
      "str": "1",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "175": {
      "name": "Saesenthessis",
      "deck": "scoiatael",
      "str": "10",
      "ability": "hero",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "176": {
      "name": "Toruviel",
      "deck": "scoiatael",
      "str": "2",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "177": {
      "name": "Vrihedd Brigade Recruit",
      "deck": "scoiatael",
      "str": "4",
      "ability": "",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "178": {
      "name": "Vrihedd Brigade Veteran",
      "deck": "scoiatael",
      "str": "5",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "179": {
      "name": "Vrihedd Brigade Veteran",
      "deck": "scoiatael",
      "str": "5",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Vença Comandante Yaevinn em Encruzilhada de Gulet (Aedirn)"
    },
    "180": {
      "name": "Yaevinn",
      "deck": "scoiatael",
      "str": "6",
      "ability": "",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Mercador Élfico de Dol Blathanna (Aedirn & Dol Blathanna)"
    },
    "181": {
      "name": "Berserker",
      "deck": "skellige",
      "str": "4",
      "ability": "berserker",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "182": {
      "name": "Birna Bran",
      "deck": "skellige",
      "str": "2",
      "ability": "medic",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Blueboy Lugos em Enseada de Harviken (Faroe) (Skellige)"
    },
    "183": {
      "name": "Blueboy Lugos",
      "deck": "skellige",
      "str": "6",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "184": {
      "name": "Cerys",
      "deck": "skellige",
      "str": "10",
      "ability": "hero muster",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Cerys an Craite em Povoado de Svorlag (Spikeroog) (Skellige)"
    },
    "185": {
      "name": "Clan Brokva Archer",
      "deck": "skellige",
      "str": "6",
      "ability": "",
      "row": "ranged",
      "maxCount": 2,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "186": {
      "name": "Clan Dimun Pirate",
      "deck": "skellige",
      "str": "6",
      "ability": "scorch",
      "row": "ranged",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "187": {
      "name": "Cerys - Clan Drummond Shield Maiden",
      "deck": "skellige",
      "str": "4",
      "ability": "bond",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Capitão de Urialla em Porto de Urialla (An Skellig) (Skellige)"
    },
    "188": {
      "name": "Cerys - Clan Drummond Shield Maiden",
      "deck": "skellige",
      "str": "4",
      "ability": "bond",
      "row": "close",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio dos Navegadores de Spikeroog (Skellige)"
    },
    "189": {
      "name": "Cerys - Clan Drummond Shield Maiden",
      "deck": "skellige",
      "str": "4",
      "ability": "bond",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "190": {
      "name": "Clan Heymaey Skald",
      "deck": "skellige",
      "str": "4",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "191": {
      "name": "Clan Tordarroch Armorsmith",
      "deck": "skellige",
      "str": "4",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "192": {
      "name": "Clan an Craite Warrior",
      "deck": "skellige",
      "str": "6",
      "ability": "bond",
      "row": "close",
      "maxCount": 3,
      "source": "Vença Jarl Crach an Craite em Porto de Kaer Trolde (Ard Skellig) (Skellige) / Feirante Marítimo de Kaer Trolde"
    },
    "193": {
      "name": "Donar an Hindar",
      "deck": "skellige",
      "str": "4",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "194": {
      "name": "Draig Bon-Dhu",
      "deck": "skellige",
      "str": "2",
      "ability": "horn",
      "row": "siege",
      "maxCount": 1,
      "source": "Vença Jarl Donar an Hindar em Jardim de Freya (Hindarsfjall) (Skellige)"
    },
    "195": {
      "name": "Ermion",
      "deck": "skellige",
      "str": "8",
      "ability": "hero mardroeme",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Arquidruida Ermion em Bosque Sagrado de Gedyneith (Skellige)"
    },
    "196": {
      "name": "Hemdall",
      "deck": "skellige",
      "str": "11",
      "ability": "hero",
      "row": "close",
      "maxCount": 0,
      "source": "Invocado automaticamente pela carta Kambi."
    },
    "197": {
      "name": "Hjalmar",
      "deck": "skellige",
      "str": "10",
      "ability": "hero",
      "row": "ranged",
      "maxCount": 1,
      "source": "Vença Hjalmar an Craite em Forja Gelada de Undvik (Skellige)"
    },
    "198": {
      "name": "Holger Blackhand",
      "deck": "skellige",
      "str": "4",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "199": {
      "name": "Kambi",
      "deck": "skellige",
      "str": "0",
      "ability": "avenger_kambi",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Capitão Mercante de Bremervoord em Península de Bremervoord (Costa do Mar do Norte)"
    },
    "200": {
      "name": "Light Longship",
      "deck": "skellige",
      "str": "4",
      "ability": "muster",
      "row": "ranged",
      "maxCount": 3,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "201": {
      "name": "Madman Lugos",
      "deck": "skellige",
      "str": "6",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Vença Madman Lugos em Fortaleza de Kaer Muire (Skellige)"
    },
    "202": {
      "name": "Mardroeme",
      "deck": "special",
      "str": "",
      "ability": "mardroeme",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "203": {
      "name": "Olaf",
      "deck": "skellige",
      "str": "12",
      "ability": "morale",
      "row": "agile",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "204": {
      "name": "Skellige Storm",
      "deck": "weather",
      "str": "",
      "ability": "storm rain fog",
      "row": "",
      "maxCount": 3,
      "source": "Disponível em Empório da Praça do Hierarca (Redânia & Novigrad)"
    },
    "205": {
      "name": "Svanrige",
      "deck": "skellige",
      "str": "4",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "206": {
      "name": "Transformed Vildkaarl",
      "deck": "skellige",
      "str": "14",
      "ability": "vildkarrl morale",
      "row": "close",
      "maxCount": 0,
      "source": "Invocado ao transformar Berserker com Mardroeme."
    },
    "207": {
      "name": "Transformed Young Vildkaarl",
      "deck": "skellige",
      "str": "8",
      "ability": "vildkarrl bond",
      "row": "ranged",
      "maxCount": 0,
      "source": "Invocado ao transformar Jovem Berserker com Mardroeme."
    },
    "208": {
      "name": "Udalryk",
      "deck": "skellige",
      "str": "4",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "209": {
      "name": "War Longship",
      "deck": "skellige",
      "str": "6",
      "ability": "bond",
      "row": "siege",
      "maxCount": 3,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "210": {
      "name": "Young Berserker",
      "deck": "skellige",
      "str": "2",
      "ability": "berserker",
      "row": "ranged",
      "maxCount": 3,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "211": {
      "name": "Crach an Craite",
      "deck": "skellige",
      "str": "",
      "ability": "crach_an_craite",
      "row": "leader",
      "maxCount": 1,
      "source": "Disponível em Feirante Marítimo de Kaer Trolde (Skellige)"
    },
    "212": {
      "name": "King Bran",
      "deck": "skellige",
      "str": "",
      "ability": "king_bran",
      "row": "leader",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio Regional de Skellige (Skellige)"
    },
    "213": {
      "name": "Schirru",
      "deck": "scoiatael",
      "str": "8",
      "ability": "scorch_s",
      "row": "siege",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio da Cúpula de Loc Muinne (Montanhas Azuis)"
    },
    "214": {
      "name": "Roach",
      "deck": "neutral",
      "str": "3",
      "ability": "",
      "row": "close",
      "maxCount": 1,
      "source": "Prêmio de Campeão: Torneio dos Bruxos de Kaer Morhen (Kaer Morhen)"
    },
    "215": {
      "name": "Ballista",
      "deck": "realms",
      "str": "6",
      "ability": "",
      "row": "siege",
      "maxCount": 1,
      "source": "Disponível em Empório Real de Vízima (Teméria)"
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = STORY_DATA;
}
