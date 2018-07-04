/*
 * jQuery Valida
 * @author Rogerio Taques
 * © 2018, Abtz Labs.
 */

// ~~ IMPORTS ~~
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var minify = require('gulp-minify');
var named = require('vinyl-named');

// ~~ VARS ~~

var FILE_PATH = {
  DIST: './src',
  SRC: './src'
};

// ~~ TASKS ~~

// Starts the server and file watchers
gulp.task('server', ['javascript'], function() {
  browserSync.init({
    server: {
      baseDir: './',
      directory: true
    },
    open: false,
    notify: false,
    port: 9876
  });

  // Re-process the javascript
  gulp.watch(
    [
      FILE_PATH.SRC + '/**/*.js',
      '!' + FILE_PATH.SRC + '/valida.2*.js',
      '!' + FILE_PATH.SRC + '/valida.*-min.js'
    ],
    ['javascript']
  );

  // Re-process the javascript
  gulp.watch('./sample/*.html', function() {
    return browserSync.reload({ stream: true });
  });
});

// Transpile, parse and bundle javascript files
gulp.task('javascript', function(cb) {
  return gulp
    .src([
      FILE_PATH.SRC + '/*.js',
      '!' + FILE_PATH.SRC + '/valida.2*.js',
      '!' + FILE_PATH.SRC + '/valida.*-min.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(named())
    .pipe(minify({ preserveComments: 'some' }))
    .pipe(gulp.dest(FILE_PATH.DIST))
    .pipe(browserSync.reload({ stream: true }));
});

// Start development ...
gulp.task('default', ['server']);
