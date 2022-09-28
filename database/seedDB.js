require('dotenv').config();
const pg = require('pg');
const axios = require('axios');
const Client = pg.Client;
// console.log(process.env.USER);

// axios.post('https://oauth.battle.net/token?grant_type=client_credentials', null, {
//   auth: {
//     'username': process.env.BLIZZ_CLIENT,
//     'password': process.env.BLIZZ_SECRET
//   }
// })
// .then(({access_token}) => {
//   console.log(access_token);
// })
// .catch((err) => {
//   console.log(err);
// });

// axios.get('')

let buffs = [
  'Bloodlust/Heroism',
  'Gift of the Wild',
  'Intellect',
  'Spirit',
  'Stamina',
  '+5% Spell Haste',
  '+5% Spell Crit',
  '+5% Physical Crit',
  '+10% Attack Power',
  '+3% Damage',
  '+3% Haste',
  '+20% Melee Haste',
  'Healing Aura',
  'Blessing of Kings',
  'Spell Power',
  'Attack Power',
  'Health',
  'Strength and Agility',
  'Mana Replenishment',
  'Judgement of Wisdom',
  'Judgement of Light',
  'Vampiric Embrace'
];

let debuffs = [
  '5% Armor Reduction',
  '20% Armor Reduction',
  '3% Physical Hit Reduction',
  '20% Armor Reduction',
  '20% Attack Speed Reduction',
  '5% Spell Crit',
  '3% Crit',
  'Attack Power Reduction',
  '+4% Physical Damage',
  '+3% Spell Hit',
  '+30% Bleed Damage',
  '+13% Spell Damage',
];

