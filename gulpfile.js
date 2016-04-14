var gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  babel = require('babelify'),
  concat = require('gulp-concat'),
  angularTranslate = require('gulp-angular-translate-extract'),
  connect = require('gulp-connect');

function compile(watch) {
  var bundler = watchify(browserify('./app/init.js', {debug: true, base: './app'}).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function (err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }

  if (watch) {
    bundler.on('update', function () {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function compileWidget(watch) {
  var bundler = watchify(browserify('./widget/init.js', {debug: true, base: './widget'}).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function (err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('widget-app.js'))
      .pipe(buffer())
      //.pipe(sourcemaps.init({loadMaps: true}))
      //.pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }

  if (watch) {
    bundler.on('update', function () {
      console.log('-> widget bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
}

function watchWidget() {
  return compileWidget(true);
}

gulp.task('sass', function () {
  gulp.src('./app/assets/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./app/assets/css'));
});

gulp.task('translate', function () {
  return gulp.src('app/views/**/*.html')
    .pipe(angularTranslate({
      defaultLang: 'en',
      lang: ['en', 'ru', 'uk'],
      dest: './app/locale'
    }))
    .pipe(gulp.dest('./app/locale'));
});
gulp.task('concat', function() {
  return gulp.src(['./widget/intro.js', './bower_components/angular/angular.js', './bower_components/angular-resource/angular-resource.js', './dist/widget-app.js', './widget/outro.js'])
    .pipe(concat('widget.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', function () {
  return compile();
});
gulp.task('watchWidget', function () {
  return watchWidget();
});
gulp.task('watch', /*['watchWidget'],*/ function () {
  gulp.watch('./app/views/**/*.html', ['translate']);
  gulp.watch('./app/assets/scss/**/*.scss', ['sass']);

  gulp.watch('./dist/widget-app.js', ['concat']);
  return watch();
});

gulp.task('connect', ['watch'], function () {
  connect.server({port: 3000, livereload: true});
});

gulp.task('default', ['connect']);