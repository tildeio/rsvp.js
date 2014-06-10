/*global RSVP*/

var defer, resolve, reject;

if (typeof RSVP !== 'undefined') {
  // Test the browser build
  resolve = RSVP.resolve;
  reject = RSVP.reject;
  defer = RSVP.defer;
} else {
  // Test the Node build
  RSVP = require('../dist/rsvp');
  assert = require('./vendor/assert');
  defer = require('../dist/rsvp').defer;
  resolve = require('../dist/rsvp').resolve;
  reject = require('../dist/rsvp').reject;
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  window = global;
}

module.exports = global.adapter = {
  resolved: resolve,
  rejected: reject,
  deferred: defer
};
