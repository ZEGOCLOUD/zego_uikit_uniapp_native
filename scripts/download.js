const fs = require("fs");
const http = require("http");
const https = require("https");

async function download(url, dest) {
  const file = fs.createWriteStream(dest);
  const _get = /https:\/\//.test(url) ? https.get.bind(https) : http.get.bind(http);
  return new Promise((resolve, reject) => {
    _get(`${url}`, { headers: {} }, function(res) {
      file.on("finish", () => {
        file.close();
        resolve(true);
      })

      file.on('error', (err) => {
        console.error('file error:', err);
      })

      res.pipe(file);
    })
      .on("error", e => {
        console.error(e.message);
        reject(e);
      });
  });
}

module.exports = {
  download
}
