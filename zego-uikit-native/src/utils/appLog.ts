import Platform from "./platform";
import LogCat from "./FXX-APP-LOG";

class AppLog {
  private isInit: boolean = false;

  init() {
    if (this.isInit || !Platform.isAndroid) return;
    LogCat.init()
    this.isInit = true;
  }

  writeLog(tag: string, ...msg: any[]) {
    if (!this.isInit) return;
    LogCat.writeLog(tag, msg)
  }
}

export default new AppLog();