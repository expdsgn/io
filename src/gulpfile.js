/**
 * Deps
 */

require('require-dir')('./gulp');

var gulp = require('gulp');


/**
 * Constants
 */


/**
 * Functions
 */

function watch() {

    gulp.watch([
        'site/*.twig',
        'site/templates/**/*.twig'
    ], ['templates']);

    gulp.watch([
        'site/styles/**/*',
    ], ['patterns']);

    // gulp.watch(['scripts/**/*'], ['qscripts']);
    // gulp.watch(['fonts/**/*'], ['qfonts']);
    // gulp.watch(['images/**/*'], ['qimages']);

}


/**
 * Tasks
 */

gulp.task('watch', watch);

gulp.task('default', [
    'watch'
]);