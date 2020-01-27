var WebpageCrawler = require('./webpageCrawler');
var Utils = require('./utils');
var webpageCrawler = new WebpageCrawler();
var utils = new Utils();
var CONSTANTS = require('./constants');
var Logs = require('./logs');
var logs = new Logs();


class UpdateDB {
    constructor() {
        webpageCrawler.crawlHtmlFromWebpage(CONSTANTS.IMAGES_WEBPAGE_URL).then((data) => {
            this.createDbObject(data.htmlData, data.meta).then((DbObject) => {
                this.addArticleOnRemoteDb(DbObject).then((remoteStatus) => {
                    logs.display('DB Update Successfully', 'green', true);
                }, (error) => { logs.display('Error while add article on remote db', 'green', true);})
            }, (error) => { logs.display('Error while creating object', 'green', true); })
        }, (error) => { logs.display('Error while crawling HTML', 'green', true); })
    }

    createDbObject(htmlData, meta) {
        return new Promise((resolve, reject) => {
            utils.get('http://droidtechknow-dashboard.herokuapp.com/droid/article-list').then((data) => {
                logs.display('Last DB Object', 'cyan', true);
                logs.display(JSON.stringify(data[data.length - 1]), 'cyan', true);
                const SPLITTED_URL = CONSTANTS.IMAGES_WEBPAGE_URL.split('/');
                const TOP_IMAGE_NAME = CONSTANTS.FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();
                const SLUG = SPLITTED_URL[SPLITTED_URL.length - 1];
                const articleLink = `/${CONSTANTS.CATAGORY}/${CONSTANTS.SUBCATAGORY ? CONSTANTS.SUBCATAGORY + '/' : ''}${SLUG}/`;
                const imageLink = `${articleLink}images/${TOP_IMAGE_NAME}-main.jpg`;
                const imageLink2 = `${articleLink}images/${TOP_IMAGE_NAME}-side.jpg`;

                const DB = {
                    "username": CONSTANTS.USERNAME,
                    "password": CONSTANTS.PASSWORD,
                    "article": {
                        "post": data.length + 5,
                        "articleTitle": meta.title,
                        "articleDescription": meta.description,
                        "articleDate": CONSTANTS.ARTICLE_DATA,
                        "catagory": CONSTANTS.CATAGORY,
                        "subCatagory": CONSTANTS.SUBCATAGORY,
                        "author": CONSTANTS.AUTHOR,
                        "views": 985,
                        "keywords": meta.tags,
                        articleLink,
                        imageLink,
                        imageLink2,
                        "imageAlt": CONSTANTS.FOCUS_KEYWORD,
                        "comment": 1,
                        "likes": 1,
                        "dislikes": 1
                    }
                }
                logs.display('New DB Object', 'blue', true);
                logs.display(JSON.stringify(DB), 'cyan', true);
                resolve(DB);
            }, (error) => {reject(error)})
        })
    }

    addArticleOnRemoteDb(dbObject) {
        return new Promise((resolve, reject) => {
            utils.post('http://droidtechknow-dashboard.herokuapp.com/droid/article-add', dbObject).then((result) => {
                resolve(resolve)
            }, (error) => {
                reject(error);
            })
        });
    }
}

module.exports = UpdateDB;

new UpdateDB();