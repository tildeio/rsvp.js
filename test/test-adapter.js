/*global RSVP*/

var assert = require('assert');
var g = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;

var RSVP = g.RSVP || require('../dist/rsvp.min.js');
var defer = RSVP.defer;
var resolve = RSVP.resolve;
var reject = RSVP.reject;

module.exports = g.adapter = {
  resolved: resolve,
  rejected: reject,
  deferred: defer,
  RSVP: RSVP
};

