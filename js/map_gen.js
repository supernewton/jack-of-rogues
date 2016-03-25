const MAP_WIDTH = 9;
const MAP_HEIGHT = 6;

// Returns an array of 5 values: map, startX, startY, endX, endY
function generate_map(rng_pool) {
  var template = copy_2d_array(templates[0]); // TODO: More templates & select randomly
  if (template.length != MAP_HEIGHT) {
    error("Template has incorrect height!");
    return;
  }
  // Count the 2 and 3's
  var count2 = 0;
  var count3 = 0;
  for (var i = 0; i < template.length; i++) {
    if (template[i].length != MAP_WIDTH) {
      error("Template has incorrect width!");
      return;
    }
    for (var j = 0; j < template[i].length; j++) {
      if (template[i][j] == 2) {
        count2++;
      } else if (template[i][j] == 3) {
        count3++;
      }
    }
  }
  var list2 = [];
  for (var i = 0; i < count2; i++) {
    if (i < Math.ceil(count2 / 2)) {
      list2.push(1);
    } else {
      list2.push(0);
    }
  }
  var list3 = [];
  for (var i = 0; i < count3; i++) {
    if (i < Math.ceil(count3 / 2)) {
      list3.push(1);
    } else {
      list3.push(0);
    }
  }
  rng_pool.shuffle(RNG_MAP_GEN, list2);
  rng_pool.shuffle(RNG_MAP_GEN, list3);
  var startX = 0;
  var startY = 0;
  var endX = 0;
  var endY = 0;
  // TODO: Randomly flip map horizontally and/or vertically
  for (var i = 0; i < template.length; i++) {
    for (var j = 0; j < template[i].length; j++) {
      switch (template[i][j]) {
        case 2:
          if (list2.pop() == 1) {
            template[i][j] = 1;
          } else {
            template[i][j] = 0;
          }
          break;
        case 3:
          if (list3.pop() == 1) {
            template[i][j] = 1;
          } else {
            template[i][j] = 0;
          }
          break;
        case 8:
          startX = j;
          startY = i;
          template[i][j] = 1;
          break;
        case 9:
          endX = j;
          endY = i;
          template[i][j] = 1;
          break;
        default:
          break;
      }
    }
  }
  
  for (var i = 0; i < template.length; i++) {
    for (var j = 0; j < template[i].length; j++) {
      if (template[i][j] == 1) {
        template[i][j] = rng_pool.getInt(RNG_MAP_GEN, 1, 2);
      }
    }
  }
  
  return [template, startX, startY, endX, endY];
}


/*
 * Templates are a 2d array of numbers to guide map generation.
 * Key:
 * 0: Always non-traversable
 * 1: Always traversable
 * 2: Exactly half of 2's will be traversable
 * 3: Same as 2
 * 8: Start
 * 9: End
 */
var templates = [
  [[0, 0, 0, 0, 0, 3, 0, 0, 0],
   [0, 0, 0, 1, 2, 1, 3, 3, 0],
   [0, 3, 1, 1, 2, 1, 1, 9, 0],
   [0, 8, 1, 1, 2, 1, 1, 3, 0],
   [0, 3, 3, 1, 2, 1, 0, 0, 0],
   [0, 0, 0, 3, 0, 0, 0, 0, 0]]
]


var map_events = [
  { id: 0,
    text: "There is nothing else special here." },
  { id: 1,
    text: "This room is basically empty. There are no signs of life here nor any loot worth taking." },
  { id: 2,
    text: "As you enter the room, you are greeted by monsters!",
    choices: [
       { text: "Battle!", effect: "battle" },
       { text: "Other choice! (Also battle)", effect: "battle" }
    ]
  }
  // don't forget comma
];