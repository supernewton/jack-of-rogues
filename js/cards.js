var cards_data = [
  {id: 0,
   name: "Basic Attack",
   text: "Perform an attack with 100% physical power.",
   abilities: [ ['attack_percent', 100] ]},

  {id: 1,
   name: "Stunned",
   text: "Stunned! Can't move!",
   abilities: [ ['nothing'] ]},
  
  {id: 2,
   name: "Wait",
   text: "Do nothing.",
   abilities: [ ['nothing'] ]},
  
  {id: 3,
   name: "Run",
   text: "Run!",
   fast: true,
   abilities: [ ['run'] ]},
  
  {id: 4,
   name: "Item",
   text: "Use item",
   abilities: [ ['nothing'] ]},
  
  {id: 5,
   name: "Power Strike",
   text: "Perform a physical attack with 133% power.",
   abilities: [ ['attack_percent', 133] ]},
  
  {id: 6,
   name: "Carrot Tackle",
   text: "Perform a physical attack with 133% power.",
   abilities: [ ['attack_percent', 133] ]},
  
  {id: 7,
   name: "Improved Power Strike",
   text: "Perform a physical attack with 166% power.",
   mana_cost: 3,
   abilities: [ ['attack_percent', 166] ]},
];

const BASIC_ATTACK_CARD = cards_data[0];

function get_mana_cost(card) {
  if (card.mana_cost == undefined) {
    return 0;
  } else {
    return card.mana_cost;
  }
}
