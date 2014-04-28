module.exports = function(grunt) {
  grunt.registerMultiTask('browser', 'Export the object in <%= pkg.name %> to the window', function() {
    this.files.forEach(function(f) {
      var output = ['(function(global) {'];

      output.push.apply(output, f.src.map(grunt.file.read));

      output.push("global.<%= pkg.namespace %> = require('<%= pkg.name %>');");
      output.push('}(self));');

      grunt.file.write(f.dest, grunt.template.process(output.join('\n')));
    });
  });
};
