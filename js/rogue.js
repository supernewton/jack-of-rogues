const RNG_MAP_GEN = 0;
const RNG_ITEM_GEN = 1;
const RNG_COMBAT = 2;
const RNG_SHUFFLER = 3;
const RNG_MISC = 4;
const NUM_RNGS = 5;
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
  this.playerChar = make_player_char();
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
    update_top_text('It is your turn.');
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
      update_top_text('Please wait...');
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
    var enemy = make_enemy(enemy_ids[i], i, get_name_num(enemy_ids, i));
    this.rngPool.shuffle(RNG_SHUFFLER, enemy.deck);
    for (var j = 0; j < enemy.start_hand_size; j++) {
      
    }
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

Game.prototype.drawCard = function(deck, discard) {
  /**
   * Draws a card from deck, putting it into discard. Returns the card number. Reshuffles discard if necessary.
   */
  if (deck.length == 0) {
    if (discard.length == 0) {
      return -1;
    }
    while (discard.length > 0) {
      deck.push(discard.pop());
    }
    this.rngPool.shuffle(RNG_SHUFFLER, deck);
  }
  var card_pos = deck.pop();
  discard.push(card_pos);
  return card_pos;
}

Game.prototype.resolveCard = function(from_target, to_target, card) {
  for (var i = 0; i < card.abilities.length; i++) {
    var ability = card.abilities[i];
    switch (ability[0]) {
      case 'nothing':
        break;
      case 'attack_percent':
        this.performPhysicalAttack(from_target, to_target, ability[1]);
        break;
      default:
        warn('Unimplemented ability: ' + ability[0]);
        break;
    }
  }
}

Game.prototype.useCard = function(index) {
  /**
   * The player uses a card. Index is the index into the player's hand.
   */
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
  this.queueAnimation('add_history', [use_card_string(this.playerChar, card)], 0);

  this.resolveCard(this.playerChar, this.battle[this.currentTarget], card);
  
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
    this.enemyAction(this.battle[enemies_alive[i]]);
  }
  
  if (this.playerChar.hp <= 0) {
    //  TODO: Death...
  }
}

Game.prototype.enemyAction = function(enemy) {
  switch (enemy.ai) {
    case "simple":
      this.enemyUseCard(enemy, cards_data[0]); // TODO: actual card from hand
      break;
    default:
      warn("Unrecognized enemy AI: " + enemy.ai);
      this.enemyUseCard(enemy, cards_data[0]);
  }
}

Game.prototype.enemyUseCard = function(enemy, card) {
  /**
   * Enemy uses a card. card is a full card data object.
   */
  this.queueAnimation('add_history', [use_card_string(enemy, card)], 0);
  enemy.mp -= card.mana_cost;
  this.queueAnimation('mp', [enemy.number, enemy.mp, enemy.max_mp], 0);

  this.resolveCard(enemy, this.playerChar, card);
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
