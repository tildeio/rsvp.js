import { isArray, isNonThenable } from "../utils";

/**
  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The return promise
  is fulfilled with an array that gives all the values in the order they were
  passed in the `promises` array argument.

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
  @for RSVP.Promise
  @param {Array} promises
  @param {String} label
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
*/
export default function all(entries, label) {
  if (!isArray(entries)) {
    throw new TypeError('You must pass an array to all.');
  }

  /*jshint validthis:true */
  var Constructor = this;

  return new Constructor(function(resolve, reject) {
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
      if (isNonThenable(entry)) {
        results[index] = entry;
        if (--remaining === 0) {
          resolve(results);
        }
      } else {
        Constructor.cast(entry).then(fulfillmentAt(index), onRejection);
      }
    }
  }, label);
};
