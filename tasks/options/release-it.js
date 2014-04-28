var pkg = require('../../package');
module.exports = {
  options: {
    pkgFiles: [
      'package.json',
      'bower.json'
    ],
    distRepo: pkg.repository.dist,
    distStageDir: 'tmp/stage',
    distFiles: [
      'dist/rsvp.js',
      'dist/rsvp.min.js',
      'dist/rsvp.amd.js'
    ],
    distBase: 'dist'
  }
};
