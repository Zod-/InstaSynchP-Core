module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'string-replace': {
      build: {
        files: {
          'dist/': 'dist/*.js',
        },
        options: {
          replacements: [{
            pattern: /@VERSION@/g,
            replacement: '<%= pkg.version %>'
          }, {
            pattern: /\/\/ @name[^\n]*\n/g,
            replacement: function (match) {
              return match.replace(/-/, ' ');
            }
          }]
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      beforereplace: ['src/core.js'],
      other: ['Gruntfile.js']
    },
    concat: {
      dist: {
        src: ['src/meta.js', 'src/core.js'],
        dest: 'dist/InstaSynchP-Core.user.js'
      }
    },
    'userscript-meta': {
      build: {
        dest: 'src/meta.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-userscript-meta');

  grunt.registerTask('default', ['userscript-meta', 'concat',
    'string-replace', 'jshint'
  ]);
  grunt.registerTask('test', ['concat', 'jshint']);
  grunt.registerTask('build', ['userscript-meta', 'concat',
    'string-replace'
  ]);
};
