/* jshint node:true, undef:true, unused:true */
var compileModules = require('broccoli-compile-modules');
var mergeTrees = require('broccoli-merge-trees');

var browserDist = compileModules('lib', {
  inputFiles: ['rsvp.umd.js'],
  output: '/rsvp.js',
  formatter: 'bundle'
});

module.exports = mergeTrees([
  browserDist
]);
