/**
 * Deps
 */

var gulp = require('gulp'),
    data = require('gulp-data'),
    matter = require('gray-matter'),
    twig = require('gulp-twig'),
    htmlreplace = require('gulp-html-replace'),
    fs = require('fs'),
    path = require('path'),
    extend = require('util')._extend,
    rename = require('gulp-rename');


/**
 * Constants
 */

var BUILD = '../deploy';
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
    service.site = site;
    service.route = route;

    var src = [
        'site/*.twig',
        '!site/sitemap.xml.twig'
    ];

    var sitemap = 'site/sitemap.xml.twig';


    function site(data, file) {
        try {
            var name = (file) ? path.basename(file.path).split('.')[0] : 'site';
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
        var data = service.site(m.data);

        // get site data
        data = service.site(data, f);
        // get page data if it exits
        data = service.route(data, f);

        return data;
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

