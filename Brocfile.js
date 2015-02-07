/* jshint node:true, undef:true, unused:true */
var compileModules   = require('broccoli-es6-module-transpiler');
var merge            = require('broccoli-merge-trees');
var uglify           = require('broccoli-uglify-js');
var version          = require('git-repo-version');
var browserify       = require('broccoli-watchify');
var fs               = require('fs');

var stew   = require('broccoli-stew');

var find   = stew.find;
var mv     = stew.mv;
var rename = stew.rename;
var env    = stew.env;
var map    = stew.map;

var lib       = find('lib');
var testDir   = find('test');
var testFiles = find('test/{index.html,worker.js}');

var json3     = mv(find('node_modules/json3/lib/{json3.js}'), 'node_modules/json3/lib/', 'test/');
// mocha doesn't browserify correctly
var mocha     = mv(find('node_modules/mocha/mocha.{js,css}'), 'node_modules/mocha/',    'test/');

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
  browserify: { entries: ['./test/index.js'] }
});

var dist = rsvp;

env('production', function() {
  dist = merge([
    rename(uglify(dist), '.js', '.min.js'),
    dist
  ]);
});

function prependLicense(content) {
  var license = fs.readFileSync('./config/versionTemplate.txt').toString().replace(/VERSION_PLACEHOLDER_STRING/, version());

  // strip source maps for now..
  content = content.replace(/\/\/# sourceMappingURL=rsvp.*/,'');
  return license + '\n' + content;
}

// exclude source maps for now, until map/cat supports source maps
dist = find(dist, '!*.map');

module.exports = merge([
  map(dist, prependLicense),
  testFiles,
  testVendor,
  mv(dist, 'test'),
  mv(testBundle, 'test')
]);
