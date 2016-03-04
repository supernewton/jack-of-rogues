function get_name_num(enemy_ids, idx) {
  var has_dupe = false;
  var lower_dupe_count = 0;
  for (var i = 0; i < enemy_ids.length; i++) {
    if (i != idx && enemy_ids[i] == enemy_ids[idx]) {
      has_dupe = true;
      if (i < idx) {
        lower_dupe_count++;
      }
    }
  }
  return has_dupe ? lower_dupe_count + 1 : 0;
}
function make_enemy(eid, num, name_num) {
  var e = enemies_data[eid];
  var nummed_name = name_num == 0 ? e.name : e.name + ' #' + name_num;
  var new_deck = new Array(e.cards.length);
  for (var i = 0; i < new_deck.length; i++) {
    new_deck[i] = i;
  }
  var a = {id: eid, number: num, is_player: false, faded: false,
           name: nummed_name, img: e.img, width: e.width, height: e.height,
           max_hp: e.hp, max_mp: e.mp, str: e.str, def: e.def, mag: e.mag, mdef: e.mdef,
           hp: e.hp, mp: e.mp, cur_str: e.str, cur_def: e.def, cur_mag: e.mag, cur_mdef: e.mdef,
           min_dmg: e.min_dmg, max_dmg: e.max_dmg, min_mag_dmg: e.min_mag_dmg, max_mag_dmg: e.max_mag_dmg,
           decklist: e.cards, deck: new_deck, discard: [], hand: [],
           status: []};
  return a;
}

var enemies_data = [
  {id: 0,
   name: "Evil Carrot", img: "evil_carrot.png", width: 200, height: 200,
   min_dmg: 0, max_dmg: 6, min_mag_dmg: 0, max_mag_dmg: 6,
   hp: 30, mp: 2, str: 8, def: 2, mag: 0, mdef: 2,
   passives: [],
   cards: [0, 0, 0, 0, 0, 0, 1, 1], hand: 0
  }
];

var enemy_cards_data = [
  {id: 0,
   name: "Nothing",
   text: "Does nothing. Appearing in weak enemies' decks, this card just takes up space.",
   mana_cost: 0,
   abilities: []
  },

  {id: 1,
   name: "Carrot Tackle",
   text: "Perform an attack with 130% power.",
   mana_cost: 0,
   abilities: [ ['attack_percent', 130] ]
  }
];

var cards_data = [
  {id: 0,
   name: "Basic Attack",
   text: "Perform an attack with 100% physical power.",
   mana_cost: 0,
   abilities: [ ['attack_percent', 100] ]
  },
  
  {id: 1,
   name: "Power Strike",
   text: "Perform an attack with 130% physical power.",
   mana_cost: 0,
   abilities: [ ['attack_percent', 130] ]
  },
];