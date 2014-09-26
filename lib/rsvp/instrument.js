import { config } from './config';
import { now } from './utils';

var queue = [];

function scheduleFlush() {
  setTimeout(function() {
    var entry;
    for (var i = 0; i < queue.length; i++) {
      entry = queue[i];

      var payload = entry.payload;

      payload.guid = payload.key + payload.id;
      payload.childGuid = payload.key + payload.childId;
      payload.stack = payload.error.stack;

      config.trigger(entry.name, entry.payload);
    }
    queue.length = 0;
  }, 50);
}

export default function instrument(eventName, promise, child) {
  if (1 === queue.push({
      name: eventName,
      payload: {
        key: promise._guidKey,
        id:  promise._id,
        eventName: eventName,
        detail: promise._result,
        childId: child && child._id,
        label: promise._label,
        timeStamp: now(),
        error: new Error(promise._label)
      }})) {
        scheduleFlush();
      }
  }
