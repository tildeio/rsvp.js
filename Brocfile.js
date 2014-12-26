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
var test      = find('test');
var json3     = find('node_modules/json3/lib', { only: [/^json3\.js$/]      });
var mocha     = find('node_modules/mocha/',    { only: [/^mocha\.(js|css)/] });
var testIndex = find('test',                   { only: [/^index\.html/]     });
var worker    = find('test/tests/',            { only: [/^worker\.js/]      });

var rsvp = compileModules(lib, {
  format: 'bundle',
  entry: 'rsvp.umd.js',
  output: 'rsvp.js'
});

var testBundle = browserify(merge([
  rsvp,
  mocha,
  test
]), {
  browserify: { entries: ['./index.js'] },
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
  mv(merge([
    mocha,
    testBundle,
    testIndex,
    worker,
    rsvp,
  ]), 'test'),
  dist
]);
