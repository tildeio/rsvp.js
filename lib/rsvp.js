import Promise from './rsvp/promise';
import EventTarget from './rsvp/events';
import rethrow from './rsvp/rethrow';
import {
  config,
  configure
} from './rsvp/config';
import asap from './rsvp/asap';

// defaults
config.async = asap;
config.after = cb => setTimeout(cb, 0);

const async = (callback, arg) => config.async(callback, arg);

function on() {
  config.on(...arguments);
}

function off() {
  config.off(...arguments);
}

// Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
  let callbacks = window['__PROMISE_INSTRUMENTATION__'];
  configure('instrument', true);
  for (let eventName in callbacks) {
    if (callbacks.hasOwnProperty(eventName)) {
      on(eventName, callbacks[eventName]);
    }
  }
}

// the default export here is for backwards compat:
//   https://github.com/tildeio/rsvp.js/issues/434
export default {
  asap,
  Promise,
  EventTarget,
  rethrow,
  configure,
  on,
  off,
  async
};

export {
  asap,
  Promise,
  EventTarget,
  rethrow,
  configure,
  on,
  off,
  async
};
