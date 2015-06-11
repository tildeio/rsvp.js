module.exports = {
  compile: {
    name: '<%= pkg.name %>',
    description: '<%= pkg.description %>',
    version: '<%= pkg.version %>',
    url: '<%= pkg.homepage %>',
    options: {
      themedir: 'themes/rsvp',
      paths: 'lib',
      outdir: 'docs'
    }
  }
};
