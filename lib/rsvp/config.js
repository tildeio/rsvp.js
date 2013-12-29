import EventTarget from "./events";

var instrument = false;
if (typeof window !== 'undefined') {
   instrument = !!window.__PROMISE_INSPECTION__;
}

var config = {
  instrument: instrument,
  queueEvents: instrument
};

EventTarget.mixin(config);

function configure(name, value) {
  if (name === 'onerror') {
    // handle for legacy users that expect the actual
    // error to be passed to their function added via
    // `RSVP.configure('onerror', someFunctionHere);`
    config.on('error', value);
    return;
  }

  if (arguments.length === 2) {
    config[name] = value;
  } else {
    return config[name];
  }
}

export { config, configure };
