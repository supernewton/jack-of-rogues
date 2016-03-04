// RNG parameters
var RNG_R = 24;
var RNG_S = 10;
var RNG_M = 16777216;
if (RNG_R <= RNG_S) { error("Illegal RNG parameters"); }
// PRNG mechanisms.
function lcg_step(x) {
  return (x*69069+1) % RNG_M;
}
RNG = function(seeds) {
  // implements subtract-with-carry. See: https://en.wikipedia.org/wiki/Subtract_with_carry
  // seeds should be an array of numbers of length RNG_R.
  if (seeds.length < RNG_R) {
    warn("Too few seeds passed to RNG (expected " + RNG_R + "): " + seeds.length);
    for (var i = seeds.length; i < RNG_R; i++) {
      seeds.push(i*i);
    }
  }
  if (seeds.length > RNG_R) {
    warn("Too many seeds passed to RNG, truncating");
    seeds.splice(24);
  }
  // internal RNG state
  this.x = seeds.slice();
  this.c = 0;
}
RNG.prototype.getNext = function() {
  // return a random int between 0 and 2^24-1, inclusive
  var next = this.x[RNG_S - 1] - this.x[RNG_R - 1] - this.c;
  if (next < 0) {
    this.c = 1;
    next += RNG_M;
  } else {
    this.c = 0;
  }
  this.x.unshift(next);
  this.x.pop();
  return next;
}
RNG.prototype.getInt = function(min, max) {
  // return a random int between min and max, inclusive
  if (max == min) return min;
  if (max < min) { warn("RNG.getInt() called with max < min"); return min; }
  var range = max-min+1;
  var next = this.getNext();
  return min + (next%range); // yeah, there's some bias, but no one's going to notice ~1/2^24
}
RNGPool = function() {
  this.rngs = []
  var d = new Date();
  var t = d.getTime();
  this.seed1 = t % RNG_M;
  this.seed2 = (Math.floor(t / 65536)) % RNG_M;
  this.seed1 = lcg_step(this.seed1);
  this.seed2 = lcg_step(this.seed2);
}
RNGPool.prototype.setSeed = function(seed1, seed2) {
  this.seed1 = seed1;
  this.seed2 = seed2;
}
RNGPool.prototype.makeRNG = function() {
  var seeds = new Array(RNG_R);
  var id = this.rngs.length;
  var next1 = this.seed1 + id;
  var next2 = this.seed2 + id;
  // seed initial values using a LCG
  var half_rng_r = Math.ceil(RNG_R/2);
  for (var i = 0; i < half_rng_r; i++) {
    next1 = lcg_step(next1);
    seeds[i] = next1;
    if (i + half_rng_r < RNG_R) {
      next2 = lcg_step(next2);
      seeds[i+half_rng_r] = next2;
    }
  }
  var rng = new RNG(seeds);
  this.rngs.push(rng);
}
RNGPool.prototype.makeNRNGs = function(n) {
  for (var i=0; i<n; i++) {
    this.makeRNG();
  }
}
RNGPool.prototype.getInt = function(id, min, max) {
  if (id < this.rngs.length) {
    return this.rngs[id].getInt(min, max);
  } else {
    error("Tried to call non-existent RNG!");
    return min;
  }
}
RNGPool.prototype.shuffle = function(id, list) {
  // modifies list in place
  if (id < this.rngs.length) {
    for (var i = 0; i < list.length - 1; i++) {
      var k = this.getInt(id, i, list.length - 1);
      var swap = list[i];
      list[i] = list[k];
      list[k] = swap;
    }
  } else {
    error("Called shuffle with non-existent RNG");
  }
}
