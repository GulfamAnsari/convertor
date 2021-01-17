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
                this.addArticleOnRemoteDb({ data: JSON.stringify(DbObject) }).then((remoteStatus) => {
                    logs.display('DB Update Successfully ' + remoteStatus, 'green', true);
                }, (error) => { logs.display('Error while add article on remote db ' + error, 'green', true); })
            }, (error) => { logs.display('Error while creating object ' + error, 'green', true); })
        }, (error) => { logs.display('Error while crawling HTML ' + error, 'green', true); })
    }

    createDbObject(htmlData, meta) {
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
                "articleTitle": meta.title,
                "articleDescription": meta.description,
                "articleDate": CONSTANTS.ARTICLE_DATA,
                "publishedDate": new Date().toISOString().replace("Z", "+00:00"),
                "updatedDate": new Date().toISOString().replace("Z", "+00:00"),
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
        logs.display('Created Object', 'blue', true);
        console.log(DB);
        return new Promise((resolve, reject) => {
            utils.get('https://droidtechknow.com/api/dashboard_fetch_all_results.php').then((data) => {
                logs.display('Last DB Object', 'cyan', true);
                logs.display(JSON.stringify(data[data.length - 1]), 'cyan', true);
                DB.article['post'] = data.length + 7;
                logs.display('New DB Object', 'blue', true);
                logs.display(JSON.stringify(DB), 'cyan', true);
                resolve(DB);
            }, (error) => { reject(error) })
        })
    }

    addArticleOnRemoteDb(dbObject) {

        return new Promise((resolve, reject) => {

            const options = {
                method: "POST",
                url: "https://droidtechknow.com/admin/api/addArticle.php",
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                formData: dbObject
            };

            request(options, (err, res, body) => {
                if (err) reject(err);
                resolve(body)
            });
        });
    }
}

module.exports = UpdateDB;

new UpdateDB();