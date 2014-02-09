export function objectOrFunction(x) {
  return typeof x === "function" || (typeof x === "object" && x !== null);
}

export function isFunction(x) {
  return typeof x === "function";
}

export function isNonThenable(x) {
  return !objectOrFunction(x);
}

var _isArray;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === "[object Array]";
  };
} else {
  _isArray = Array.isArray;
}

export var isArray = _isArray;

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
export var now = Date.now || function() { return new Date().getTime(); };

export var keysOf = Object.keys || function(object) {
  var result = [];

  for (var prop in object) {
    result.push(prop);
  }

  return result;
};
