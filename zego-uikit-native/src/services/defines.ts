import { ZegoRoomState, ZegoRoomStateChangedReason } from "./express/ZegoExpressUniApp";

/**
 * 用户信息接口，用于描述房间内的用户状态。
 */
export class ZegoUIKitUser {
    userID: string;

    userName: string;

    isCameraOn?: boolean = false;

    isMicrophoneOn?: boolean = false;

    avatar?: string;

    inRoomAttributes?: Record<string, string>;

    streamID?: string;

    constructor(userID: string, userName?: string) {
        this.userID = userID;
        this.userName = userName || userID;
    }
}



export enum ZegoUIKitScenario {
    /** 支持版本：3.0.0 及以上。详情描述：默认（通用）场景，若下列场景枚举均不符合开发者的实际应用场景，可使用此默认场景。 */
    Default = 3,
    /** 支持版本：3.0.0 及以上。详情描述：标准音视频通话场景，适用于 1v1 视频通话场景。 */
    StandardVideoCall = 4,
    /** 支持版本：3.0.0 及以上。详情描述：高品质音视频通话场景，与标准音视频通话场景类似，但该场景默认采用了更高的视频帧率、码率、分辨率 (540p)，适用于对画质要求较高的视频通话场景。 */
    HighQualityVideoCall = 5,
    /** 支持版本：3.0.0 及以上。详情描述：标准语聊房场景，适用于多人纯语音通话（节省流量）。注意：在实时音视频 (ExpressVideo) SDK 上，此场景默认不开启摄像头。 */
    StandardChatroom = 6,
    /** 支持版本：3.0.0 及以上。详情描述：高品质语聊房场景，与标准语聊房场景类似，但此场景默认采用了更高的音频码率。适用于对音质要求较高的多人纯语音通话场景。注意：在实时音视频 (ExpressVideo) SDK 上，此场景默认不开启摄像头。 */
    HighQualityChatroom = 7,
    /** 支持版本：3.0.0 及以上。详情描述：直播场景，适用于秀场、游戏、电商、教育大班课等一对多直播的场景，对音画质量、流畅度、兼容性进行了优化。注意：即便是直播场景，SDK 也没有业务上的 “角色” 之分（例如主播、观众），房间内的所有用户均可推拉流。 */
    Broadcast = 8,
    /** 支持版本：3.0.0 及以上。详情描述：卡拉 OK (KTV) 场景，适用于实时合唱、在线 K 歌场景，对延迟、音质、耳返、回声消除等做了优化，同时还保障了多人合唱时精准对齐和超低时延。 */
    Karaoke = 9,
    /** 支持版本：3.3.0 及以上。详情描述：标准语音通话场景，适用于 1v1 纯语音通话场景。注意：在实时音视频 (ExpressVideo) SDK 上，此场景默认不开启摄像头。 */
    StandardVoiceCall = 10
}

export enum ZegoVideoCodecID {
    /** 默认编码 (H.264) */
    Default = 0,
    /** 分层编码 (H.264 SVC) */
    SVC = 1,
    /** VP8 */
    VP8 = 2,
    /** H.265 */
    H265 = 3,
    /** 视频大小流编码 */
    H264DualStream = 4,
    /** 未知编码类型 */
    Unknown = 100
}


export interface ZegoVideoConfig {
    /** 采集分辨率宽度，控制摄像头图像采集的宽度。SDK 要求设置此成员为偶数。仅摄像头启动前且没有使用自定义视频采集时，设置有效。出于性能考虑，SDK 在采集摄像头画面后、渲染预览画面之前，就将视频帧缩放为编码分辨率，因此预览画面的分辨率是编码分辨率，如果您需要预览画面的分辨率为此值，请先调用 [setCapturePipelineScaleMode] 将采集缩放模式改为 [Post] */
    captureWidth: number;
    /** 采集分辨率高度，控制摄像头图像采集的高度。SDK 要求设置此成员为偶数。仅摄像头启动前且没有使用自定义视频采集时，设置有效。出于性能考虑，SDK 在采集摄像头画面后、渲染预览画面之前，就将视频帧缩放为编码分辨率，因此预览画面的分辨率是编码分辨率，如果您需要预览画面的分辨率为此值，请先调用 [setCapturePipelineScaleMode] 将采集缩放模式改为 [Post] */
    captureHeight: number;
    /** 编码分辨率宽度，控制编码器编码推流的图像宽度。SDK 要求设置此成员为偶数。推流前后设置均可生效 */
    encodeWidth: number;
    /** 编码分辨率高度，控制编码器编码推流的图像高度。SDK 要求设置此成员为偶数。推流前后设置均可生效 */
    encodeHeight: number;
    /** 帧率，控制摄像头采集帧率以及编码器编码帧率的大小。仅摄像头启动前设置有效。推流端设置60帧，拉流端生效需联系技术支持 */
    fps: number;
    /** 码率，单位为 kbps。推流前后设置均可生效。SDK 会根据开发者选择的场景，自动设置适配该场景的码率。若开发者手动设置的码率超出合理范围，SDK会自动按照合理区间处理码率。如因业务需要配置高码率，请联系 ZEGO 商务。 */
    bitrate: number;
    /** 要使用的编码器，默认为 default。仅在推流前设置生效 */
    codecID: ZegoVideoCodecID;
    /** 视频关键帧间隔，单位秒。是否必填：否。默认值：2秒。取值范围：[2, 5]。注意事项：仅在推流前设置有效。 */
    keyFrameInterval?: number;
}

