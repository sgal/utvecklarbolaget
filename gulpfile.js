/* jshint node:true */
'use strict';
// generated on 2016-05-15 using generator-simpler-gulp-webapp 1.0.2
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('calculator', ['calculatorstyles'], function() {
  return gulp.src('app/calculator/*.html')
    .pipe($.inject(gulp.src('.tmp/calculatorstyles/*.css'), {
      starttag: '/* inject:calculatorstyle */',
      endtag: '/* endinject */',
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    // .pipe($.inlineCss({removeStyleTags: false, applyStyleTags: true}))
    .pipe($.inlineSource({ compress: false }))
    .pipe(gulp.dest('.tmp/calculator'));
});

gulp.task('calculator:dist', ['calculatorstyles'], function() {
  return gulp.src('app/calculator/*.html')
    .pipe($.inject(gulp.src('.tmp/calculatorstyles/*.css'), {
      starttag: '/* inject:calculatorstyle */',
      endtag: '/* endinject */',
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    .pipe($.inject(gulp.src([
      'app/scripts/vendor/jquery-1.11.0.min.js',
      'app/scripts/vendor/jquery.validate.min.js'
    ]), {
      starttag: '<!-- inject:jquery -->',
      endtag: '<!-- endinject -->',
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return '<script type="text/javascript">' + file.contents.toString('utf8') + '</script>';
      }
    }))
    .pipe($.inlineSource({compress: false}))
    .pipe(gulp.dest('dist/calculator'));
});

gulp.task('calculatorstyles', function () {
  return gulp.src('app/calculator/main.scss')
    .pipe($.plumber())
    .pipe($.sass({
      style: 'expanded'
    }))
    .pipe($.autoprefixer({browsers: ['last 4 versions']}))
    .pipe(gulp.dest('.tmp/calculatorstyles'));
});

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.sass({
      style: 'expanded'
    }))
    .pipe($.autoprefixer({browsers: ['last 4 versions']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['clearscripts', 'styles', 'calculator', 'calculator:dist'], function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/*.html')
    .pipe($.inject(gulp.src('.tmp/calculator/index.html'), {
      starttag: '<!-- inject:calculator -->',
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    .pipe($.inject(gulp.src('dist/calculator/index.html'), {
      starttag: '<!-- inject:calculator:dist -->',
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    //.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('html:dist', ['styles', 'calculator', 'calculator:dist'], function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if(function(file) {
      return /\.js$/.test(file.path);
    }, $.uglify()))
    .on('error', function (err) { console.log('[Error]', err.toString()); })
    .pipe($.if(function(file) {
      return /\.css$/.test(file.path);
    }, $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.inject(gulp.src('.tmp/calculator/index.html'), {
      starttag: '<!-- inject:calculator -->',
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    .pipe($.inject(gulp.src('dist/calculator/index.html'), {
      starttag: '<!-- inject:calculator:dist -->',
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8');
      }
    }))
    //.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('.tmp'))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('.tmp/images'))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  })
  .pipe(gulp.dest('.tmp'))
  .pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));
gulp.task('clearscripts', require('del').bind(null, ['.tmp/scripts']));

// Watch Files For Changes & Reload
gulp.task('serve', ['html', 'images', 'extras'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp']
  });

  gulp.watch(['app/**/*.html'], ['html', reload]);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/calculator/**/*.*'], ['html', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['html', reload]);
  gulp.watch(['app/images/**/*'], ['images', reload]);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    '.tmp/*.html',
    '.tmp/styles/**/*.css',
    '.tmp/scripts/**/*.js',
    '.tmp/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['html:dist', 'images', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
