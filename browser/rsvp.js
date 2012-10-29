(function(exports) { 'use strict';

var browserGlobal = (typeof window !== 'undefined') ? window : {};

var MutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var _toString = {}.toString;
var async;

var isPostMessageAsync = function() {
  var isAsync = true;

  if (!('postMessage' in browserGlobal)) return false;

  var reciver = function() {
    isAsync = false;
  };

  browserGlobal.addEventListener('message', reciver);
  browserGlobal.postMessage('test', '*');
  browserGlobal.removeEventListener('message', reciver);

  return isAsync;
};

if (typeof process !== 'undefined' &&
  _toString.call(process) === '[object process]') {
  async = function(callback, binding) {
    process.nextTick(function() {
      callback.call(binding);
    });
  };
} else {
  var queue = [], msg = 'drainQueue';

  var handler = function(e) {
    if ((_toString.call(e) === '[object Array]' && e[0].type === 'attributes') || (e.source === browserGlobal && e.data === msg)) {
      var toProcess = queue.slice();
      queue = [];

      toProcess.forEach(function(tuple) {
        var callback = tuple[0], binding = tuple[1];
        callback.call(binding);
      });
    }
  };

  if (MutationObserver) {
    var observer = new MutationObserver(handler);

    var element = document.createElement('div');
    observer.observe(element, { attributes: true });

    async = function(callback, binding) {
      queue.push([callback, binding]);
      element.setAttribute(msg, msg);
    };
  } else if (isPostMessageAsync()) {
    browserGlobal.addEventListener('message', handler);

    async = function(callback, binding) {
      queue.push([callback, binding]);
      browserGlobal.postMessage(msg, '*');
    };
  } else {
    async = function(callback, binding) {
      setTimeout(function() {
        callback.call(binding);
      }, 1);
    };
  }
}

exports.async = async;

var Event = exports.Event = function(type, options) {
  this.type = type;

  for (var option in options) {
    if (!options.hasOwnProperty(option)) { continue; }

    this[option] = options[option];
  }
};

var indexOf = function(callbacks, callback) {
  for (var i=0, l=callbacks.length; i<l; i++) {
    if (callbacks[i][0] === callback) { return i; }
  }

  return -1;
};

var callbacksFor = function(object) {
  var callbacks = object._promiseCallbacks;

  if (!callbacks) {
    callbacks = object._promiseCallbacks = {};
  }

  return callbacks;
};

var EventTarget = exports.EventTarget = {
  mixin: function(object) {
    object.on = this.on;
    object.off = this.off;
    object.trigger = this.trigger;
    return object;
  },

  on: function(eventName, callback, binding) {
    var allCallbacks = callbacksFor(this), callbacks;
    binding = binding || this;

    callbacks = allCallbacks[eventName];

    if (!callbacks) {
      callbacks = allCallbacks[eventName] = [];
    }

    if (indexOf(callbacks, callback) === -1) {
      callbacks.push([callback, binding]);
    }
  },

  off: function(eventName, callback) {
    var allCallbacks = callbacksFor(this), callbacks;

    if (!callback) {
      allCallbacks[eventName] = [];
      return;
    }

    callbacks = allCallbacks[eventName];

    var index = indexOf(callbacks, callback);

    if (index !== -1) { callbacks.splice(index, 1); }
  },

  trigger: function(eventName, options) {
    var allCallbacks = callbacksFor(this),
        callbacks, callbackTuple, callback, binding, event;

    if (callbacks = allCallbacks[eventName]) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        callbackTuple = callbacks[i];
        callback = callbackTuple[0];
        binding = callbackTuple[1];

        if (typeof options !== 'object') {
          options = { detail: options };
        }

        event = new Event(eventName, options);
        callback.call(binding, event);
      }
    }
  }
};

var Promise = exports.Promise = function() {
  this.on('promise:resolved', function(event) {
    this.trigger('success', { detail: event.detail });
  }, this);

  this.on('promise:failed', function(event) {
    this.trigger('error', { detail: event.detail });
  }, this);
};

var noop = function() {};

var invokeCallback = function(type, promise, callback, event) {
  var value, error;

  if (callback) {
    try {
      value = callback(event.detail);
    } catch(e) {
      error = e;
    }
  } else {
    value = event.detail;
  }

  if (value instanceof Promise) {
    value.then(function(value) {
      promise.resolve(value);
    }, function(error) {
      promise.reject(error);
    });
  } else if (callback && value) {
    promise.resolve(value);
  } else if (error) {
    promise.reject(error);
  } else {
    promise[type](value);
  }
};

Promise.prototype = {
  then: function(done, fail) {
    var thenPromise = new Promise();

    this.on('promise:resolved', function(event) {
      invokeCallback('resolve', thenPromise, done, event);
    });

    this.on('promise:failed', function(event) {
      invokeCallback('reject', thenPromise, fail, event);
    });

    return thenPromise;
  },

  resolve: function(value) {
    exports.async(function() {
      this.trigger('promise:resolved', { detail: value });
      this.isResolved = value;
    }, this);

    this.resolve = noop;
    this.reject = noop;
  },

  reject: function(value) {
    exports.async(function() {
      this.trigger('promise:failed', { detail: value });
      this.isRejected = value;
    }, this);

    this.resolve = noop;
    this.reject = noop;
  }
};

EventTarget.mixin(Promise.prototype);
 })(window.RSVP = {});
