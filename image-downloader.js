const Crawler = require("crawler");
const download = require('image-downloader');

init('https://droidtechknow.000webhostapp.com/2019/08/10-best-photo-gallery-apps-in-android','hello-world');

function init(webpageUrl, dest) {
  getImageUrls(webpageUrl).then((images) => {
    for (image of images) {
      const options = {
        url: image,
        dest: dest
      }
      downloadIMG(options);
    }
  });
}


function getImageUrls(url) {
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


async function downloadIMG(options) {
  try {
    const { filename, image } = await download.image(options)
    console.log(filename, 'Downloaded \n');
  } catch (e) {
    console.error(e);
  }
}