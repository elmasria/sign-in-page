var gulp = require('gulp')
	uglify = require('gulp-uglify'),
	merge = require('merge-stream');
	strip = require('gulp-strip-comments'),
	htmlmin = require('gulp-htmlmin'),
	removeHtmlComments = require('gulp-remove-html-comments'),
	sass = require('gulp-sass');
	stripCssComments = require('gulp-strip-css-comments'),
	cleanCSS = require('gulp-clean-css'),
	cssmin = require('gulp-cssmin'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload,
	development = true;

var paths = {
	node_module: './node_modules/',
	source :'./src/'
};

if (development) {
	paths.webroot= './dist/';
}else{
	paths.webroot= './dist/';
}

paths.templatesDest = paths.webroot + 'templates';
paths.jsDest = paths.webroot + 'js';
paths.cssDest = paths.webroot + 'css';
paths.fontDest = paths.webroot + 'fonts';
paths.imagDest = paths.webroot + 'images';

/// Vendors


// JQuery
paths.jquery = paths.node_module + 'jquery/dist/jquery.js';

// Bootstrap
paths.bootstrapCSS = paths.node_module + 'bootstrap/dist/css/bootstrap.css';
paths.bootstrapJS = paths.node_module + 'bootstrap/dist/js/bootstrap.js';
paths.bootstrapFonts = paths.node_module + 'bootstrap/dist/fonts/**/*';


/// Project

// JS
paths.app = paths.source + 'js/app.js';


// HTML
paths.mainHtml = paths.source  +'index.html';

// SCSS
paths.mainSCSS = paths.source  +'scss/main.scss';

// Static
paths.favicon = paths.source + 'images/favicon.ico';
paths.images = paths.source + 'images/**/*';
paths.scss = paths.source + 'scss/**/*.scss';


gulp.task('default',['copy:static',
	'copy:images',
	'minify:html',
	'min:css',
	'min:js',
	'watch',
	'server']);

gulp.task('server', function () {
	browserSync.init({
		server: {
			baseDir: './'
		},
		port: 2109,
		ui: {
			port: 2100
		}
	});
});

gulp.task('watch', function () {
	gulp.watch(paths.mainHtml, ['minify:html']);

	gulp.watch([paths.app], ['min:js']);

	gulp.watch([paths.mainSCSS], ['min:css']);
});

gulp.task('clean', function () {
	return gulp.src(paths.webroot + '*')
	.pipe(clean({ force: true }));
});

gulp.task('copy:static', function(){
	gulp.src([paths.favicon])
	.pipe(gulp.dest(paths.webroot));

	gulp.src([paths.bootstrapFonts])
	.pipe(gulp.dest(paths.fontDest));
});

gulp.task('copy:images', function () {
	return gulp.src([paths.images])
	.pipe(gulp.dest(paths.imagDest));
});

gulp.task('minify:html', function() {
	return gulp.src([paths.mainHtml])
	.pipe(removeHtmlComments())
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest(paths.webroot))
	.pipe(reload({stream: true}));
});

gulp.task('min:js', function() {
	return gulp.src([paths.jquery,
		paths.bootstrapJS,
		paths.app])
	.pipe(concat(paths.jsDest +'/app.min.js'))
	.pipe(strip())
	.pipe(uglify())
	.pipe(gulp.dest('.'))
	.pipe(reload({stream: true}));
});

gulp.task('min:css', function () {
	var cssStream = gulp.src([paths.bootstrapCSS])
	.pipe(concat('css-files.css'))
	.pipe(stripCssComments({ preserve: false }))
	.pipe(cleanCSS({ compatibility: 'ie8' })),

	scssStream = gulp.src([paths.scss])
	.pipe(concat('css-files.css'))
	.pipe(sass({
		outputStyle: 'compressed'
	}).on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 2 versions']
	}))
	.pipe(stripCssComments({ preserve: false }))
	.pipe(cleanCSS({ compatibility: 'ie8' })),

	mergedStream = merge(cssStream, scssStream)
		.pipe(concat(paths.cssDest + '/app.min.css'))
		.pipe(cssmin())
		.pipe(gulp.dest('.'))
		.pipe(reload({stream: true}));


	return mergedStream;
});

