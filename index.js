var replace = require("replace");

// Things Needs to specify
const TITLE = ''
const FOCUS_KEYWORD = '';
const SRC_BASE_URL = '';
const SLUG = '';

copyTemplate();

function replace() {
    replace({
        regex: 'alt=""',
        replacement: FOCUS_KEYWORD,
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<h1></h1>',
        replacement: `<h1>${TITLE}</h1>`,
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: SRC_BASE_URL,
        replacement: 'images',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: 'wp-image-',
        replacement: 'img img-responsive ',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<h2>',
        replacement: '<h2 class="subHeading-with-border">',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '&nbsp;',
        replacement: '',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '</h2>',
        replacement: '</h2><br>',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<ol>',
        replacement: '<ol class="order-large-list">',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<ul>',
        replacement: '<ul class="large-list">',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '<li>',
        replacement: '<li><p>',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });

    replace({
        regex: '</li>',
        replacement: '</p></li>',
        paths: ['template/article.php'],
        recursive: true,
        silent: true,
    });
}

function copyTemplate() {
    copyPHPFiles();
    copyImages();
}

function copyPHPFiles() {
    console.log('Copying the PHP images files');
}

function copyImages() {
    console.log('Copying the template images files');
}
