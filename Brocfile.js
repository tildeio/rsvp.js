/* jshint node:true, undef:true, unused:true */
var compileModules   = require('broccoli-es6-module-transpiler');
var merge            = require('broccoli-merge-trees');
var uglify           = require('broccoli-uglify-js');
var calculateVersion = require('git-repo-version');
var browserify       = require('broccoli-watchify');

var stew   = require('broccoli-stew');

var find   = stew.find;
var mv     = stew.mv;
var rename = stew.rename;
var env    = stew.env;

var lib       = find('lib');
var testDir   = find('test');
var testFiles = find('test/{index.html,worker.js}');

// should be mv
var json3     = rename(find('node_modules/json3/lib/{json3.js}'), 'node_modules/json3/lib', 'test/');
var mocha     = rename(find('node_modules/mocha/mocha.{js,css}'), 'node_modules/mocha/',    'test/');

var testVendor = merge([ json3, mocha ]);

var rsvp = compileModules(lib, {
  format: 'bundle',
  entry: 'rsvp.umd.js',
  output: 'rsvp.js'
});

var testBundle = browserify(merge([
  mv(rsvp, 'test'),
  testDir
]), {
  browserify: { entries: ['./test/index.js'] },
  init: function (b) { b.external('vertx'); }
});

var dist = rsvp;

env('production', function() {
  dist = merge([
    rename(uglify(dist), '.js', '.min.js'),
    dist
  ]);
});

module.exports = merge([
  dist,
  testFiles,
  testVendor,
  mv(rsvp, 'test'),
  mv(testBundle, 'test')
]);
