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

export function setSettledResult(state, i, value) {
  this._remaining--;
  if (state === FULFILLED) {
    this._result[i] = {
      state: 'fulfilled',
      value: value
    };
  } else {
     this._result[i] = {
      state: 'rejected',
      reason: value
    };
  }
}

function Enumerator(Constructor, input, abortOnReject, label) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop, label);
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
    this._eachEntry(input[i], i, true);
  }
};

Enumerator.prototype._settleMaybeThenable = function(entry, i, firstPass) {
  let c = this._instanceConstructor;
  let resolve = c.resolve;

  if (resolve === originalResolve) {
    let then = getThen(entry);

    if (then === originalThen &&
        entry._state !== PENDING) {
      entry._onError = null;
      this._settledAt(entry._state, i, entry._result, firstPass);
    } else if (typeof then !== 'function') {
      this._setResultAt(FULFILLED, i, entry, firstPass);
    } else if (c === Promise) {
      let promise = new c(noop);
      handleMaybeThenable(promise, entry, then);
      this._willSettleAt(promise, i, firstPass);
    } else {
      this._willSettleAt(new c(resolve => resolve(entry)), i, firstPass);
    }
  } else {
    this._willSettleAt(resolve(entry), i, firstPass);
  }
};

Enumerator.prototype._eachEntry = function(entry, i, firstPass) {
  if (isMaybeThenable(entry)) {
    this._settleMaybeThenable(entry, i, firstPass);
  } else {
    this._setResultAt(FULFILLED, i, entry, firstPass);
  }
};

Enumerator.prototype._settledAt = function(state, i, value, firstPass) {
  let promise = this.promise;

  if (promise._state === PENDING) {
    if (this._abortOnReject && state === REJECTED) {
      reject(promise, value);
    } else {
      this._setResultAt(state, i, value, firstPass);
      if (this._remaining === 0) {
        fulfill(promise, this._result);
      }
    }
  }
};

Enumerator.prototype._setResultAt = function(state, i, value, firstPass) {
  this._remaining--;
  this._result[i] = value;
};

Enumerator.prototype._willSettleAt = function(promise, i, firstPass) {
  let enumerator = this;

  subscribe(promise, undefined,
    value  => enumerator._settledAt(FULFILLED, i, value, firstPass),
    reason => enumerator._settledAt(REJECTED,  i, reason, firstPass));
};
