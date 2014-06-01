import { config } from './config';
import { now } from './utils';

var queue = [];

export default function instrument(eventName, promise, child) {
  if (1 === queue.push({
      name: eventName,
      payload: {
        guid: promise._guidKey + promise._id,
        eventName: eventName,
        detail: promise._result,
        childGuid: child && promise._guidKey + child._id,
        label: promise._label,
        timeStamp: now(),
        stack: new Error(promise._label).stack
      }})) {

        setTimeout(function() {
          var entry;
          for (var i = 0; i < queue.length; i++) {
            entry = queue[i];
            config.trigger(entry.name, entry.payload);
          }
          queue.length = 0;
        }, 50);
      }
  }
