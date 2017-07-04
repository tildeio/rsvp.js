import {
  isArray,
  isMaybeThenable
} from './utils';

import {
  noop,
  resolve,
  handleMaybeThenable,
  reject,
  fulfill,
  subscribe,
  FULFILLED,
  REJECTED,
  PENDING,
  getThen
} from './-internal';

import Promise from './promise';
import originalThen from './then';
import originalResolve from './promise/resolve';

export default function Enumerator(Constructor, input, abortOnReject, label) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop, label);
  this._abortOnReject = abortOnReject;

  this._init(...arguments);
}

Enumerator.prototype._init = function(Constructor, input) {
  let len = input.length || 0;
  this.length     = len;
  this._remaining = len;
  this._result = new Array(len);

  this._enumerate(input);
  if (this._remaining === 0) {
    fulfill(this.promise, this._result);
  }
}

Enumerator.prototype._enumerate = function(input) {
  let length     = this.length;
  let promise    = this.promise;

  for (let i = 0; promise._state === PENDING && i < length; i++) {
    this._eachEntry(input[i], i);
  }
}

Enumerator.prototype._settleMaybeThenable = function(entry, i) {
  let c = this._instanceConstructor;
  let resolve = c.resolve;

  if (resolve === originalResolve) {
    let then = getThen(entry);

    if (then === originalThen && entry._state !== PENDING) {
      entry._onError = null;
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof then !== 'function') {
      this._remaining--;
      this._result[i] = this._makeResult(FULFILLED, i, entry);
    } else if (c === Promise) {
      let promise = new c(noop);
      handleMaybeThenable(promise, entry, then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(resolve => resolve(entry)), i);
    }
  } else {
    this._willSettleAt(resolve(entry), i);
  }
}

Enumerator.prototype._eachEntry = function(entry, i) {
  if (isMaybeThenable(entry)) {
    this._settleMaybeThenable(entry, i);
  } else {
    this._remaining--;
    this._result[i] = this._makeResult(FULFILLED, i, entry);
  }
}

Enumerator.prototype._settledAt = function(state, i, value) {
  let promise = this.promise;

  if (promise._state === PENDING) {
    if (this._abortOnReject && state === REJECTED) {
      reject(promise, value);
    } else {
      this._remaining--;
      this._result[i] = this._makeResult(state, i, value);
      if (this._remaining === 0) {
        fulfill(promise, this._result);
      }
    }
  }
}

Enumerator.prototype._makeResult = function(state, i, value) {
  return value;
}

Enumerator.prototype._willSettleAt = function(promise, i) {
  let enumerator = this;

  subscribe(
    promise, undefined,
    value  => enumerator._settledAt(FULFILLED, i, value),
    reason => enumerator._settledAt(REJECTED,  i, reason)
  );
}

export function makeSettledResult(state, position, value) {
  if (state === FULFILLED) {
    return {
      state: 'fulfilled',
      value: value
    };
  } else {
    return {
      state: 'rejected',
      reason: value
    };
  }
}
