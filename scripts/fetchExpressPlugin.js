const unzipper = require("unzipper");
const fs = require("fs");
const fsa = require("fs-extra");
const http = require("http");
const https = require("https");

const basePath = './node_modules/.cache/'
const downloadUrl = 'https://ext-resource-t.dcloud.net.cn/marketplace/72313ea0-af13-11ec-b570-61a87b835e36/3.16.1/plugin_ide.zip'

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

const getRemoteUniPlugin = () => {
  if (!fsa.existsSync(basePath)) {
    fsa.mkdirSync(basePath)
  }

  if (fsa.existsSync(`${basePath}zego-ZegoExpressUniApp-JS.zip`)) {
    console.log("getCacheed plugin success");
    return Promise.resolve();
  }
  return download(downloadUrl, `${basePath}zego-ZegoExpressUniApp-JS.zip`).then(() => {
    console.log("getRemote plugin success");
  });
};

getRemoteUniPlugin().then(() => {
  fsa.copy(`${basePath}zego-ZegoExpressUniApp-JS.zip`, "./uni_modules/zego-ZegoExpressUniApp-JS.zip").then(() => {
    fsa.createReadStream("./uni_modules/zego-ZegoExpressUniApp-JS.zip")
    .pipe(unzipper.Extract({ path: "./uni_modules/zego-ZegoExpressUniApp-JS" }))
    .on("finish", () => {
      console.log("extract finished");
      fsa.remove("./uni_modules/zego-ZegoExpressUniApp-JS.zip", () => {
        console.log("fetch finished");
      });
    })
    .on("error", err => console.error(err));
  });
});
