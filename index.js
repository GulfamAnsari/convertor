var replace = require("replace");
const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
var ImageDownloader = require('./image-downloader');
var imageDownloader = new ImageDownloader();

/***** Things Needs to specify  ****************/
const TITLE = 'Samsung Youtube vanced'
const FOCUS_KEYWORD = 'Photo gallery apps';
const IMAGES_WEBPAGE_URL = 'https://droidtechknow.000webhostapp.com/2019/08/10-best-photo-gallery-apps-in-android';
const SRC_BASE_URL = 'https://droidtechknow.000webhostapp.com/wp-content/uploads/2019/08';
const SLUG = SOURCE_PATH = 'hello-world';
/********************************************/

const TOP_IMAGE_NAME = FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();

(function init() {
    copyTemplate().then((completed) => {
        console.log('Copy completed!');
        imageDownloader.init(IMAGES_WEBPAGE_URL, SOURCE_PATH).then((count) => {
            console.log(count + ' Images Downloaded');
            replaceArticleText();
            console.log('Replace completed');
            compressImages();
            console.log('Compress Images completed');
            // createMainImage('main', '50%');
            // createMainImage('side', '30%');
            console.log('Main Image Created');
        });
    }, (err) => {
        console.log('Error in copying!', err);
    });
})();

function replaceArticleText() {
    replace({
        regex: 'alt=""',
        replacement: `alt="${FOCUS_KEYWORD}"`,
        paths: [`${SOURCE_PATH}/article.php`],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<h1></h1>',
        replacement: `<h1>${TITLE}</h1>`,
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
        replacement: '<h2 class="subHeading-with-border">',
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
        regex: '</h2>',
        replacement: '</h2><br>',
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

function compressImages() {
    let pwd = path.resolve(__dirname, `${SOURCE_PATH}/images`);
    const myShellScript = exec(`sh image-convertor.sh ${pwd}/`);
    myShellScript.stdout.on('data', (data) => {
        console.log(data);
    });
    myShellScript.stderr.on('data', (data) => {
        console.error(data);
    });
}

function createMainImage(append, rate) {
    let pwd = path.resolve(__dirname, `${SOURCE_PATH}/images`);
    const myShellScript = exec(`mogrify -resize ${rate} ${pwd}/${TOP_IMAGE_NAME}.jpg  > ${pwd}/${TOP_IMAGE_NAME}-${append}.jpg`);
    myShellScript.stdout.on('data', (data) => {
        console.log(data);
    });
    myShellScript.stderr.on('data', (data) => {
        console.error(data);
    });
}
