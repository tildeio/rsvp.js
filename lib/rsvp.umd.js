import {
  Promise,
  allSettled,
  hash,
  hashSettled,
  denodeify,
  configure,
  on,
  off,
  map,
  filter,
  resolve,
  reject,
  rethrow,
  all,
  defer
} from './rsvp';

var RSVP = {
  'Promise': Promise,
  'allSettled': allSettled,
  'hash': hash,
  'hashSettled': hashSettled,
  'denodeify': denodeify,
  'configure': configure,
  'on': on,
  'off': off,
  'map': map,
  'filter': filter,
  'resolve': resolve,
  'reject': reject,
  'all': all,
  'rethrow': rethrow,
  'defer': defer
};

/* global define:true module:true window: true */
if (typeof define === 'function' && define.amd) {
  define(function() { return RSVP; });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = RSVP;
} else if (typeof window !== 'undefined') {
  window['RSVP'] = RSVP;
}
