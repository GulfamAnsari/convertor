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
const DATE = SPLITTED_URL.slice(5, 7).join('/'); // 2019/08
const DOMAIN = SPLITTED_URL.slice(0, 3).join('/'); //https://droidtechknow.000webhostapp.com

const SLUG = SOURCE_PATH = SPLITTED_URL[SPLITTED_URL.length - 1] || SPLITTED_URL[SPLITTED_URL.length - 2];
const SRC_BASE_URL = DOMAIN + '/admin/wordpress/wp-content/uploads/' + DATE
const TOP_IMAGE_NAME = CONSTANTS.FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();

logs.display(`DOMAIN : ${DOMAIN} \nDATE : ${DATE} \nSLUG : ${SLUG} \nSRC_BASE_URL: ${SRC_BASE_URL} \nTOP_IMAGE_NAME: ${TOP_IMAGE_NAME}`, 'cyan', false);

let destination = '';
// If not provide, folder will be in same directory
destination = `/Users/gulfam.ansari/Personal/droidtechknow/${CONSTANTS.CATAGORY}/${CONSTANTS.SUBCATAGORY ? CONSTANTS.SUBCATAGORY + '/' : ''}${SOURCE_PATH}`;
logs.display(`Check Destination : ${destination}`, 'cyan', false);

(async function init() {
    let imagesList = {}
    try {
        imagesList = await downloadImageAndCompress();
    } catch(error) {
        logs.display(`Error: ${error}`, 'red', true);
    }
    try {
        await copyTemplate();
    } catch(error) {
        logs.display(`Erro: ${error}`, 'red', true);
    }
    webpageCrawler.crawlHtmlFromWebpage(CONSTANTS.IMAGES_WEBPAGE_URL).then((data) => {
        logs.display('Copy Html from URL', 'green', true);
        var updatedHtml = data.htmlData;
        updatedHtml = replaceSrcDataSrc(updatedHtml, imagesList);
        logs.display('Add data-src attributes', 'green', true);
        updatedHtml = makeFeaturedImages(updatedHtml, data.meta).replace(`<!--?php include($_SERVER['DOCUMENT_ROOT'] . '/featuredShareAndComment.php');?-->`, `<?php include($_SERVER['DOCUMENT_ROOT'] . '/featuredShareAndComment.php');?>`);
        updatedHtml = makeContentContainer(updatedHtml);
        logs.display('Content container added', 'green', true);
        replaceArticleText(updatedHtml, data.meta);
        logs.display('Replace completed', 'green', true);
    })
})();

function downloadImageAndCompress() {
    return new Promise((res, rej) => {
        // Checking if image folder already exsits or not -> Create one if not exists
        if (!fileSys.existsSync(destination ? destination + '/images' : SOURCE_PATH + '/images')) {
            fileSys.mkdirSync(destination ? destination : SOURCE_PATH);
            fileSys.mkdirSync(destination ? destination + '/images' : SOURCE_PATH + '/images');
            logs.display('Image folder created', 'green', true);
        } else {
            logs.display('Image folder already there', 'cyan', true);
        }
        // downloading images into image folder
        imageDownloader.init(CONSTANTS.IMAGES_WEBPAGE_URL, destination || SOURCE_PATH).then((validImageURLS) => {
            logs.display(validImageURLS.length + ' Images Downloaded', 'green', true);
            createDBImages(validImageURLS);
            logs.display(`Waiting... Files are in quque for compression`, 'blue', true);
            const count = validImageURLS.length;
            setTimeout(() => {
                compressImages(count).then(() => {
                    logs.display(`${count} files Compressed Successfully`, 'green', true);
                    getImageSize().then(imageSize => {
                        res(imageSize);
                    }, (err) => {
                        rej(err)
                    });
                }, (err) => rej(err));
            }, 3000);
        }, (err) => {
            rej(err);
        });
    })
}

function createDBImages(validImageURLS) {
    for (url of validImageURLS) {
        // createMainImage(url, 'blur', '10%');
        if (url.split('/')[url.split('/').length - 1].includes(TOP_IMAGE_NAME)) {
            createMainImage(url, 'main', '45%');
            createMainImage(url, 'side', '30%');
            logs.display('Database Images created Succesfully', 'green', true);
        }
    }
}


function getImageSize() {
    return new Promise((resolve, reject) => {
        let pwd = path.resolve(__dirname, destination || SOURCE_PATH) + "/images";
        const sizeOf = require('image-size');
        const imageWithSize = {};
        fs.readdirSync(pwd).forEach(file => {
            const dimensions = sizeOf(`${pwd}/${file}`);
            imageWithSize[file] = {
                ...dimensions,
                name: file
            };
        });
        resolve(imageWithSize);
    })
}

function replaceSrcDataSrc(string, imageList) {
    const {
        JSDOM
    } = jsdom;
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
        let actualImageName = imageName.split("/")[imageName.split("/").length - 1];
        // let srcAdd = `${imageName}-blur.${ext}`;
        let height = `${imageList[`${actualImageName}.jpg`].height}`;
        let width = `${imageList[`${actualImageName}.jpg`].width}`;
        let srcAdd = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'></svg>`;
        string = string.replace(`src="${src}"`, `data-src="${src}" src="${srcAdd}" width="${width}" height="${height}"`);
    }
    return string;
}


function makeFeaturedImages(string, meta) {
    const {
        JSDOM
    } = jsdom;
    global.document = new JSDOM(string).window.document;
    var elem = document.createElement("div");
    elem.innerHTML = string;

    var postEntry = elem.getElementsByTagName("A")[0];

    var containtContainer = `<div class="featured-image">
        <figure>
            ${postEntry.outerHTML}
            <figcaption>${meta.title}</figcaption>
        </figure>
        </div>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/featuredShareAndComment.php');?>`;

    postEntry.outerHTML = containtContainer;
    return elem.innerHTML;
}

