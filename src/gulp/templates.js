/**
 * Deps
 */

var gulp = require('gulp'),
    data = require('gulp-data'),
    matter = require('gray-matter'),
    twig = require('gulp-twig'),
    resumePdfToJson = require('resume-pdf-to-json'),
    htmlreplace = require('gulp-html-replace'),
    fs = require('fs');


/**
 * Constants
 */

var BUILD = '../surge';
var DATA = 'data/';
var CONFIG = {
    'styles': {
        src: 'styles',
        tpl: '<link rel="stylesheet" href="%s/site.min.css">'
    },
    // 'scripts': {
    //     src: 'scripts',
    //     tpl: '<script src="%s/site.min.js"></script>'
    // }
    // <!-- build:scripts -->
    // <!-- endbuild -->
};



/**
 * Functions
 */

function templates() {


    var service = this;

    service.matter = m;
    service.pdftojson = pj;
    service.site = site;

    var src = [
        'site/*.twig',
        '!site/resume.twig'
    ];


    function site(data) {
        var d = fs.readFileSync(DATA + 'site.json', 'utf8');
        data.site = JSON.parse(d);
        return data;
    }

    function m(file) {
        var m = matter(String(file.contents));
        file.contents = new Buffer(m.content);
        // get site data
        m.data = service.site(m.data);
        return m.data;
    }

    function pj(file) {

        var path = DATA + 'DevonHirth.pdf';
        var output = DATA + 'DevonHirth.json';

        return resumePdfToJson(path, {'output': output})
            .then(function(data) {
                var mdata = service.matter(file);
                mdata.resume = data;
                return mdata;
            });

    }

    // General Templates
    gulp.src(src)
        // read front matter data in template
        .pipe(data(service.matter))
        // render templates in twig
        .pipe(twig())
        // replace html build blocks
        .pipe(htmlreplace(CONFIG))
        // pipe file to the build destination
        .pipe(gulp.dest(BUILD));

    // Resume
    gulp.src('site/resume.twig')
        // Unique Resume Data Pipe
        .pipe(data(service.pdftojson))
        .pipe(twig())
        .pipe(htmlreplace(CONFIG))
        .pipe(gulp.dest(BUILD));


}


/**
 * Tasks
 */

gulp.task('templates', templates);

