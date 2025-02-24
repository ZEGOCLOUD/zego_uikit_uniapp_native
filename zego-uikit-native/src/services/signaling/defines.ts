import { ZegoSignalingConnectionState, ZegoSignalingInRoomCommandMessage, ZegoSignalingInRoomTextMessage, ZegoSignalingNotificationConfig } from "../../plugins/signaling/defines";
import { ZegoUIKitUser, ZegoUserInRoomAttributesInfo } from "../defines";
import { ZegoUser } from "../express/ZegoExpressUniApp";

export enum ZegoInvitationType {
    VoiceCall = 0,
    VideoCall = 1,
}

// 定义 InvitationState 枚举类型
export enum ZegoUIKitInvitationState {
    Error, // 错误状态
    Waiting, // 等待状态
    Accept, // 接受状态
    Refuse, // 拒绝状态
    Cancel, // 取消状态
    Timeout // 超时状态
}

/**
 * 拒绝呼叫邀请原因
 */
export enum CallInvitationRejectReason {
    Declined = "declined",
    Busy = "busy",
}

/**
 * 定义 InvitationUser 接口，用于表示邀请中的用户信息。
 */
export interface ZegoUIKitInvitationUser {
    /**
     * 用户信息。
     */
    user: ZegoUIKitUser;
    /**
     * 邀请状态。
     */
    state: ZegoUIKitInvitationState;
}

/**
 * 定义 InvitationData 接口，用于表示邀请数据。
 */
export interface ZegoUIKitInvitationData {
    /**
     * ZIM的邀请 ID。
     */
    invitationID: string;
    /**
     * 发出邀请的用户。
     */
    inviter: ZegoUIKitUser;
    /**
     * 被邀请的用户列表。
     */
    invitees: ZegoUIKitInvitationUser[];
    /**
     * 邀请类型。
     */
    type: ZegoInvitationType;

    /**
     * RTC的 房间 ID。
     */
    roomID: string;

    /**
     * 用户自定义数据
     */
    customData: string;

    /**
     * 消息推送的配置
     */
    pushConfig?: ZegoSignalingNotificationConfig

    /**
     * 扩展数据
     */
    extendedData?: Record<string, any>;
}

/**
 * 连接状态变更监听器接口。
 */
export interface ZegoUIKitSignalingConnectionStateChangeListener {
    /**
     * 当连接状态发生改变时调用。
     * @param connectionState 新的连接状态。
     */
    onConnectionStateChanged(connectionState: ZegoSignalingConnectionState): void;
}

/**
 * 房间内命令消息监听器接口。
 */
export interface ZegoUIKitSignalingInRoomCommandMessageListener {
    /**
     * 当接收到房间内的命令消息时调用。
     * @param messages 收到的消息数组。
     * @param roomID 房间 ID。
     */
    onInRoomCommandMessageReceived(messages: ZegoSignalingInRoomCommandMessage[], roomID: string): void;
}

/**
 * 房间内文本消息监听器接口。
 */
export interface ZegoUIKitSignalingInRoomTextMessageListener {
    /**
     * 当接收到房间内的文本消息时调用。
     * @param messages 收到的消息数组。
     * @param roomID 房间 ID。
     */
    onInRoomTextMessageReceived(messages: ZegoSignalingInRoomTextMessage[], roomID: string): void;
}

/**
 * 邀请监听器接口。
 */
export interface ZegoUIKitSignalingInvitationListener {
    /**
     * 当接收到邀请时调用。
     * @param inviter 发出邀请的用户。
     * @param type 邀请类型。
     * @param data 附加数据。
     */
    onInvitationReceived?: (inviter: ZegoUIKitUser, type: number, data: ZegoUIKitInvitationData) => void;
    /**
     * 当邀请超时时调用。
     * @param inviter 发出邀请的用户。
     * @param data 附加数据。
     */
    onInvitationTimeout?: (inviter: ZegoUIKitUser, data: ZegoUIKitInvitationData) => void;
    /**
     * 当邀请响应超时时调用。
     * @param invitees 被邀请的用户列表。
     * @param data 附加数据。
     */
    onInvitationResponseTimeout?: (invitees: ZegoUIKitUser[], data: ZegoUIKitInvitationData) => void;
    /**
     * 当邀请被接受时调用。
     * @param invitee 接受邀请的用户。
     * @param data 附加数据。
     */
    onInvitationAccepted?: (invitee: ZegoUIKitUser, data: ZegoUIKitInvitationData) => void;
    /**
     * 当邀请被拒绝时调用。
     * @param invitee 拒绝邀请的用户。
     * @param data 附加数据。
     */
    onInvitationRefused?: (invitee: ZegoUIKitUser, data: ZegoUIKitInvitationData) => void;
    /**
     * 当邀请被取消时调用。
     * @param inviter 取消邀请的用户。
     * @param data 附加数据。
     */
    onInvitationCanceled?: (inviter: ZegoUIKitUser, data: ZegoUIKitInvitationData) => void;

    /**
     * 当发送呼叫邀请时调用。
     * @param inviter 主呼叫用户
     * @param data 附加数据。
     */
    onCallingInvitationSend?: (invitees: ZegoUIKitUser[], data: ZegoUIKitInvitationData) => void;

    /**
     * 当取消邀请时调用。
     * @param inviter 取药呼叫用户
     * @param data 附加数据。
     */
    onCancelInvitaion?: (invitees: ZegoUIKitUser[], data: ZegoUIKitInvitationData) => void;
}


/**
 * 房间属性更新监听器接口。
 */
export interface ZegoUIKitSignalingRoomPropertyUpdateListener {
    /**
     * 当房间属性更新时调用。
     * @param key 更新的键。
     * @param oldValue 旧值。
     * @param newValue 新值。
     */
    onRoomPropertyUpdated(key: string, oldValue: string, newValue: string): void;

    /**
     * 当房间属性完全更新时调用。
     * @param updateKeys 更新的键列表。
     * @param oldProperties 旧属性集合。
     * @param properties 新属性集合。
     */
    onRoomPropertiesFullUpdated(updateKeys: string[], oldProperties: Record<string, string>, properties: Record<string, string>): void;
}

/**
 * 房间内用户属性更新监听器接口。
 */
export interface ZegoUIKitSignalingUsersInRoomAttributesUpdateListener {
    /**
     * 当房间内用户属性更新时调用。
     * @param updateKeys 更新的键列表。
     * @param oldAttributes 旧属性集合。
     * @param attributes 新属性集合。
     * @param editor 修改者或 null。
     */
    onUsersInRoomAttributesUpdated(updateKeys: string[], oldAttributes: ZegoUserInRoomAttributesInfo[], attributes: ZegoUserInRoomAttributesInfo[], editor: ZegoUIKitUser | null): void;
}




/**
 * 回调函数类型，用于处理通用信号事件。
 * 
 * @param errorCode - 错误码，表示操作结果的状态。
 * @param message - 消息，描述错误或操作结果。
 * @param data - 额外的数据对象。
 */
export type ZegoUIKitSignalingCallback = (
    errorCode: number,
    message: string,
    data?: any
) => void;

/**
 * 呼叫中邀请配置
 */
export type CallingConfig = {
    canInvitingInCalling?: boolean;
    onlyInitiatorCanInvite?: boolean;
    endCallWhenInitiatorLeave?: boolean;
}