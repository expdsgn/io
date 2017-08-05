

'use strict'


/**
 * Requirements
 */

const gulp = require('gulp'),
      data = require('gulp-data'),
      matter = require('gray-matter'),
      twig = require('gulp-twig'),
      resumePdfToJson = require('resume-pdf-to-json'),
      htmlreplace = require('gulp-html-replace'),
      fs = require('fs'),
      path = require('path'),
      extend = require('util')._extend,
      rename = require('gulp-rename'),
      marked = require('marked');


/**
 * Constants
 */

const BUILD = '../surge';
const DATA = 'data/';
const CONFIG = {
    'styles': {
        src: 'styles',
        tpl: '<link rel="stylesheet" href="/%s/site.min.css">'
    },
    // 'scripts': {
    //     src: 'scripts',
    //     tpl: '<script src="/%s/site.min.js"></script>'
    // }
    // <!-- build:scripts -->
    // <!-- endbuild -->
};

const CONTENT_BLOG = 'blog';
const TEMPLATES_POST = 'site/templates/base/page.post.twig';



/**
 * Functions
 */

function templates() {


    let service = {};

    service.matter = matterservice;
    service.pdftojson = pdftojsonservice;
    service.site = site;
    service.route = route;
    service.readblog = readblog;
    service.dest = dest;

    let src = [
        'site/*.twig',
        'site/work/*.twig',
        '!site/sitemap.xml.twig'//,
        //'!site/resume.twig'
    ];

    let resume = 'site/resume.twig';
    let sitemap = 'site/sitemap.xml.twig';
    let blog = CONTENT_BLOG;
    let post = TEMPLATES_POST;


    function site(data, file) {

        try {
            var name = (file) ? path.basename(file.path).split('.')[0] : 'site';
            var d = fs.readFileSync(DATA + name + '.json', 'utf8');
            if (name === 'site') {
                data[name] = JSON.parse(d);
            } else {
                data = extend(data, JSON.parse(d));
            }
        } catch(e) {
            // console.log(e);
        }

        return data;

    }

    function route(data, file) {

        let r = file.path.split('site/')[1];
        r = r.split('.')[0];
        data.route = (r === 'index') ? '' : '/' + r;

        return data;

    }

    function matterservice(file) {

        let f = file;
        let m = matter(String(f.contents));
        let data = service.site(m.data);

        data = service.site(data, f);

        // get page data if it exits
        data = service.route(data, f);

        return data;

    }

    function pdftojsonservice(file) {

        let path = DATA + 'DevonHirth.pdf';
        let output = DATA + 'DevonHirth.json';

        return resumePdfToJson(path, {'output': output})
            .then(function(data) {
                let mdata = service.matter(file);
                mdata.resume = data;
                return mdata;
            });

    }

    function readblog(err, files) {

        for (let i = 0; i < files.length; i++) {

            let slug = files[i].split('.')[1];
            let date = files[i].split('.')[0];

            fs.readFile(`${blog}/${files[i]}`, 'utf8', function(err, d){

                let title = d.split('\n')[0].replace(/#/g, '').trim();
                let content = d.split('\n');

                content.splice(0, 1); // remove extra title
                content = content.join('\n');

                let c = {
                    'title': title,
                    'content': marked(content),
                    'published': date,
                    'slug': slug
                };

                // add site data
                c = service.site(c);

                gulp.src(post)
                    .pipe(data(c))
                    .pipe(twig())
                    .pipe(htmlreplace(CONFIG))
                    .pipe(rename(`${slug}.html`))
                    .pipe(gulp.dest(`${BUILD}/blog`));

            });

        }

    }

    function dest(file) {

        let dir = __dirname.split('/').slice(0, -1).join('/') + '/site';

        dir = path.dirname(file.path).replace(dir, '');

        return BUILD + '/' + dir;

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
        .pipe(gulp.dest(service.dest));

    // Resume
    // gulp.src(resume)
    //     // Unique Resume Data Pipe
    //     .pipe(data(service.pdftojson))
    //     .pipe(twig())
    //     .pipe(htmlreplace(CONFIG))
    //     .pipe(gulp.dest(BUILD));

    // Sitemap
    gulp.src(sitemap)
        .pipe(data(service.matter))
        .pipe(twig())
        .pipe(rename('sitemap.xml'))
        .pipe(gulp.dest(BUILD));

    // Blog
    // fs.readdir(blog, service.readblog);


}


/**
 * Tasks
 */

gulp.task('templates', templates);

