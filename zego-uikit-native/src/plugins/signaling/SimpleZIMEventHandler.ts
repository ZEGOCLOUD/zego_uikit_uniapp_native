import { makeTag, zlogerror, zloginfo, zlogwarning } from "../../utils";
import { NotifyList } from "../../services/internal/NotifyList";
import ZIM, {
    ZIMCallUserState,
    ZIMCommandMessage, ZIMError, ZIMEventHandler, ZIMEventOfBlacklistChangedResult, ZIMEventOfCallInvitationAcceptedResult,
    // @ts-ignore
    ZIMEventOfCallInvitationCancelledResult, ZIMEventOfCallInvitationCreatedResult, ZIMEventOfCallInvitationEndedResult, ZIMEventOfCallInvitationReceivedResult,
    ZIMEventOfCallInvitationRejectedResult, ZIMEventOfCallInvitationTimeoutResult,
    ZIMEventOfCallInviteesAnsweredTimeoutResult, ZIMEventOfCallUserStateChangedResult, ZIMEventOfConnectionStateChangedResult,
    ZIMEventOfConversationChangedResult, ZIMEventOfConversationsAllDeletedResult,
    ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult,
    ZIMEventOfFriendApplicationListChangedResult, ZIMEventOfFriendApplicationUpdatedResult, ZIMEventOfFriendInfoUpdatedResult, ZIMEventOfFriendListChangedResult, ZIMEventOfGroupApplicationListChangedResult, ZIMEventOfGroupApplicationUpdatedResult, ZIMEventOfGroupAttributesUpdatedResult, ZIMEventOfGroupAvatarUrlUpdatedResult, ZIMEventOfGroupMemberInfoUpdatedResult, ZIMEventOfGroupMemberStateChangedResult, ZIMEventOfGroupMutedInfoUpdatedResult, ZIMEventOfGroupNameUpdatedResult, ZIMEventOfGroupNoticeUpdatedResult, ZIMEventOfGroupStateChangedResult, ZIMEventOfGroupVerifyInfoUpdatedResult, ZIMEventOfMessageDeletedResult, ZIMEventOfMessageReactionsChangedResult, ZIMEventOfMessageReceiptChangedResult, ZIMEventOfMessageRevokeReceivedResult, ZIMEventOfMessageSentStatusChangedResult, ZIMEventOfReceiveConversationMessageResult, ZIMEventOfRoomAttributesUpdatedResult, ZIMEventOfRoomMemberChangedResult, ZIMEventOfRoomMembersAttributesUpdatedResult, ZIMEventOfRoomStateChangedResult, ZIMEventOfTokenWillExpireResult, ZIMEventOfUserInfoUpdatedResult,
    ZIMEventOfUserRuleUpdatedResult, ZIMMessageType, ZIMRoomAttributesUpdateAction, ZIMTextMessage
} from "./ZIMUniApp";
import { ZegoSignalingPluginEventHandler } from "./ZegoSignalingPluginEventHandler";
import { ZegoSignalingConnectionState, ZegoSignalingInRoomCommandMessage, ZegoSignalingInRoomTextMessage } from "./defines";
import UIKitCore from "../../services/internal/UIKitCore";

const TAG = makeTag('SimpleZIMEventHandler') 

export class SimpleZIMEventHandler implements Partial<ZIMEventHandler> {

    handlerList: NotifyList<ZIMEventHandler> = new NotifyList();

    signalingHandlerList: NotifyList<ZegoSignalingPluginEventHandler>;

    constructor(signalingHandlerList: NotifyList<ZegoSignalingPluginEventHandler>) {
        zloginfo(TAG, 'init SimpleZIMEventHandler')
        // 隐藏掉 handlerList, signalingHandlerList, 不允许枚举
        Object.defineProperties(this, {
            "handlerList": {
                enumerable: false
            },
            "signalingHandlerList": {
                enumerable: false
            }
        })

        this.signalingHandlerList = signalingHandlerList

    }

