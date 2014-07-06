/*global RSVP*/

var assert = require('./vendor/assert');

var RSVP = require('../dist/rsvp');
var defer = RSVP.defer;
var resolve = RSVP.resolve;
var reject = RSVP.reject;

var g = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
module.exports = g.adapter = {
  resolved: resolve,
  rejected: reject,
  deferred: defer,
  RSVP: RSVP
};

