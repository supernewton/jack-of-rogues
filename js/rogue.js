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
  this.animationQueue = [];
  this.waitingForAnimation = false;
  this.state = "explore";
  
  // Battle related game state
  this.battle = []
  this.currentTarget = 0;
  this.playerChar = make_player_char();
  
  // Exploration related game state
  this.map = [];
  this.playerX = 0;
  this.playerY = 0;
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
        // params: enemy_number (-1 for player char), hp, max_hp
        update_hp(params[0], params[1], params[2]);
        break;
      case 'mp':
        // params: enemy_number (-1 for player char), mp, max_mp
        update_mp(params[0], params[1], params[2]);
        break;
      case 'status':
        // params: enemy_number (-1 for player char), statuses
        update_status(params[0], params[1]);
        break;
      case 'fade_out_enemy':
        // params: enemy_number
        fade_out_enemy(params[0]);
        break;
      case 'add_history':
        // params: html
        add_history(params[0]);
        break;
      case 'append_history':
        // params: html
        append_history(params[0]);
        break;
      case 'add_player_card':
        // params: card_dom
        $('#cards').append(params[0]);
        break;
      default:
        warn('Unimplemented animation type: ' + type);
        break;
    }
    if (delay == 0) {
      if (this.animationQueue.length > 0) {
        loop = true;
      } else {
        enable_cards();
        update_top_text('It is your turn.');
      }
    } else {
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

Game.prototype.startBattle = function(enemy_ids) {
  this.state = "battle";
  this.battle = [];
  var css_class = enemy_css_class(enemy_ids.length);
  var html = '';
  for (var i = 0; i < enemy_ids.length; i++) {
    var enemy = make_enemy(enemy_ids[i], i, get_name_num(enemy_ids, i));
    this.rngPool.shuffle(RNG_SHUFFLER, enemy.deck);
    for (var j = 0; j < enemy.start_hand_size; j++) {
      var card_num = this.drawCard(enemy.deck, enemy.discard);
      enemy.hand.push(cards_data[card_num]);
    }
    this.battle.push(enemy);
    $('#battleArea').append(get_enemy_html(enemy, css_class));
  }
  
  this.playerChar.mp = this.playerChar.max_mp;
  this.playerChar.status = [];
  this.playerChar.deck = copy_array(this.playerChar.decklist);
  this.rngPool.shuffle(RNG_SHUFFLER, this.playerChar.deck);
  for (var i = 0; i < this.playerChar.start_hand_size; i++) {
    this.playerDrawCard();
  }
  update_hp(-1, this.playerChar.hp, this.playerChar.max_hp);
  update_mp(-1, this.playerChar.mp, this.playerChar.max_mp);
  
  if (enemy_ids.length == 3) {
    this.switchTarget(1);
  } else {
    this.switchTarget(0);
  }
  
  display_battle_mode();
}
Game.prototype.switchTarget = function(number) {
  this.currentTarget = number;
  switch_target_display(number);
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
  var card_num = deck.pop();
  return card_num;
}

Game.prototype.playerDrawCard = function() {
  var card_number = this.drawCard(this.playerChar.deck, this.playerChar.discard);
  var number = this.playerChar.hand.length;
  this.playerChar.hand.push(cards_data[card_number]);
  var card_dom = card_html(cards_data[card_number], number);
  this.queueAnimation('add_player_card', [card_dom], 0);
}
Game.prototype.playerRemoveCard = function(index) {
  this.playerChar.discard.push(this.playerChar.hand[index].id);
  fade_out_card(index, this.playerChar.hand.length);
  this.playerChar.hand.splice(index, 1);
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
   * This is the main entry point to resolve a turn.
   */
  // Player's UI should be disabled during animation, but still don't do anything if this gets called somehow
  if (this.waitingForAnimation) {
    return;
  }
  var card;
  if (index == -1) {
    card = cards_data[0];
  } else if (index == -2) {
    card = cards_data[1];
  } else if (index == -3) {
    card = cards_data[2];
  } else {
    if (index < 0 || index >= this.playerChar.hand.length) {
      error("Card index out of bounds!");
      return;
    }
    card = this.playerChar.hand[index];
  }
  var mana_cost = card.mana_cost == undefined ? 0 : card.mana_cost;
  // Check mana requirements before doing anything else.
  if (this.playerChar.mp < mana_cost) {
    add_history('You don\'t have enough mana to do that!');
    return;
  }
  // Okay, time to use this card for real.
  if (index >= 0) {
    this.playerRemoveCard(index);
  }
  this.playerChar.mp -= mana_cost;
  update_player_mp(this.playerChar.mp, this.playerChar.max_mp);
  this.queueAnimation('add_history', [get_player_use_card_inner_html(card)], 0);
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
  // Switch target if current target is dead
  if (this.battle[this.currentTarget].hp <= 0) {
    var oldTarget = this.currentTarget;
    if (enemies_alive.length > 0) {
      this.switchTarget(enemies_alive[0]);
    }
    hide_target_display(oldTarget);
  }
  // Still alive enemies perform actions
  for (var i = 0; i < enemies_alive.length; i++) {
    this.enemyAction(this.battle[enemies_alive[i]]);
  }
  // Check player death
  if (this.playerChar.hp <= 0) {
    show_dark_box("You are dead!");
    // TODO: death...
  }
  if (enemies_alive.length == 0) {
    this.endBattle();
  }
  // End of turn
  this.playerDrawCard();
}

Game.prototype.enemyAction = function(enemy) {
  var card_num = this.drawCard(enemy.deck, enemy.discard);
  enemy.hand.push(cards_data[card_num]);
  var card;
  switch (enemy.ai) {
    case "simple":
      // Use cards randomly
      var candidate_indices = [];
      for (var i = 0; i < enemy.hand.length; i++) {
        if (get_mana_cost(enemy.hand[i]) <= enemy.mp) {
          candidate_indices.push(i);
        }
      }
      if (candidate_indices.length == 0) {
        card = BASIC_ATTACK_CARD;
      } else if (candidate_indices.length == 1) {
        var idx = candidate_indices[0];
        card = enemy.hand[idx];
        enemy.hand.splice(idx, 1);
      } else {
        var idx = this.rngPool.chooseOne(RNG_COMBAT, candidate_indices);
        card = enemy.hand[idx];
        enemy.hand.splice(idx, 1);
      }
      this.enemyUseCard(enemy, card);
      break;
    default:
      warn("Unrecognized enemy AI: " + enemy.ai);
      this.enemyUseCard(enemy, BASIC_ATTACK_CARD);
  }
}
Game.prototype.enemyUseCard = function(enemy, card) {
  /**
   * Enemy uses a card. card is a full card data object.
   */
  this.queueAnimation('add_history', [get_enemy_use_card_inner_html(enemy, card)], 0);
  enemy.mp -= get_mana_cost(card);
  this.queueAnimation('mp', [enemy.number, enemy.mp, enemy.max_mp], 0);
  this.resolveCard(enemy, this.playerChar, card);
  enemy.discard.push(card.id);
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
  this.queueAnimation('append_history', [get_damage_inner_html(from_target, to_target, damage, 'physical')], 200);
}

Game.prototype.endBattle = function() {
  show_dark_box('You win!');
}

Game.prototype.clickMapCell = function(x, y) {
  // Note: Origin is top left, positive y goes downwards
  move_map_player(x, y);
  playerX = x;
  playerY = y;

}

var game = new Game();
initialize_map_divs();