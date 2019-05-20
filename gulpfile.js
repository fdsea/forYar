var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var cssMin = require('gulp-css');
var autoprefixer = require('gulp-autoprefixer');


gulp.task('css', function(done) {
   gulp.src('./app.css')
      .pipe(autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
      }))
      .pipe(concat('app.css'))
      .pipe(cssMin())
      .pipe(gulp.dest('./dist'))
      .pipe(browserSync.stream());
      done();
  });

  gulp.task('js', function() {
    return gulp.src('./app.js')
      .pipe(concat('app.js'))
      .pipe(minify())
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('serve', function(done) {

    browserSync.init({
        server: "./"
    });
    gulp.watch("./dist/app.css").on('change', () => {
      browserSync.reload();
      done();
    });
    gulp.watch('./app.js', gulp.series('js'));
    gulp.watch("./app.css", gulp.series('css'));
    gulp.watch("./app.css").on('change', () => {
      browserSync.reload();
      done();
    });
    gulp.watch('./app.js').on('change', () => {
      browserSync.reload();
      done();
    });
    gulp.watch("./index.html").on('change', () => {
      browserSync.reload();
      done();
    });
    done();
  });
  gulp.task('dev', gulp.series('css', 'js', 'serve'));
  //gulp.task('concat', gulp.series('css'));
  
  