var fs = require("fs");
var request = require("request");

var UPLOAD_OPTIONS = {
  method: 'POST',
  url: 'https://shortpixel.com/file-upload',
  headers:
  {
    'postman-token': '2a9f7b03-a1ed-1fb7-3c96-61a99317e2ed',
  },
  formData:
  {
    compressionType: '1',
    file:
    {
      value: '',
      options: {}
    }
  }
};


var DOWNLOAD_OPTIONS = {
  method: 'POST',
  url: 'https://shortpixel.com/file-upload',
  formData:
  {
    compressionType: '1',
    fileURL: ''
  }
};

uploadFile('f-stop-1.jpg').then((uploadStatus) => {
  console.log(JSON.parse(uploadStatus));
  // const OriginalURL = JSON.parse(uploadStatus)[0].Data.OriginalURL;
  // setTimeout(() => {
  //   downloadFile(OriginalURL).then((downloadedStatus) => {
  //     const status = JSON.parse(downloadedStatus)[0].Status;
  //     console.log(downloadedStatus)
  //     if (status === 'retry') {

  //     } else {

  //     }
  //   });
  // }, 10000);
});

function uploadFile(filename) {
  return new Promise((resolve, reject) => {
    const { ...options } = { ...UPLOAD_OPTIONS }
    options.formData.file = {
      value: `fs.createReadStream(${filename})`,
      options: { filename: filename }
    }
    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      resolve(body);
    });
  })
}

function downloadFile(OriginalURL) {
  return new Promise((resolve, reject) => {
    const { ...options } = { ...DOWNLOAD_OPTIONS }
    options.formData.fileURL = OriginalURL;
    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      resolve(body);
    });
  })
}


