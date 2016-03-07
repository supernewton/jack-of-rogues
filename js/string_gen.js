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
