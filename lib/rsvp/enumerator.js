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

export default class Enumerator {
  constructor(Constructor, input, abortOnReject, label) {
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
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, this._validationError());
    }
  }

  _validateInput(input) {
    return isArray(input);
  }

  _validationError() {
    return new Error('Array Methods must be provided an Array');
  }

  _init() {
    this._result = new Array(this.length);
  }

  _enumerate(input) {
    let length     = this.length;
    let promise    = this.promise;

    for (let i = 0; promise._state === PENDING && i < length; i++) {
      this._eachEntry(input[i], i);
    }
  }

  _settleMaybeThenable(entry, i) {
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

  _eachEntry(entry, i) {
    if (isMaybeThenable(entry)) {
      this._settleMaybeThenable(entry, i);
    } else {
      this._remaining--;
      this._result[i] = this._makeResult(FULFILLED, i, entry);
    }
  }

  _settledAt(state, i, value) {
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

  _makeResult(state, i, value) {
    return value;
  }

  _willSettleAt(promise, i) {
    let enumerator = this;

    subscribe(
      promise, undefined,
      value  => enumerator._settledAt(FULFILLED, i, value),
      reason => enumerator._settledAt(REJECTED,  i, reason)
    );
  }
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
