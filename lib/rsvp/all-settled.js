import Promise from "./promise";
import {
  isArray,
  isNonThenable
} from "./utils";

/**
  `RSVP.allSettled` is similar to `RSVP.all`, but instead of implementing
  a fail-fast method, it waits until all the promises have returned and
  shows you all the results. This is useful if you want to handle multiple
  promises' failure states together as a set.

  Returns a promise that is fulfilled when all the given promises have been
  settled. The return promise is fulfilled with an array of the states of
  the promises passed into the `promises` array argument.

  Each state object will either indicate fulfillment or rejection, and
  provide the corresponding value or reason. The states will take one of
  the following formats:

  ```javascript
  { state: 'fulfilled', value: value }
    or
  { state: 'rejected', reason: reason }
  ```

  Example:

  ```javascript
  var promise1 = RSVP.Promise.resolve(1);
  var promise2 = RSVP.Promise.reject(new Error('2'));
  var promise3 = RSVP.Promise.reject(new Error('3'));
  var promises = [ promise1, promise2, promise3 ];

  RSVP.allSettled(promises).then(function(array){
    // array == [
    //   { state: 'fulfilled', value: 1 },
    //   { state: 'rejected', reason: Error },
    //   { state: 'rejected', reason: Error }
    // ]
    // Note that for the second item, reason.message will be "2", and for the
    // third item, reason.message will be "3".
  }, function(error) {
    // Not run. (This block would only be called if allSettled had failed,
    // for instance if passed an incorrect argument type.)
  });
  ```

  @method allSettled
  @static
  @for RSVP
  @param {Array} promises
  @param {String} label - optional string that describes the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled with an array of the settled
  states of the constituent promises.
*/

export default function allSettled(entries, label) {
  return new Promise(function(resolve, reject) {
    if (!isArray(entries)) {
      throw new TypeError('You must pass an array to allSettled.');
    }

    var remaining = entries.length;
    var entry;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    var results = new Array(remaining);

    function fulfilledResolver(index) {
      return function(value) {
        resolveAll(index, fulfilled(value));
      };
    }

    function rejectedResolver(index) {
      return function(reason) {
        resolveAll(index, rejected(reason));
      };
    }

    function resolveAll(index, value) {
      results[index] = value;
      if (--remaining === 0) {
        resolve(results);
      }
    }

    for (var index = 0; index < entries.length; index++) {
      entry = entries[index];

      if (isNonThenable(entry)) {
        resolveAll(index, fulfilled(entry));
      } else {
        Promise.resolve(entry).then(fulfilledResolver(index), rejectedResolver(index));
      }
    }
  }, label);
}

function fulfilled(value) {
  return { state: 'fulfilled', value: value };
}

function rejected(reason) {
  return { state: 'rejected', reason: reason };
}

