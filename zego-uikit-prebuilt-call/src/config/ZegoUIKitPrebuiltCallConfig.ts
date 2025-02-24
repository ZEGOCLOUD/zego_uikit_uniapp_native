
import { ZegoAudioVideoViewConfig, ZegoLayout, ZegoLayoutMode, ZegoLayoutPictureInPictureConfig, ZegoViewPosition } from "@/uni_modules/zego-UIKitCore"
import { ZegoHangUpConfirmInfo, ZegoHangUpConfirmListener, ZegoHangUpListener, ZegoBottomMenuBarConfig, ZegoCallDurationConfig, ZegoPrebuiltVideoConfig, NetworkStatusChangeListener } from "./defines";

export class ZegoUIKitPrebuiltCallConfig {

    // 加入房间时是否自动开启摄像头，默认开启
    public turnOnCameraWhenJoining?: boolean = true;

    // 加入房间时是否自动开启麦克风，默认开启
    public turnOnMicrophoneWhenJoining?: boolean = true;

    // 加入房间时是否使用扬声器，默认开启
    public useSpeakerWhenJoining?: boolean = true;

    // 音视频视图配置
    public audioVideoViewConfig = new ZegoAudioVideoViewConfig();

    // 布局配置
    public layout?: ZegoLayout;

    // 底部菜单栏配置
    public bottomMenuBarConfig = new ZegoBottomMenuBarConfig();

    // // 顶部菜单栏配置
    // public topMenuBarConfig = new ZegoTopMenuBarConfig();

    // // 成员列表配置
    // public memberListConfig = new ZegoMemberListConfig();

    // 视频配置，预设分辨率为360p
    public videoConfig = new ZegoPrebuiltVideoConfig();

    public hangUpConfirmInfo?: ZegoHangUpConfirmInfo;

    public onHangUpConfirmation?: ZegoHangUpConfirmListener;

    public onHangUp?: ZegoHangUpListener;

    public onNetworkStatusChange?: NetworkStatusChangeListener;

    // 通话时长配置，可选
    public durationConfig?: ZegoCallDurationConfig;

    // 头像视图提供者，可选
    // public avatarViewProvider?: ZegoAvatarViewProvider;


    // 房间内聊天配置
    // public inRoomChatConfig = new ZegoInRoomChatConfig();

    /**
     * 通话中邀请用户，邀请用户窗口将出现在邀请方，如果您想隐藏此视图，请将其设置为false。默认展示。
     * 可以在此视图中取消对此用户的邀请。
     */
    showWaitingCallAcceptAudioVideoView?: boolean = true ;


    public static oneOnOneVideoCall(): ZegoUIKitPrebuiltCallConfig {
        const config = new ZegoUIKitPrebuiltCallConfig();
        config.turnOnCameraWhenJoining = true;
        config.turnOnMicrophoneWhenJoining = true;
        config.useSpeakerWhenJoining = true;
        const layoutConfig: ZegoLayoutPictureInPictureConfig = {
            smallViewPosition: ZegoViewPosition.TopRight,
            switchLargeOrSmallViewByClick: true,
        }

        config.layout = {
            mode: ZegoLayoutMode.PictureInPicture,
            config: layoutConfig,
        }

        return config;
    }

    public static oneOnOneVoiceCall(): ZegoUIKitPrebuiltCallConfig {
        const config = new ZegoUIKitPrebuiltCallConfig();
        config.turnOnCameraWhenJoining = false;
        config.turnOnMicrophoneWhenJoining = true;
        config.useSpeakerWhenJoining = false;
        const layoutConfig: ZegoLayoutPictureInPictureConfig = {
            smallViewPosition: ZegoViewPosition.TopRight,
            switchLargeOrSmallViewByClick: true,
        }
        config.layout = {
            mode: ZegoLayoutMode.PictureInPicture,
            config: layoutConfig,
        }

        return config;
    }
}