/**
 * 预设分辨率枚举。
 */
export enum ZegoPresetResolution {
    Preset180p = 0,
    Preset270p = 1,
    Preset360p = 2,
    Preset540p = 3,
    Preset720p = 4,
    Preset1080p = 5,
}


/**
 * 房间信息接口，用于描述房间的基本信息。
 */
export interface ZegoUIKitRoom {
    roomID: string;
}

/**
 * 消息发送状态枚举，用于描述消息的发送状态。
 */
export enum ZegoInRoomMessageState {
    Idle,
    Sending,
    Success,
    Failed,
}

/**
 * 消息信息接口，用于描述房间内的消息。
 */
export interface ZegoInRoomMessage {
    message: string;
    messageID: number;
    timestamp: number;
    user: ZegoUIKitUser;
    state: ZegoInRoomMessageState;
}

/**
 * 用户房间属性信息接口，用于描述房间内的用户属性。
 */
export interface ZegoUserInRoomAttributesInfo {

    userID: string;
    attributes: Record<string, string>;
}

/**
 * 音视频资源模式枚举，用于描述不同的音视频资源模式。
 */
export enum ZegoAudioVideoResourceMode {
    Default = 0,
    CdnOnly = 1,
    L3Only = 2,
    RtcOnly = 3,
    CdnPlus = 4,
}
/**
 * ZegoUIKit的回调类型，用于统一回调接口。
 */
export type ZegoUIKitCallback = (errorCode: number) => void;

/**
 * 音视频可用性监听接口，用于监听房间内用户的音视频状态变化。
 */
// 定义 ZegoAudioVideoUpdateListener 接口
export interface ZegoAudioVideoUpdateListener {
    // 当音视频可用时调用
    onAudioVideoAvailable?: (userList: ZegoUIKitUser[]) => void;

    // 当音视频不可用时调用
    onAudioVideoUnAvailable?: (userList: ZegoUIKitUser[]) => void;
}

/**
 * 屏幕分享可用性监听接口，用于监听房间内用户的屏幕分享状态变化。
 */
// 定义 ZegoScreenSharingUpdateListener 接口
export interface ZegoScreenSharingUpdateListener {
    // 当屏幕分享可用时调用
    onScreenSharingAvailable?: (userList: ZegoUIKitUser[]) => void;

    // 当屏幕分享不可用时调用
    onScreenSharingUnAvailable?: (userList: ZegoUIKitUser[]) => void;
}

/**
 * 房间状态变化监听接口，用于监听房间状态的变化。
 */
// 定义 RoomStateChangedListener 接口
export interface RoomStateChangedListener {
    // 当房间状态发生变化时调用
    onRoomStateChanged?: (roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, jsonObject: any) => void;
}

/**
 * 房间属性更新监听接口，用于监听房间属性的变化。
 */
// 定义 ZegoRoomPropertyUpdateListener 接口
export interface ZegoRoomPropertyUpdateListener {
    // 当房间属性更新时调用
    onRoomPropertyUpdated?: (key: string, oldValue: string, newValue: string) => void;

    // 当房间所有属性更新时调用
    onRoomPropertiesFullUpdated?: (updateKeys: string[], oldProperties: Record<string, string>, properties: Record<string, string>) => void;
}

/**
 * 房间内命令监听接口，用于监听房间内的命令。
 */
// 定义 ZegoInRoomCommandListener 接口
export interface ZegoInRoomCommandListener {
    // 当接收到房间内命令时调用
    onInRoomCommandReceived?: (fromUser: ZegoUIKitUser, command: string) => void;
}

/**
 * 发送房间内命令的回调类型，用于统一发送命令的回调接口。
 */


export interface ZegoSendInRoomCommandCallback {
    onSend?: (errorCode: number) => void;
}


/**
 * 退出房间回调接口，用于回调退出房间的结果。
 */
export interface ZegoRoomLogoutCallback {
    /**
     * 退出房间结果回调。
     * 
     * @param errorCode 错误码，描述退出房间的操作结果。
     * @param extendedData 扩展数据，提供额外的退出房间相关信息。
     */
    onRoomLogoutResult?: (errorCode: number, extendedData: any) => void;
}

/**
 * Token 即将过期监听接口，用于监听 Token 的过期状态。
 */
export interface ZegoUIKitTokenExpireListener {

    onTokenWillExpire?: (second: number) => void;
}


/**
 * 麦克风状态变化监听接口，用于监听用户的麦克风状态变化。
 */
export interface ZegoMicrophoneStateChangeListener {

    onMicrophoneOn?: (uiKitUser: ZegoUIKitUser, isOn: boolean) => void;
}

