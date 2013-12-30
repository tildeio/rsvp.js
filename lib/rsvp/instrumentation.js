import { config } from './config';
import { now } from './utils';


// Queue instrumentation events for later use
var events = [];

function flushEvents() {
  for (var i = 0; i < events.length; i++) {
    config.trigger(events[i].name, events[i].options);
  }
  events = [];
}

function instrument(eventName, promise, child) {
  // instrumentation should not disrupt normal usage.
  try {
    var opts = {
      guid: promise._guidKey + promise._id,
      eventName: eventName,
      detail: promise._detail,
      childGuid: child && promise._guidKey + child._id,
      label: promise._label,
      timeStamp: now(),
      stack: new Error(promise._label).stack
    };

    // queue events for later use
    if (config.queueEvents) {
      events.push({
        name: eventName,
        options: opts
      });
    }

    // trigger event
    config.trigger(eventName, opts);

  } catch(error) {
    setTimeout(function(){
      throw error;
    }, 0);
  }
}

export { instrument, flushEvents };
