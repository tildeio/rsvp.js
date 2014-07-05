/*global RSVP*/

var assert = require('./vendor/assert');

var RSVP = require('../dist/rsvp');
var defer = RSVP.defer;
var resolve = RSVP.resolve;
var reject = RSVP.reject;

if (typeof window === 'undefined' && typeof global !== 'undefined') {
    window = global;
}

module.exports = global.adapter = {
  resolved: resolve,
  rejected: reject,
  deferred: defer,
  RSVP: RSVP
};
