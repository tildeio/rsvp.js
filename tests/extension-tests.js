/*global RSVP, describe, specify, assert */
describe("RSVP extensions", function() {
  function isPromise(value) {
    return value && typeof value.then === 'function';
  }

  describe('RSVP.resolve', function() {
    it('exists', function() {
      assert(RSVP.resolve);
    });

    it('returns a resolved promise for a value', function(done) {
      var value = new Object();

      RSVP.resolve(value).then(function(arg) {
        assert(arg === value);
        done();
      });
    });
  });

  describe('RSVP.reject', function() {
    it('exists', function() {
      assert(RSVP.reject);
    });

    it('returns a rejected promise for a value', function(done) {
      var value = new Object();

      RSVP.reject(value).then(function() {
        assert(false);
      }, function (arg) {
        assert(arg === value);
        done();
      });
    });
  });

  describe('RSVP.when', function() {
    it('exists', function() {
      assert(RSVP.when);
    });

    describe('when given a value', function() {
      it('returns a promise', function() {
        var value = new Object();
        assert(isPromise(RSVP.when(value)));
      });

      it('calls the success handler with that value', function(done) {
        var value = new Object();

        RSVP.when(value, function(arg) {
          assert(arg === value);
          done();
        });
      });
    });

    describe('when given a resolved promise', function() {
      it('returns a promise', function() {
        var promise = new RSVP.Promise();
        promise.resolve(1);
        var returnValue = RSVP.when(promise);
        assert(returnValue);
        assert(isPromise(returnValue));
      });

      it('calls the success handler with the resolved value of that promise', function(done) {
        var promise = new RSVP.Promise();
        var value = new Object();
        promise.resolve(value);

        RSVP.when(promise, function (arg) {
          assert(arg === value);
          done();
        });
      });
    });

    describe('when given a rejected promise', function() {
      it('returns a promise', function() {
        var promise = new RSVP.Promise();
        promise.reject(1);
        var returnValue = RSVP.when(promise);
        assert(returnValue);
        assert(isPromise(returnValue));
      });

      it('calls the rejection handler with the value of that promise', function(done) {
        var promise = new RSVP.Promise();
        var value = new Object();
        promise.resolve(value);

        RSVP.when(promise, function (arg) {
          assert(arg === value);
          done();
        });
      });
    });
  });

  describe("RSVP.all", function() {
    specify('it should exist', function() {
      assert(RSVP.all);
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

      RSVP.all([first, second]).then(function() {
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

      RSVP.all([first, second]).then(function() {
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

      RSVP.all([first, second, third]).then(function(results) {
        assert(results.length === 3);
        assert(results[0] === 1);
        assert(results[1] === 2);
        assert(results[2] === 3);
        done();
      });
    });

    describe('when given an array of values and promises', function() {
      it('resolves with all values in the correct order', function(done) {
        var first = new RSVP.Promise();
        var second = new RSVP.Promise();
        var third = 3;

        second.resolve(2);
        first.resolve(1);

        RSVP.all([first, second, third]).then(function(results) {
          assert(results.length === 3);
          assert(results[0] === 1);
          assert(results[1] === 2);
          assert(results[2] === 3);
          done();
        });
      });
    });

    specify('resolves an empty array passed to RSVP.all()', function(done) {
      RSVP.all([]).then(function(results) {
        assert(results.length === 0);
        done();
      });
    });
  });
});
