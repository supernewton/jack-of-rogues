var RNG_MAP_GEN = 0;
var RNG_ITEM_GEN = 1;
var RNG_COMBAT = 2;
var RNG_SHUFFLER = 3;
var RNG_MISC = 4;
var NUM_RNGS = 5;
///////////////////////////// Game math /////////////////////////////////////////
function damage_vs_defense(raw_dmg, def) {
  if (raw_dmg <= 0) return 0;
  if (def < 0) def = 0;
  return Math.ceil(raw_dmg - raw_dmg*(def/(raw_dmg+def)));
}
function reduce_by_percent(raw, percent) {
  var reduction = Math.floor(raw * percent / 100);
  return raw - reduction;
}
function apply_percent(raw, percent) {
  if (percent > 100) {
    return Math.floor(raw * percent / 100);
  } else {
    return Math.ceil(raw * percent / 100);
  }
}

////////////////////////////// Main game class /////////////////////////////////////
Game = function() {
  this.rngPool = new RNGPool();
  this.rngPool.makeNRNGs(NUM_RNGS);
  this.battle = []
  this.currentTarget = 0;
  this.playerChar = {name: "You", is_player: true, number: -1,
                     max_hp: 100, max_mp: 100, hp: 100, mp: 100,
                     str: 10, mag: 10, def: 10, mdef: 10,
                     cur_str: 10, cur_mag: 10, cur_def: 10, cur_mdef: 10,
                     min_dmg: 1, max_dmg: 8, min_mag_dmg: 0, max_mag_dmg: 8,
                     status: []};
  this.animationQueue = [];
  this.waitingForAnimation = false;
}

Game.prototype.queueAnimation = function(type, params, delay) {
  /**
   * Add an animation to the end of the queue, to be performed
   * type - a string
   * params - an array
   * delay - an int, in milliseconds
   */
  this.animationQueue.push([type, params, delay]);
  if (!this.waitingForAnimation) {
    this.performNextAnimation();
  }
}
Game.prototype.stackAnimation = function(type, params, delay) {
  /**
   * Same as queueAnimation, but the new animation cuts in front of the others.
   */
  this.animationQueue.shift([type, params, delay]);
  if (!this.waitingForAnimation) {
    this.performNextAnimation();
  }
}
Game.prototype.performNextAnimation = function() {
  this.waitingForAnimation = false;
  if (this.animationQueue.length == 0) {
    enable_cards();
    return;
  }
  var loop = true;
  while (loop) {
    loop = false;
    var animation = this.animationQueue.shift();
    if (animation.length != 3) {
      error('Bad animation data! ' + animation);
      return;
    }
    var type = animation[0];
    var params = animation[1];
    var delay = animation[2];
    switch (type) {
      case 'nothing':
        break;
      case 'hp':
        update_hp(params[0], params[1], params[2]);
        break;
      case 'mp':
        update_mp(params[0], params[1], params[2]);
        break;
      case 'status':
        update_status(params[0], params[1]);
        break;
      case 'fade_out_enemy':
        fade_out_enemy(params[0]);
        break;
      case 'add_history':
        add_history(params[0]);
        break;
      case 'append_history':
        append_history(params[0]);
        break;
      default:
        warn('unimplemented animation type: ' + type);
        break;
    }
    if (this.animationQueue.length > 0 && delay == 0) {
      loop = true;
    }
    if (delay > 0) {
      this.waitingForAnimation = true;
      disable_cards();
      setTimeout(do_next_animation, delay);
    }
  }
}
function do_next_animation() {
  game.performNextAnimation();
}

Game.prototype.switchTarget = function(number) {
  this.currentTarget = number;
  switch_target_display(number);
}
Game.prototype.startBattle = function(enemy_ids) {
  this.battle = [];
  var css_class = enemy_css_class(enemy_ids.length);
  var html = '';
  for (var i = 0; i < enemy_ids.length; i++) {
    var enemy = make_enemy(enemy_ids[i], i, get_name_num(enemy_ids, i))
    this.battle.push(enemy);
    html += enemy_html(enemy, css_class);
  }
  $('#mainArea').html(html);
  $('#statusPanel').html(player_html(this.playerChar));
  
  if (enemy_ids.length == 3) {
    this.switchTarget(1);
  } else {
    this.switchTarget(0);
  }
}

Game.prototype.useCard = function(index) {
  if (this.waitingForAnimation) {
    return;
  }
  var card;
  if (index == -1) {
    card = cards_data[0];
  } else {
    card = cards_data[0]; // TO be replaced with real index from hand
  }
  if (this.playerChar.mp < card.mana_cost) {
    add_history('You don\'t have enough mana to do that!');
    return;
  }
  // Okay, time to use this card for real.
  this.playerChar.mp -= card.mana_cost;
  update_player_mp(this.playerChar.mp, this.playerChar.max_mp);
  if (index == -1) {
    this.queueAnimation('add_history', ['You attack!'], 0);
  } else {
    this.queueAnimation('add_history', ['You use ' + card.name + '!'], 0);
  }

  for (var i = 0; i < card.abilities.length; i++) {
    var ability = card.abilities[i];
    var cur_enemy = this.battle[this.currentTarget];
    switch (ability[0]) {
      case 'attack_percent':
        this.performPhysicalAttack(this.playerChar, cur_enemy, ability[1]);
        break;
      default:
        warn('Unimplemented ability');
        break;
    }
  }
  
  // Check for dead enemies
  var enemies_alive = [];
  for (var i = 0; i < this.battle.length; i++) {
    if (this.battle[i].hp > 0) {
      enemies_alive.push(i);
    } else {
      if (!this.battle[i].faded) {
        this.battle[i].faded = true;
        this.queueAnimation('fade_out_enemy', [i], 500);
      }
    }
  }
  if (this.battle[this.currentTarget].hp <= 0) {
    var oldTarget = this.currentTarget;
    if (enemies_alive.length > 0) {
      this.switchTarget(enemies_alive[0]);
    }
    hide_target_display(oldTarget);
  }
  for (var i = 0; i < enemies_alive.length; i++) {
    // this.battle[enemies_alive[i]] fights...
  }
}

Game.prototype.performPhysicalAttack = function(from_target, to_target, percent) {
  var raw_dmg = this.rngPool.getInt(RNG_COMBAT, from_target.min_dmg, from_target.max_dmg) + from_target.cur_str;
  raw_dmg = Math.floor(raw_dmg * percent / 100);
  var damage = damage_vs_defense(raw_dmg, to_target.cur_def);
  
  to_target.hp -= damage;
  if (to_target.hp <= 0) {
    to_target.hp = 0;
  }
  this.queueAnimation('hp', [to_target.number, to_target.hp, to_target.max_hp], 0)
  this.queueAnimation('append_history', [damage_string(from_target, to_target, damage, 'physical')], 200);
}

Game.prototype.endBattle = function() {
}

var game = new Game();
game.startBattle([0,0,0]);

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
