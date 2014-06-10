/* jshint node:true, undef:true, unused:true */

var ModuleContainer = require('es6-module-transpiler').Container;
var FileResolver = require('es6-module-transpiler').FileResolver;
var Formatters = require('es6-module-transpiler').formatters;

var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var helpers = require('broccoli-kitchen-sink-helpers');
var Writer = require('broccoli-writer');

function compileModules(inputTree, options) {
  return new CompileModules(inputTree, options);
}

CompileModules.prototype = Object.create(Writer.prototype);
CompileModules.prototype.constructor = CompileModules;

function CompileModules(inputTree, options) {
  this.inputTree = inputTree;
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key];
    }
  }
}

CompileModules.prototype.write = function(readTree, destDir) {
  return readTree(this.inputTree).then(function(srcDir) {
    var container = new ModuleContainer({
      formatter: Formatters[this.formatter || Formatters.DEFAULT],
      resolvers: [new FileResolver([srcDir])]
    });

    helpers.assertAbsolutePaths([this.outputFile]);
    var inputFiles = helpers.multiGlob(this.inputFiles, {cwd: srcDir});
    for (var i = 0; i < inputFiles.length; i++) {
      container.getModule(inputFiles[i]);
    }

    container.write(path.join(destDir, this.outputFile));
  }.bind(this));
};

var browserDist = compileModules('lib', {
  inputFiles: ['rsvp.umd.js'],
  outputFile: '/rsvp.js',
  formatter: 'export-variable'
});

var nodeDist = compileModules('lib', {
  inputFiles: ['**/*.js'],
  outputFile: '/commonjs',
  formatter: 'commonjs'
});

module.exports = mergeTrees([ browserDist, nodeDist ]);
