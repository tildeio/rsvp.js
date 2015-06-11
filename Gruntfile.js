module.exports = function(grunt) {
  var config = require('load-grunt-config')(grunt, {
    configPath: 'tasks/options',
    init: false
  });

  grunt.loadTasks('tasks');

  this.registerTask('default', ['build']);

// Run client-side tests on the command line.
  this.registerTask('test', 'Runs tests through the command line using PhantomJS', [
    'build', 'tests', 'connect'
  ]);

  // Build test files
  this.registerTask('tests', 'Builds the test package', [
    'concat:deps',
    'browserify:tests',
    'transpile:testsAmd',
    'transpile:testsCommonjs',
    'buildTests:dist'
  ]);

  // Build a new version of the library
  this.registerTask('build', 'Builds a distributable version of <%= cfg.name %>', [
    'clean',
    'transpile:amd',
    'transpile:commonjs',
    'sweetjs',
    'concat:amd',
    'concat:browser',
    'browser:distNoVersion',
    'jshint',
    'uglify:browser'
  ]);

  // Custom phantomjs test task
  this.registerTask('test:phantom', "Runs tests through the command line using PhantomJS", [
                    'build', 'tests', 'mocha_phantomjs']);


  this.registerTask('test', [
    'build',
    'mocha_phantomjs',
  ]);

  // Custom YUIDoc task
  this.registerTask('docs', ['yuidoc']);

  config.env = process.env;
  config.pkg = grunt.file.readJSON('package.json');

  // Load custom tasks from NPM
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  // Merge config into emberConfig, overwriting existing settings
  grunt.initConfig(config);
};
