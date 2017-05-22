import Enumerator from './enumerator';
import {
  PENDING,
  FULFILLED,
  fulfill
} from './-internal';

export default class PromiseHash extends Enumerator {
  constructor(Constructor, object, abortOnReject = true, label) {
    super(Constructor, object, abortOnReject, label);
  }

  _init(Constructor, object) {
    this._result = {};

    this._enumerate(object);
    if (this._remaining === 0) {
      fulfill(this.promise, this._result);
    }
  }

  _validateInput(input) {
    return input && typeof input === 'object';
  }

  _validationError() {
    return new Error('Promise.hash must be called with an object');
  }

  _enumerate(input) {
    let enumerator = this;
    let promise    = enumerator.promise;
    let results    = [];

    for (let key in input) {
      if (promise._state === PENDING && Object.prototype.hasOwnProperty.call(input, key)) {
        results.push({
          position: key,
          entry: input[key]
        });
      }
    }

    let length = results.length;
    enumerator._remaining = length;
    let result;

    for (let i = 0; promise._state === PENDING && i < length; i++) {
      result = results[i];
      enumerator._eachEntry(result.entry, result.position);
    }
  }
}
