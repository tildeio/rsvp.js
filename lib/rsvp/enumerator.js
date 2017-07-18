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

import ownThen from './then';

export default class Enumerator {
  constructor(Constructor, input, abortOnReject, label) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop, label);
    this._abortOnReject = abortOnReject;

    this._init(...arguments);
  }

  _init(Constructor, input) {
    let len = input.length || 0;
    this.length     = len;
    this._remaining = len;
    this._result = new Array(len);

    this._enumerate(input);
    if (this._remaining === 0) {
      fulfill(this.promise, this._result);
    }
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

    let then = getThen(entry);
    if (then === ownThen && entry._state !== PENDING) {
      entry._onError = null;
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof then !== 'function') {
      this._remaining--;
      this._result[i] = this._makeResult(FULFILLED, i, entry);
    } else {
      this._willSettleAt(c.resolve(entry), i);
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
