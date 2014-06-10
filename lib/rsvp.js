import Promise from "./rsvp/promise";
import EventTarget from "./rsvp/events";
import denodeify from "./rsvp/node";
import allSettled from "./rsvp/all-settled";
import hash from "./rsvp/hash";
import hashSettled from "./rsvp/hash-settled";
import { config, configure } from "./rsvp/config";
import map from "./rsvp/map";
import filter from "./rsvp/filter";

function on() {
  config.on.apply(config, arguments);
}

function off() {
  config.off.apply(config, arguments);
}

// Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
if (typeof window !== 'undefined' && typeof window.__PROMISE_INSTRUMENTATION__ === 'object') {
  var callbacks = window.__PROMISE_INSTRUMENTATION__;
  configure('instrument', true);
  for (var eventName in callbacks) {
    if (callbacks.hasOwnProperty(eventName)) {
      on(eventName, callbacks[eventName]);
    }
  }
}

export {
  Promise,
  allSettled,
  hash,
  hashSettled,
  denodeify,
  configure,
  on,
  off,
  map,
  filter
};
