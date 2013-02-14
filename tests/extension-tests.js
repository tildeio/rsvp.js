/*global RSVP, describe, specify, assert */
describe("RSVP extensions", function() {
  describe("RSVP.all", function() {
    specify('it should exist', function() {
      assert(RSVP.all);
    });

    specify('fulfilled only after all of the other promises are fulfilled, using futures', function(done) {
      var first = new RSVP.Promise();
      var second = new RSVP.Promise();

      setTimeout(function() {
        first.resolve(true);
      }, 0);

      setTimeout(function() {
        second.resolve(true);
      }, 0);

      var firstFuture = first.future;
      var secondFuture = second.future;
      RSVP.all([firstFuture, secondFuture]).then(function() {
        assert(firstFuture.wasResolved);
        assert(secondFuture.wasResolved);
        done();
      });
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
        assert(first.future.wasResolved);
        assert(second.future.wasResolved);
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
        assert(first.future.wasRejected);
        assert(!second.future.wasResolved);
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

    specify('resolves an empty array passed to RSVP.all()', function(done) {
      RSVP.all([]).then(function(results) {
        assert(results.length === 0);
        done();
      });
    });
  });
});
