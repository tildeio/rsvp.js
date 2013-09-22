var callbacksFor = function(object) {
  var callbacks = object._promiseCallbacks;

  if (!callbacks) {
    // pre-allocate shape
    callbacks = object._promiseCallbacks = {
      "promise:resolved": undefined,
      "promise:failed": undefined,
      "error": undefined
    };
  }

  return callbacks;
};

var EventTarget = {
  mixin: function(object) {
    object.on = this.on;
    object.off = this.off;
    object.trigger = this.trigger;
    object._promiseCallbacks = undefined;
    return object;
  },

  on: function(eventName, callback) {
    var allCallbacks = callbacksFor(this), callbacks;

    callbacks = allCallbacks[eventName];

    if (!callbacks) {
      callbacks = allCallbacks[eventName] = [];
    }

    callbacks.push(callback);
  },

  off: function(eventName) {
    var allCallbacks = callbacksFor(this);
    allCallbacks[eventName] = [];
  },

  trigger: function(eventName, options) {
    var allCallbacks = callbacksFor(this),
        callbacks, callback;

    if (callbacks = allCallbacks[eventName]) {
      // Don't cache the callbacks.length since it may grow
      for (var i=0; i<callbacks.length; i++) {
        callback = callbacks[i];
        callback(options);
      }
    }
  }
};

export { EventTarget };
