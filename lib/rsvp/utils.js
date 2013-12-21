export function objectOrFunction(x) {
  return isFunction(x) || (typeof x === "object" && x !== null);
}

export function isFunction(x) {
  return typeof x === "function";
}

export function isNonThenable(x) {
  return !(objectOrFunction(x) && typeof x.then === 'function');
}

export function isArray(x) {
  return Object.prototype.toString.call(x) === "[object Array]";
}

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
var now = Date.now || function() { return new Date().getTime(); };

export var keysOf = Object.keys || function(object) {
  var result = [];

  for (var prop in object) {
    result.push(prop);
  }

  return result;
};



export { now, keysOf };
