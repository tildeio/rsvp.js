/* jshint node:true, undef:true, unused:true */
var compileModules   = require('broccoli-es6-module-transpiler');
var es3Recast        = require('broccoli-es3-safe-recast');
var calculateVersion = require('git-repo-version');
var replace          = require('broccoli-replace');
var merge            = require('broccoli-merge-trees');
var pkg              = require('./package.json');
var env              = require('./build/helpers').env;
var createDist       = require('./build/create-dist');
var createTest       = require('./build/create-test');

var paths = [pkg.name + '.js', pkg.name + '.min.js'];

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
