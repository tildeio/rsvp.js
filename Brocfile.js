/* jshint node:true, undef:true, unused:true */
var AMDFormatter = require('es6-module-transpiler-amd-formatter');
var closureCompiler = require('broccoli-closure-compiler');
var compileModules = require('broccoli-compile-modules');
var mergeTrees = require('broccoli-merge-trees');
var moveFile = require('broccoli-file-mover');

var trees = [];

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

if (process.env.ENV === 'production') {
  trees.push(closureCompiler(moveFile(bundle, {
    srcFile: 'rsvp.js',
    destFile: 'rsvp.min.js'
  }), {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
  }));
}

module.exports = mergeTrees(trees);
