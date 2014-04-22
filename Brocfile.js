var concat = require('broccoli-concat');
var filterES6Modules = require('broccoli-es6-module-filter');
var mergeTrees = require('broccoli-merge-trees');
var moveFile = require('broccoli-file-mover');
var pickFiles = require('broccoli-static-compiler');
var uglifyJavaScript = require('broccoli-uglify-js');
var wrapFiles = require('broccoli-wrap');
var concatFilenames = require('broccoli-concat-filenames');
var cjsWrap = require('broccoli-cjs-wrap');
var browserify = require('broccoli-browserify');
var sweetjs = require('broccoli-sweetjs');

var trees = [
  createAMDTree(),
  createCommonJSTree(),
  createStandaloneTree(),

  // TODO only add tests when Broccoli environment is development ...
  makeTests()
];

module.exports = mergeTrees(trees);

function makeTests() {
  // Create AMD module 'tests' containing all tests in 'test/tests' and concatenate them into tests/tests.js
  var tests = filterES6Modules('test/tests', {
    moduleType: 'amd',
    packageName: 'tests',
    anonymous: false
  });
  tests = concat(tests, {
    inputFiles: ['**/*-test.js'],
    outputFile: '/tests/tests.js'
  });

  // Collect all Promises/A specs
  var testsCommonJS = pickFiles("test/tests", {
    files: ["**/*-test.js"],
    srcDir: "/",
    destDir: "/tests/commonjs"
  });
  testsCommonJS = filterES6Modules(testsCommonJS, {
    moduleType: "cjs"
  });

  // Create /tests/tests_main.js which requires all tests (all test/tests/**/*-test.js files)
  var testsMain = concatFilenames("test", {
    inputFiles: ["**/*-test.js"],
    outputFile: "/tests/tests_main.js",
    transform: function(fileName) {
      return "require('" + fileName  + "');";
    }
  });

  var promisesSpec = pickFiles("test", {
    files: ["promises-spec.js"],
    srcDir: "/",
    destDir: "/tests"
  });

  // Copy files needed for QUnit
  var qunit = pickFiles('test', {
    files:  ['index.html', 'vendor/*', 'tests/worker.js', 'test-adapter.js'],
    srcDir: '/',
    destDir: '/tests'
  });

  // Copy vendor/loader.js to test/loader.js
  var loader = concat('vendor', {
    inputFiles: ['loader.js'],
    outputFile: '/tests/loader.js'
  });

  // Merge all test related stuff into tests tree
  return mergeTrees([testsCommonJS, qunit, loader, tests, testsMain, promisesSpec]);
}



function createAMDTree() {
  // dist/router.amd.js: all AMD compiled modules concatenated into 1 file
  var amd = filterES6Modules('lib', {
    moduleType: 'amd',
    anonymous: false
  });
  // amd = sweetjs(amd, {
  //   modules: ["sweet-array-slice"],
  //   readableNames: true
  // });

  amd = concat(amd, {
    // to be consinstent with old behavior, we include 'router.js' at the end
    inputFiles: ['rsvp/**/*.js', 'rsvp.js'],
    outputFile: '/rsvp.amd.js'
  });

  return amd;
}



function createCommonJSTree() {
  // CommonJS version of router.js; will be located in 'dist/commonjs'
  var commonJs = pickFiles('lib', {
    srcDir: '/',
    destDir: '/commonjs'
  });
  commonJs = filterES6Modules(commonJs, {
    moduleType: 'cjs'
  });

  // rename router.js to main.js
  commonJs = moveFile(commonJs, {
    srcFile: '/commonjs/rsvp.js',
    destFile: '/commonjs/main.js'
  });

  return commonJs;
}



function createStandaloneTree() {
  // dist/router.js: IIFE version of router.js, using RSVP and RouteRecognizer globals
  var begin = '(function(global) {\n';
  var end = ["\n"];
  end.push("global.RSVP = require('rsvp');");
  end.push('}(self));');
  end = end.join('\n');

  var browser = pickFiles('vendor', {
    files: ['loader.js'],
    srcDir: '/',
    destDir: '/'
  });
  browser = mergeTrees([browser, createAMDTree()]);
  browser = concat(browser, {
    inputFiles: ['loader.js', '*.js'],
    outputFile: '/rsvp.js'
  });
  browser = wrapFiles(browser, {
    wrapper: [begin, end],
    extensions: ['js']
  });

  // dist/router.min.js
  var minified = pickFiles(browser, {
    srcDir: '/',
    destDir: '/'
  });
  minified = moveFile(minified, {
    srcFile: '/rsvp.js',
    destFile: '/rsvp.min.js'
  });
  minified = uglifyJavaScript(minified, {
    mangle: true
  });

  return mergeTrees([browser, minified]);
}
