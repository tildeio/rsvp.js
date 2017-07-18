export function objectOrFunction(x) {
  let type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

export function isFunction(x) {
  return typeof x === 'function';
}

export function isObject(x) {
  return x !== null && typeof x === 'object';
}

export function isMaybeThenable(x) {
  return x !== null && typeof x === 'object';
}
