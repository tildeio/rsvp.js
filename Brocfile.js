/* jshint node:true, undef:true, unused:true */
var compileModules = require('broccoli-compile-modules');
var mergeTrees = require('broccoli-merge-trees');

var browserDist = compileModules('lib', {
  inputFiles: ['rsvp.umd.js'],
  output: '/rsvp.js',
  formatter: 'bundle'
});

var nodeDist = compileModules('lib', {
  inputFiles: ['**/*.js'],
  output: '/commonjs',
  formatter: 'commonjs'
});

module.exports = mergeTrees([
  browserDist,
  nodeDist
]);
