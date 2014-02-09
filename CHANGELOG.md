# Master

* Changes to RSVP.denodeify: Behaviour for multiple success callback parameters
  has been improved and the denodefied function now inherits from the original
  node function.

# 3.0.2

* [Spec compliance] Promise.all and Promise.race should reject, not throw on invalid input
* Add RSVP.allSettled

# 3.0.1

* Optimization: promises with noop resolvers now don't bother try to handle them.
* [perf] skip costly resolver invocation if it is known not to be needed.
* improve promise inspector interopt

# 3.0.0

* align with the promise spec
  https://github.com/domenic/promises-unwrapping
* idiomatic es6 usage
* RSVP.all: now now casts rather then resolves, and doesn't touch the
  "then"
* RSVP.hash: now now casts rather then resolves, and doesn't touch the
  "then"
* MutationObserver: prefer text mutation, this fixes interop with
  MutationObserver polyfils
* Removing asap unload listener. Allows back/forward page cache, chrome
  bug is old. Fixes #168
* add grunt docs task
* document: Promise.cast
* document: Promise.resolve/Promise.reject
* document: Promise.race
* document: Promise.all
* document: Promise.hash
* document: RSVP.denodeify
* document: RSVP.EventTarget
* document: RSVP.rethrow
* document: RSVP.defer
* Document: RSVP.on('error'
* Add Instrumentation hooks for tooling
* Significant internal cleanup and performance improvements
* require Promise constructor to be new'd (aligned with es6 spec)
* Prefer tasks + config inline within project
* Add Promise#finally
* Add Promise.cast
* Add Promise.resolve
* Add Promise.reject
* Add Promise.all
* Add Promise.race
* Add RSVP.map
* Support promise inheritance
* optimize onerror and reduce promise creation cost by 20x
* promise/a+ 2.0.3 compliant
* RSVP.async to schedule callbacks on internal queue
* Optimization: only enforce a single nextTick for each queue flush.

# 2.0.4

* Fix npm package

# 2.0.3

* Fix useSetTimeout bug

# 2.0.2

* Adding RSVP#rethrow
* add pre-built AMD link to README
* adding promise#fail

# 2.0.1
* misc IE fixes, including IE array detection
* upload passing builds to s3
* async: use three args for addEventListener
* satisfy both 1.0 and 1.1 specs
* Run reduce tests only in node
* RSVP.resolve now simply uses the internal resolution procedure
* prevent multiple promise resolutions
* simplify thenable handling
* pre-allocate the deferred's shape
* Moved from Rake-based builds to Grunt
* Fix Promise subclassing bug
* Add RSVP.configure('onerror')
* Throw exception when RSVP.all is called without an array
* refactor RSVP.all to just use a promise directly
* Make `RSVP.denodeify` pass along `thisArg`
* add RSVP.reject
* Reject promise if resolver function throws an exception
* add travis build-status
* correctly test and fix self fulfillment
* remove promise coercion.
* Fix infinite recursion with deep self fulfilling promises
* doc fixes

# 2.0.0

* No changelog beyond this point. Here be dragons.