let specs = [
  {
    spec: 'Death Knight: Blood',
    class: 'Death Knight',
    icon: `https://wow.zamimg.com/images/wow/icons/medium/spell_deathknight_bloodpresence.jpg`,
    buffs: [9, 12, 18],
    debuffs: [5]
  },
  {
    spec: 'Death Knight: Frost',
    class: 'Death Knight',
    icon: `https://wow.zamimg.com/images/wow/icons/medium/spell_deathknight_frostpresence.jpg`,
    buffs: [12, 18],
    debuffs: [5]
  },
  {
    spec: 'Death Knight: Unholy',
    class: 'Death Knight',
    icon: `https://wow.zamimg.com/images/wow/icons/medium/spell_deathknight_unholypresence.jpg`,
    buffs: [12, 18],
    debuffs: [12]
  },
  {
    spec: 'Druid: Balance',
    class: 'Druid',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_nature_starfall.jpg',
    buffs: [2, 7, 11],
    debuffs: [1, 3, 8, 10, 11, 12]
  },
  {
    spec: 'Druid: Feral',
    class: 'Druid',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_racial_bearform.jpg',
    buffs: [2, 8],
    debuffs: [4, 5, 8, 11]
  },
  {
    spec: 'Druid: Restoration',
    class: 'Druid',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_nature_healingtouch.jpg',
    buffs: [2, 13],
    debuffs: []
  },
  {
    spec: 'Hunter: Beast Mastery',
    class: 'Hunter',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_hunter_beasttaming.jpg',
    buffs: [10],
    debuffs: [1, 2, 3, 11]
  },
  {
    spec: 'Hunter: Marksmanship',
    class: 'Hunter',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_marksmanship.jpg',
    buffs: [9],
    debuffs: [1, 3, 11]
  },
  {
    spec: 'Hunter: Survival',
    class: 'Hunter',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_hunter_swiftstrike.jpg',
    buffs: [19],
    debuffs: []
  },
  {
    spec: 'Mage: Arcane',
    class: 'Mage',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_holy_magicalsentry.jpg',
    buffs: [3, 10],
    debuffs: []
  },
  {
    spec: 'Mage: Fire',
    class: 'Mage',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_fire_firebolt02.jpg',
    buffs: [3],
    debuffs: [6]
  },
  {
    spec: 'Mage: Frost',
    class: 'Mage',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_frost_frostbolt02.jpg',
    buffs: [3, 19],
    debuffs: [6]
  },
  {
    spec: 'Paladin: Holy',
    class: 'Paladin',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_holy_holybolt.jpg',
    buffs: [14, 21],
    debuffs: []
  },
  {
    spec: 'Paladin: Protection',
    class: 'Paladin',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_holy_devotionaura.jpg',
    buffs: [13, 14],
    debuffs: [5]
  },
  {
    spec: 'Paladin: Retribution',
    class: 'Paladin',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_holy_auraoflight.jpg',
    buffs: [10, 11, 14, 19, 20],
    debuffs: [7, 8]
  },
  {
    spec: 'Priest: Discipline',
    class: 'Priest',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_holy_wordfortitude.jpg',
    buffs: [4, 5, 19],
    debuffs: []
  },
  {
    spec: 'Priest: Holy',
    class: 'Priest',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_holy_guardianspirit.jpg',
    buffs: [4, 5],
    debuffs: []
  },
  {
    spec: 'Priest: Shadow',
    class: 'Priest',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_shadow_shadowwordpain.jpg',
    buffs: [4, 5, 22],
    debuffs: []
  },
  {
    spec: 'Rogue: Assassination',
    class: 'Rogue',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_rogue_eviscerate.jpg',
    buffs: [],
    debuffs: [2, 7]
  },
  {
    spec: 'Rogue: Combat',
    class: 'Rogue',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_backstab.jpg',
    buffs: [],
    debuffs: [2, 9]
  },
  {
    spec: 'Rogue: Subtlety',
    class: 'Rogue',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_stealth.jpg',
    buffs: [],
    debuffs: [2]
  },
  {
    spec: 'Shaman: Elemental',
    class: 'Shaman',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_nature_lightning.jpg',
    buffs: [1, 6, 7, 15, 18],
    debuffs: [7]
  },
  {
    spec: 'Shaman: Enhancement',
    class: 'Shaman',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_nature_lightningshield.jpg',
    buffs: [1, 9, 12, 18],
    debuffs: []
  },
  {
    spec: 'Shaman: Restoration',
    class: 'Shaman',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_nature_magicimmunity.jpg',
    buffs: [1, 6, 15],
    debuffs: []
  },
  {
    spec: 'Warlock: Affliction',
    class: 'Warlock',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_shadow_deathcoil.jpg',
    buffs: [3, 4, 17],
    debuffs: [1, 6, 8, 12]
  },
  {
    spec: 'Warlock: Demonology',
    class: 'Warlock',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_shadow_metamorphosis.jpg',
    buffs: [3, 4, 15, 17],
    debuffs: [1, 8, 12]
  },
  {
    spec: 'Warlock: Destruction',
    class: 'Warlock',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_shadow_rainoffire.jpg',
    buffs: [3, 4, 17, 19],
    debuffs: [1, 6, 8, 12]
  },
  {
    spec: 'Warrior: Arms',
    class: 'Warrior',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_rogue_eviscerate.jpg',
    buffs: [16, 17],
    debuffs: [2, 5, 8, 9, 11]
  },
  {
    spec: 'Warrior: Fury',
    class: 'Warrior',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_warrior_innerrage.jpg',
    buffs: [8, 16, 17],
    debuffs: [2, 5, 8]
  },
  {
    spec: 'Warrior: Protection',
    class: 'Warrior',
    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_shield_06.jpg',
    buffs: [16, 17],
    debuffs: [2, 5, 8]
  },
];



(async function seedTables() {
  const client = new Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PW,
    port: process.env.PORT,
  })

  await client.connect();
  for (var i = 0; i < buffs.length; i++) {
    await client.query(`INSERT INTO buffs (effect) VALUES ($1)`, [buffs[i]]);
  }
  for (var j = 0; j < debuffs.length; j++) {
    await client.query(`INSERT INTO debuffs (effect) VALUES ($1)`, [debuffs[j]]);
  }
  for (var k = 0; k < specs.length; k++) {
    let spec = specs[k].spec;
    spec = spec.split(':');
    spec = spec[1].substring(1);
    await client.query(`INSERT INTO specs (className, specName, specIcon, buffs, debuffs) VALUES ($1, $2, $3, $4, $5)`, [specs[k].class, spec, specs[k].icon, specs[k].buffs, specs[k].debuffs]);
  }
  await client.end();
})();