    addListener(listenerID: string, handler: ZIMEventHandler): void {
        if (handler) {
            this.handlerList.addListener(listenerID, handler);
        }
    }

    removeListener(listenerID: string): void {
        this.handlerList.removeListener(listenerID)
    }

    removeAllEventListeners() {
        this.handlerList.clear()
    }

    error = (zim: ZIM, errorInfo: ZIMError) => {
        zlogerror(TAG, `ZIM error: ${errorInfo.code} : ${errorInfo.message}}`)

        this.handlerList.notifyAllListener((handler) => handler.error?.(zim, errorInfo))
    }
    connectionStateChanged = (zim: ZIM, data: ZIMEventOfConnectionStateChangedResult) => {
        zlogwarning(TAG, `ZIM connectionStateChanged: ${data.state} ${data.event}`)
        this.handlerList.notifyAllListener((handler) => handler.connectionStateChanged?.(zim, data))

        const state = data.state as unknown as ZegoSignalingConnectionState
        this.signalingHandlerList.notifyAllListener(handler => handler.onConnectionStateChanged?.(state));
    }
    tokenWillExpire = (zim: ZIM, data: ZIMEventOfTokenWillExpireResult) => {
        zloginfo(TAG, `ZIM tokenWillExpire: ${data.second}`)
        this.handlerList.notifyAllListener((handler) => handler.tokenWillExpire?.(zim, data))

        // this.signalingHandlerList.notifyAllListener(handler => handler.onTokenWillExpire?.(data.second));

    }
    userInfoUpdated = (zim: ZIM, data: ZIMEventOfUserInfoUpdatedResult) => {
        zloginfo(TAG, `ZIM userInfoUpdated: ${JSON.stringify(data.info)}`)
        this.handlerList.notifyAllListener((handler) => handler.userInfoUpdated?.(zim, data))
    }
    userRuleUpdated = (zim: ZIM, data: ZIMEventOfUserRuleUpdatedResult) => {
        zloginfo(TAG, `ZIM userRuleUpdated: ${JSON.stringify(data.userRule)}`)
        this.handlerList.notifyAllListener((handler) => handler.userRuleUpdated?.(zim, data))
    }
    conversationsAllDeleted = (zim: ZIM, data: ZIMEventOfConversationsAllDeletedResult) => {
        zloginfo(TAG, `ZIM conversationsAllDeleted: ${data.count}`)
        this.handlerList.notifyAllListener((handler) => handler.conversationsAllDeleted?.(zim, data))
    }
    conversationChanged = (zim: ZIM, data: ZIMEventOfConversationChangedResult) => {
        zloginfo(TAG, `ZIM conversationChanged: ${JSON.stringify(data.infoList)}`)
        this.handlerList.notifyAllListener((handler) => handler.conversationChanged?.(zim, data))
    }
    conversationTotalUnreadMessageCountUpdated = (zim: ZIM, data: ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult) => {
        zloginfo(TAG, `ZIM conversationTotalUnreadMessageCountUpdated: ${data.totalUnreadMessageCount}`)
        this.handlerList.notifyAllListener((handler) => handler.conversationTotalUnreadMessageCountUpdated?.(zim, data))
    }
    receivePeerMessage = (zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) => {
        zloginfo(TAG, `ZIM receivePeerMessage: ${JSON.stringify(data.messageList)}`)
        this.handlerList.notifyAllListener((handler) => handler.receivePeerMessage?.(zim, data))
    }
    receiveGroupMessage = (zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) => {
        zloginfo(TAG, `ZIM receiveGroupMessage: ${JSON.stringify(data.messageList)}`)
        this.handlerList.notifyAllListener((handler) => handler.receiveGroupMessage?.(zim, data))
    }
    receiveRoomMessage = (zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) => {
        zloginfo(TAG, `ZIM receiveRoomMessage: ${JSON.stringify(data.messageList)}`)
        this.handlerList.notifyAllListener((handler) => handler.receiveRoomMessage?.(zim, data))

        const { fromConversationID: roomID, messageList } = data
        // 对 messageList 做个排序, 按 timestamp 升序排列
        messageList.sort((a, b) => a.timestamp - b.timestamp)

        const textMessageList: ZegoSignalingInRoomTextMessage[] = []
        const commandMessageList: ZegoSignalingInRoomCommandMessage[] = []

        const decoder = new TextDecoder('utf-8');

        // 遍历 messageList, 根据 type 筛选出 textMessage 和 commandMessage
        messageList.forEach(message => {
            if (message.type === ZIMMessageType.Text) {
                const msg = message as ZIMTextMessage;
                textMessageList.push({
                    messageID: msg.messageID,
                    orderKey: msg.orderKey,
                    senderUserID: msg.senderUserID,
                    text: msg.message,
                    timestamp: msg.timestamp
                })
            } else if (message.type === ZIMMessageType.Command) {
                const msg = message as ZIMCommandMessage;
                const messageText = decoder.decode(msg.message)
                commandMessageList.push({
                    messageID: msg.messageID,
                    orderKey: msg.orderKey,
                    senderUserID: msg.senderUserID,
                    text: messageText,
                    timestamp: msg.timestamp
                })
            }
        })

        if (textMessageList.length) {
            this.signalingHandlerList.notifyAllListener(handler => handler.onInRoomTextMessageReceived?.(textMessageList, roomID));
        }

        if (commandMessageList.length) {
            this.signalingHandlerList.notifyAllListener(handler => handler.onInRoomCommandMessageReceived?.(commandMessageList, roomID));
        }

    }
    conversationMessageReceiptChanged = (zim: ZIM, data: ZIMEventOfMessageReceiptChangedResult) => {
        zloginfo(TAG, `ZIM conversationMessageReceiptChanged: ${JSON.stringify(data.infos)}`)
        this.handlerList.notifyAllListener((handler) => handler.conversationMessageReceiptChanged?.(zim, data))
    }
    messageReceiptChanged = (zim: ZIM, data: ZIMEventOfMessageReceiptChangedResult) => {
        zloginfo(TAG, `ZIM messageReceiptChanged: ${JSON.stringify(data.infos)}`)
        this.handlerList.notifyAllListener((handler) => handler.messageReceiptChanged?.(zim, data))
    }
    messageRevokeReceived = (zim: ZIM, data: ZIMEventOfMessageRevokeReceivedResult) => {
        zloginfo(TAG, `ZIM messageRevokeReceived: ${JSON.stringify(data.messageList)}`)
        this.handlerList.notifyAllListener((handler) => handler.messageRevokeReceived?.(zim, data))
    }
    messageSentStatusChanged = (zim: ZIM, data: ZIMEventOfMessageSentStatusChangedResult) => {
        zloginfo(TAG, `ZIM messageSentStatusChanged: ${JSON.stringify(data.infos)}`)
        this.handlerList.notifyAllListener((handler) => handler.messageSentStatusChanged?.(zim, data))
    }
    messageReactionsChanged = (zim: ZIM, data: ZIMEventOfMessageReactionsChangedResult) => {
        zloginfo(TAG, `ZIM messageReactionsChanged: ${JSON.stringify(data.reactions)}`)
        this.handlerList.notifyAllListener((handler) => handler.messageReactionsChanged?.(zim, data))
    }
    messageDeleted = (zim: ZIM, data: ZIMEventOfMessageDeletedResult) => {
        zloginfo(TAG, `ZIM messageDeleted: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.messageDeleted?.(zim, data))
    }
    roomStateChanged = (zim: ZIM, data: ZIMEventOfRoomStateChangedResult) => {
        zloginfo(TAG, `ZIM roomStateChanged: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.roomStateChanged?.(zim, data))
    }

