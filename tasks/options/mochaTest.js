module.exports = {
  test: {
    src: [
      'dist/tests/vendor/assert.js',
      'dist/tests/test-adapter.js',
      // 'dist/tests/promises-spec.js',
      'node_modules/promises-aplus-tests/lib/tests/**/*.js',
      'dist/tests/commonjs/**/*-test.js',
    ],
    options: {
      reporter: 'spec',
      timeout: 200
    }
  }
};
