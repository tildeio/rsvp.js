import Promise from './promise';
import {
  default as Enumerator,
  setSettledResult
} from './enumerator';
import {
  o_create,
  isFunction,
  isArray
} from './utils';
import {
  tryCatch,
  TRY_CATCH_ERROR,
  REJECTED
} from './-internal';

function FilterEnumerator(Constructor, entries, filterFn, label) {
  this._filterFn = filterFn;
  this._superConstructor(Constructor, entries, true, label);
}

FilterEnumerator.prototype = o_create(Enumerator.prototype);
FilterEnumerator.prototype._init = function() {
  this._tempResult = new Array(this.length);
  this._result = new Array();
};
FilterEnumerator.prototype._superConstructor = Enumerator;
FilterEnumerator.prototype._setResultAt = function(state, i, value, firstPass) {
  if (firstPass) {
    this._tempResult[i] = value;
    let val = tryCatch(this._filterFn)(value, i);
    if (val === TRY_CATCH_ERROR) {
      this._settledAt(REJECTED, i, val.error, false);
    } else {
      this._eachEntry(val, i, false);
    }
  } else {
    this._remaining--;
    if (value === true) {
      this._result.push(this._tempResult[i]);
    }
    this._tempResult[i] = null;
  }
}


/**
 `RSVP.filter` is similar to JavaScript's native `filter` method, except that it
  waits for all promises to become fulfilled before running the `filterFn` on
  each item in given to `promises`. `RSVP.filter` returns a promise that will
  become fulfilled with the result of running `filterFn` on the values the
  promises become fulfilled with.

  For example:

  ```javascript

  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.resolve(2);
  let promise3 = RSVP.resolve(3);

  let promises = [promise1, promise2, promise3];

  let filterFn = function(item){
    return item > 1;
  };

  RSVP.filter(promises, filterFn).then(function(result){
    // result is [ 2, 3 ]
  });
  ```

  If any of the `promises` given to `RSVP.filter` are rejected, the first promise
  that is rejected will be given as an argument to the returned promise's
  rejection handler. For example:

  ```javascript
  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.reject(new Error('2'));
  let promise3 = RSVP.reject(new Error('3'));
  let promises = [ promise1, promise2, promise3 ];

  let filterFn = function(item){
    return item > 1;
  };

  RSVP.filter(promises, filterFn).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === '2'
  });
  ```

  `RSVP.filter` will also wait for any promises returned from `filterFn`.
  For instance, you may want to fetch a list of users then return a subset
  of those users based on some asynchronous operation:

  ```javascript

  let alice = { name: 'alice' };
  let bob   = { name: 'bob' };
  let users = [ alice, bob ];

  let promises = users.map(function(user){
    return RSVP.resolve(user);
  });

  let filterFn = function(user){
    // Here, Alice has permissions to create a blog post, but Bob does not.
    return getPrivilegesForUser(user).then(function(privs){
      return privs.can_create_blog_post === true;
    });
  };
  RSVP.filter(promises, filterFn).then(function(users){
    // true, because the server told us only Alice can create a blog post.
    users.length === 1;
    // false, because Alice is the only user present in `users`
    users[0] === bob;
  });
  ```

  @method filter
  @static
  @for RSVP
  @param {Array} promises
  @param {Function} filterFn - function to be called on each resolved value to
  filter the final results.
  @param {String} label optional string describing the promise. Useful for
  tooling.
  @return {Promise}
*/


export default function filter(promises, filterFn, label) {
  if (!isFunction(filterFn)) {
    return Promise.reject(new TypeError("You must pass a function as filter's second argument."), label);
  }

  return Promise.resolve(promises, label)
    .then(function(promises) {
      return new FilterEnumerator(Promise, promises, filterFn, label).promise;
    })
}
