import Enumerator from './enumerator';
import {
  PENDING
} from './-internal';
import {
  o_create
} from './utils';

function PromiseHash(object, label) {
  this._superConstructor(object, true, label);
}

export default PromiseHash;

PromiseHash.prototype = o_create(Enumerator.prototype);
PromiseHash.prototype._superConstructor = Enumerator;
PromiseHash.prototype._init = function() {
  this._result = {};
};

PromiseHash.prototype._validateInput = function(input) {
  return input && typeof input === 'object';
};

PromiseHash.prototype._validationError = function() {
  return new Error('Promise.hash must be called with an object');
};

PromiseHash.prototype._enumerate = function(input) {
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
};
