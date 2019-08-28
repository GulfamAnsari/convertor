var replace = require("replace");
const path = require('path')
const fs = require('fs-extra')

// Things Needs to specify
const TITLE = 'Samsung Youtube vanced'
const FOCUS_KEYWORD = 'samsung vanced';
const SRC_BASE_URL = 'https://droidtechknow.000webhostapp.com/wp-content/uploads/2019/08';
const SOURCE_PATH = 'hello-world'; // This is SLUG

// copyTemplate();
replaceArticleText();

function replaceArticleText() {
    replace({
        regex: 'alt=""',
        replacement: FOCUS_KEYWORD,
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
    let source = path.resolve(__dirname, 'template')
    let destination = path.resolve(__dirname, `${SOURCE_PATH}/article.php`)

    fs.copy(source, destination)
        .then(() => console.log('Copy completed!'))
        .catch(err => {
            console.log('An error occured while copying the folder.')
            return console.error(err)
        })
}

