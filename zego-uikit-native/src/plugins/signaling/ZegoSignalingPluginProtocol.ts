import { ZegoPluginProtocol } from "../ZegoPluginProtocol";
import { ZegoSignalingNotificationConfig, ZegoSignalingSetUsersInRoomAttributesResult, ZegoSignalingUsersInRoomAttributes } from "./defines";
import { ZegoSignalingPluginEventHandler } from "./ZegoSignalingPluginEventHandler";
import { ZIMCallAcceptanceSentResult, ZIMCallCancelSentResult, ZIMCallEndSentResult, ZIMCallingInvitationSentResult, ZIMCallInvitationMode, ZIMCallInvitationSentResult, ZIMCallQuitSentResult, ZIMCallRejectionSentResult, ZIMEventHandler, ZIMMessageSentResult, ZIMRoomAttributesBatchOperatedResult, ZIMRoomAttributesOperatedResult, ZIMRoomAttributesQueriedResult, ZIMRoomEnteredResult, ZIMRoomLeftResult } from "./ZIMUniApp";

/**
 * ZegoSignalingPluginProtocol 定义了信令插件的行为和功能。
 */
export interface ZegoSignalingPluginProtocol extends ZegoPluginProtocol {
    /**
     * 初始化插件。
     * @param application 应用程序上下文。
     * @param appID 应用程序ID。
     * @param appSign 应用程序签名。
     */
    init(appID: number, appSign: string): Promise<boolean>;

    /**
     * 连接用户到服务。
     * @param userID 用户ID。
     * @param userName 用户名。

     */
    connectUser(userID: string, userName: string): Promise<void>;

    /**
     * 断开用户的连接。
     */
    disconnectUser(): Promise<void>;


    /**
     * 销毁插件实例。
     */
    destroy(): void;

    /**
     * 发送邀请给指定的用户。
     * @param invitees 被邀请者的用户ID列表。
     * @param timeout 邀请超时时间。
     * @param data 自定义数据。
     * @param notificationConfig 通知配置。

     */
    sendInvitation(
        invitees: string[],
        timeout: number,
        extendedData: string,
        notificationConfig?: ZegoSignalingNotificationConfig,
        mode?: ZIMCallInvitationMode,
    ): Promise<ZIMCallInvitationSentResult>;

    /**
     * 邀请其他用户加入呼叫邀请。
     * @param invitees 被邀请者的用户ID列表。
     * @param callID 当前进阶模式呼叫的 callID。
     * @param extendedData 自定义数据。
     * @param notificationConfig 通知配置。

     */
    callingInvitation(
        invitees: string[],
        callID: string,
        extendedData: string,
        notificationConfig?: ZegoSignalingNotificationConfig,
    ): Promise<ZIMCallingInvitationSentResult>;

    /**
     * 取消已发出的邀请。
     * @param invitees 被取消邀请的用户ID列表。
     * @param invitationID 邀请ID。
     * @param data 自定义数据。
     * @param pushConfig 推送配置。

     */
    cancelInvitation(
        invitees: string[],
        invitationID: string,
        extendedData: string,
        pushConfig?: ZegoSignalingNotificationConfig,
    ): Promise<ZIMCallCancelSentResult>;

    /**
     * 拒绝邀请。
     * @param invitationID 邀请ID。
     * @param data 自定义数据。

     */
    refuseInvitation(invitationID: string, extendedData: string): Promise<ZIMCallRejectionSentResult>;

    /**
     * 接受邀请。
     * @param invitationID 邀请ID。
     * @param data 自定义数据。

     */
    acceptInvitation(invitationID: string, extendedData: string): Promise<ZIMCallAcceptanceSentResult>;

    /**
     * 加入房间，并指定房间名称。
     * @param roomID 房间ID。
     * @param roomName 房间名称。

     */
    joinRoom(roomID: string, roomName: string): Promise<ZIMRoomEnteredResult>;

    /**
     * 离开房间。
     * @param roomID 房间ID。

     */
    leaveRoom(roomID: string): Promise<ZIMRoomLeftResult>;

    /**
     * 设置房间内用户的属性。
     * @param attributes 属性集合。
     * @param userIDs 用户ID列表。
     * @param roomID 房间ID。

     */
    setUsersInRoomAttributes(
        attributes: Record<string, string>,
        userIDs: string[],
        roomID: string,
    ): Promise<ZegoSignalingSetUsersInRoomAttributesResult>;

