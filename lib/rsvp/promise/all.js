import {
  isArray,
  isMaybeThenable
} from "../utils";

/**
  `RSVP.Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);
  var promises = [ promise1, promise2, promise3 ];

  RSVP.Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `RSVP.all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.reject(new Error("2"));
  var promise3 = RSVP.reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  RSVP.Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
export default function all(entries, label) {

  /*jshint validthis:true */
  var Constructor = this;

  return new Constructor(function(resolve, reject) {
    if (!isArray(entries)) {
      throw new TypeError('You must pass an array to all.');
    }

    var remaining = entries.length;
    var results = new Array(remaining);
    var entry, pending = true;

    if (remaining === 0) {
      resolve(results);
      return;
    }

    function fulfillmentAt(index) {
      return function(value) {
        results[index] = value;
        if (--remaining === 0) {
          resolve(results);
        }
      };
    }

    function onRejection(reason) {
      remaining = 0;
      reject(reason);
    }

    for (var index = 0; index < entries.length; index++) {
      entry = entries[index];
      if (isMaybeThenable(entry)) {
        Constructor.resolve(entry).then(fulfillmentAt(index), onRejection);
      } else {
        results[index] = entry;
        if (--remaining === 0) {
          resolve(results);
        }
      }
    }
  }, label);
};
