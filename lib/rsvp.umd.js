import {
  Promise,
  EventTarget,
  all,
  allSettled,
  race,
  hash,
  hashSettled,
  rethrow,
  defer,
  denodeify,
  configure,
  on,
  off,
  resolve,
  reject,
  async,
  map,
  filter
} from './rsvp';

var RSVP = {
  Promise: Promise,
  EventTarget: EventTarget,
  all: all,
  allSettled: allSettled,
  race: race,
  hash: hash,
  hashSettled: hashSettled,
  rethrow: rethrow,
  defer: defer,
  denodeify: denodeify,
  configure: configure,
  on: on,
  off: off,
  resolve: resolve,
  reject: reject,
  async: async,
  map: map,
  filter: filter
};

if (typeof define === 'function' && define.amd) {
  define(function() { return RSVP; });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = RSVP;
} else {
  this.RSVP = RSVP;
}
