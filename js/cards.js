const BASIC_ATTACK_ID = 1;
const STUNNED_ID = 2;
var cards_data = [
  // index 0 is special
  {id: 0,
   name: "Basic Attack",
   text: "Perform an attack with 100% physical power.",
   mana_cost: 0,
   abilities: [ ['attack_percent', 100] ]
  },
  
  // index 1 is special
  {id: 1,
   name: "Stunned",
   text: "Stunned! Can't move!",
   mana_cost: 0,
   abilities: [ ['nothing'] ]
  },
  
  {id: 2,
   name: "Power Strike",
   text: "Perform an attack with 133% physical power.",
   mana_cost: 0,
   abilities: [ ['attack_percent', 133] ]
  },
  
  {id: 3,
   name: "Carrot Tackle",
   text: "Perform an attack with 133% physical power.",
   mana_cost: 0,
   abilities: [ ['attack_percent', 133] ]
  },
];
