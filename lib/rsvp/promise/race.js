/* global toString */

import { isArray, isFunction, isNonThenable } from "../utils";

/**
  @class Promise
  @namespace RSVP
*/

/**
  `RSVP.Promise.race` allows you to watch a series of promises and act as soon as the
  first promise given to the `promises` argument fulfills or rejects.

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

  `RSVP.race` is deterministic in that only the state of the first completed
  promise matters. For example, even if other promises given to the `promises`
  array argument are resolved, but the first completed promise has become
  rejected before the other promises became fulfilled, the returned promise
  will become rejected:

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
    // Code here never runs because there are rejected promises!
  }, function(reason){
    // reason.message === "promise2" because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  @method race
  @param {Array} promises array of promises to observe
  @param {String} label optional string for describing the promise returned.
  Useful for tooling.
  @return {Promise} a promise that becomes fulfilled with the value the first
  completed promises is resolved with if the first completed promise was
  fulfilled, or rejected with the reason that the first completed promise
  was rejected with.
  @static
*/
export default function race(entries, label) {
  if (!isArray(entries)) {
    throw new TypeError('You must pass an array to race.');
  }

  /*jshint validthis:true */
  var Constructor = this, entry;

  return new Constructor(function(resolve, reject) {
    var pending = true;

    function onFulfillment(value) { if (pending) { pending = false; resolve(value); } }
    function onRejection(reason)  { if (pending) { pending = false; reject(reason); } }

    for (var i = 0; i < entries.length; i++) {
      entry = entries[i];
      if (isNonThenable(entry)) {
        pending = false;
        resolve(entry);
        return;
      } else {
        Constructor.cast(entry).then(onFulfillment, onRejection);
      }
    }
  }, label);
};
