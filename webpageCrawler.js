var Crawler = require("crawler");
const cheerio = require('cheerio');
var CONSTANTS = require('./constants')

class WebpageCrawler {

    crawlHtmlFromWebpage(webpageUrl) {
        return new Promise((resolve, reject) => {
            var crawler = new Crawler({
                maxConnections: 10,
                // This will be called for each crawled page
                callback: function (error, res, done) {
                    if (error) {
                        reject(error);
                    } else {
                        var $ = cheerio.load(res.body.replace(/<!--|-->/g, ''))
                        var title = res.$('title').text();
                        var tags = '';
                        var description = '';
                        var keywords = '';

                        // if tags meta is present
                        for (var index of Object.keys(res.$('a[rel="tag"]'))) {
                            if (res.$('a[rel="tag"]') && res.$('a[rel="tag"]')[index].children && res.$('a[rel="tag"]')[index].children[0] && res.$('a[rel="tag"]')[index].children[0].data) {
                                tags = `${tags? tags + ', ': ''}${res.$('a[rel="tag"]')[index].children[0].data}`
                            }
                        }
                        // if tags meta are not present
                        for (var value of Object.values(res.$('.articleTag'))) {
                            if (value?.children?.[0]?.data) 
                                tags = `${tags? tags + ', ': ''}${value?.children?.[0]?.data}`
                        }
                        if (!tags) {
                            tags = CONSTANTS.TAGS;
                        }
                        for (var index of Object.keys(res.$('meta'))) {
                            if (res.$('meta')[index] && res.$('meta')[index].attribs && res.$('meta')[index].attribs.name && res.$('meta')[index].attribs.name == 'description') {
                                description = `${res.$('meta')[index].attribs.content}`;
                            }
                        }
                        for (var index of Object.keys(res.$('meta'))) {
                            if (res.$('meta')[index] && res.$('meta')[index].attribs && res.$('meta')[index].attribs.name && res.$('meta')[index].attribs.name == 'keywords') {
                                keywords = `${res.$('meta')[index].attribs.content}`;
                            }
                        }
                        const data = {
                            htmlData: $('.entry-content').html(), 
                            meta:  { title, tags, description, keywords }
                        };
                        resolve(data);
                    }
                    done();
                }
            });
            crawler.queue(webpageUrl);
        })
    }
}

module.exports = WebpageCrawler;
