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
            pattern: /@CORECSSREV@/g,
            replacement: function () {
              var cssrev = grunt.file.read('dist/coreCSSrev')
                .trim();
              grunt.file.delete('dist/coreCSSrev');
              return cssrev;
            }
          }, {
            pattern: /@RAWGITREPO@/g,
            replacement: 'https://cdn.rawgit.com/Zod-/InstaSynchP-Core'
          }, {
            pattern: /\/\/ @name[^\n]*\n/g,
            replacement: function (match) {
              return match.replace(/-/, ' ');
            }
          }]
        }
      }
    },
    copy: {
      dist: {
        flatten: true,
        expand: true,
        src: ['src/core.css'],
        dest: 'dist/',
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
        src: ['src/meta.js', 'src/events.js', 'src/core.js'],
        dest: 'dist/InstaSynchP-Core.user.js'
      }
    },
    'userscript-meta': {
      build: {
        dest: 'src/meta.js'
      }
    },
    shell: {
      gitlog: {
        command: 'git log -n 1 --pretty="%H" dist/core.css',
        options: {
          callback: function log(err, stdout, stderr, cb) {
            grunt.file.write('dist/coreCSSrev', stdout);
            cb();
          }
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-userscript-meta');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build-css', ['copy']);
  grunt.registerTask('build-js', ['shell', 'userscript-meta', 'concat',
    'string-replace'
  ]);
  grunt.registerTask('build', ['build-css', 'build-js']);
  grunt.registerTask('default', ['build', 'test']);
};
