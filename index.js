var replace = require("replace");
const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
var CONSTANTS = require('./constants')
var ImageDownloader = require('./image-downloader');
var WebpageCrawler = require('./webpageCrawler');
var Logs = require('./logs');
var imageDownloader = new ImageDownloader();
var webpageCrawler = new WebpageCrawler();
var logs = new Logs();


const SPLITTED_URL = CONSTANTS.IMAGES_WEBPAGE_URL.split('/');
const DATE = SPLITTED_URL.slice(3, 5).join('/'); // 2019/08
const DOMAIN = SPLITTED_URL.slice(0, 3).join('/'); //https://droidtechknow.000webhostapp.com

const SLUG = SOURCE_PATH = SPLITTED_URL[SPLITTED_URL.length - 1];
const SRC_BASE_URL = DOMAIN + '/wp-content/uploads/' + DATE
const TOP_IMAGE_NAME = CONSTANTS.FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();

logs.display(`SLUG : ${SLUG} \nSRC_BASE_URL: ${SRC_BASE_URL} \nTOP_IMAGE_NAME: ${TOP_IMAGE_NAME}`, 'cyan', false);

(function init() {
    copyTemplate().then((completed) => {
        logs.display('Copy completed', 'green', true);
        webpageCrawler.crawlHtmlFromWebpage(CONSTANTS.IMAGES_WEBPAGE_URL).then((data) => {
            logs.display('Copy Html from URL', 'green', true);
            replaceArticleText(data.htmlData, data.meta);
            logs.display('Replace completed', 'green', true);
            imageDownloader.init(CONSTANTS.IMAGES_WEBPAGE_URL, SOURCE_PATH + '/images').then((count) => {
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
        replacement: `alt="${CONSTANTS.FOCUS_KEYWORD}"`,
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
