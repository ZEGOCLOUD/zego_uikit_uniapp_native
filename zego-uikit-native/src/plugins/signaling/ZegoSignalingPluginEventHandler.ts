import { ZegoSignalingConnectionState, ZegoSignalingInRoomCommandMessage, ZegoSignalingInRoomTextMessage } from './defines'; // 假设这些类型定义在 defines 文件中

/**
 * ZegoSignalingPluginEventHandler 定义了信令插件事件处理器的行为。
 */
export interface ZegoSignalingPluginEventHandler {

    /**
     * 连接状态改变时触发。
     * @param state 当前连接状态。
     */
    onConnectionStateChanged(state: ZegoSignalingConnectionState): void;

    /**
     * 当令牌即将过期时触发。
     * @param second 令牌剩余有效秒数。
     */
    // onTokenWillExpire(second: number): void;

    /**
     * 收到呼叫邀请时触发。
     * @param callID 邀请ID。
     * @param inviterID 发出邀请的用户ID。
     * @param extendedData 自定义数据。
     */
    onCallInvitationReceived(callID: string, inviterID: string, extendedData: string): void;

    /**
     * 收到取消呼叫邀请时触发。
     * @param callID 邀请ID。
     * @param inviterID 发出邀请的用户ID。
     * @param extendedData 自定义数据。
     */
    onCallInvitationCancelled(callID: string, inviterID: string, extendedData: string): void;

    /**
     * 收到接受呼叫邀请时触发。
     * @param callID 邀请ID。
     * @param invitee 接受邀请的用户ID。
     * @param extendedData 自定义数据。
     */
    onCallInvitationAccepted(callID: string, invitee: string, extendedData: string): void;

    /**
     * 收到拒绝呼叫邀请时触发。
     * @param callID 邀请ID。
     * @param invitee 拒绝邀请的用户ID。
     * @param extendedData 自定义数据。
     */
    onCallInvitationRejected(callID: string, invitee: string, extendedData: string): void;

    /**
     * 邀请超时时触发。
     * @param callID 邀请ID。
     */
    onCallInvitationTimeout(callID: string): void;

    /**
     * 邀请者等待应答超时时触发。
     * @param callID 邀请ID。
     * @param invitees 未响应的用户ID列表。
     */
    onCallInviteesAnsweredTimeout(callID: string, invitees: string[]): void;

    /**
     * 房间内用户属性更新时触发。
     * @param attributesMap 属性映射表。
     * @param editor 修改属性的用户ID。
     * @param roomID 房间ID。
     */
    onUsersInRoomAttributesUpdated(attributesMap: Record<string, Record<string, string>>, editor: string, roomID: string): void;

    /**
     * 房间属性更新时触发。
     * @param setProperties 设置的属性列表。
     * @param deleteProperties 删除的属性列表。
     * @param roomID 房间ID。
     */
    onRoomPropertiesUpdated(setProperties: Record<string, string>[], deleteProperties: Record<string, string>[], roomID: string): void;

    /**
     * 房间成员离开时触发。
     * @param userIDList 离开的用户ID列表。
     * @param roomID 房间ID。
     */
    onRoomMemberLeft(userIDList: string[], roomID: string): void;

    /**
     * 房间成员加入时触发。
     * @param userIDList 加入的用户ID列表。
     * @param roomID 房间ID。
     */
    onRoomMemberJoined(userIDList: string[], roomID: string): void;

    /**
     * 收到房间内的文本消息时触发。
     * @param messages 消息列表。
     * @param roomID 房间ID。
     */
    onInRoomTextMessageReceived(messages: ZegoSignalingInRoomTextMessage[], roomID: string): void;

    /**
     * 收到房间内的命令消息时触发。
     * @param messages 消息列表。
     * @param roomID 房间ID。
     */
    onInRoomCommandMessageReceived(messages: ZegoSignalingInRoomCommandMessage[], roomID: string): void;

}