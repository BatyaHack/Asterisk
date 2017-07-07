var gulp          = require('gulp'),
  sass            = require('gulp-sass'),
  autoprefixer    = require('gulp-autoprefixer'),
  csso            = require('gulp-csso'),
  rename          = require("gulp-rename"),
  plumber         = require('gulp-plumber'),
  notify          = require("gulp-notify"),
  watch           = require('gulp-watch'),
  browserSync     = require('browser-sync').create(),
  imagemin        = require('gulp-imagemin'),
  uglify          = require('gulp-uglify'),
  svgSprite       = require('gulp-svg-sprite'),
  gulpif          = require('gulp-if'),
  debug           = require('gulp-debug'),
  changed         = require('gulp-changed'),
  uncss           = require('gulp-uncss'),
  minify          = require('gulp-minify'),
  del             = require('del');


//HTML
gulp.task('html', function() {
  return gulp.src('./src/*.html', {
      since: gulp.lastRun('html')
    })
    .pipe(changed('./build'))
    .pipe(debug({title: 'html'}))
    .pipe(gulp.dest("./build"));
});


//SASS STYLE
gulp.task('style', function() {
  return gulp.src('./src/sass/style.scss')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: "Ой ой ой ошибочка",
          message: err.message,
          sound: false,
        };
      })
    }))
    .pipe(sass())
    // .pipe(uncss({
    //   html: ['./build/*.html']
    // }))
    .pipe(autoprefixer({
      browsers: ['last 15 version']
    }))
    .pipe(gulp.dest("./build/css/"))
    .pipe(csso())
    .pipe(rename('style-min.css'))
    .pipe(gulp.dest("./build/css/"));
});


//JS
gulp.task('js', function(){
  return gulp.src('./src/js/**/*.js')
    .pipe(changed('./build/js/'))
    .pipe(debug({title: 'js'}))
    .pipe(minify({
      ext:{
            src:'.js',
            min:'.min.js'
        },
    }))
    .pipe(gulpif('*.min.js', gulp.dest('build/js/min'), gulp.dest('build/js')));
});



//IMG ind SVG
gulp.task('img', function() {
  return gulp.src(['./src/img/**/*.{png,jpg,gif,jpeg,svg}', '!./src/img/sprites/*.svg'], {
      since: gulp.lastRun('watch_img')
    })
    .pipe(changed('./build/img/'))
    .pipe(debug({title: 'img'}))
    // .pipe(uglify()) // какой нахуй пидарас писал этот модуль ууууу сука!
    .pipe(imagemin())
    .pipe(gulp.dest('./build/img/'));
});

//Generation sprite
gulp.task('sprite', function() {
  return gulp.src('./src/img/sprites/*.svg')
    .pipe(imagemin())
    .pipe(svgSprite({
      mode: {
        css: {
          dest: '.',
          bust: false,
          sprite: 'sprite.svg',
          layout: 'vertical',
          prefix: '.',
          dimensions: true,
          render: {
            scss: {
              dest: 'sprite.scss'
            }
          }
        }
      }
    }))
    .pipe(gulpif('*.scss', gulp.dest('src/sass/tmp'), gulp.dest('build/css')));
});


//SERVER
gulp.task('serve', function() {
  browserSync.init({
    server: 'build'
  });
  browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});



gulp.task('watch_html', function() {
  return watch('./src/*.html', gulp.task('html'));
});

gulp.task('watch_styles', function() {
  return watch('./src/sass/**/*.scss', gulp.task('style'));
});

gulp.task('watch_js', function(){
  return watch('.src/js/**/*.js', gulp.task('js'));
});

gulp.task('watch_img', function() {
  return watch(['./src/img/**/*.{png,jpg,gif,jpeg,svg}', '!./src/img/sprites/*.svg'], gulp.task('img'));
});

gulp.task('watch_sprite', function() {
  return watch('./src/img/sprites/*.svg', gulp.task('sprite'));
});




//delete
gulp.task('del', function(){
  return del('build');
});

//build
gulp.task('build',
  gulp.series('del', 'html', 'style', 'js', 'img', 'sprite'));


//default
gulp.task('default',
  gulp.series(gulp.parallel('watch_html', 'watch_styles', 'watch_img', 'watch_sprite', 'watch_js', 'serve')));
