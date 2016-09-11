/*global RSVP*/

var RSVP = require('./rsvp.js');

new Function('return this')().adapter = {
  resolved: RSVP.resolve,
  rejected: RSVP.reject,
  deferred: RSVP.defer,
  RSVP: RSVP
};
