const Crawler = require("crawler");
const download = require('image-downloader');

class ImageDownloader {

  init(webpageUrl, dest) {
    return new Promise((resolve, reject) => {
      this.getImageUrls(webpageUrl).then((images) => {
        let count = 0;
        for (let index in images) {
          const options = {
            url: images[index],
            dest: dest
          }
          this.downloadIMG(options).then(() => {
            count++;
            if (count === images.length) {
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
            console.log({ error })
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
      console.log(filename, 'Downloaded');
    } catch (e) {
      throw e;
    }
  }
}

module.exports = ImageDownloader;
