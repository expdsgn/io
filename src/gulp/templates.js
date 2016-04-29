/**
 * Deps
 */

var gulp = require('gulp'),
    data = require('gulp-data'),
    matter = require('gray-matter'),
    twig = require('gulp-twig'),
    resumePdfToJson = require('resume-pdf-to-json'),
    htmlreplace = require('gulp-html-replace'),
    fs = require('fs'),
    path = require('path'),
    extend = require('util')._extend,
    rename = require('gulp-rename');


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

    service.matter = matterservice;
    service.pdftojson = pdftojsonservice;
    service.site = site;
    service.route = route;

    var src = [
        'site/*.twig',
        '!site/sitemap.xml.twig',
        '!site/resume.twig'
    ];

    var resume = 'site/resume.twig';
    var sitemap = 'site/sitemap.xml.twig';


    function site(data, file) {
        try {
            var name = (file) ? path.basename(file.path).split('.')[0] : 'site';
            // name = name || 'site';
            var d = fs.readFileSync(DATA + name + '.json', 'utf8');
            if (name === 'site') {
                data[name] = JSON.parse(d);
            } else {
                data = extend(data, JSON.parse(d));
            }
        } catch(e) {}
        return data;
    }

    function route(data, file) {
        var r = file.path.split('site/')[1];
        r = r.split('.')[0];
        data.route = (r === 'index') ? '' : '/' + r;
        return data;
    }

    function matterservice(file) {
        var f = file;
        var m = matter(String(f.contents));
        // var name = path.basename(file.path).split('.')[0];
        var data = service.site(m.data);

        data = service.site(data, f);
        // data = service.url(data, file);

        // file.contents = new Buffer(m.content);
        // get site data
        // m.data = service.site(m.data);
        // get page data if it exits
        data = service.route(data, f);
        // console.log(name);
        // data = service.site(data, file);

        return data;
    }

    function pdftojsonservice(file) {

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
    gulp.src(resume)
        // Unique Resume Data Pipe
        .pipe(data(service.pdftojson))
        .pipe(twig())
        .pipe(htmlreplace(CONFIG))
        .pipe(gulp.dest(BUILD));

    gulp.src(sitemap)
        .pipe(data(service.matter))
        .pipe(twig())
        .pipe(rename('sitemap.xml'))
        .pipe(gulp.dest(BUILD));

}


/**
 * Tasks
 */

gulp.task('templates', templates);

