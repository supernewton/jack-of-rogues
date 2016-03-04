// HTML generation functions
function enemy_css_class(number_of_enemies) {
  switch (number_of_enemies) {
    case 1:
	  return "enemySingle";
	case 2:
	  return "enemyDouble";
	case 3:
	  return "enemyTriple";
	default:
	  warn("Unsupported enemy count: " + number_of_enemies);
	  return "";
  }
}
function status_html(status) {
  return '';
}
function enemy_inner_html(enemy, target) {
  var target_html = target ? 'Targeting' : '<a class="point" onclick="game.switchTarget(' + enemy.number + ')">Switch target</a>';
  return '<img src="img/' + enemy.img +'" width="' + enemy.width + ' height="' + enemy.height + '" />' +
         '<p class="statusLine enemyName">' + enemy.name + '</p>' +
         '<p class="statusLine enemyHP">HP: ' + enemy.hp + '/' + enemy.max_hp + '</p>' +
         '<p class="statusLine enemyMP">MP: ' + enemy.mp + '/' + enemy.max_mp + '</p>' +
         '<p class="statusLine enemyStatus">' + status_html(enemy.status) + '</p>' +
         '<p class="statusLine enemyTarget">' + target_html + '</p>';
}
function enemy_html(enemy, css_class) {
  return '<div id="enemy' + enemy.number + '" class="enemy ' + css_class + '">' +
            enemy_inner_html(enemy, true) +
         '</div>';
}
function player_html(player_char) {
  return  '<p class="statusLine" id="playerHP">HP: <span class="healthy">' + player_char.hp + '/' + player_char.max_hp + '</span></p>' +
          '<p class="statusLine" id="playerMP">MP: <span class="mana">' + player_char.mp + '/' + player_char.max_mp + '</span></p>' +
          '<p class="statusLine" id="playerStatus">' + status_html(status) + '</p>';
}
function status_to_string(status) {
  switch (status[0]) {
    default:
      return status[0];
  }
}

var history_last_entry;

// Display manipulation
function add_history(string) {
  var history = $('#history');
  var entry = $('<p>', {text: string});
  history.append(entry);
  history_last_entry = entry;
  history.scrollTop(history.prop('scrollHeight'));
}
function append_history(string) {
  var old_html = history_last_entry.html();
  var new_html = old_html + string;
  history_last_entry.html(new_html);
  var history = $('#history');
  history.scrollTop(history.prop('scrollHeight'));
}
function dismiss_dark_box() {
  $('#darkBox').css('display', 'none');
  $('#darkBoxPanel').css('display', 'none');
}
function show_dark_box(html) {
  $('#darkBox').css('display', 'block');
  $('#darkBoxPanel').css('display', 'block');
  $('#darkBoxPanel').html(html);
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
function update_player_hp(hp, max_hp) {
  var hp_class = '';
  var hp_percent = hp / max_hp;
  if (hp_percent > 0.5) { hp_class = 'healthy'; }
  else if (hp_percent > 0.25) { hp_class = 'injured'; }
  else { hp_class = 'nearDeath'; }
  $('#playerHP').html('HP: <span class="' + hp_class + '">' + hp + '/' + max_hp + '</span>');
}
function update_player_mp(mp, max_mp) {
  $('#playerMP').html('HP: <span class="mana">' + mp + '/' + max_mp + '</span>');
}
function update_player_status(statuses) {
  var status_string = '';
  for (var i = 0; i < statuses.length; i++) {
    status_string += status_to_string(statuses[i]);
    if (i < statuses.length - 1) {
      status_string += ', ';
    }
  }
  $('#playerStatus').html(status_string);
}

function update_enemy(enemy, target) {
  $('#enemy' + enemy.number).html(enemy_inner_html(enemy, target));
}
function fade_out_enemy(enemy_number) {
  $('#enemy' + enemy_number).animate({ opacity: 0 });
}
