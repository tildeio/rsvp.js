module.exports = {
  options: {
    pkgFiles: [
      'package.json',
      'bower.json'
    ],
    srcRepo: 'git@github.com:tildeio/rsvp.js.git',
    distRepo: 'git@github.com:components/rsvp.git',
    distStageDir: 'tmp/stage',
    distFiles: [
      'dist/rsvp.js',
      'dist/rsvp.min.js',
      'dist/rsvp.amd.js'
    ],
    distBase: 'dist'
  }
};
