import Promise from './promise';
import {
  default as Enumerator
} from './enumerator';
import {
  tryCatch,
  TRY_CATCH_ERROR,
  REJECTED
} from './-internal';

export class MapEnumerator extends Enumerator {
  constructor(Constructor, entries, mapFn, label) {
    super(Constructor, entries, true, label, mapFn);
  }

  _init(Constructor, input, bool, label, mapFn) {
    let len = input.length || 0;
    this.length     = len;
    this._remaining = len;
    this._result = new Array(len);
    this._mapFn = mapFn;

    this._enumerate(input);
  }

  _setResultAt(state, i, value, firstPass) {
    if (firstPass) {
      let val = tryCatch(this._mapFn)(value, i);
      if (val === TRY_CATCH_ERROR) {
        this._settledAt(REJECTED, i, val.error, false);
      } else {
        this._eachEntry(val, i, false);
      }
    } else {
      this._remaining--;
      this._result[i] = value;
    }
  }

}


/**
 `RSVP.map` is similar to JavaScript's native `map` method. `mapFn` is eagerly called
  meaning that as soon as any promise resolves its value will be passed to `mapFn`.
  `RSVP.map` returns a promise that will become fulfilled with the result of running
  `mapFn` on the values the promises become fulfilled with.

  For example:

  ```javascript

  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.resolve(2);
  let promise3 = RSVP.resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  let mapFn = function(item){
    return item + 1;
  };

  RSVP.map(promises, mapFn).then(function(result){
    // result is [ 2, 3, 4 ]
  });
  ```

  If any of the `promises` given to `RSVP.map` are rejected, the first promise
  that is rejected will be given as an argument to the returned promise's
  rejection handler. For example:

  ```javascript
  let promise1 = RSVP.resolve(1);
  let promise2 = RSVP.reject(new Error('2'));
  let promise3 = RSVP.reject(new Error('3'));
  let promises = [ promise1, promise2, promise3 ];

  let mapFn = function(item){
    return item + 1;
  };

  RSVP.map(promises, mapFn).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === '2'
  });
  ```

  `RSVP.map` will also wait if a promise is returned from `mapFn`. For example,
  say you want to get all comments from a set of blog posts, but you need
  the blog posts first because they contain a url to those comments.

  ```javscript

  let mapFn = function(blogPost){
    // getComments does some ajax and returns an RSVP.Promise that is fulfilled
    // with some comments data
    return getComments(blogPost.comments_url);
  };

  // getBlogPosts does some ajax and returns an RSVP.Promise that is fulfilled
  // with some blog post data
  RSVP.map(getBlogPosts(), mapFn).then(function(comments){
    // comments is the result of asking the server for the comments
    // of all blog posts returned from getBlogPosts()
  });
  ```

  @method map
  @static
  @for RSVP
  @param {Array} promises
  @param {Function} mapFn function to be called on each fulfilled promise.
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled with the result of calling
  `mapFn` on each fulfilled promise or value when they become fulfilled.
   The promise will be rejected if any of the given `promises` become rejected.
  @static
*/
export default function map(promises, mapFn, label) {
  if (!Array.isArray(promises)) {
    return Promise.reject(new TypeError("RSVP.map must be called with an array"), label);
  }

  if (typeof mapFn !== 'function') {
    return Promise.reject(new TypeError("RSVP.map expects a function as a second argument"), label);
  }

  return new MapEnumerator(Promise, promises, mapFn, label).promise;
}
