const unzipper = require("unzipper");
const fsa = require("fs-extra");
const { download } = require('./download');

const basePath = './node_modules/.cache/'
const downloadUrl = 'https://storage.zego.im/zpns/sdk/uni-app/zego-ZPNsUniPlugin-JS.zip'

const getRemoteUniPlugin = () => {
  if (!fsa.existsSync(basePath)) {
    fsa.mkdirSync(basePath)
  }

  if (fsa.existsSync(`${basePath}zego-ZPNsUniPlugin-JS.zip`)) {
    console.log("getCacheed plugin success");
    return Promise.resolve();
  }
  return download(downloadUrl, `${basePath}zego-ZPNsUniPlugin-JS.zip`).then(() => {
    console.log("getRemote plugin success");
  });
};

getRemoteUniPlugin().then(() => {
  fsa.copy(`${basePath}zego-ZPNsUniPlugin-JS.zip`, "./js_sdk/zego-ZPNsUniPlugin-JS.zip").then(() => {
    fsa.createReadStream("./js_sdk/zego-ZPNsUniPlugin-JS.zip")
    .pipe(unzipper.Extract({ path: "./js_sdk/zego-ZPNsUniPlugin-JS" }))
    .on("finish", () => {
      console.log("extract finished");
      fsa.remove("./js_sdk/zego-ZPNsUniPlugin-JS.zip", () => {
        console.log("fetch finished");
      });
    })
    .on("error", err => console.error(err));
  });
});
