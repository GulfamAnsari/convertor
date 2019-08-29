const Crawler = require("crawler");
const download = require('image-downloader');
const chalk = require('chalk');

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
        console.log(chalk.blue(`Total Image URLS found: ${images.length} 
        \nValid Images URLS: ${validImageURLS.length}
        \nInvalid Images URLS: ${images.length - validImageURLS.length}\n`));
        // console.log(chalk.cyan(validImageURLS + '\n')); // All images urls in an array

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
        callback: (error, res, done) => {
          if (error) {
            console.log(chalk.red({ error }));
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
      console.log(chalk.blue(filename, 'Downloaded'));
    } catch (e) {
      throw e;
    }
  }
}

module.exports = ImageDownloader;
