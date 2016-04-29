/**
 * Deps
 */

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    data = require('gulp-data'),
    nano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    stylus = require('stylus'),
    es = require('event-stream'),
    addsrc = require('gulp-add-src');


/**
 * Constants
 */

var BUILD = '../surge';


/**
 * Functions
 */

function fonts() {

    var src = [
        'Siro-ExtraLight',
        'Siro-Light',
        'Siro-SemiBold'
    ];

    for (var i = src.length - 1; i >= 0; i--) {
        gulp.src('fonts/' + src[i] + '.{ttf,woff,eot,svg}')
            .pipe(gulp.dest(BUILD + '/fonts'));
    }

}

function patterns() {

    // Service
    var service = this;

    // service.render = render;
    service.styl = styl;
    service.logging = logging;


    // Variables
    var src = [
        'site/styles/**/*',
        '!site/styles/**/*.mixins.styl',
        '!site/styles/**/*.vars.styl',
        'node_modules/animate.css/source/_base.css',
        'node_modules/animate.css/source/fading_entrances/fadeInDown.css',
        'node_modules/animate.css/source/fading_entrances/fadeInLeft.css',
        'node_modules/animate.css/source/fading_entrances/fadeInRight.css',
        'node_modules/animate.css/source/fading_entrances/fadeInUp.css'
    ];

    var imports = [
        'site/styles/patterns/',
        'site/styles/base/',
        'site/styles/components/'
    ];

    var stylesheet = 'site';


    // Functions
    function logging(log) {

        console.log('---------------');
        console.log(log);
        // if (log.val) {
        //     console.log(log.filename);
        //     console.log(log.lineno + ':' + log.column + ' | ' + log.val + log.type);
        // } else {
        //     console.log(log);
        // }

    }

    function styl(file, callback) {

        stylus(String(file.contents))
            .set('filename', stylesheet + '.concat.css')
            .set('paths', imports)
            .define('log', service.logging)
            .render(function(err, css) {
                if (err) throw err;
                file.contents = new Buffer(css);
                callback(undefined, file);
            });

    }


    // Pipe
    gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(concat(stylesheet + '.concat.styl'))
        .pipe(data(service.styl))
        .pipe(rename(stylesheet + '.concat.css'))
        // .pipe(gulp.dest(BUILD + '/styles'))
        .pipe(gulp.dest('../temp'))
        .pipe(nano())
        .pipe(rename(stylesheet + '.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(BUILD + '/styles'));


}


/**
 * Tasks
 */

gulp.task('patterns', patterns);
gulp.task('patterns:fonts', fonts);


