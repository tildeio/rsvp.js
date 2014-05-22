/*global RSVP*/

var defer, resolve, reject;

if (typeof RSVP !== 'undefined') {
  // Test the browser build
  resolve = RSVP.resolve;
  reject = RSVP.reject;
  defer = RSVP.defer;
} else {
  // Test the Node build
  RSVP = require('../commonjs/main');
  assert = require('./vendor/assert');
  defer = RSVP.defer;
  resolve = RSVP.resolve;
  reject = RSVP.reject;
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  window = global;
}

module.exports = global.adapter = {
  resolved: resolve,
  rejected: reject,
  deferred: defer
};
