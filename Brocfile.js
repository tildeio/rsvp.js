/* jshint node:true, undef:true, unused:true */
var Rollup   = require('broccoli-rollup');
var Babel    = require('broccoli-babel-transpiler');
var merge    = require('broccoli-merge-trees');
var uglify   = require('broccoli-uglify-js');
var version  = require('git-repo-version');
var watchify = require('broccoli-watchify');
var concat   = require('broccoli-concat');
var fs       = require('fs');

var stew   = require('broccoli-stew');

var find   = stew.find;
var mv     = stew.mv;
var rename = stew.rename;
var env    = stew.env;
var map    = stew.map;

var lib       = find('lib');

// test stuff
var testDir   = find('test');
var testFiles = find('test/{index.html,worker.js}');

var json3     = mv(find('node_modules/json3/lib/{json3.js}'), 'node_modules/json3/lib/', 'test/');
// mocha doesn't browserify correctly
var mocha     = mv(find('node_modules/mocha/mocha.{js,css}'), 'node_modules/mocha/',    'test/');

var testVendor = merge([ json3, mocha ]);


var es5 = new Babel(lib, {
  blacklist: ['es6.modules']
});

// build RSVP itself
var rsvp = new Rollup(es5, {
  rollup: {
    entry: 'lib/rsvp.js',
    targets: [
      {
        format: 'umd',
        moduleName: 'RSVP',
        dest: 'rsvp.js',
        sourceMap: 'inline'
      },
      {
        format: 'es',
        dest: 'rsvp.es.js',
        sourceMap: 'inline'
      }
    ]
  }
});

var testBundle = watchify(merge([
  mv(rsvp, 'test'),
  testDir
]), {
  browserify: { debug: true, entries: ['./test/index.js'] }
});

var header = stew.map(find('config/versionTemplate.txt'), function(content) {
  return content.replace(/VERSION_PLACEHOLDER_STRING/, version());
});

function concatAs(tree, outputFile) {
  return concat(merge([tree, header]), {
    headerFiles: ['config/versionTemplate.txt'],
    inputFiles:  ['rsvp.js'],
    outputFile: outputFile
  });
}

function production(dist, header) {
  var result;
  env('production', function(){
    result = uglify(concatAs(dist, 'rsvp.min.js'), {
      compress: {
        negate_iife: false,
        sequences: false
      },
      mangle: true
    });
  })
  return result;
}

function development(dist, header) {
  return concatAs(dist, 'rsvp.js');
}

module.exports = merge([
  merge([
    production(rsvp, header),
    development(rsvp, header),
    concat(merge([rsvp, header]), {
      headerFiles: ['config/versionTemplate.txt'],
      inputFiles:  ['rsvp.es.js'],
      outputFile: 'rsvp.es.js'
    })
  ].filter(Boolean)),
  // test stuff
  testFiles,
  testVendor,
  mv(testBundle, 'test')
]);