    roomMemberJoined = (zim: ZIM, data: ZIMEventOfRoomMemberChangedResult) => {
        zloginfo(TAG, `ZIM roomMemberJoined: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.roomMemberJoined?.(zim, data))

        const { roomID, memberList } = data
        const userIDList = memberList.map(zimUserInfo => zimUserInfo.userID);
        this.signalingHandlerList.notifyAllListener(handler => handler.onRoomMemberJoined?.(userIDList, roomID));
    }

    roomMemberLeft = (zim: ZIM, data: ZIMEventOfRoomMemberChangedResult) => {
        zloginfo(TAG, `ZIM roomMemberLeft: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.roomMemberLeft?.(zim, data))

        const { roomID, memberList } = data
        const userIDList = memberList.map(zimUserInfo => zimUserInfo.userID);
        this.signalingHandlerList.notifyAllListener(handler => handler.onRoomMemberLeft?.(userIDList, roomID));
    }

    roomAttributesUpdated = (zim: ZIM, data: ZIMEventOfRoomAttributesUpdatedResult) => {
        zloginfo(TAG, `ZIM roomAttributesUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.roomAttributesUpdated?.(zim, data))

        const { roomID, infos } = data

        const setProperties: Record<string, string>[] = []
        const deleteProperties: Record<string, string>[] = []
        for (const info of infos) {
            if (info.action == ZIMRoomAttributesUpdateAction.Set) {
                setProperties.push(info.roomAttributes)
            } else if (info.action == ZIMRoomAttributesUpdateAction.Delete) {
                deleteProperties.push(info.roomAttributes)
            }
        }

        this.signalingHandlerList.notifyAllListener(handler => handler.onRoomPropertiesUpdated?.(setProperties, deleteProperties, roomID));

    }

    roomAttributesBatchUpdated = (zim: ZIM, data: ZIMEventOfRoomAttributesUpdatedResult) => {
        zloginfo(TAG, `ZIM roomAttributesBatchUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.roomAttributesBatchUpdated?.(zim, data))

        const { roomID, infos } = data

        const setProperties: Record<string, string>[] = []
        const deleteProperties: Record<string, string>[] = []
        for (const info of infos) {
            if (info.action == ZIMRoomAttributesUpdateAction.Set) {
                setProperties.push(info.roomAttributes)
            } else if (info.action == ZIMRoomAttributesUpdateAction.Delete) {
                deleteProperties.push(info.roomAttributes)
            }
        }

        this.signalingHandlerList.notifyAllListener(handler => handler.onRoomPropertiesUpdated?.(setProperties, deleteProperties, roomID));

    }

