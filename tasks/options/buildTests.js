module.exports = {
  dist: {
    src: [
      'vendor/loader.js',
      'tmp/tests.amd.js',
      'tmp/<%= pkg.name %>/**/*.amd.js',
      'tmp/<%= pkg.name %>.amd.js'
    ],
    dest: 'tmp/tests.js'
  }
};
