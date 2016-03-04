// Logging mechanism
var SEV_ERROR = 0;
var SEV_WARNING = 1;
var SEV_INFO = 2;
function log(msg, severity) {
  switch (severity) {
    case SEV_ERROR: console.error(msg); break;
    case SEV_WARNING: console.warn(msg); break;
    case SEV_INFO: console.log(msg); break;
  }
}
function error(msg) { log(msg, SEV_ERROR); }
function warn(msg) { log(msg, SEV_WARNING); }
function info(msg) { log(msg, SEV_INFO); }

// Base64 encode for seed display
function base64enc(int6) {
  if (int6 < 26) {
    return String.fromCharCode(65+int6);
  } else if (int6 < 52) {
    return String.fromCharCode(97+int6-26);
  } else if (int6 < 62) {
    return String.fromCharCode(48+int6-52);
  } else if (int6 == 62) {
    return '-';
  } else {
    return '+';
  }
}
function base64enc24(int24) {
  var next = 0;
  var str = "";
  for (var i=0; i<4; i++) {
     next = int24 % 64;
     int24 = Math.floor(int24/64);
     str += base64enc(next);
  }
  return str;
}

