/* global toString */

import { Promise } from "./promise";
import { isArray, isFunction } from "./utils";

/**
  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The return promise
  is fulfilled with an array that gives all the values in the order they were
  passed in the `promises` array argument.

  For example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `RSVP.all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.reject(new Error("2"));
  var promise3 = RSVP.reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  `RSVP.all` can also take a promise as its `promises` argument as long as
  the promise is fulfilled with an array.

  ```javascript
  var array = [1];
  var promise = RSVP.resolve(array);

  RSVP.all(promise).then(function(result){
    // result is [1]
  });
  ```

  However, if the promise passed is fulfilled with something other than an
  array, the return promise will be rejected with a `TypeError`.

  ```javascript
  var notArray = { type: 'robot' };
  var promise = RSVP.resolve(notArray);

  RSVP.all(promise).then(function(result){
    // Code here never runs because there are rejected promises!
  }, function(reason){
    reason.message === 'You must pass an array to all';
  });
  ```

  @method all
  @for RSVP
  @param {Array|Promise} promises array of promises to observe or a promise
  that is fulfilled with an array.
  @param {String} label
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected. If a promise was
  passed as the `promises` argument, and it is not resolved with an array,
  the promise will be rejected with a TypeError as its reason.
*/
function all(promises, label) {
  if (typeof promises === 'object' && isFunction(promises.then)){
    return promises.then(function(result){
      return all(result, label);
    });
  } else if (!isArray(promises)) {
    throw new TypeError('You must pass an array to all.');
  }

  return new Promise(function(resolve, reject) {
    var results = [], remaining = promises.length,
    promise;

    if (remaining === 0) {
      resolve([]);
    }

    function resolver(index) {
      return function(value) {
        resolveAll(index, value);
      };
    }

    function resolveAll(index, value) {
      results[index] = value;
      if (--remaining === 0) {
        resolve(results);
      }
    }

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && isFunction(promise.then)) {
        promise.then(resolver(i), reject, "RSVP: RSVP#all");
      } else {
        resolveAll(i, promise);
      }
    }
  }, label);
}

export { all };