    roomMemberAttributesUpdated = (zim: ZIM, data: ZIMEventOfRoomMembersAttributesUpdatedResult) => {
        zloginfo(TAG, `ZIM roomMemberAttributesUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.roomMemberAttributesUpdated?.(zim, data))

        const { roomID, infos, operatedInfo } = data
        const map: Record<string, Record<string, string>> = {}
        // 遍历 infos 数组并填充 map
        for (const info of infos) {
            map[info.attributesInfo.userID] = info.attributesInfo.attributes;
        }
        this.signalingHandlerList.notifyAllListener(handler => handler.onUsersInRoomAttributesUpdated?.(map, operatedInfo.userID, roomID));
    }

    groupStateChanged = (zim: ZIM, data: ZIMEventOfGroupStateChangedResult) => {
        zloginfo(TAG, `ZIM groupStateChanged: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupStateChanged?.(zim, data))
    }

    groupNameUpdated = (zim: ZIM, data: ZIMEventOfGroupNameUpdatedResult) => {
        zloginfo(TAG, `ZIM groupNameUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupNameUpdated?.(zim, data))
    }

    groupAvatarUrlUpdated = (zim: ZIM, data: ZIMEventOfGroupAvatarUrlUpdatedResult) => {
        zloginfo(TAG, `ZIM groupAvatarUrlUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupAvatarUrlUpdated?.(zim, data))
    }

