/*global RSVP, describe, specify, assert */
describe("RSVP extensions", function() {
  describe("RSVP.PromiseSet", function() {
    specify('it should exist', function() {
      assert(RSVP.PromiseSet);
    });

    specify('fulfilled only after all of the other promises are fulfilled', function(done) {
      var first = new RSVP.Promise();
      var second = new RSVP.Promise();

      setTimeout(function() {
        first.resolve(true);
      }, 0);

      setTimeout(function() {
        second.resolve(true);
      }, 0);

      var promiseSet = new RSVP.PromiseSet([first, second]);

      promiseSet.then(function() {
        assert(first.isResolved);
        assert(second.isResolved);
        done();
      });
    });

    specify('rejected as soon as a promise is rejected', function(done) {
      var first = new RSVP.Promise();
      var second = new RSVP.Promise();

      setTimeout(function() {
        first.reject({});
      }, 0);

      setTimeout(function() {
        second.resolve(true);
      }, 5000);

      var promiseSet = new RSVP.PromiseSet([first, second]);

      promiseSet.then(function() {
        assert(false);
      }, function() {
        assert(first.isRejected);
        assert(!second.isResolved);
        done();
      });
    });

    specify('passes the resolved values of each promise to the callback in the correct order', function(done) {
      var first = new RSVP.Promise();
      var second = new RSVP.Promise();
      var third = new RSVP.Promise();

      third.resolve(3);
      first.resolve(1);
      second.resolve(2);

      var promiseSet = new RSVP.PromiseSet([first, second, third]);

      promiseSet.then(function(results) {
        assert(results.length === 3);
        assert(results[0] === 1);
        assert(results[1] === 2);
        assert(results[2] === 3);
        done();
      });
    });

    specify('resolves an empty array passed to RSVP.all()', function(done) {
      var promiseSet = new RSVP.PromiseSet([]);

      promiseSet.then(function(results) {
        assert(results.length === 0);
        done();
      });
    });
  });
});
