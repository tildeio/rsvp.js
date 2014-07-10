module.exports = {
  browser: {
    src: 'dist/<%= pkg.name %>.js',
    dest: 'dist/<%= pkg.name %>.js'
  },
  amd: {
    src: 'dist/<%= pkg.name %>.amd.js',
    dest: 'dist/<%= pkg.name %>.amd.js'
  },
  min: {
    src: 'dist/<%= pkg.name %>.min.js',
    dest: 'dist/<%= pkg.name %>.min.js'
  }
};
