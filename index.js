var replace = require("replace");
const path = require('path');
const fs = require('fs-extra');
var Crawler = require("crawler");
const cheerio = require('cheerio');
const exec = require('child_process').exec;
var ImageDownloader = require('./image-downloader');
var Logs = require('./logs');
var imageDownloader = new ImageDownloader();
var logs = new Logs();

/***** Things Needs to specify  ****************/
const FOCUS_KEYWORD = 'set cron jobs';
const IMAGES_WEBPAGE_URL = 'https://droidtechknow.000webhostapp.com/2019/12/how-to-set-cron-jobs-in-linux-an-introduction-to-crontab';
/********************************************/


const SPLITTED_URL = IMAGES_WEBPAGE_URL.split('/');
const DATE = SPLITTED_URL.slice(3, 5).join('/'); // 2019/08
const DOMAIN = SPLITTED_URL.slice(0, 3).join('/'); //https://droidtechknow.000webhostapp.com

const SLUG = SOURCE_PATH = SPLITTED_URL[SPLITTED_URL.length - 1];
const SRC_BASE_URL = DOMAIN + '/wp-content/uploads/' + DATE
const TOP_IMAGE_NAME = FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();

logs.display(`SLUG : ${SLUG} \nSRC_BASE_URL: ${SRC_BASE_URL} \nTOP_IMAGE_NAME: ${TOP_IMAGE_NAME}`, 'cyan', false);

(function init() {
    copyTemplate().then((completed) => {
        logs.display('Copy completed', 'green', true);
        crawlHtmlFromWebpage(IMAGES_WEBPAGE_URL).then((htmlData, meta) => {
            logs.display('Copy Html from URL', 'green', true);
            replaceArticleText(htmlData, meta);
            logs.display('Replace completed', 'green', true);
            imageDownloader.init(IMAGES_WEBPAGE_URL, SOURCE_PATH + '/images').then((count) => {
                logs.display(count + ' Images Downloaded', 'green', true);
                compressImages(count).then((count) => {
                    logs.display(`${count} files Compressed Successfully`, 'green', true);
                    createMainImage('main', '45%');
                    createMainImage('side', '25%');
                    logs.display('Database Images created Succesfully', 'green', true);
                }, (err) => logs.display('Error: ' + err, 'red', true));
            }, (err) => {
                logs.display('Error: ' + err, 'red', true);
            });
        })
    }, (err) => {
        logs.display('Error: ' + err, 'red', true);
    });
})();

function crawlHtmlFromWebpage(webpageUrl) {
    return new Promise((resolve, reject) => {
        var crawler = new Crawler({
            maxConnections: 10,
            // This will be called for each crawled page
            callback: function (error, res, done) {
                if (error) {
                    reject(error);
                } else {
                    var $ = cheerio.load(res.body.replace(/<!--|-->/g, ''))
                    var title = res.$('title').text();
                    var tags = '';
                    for (var index of Object.keys(res.$('meta'))) {
                        if (res.$('meta')[index] && res.$('meta')[index].attribs && res.$('meta')[index].attribs.property && res.$('meta')[index].attribs.property == 'article:tag') {
                            tags = `${tags? tags + ', ': ''}${res.$('meta')[index].attribs.content}`
                        }
                    }
                    const meta = { title, tags };
                    resolve($('.post-entry').html(), meta);
                }
                done();
            }
        });
        crawler.queue(webpageUrl);
    })
}


function replaceArticleText(htmlData, meta) {
    replace({
        regex: '<div class="post-entry"></div>',
        replacement: `<div class="post-entry">${htmlData}</div>`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: 'alt=""',
        replacement: `alt="${FOCUS_KEYWORD}"`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<h1></h1>',
        replacement: `<h1>${meta.title}</h1>`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: SRC_BASE_URL,
        replacement: 'images',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: 'wp-image-',
        replacement: 'img img-responsive ',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<h2>',
        replacement: '<br><h2 class="subHeading-with-border">',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '&nbsp;',
        replacement: '',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<ol>',
        replacement: '<ol class="order-large-list">',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<ul>',
        replacement: '<ul class="large-list">',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<li>',
        replacement: '<li><p>',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '</li>',
        replacement: '</p></li>',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<pre>',
        replacement: '<pre class="ubuntu-terminal">',
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /width="([0-9]+)"/g,
        replacement: `width="100%"`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /height="([0-9]+)"/g,
        replacement: ``,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /<img class="(.*?)"/g,
        replacement: `<img class="img img-responsive"`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '.png',
        replacement: `.jpg`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<p><a',
        replacement: `<a`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '</a></p>',
        replacement: `</a>`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /srcset="(.*?)"/g,
        replacement: ``,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /sizes="(.*?)"/g,
        replacement: ``,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });
}

function copyTemplate() {
    return new Promise((resolve, reject) => {
        let source = path.resolve(__dirname, 'template')
        let destination = path.resolve(__dirname, `${SOURCE_PATH}`);

        fs.copy(source, destination)
            .then((completed) => {
                resolve(completed);
            })
            .catch(err => {
                reject(err);
            })
    })
}

function compressImages(count) {
    return new Promise((resolve, reject) => {
        let pwd = path.resolve(__dirname, `${SOURCE_PATH}/images`);
        const myShellScript = exec(`sh image-convertor.sh ${pwd}/`);
        myShellScript.stdout.on('data', (data) => {
            logs.display(data, 'blue', false);
            if (data.includes(count + ' file')) {
                resolve(count)
            }
        });
        myShellScript.stderr.on('data', (err) => {
            reject(err);
        });
    })
}

function createMainImage(append, rate) {
    let pwd = path.resolve(__dirname, `${SOURCE_PATH}/images`);

    const copy = exec(`cp  ${pwd}/${TOP_IMAGE_NAME}.jpg ${pwd}/${TOP_IMAGE_NAME}-${append}.jpg`);
    copy.stdout.on('data', (data) => {
        logs.display(data, 'blue', false);
    });
    copy.stderr.on('data', (err) => {
        logs.display('Error: ' + err, 'red', true);
    });

    // This is why because copying files takes time, so we doing small hack here
    setTimeout(() => {
        const myShellScript = exec(`mogrify -resize ${rate}  ${pwd}/${TOP_IMAGE_NAME}-${append}.jpg`);
        myShellScript.stdout.on('data', (data) => {
            logs.display(data, 'blue', false);
        });
        myShellScript.stderr.on('data', (err) => {
            logs.display('Error: ' + err, 'red', true);
        });
    }, 2000);
}
