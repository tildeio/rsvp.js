var watchify = require('broccoli-watchify');
var Funnel   = require('broccoli-funnel');
var merge    = require('broccoli-merge-trees');

module.exports = function createTest(tree, testSupportPaths) {
  var testSupport = merge(
      testSupportPaths.map(function (path) {
        var pieces = path.split('/');
        var newPath = pieces.splice(0, pieces.length - 1).join('/');
        var file = pieces.splice(-1);

        return new Funnel(newPath, {
          include: [new RegExp( file )],
          exclude: [new RegExp('lib')],
          destDir: 'test'
        });
    })
  );

  var tests = watchify(tree,{
    browserify: {
      entries: ['./main.js'],
      debug: true
    },
    outputFile: 'test/test-bundle.js',
    cache: true,
    init: function (b) {
      b.external('vertx');
      b.external('dist/rsvp.js');
    }
  });

  return merge([
    tests,
    testSupport
  ]);
}