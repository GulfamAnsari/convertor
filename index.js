var replace = require("replace");
const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;
var ImageDownloader = require('./image-downloader');
var Logs = require('./logs');
var imageDownloader = new ImageDownloader();
var logs = new Logs();

/***** Things Needs to specify  ****************/
const TITLE = 'Samsung Youtube vanced'
const FOCUS_KEYWORD = 'become_a_patron_button@2x';
const IMAGES_WEBPAGE_URL = 'https://www.npmjs.com/package/chalk';
const SRC_BASE_URL = 'https://droidtechknow.000webhostapp.com/wp-content/uploads/2019/08';
const SLUG = SOURCE_PATH = 'hello-world';
/********************************************/

const TOP_IMAGE_NAME = FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();

(function init() {
    copyTemplate().then((completed) => {
        logs.display('Copy completed', 'green', true);
        replaceArticleText();
        logs.display('Replace completed', 'green', true);
        imageDownloader.init(IMAGES_WEBPAGE_URL, SOURCE_PATH + '/images').then((count) => {
            logs.display(count + ' Images Downloaded', 'green', true);
            compressImages(count).then((count) => {
                logs.display(`${count} files Compressed Successfully`, 'green', true);
                createMainImage('main', '60%');
                createMainImage('side', '35%');
                logs.display('Database Images created Succesfully', 'green', true);
            }, (err) => logs.display('Error: ' + err, 'red', true));
        }, (err) => {
            logs.display('Error: ' + err, 'red', true);
        });
    }, (err) => {
        logs.display('Error: ' + err, 'red', true);
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
