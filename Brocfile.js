/* jshint node:true, undef:true, unused:true */
var compileModules   = require('broccoli-es6-module-transpiler');
var merge            = require('broccoli-merge-trees');
var uglify           = require('broccoli-uglify-js');
var es3Recast        = require('broccoli-es3-safe-recast');
var calculateVersion = require('git-repo-version');
var watchify         = require('broccoli-watchify');
var Funnel           = require('broccoli-funnel');
var concat           = require('broccoli-concat');
var replace          = require('broccoli-replace');

// TODO: this should be dynamic
var paths = [
  'rsvp.min.js',
  'rsvp.js'
];

var output = bundle = compileModules('lib', {
  inputFiles: ['rsvp.umd.js'],
  output: '/rsvp.js',
  formatter: 'bundle'
});

env('production', function() {
  output = createDist(bundle, paths);
  output = replace(output, {
    files: paths,
    pattern: {
      match: /VERSION_PLACEHOLDER_STRING/g,
      replacement: calculateVersion(10)
    }
  });
});

env('test', 'development', function() {
  output = createDist(bundle, paths);

  var tests = createTest('test', [
    'node_modules/mocha/mocha.js',
    'node_modules/mocha/mocha.css',
    'node_modules/json3/lib/json3.js',
    'test/index.html',
    'test/tests/worker.js'
  ]);

  output = merge([
    output,
    tests
  ]);
});

env('!development', function() {
  output = es3Recast(output);
});

module.exports = output;




// TODO: extract
// helpers
function concatHeader(tree, path) {
  return concat(tree, {
    inputFiles: ['versionTemplate.txt', path],
    outputFile: '/' + path
  });
}

function rename(tree, from, to) {
  var replacer;

  if (arguments.length === 2 && typeof from === 'function') {
    replacer = from;
  } else {
    replacer = defaultReplace;
  }

  return new Funnel(tree, {
    include: [new RegExp(from)],
    getDestinationPath: replacer
  });

  function defaultReplace(relativePath) {
    return relativePath.replace(from, to);
  }
}

function createDist(input, paths) {
  var config = new Funnel('config');
  var options = {
    mangle: true,
    compress: true
  };

  var minFile = rename(uglify(input, options), '.js', '.min.js');

  var tree = merge([
    minFile,
    input,
    config
  ]);

  return merge(paths.map(function(path) {
    return concatHeader(tree, path);
  }));
}

function createTest(tree, testSupportPaths) {
  var testSupport = merge(
      testSupportPaths.map(function (path) {
        var pieces = path.split('/');
        var newPath = pieces.splice(0, pieces.length - 1).join('/');
        var file = pieces.splice(-1);

        return new Funnel(newPath, {
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

  return merge([
    tests,
    testSupport
  ]);
}

function env(/* envName..., cb */) {
  var length = arguments.length;
  var envs = Array.prototype.slice.call(arguments).slice(0, length - 1);
  var cb = arguments[length - 1];

  var currentEnv = process.env.EMBER_ENV || 'development';

  var match = envs.map(function(name) {
    if (name.charAt(0) === '!') {
      return name.substring(1) !== currentEnv;
    } else {
      return name == currentEnv;
    }
  }).filter(Boolean).length > 0;

  if (match) {
    return cb();
  }
}
