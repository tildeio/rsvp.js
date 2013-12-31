module.exports = {
  options: {
    pkgFiles: [ 'package.json', 'bower.json' ],
    srcRepo: 'origin',
    distRepo: 'git@github.com:components/rsvp.git',
    distStageDir: 'tmp/stage',
    distFiles: [ 'dist/rsvp.js', 'dist/rsvp.min.js', 'dist/rsvp.amd.js' ],
    distBase: 'dist'
  }
};
