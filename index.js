var replace = require("replace");
const path = require('path');
const fs = require('fs-extra');
var fileSys = require('fs');
const exec = require('child_process').exec;
var CONSTANTS = require('./constants')
var ImageDownloader = require('./image-downloader');
var WebpageCrawler = require('./webpageCrawler');
var Logs = require('./logs');
var imageDownloader = new ImageDownloader();
var webpageCrawler = new WebpageCrawler();
var logs = new Logs();
const jsdom = require("jsdom");


const SPLITTED_URL = CONSTANTS.IMAGES_WEBPAGE_URL.split('/');
const DATE = SPLITTED_URL.slice(3, 5).join('/'); // 2019/08
const DOMAIN = SPLITTED_URL.slice(0, 3).join('/'); //https://droidtechknow.000webhostapp.com

const SLUG = SOURCE_PATH = SPLITTED_URL[SPLITTED_URL.length - 1];
const SRC_BASE_URL = DOMAIN + '/wp-content/uploads/' + DATE
const TOP_IMAGE_NAME = CONSTANTS.FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();

logs.display(`SLUG : ${SLUG} \nSRC_BASE_URL: ${SRC_BASE_URL} \nTOP_IMAGE_NAME: ${TOP_IMAGE_NAME}`, 'cyan', false);

let destination = '';
// If not provide, folder will be in same directory
// destination = `/Users/gulfamansari/Personal/droidtechknow/${CONSTANTS.CATAGORY}${CONSTANTS.SUBCATAGORY? '/' + CONSTANTS.SUBCATAGORY: '/'}${SOURCE_PATH}`;
logs.display(`Check Destination : ${destination}`, 'cyan', false);

(function init() {
    copyTemplate().then((completed) => {
        logs.display('Copy completed', 'green', true);
        webpageCrawler.crawlHtmlFromWebpage(CONSTANTS.IMAGES_WEBPAGE_URL).then((data) => {
            logs.display('Copy Html from URL', 'green', true);
            var updatedHtml = replaceSrcDataSrc(data.htmlData);
            logs.display('Add data-src attributes', 'green', true);
            updatedHtml = makeContentContainer(updatedHtml);
            logs.display('Content container added', 'green', true);
            replaceArticleText(updatedHtml, data.meta);
            logs.display('Replace completed', 'green', true);
            if (!fileSys.existsSync(destination ? destination + '/images' : SOURCE_PATH + '/images')) {
                fileSys.mkdirSync(destination ? destination + '/images' : SOURCE_PATH + '/images');
                logs.display('Image folder created', 'green', true);
            } else {
                logs.display('Image folder already there', 'cyan', true);
            }
            imageDownloader.init(CONSTANTS.IMAGES_WEBPAGE_URL, destination || SOURCE_PATH).then((validImageURLS) => {
                logs.display(validImageURLS.length + ' Images Downloaded', 'green', true);

                for (url of validImageURLS) {
                    createMainImage(url, 'blur', '5%');
                    if (url.includes(TOP_IMAGE_NAME)) {
                        createMainImage(url, 'main', '45%');
                        createMainImage(url, 'side', '25%');
                        logs.display('Database Images created Succesfully', 'green', true);
                    }
                }
                const count = validImageURLS.length;
                compressImages(count).then((count) => {
                    logs.display(`${count} files Compressed Successfully`, 'green', true);
                }, (err) => logs.display('Error: ' + err, 'red', true));

            }, (err) => {
                logs.display('Error: ' + err, 'red', true);
            });
        })
    }, (err) => {
        logs.display('Error: ' + err, 'red', true);
    });
})();

function replaceSrcDataSrc(string) {
    const { JSDOM } = jsdom;
    global.document = new JSDOM(string).window.document;

    var elem = document.createElement("div");
    elem.innerHTML = string;
    var images = elem.getElementsByTagName("img");
    for (var i = 0; i < images.length; i++) {
        var src = images[i].src;
        if (images[i].src[images[i].src.length - 1] === '/') {
            src = src.slice(0, -1);
        }
        const ext = src.split('.')[src.split('.').length - 1];
        var imageName = src.split('.').slice(0, src.split('.').length - 1).toString();
        string = string.replace(`src="${src}`, `data-src="${src}" src="${imageName}-blur.${ext}`);
    }
    return string;
}

