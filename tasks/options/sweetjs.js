module.exports = {
  options: {
    modules: [
      'sweet-a_slice'
    ],
    readableNames: true
  },
  src: {
    files: [{
      expand: true,
      cwd: 'tmp/',
      src: [
        '**/*.js'
      ],
      dest: 'tmp/'
    }, {
      expand: true,
      cwd: 'dist/commonjs/rsvp/',
      src: [
        '**/*.js'
      ],
      dest: 'dist/commonjs/rsvp/'
    }]
  }
};
