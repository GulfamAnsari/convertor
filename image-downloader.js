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
          if (images[index].match(/\.(jpeg|jpg|png|gif)/g) !== null && images[index].includes('//') && images[index].includes('http') && !images[index].includes('footer-powered-by-000webhost')) {
            validImageURLS.push(images[index]);
            logs.display(`Valid URL: ${images[index]}`, 'cyan', false );
          } else {
            logs.display(`Invalid URL: ${images[index]}`, 'red', false );
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
            dest: dest + '/images'
          }
          var filenames = [];
          this.downloadIMG(options).then((filename) => {
            filenames.push(filename);
            count++;
            if (count === validImageURLS.length) {
              console.log('Count', count);
              console.log('valid URL length', validImageURLS.length);
              console.log("All images download successfully and promiss resolve now");
              resolve(filenames);
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
      return filename;
    } catch (e) {
      throw e;
    }
  }
}

module.exports = ImageDownloader;