function makeContentContainer(string) {
    const { JSDOM } = jsdom;
    global.document = new JSDOM(string).window.document;
    var elem = document.createElement("div");
    elem.innerHTML = string;

    var h2 = elem.getElementsByTagName("h2");

    var contentList = '';
    for (var i = 0; i < h2.length; i++) {
        var id = h2[i].textContent.split(/\s/).join('');
        contentList += `<li><a href="#${id}">${h2[i].textContent}</a></li>`;
        h2[i].setAttribute("id", id);
    }
    var containtContainer = `<div id="content_container">
    <p class="content_title">Contents <span class="content_toggle">[<a id="toggle_content_toggle">hide</a>]</span></p>
    <ol class="content_list" id="toggle_content_list">
    ${contentList}
    </ol>
    </div>`;
    h2[0].outerHTML = containtContainer + h2[0].outerHTML;
    return elem.innerHTML;
}

function replaceArticleText(htmlData, meta) {
    replace({
        regex: '<div class="post-entry"></div>',
        replacement: `<div class="post-entry">${htmlData}</div>`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: 'alt=""',
        replacement: `alt="${CONSTANTS.FOCUS_KEYWORD}"`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<h1></h1>',
        replacement: `<h1>${meta.title}</h1>`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: SRC_BASE_URL,
        replacement: 'images',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: 'wp-image-',
        replacement: 'img img-responsive ',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<h2',
        replacement: '<br><h2 class="subHeading-with-border" ',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '&nbsp;',
        replacement: '',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<ol>',
        replacement: '<ol class="order-large-list">',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<ul>',
        replacement: '<ul class="large-list">',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<li>',
        replacement: '<li><p>',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '</li>',
        replacement: '</p></li>',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<pre>',
        replacement: '<pre class="ubuntu-terminal">',
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /width="([0-9]+)"/g,
        replacement: `width="100%"`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /height="([0-9]+)"/g,
        replacement: ``,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /<img class="(.*?)"/g,
        replacement: `<img class="img img-responsive articleImages" style="background:<?php echo getRandomColorCode(); ?>"`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '.png',
        replacement: `.jpg`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<p><a',
        replacement: `<a`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '</a></p>',
        replacement: `</a>`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /srcset="(.*?)"/g,
        replacement: ``,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: /sizes="(.*?)"/g,
        replacement: ``,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

}

function copyTemplate() {
    return new Promise((resolve, reject) => {
        let source = path.resolve(__dirname, 'template')
        let dest = path.resolve(__dirname, `${SOURCE_PATH}`);
        fs.copy(source, destination || dest)
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
        let pwd = path.resolve(__dirname, destination || SOURCE_PATH);
        const myShellScript = exec(`sh image-convertor.sh ${pwd}/images/`);
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

function createMainImage(name, append, rate) {
    let pwd = path.resolve(__dirname, `${SOURCE_PATH}/images`);
    // pwd = destination + '/images' || pwd;

    const ext = name.split('.')[name.split('.').length - 1];
    var imageName = name.split('.').slice(0, name.split('.').length - 1).toString();
    imageName = imageName.split('/')[imageName.split('/').length - 1];
    const copy = exec(`cp  ${pwd}/${imageName}.${ext} ${pwd}/${imageName}-${append}.${ext}`);
    copy.stdout.on('data', (data) => {
        logs.display(data, 'blue', false);
    });
    copy.stderr.on('data', (err) => {
        logs.display('Error: ' + err, 'red', true);
    });

    // This is why because copying files takes time, so we doing small hack here
    setTimeout(() => {
        const myShellScript = exec(`mogrify -resize ${rate}  ${pwd}/${imageName}-${append}.${ext}`);
        myShellScript.stdout.on('data', (data) => {
            logs.display(data, 'blue', false);
        });
        myShellScript.stderr.on('data', (err) => {
            logs.display('Error: ' + err, 'red', true);
        });
    }, 2000);
}
