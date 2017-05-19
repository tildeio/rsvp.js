/*global RSVP*/

var RSVP = require('./rsvp.js');

new Function('return this')().adapter = {
  resolved: RSVP.Promise.resolve,
  rejected: RSVP.Promise.reject,
  deferred: RSVP.defer,
  RSVP: RSVP
};
