'use strict';

/* jshint node:true, undef:true, unused:true */
const Rollup   = require('broccoli-rollup');
const Babel    = require('broccoli-babel-transpiler');
const merge    = require('broccoli-merge-trees');
const uglify   = require('broccoli-uglify-js');
const version  = require('git-repo-version');
const watchify = require('broccoli-watchify');
const concat   = require('broccoli-concat');
const fs       = require('fs');

const stew   = require('broccoli-stew');

const find   = stew.find;
const mv     = stew.mv;
const rename = stew.rename;
const env    = stew.env;
const map    = stew.map;

const lib       = find('lib');

// test stuff
const testDir   = find('test');
const testFiles = find('test/{index.html,worker.js}');

const json3     = mv(find('node_modules/json3/lib/{json3.js}'), 'node_modules/json3/lib/', 'test/');
// mocha doesn't browserify correctly
const mocha     = mv(find('node_modules/mocha/mocha.{js,css}'), 'node_modules/mocha/',    'test/');

const testVendor = merge([ json3, mocha ]);

const es5 = new Babel(lib, {
  plugins: [
    'transform-es2015-arrow-functions',
    'transform-es2015-computed-properties',
    'transform-es2015-shorthand-properties',
    'transform-es2015-template-literals',
    'transform-es2015-parameters',
    'transform-es2015-destructuring',
    'transform-es2015-spread',
    'transform-es2015-block-scoping',
    'transform-es2015-constants',
    ['transform-es2015-classes', { loose: true }],
    'babel6-plugin-strip-class-callcheck'
  ]
});

// build RSVP itself
const rsvp = new Rollup(es5, {
  rollup: {
    entry: 'lib/rsvp.js',
    targets: [
      {
        format: 'umd',
        moduleName: 'RSVP',
        dest: 'rsvp.js',
        sourceMap: 'inline'
      },
      {
        format: 'es',
        dest: 'rsvp.es.js',
        sourceMap: 'inline'
      }
    ]
  }
});

const rsvpES6 = new Rollup(lib, {
  rollup: {
    entry: 'lib/rsvp.js',
    targets: [
      {
        format: 'es',
        dest: 'es6/rsvp.es.js',
        sourceMap: 'inline'
      }
    ]
  }
});

const testBundle = watchify(merge([
  mv(rsvp, 'test'),
  testDir
]), {
  browserify: { debug: true, entries: ['./test/index.js'] }
});

const header = stew.map(find('config/versionTemplate.txt'), content => content.replace(/VERSION_PLACEHOLDER_STRING/, version()));

function concatAs(tree, outputFile) {
  return concat(merge([tree, header]), {
    headerFiles: ['config/versionTemplate.txt'],
    inputFiles:  ['rsvp.js'],
    outputFile: outputFile
  });
}

function production(dist, header) {
  let result;
  env('production', () => {
    result = uglify(concatAs(dist, 'rsvp.min.js'), {
      compress: {
        negate_iife: false,
        sequences: false
      },
      mangle: true
    });
  })
  return result;
}

function development(dist, header) {
  return concatAs(dist, 'rsvp.js');
}

module.exports = merge([
  merge([
    production(rsvp, header),
    development(rsvp, header),
    concat(merge([rsvp, header]), {
      headerFiles: ['config/versionTemplate.txt'],
      inputFiles:  ['rsvp.es.js'],
      outputFile: 'rsvp.es.js'
    }),
    concat(merge([rsvpES6, header]), {
      headerFiles: ['config/versionTemplate.txt'],
      inputFiles:  ['es6/rsvp.es.js'],
      outputFile: 'es6/rsvp.es.js'
    })
  ].filter(Boolean)),
  // test stuff
  testFiles,
  testVendor,
  mv(testBundle, 'test')
]);
