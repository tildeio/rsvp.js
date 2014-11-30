/* jshint node:true, undef:true, unused:true */
var AMDFormatter     = require('es6-module-transpiler-amd-formatter');
var uglify           = require('broccoli-uglify-js');
var compileModules   = require('broccoli-compile-modules');
var mergeTrees       = require('broccoli-merge-trees');
var moveFile         = require('broccoli-file-mover');
var es3Recast        = require('broccoli-es3-safe-recast');
var env              = process.env.EMBER_ENV || 'development';
var calculateVersion = require('git-repo-version');
var watchify = require('broccoli-watchify');

var bundle = compileModules('lib', {
  inputFiles: ['rsvp.umd.js'],
  output: '/rsvp.js',
  formatter: 'bundle',
  description: 'CompileModules (bundle)'
});

var output = [
  bundle
];

if (process.env.EMBER_ENV === 'production') {
  trees.push(uglify(moveFile(bundle, {
    srcFile: 'rsvp.js',
    destFile: 'rsvp.min.js',
  }), {
    mangle: true,
    compress: true
  }));
}

if (env !== 'development') {
  output = output.map(es3Recast);
}

var tree = watchify('test',{
  browserify: {
    entries: ['./main.js'],
    debug: true
  },
  outputFile: 'test-bundle.js',
  cache: true,
  init: function (b) {
    b.external('vertx');
    b.external('../dist/rsvp.js');
  }
});

output.push(tree);
module.exports = merge(output);