    groupNoticeUpdated = (zim: ZIM, data: ZIMEventOfGroupNoticeUpdatedResult) => {
        zloginfo(TAG, `ZIM groupNoticeUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupNoticeUpdated?.(zim, data))
    }

    groupAttributesUpdated = (zim: ZIM, data: ZIMEventOfGroupAttributesUpdatedResult) => {
        zloginfo(TAG, `ZIM groupAttributesUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupAttributesUpdated?.(zim, data))
    }

    groupMemberStateChanged = (zim: ZIM, data: ZIMEventOfGroupMemberStateChangedResult) => {
        zloginfo(TAG, `ZIM groupMemberStateChanged: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupMemberStateChanged?.(zim, data))
    }

    groupMemberInfoUpdated = (zim: ZIM, data: ZIMEventOfGroupMemberInfoUpdatedResult) => {
        zloginfo(TAG, `ZIM groupMemberInfoUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupMemberInfoUpdated?.(zim, data))
    }

    groupMutedInfoUpdated = (zim: ZIM, data: ZIMEventOfGroupMutedInfoUpdatedResult) => {
        zloginfo(TAG, `ZIM groupMutedInfoUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupMutedInfoUpdated?.(zim, data))
    }

    groupVerifyInfoUpdated = (zim: ZIM, data: ZIMEventOfGroupVerifyInfoUpdatedResult) => {
        zloginfo(TAG, `ZIM groupVerifyInfoUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupVerifyInfoUpdated?.(zim, data))
    }

