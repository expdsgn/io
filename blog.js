

'use strict'

/**
 * Requirements
 */

const medium = require('medium-sdk'),
      fs = require('fs');//,
      //gulp = require('gulp'),
      // data = require('gulp-data'),
      // twig = require('gulp-twig'),
      // htmlreplace = require('gulp-html-replace'),
      // rename = require('gulp-rename'),
      // marked = require('marked');


/**
 * Constants
 */

const SRC_CONTENT = 'blog';
const SPACE = '-';
const CREDS = JSON.parse(fs.readFileSync('../credentials.json', 'utf8'));
// const TEMPLATES_POST = '../site/blog/post.twig';
// const BUILD = '../../surge/blog';
// const REPLACE = {
//     'styles': {
//         src: 'styles',
//         tpl: '<link rel="stylesheet" href="/%s/site.min.css">'
//     },
//     // 'scripts': {
//     //     src: 'scripts',
//     //     tpl: '<script src="/%s/site.min.js"></script>'
//     // }
//     // <!-- build:scripts -->
//     // <!-- endbuild -->
// };

const CLIENT = new medium.MediumClient({
    clientId: CREDS.MEDIUM.ID,
    clientSecret: CREDS.MEDIUM.SECRET,
});

CLIENT.setAccessToken(CREDS.MEDIUM.TOKEN);


/**
 * Functions
 */

function post(err, user) {


    let status = (process.argv[3]) ? process.argv[3].toUpperCase() : 'DRAFT';
    let format = (process.argv[4]) ? process.argv[4].toUpperCase() : 'MARKDOWN';
    let title = () => process.argv[2]
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g, SPACE);

    let content = false;
    // let src = TEMPLATES_POST;
    // let dest = BUILD;
    // let rep = REPLACE;


    let service = {};

    service.read = read;
    service.publish = publish;
    // service.templates = templates;


    fs.readdir(SRC_CONTENT, service.read);


    function read(err, files) {

        for (let i = 0; i < files.length; i++) {
            if (files[i].split('.')[1] === title()) {
                content = fs.readFileSync(`${SRC_CONTENT}/${files[i]}`, 'utf8');
            }
        }

        if (content === false) {
            console.error(`Error: No content found for "${process.argv[2]}"`);
            return;
        }

        service.publish(content, process.argv[2]);

    }

    function publish(content, title) {

        CLIENT.createPost(
            {
                userId: user.id,
                title: title,
                contentFormat: medium.PostContentFormat[format],
                content: content,
                publishStatus: medium.PostPublishStatus[status]
            },
            function(err, post) {
                if (!err) {
                    console.log(`Success: Published "${post.title}" as ${post.publishStatus}. ${post.url}`);
                    //service.templates(post, content);
                    return;
                }
                console.log(`Error: ${err}`);
            }
        );

    }

    // function templates(post, content) {

    //     let d = post;

    //     // compile markdown content to html
    //     d.content = marked(content);

    //     gulp.src(src)
    //         .pipe(data(d))
    //         .pipe(twig())
    //         .pipe(htmlreplace(rep))
    //         .pipe(rename(`${title()}.html`))
    //         .pipe(gulp.dest(dest));

    // }

}

function user(cb) {

    CLIENT.getUser(function(err, user) {

        cb(err, user);

    });

}


/**
 * Tasks
 */

user(post);

