/*global $, RSVP, describe, specify, assert */
describe("RSVP.Promise#fromDeferred", function() {
  describe("RSVP.Promise.fromDeferred", function() {
    specify('it should exist', function() {
      assert(RSVP.Promise.fromDeferred);
    });

    specify('can wrap $.Deferred with an RSVP.Promise and resolve', function(done) {
      var deferred = $.Deferred();
      var rsvpPromise = RSVP.Promise.fromDeferred(deferred);
      rsvpPromise.then(function(args) {
        assert.deepEqual(args, [1,2,3]);
        done();
      });
      deferred.resolve(1,2,3);
    });
  });
});
