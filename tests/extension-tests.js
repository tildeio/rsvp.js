/*global RSVP, describe, specify, assert */
describe("RSVP extensions", function() {
  describe("RSVP.wrap", function(){
    specify("it should exist", function(){
      assert(RSVP.wrap);
    });

    specify("async", function(done){
      var callCount = 0,
      thenable = {
        then: function(){
          callCount++;
        }
      },
      wrapped = RSVP.wrap(thenable);

      assert(callCount === 0, 'expected async, was sync');

      setTimeout(function(){
        assert(callCount === 1, 'timeout');
        done();
      }, 50);

    });

    specify("reject on setup failure", function(){
      var callCount = 0,
      theError = 'the error',
      thenable = {
        then: function(){
          callCount++;
          throw theError;
        }
      },
      wrapped = RSVP.wrap(thenable);

      assert(callCount === 0, 'expected async, was sync');

      wrapped.then(null, function(error){
        assert(callCount === 1, 'timeout');
        assert(error === theError, 'expect error was thrown');
        done();
      })
    });

    specify("resolves foreign promise", function(){
      var callCount = 0,
      theValue = 'the value',
      thenable = {
        then: function(success, failure){
          success(theValue)
        }
      },
      wrapped = RSVP.wrap(thenable);

      assert(callCount === 0, 'expected async, was sync');

      wrapped.then(function(value){
        assert(callCount === 1, 'timeout');
        assert(value === theValue);
        done();
      })
    });

    specify("rejects foreign promise", function(){
      var callCount = 0,
      theError = 'the error',
      thenable = {
        then: function(success, failure){
          failure(theError);
        }
      },
      wrapped = RSVP.wrap(thenable);

      assert(callCount === 0, 'expected async, was sync');

      wrapped.then(function(value){
        assert(callCount === 1, 'timeout');
        assert(value === 'success');
        done();
      })
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

    specify('resolves an empty array passed to RSVP.all()', function(done) {
      RSVP.all([]).then(function(results) {
        assert(results.length === 0);
        done();
      });
    });
  });
});