    /**
     * 查询房间内用户的属性。
     * @param roomID 房间ID。
     * @param count 查询数量。
     * @param nextFlag 下一次查询的标记。

     */
    queryUsersInRoomAttributes(roomID: string, count: number, nextFlag: string): Promise<ZegoSignalingUsersInRoomAttributes>;

    /**
     * 更新房间属性。
     * @param attributes 属性集合。
     * @param roomID 房间ID。
     * @param isForce 是否强制更新。
     * @param isDeleteAfterOwnerLeft 房主离开后是否删除。
     * @param isUpdateOwner 是否更新房主。

     */
    updateRoomProperty(
        attributes: Record<string, string>,
        roomID: string,
        isForce: boolean,
        isDeleteAfterOwnerLeft: boolean,
        isUpdateOwner: boolean,

    ): Promise<ZIMRoomAttributesOperatedResult>;

    /**
     * 删除房间属性。
     * @param keys 属性键列表。
     * @param roomID 房间ID。
     * @param isForce 是否强制删除。

     */
    deleteRoomProperties(keys: string[], roomID: string, isForce: boolean): Promise<ZIMRoomAttributesOperatedResult>;

    /**
     * 查询房间属性。
     * @param roomID 房间ID。

     */
    queryRoomProperties(roomID: string): Promise<ZIMRoomAttributesQueriedResult>;

    /**
     * 开始批量操作房间属性。
     * @param roomID 房间ID。
     * @param isDeleteAfterOwnerLeft 房主离开后是否删除。
     * @param isForce 是否强制执行。
     * @param isUpdateOwner 是否更新房主。
     */
    beginRoomPropertiesBatchOperation(
        roomID: string,
        isDeleteAfterOwnerLeft: boolean,
        isForce: boolean,
        isUpdateOwner: boolean

    ): void;

    /**
     * 结束批量操作房间属性。
     * @param roomID 房间ID。

     */
    endRoomPropertiesBatchOperation(roomID: string): Promise<ZIMRoomAttributesBatchOperatedResult>;

    /**
     * 发送房间消息。
     * @param text 消息文本。
     * @param roomID 房间ID。

     */
    sendRoomMessage(text: string, roomID: string): Promise<ZIMMessageSentResult>;

    /**
     * 发送房间命令消息。
     * @param command 命令字符串。
     * @param roomID 房间ID。

     */
    sendInRoomCommandMessage(command: string, roomID: string): Promise<ZIMMessageSentResult>;

    /**
     * 注册插件事件处理函数。
     * @param listenerID 用于标识事件监听器的唯一字符串。
     * @param handler 事件处理函数。
     */
    addPluginEventHandler(listenerID: string, handler: ZegoSignalingPluginEventHandler): void;

    /**
     * 移除插件事件处理函数。
     * @param listenerID 用于标识事件监听器的唯一字符串。
     */
    removePluginEventHandler(listenerID: string): void;

    /**
     * 注册插件事件处理函数。
     * @param listenerID 用于标识事件监听器的唯一字符串。
     * @param handler 事件处理函数。
     */
    addZIMEventHandler(listenerID: string, handler: ZIMEventHandler): void;

    /**
     * 注销已注册的 ZIM 事件处理函数。
     * @param listenerID 要注销的事件监听器的唯一标识符。
     */
    removeZIMEventHandler(listenerID: string): void;

    /**
     * 启用当应用程序在后台运行或退出时的通知。
     * @param enable 是否启用。
     */
    // enableNotifyWhenAppRunningInBackgroundOrQuit(enable: boolean): Promise<void>;
    /**
     * 退出当前呼叫邀请。
     * @param callID 呼叫邀请ID
     * @param extendedData 自定义数据
     * @param notificationConfig 通知配置。
     */
    callQuit(
        callID: string,
        extendedData: string,
        notificationConfig?: ZegoSignalingNotificationConfig,
    ): Promise<ZIMCallQuitSentResult>

    /**
     * 结束呼叫邀请。
     * @param callID 呼叫邀请ID
     * @param extendedData 自定义数据
     * @param notificationConfig 通知配置。
     */
    callEnd(
        callID: string,
        extendedData: string,
        notificationConfig?: ZegoSignalingNotificationConfig
    ): Promise<ZIMCallEndSentResult>
}