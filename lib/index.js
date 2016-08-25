import platform from './rsvp/platform';
import {
  Promise,
  allSettled,
  hash,
  hashSettled,
  denodeify,
  on,
  off,
  map,
  filter,
  resolve,
  reject,
  rethrow,
  all,
  defer,
  EventTarget,
  configure,
  race,
  async
} from './rsvp';

var RSVP = {
  'race': race,
  'Promise': Promise,
  'allSettled': allSettled,
  'hash': hash,
  'hashSettled': hashSettled,
  'denodeify': denodeify,
  'on': on,
  'off': off,
  'map': map,
  'filter': filter,
  'resolve': resolve,
  'reject': reject,
  'all': all,
  'rethrow': rethrow,
  'defer': defer,
  'EventTarget': EventTarget,
  'configure': configure,
  'async': async
};

export default RSVP;
