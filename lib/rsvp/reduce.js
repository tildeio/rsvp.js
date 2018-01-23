import Promise from './promise';
import Enumerator from './enumerator';
import {
  tryCatch,
  TRY_CATCH_ERROR,
  REJECTED
} from './-internal';

/**
 `RSVP.reduce` is similar to JavaScript's native `reduce` method. `RSVP.reduce` returns
  a promise that will become fulfilled with the result of running `reducer` on the
  values the promises become fulfilled with.

  For example:

  ```javascript

  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.resolve(2);
  let promise3 = RSVP.resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  let reducer = function(sum, item){
    return sum + item;
  };

  RSVP.reduce(promises, reducer, 0).then(function(result){
    // result is 6
  });
  ```

  If any of the `promises` given to `RSVP.reduce` are rejected, the first promise
  that is rejected will be given as an argument to the returned promise's
  rejection handler. For example:

  ```javascript
  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.reject(new Error('2'));
  let promise3 = RSVP.reject(new Error('3'));
  let promises = [ promise1, promise2, promise3 ];

  let reducer = function(sum, item){
    return sum + item;
  };

  RSVP.reduce(promises, reducer, 0).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === '2'
  });
  ```

  `RSVP.reduce` will also wait if a promise is returned from `reducer`.

  @method reduce
  @static
  @for RSVP
  @param {Array} promises
  @param {Function} reducer function to be called on each fulfilled promise.
  @param {Any} value to be passed to reducer as initial value
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled with the result of calling
  `reducer` on each fulfilled promise.
   The promise will be rejected if any of the given `promises` become rejected.
  @static
*/

class ReduceEnumerator extends Enumerator {
  constructor(Constructor, entries, reduceFn, initialVal, label) {
    super(Constructor, entries, true, label, reduceFn, initialVal);
  }

  _init(Constructor, input, bool, label, reduceFn, initialVal) {
    let len = input.length || 0;
    this.length     = len;
    this._remaining = len;
    this._queue = [];
    this._reduceFn = reduceFn;

    this._isProcessing = false;
    this._result = initialVal;
    this._enumerate(input);
  }

  _setResultAt(state, i, value, firstPass) {
    if (firstPass) {
      if (this._isProcessing) {
        this._queue.push(val);
      } else {
        this._isProcessing = true;
        let val = tryCatch(this._reduceFn)(this._result, value, i);
        if (val === TRY_CATCH_ERROR) {
          this._settledAt(REJECTED, i, val.error, false);
        } else {
          this._eachEntry(val, i, false);
        }
      }
    } else {
      this._remaining--;
      this._result = value;
      this._isProcessing = false;
      if (this._queue.length > 0) {
        let val = this._queue.pop();
        this._setResultAt(null, null, val, true);
      }
    }
  }
}

export default function reduce(promises, reduceFn, initialVal, label) {
  if (typeof reduceFn !== 'function') {
    return Promise.reject(new TypeError("You must pass a function as map's second argument."));
  }

  return Promise.resolve(initialVal)
    .then((initialVal)=> {
      return new ReduceEnumerator(Promise, promises, reduceFn, initialVal, label).promise;
    });
}
