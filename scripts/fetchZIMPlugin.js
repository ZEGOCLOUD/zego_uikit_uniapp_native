const unzipper = require("unzipper");
const fsa = require("fs-extra");
const { download } = require('./download');

const basePath = './node_modules/.cache/'
const downloadUrl = 'https://ext-resource-t.dcloud.net.cn/marketplace/4896a710-f6db-11ec-a657-2714d81db6c4/2.15.1/plugin.zip'

const getRemoteUniPlugin = () => {
  if (!fsa.existsSync(basePath)) {
    fsa.mkdirSync(basePath)
  }

  if (fsa.existsSync(`${basePath}zego-ZIMUniplugin-JS.zip`)) {
    console.log("getCacheed plugin success");
    return Promise.resolve();
  }
  return download(downloadUrl, `${basePath}zego-ZIMUniplugin-JS.zip`).then(() => {
    console.log("getRemote plugin success");
  });
};

getRemoteUniPlugin().then(() => {
  fsa.copy(`${basePath}zego-ZIMUniplugin-JS.zip`, "./js_sdk/zego-ZIMUniplugin-JS.zip").then(() => {
    fsa.createReadStream("./js_sdk/zego-ZIMUniplugin-JS.zip")
    .pipe(unzipper.Extract({ path: "./js_sdk/zego-ZIMUniplugin-JS" }))
    .on("finish", () => {
      console.log("extract finished");
      fsa.remove("./js_sdk/zego-ZIMUniplugin-JS.zip", () => {
        console.log("fetch finished");
      });
    })
    .on("error", err => console.error(err));
  });
});
