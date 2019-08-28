const Crawler = require("crawler");
const download = require('image-downloader');

class ImageDownloader {

  init(webpageUrl, dest) {
    return new Promise((resolve, reject) => {
      this.getImageUrls(webpageUrl).then((images) => {

        var id = "ctl03_Tabs1";
        var lastFive = id.substr(id.length - 5); // => "Tabs1"

        let count = 0;
        console.log(images.length + ' is total images be downloaded', images);
        for (let index in images) {
          const imageUrl = images[index];
          const options = {
            url: imageUrl,
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
