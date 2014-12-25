var Funnel = require('broccoli-funnel');
var concat = require('broccoli-concat');

function rename(tree, from, to) {
  var replacer;

  if (arguments.length === 2 && typeof from === 'function') {
    replacer = from;
  } else {
    replacer = defaultReplace;
  }

  function defaultReplace(relativePath) {
    return relativePath.replace(from, to);
  }

  return new Funnel(tree, {
    include: [new RegExp(from)],
    getDestinationPath: replacer
  });
}

function concatHeader(tree, path) {
  return concat(tree, {
    inputFiles: ['versionTemplate.txt', path],
    outputFile: '/' + path
  });
}

function env(/* ...envName, cb */) {
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

module.exports = {
  rename: rename,
  concatHeader: concatHeader,
  env: env
};