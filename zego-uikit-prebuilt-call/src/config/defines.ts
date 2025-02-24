import { ZegoInvitationType, ZegoPresetResolution, ZegoSignalingNotificationConfig, ZegoVideoConfig } from "@/uni_modules/zego-UIKitCore";
import { ZegoUser } from "@/uni_modules/zego-UIKitCore/services/express/ZegoExpressUniApp";
import { ZPNsIOSEnvironment, ZPNsIOSNotificationArrivedConfig } from "@/js_sdk/zego-ZPNsUniPlugin-JS/lib";

/**
 * 定义直播菜单栏按钮名称的枚举类型。
 */
export enum ZegoMenuBarButtonName {
    /**
     * 切换摄像头按钮
     */
    ToggleCameraButton,

    /**
     * 切换麦克风按钮
     */
    ToggleMicrophoneButton,

    /**
     * 切换音频输出按钮
     */
    SwitchAudioOutputButton,

    /**
     * 挂断按钮
     */
    HangUpButton,

    /**
     * 切换前后置摄像头按钮
     */
    SwitchCameraButton,

    /**
     * 显示成员列表按钮
     */
    // ShowMemberListButton,

    /**
     * 屏幕共享切换按钮
     */
    // ScreenSharingToggleButton,

    /**
     * 美颜按钮
     */
    // BeautyButton,

    /**
     * 聊天按钮
     */
    // ChatButton,

    /**
     * 最小化按钮
     */
    // MinimizingButton

    /**
     * 通话中邀请用户按钮
     */
    CallingInvitationButton,
}
export enum ZegoMenuBarStyle {
    Light = 0,
    Dark = 1
}


/**
 * 通话界面下方的 buttonbar 配置
 */
export class ZegoBottomMenuBarConfig {
    // 现在只支持配置按钮和按钮顺序, 不支持修改顺序
    buttons: ZegoMenuBarButtonName[] = [
        ZegoMenuBarButtonName.ToggleCameraButton,
        ZegoMenuBarButtonName.SwitchCameraButton,
        ZegoMenuBarButtonName.HangUpButton,
        ZegoMenuBarButtonName.ToggleMicrophoneButton,
        ZegoMenuBarButtonName.SwitchAudioOutputButton,
    ];
    // TODO 当前 maxCount 只能是 5, 后续再处理
    maxCount?: number = 5;
    hideAutomatically?: boolean = true;
    hideByClick?: boolean = true;
    // TODO 自定义样式还不支持
    // style: ZegoMenuBarStyle = ZegoMenuBarStyle.Dark;
    // buttonConfig?: ZegoMenuBarButtonConfig;
}
/**
 * 各种按钮的图片自定义, 不传就用默认的
 */
export interface ZegoMenuBarButtonConfig {
    toggleCameraOnImage: string; // 图片资源的路径或标识
    toggleCameraOffImage: string;
    toggleMicrophoneOnImage: string;
    toggleMicrophoneOffImage: string;
    hangUpButtonImage: string;
    switchCameraFrontImage: string;
    switchCameraBackImage: string;
    showMemberListButtonImage: string;
    // chatButtonImage: string;
    // minimizingButtonImage: string;
    audioOutputSpeakerImage: string;
    audioOutputHeadphoneImage: string;
    audioOutputBluetoothImage: string;
    // screenSharingToggleButtonOnImage: string;
    // screenSharingToggleButtonOffImage: string;
    // beautyButtonImage: string;
}


export class ZegoPrebuiltVideoConfig {

    resolution: ZegoPresetResolution = ZegoPresetResolution.Preset360p;

    config?: ZegoVideoConfig;

}

/**
 * 挂点电话的弹框配置
 */
export interface ZegoHangUpConfirmInfo {
    title?: string;
    message?: string;
    cancelButtonName?: string;
    confirmButtonName?: string;
}

export type ZegoHangUpListener = (seconds: number) => void;

export type NetworkType = 'wifi' | '2g' | '3g' | '4g' | '5g' | 'ethernet' | 'unknown' | 'none'

export type NetworkStatusChangeListener = (res: UniNamespace.OnNetworkStatusChangeSuccess) => void;

export type ZegoHangUpConfirmListener = () => Promise<boolean>;

export type ZegoDurationUpdateListener = (seconds: number) => void;

export interface ZegoCallDurationConfig {

    showDuration?: boolean;
    onDurationUpdate?: ZegoDurationUpdateListener;
}

// 注册厂商离线推送
export interface RegisterPushConfig {
    iOSEnvironment: ZPNsIOSEnvironment;
    iOSNotificationArrivedConfig: ZPNsIOSNotificationArrivedConfig;
}
 
export interface CallingInvitationListConfig {
    waitingSelectUsers: ZegoUser[]; // 等待选择的成员列表
    defaultChecked?: boolean; // 是否默认选中， 默认true
}

export type CallingInvitationListSheetDisplayCallBack = () => CallingInvitationListConfig

export interface CallInviteConfig {
    type: ZegoInvitationType;
    invitees: ZegoUser[];
    timeout?: number;
    callID?: string; // 手动指定邀请ID
    customData?: string;
    // 通知配置
    notificationConfig?: ZegoSignalingNotificationConfig;
}

export interface CancelInviteConfig {
    invitationID: string;
    invitees?: string[]; // 仅进阶模式可以单独取消某个用户
    // 通知配置
    notificationConfig?: ZegoSignalingNotificationConfig;
}