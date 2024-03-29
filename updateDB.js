var WebpageCrawler = require('./webpageCrawler');
var Utils = require('./utils');
var webpageCrawler = new WebpageCrawler();
var utils = new Utils();
var CONSTANTS = require('./constants');
var Logs = require('./logs');
var logs = new Logs();
const request = require('request');


class UpdateDB {
    constructor() {
        webpageCrawler.crawlHtmlFromWebpage(CONSTANTS.IMAGES_WEBPAGE_URL).then((data) => {
            this.createDbObject(data.htmlData, data.meta).then((DbObject) => {
                this.addArticleOnRemoteDb(DbObject).then((remoteStatus) => {
                    logs.display('DB Update Successfully ' + remoteStatus, 'green', true);
                }, (error) => { logs.display('Error while add article on remote db ' + error, 'green', true); })
            }, (error) => { logs.display('Error while creating object ' + error, 'green', true); })
        }, (error) => { logs.display('Error while crawling HTML ' + error, 'green', true); })
    }

    createDbObject(htmlData, meta) {
        const SPLITTED_URL = CONSTANTS.IMAGES_WEBPAGE_URL.split('/');
        const TOP_IMAGE_NAME = CONSTANTS.FOCUS_KEYWORD.replace(/ /g, '-').toLocaleLowerCase();
        const SLUG = SPLITTED_URL[SPLITTED_URL.length - 1] || SPLITTED_URL[SPLITTED_URL.length - 2];
        const articleLink = `/${CONSTANTS.CATAGORY}/${CONSTANTS.SUBCATAGORY ? CONSTANTS.SUBCATAGORY + '/' : ''}${SLUG}/`;

        let imageExt = 'jpg';
        if (htmlData.includes(`${TOP_IMAGE_NAME}.jpeg`)) imageExt = 'jpeg';
        const imageLink = `${articleLink}images/${TOP_IMAGE_NAME}-main.${imageExt}`;
        const imageLink2 = `${articleLink}images/${TOP_IMAGE_NAME}-side.${imageExt}`;
        const DB = {
            "key": CONSTANTS.KEY,
            "article": {
                "articleTitle": meta.title,
                "articleDescription": meta.description,
                "articleDate": CONSTANTS.ARTICLE_DATA,
                "publishedDate": new Date().toISOString().replace("Z", "+00:00"),
                "updatedDate": new Date().toISOString().replace("Z", "+00:00"),
                "catagory": CONSTANTS.CATAGORY,
                "subCatagory": CONSTANTS.SUBCATAGORY,
                "author": CONSTANTS.AUTHOR,
                "views": 985,
                "keywords": meta.keywords,
                articleLink,
                imageLink,
                imageLink2,
                "imageAlt": CONSTANTS.FOCUS_KEYWORD,
                "comment": 1,
                "likes": 1,
                "dislikes": 1
            }
        }
        logs.display('Created Object', 'blue', true);
        console.log(DB);
        return new Promise((resolve, reject) => {
            utils.get('https://droidtechknow.com/api/dashboard_fetch_all_results.php').then((data) => {
                logs.display('Last DB Object', 'cyan', true);
                logs.display(JSON.stringify(data[data.length - 1]), 'cyan', true);
                DB.article['post'] = data.length + 8;
                logs.display('New DB Object', 'blue', true);
                logs.display(JSON.stringify(DB), 'cyan', true);
                resolve(DB);
            }, (error) => { reject(error) })
        })
    }

    addArticleOnRemoteDb = (dbObject) => {
        return new Promise((resolve, reject) => {
            utils.post("https://droidtechknow.com/admin/api/addArticle.php", dbObject)
                .then((data) => {
                    console.log(data);
                    resolve(data)
                }).catch((err) => { console.log(err); reject(err) })
        });
    }


}

module.exports = UpdateDB;

new UpdateDB();