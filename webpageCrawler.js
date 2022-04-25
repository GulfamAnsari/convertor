var Crawler = require("crawler");
const cheerio = require('cheerio');

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

                        // if tags meta is present
                        for (var index of Object.keys(res.$('a[rel="tag"]'))) {
                            if (res.$('a[rel="tag"]') && res.$('a[rel="tag"]')[index].children && res.$('a[rel="tag"]')[index].children[0] && res.$('a[rel="tag"]')[index].children[0].data) {
                                tags = `${tags? tags + ', ': ''}${res.$('a[rel="tag"]')[index].children[0].data}`
                            }
                        }
                        // if tags meta are not present
                        for (var index of Object.keys(res.$('.tag-blue'))) {
                            if (res.$('.tag-blue') && res.$('.tag-blue')[index].children && res.$('.tag-blue')[index].children[0] && res.$('.tag-blue')[index].children[0].data) {
                                tags = `${tags? tags + ', ': ''}${res.$('.tag-blue')[index].children[0].data}`
                            }
                        }
                        for (var index of Object.keys(res.$('meta'))) {
                            if (res.$('meta')[index] && res.$('meta')[index].attribs && res.$('meta')[index].attribs.name && res.$('meta')[index].attribs.name == 'description') {
                                description = `${res.$('meta')[index].attribs.content}`;
                            }
                        }
                        const data = {
                            htmlData: $('.item-detail').html(), 
                            meta:  { title, tags, description }
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
