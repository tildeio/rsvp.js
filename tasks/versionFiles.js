module.exports = function(grunt) {
  grunt.registerMultiTask('versionFiles', 'Place comment version at top of distribution files', function() {
    this.files.forEach(function(f) {
      var header = grunt.template.process(grunt.file.read(__dirname + "/../config/versionTemplate.txt"))
      var body = f.src.map(grunt.file.read);
      grunt.file.write(f.dest, [header, body].join('\n'));
    });
  });
};
