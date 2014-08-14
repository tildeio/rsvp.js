/* jshint node:true, undef:true, unused:true */
var AMDFormatter     = require('es6-module-transpiler-amd-formatter');
var closureCompiler  = require('broccoli-closure-compiler');
var compileModules   = require('broccoli-compile-modules');
var mergeTrees       = require('broccoli-merge-trees');
var moveFile         = require('broccoli-file-mover');
var es3Recast        = require('broccoli-es3-safe-recast');
var concat           = require('broccoli-concat');
var replace          = require('broccoli-string-replace');
var calculateVersion = require('./lib/calculateVersion');
var path             = require('path');
var trees            = [];
var env              = process.env.EMBER_ENV || 'development';

var bundle = compileModules('lib', {
  inputFiles: ['rsvp.umd.js'],
  output: '/rsvp.js',
  formatter: 'bundle',
});

trees.push(bundle);
trees.push(compileModules('lib', {
  inputFiles: ['**/*.js'],
  output: '/amd/',
  formatter: new AMDFormatter()
}));

if (process.env.EMBER_ENV === 'production') {
  trees.push(closureCompiler(moveFile(bundle, {
    srcFile: 'rsvp.js',
    destFile: 'rsvp.min.js'
  }), {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
  }));
}

var distTree = mergeTrees(trees.concat('config'));
var distTrees = [];

distTrees.push(concat(distTree, {
  inputFiles: [
    'versionTemplate.txt',
    'rsvp.js'
  ],
  outputFile: '/rsvp.js'
}));

if (process.env.EMBER_ENV === 'production') {
  distTrees.push(concat(distTree, {
    inputFiles: [
      'versionTemplate.txt',
      'rsvp.min.js'
    ],
    outputFile: '/rsvp.min.js'
  }));
}

if (env !== 'development') {
  distTrees = distTrees.map(es3Recast);
}

distTree = mergeTrees(distTrees);
var distTree = replace(distTree, {
  files: [
    'rsvp.js',
    'rsvp.min.js'
  ],
  pattern: {
    match: /VERSION_PLACEHOLDER_STRING/g,
    replacement: calculateVersion()
  }
});

module.exports = distTree;
