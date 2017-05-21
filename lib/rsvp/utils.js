export function objectOrFunction(x) {
  return typeof x === 'function' || (typeof x === 'object' && x !== null);
}

export function isFunction(x) {
  return typeof x === 'function';
}

export function isObject(x) {
  return x !== null && typeof x === 'object';
}

export function isMaybeThenable(x) {
  return typeof x === 'object' && x !== null;
}

let _isArray;
if (!Array.isArray) {
  _isArray = x => Object.prototype.toString.call(x) === '[object Array]';
} else {
  _isArray = Array.isArray;
}

export let isArray = _isArray;

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
export let now = Date.now || (() => new Date().getTime());
