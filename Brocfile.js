/* jshint node:true, undef:true, unused:true */
var compileModules = require('broccoli-es6-module-transpiler');
var merge = require('broccoli-merge-trees');
var closureCompiler  = require('broccoli-closure-compiler');
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

if (env === 'production') {
  output.push(closureCompiler(moveFile(bundle, {
    srcFile: 'rsvp.js',
    destFile: 'rsvp.min.js',
  }), {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    create_source_map: 'rsvp.js.map',
    source_map_format: 'V3',
    externs: ['node'],
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
