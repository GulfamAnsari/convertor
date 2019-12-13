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
                        for (var index of Object.keys(res.$('meta'))) {
                            if (res.$('meta')[index] && res.$('meta')[index].attribs && res.$('meta')[index].attribs.property && res.$('meta')[index].attribs.property == 'article:tag') {
                                tags = `${tags? tags + ', ': ''}${res.$('meta')[index].attribs.content}`
                            } 
                            if (res.$('meta')[index] && res.$('meta')[index].attribs && res.$('meta')[index].attribs.name && res.$('meta')[index].attribs.name == 'description') {
                                description = `${res.$('meta')[index].attribs.content}`;
                            }
                        }
                        const data = {
                            htmlData: $('.post-entry').html(), 
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