    groupApplicationListChanged = (zim: ZIM, data: ZIMEventOfGroupApplicationListChangedResult) => {
        zloginfo(TAG, `ZIM groupApplicationListChanged: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupApplicationListChanged?.(zim, data))
    }

    groupApplicationUpdated = (zim: ZIM, data: ZIMEventOfGroupApplicationUpdatedResult) => {
        zloginfo(TAG, `ZIM groupApplicationUpdated: ${JSON.stringify(data)}`)
        this.handlerList.notifyAllListener((handler) => handler.groupApplicationUpdated?.(zim, data))
    }
    callInvitationCreated = (zim: ZIM, data: ZIMEventOfCallInvitationCreatedResult) => {
        zloginfo(TAG, `ZIM callInvitationCreated: ${JSON.stringify(data)}`);
        // @ts-ignore
        this.handlerList.notifyAllListener((handler) => handler.callInvitationCreated?.(zim, data))
    }

    callInvitationReceived = (zim: ZIM, data: ZIMEventOfCallInvitationReceivedResult) => {
        zloginfo(TAG, `ZIM callInvitationReceived: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.callInvitationReceived?.(zim, data))

        this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationReceived?.(data.callID, data.inviter, data.extendedData));
    }

    callInvitationCancelled = (zim: ZIM, data: ZIMEventOfCallInvitationCancelledResult) => {
        zloginfo(TAG, `ZIM callInvitationCancelled: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.callInvitationCancelled?.(zim, data));

        this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationCancelled?.(data.callID, data.inviter, data.extendedData));
    }

    callInvitationTimeout = (zim: ZIM, data: ZIMEventOfCallInvitationTimeoutResult) => {
        zloginfo(TAG, `ZIM callInvitationTimeout: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.callInvitationTimeout?.(zim, data))

        this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationTimeout?.(data.callID));

    }

    callInvitationEnded = (zim: ZIM, data: ZIMEventOfCallInvitationEndedResult) => {
        zloginfo(TAG, `ZIM callInvitationEnded: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.callInvitationEnded?.(zim, data))
    }

    callUserStateChanged = (zim: ZIM, data: ZIMEventOfCallUserStateChangedResult) => {
        zlogwarning(TAG, `ZIM callUserStateChanged: ${JSON.stringify(data)}`);
        // this.handlerList.notifyAllListener((handler) => handler.callUserStateChanged?.(zim, data))
        const { callID, callUserList } = data
        const localCoreUser = UIKitCore.getInstance().getLocalCoreUser()
        const timeoutInvitees = callUserList
            .filter(({ state, userID }) => state === ZIMCallUserState.Timeout && userID !== localCoreUser?.userID)
            .map(({ userID }) => userID)
        if (timeoutInvitees.length) {
            this.signalingHandlerList.notifyAllListener(handler => handler.onCallInviteesAnsweredTimeout?.(data.callID, timeoutInvitees))
        }
        callUserList.forEach(({ state, userID, extendedData }) => {
            if (userID === localCoreUser?.userID) return
            if (state === ZIMCallUserState.Rejected) {
                this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationRejected?.(data.callID, userID, extendedData));
            }
            if (state === ZIMCallUserState.Accepted) {
                this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationAccepted?.(callID, userID, extendedData));
            }
            if (state === ZIMCallUserState.Ended) {
                this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationCancelled?.(data.callID, userID, extendedData));
            }
            // // @ts-ignore
            // if (state === ZIMCallUserState.BeCancelled) {
            // }
        })
    }

    /**
     * 已废弃，改用[callUserStateChanged]
     */
    callInvitationAccepted = (zim: ZIM, data: ZIMEventOfCallInvitationAcceptedResult) => {
        zloginfo(TAG, `ZIM callInvitationAccepted: ${JSON.stringify(data)}`);
        // this.handlerList.notifyAllListener((handler) => handler.callInvitationAccepted?.(zim, data))

        // 断线重连后callUserStateChanged不会补发，这里做下兼容
        this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationAccepted?.(data.callID, data.invitee, data.extendedData));
    }

    /**
     * 已废弃，改用[callUserStateChanged]
     */
    callInvitationRejected = (zim: ZIM, data: ZIMEventOfCallInvitationRejectedResult) => {
        zloginfo(TAG, `ZIM callInvitationRejected: ${JSON.stringify(data)}`);
        // this.handlerList.notifyAllListener((handler) => handler.callInvitationRejected?.(zim, data))

        // this.signalingHandlerList.notifyAllListener(handler => handler.onCallInvitationRejected?.(data.callID, data.invitee, data.extendedData));
    }

    /**
     * 已废弃，改用[callUserStateChanged]
     */
    callInviteesAnsweredTimeout = (zim: ZIM, data: ZIMEventOfCallInviteesAnsweredTimeoutResult) => {
        zloginfo(TAG, `ZIM callInviteesAnsweredTimeout: ${JSON.stringify(data)}`);
        // this.handlerList.notifyAllListener((handler) => handler.callInviteesAnsweredTimeout?.(zim, data))

        // this.signalingHandlerList.notifyAllListener(handler => handler.onCallInviteesAnsweredTimeout?.(data.callID, data.invitees));
    }

    blacklistChanged = (zim: ZIM, data: ZIMEventOfBlacklistChangedResult) => {
        zloginfo(TAG, `ZIM blacklistChanged: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.blacklistChanged?.(zim, data))
    }

    friendListChanged = (zim: ZIM, data: ZIMEventOfFriendListChangedResult) => {
        zloginfo(TAG, `ZIM friendListChanged: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.friendListChanged?.(zim, data))
    }

    friendInfoUpdated = (zim: ZIM, data: ZIMEventOfFriendInfoUpdatedResult) => {
        zloginfo(TAG, `ZIM friendInfoUpdated: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.friendInfoUpdated?.(zim, data))
    }

    friendApplicationListChanged = (zim: ZIM, data: ZIMEventOfFriendApplicationListChangedResult) => {
        zloginfo(TAG, `ZIM friendApplicationListChanged: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.friendApplicationListChanged?.(zim, data))
    }

    friendApplicationUpdated = (zim: ZIM, data: ZIMEventOfFriendApplicationUpdatedResult) => {
        zloginfo(TAG, `ZIM friendApplicationUpdated: ${JSON.stringify(data)}`);
        this.handlerList.notifyAllListener((handler) => handler.friendApplicationUpdated?.(zim, data))
    }

}