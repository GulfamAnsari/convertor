const request = require('request');

class Utils {
    constructor() {
    }

    get(url) {
        return new Promise((resolve, reject) => {
            request.get(url, { method: "GET", }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(response);
                }
            })
        })
    }

    post(url, data) {
        return new Promise((resolve, reject) => {
            request.post(url, { method: "GET", body: data, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(response);
                }
            })
        })
    }
}

module.exports = Utils;