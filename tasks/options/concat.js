module.exports = {
  deps: {
    src: ['vendor/deps/*.js'],
    dest: 'tmp/deps.amd.js'
  },

  browser: {
    src: [
      'vendor/loader.js',
      'tmp/<%= pkg.name %>/**/*.amd.js',
      'tmp/<%= pkg.name %>.amd.js'
    ],
    dest: 'tmp/<%= pkg.name %>.browser1.js',
    options: {
      banner: '/**\n' +
              '  @class RSVP\n' +
              '  @module RSVP\n' +
              '  */\n'
    }

  }
};
