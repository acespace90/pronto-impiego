'use strict';

var gulp           =  require('gulp'),
    concat         =  require('gulp-concat'),
    uglify         =  require('gulp-uglify'),

    newer          =  require('gulp-newer'),
    imagemin       =  require('gulp-imagemin'),
    svgmin         =  require('gulp-svgmin'),
    rename         =  require('gulp-rename'),

    sass           =  require('gulp-sass'),
    sassGlob       =  require('gulp-sass-glob'),
    sourcemaps     =  require('gulp-sourcemaps'),
    cssmin         =  require('gulp-cssmin'),
    autoprefixer   =  require('gulp-autoprefixer'),

    browserSync    =  require('browser-sync').create(),

    nunjucksRender = require('gulp-nunjucks-render'),

    // This two modules are for handling the Delete Event on Watch
    del            =  require('del'),
    path           =  require('path');

var bwpath  = ('bower_components/');

/* -------------- Nunjucks -------------- */

gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('src/views/pages/*.html')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['src/views/']
    }))
  // output files in app folder
  .pipe(gulp.dest('build'))
});

/* -------------- Sass/Css -------------- */

gulp.task('sass', function () {
  gulp.src('src/sass/main.scss')
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({stream:true}));
});

/* -------------- Copy Bower Css -------------- */

gulp.task('copy-bower-css', function () {
  gulp.src([
    bwpath + 'swiper/dist/css/swiper.min.css',
    bwpath + 'select2/dist/css/select2.min.css'
  ])
    .pipe(rename({
      prefix: "_",
      extname: '.scss'
    }))
    // remove the '.min' suffix
    .pipe(rename(function(opt) {
      opt.basename = opt.basename.replace('.min', '');
      return opt;
    }))
    .pipe(gulp.dest('./src/sass/08-vendor'))
});


/* -------------- Imagemin -------------- */

gulp.task('imagemin', ['svgmin'] ,function () {
  gulp.src('src/images/**')
    .pipe(newer('build/images/'))
    .pipe(imagemin({
      progressive: true,
    }))
    .pipe(gulp.dest('build/images/'))
    .pipe(browserSync.reload({stream:true}));
});

/* -------------- SVGmin -------------- */

gulp.task('svgmin', function () {
  return gulp.src('src/images/svgs/**/*.svg')
    .pipe(svgmin({
      plugins: [{
        removeDoctype: true,
      },{
        removeComments: true,
      },{
        removeStyleElement: true
      }]
    }))
    .pipe(gulp.dest('build/images/svgs/'))
});

/* -------------- Js -------------- */

gulp.task('headjs', function() {
  gulp.src([])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('head.js'))
    .pipe(sourcemaps.write('../js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('footerjs', function() {
  gulp.src([
    bwpath + 'jquery/dist/jquery.min.js',
    bwpath + 'swiper/dist/js/swiper.jquery.min.js',
    bwpath + 'inline-svg/dist/inlineSVG.min.js',
    bwpath + 'select2/dist/js/select2.min.js',
    'src/js/inline-svg.js',
    'src/js/addCompanies.js'
  ])
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(concat('footer.min.js'))
  .pipe(sourcemaps.write('../js'))
  .pipe(gulp.dest('build/js'));
});


gulp.task('blockjs', function() {
  gulp.src('src/js/blocks/**/*.js')
    .pipe(gulp.dest('build/js/blocks'));
});


/* -------------- Watch -------------- */

gulp.task('watch', function () {
  gulp.watch('src/views/**/**/*.+(html|nunjucks)', ['nunjucks']);
  gulp.watch('src/sass/**/**/*.scss', ['sass']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/js/vendor/**/*.js', ['scripts']);
  gulp.watch('build/**/*.html', browserSync.reload);

  // Handling the Delete Event on Watch
    var watcher = gulp.watch('src/images/**', ['imagemin']);
    watcher.on('change', function (event) {
      if (event.type === 'deleted') {
        var filePathFromSrc = path.relative(path.resolve('src'), event.path);
        var destFilePath = path.resolve('build', filePathFromSrc);
        del.sync(destFilePath);
      }
    });

});

/* -------------- BrowserSync -------------- */

gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: "localhost/pronto-impiego/build/index.html",
    open: true
  });
});

gulp.task('scripts', [
  'headjs',
  'footerjs',
  'blockjs',
]);

gulp.task('default', [
  'nunjucks',
  'sass',
  'copy-bower-css',
  'scripts',
  'browser-sync',
  'watch'
]);