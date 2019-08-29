const Crawler = require("crawler");
const download = require('image-downloader');
var Logs = require('./logs');
var logs = new Logs();

class ImageDownloader {

  init(webpageUrl, dest) {
    return new Promise((resolve, reject) => {
      this.getImageUrls(webpageUrl).then((images) => {
        let count = 0;
        const validImageURLS = new Array();
        for (let index in images) {
          if (images[index].match(/\.(jpeg|jpg|png|gif)/g) !== null && images[index].includes('//') && images[index].includes('http')) {
            validImageURLS.push(images[index]);
          }
        }
        logs.display(`Total Image URLS found: ${images.length} 
        \nValid Images URLS: ${validImageURLS.length}
        \nInvalid Images URLS: ${images.length - validImageURLS.length}\n`, 'cyan', false);
        // logs.display(validImageURLS, 'cyan', false)// All images urls in an array

        for (let index in validImageURLS) {
          const imageUrl = validImageURLS[index];
          const options = {
            url: imageUrl,
            dest: dest
          }
          this.downloadIMG(options).then(() => {
            count++;
            if (count === validImageURLS.length) {
              resolve(count);
            }
          }, (e) => reject(e));
          index++;
        }
      });
    })
  }


  getImageUrls(url) {
    return new Promise((resolve, reject) => {
      const allImages = [];
      return new Crawler({
        callback: (err, res, done) => {
          if (err) {
            logs.display('Error: ' + err, 'red', true);
          } else {
            const images = res.$('img');
            images.each(index => {
              allImages.push(images[index].attribs.src);
            });
            resolve(allImages)
          }
        }
      }).queue(url);
    })
  }


  async downloadIMG(options) {
    try {
      const { filename, image } = await download.image(options)
      logs.display(filename + ' Downloaded', 'cyan', false);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = ImageDownloader;
