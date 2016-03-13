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
function switch_target_display(number) {
  var enemy = $('#enemy' + number);
  enemy.children('.enemyTarget').html('Targeting');
  for (var i=0; i<3; i++) {
    if (i != number) {
      $('#enemy' + i).children('.enemyTarget').html(
        '<a class="point" onclick="game.switchTarget(' + i + ')">Switch target</a>');
    }
  }
}
function hide_target_display(number) {
  var enemy = $('#enemy' + number);
  enemy.children('.enemyTarget').html('');
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

function update_enemy(enemy, target) {
  $('#enemy' + enemy.number).html(enemy_inner_html(enemy, target));
}
function fade_out_enemy(enemy_number) {
  $('#enemy' + enemy_number).animate({ opacity: 0 });
}

function remove_card_to_remove() {
  $('#cardToRemove').remove();
}
function fade_out_card(index, count) {
  $('#card' + index).animate({opacity: 0}, 400);
  $('#card' + index).attr('id', 'cardToRemove');
  for (var i=index+1; i<count; i++) {
    $('#card' + i).attr('onclick', card_onclick_code(i-1));
    $('#card' + i).attr('id', 'card' + (i-1));
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

var map_is_initialized = false;
const MAP_WIDTH = 9;
const MAP_HEIGHT = 6;
const MAP_CELL_PIXELS = 50;
var map_cell_divs = [];
function initialize_map_divs() {
  if (map_is_initialized) {
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
      var map_cell = $('<div/>', {class: 'mapCell', onclick: map_click_code});
      map_row.append(map_cell);
      map_cell_divs[i].push(map_cell);
    }
  }
  map_is_initialized = true;
}

var map_player_img = $('#mapPlayer');
function move_map_player(x, y) {
  var x_in_pixels = MAP_CELL_PIXELS*x;
  var y_in_pixels = MAP_CELL_PIXELS*y;
  map_player_img.animate({left: x_in_pixels, top: y_in_pixels});
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