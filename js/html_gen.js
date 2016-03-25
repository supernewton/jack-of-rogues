// Inner html generation
function get_damage_inner_html(from_target, to_target, damage, damage_type) {
  var str = ' ';
  var pronoun;
  if (from_target.is_player) {
    str += 'You deal';
  } else {
    pronoun = from_target.pronoun == undefined ? 'It' : from_target.pronoun;
    str += pronoun + ' deals';
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
      pronoun = to_target.pronoun == undefined ? 'It' : to_target.pronoun;
      str += ' ' + pronoun + ' is slain!';
    }
  }
  return str;
}
function get_player_use_card_inner_html(card) {
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
}
function get_enemy_use_card_inner_html(user, card) {
  switch (card.id) {
    case 0:
      return user.name + ' attacks!'
    case 1:
      return user.name + ' is stunned and can\'t move!';
    default:
      return user.name + ' uses ' + card.name + '!';
  }
}
function get_status_inner_html(status) {
  switch (status[0]) {
    default:
      return status[0];
  }
}

// Utility
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
function card_onclick_code(pos) {
  return 'game.useCard(' + pos + ')';
}

// HTML element generation
function get_enemy_html(enemy, css_class) {
  var img_html = $('<img/>', {src: 'img/' + enemy.img, width: enemy.width, height: enemy.height});
  var name_html = $('<p/>', {class: 'statusLine enemyName', text: enemy.name});
  var hp_html = $('<p/>', {class: 'statusLine enemyHP', text: "HP: " + enemy.hp + '/' + enemy.max_hp});
  var mp_html = $('<p/>', {class: 'statusLine enemyMP', text: "MP: " + enemy.mp + '/' + enemy.max_mp});
  var status_html = $('<p/>', {class: 'statusLine enemyStatus'});
  var target_html = $('<p/>', {class: 'statusLine enemyTarget'});
  target_html.append(get_switch_target_html(enemy.number));

  var enemy_html = $('<div/>', {id: 'enemy' + enemy.number, class: 'enemy ' + css_class});
  enemy_html.append(img_html, name_html, hp_html, mp_html, status_html, target_html);
  return enemy_html;
}

function get_switch_target_html(enemy_number) {
  var onclick_code = 'game.switchTarget(' + enemy_number + ')';
  var a = $('<a/>', {class: 'point', onclick: onclick_code, text: 'Switch target'});
  return a;
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

function map_event_html(map_event) {
  var div_dom = $('<div/>');
  var p_dom = $('<p/>', {text: map_event.text});
  div_dom.append(p_dom);
  
  var choice_a_dom;
  if (map_event.choices == undefined) {
    var choice_p_dom = $('<p/>');
    choice_a_dom = $('<a/>', {text: 'Continue...', onclick: make_map_event_onclick(0), class: 'mapChoice'});
    choice_p_dom.append(choice_a_dom);
    div_dom.append(choice_p_dom);
  } else {
    for (var i = 0; i < map_event.choices.length; i++) {
      var choice_p_dom = $('<p/>');
      choice_a_dom = $('<a/>', {text: map_event.choices[i].text, onclick: make_map_event_onclick(i), class: 'mapChoice'});
      choice_p_dom.append(choice_a_dom);
      div_dom.append(choice_p_dom);
    }
  }
  
  return div_dom;
}
function make_map_event_onclick(i) {
  return 'game.mapChoice(' + i + ')';
}
