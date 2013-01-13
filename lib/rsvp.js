var config = {};

var browserGlobal = (typeof window !== 'undefined') ? window : {};

var MutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var RSVP;

if (typeof process !== 'undefined' &&
  {}.toString.call(process) === '[object process]') {
  config.async = function(callback, binding) {
    process.nextTick(function() {
      callback.call(binding);
    });
  };
} else if (MutationObserver) {
  var queue = [];

  var observer = new MutationObserver(function() {
    var toProcess = queue.slice();
    queue = [];

    toProcess.forEach(function(tuple) {
      var callback = tuple[0], binding = tuple[1];
      callback.call(binding);
    });
  });

  var element = document.createElement('div');
  observer.observe(element, { attributes: true });

  // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
  window.addEventListener('unload', function(){
    observer.disconnect();
    observer = null;
  });

  config.async = function(callback, binding) {
    queue.push([callback, binding]);
    element.setAttribute('drainQueue', 'drainQueue');
  };
} else {
  config.async = function(callback, binding) {
    setTimeout(function() {
      callback.call(binding);
    }, 1);
  };
}

function configure(name, value) {
  config[name] = value;
}


var Event = function(type, options) {
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

var EventTarget = {
  mixin: function(object) {
    object.on = this.on;
    object.off = this.off;
    object.trigger = this.trigger;
    object.once = this.once;
    return object;
  },

  on: function(eventNames, callback, binding) {
    var allCallbacks = callbacksFor(this), callbacks, eventName;
    eventNames = eventNames.split(/\s+/);
    binding = binding || this;

    while (eventName = eventNames.shift()) {
      callbacks = allCallbacks[eventName];

      if (!callbacks) {
        callbacks = allCallbacks[eventName] = [];
      }

      if (indexOf(callbacks, callback) === -1) {
        callbacks.push([callback, binding]);
      }
    }
  },

  once: function(eventNames, callback, binding) {
    var wrapper = function() {
      this.off(eventNames, callback, binding);
      callback.apply(binding, arguments);
    };
    this.on(eventNames, wrapper, this);
  },

  off: function(eventNames, callback) {
    var allCallbacks = callbacksFor(this), callbacks, eventName, index;
    eventNames = eventNames.split(/\s+/);

    while (eventName = eventNames.shift()) {
      if (!callback) {
        allCallbacks[eventName] = [];
        continue;
      }

      callbacks = allCallbacks[eventName];

      index = indexOf(callbacks, callback);

      if (index !== -1) { callbacks.splice(index, 1); }
    }
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


function all(futures) {
  var i, results = [];
  var allPromise = new Promise();
  var remaining = futures.length;

  if (remaining === 0) {
    allPromise.resolve([]);
  }

  var resolver = function(index) {
    return function(value) {
      resolve(index, value);
    };
  };

  var resolve = function(index, value) {
    results[index] = value;
    if (--remaining === 0) {
      allPromise.resolve(results);
    }
  };

  var reject = function(error) {
    allPromise.reject(error);
  };

  for (i = 0; i < remaining; i++) {
    futures[i].then(resolver(i), reject);
  }
  return allPromise.future;
}


var noop = function() {};

var Promise = function() {
  this.future = new Future(this);
};

Promise.prototype = {
  resolve: function(value) {
    this.resolve = noop;
    this.reject = noop;
    config.async(function() {
      this.trigger('promise:resolved', { detail: value });
    }, this);
  },

  reject: function(value) {
    this.resolve = noop;
    this.reject = noop;
    config.async(function() {
      this.trigger('promise:rejected', { detail: value });
    }, this);
  },

  //Conveniece, maintaining single object interface.
  then: function(done, fail) {
    return this.future.then(done, fail);
  }
};

EventTarget.mixin(Promise.prototype);


//Futures are write-once and shouldn't be instantiated or written to directly.  A Promise will
//create a Future that it will write into by firing events, and the Future will only respond
//to those events the first time.
var Future = function(promise) {
  promise.once('promise:resolved', function(event) {
    this.wasResolved = true;
    this.resolvedValue = event.detail;
    this.trigger('future:success', { detail: event.detail });
  }, this);
  promise.once('promise:rejected', function(event) {
    this.wasRejected = true;
    this.rejectedValue = event.detail;
    this.trigger('future:failure', { detail: event.detail });
  }, this);
};

//Call the callback with the given arg and resolve the promise when
//done.
var invokeCallback = function(type, promise, callback, arg) {
  var hasCallback = typeof callback === 'function',
      value, error, succeeded, failed;

  //Catch exceptions in the callback and pass them on as failure
  if (hasCallback) {
    try {
      value = callback(arg);
      succeeded = true;
    } catch(e) {
      failed = true;
      error = e;
    }
  } else {
    value = arg
    succeeded = true;
  }

  //If the callback returned a Future, wait until it completes.
  if (value && typeof value.then === 'function') {
    value.then(function(value) {
      promise.resolve(value);
    }, function(error) {
      promise.reject(error);
    });
  } else if (hasCallback && succeeded) {
    promise.resolve(value);
  } else if (failed) {
    promise.reject(error);
  } else {
    promise[type](value);
  }
};

//Adds callbacks to the future.
//Calls the right callback asynchronously, but immediately, if the Future was already'
//completed.
//Returns a Future that will resolve when the callback is done.
Future.prototype.then = function(done, fail) {
  var thenPromise = new Promise();

  if (this.wasResolved) {
    config.async(function() {
      invokeCallback('resolve', thenPromise, done, this.resolvedValue);
    }, this);
  } else if (this.wasRejected) {
    config.async(function() {
      invokeCallback('reject', thenPromise, fail, this.rejectedValue);
    }, this);
  } else {
    this.once('future:success', function(event) {
      invokeCallback('resolve', thenPromise, done, event.detail);
    });
    this.once('future:failure', function(event) {
      invokeCallback('reject', thenPromise, fail, event.detail);
    });
  }

  return thenPromise.future;
};
EventTarget.mixin(Future.prototype);


export { Promise, Event, EventTarget, all, configure };