/**
 * 摄像头状态变化监听接口，用于监听用户的摄像头状态变化。
 */
export interface ZegoCameraStateChangeListener {

    onCameraOn?: (uiKitUser: ZegoUIKitUser, isOn: boolean) => void;
}

/**
 * 音频输出设备变化监听接口，用于监听音频输出设备的变化。
 */
export interface ZegoAudioOutputDeviceChangedListener {

    onAudioOutputDeviceChanged?: (audioOutput: ZegoAudioOutputDevice) => void;
}

/**
 * 音频输出设备枚举，用于描述不同的音频输出设备类型。
 */
export enum ZegoAudioOutputDevice {
    Speaker = 0,
    Headphone = 1,
    Bluetooth = 2,
    EarSpeaker = 3,
    ExternalUsb = 4,
}

/**
 * 声音级别更新监听接口，用于接收房间内用户的声音级别变化通知。
 */
export interface ZegoSoundLevelUpdateListener {

    /**
     * 声音级别更新回调方法。
     * 
     * @param uiKitUser 用户信息对象，描述声音级别发生变更的用户。
     * @param soundLevel 用户当前的声音级别，通常为0.0到1.0之间的浮点数，表示音量的相对大小。
     */
    onSoundLevelUpdate?: (uiKitUser: ZegoUIKitUser, soundLevel: number) => void;
}
/**
 * 开启摄像头请求监听接口，用于处理其他用户请求自己开启摄像头的通知。
 */
export interface ZegoTurnOnYourCameraRequestListener {
    /**
     * 当收到开启摄像头的请求时被调用。
     * 
     * @param fromUser 请求来源的用户信息，描述发出开启摄像头请求的用户。
     */
    onTurnOnYourCameraRequest?: (fromUser: ZegoUIKitUser) => void;
}

/**
 * 开启麦克风请求监听接口，用于处理其他用户请求自己开启麦克风的通知。
 */
export interface ZegoTurnOnYourMicrophoneRequestListener {
    /**
     * 当收到开启麦克风的请求时被调用。
     * 
     * @param fromUser 请求来源的用户信息，描述发出开启麦克风请求的用户。
     */
    onTurnOnYourMicrophoneRequest?: (fromUser: ZegoUIKitUser) => void;
}

/**
 * 用户更新监听器接口，用于接收房间内用户加入或离开的通知。
 */
export interface ZegoUserUpdateListener {
    /**
     * 当有用户加入房间时被调用。
     * 
     * @param userInfoList 加入房间的用户信息列表。
     */
    onUserJoined?: (userInfoList: ZegoUIKitUser[]) => void;

    /**
     * 当有用户离开房间时被调用。
     * 
     * @param userInfoList 离开房间的用户信息列表。
     */
    onUserLeft?: (userInfoList: ZegoUIKitUser[]) => void;
}

/**
 * 用户数量或属性变更监听器接口，用于接收房间内用户数量变化或用户属性变更的通知。
 */
export interface ZegoUserCountOrPropertyChangedListener {
    /**
     * 当房间内的用户数量发生变化或用户属性发生变更时被调用。
     * 
     * @param userList 变更的用户信息列表。
     */
    onUserCountOrPropertyChanged?: (userList: ZegoUIKitUser[]) => void;
}

export interface ZegoMeRemovedFromRoomListener {
    onSelfRemoved?: () => void;
}

export interface ZegoOnlySelfInRoomListener {

    onOnlySelf?: () => void;
}

export interface ZegoInRoomMessageSendStateListener {
    /**
     * 在房间内消息发送状态发生改变时调用。
     * 
     * @param inRoomMessage 发送状态改变的消息对象。
     */
    onInRoomMessageSendingStateChanged?: (inRoomMessage: ZegoInRoomMessage) => void;
}
export interface ZegoInRoomMessageListener {
    /**
     * 当收到房间内消息时调用。
     * 
     * @param messageList 收到的消息列表。
     */
    onInRoomMessageReceived?: (messageList: ZegoInRoomMessage[]) => void;

    /**
     * 当房间内消息的发送状态发生改变时调用。
     * 
     * @param inRoomMessage 发送状态改变的消息对象。
     */
    onInRoomMessageSendingStateChanged?: (inRoomMessage: ZegoInRoomMessage) => void;
}


export interface ZegoMixerStartCallback {
    /**
     * Callback for the result of starting a mixer task.
     *
     * @param errorCode Error code, please refer to the error codes documentation at https://docs.zegocloud.com/en/5548.html for more details.
     * @param extendedData Extended information provided as a JSON object.
     */
    onMixerStartResult?: (errorCode: number, extendedData: string) => void;
}

export interface ZegoMixerStopCallback {
    /**
     * Callback for the result of stopping a mixer task.
     *
     * @param errorCode Error code, please refer to the error codes documentation at https://docs.zegocloud.com/en/5548.html for more details.
     */
    onMixerStopResult?: (errorCode: number) => void;
}

/**
 * app 当前状态
 */
export enum AppState {
    Background = 'background', // 后台
    Active = 'active', // 前台
}