function makeContentContainer(string) {
    const {
        JSDOM
    } = jsdom;
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
        regex: `<h3>Features</h3>\n<ol class="order-large-list">`,
        replacement: '<h3>Features</h3><ol class="order-large-list features">',
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
        regex: `<h3>Features</h3>\n<ul class="large-list">`,
        replacement: '<h3>Features</h3><ul class="large-list features">',
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

    // replace({
    //     regex: /width="([0-9]+)"/g,
    //     replacement: `width="100%"`,
    //     paths: [`${destination || SOURCE_PATH}/article.php`],
    //     recursive: true,
    //     silent: true,
    // });

    // replace({
    //     regex: /height="([0-9]+)"/g,
    //     replacement: ``,
    //     paths: [`${destination || SOURCE_PATH}/article.php`],
    //     recursive: true,
    //     silent: true,
    // });

    replace({
        regex: /<img loading="lazy" class="(.*?)"/g,
        replacement: `<img class="img img-responsive lazyload"`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });


    replace({
        regex: /<img class="(.*?)"/g,
        replacement: `<img class="img img-responsive lazyload shimmer"`,
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
        regex: 'style="font-weight: 400;"',
        replacement: ``,
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

    // pros and cons start

    replace({
        regex: `<h3>Pros</h3>\n<ul class="large-list">`,
        replacement: `<h3>Pros</h3>\n<ul class="large-list props">`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: `<h3>Pros</h3>\n<ol class="order-large-list">`,
        replacement: `<h3>Pros</h3>\n<ol class="order-large-list props">`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: `<h3>Pros</h3>`,
        replacement: `<div class="props-and-cons"><div><h3 class="propsh3">Pros</h3>`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: `<h3>Cons</h3>\n<ul class="large-list">`,
        replacement: `<h3>Cons</h3>\n<ul class="large-list cons">`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: `<h3>Cons</h3>\n<ol class="order-large-list">`,
        replacement: `<h3>Cons</h3>\n<ol class="order-large-list cons">`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: `<h3>Cons</h3>`,
        replacement: `<div><h3 class="consh3">Cons</h3>`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    if (htmlData.includes(`Pros</h3>\n<ul`)) {
        replace({
            regex: `</ul>`,
            replacement: `</ul></div></div>`,
            paths: [`${destination || SOURCE_PATH}/article.php`],
            recursive: true,
            silent: true,
        });
    } else if (htmlData.includes(`Pros</h3>\n<ul`)) {
        replace({
            regex: `</ol>`,
            replacement: `</ol></div></div>`,
            paths: [`${destination || SOURCE_PATH}/article.php`],
            recursive: true,
            silent: true,
        });
    }

    replace({
        regex: `</div>\n<div><h3 class="consh3">Cons</h3>`,
        replacement: `<div><h3 class="consh3">Cons</h3>`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    // Pros and cons end


    replace({
        regex: `</a>\n<br>`,
        replacement: `</a></p><br>`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<p></p>',
        replacement: ``,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<strong>Step',
        replacement: `<strong class="how-to-steps">Step`,
        paths: [`${destination || SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    if (CONSTANTS.ANDROID_DOWNLOAD) {
        replace({
            regex: CONSTANTS.ANDROID_DOWNLOAD,
            replacement: `<img alt="Play Store Download button" loading="lazy" width="162px" height="50px" class="google-play-store-download" src="/images/google-play-store.jpg" />`,
            paths: [`${destination || SOURCE_PATH}/article.php`],
            recursive: true,
            silent: true,
        });
    }
    if (CONSTANTS.IOS_DOWNLOAD) {
        replace({
            regex: CONSTANTS.IOS_DOWNLOAD,
            replacement: `<img alt="App Store Download button" loading="lazy" width="162px" height="50px" class="app-store-download" src="/images/app-store.jpg" />`,
            paths: [`${destination || SOURCE_PATH}/article.php`],
            recursive: true,
            silent: true,
        });
    }
    if (CONSTANTS.FLIPKART_BUY) {
        replace({
            regex: CONSTANTS.FLIPKART_BUY,
            replacement: `<img alt="Flipkart buy button" loading="lazy" width="190px" height="60px" class="app-store-download" src="/images/buy-flipkart.jpeg" />`,
            paths: [`${destination || SOURCE_PATH}/article.php`],
            recursive: true,
            silent: true,
        });
    }

    if (CONSTANTS.AMAZON_BUY) {
        replace({
            regex: CONSTANTS.AMAZON_BUY,
            replacement: `<img alt="Amazon buy button" loading="lazy" width="190px" height="60px" class="app-store-download" src="/images/buy-amazon.jpg" />`,
            paths: [`${destination || SOURCE_PATH}/article.php`],
            recursive: true,
            silent: true,
        });
    }

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
                logs.display('Error: ' + err, 'red', true);
                reject(err);
            })
    })
}

function compressImages(count) {
    return new Promise((resolve, reject) => {
        let pwd = path.resolve(__dirname, destination || SOURCE_PATH);
        const myShellScript = exec(`sh image-convertor.sh ${pwd}/images/`);
        myShellScript.stdout.on("data", (data) => {
            if (data.includes("Average compression")) {
                resolve();
            }
            logs.display(data, 'blue', false);
        });
        myShellScript.stderr.on("data", (err) => {
            reject(err);
        });
    })
}

function createMainImage(name, append, rate) {
    let pwd = path.resolve(__dirname, `${SOURCE_PATH}/images`);
    pwd = destination ? destination + '/images' : pwd;

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