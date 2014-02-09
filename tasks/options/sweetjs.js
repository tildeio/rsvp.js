module.exports = {
  options: {
    modules: [
      './macros/a_slice.sjs'
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
