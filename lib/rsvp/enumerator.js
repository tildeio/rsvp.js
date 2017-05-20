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

function Enumerator(input, abortOnReject, label) {
  this.promise = new Promise(noop, label);
  this._abortOnReject = abortOnReject;

  if (this._validateInput(input)) {
    this.length     = input.length;
    this._remaining = input.length;

    this._init();

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate(input);
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    reject(this.promise, this._validationError());
  }
}

export default Enumerator;

Enumerator.prototype._validateInput = function(input) {
  return isArray(input);
};

Enumerator.prototype._validationError = function() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._init = function() {
  this._result = new Array(this.length);
};

Enumerator.prototype._enumerate = function(input) {
  let length     = this.length;
  let promise    = this.promise;

  for (let i = 0; promise._state === PENDING && i < length; i++) {
    this._eachEntry(input[i], i);
  }
};

Enumerator.prototype._settleMaybeThenable = function(entry, i) {
  let resolve = Promise.resolve;

  if (resolve === originalResolve) {
    let then = getThen(entry);

    if (then === originalThen &&
        entry._state !== PENDING) {
      entry._onError = null;
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof then !== 'function') {
      this._remaining--;
      this._result[i] = this._makeResult(FULFILLED, i, entry);
    } else {
      let promise = new Promise(noop);
      handleMaybeThenable(promise, entry, then);
      this._willSettleAt(promise, i);
    }
  } else {
    this._willSettleAt(resolve(entry), i);
  }
};

Enumerator.prototype._eachEntry = function(entry, i) {
  if (isMaybeThenable(entry)) {
    this._settleMaybeThenable(entry, i);
  } else {
    this._remaining--;
    this._result[i] = this._makeResult(FULFILLED, i, entry);
  }
};

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
};

Enumerator.prototype._makeResult = function(state, i, value) {
  return value;
};

Enumerator.prototype._willSettleAt = function(promise, i) {
  let enumerator = this;

  subscribe(promise, undefined,
    value  => enumerator._settledAt(FULFILLED, i, value),
    reason => enumerator._settledAt(REJECTED,  i, reason));
};
