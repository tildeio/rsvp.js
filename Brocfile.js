/* jshint node:true, undef:true, unused:true */
var compileModules   = require('broccoli-es6-module-transpiler');
var merge            = require('broccoli-merge-trees');
var uglify           = require('broccoli-uglify-js');
var es3Recast        = require('broccoli-es3-safe-recast');
var env              = process.env.EMBER_ENV || 'development';
var calculateVersion = require('git-repo-version');
var watchify         = require('broccoli-watchify');
var Funnel           = require('broccoli-funnel');
var concat           = require('broccoli-concat');
var replace          = require('broccoli-string-replace');
var fs               = require('fs');
var path             = require('path');

var output;
var paths = ['rsvp.min.js', 'rsvp.js'];

var bundle = compileModules('lib', {
  inputFiles: ['rsvp.umd.js'],
  output: '/rsvp.js',
  formatter: 'bundle'
});

function concatHeader(tree, paths) {
  return paths.map(function(path) {
    return concat(tree, {
      inputFiles: ['versionTemplate.txt', path],
      outputFile: '/' + path
    });
  });
}

function createDist(tree, paths) {
  var config = new Funnel('config');
  var nonMinFile = new Funnel(tree);
  var minFile = uglify(tree, {
    mangle: true,
    compress: true
  });

  minFile = new Funnel(minFile, {
    getDestinationPath: function (relativePath) {
      if (relativePath.match('rsvp')) {
        return relativePath.replace('.js', '.min.js');
      }
      return relativePath;
    }
  });

  tree = merge([minFile, nonMinFile, config]);
  return merge(concatHeader(tree, paths));
}

function createTest(tree, testSupportPaths) {
  var testSupport = merge(
      testSupportPaths.map(function (path) {
      var pieces = path.split('/');
      var path = pieces.splice(0, pieces.length - 1).join('/');
      var file = pieces.splice(-1);
      return new Funnel(path, {
        include: [new RegExp( file )],
        exclude: [new RegExp('lib')],
        destDir: 'test'
      });
    })
  );

  var tests = watchify(tree,{
    browserify: {
      entries: ['./main.js'],
      debug: true
    },
    outputFile: 'test/test-bundle.js',
    cache: true,
    init: function (b) {
      b.external('vertx');
      b.external('../dist/rsvp.js');
    }
  });

  return merge([tests, testSupport]);
}

if (env === 'production') {
  output = createDist(bundle, paths);
  output = replace(output, {
    files: paths,
    pattern: {
      match: /VERSION_PLACEHOLDER_STRING/g,
      replacement: calculateVersion(10)
    }
  })
}

if (env === 'test') {
  output = createDist(bundle, paths);
  var testSupport = [
    'node_modules/mocha/mocha.js',
    'node_modules/mocha/mocha.css',
    'node_modules/json3/lib/json3.js',
    'test/index.html',
    'test/tests/worker.js'
  ];
  var tests = createTest('test', testSupport);
  output = merge([output, tests]);
}

if (env !== 'development') {
  output = es3Recast(output);
}

module.exports = output || bundle;
