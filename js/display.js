var history_last_entry;
var history_div = $('#history');
function add_history(string) {
  var entry = $('<p>', {text: string});
  history_div.append(entry);
  history_last_entry = entry;
  history_div.scrollTop(history_div.prop('scrollHeight'));
}
function append_history(string) {
  var old_html = history_last_entry.html();
  var new_html = old_html + string;
  history_last_entry.html(new_html);
  history_div.scrollTop(history_div.prop('scrollHeight'));
}

var dark_box_div = $('#darkBox');
var dark_box_panel_div = $('#darkBoxPanel');
function dismiss_dark_box() {
  dark_box_div.css('display', 'none');
  dark_box_panel_div.css('display', 'none');
}
function show_dark_box(html) {
  dark_box_div.css('display', 'block');
  dark_box_panel_div.css('display', 'block');
  dark_box_panel_div.html(html);
}
function switch_target_display(number, old_number) {
  var new_enemy_target = $('#enemy' + number).children('.enemyTarget');
  new_enemy_target.html('Targeting');
  var old_enemy_target = $('#enemy' + old_number).children('.enemyTarget');
  old_enemy_target.text('');
  old_enemy_target.append(get_switch_target_html(old_number));
}
function hide_target_display(number) {
  var enemy_target = $('#enemy' + number).children('.enemyTarget');
  enemy_target.html('');
}

function update_hp(number, hp, max_hp) {
  if (number == -1) {
    update_player_hp(hp, max_hp);
  } else {
    update_enemy_hp(number, hp, max_hp);
  }
}
function update_mp(number, mp, max_mp) {
  if (number == -1) {
    update_player_mp(mp, max_mp);
  } else {
    update_enemy_mp(number, mp, max_mp);
  }
}
function update_status(number, statuses) {
  if (number == -1) {
    update_player_status(statuses);
  } else {
    update_enemy_status(number, statuses);
  }
}
function update_enemy_hp(enemy_number, hp, max_hp) {
  $('#enemy' + enemy_number).children('.enemyHP').html('HP: ' + hp + '/' + max_hp);
}
function update_enemy_mp(enemy_number, mp, max_mp) {
  $('#enemy' + enemy_number).children('.enemyMP').html('MP: ' + mp + '/' + max_mp);
}
function update_enemy_status(enemy_number, statuses) {
  var status_string = '';
  for (var i=0; i<statuses.length; i++) {
    status_string += status_to_string(statuses[i]);
    if (i < statuses.length - 1) {
      status_string += ", ";
    }
  }
  $('#enemy' + enemy_number).children('.enemyStatus').html(status_string);
}

var player_hp_div = $('#playerHP');
function update_player_hp(hp, max_hp) {
  var hp_class = '';
  var hp_percent = hp / max_hp;
  if (hp_percent > 0.5) { hp_class = 'healthy'; }
  else if (hp_percent > 0.25) { hp_class = 'injured'; }
  else { hp_class = 'nearDeath'; }
  player_hp_div .html('HP: <span class="' + hp_class + '">' + hp + '/' + max_hp + '</span>');
}
var player_mp_div = $('#playerMP');
function update_player_mp(mp, max_mp) {
  player_mp_div.html('MP: <span class="mana">' + mp + '/' + max_mp + '</span>');
}
var player_status_div = $('#playerStatus');
function update_player_status(statuses) {
  var status_string = '';
  for (var i = 0; i < statuses.length; i++) {
    status_string += status_to_string(statuses[i]);
    if (i < statuses.length - 1) {
      status_string += ', ';
    }
  }
  player_status_div.html(status_string);
}

function fade_out_enemy(enemy_number) {
  $('#enemy' + enemy_number).animate({ opacity: 0 });
}

function remove_card_to_remove() {
  $('#cardToRemove').remove();
}
function fade_out_card(index, count) {
  var selected_card = $('#card' + index);
  selected_card.animate({opacity: 0}, 400);
  selected_card.attr('id', 'cardToRemove');
  for (var i=index+1; i<count; i++) {
    var card_i = $('#card' + i);
    card_i.attr('onclick', card_onclick_code(i-1));
    card_i.attr('id', 'card' + (i-1));
  }
  setTimeout(remove_card_to_remove, 400);
}

