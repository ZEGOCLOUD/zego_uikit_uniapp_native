import { Platform, zlogerror, zloginfo } from "@/uni_modules/zego-UIKitCore";
import { urlReg } from "../../utils/Regexp";
import { isBoolean } from "@/uni_modules/zego-UIKitCore/utils/types";

export interface BellConfig {
  autoplay?: boolean;
  loop?: boolean;
  defaultUrl?: string;
}

type ErrorType = {
  errCode: number;
  errMsg: string;
}

enum PlayStateEnum {
  NULL,
  PLAY,
  PAUSE,
  STOP,
}

const TAG = '[BellManage]'

const defaultConfig: BellConfig = {
  autoplay: false,
  loop: true,
}

class BellManage {
  innerAudioContext: UniNamespace.InnerAudioContext | null = null;
  playState = PlayStateEnum.NULL;
  config: BellConfig = {
    ...defaultConfig
  };

  constructor(bellSrc: string, config?: BellConfig) {
    zloginfo(TAG, `[constructor] bellSrc: ${bellSrc}`);
    this.innerAudioContext = uni.createInnerAudioContext();
    this.initEvent();
    this.setConfig(config);
    this.setBellSrc(bellSrc)
  }

  public setBellSrc(src: string) {
    if (!this.innerAudioContext) return
    if (!urlReg.test(src)) {
      this.setDefaultBellUrl()
      zlogerror(TAG, 'bell url illegal')
      return
    }
    this.innerAudioContext.src = src;
  }

  private setConfig(config?: BellConfig) {
    if (!this.innerAudioContext) return;
    this.config = {
      ...this.config,
      ...config,
    }
    const { autoplay, loop } = this.config
    isBoolean(autoplay) && (this.innerAudioContext.autoplay = autoplay!);
    isBoolean(loop) && (this.innerAudioContext.loop = loop!);
  }

  private initEvent() {
    if (!this.innerAudioContext) return

    this.innerAudioContext.onCanplay(() => {
      zloginfo(TAG, `[onCanplay]`);
    });
    this.innerAudioContext.onPlay(() => {
      zloginfo(TAG, `[onPlay]`);
    });

    this.innerAudioContext.onPause(() => {
      zloginfo(TAG, `[onPause]`);
    });

    this.innerAudioContext.onError(({ errCode, errMsg }: ErrorType) => {
      zlogerror(TAG, `[onError] errCode: ${errCode}, errMsg: ${errMsg}`);
      // ios端会出现{"errMsg":"MediaError","errCode":-5}报错，先忽略 https://ask.dcloud.net.cn/article/41087
      if (Platform.isIos && errCode === -5) return
      this.setDefaultBellUrl()
    });
  }

  private setDefaultBellUrl() {
    const url = this.config.defaultUrl
    if (!url || !this.innerAudioContext) return
    this.innerAudioContext.src = url;
    this.playState === PlayStateEnum.PLAY && this.play()
  }

  private setPlayState(state: PlayStateEnum) {
    this.playState = state
  }
  public play() {
    zloginfo(TAG, `play`);
    this.setPlayState(PlayStateEnum.PLAY)
    this.innerAudioContext?.play();
  }

  public pause() {
    zloginfo(TAG, `pause`);
    this.setPlayState(PlayStateEnum.PAUSE)
    this.innerAudioContext?.pause();
  }

  public stop() {
    zloginfo(TAG, `stop`);
    this.setPlayState(PlayStateEnum.STOP)
    this.innerAudioContext?.stop();
  }

  public destroy() {
    zloginfo(TAG, `destroy`);
    this.innerAudioContext?.pause();
    this.innerAudioContext?.destroy();
    this.setPlayState(PlayStateEnum.NULL)
    this.innerAudioContext = null;
  }
}

export default BellManage;