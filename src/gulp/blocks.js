/**
 * Deps
 */

var gulp = require('gulp');
var htmlreplace = require('gulp-html-replace');


/**
 * Constants
 */

var BUILD = '../surge';


/**
 * Functions
 */

function blocks() {


    gulp.src('site/base/index.html')
        .pipe(htmlreplace({
            'styles': {
                src: 'styles',
                tpl: '<link rel="stylesheet" src="%s/%f.css">'
            },
            'scripts': {
                src: 'scripts',
                tpl: '<script src="%s/%f.js"></script>'
            }
        }))
        .pipe( gulp.dest(BUILD) );


}


/**
 * Tasks
 */

gulp.task('blocks', blocks);