function disable_cards() {
  $('.cardActive').toggleClass('cardActive cardDisabled');
  $('.basicCardActive').toggleClass('basicCardActive basicCardDisabled');
}
function enable_cards() {
  $('.cardDisabled').toggleClass('cardDisabled cardActive');
  $('.basicCardDisabled').toggleClass('basicCardDisabled basicCardActive');
}

function update_top_text(text) {
  $('#topText').html(text);
}

var map_div_initialized = false;
const MAP_CELL_PIXELS = 50;
var map_cell_divs = [];
function initialize_map_divs() {
  if (map_div_initialized) {
    warn('initialize_map_divs called twice!');
    return;
  }
  var map_top_div = $('#map');
  for (var i=0; i<MAP_HEIGHT; i++) {  
    var map_row = $('<div/>', {class: 'mapRow'});
    map_top_div.append(map_row);
    map_cell_divs.push([])
    for (var j=0; j<MAP_WIDTH; j++) {
      var map_click_code = 'game.clickMapCell(' + j + ',' + i + ')';
      var map_cell = $('<div/>', {class: 'mapCell mapCellUnseen', onclick: map_click_code});
      map_row.append(map_cell);
      map_cell_divs[i].push(map_cell);
    }
  }
  map_div_initialized = true;
}
var map_player_img = $('#mapPlayer');
function move_map_player(x, y) {
  var x_in_pixels = MAP_CELL_PIXELS*x;
  var y_in_pixels = MAP_CELL_PIXELS*y;
  map_player_img.animate({left: x_in_pixels, top: y_in_pixels});
}
function teleport_map_player(x, y) {
  var x_in_pixels = MAP_CELL_PIXELS*x;
  var y_in_pixels = MAP_CELL_PIXELS*y;
  map_player_img.css({left: x_in_pixels, top: y_in_pixels});
}
function deactivate_all_map_cells() {
  $('.mapCellActive').toggleClass('mapCellActive mapCellInactive');
}
function set_map_cell(x, y, active, explored) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) { return; }
  map_cell_divs[y][x].toggleClass('mapCellUnseen', false);
  map_cell_divs[y][x].toggleClass('mapCellActiveExplored', false);
  map_cell_divs[y][x].toggleClass('mapCellActiveUnexplored', false);
  map_cell_divs[y][x].toggleClass('mapCellInactiveExplored', false);
  map_cell_divs[y][x].toggleClass('mapCellInactiveUnexplored', false);
  if (active && explored ) {
    map_cell_divs[y][x].toggleClass('mapCellActiveExplored', true);
  } else if (active && !explored) {
    map_cell_divs[y][x].toggleClass('mapCellActiveUnexplored', true);
  } else if (!active && explored) {
    map_cell_divs[y][x].toggleClass('mapCellInactiveExplored', true);
  } else if (!active && !explored) {
    map_cell_divs[y][x].toggleClass('mapCellInactiveUnexplored', true);
  }
}
function set_map_cell_wall(x, y) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) { return; }
  map_cell_divs[y][x].toggleClass('mapCellUnseen', false);
  map_cell_divs[y][x].toggleClass('mapCellWall', true);
}


var battle_area_div = $('#battleArea');
var explore_area_div = $('#exploreArea');
var cards_div = $('#cards');
var area_text_div = $('#areaText');
function display_battle_mode() {
  battle_area_div.toggleClass('hide', false);
  explore_area_div.toggleClass('hide', true);
  cards_div.toggleClass('hide', false);
  area_text_div.toggleClass('hide', true);
}
function display_explore_mode() {
  battle_area_div.toggleClass('hide', true);
  explore_area_div.toggleClass('hide', false);
  cards_div.toggleClass('hide', true);
  area_text_div.toggleClass('hide', false);
}
function update_area_text(map_event) {
  area_text_div.empty();
  area_text_div.append(map_event_html(map_event));
}
function clear_area_text() {
  area_text_div.empty();
}