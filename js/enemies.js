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
  var new_deck = copy_array(e.cards);
  var a = {id: eid, number: num, is_player: false, faded: false,
           name: nummed_name, img: e.img, width: e.width, height: e.height,
           max_hp: e.hp, max_mp: e.mp, str: e.str, def: e.def, mag: e.mag, mdef: e.mdef,
           hp: e.hp, mp: e.mp, cur_str: e.str, cur_def: e.def, cur_mag: e.mag, cur_mdef: e.mdef,
           min_dmg: e.min_dmg, max_dmg: e.max_dmg, min_mag_dmg: e.min_mag_dmg, max_mag_dmg: e.max_mag_dmg,
           deck: new_deck, discard: [], hand: [], start_hand_size: e.start_hand_size,
           ai: e.ai,
           status: []};
  return a;
}
function make_player_char() {
 return {name: "You", is_player: true, number: -1,
         max_hp: 100, max_mp: 100, hp: 100, mp: 100,
         str: 10, mag: 10, def: 10, mdef: 10,
         cur_str: 10, cur_mag: 10, cur_def: 10, cur_mdef: 10,
         min_dmg: 1, max_dmg: 8, min_mag_dmg: 0, max_mag_dmg: 8,
         mp_penalty_percent: 0,
         decklist: [5, 5, 5, 5, 5, 7, 7, 7, 7, 7],
         deck: [], discard: [], hand: [], start_hand_size: 3,
         status: []};
}

var enemies_data = [
  {id: 0,
   name: "Evil Carrot", img: "evil_carrot.png", width: 200, height: 200,
   min_dmg: 0, max_dmg: 6, min_mag_dmg: 0, max_mag_dmg: 6,
   hp: 30, mp: 2, str: 7, def: 2, mag: 0, mdef: 2,
   passives: [],
   ai: "simple",
   cards: [0, 0, 0, 0, 0, 6, 6, 6], start_hand_size: 0
  }
];
