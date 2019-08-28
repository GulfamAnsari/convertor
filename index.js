var replace = require("replace");
const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').exec;

// Things Needs to specify
const TITLE = 'Samsung Youtube vanced'
const FOCUS_KEYWORD = 'samsung vanced';
const SRC_BASE_URL = 'https://droidtechknow.000webhostapp.com/wp-content/uploads/2019/08';
const SLUG = SOURCE_PATH = 'hello-world';

init();

function init() {
    copyTemplate().then((completed) => {
        console.log('Copy completed!');
        replaceArticleText();
        compressImages();
    }, (err) => {
        console.log('Error in copying!', err);
    });
}

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
    let pwd = path.resolve(__dirname, `${SOURCE_PATH}/images/`);
    const myShellScript = exec(`sh image-convertor.sh ${pwd}`);
    myShellScript.stdout.on('data', (data) => {
        console.log(data);
    });
    myShellScript.stderr.on('data', (data) => {
        console.error(data);
    });
}
