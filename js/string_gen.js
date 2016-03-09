function damage_string(from_target, to_target, damage, damage_type) {
  var str = ' ';
  if (from_target.is_player) {
    str += 'You deal';
  } else {
    str += from_target.name + ' deals';
  }
  str += ' ' + damage + ' <span class="' + damage_type + '">' + damage_type + '</span> damage to';
  if (to_target.is_player) {
    if (from_target.is_player) {
      str += ' yourself.';
    } else {
      str += ' you.';
    }
  } else {
    str += ' ' + to_target.name + '.';
    if (to_target.hp <= 0) {
      str += ' ' + to_target.name + ' is slain!';
    }
  }
  return str;
}

function use_card_string(user, card) {
  if (user.is_player) {
    switch (card.id) {
      case 0:
        return 'You attack!';
      case 1:
        return 'You are stunned and can\'t move!';
      case 2:
        return 'You wait.';
      case 3:
        return 'You try to run!';
      case 4:
        return '';
      default:
        return 'You use ' + card.name + '!';
    }
  } else {
    switch (card.id) {
      case 0:
        return user.name + ' attacks!'
      case 1:
        return user.name + ' is stunned and can\'t move!';
      default:
        return user.name + ' uses ' + card.name + '!';
    }
  }
}

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
  // TODO
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

function card_onclick_code(pos) {
  return 'game.useCard(' + pos + ')';
}

function card_html(card, pos) {
  var title_dom = $('<div/>', {class: 'cardTitle', text: card.name});
  var cost_text;
  if (card.mana_cost == undefined || card.mana_cost == 0) {
    cost_text = 'No cost';
  } else {
    cost_text = 'Costs ' + card.mana_cost + ' mana';
  }
  var cost_dom = $('<div/>', {class: 'cardCost', text: cost_text});
  var text_dom = $('<div/>', {class: 'cardText', text: card.text});
  var card_dom = $('<div/>', {id: 'card' + pos, class: 'card cardActive', onclick: card_onclick_code(pos)});
  card_dom.append(title_dom, cost_dom, text_dom);
  return card_dom;
}
