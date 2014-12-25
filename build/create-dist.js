var Funnel       = require('broccoli-funnel');
var merge        = require('broccoli-merge-trees');
var uglify       = require('broccoli-uglify-js');
var helpers      = require('./helpers');
var concatHeader = helpers.concatHeader;
var rename       = helpers.rename;

module.exports = function createDist(input, paths) {
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