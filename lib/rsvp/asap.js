var len = 0;
var toString = {}.toString;

export default function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 1, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    scheduleFlush();
  }
}

var browserWindow = (typeof window !== 'undefined') ? window : undefined
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' &&
  typeof importScripts !== 'undefined' &&
  typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  return function() {
    process.nextTick(flush);
  };
}

// nashorn
function usePhasedTimer() {
  var t = new (Java.type('java.util.Timer'));
  var p = new (Java.type('java.util.concurrent.Phaser'));

  return function(fn) {
    p.bulkRegister(2);
    t.schedule(function() {
      p.awaitAdvance(p.arriveAndDeregister());
      fn && fn() || flush();
    }, 0);
    p.arriveAndDeregister();
  };
}

// vertx
function useVertxTimer(fn) {
  return function() {
    vertxNext(fn || flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function() {
    node.data = (iterations = ++iterations % 2);
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  return function(fn) {
    setTimeout(fn || flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i+=2) {
    var callback = queue[i];
    var arg = queue[i+1];

    callback(arg);

    queue[i] = undefined;
    queue[i+1] = undefined;
  }

  len = 0;
}

function attemptVertex() {
  try {
    var vertx = require('vertx');
    var vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch(e) {
    return useSetTimeout();
  }
}

var _schedule;
if (typeof Java !== 'undefined' && toString.call(Java)) {
  _schedule = usePhasedTimer();
} else if (browserWindow === undefined && typeof require === 'function') {
  _schedule = attemptVertex();
} else {
  _schedule = useSetTimeout();
}

export var schedule = _schedule;
var scheduleFlush;
// Decide what async method to use to triggering processing of queued callbacks:
if (typeof process !== 'undefined' && toString.call(process) === '[object process]') {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else {
  scheduleFlush = _schedule;
}
