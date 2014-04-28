/* global toString */

import {
  isArray,
  isFunction,
  isMaybeThenable
} from "../utils";

/**
  `RSVP.Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 2");
    }, 100);
  });

  RSVP.Promise.race([promise1, promise2]).then(function(result){
    // result === "promise 2" because it was resolved before promise1
    // was resolved.
  });
  ```

  `RSVP.Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error("promise 2"));
    }, 100);
  });

  RSVP.Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === "promise2" because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  RSVP.Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  @param {String} label optional string for describing the promise returned.
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
export default function race(entries, label) {
  /*jshint validthis:true */
  var Constructor = this, entry;

  return new Constructor(function(resolve, reject) {
    if (!isArray(entries)) {
      throw new TypeError('You must pass an array to race.');
    }

    var pending = true;

    function onFulfillment(value) { if (pending) { pending = false; resolve(value); } }
    function onRejection(reason)  { if (pending) { pending = false; reject(reason); } }

    for (var i = 0; i < entries.length; i++) {
      entry = entries[i];
      if (isMaybeThenable(entry)) {
        Constructor.resolve(entry).then(onFulfillment, onRejection);
      } else {
        pending = false;
        resolve(entry);
        return;
      }
    }
  }, label);
};
