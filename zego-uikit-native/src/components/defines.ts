
export enum ZegoLayoutMode {
    PictureInPicture = 0,
    Gallery = 1
}

export enum ZegoViewPosition {
    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}


// 画廊布局配置接口，继承自基本布局配置
export interface ZegoLayoutGalleryConfig  {
    // 是否为视图添加圆角和间距
    addBorderRadiusAndSpacingBetweenView: boolean;
    // 当音频视频不可用时是否移除视图
    removeViewWhenAudioVideoUnavailable: boolean;
    // 屏幕共享时是否在全屏模式下显示新视图
    showNewScreenSharingViewInFullscreenMode: boolean;
    // 全屏模式切换按钮显示规则
    showScreenSharingFullscreenModeToggleButtonRules: ZegoShowFullscreenModeToggleButtonRules;
}

// 画中画布局配置接口，继承自基本布局配置
export interface ZegoLayoutPictureInPictureConfig  {
    // 小视图是否可拖动
    // isSmallViewDraggable?: boolean;
    // 小视图背景颜色
    smallViewBackgroundColor?: string; // 需要用字符串表示颜色，如"#333437"
    // 大视图背景颜色
    largeViewBackgroundColor?: string; // 同上
    // 小视图背景图片，TypeScript中无法直接表示Drawable，通常使用URL或base64
    smallViewBackgroundImage?: string; // 假设使用URL存储
    // 大视图背景图片，同上
    largeViewBackgroundImage?: string;
    // 小视图默认位置
    smallViewPosition?: ZegoViewPosition;
    // 是否通过点击切换大/小视图
    switchLargeOrSmallViewByClick?: boolean;
    // 小视图尺寸
    smallViewSize?: { width: number, height: number };
    // 小图圆角大小
    smallViewBorderRadius?: number;
    // 小视图间的间距
    spacingBetweenSmallViews?: number;
    // 当音频视频不可用时是否移除视图
    removeViewWhenAudioVideoUnavailable?: boolean;

}

// 定义布局配置基类接口
export type ZegoLayoutConfig = ZegoLayoutPictureInPictureConfig | ZegoLayoutGalleryConfig


// 定义全屏模式切换按钮显示规则枚举
export enum ZegoShowFullscreenModeToggleButtonRules {
    ShowWhenScreenPressed = 0 // 屏幕被按下时显示
}

// 定义布局类
export class ZegoLayout {
    // 布局模式
    mode?: ZegoLayoutMode = ZegoLayoutMode.PictureInPicture;
    // 布局配置
    config?: ZegoLayoutConfig;

}


export type AvatarAlignment = 'center' | 'flex-start' | 'flex-end';

export interface AvatarSize {
    width: number;
    height: number;
}


/**
 * 音视频视图配置类
 * 用于配置音视频播放时的视图相关设置，包括声音波纹、填充模式、麦克风和摄像头状态显示等。
 */
export class ZegoAudioVideoViewConfig {
    /**
     * 是否在音频模式下显示声波动画
     * 默认为true，表示在仅音频模式下也显示声波动画。
     * 可以根据需求配置为false，隐藏声波动画。
     */
    showSoundWavesInAudioMode?: boolean = true;

    /**
     * 是否使用视频视图的填充模式
     * 默认为true，表示视频视图将按照保持宽高比的方式进行填充。
     * 可以配置为false，此时视频视图将按实际大小显示，可能会有黑边。
     */
    useVideoViewAspectFill?: boolean = true;

    /**
     * 是否在视图上显示麦克风状态
     * 默认为true，表示将在视图上显示麦克风的开关状态。
     * 可以配置为false，隐藏麦克风状态显示。
     */
    showMicrophoneStateOnView?: boolean = true;

    /**
     * 是否在视图上显示摄像头状态
     * 默认为false，表示不在视图上显示摄像头的开关状态。
     * 可以配置为true，以显示摄像头状态。
     */
    showCameraStateOnView?: boolean = false;

    /**
     * 是否在视图上显示用户名
     * 默认为true，表示将在视图上显示用户名。
     * 可以配置为false，隐藏用户名显示。
     */
    showUserNameOnView?: boolean = true;
}

export enum ViewType {
    BIG,
    SMALL,
}