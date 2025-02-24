import ZIM, {
    ZIMError, ZIMEventHandler, ZIMEventOfBlacklistChangedResult, ZIMEventOfCallInvitationAcceptedResult,
    // @ts-ignore
    ZIMEventOfCallInvitationCancelledResult, ZIMEventOfCallInvitationCreatedResult, ZIMEventOfCallInvitationEndedResult, ZIMEventOfCallInvitationReceivedResult,
    ZIMEventOfCallInvitationRejectedResult, ZIMEventOfCallInvitationTimeoutResult,
    ZIMEventOfCallInviteesAnsweredTimeoutResult, ZIMEventOfCallUserStateChangedResult, ZIMEventOfConnectionStateChangedResult,
    ZIMEventOfConversationChangedResult, ZIMEventOfConversationsAllDeletedResult,
    ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult,
    ZIMEventOfFriendApplicationListChangedResult, ZIMEventOfFriendApplicationUpdatedResult, ZIMEventOfFriendInfoUpdatedResult, ZIMEventOfFriendListChangedResult, ZIMEventOfGroupApplicationListChangedResult, ZIMEventOfGroupApplicationUpdatedResult, ZIMEventOfGroupAttributesUpdatedResult, ZIMEventOfGroupAvatarUrlUpdatedResult, ZIMEventOfGroupMemberInfoUpdatedResult, ZIMEventOfGroupMemberStateChangedResult, ZIMEventOfGroupMutedInfoUpdatedResult, ZIMEventOfGroupNameUpdatedResult, ZIMEventOfGroupNoticeUpdatedResult, ZIMEventOfGroupStateChangedResult, ZIMEventOfGroupVerifyInfoUpdatedResult, ZIMEventOfMessageDeletedResult, ZIMEventOfMessageReactionsChangedResult, ZIMEventOfMessageReceiptChangedResult, ZIMEventOfMessageRevokeReceivedResult, ZIMEventOfMessageSentStatusChangedResult, ZIMEventOfReceiveConversationMessageResult, ZIMEventOfRoomAttributesUpdatedResult, ZIMEventOfRoomMemberChangedResult, ZIMEventOfRoomMembersAttributesUpdatedResult, ZIMEventOfRoomStateChangedResult, ZIMEventOfTokenWillExpireResult, ZIMEventOfUserInfoUpdatedResult,
    ZIMEventOfUserRuleUpdatedResult
} from "./ZIMUniApp";

// 提供 ZIMEventHandler 的默认实现
export class DefaultZIMEventHandler implements Partial<ZIMEventHandler> {

    handler?: Partial<ZIMEventHandler>;

    constructor(handler?: Partial<ZIMEventHandler>) {
        this.handler = handler
    }

    error(zim: ZIM, errorInfo: ZIMError) {
        this.handler?.error?.(zim, errorInfo)
    }
    connectionStateChanged(zim: ZIM, data: ZIMEventOfConnectionStateChangedResult) {
        this.handler?.connectionStateChanged?.(zim, data)

    }
    tokenWillExpire(zim: ZIM, data: ZIMEventOfTokenWillExpireResult) {
        this.handler?.tokenWillExpire?.(zim, data)

        // this.signalingHandlerList.notifyAllListener(handler => handler.onTokenWillExpire?.(data.second);

    }
    userInfoUpdated(zim: ZIM, data: ZIMEventOfUserInfoUpdatedResult) {
        this.handler?.userInfoUpdated?.(zim, data)
    }
    userRuleUpdated(zim: ZIM, data: ZIMEventOfUserRuleUpdatedResult) {
        this.handler?.userRuleUpdated?.(zim, data)
    }
    conversationsAllDeleted(zim: ZIM, data: ZIMEventOfConversationsAllDeletedResult) {
        this.handler?.conversationsAllDeleted?.(zim, data)
    }
    conversationChanged(zim: ZIM, data: ZIMEventOfConversationChangedResult) {
        this.handler?.conversationChanged?.(zim, data)
    }
    conversationTotalUnreadMessageCountUpdated(zim: ZIM, data: ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult) {
        this.handler?.conversationTotalUnreadMessageCountUpdated?.(zim, data)
    }
    receivePeerMessage(zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) {
        this.handler?.receivePeerMessage?.(zim, data)
    }
    receiveGroupMessage(zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) {
        this.handler?.receiveGroupMessage?.(zim, data)
    }
    receiveRoomMessage(zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) {
        this.handler?.receiveRoomMessage?.(zim, data)

    }
    conversationMessageReceiptChanged(zim: ZIM, data: ZIMEventOfMessageReceiptChangedResult) {
        this.handler?.conversationMessageReceiptChanged?.(zim, data)
    }
    messageReceiptChanged(zim: ZIM, data: ZIMEventOfMessageReceiptChangedResult) {
        this.handler?.messageReceiptChanged?.(zim, data)
    }
    messageRevokeReceived(zim: ZIM, data: ZIMEventOfMessageRevokeReceivedResult) {
        this.handler?.messageRevokeReceived?.(zim, data)
    }
    messageSentStatusChanged(zim: ZIM, data: ZIMEventOfMessageSentStatusChangedResult) {
        this.handler?.messageSentStatusChanged?.(zim, data)
    }
    messageReactionsChanged(zim: ZIM, data: ZIMEventOfMessageReactionsChangedResult) {
        this.handler?.messageReactionsChanged?.(zim, data)
    }
    messageDeleted(zim: ZIM, data: ZIMEventOfMessageDeletedResult) {
        this.handler?.messageDeleted?.(zim, data)
    }
    roomStateChanged(zim: ZIM, data: ZIMEventOfRoomStateChangedResult) {
        this.handler?.roomStateChanged?.(zim, data)
    }
    roomMemberJoined(zim: ZIM, data: ZIMEventOfRoomMemberChangedResult) {
        this.handler?.roomMemberJoined?.(zim, data)

    }
    roomMemberLeft(zim: ZIM, data: ZIMEventOfRoomMemberChangedResult) {
        this.handler?.roomMemberLeft?.(zim, data)

    }
    roomAttributesUpdated(zim: ZIM, data: ZIMEventOfRoomAttributesUpdatedResult) {
        this.handler?.roomAttributesUpdated?.(zim, data)


    }
    roomAttributesBatchUpdated(zim: ZIM, data: ZIMEventOfRoomAttributesUpdatedResult) {
        this.handler?.roomAttributesBatchUpdated?.(zim, data)


    }
    roomMemberAttributesUpdated(zim: ZIM, data: ZIMEventOfRoomMembersAttributesUpdatedResult) {
        this.handler?.roomMemberAttributesUpdated?.(zim, data)

    }
    groupStateChanged(zim: ZIM, data: ZIMEventOfGroupStateChangedResult) {
        this.handler?.groupStateChanged?.(zim, data)
    }
    groupNameUpdated(zim: ZIM, data: ZIMEventOfGroupNameUpdatedResult) {
        this.handler?.groupNameUpdated?.(zim, data)
    }
    groupAvatarUrlUpdated(zim: ZIM, data: ZIMEventOfGroupAvatarUrlUpdatedResult) {
        this.handler?.groupAvatarUrlUpdated?.(zim, data)
    }
    groupNoticeUpdated(zim: ZIM, data: ZIMEventOfGroupNoticeUpdatedResult) {
        this.handler?.groupNoticeUpdated?.(zim, data)
    }
    groupAttributesUpdated(zim: ZIM, data: ZIMEventOfGroupAttributesUpdatedResult) {
        this.handler?.groupAttributesUpdated?.(zim, data)
    }
    groupMemberStateChanged(zim: ZIM, data: ZIMEventOfGroupMemberStateChangedResult) {
        this.handler?.groupMemberStateChanged?.(zim, data)
    }
    groupMemberInfoUpdated(zim: ZIM, data: ZIMEventOfGroupMemberInfoUpdatedResult) {
        this.handler?.groupMemberInfoUpdated?.(zim, data)
    }
    groupMutedInfoUpdated(zim: ZIM, data: ZIMEventOfGroupMutedInfoUpdatedResult) {
        this.handler?.groupMutedInfoUpdated?.(zim, data)
    }
    groupVerifyInfoUpdated(zim: ZIM, data: ZIMEventOfGroupVerifyInfoUpdatedResult) {
        this.handler?.groupVerifyInfoUpdated?.(zim, data)
    }
    groupApplicationListChanged(zim: ZIM, data: ZIMEventOfGroupApplicationListChangedResult) {
        this.handler?.groupApplicationListChanged?.(zim, data)
    }
    groupApplicationUpdated(zim: ZIM, data: ZIMEventOfGroupApplicationUpdatedResult) {
        this.handler?.groupApplicationUpdated?.(zim, data)
    }

    callInvitationCreated(zim: ZIM, data: ZIMEventOfCallInvitationCreatedResult) {
        // @ts-ignore
        this.handler?.callInvitationCreated?.(zim, data)
    }
    callInvitationReceived(zim: ZIM, data: ZIMEventOfCallInvitationReceivedResult) {
        this.handler?.callInvitationReceived?.(zim, data)

    }
    callInvitationCancelled(zim: ZIM, data: ZIMEventOfCallInvitationCancelledResult) {
        this.handler?.callInvitationCancelled?.(zim, data)
    }
    callInvitationTimeout(zim: ZIM, data: ZIMEventOfCallInvitationTimeoutResult) {
        this.handler?.callInvitationTimeout?.(zim, data)


    }
    callInvitationEnded(zim: ZIM, data: ZIMEventOfCallInvitationEndedResult) {
        this.handler?.callInvitationEnded?.(zim, data)
    }
    callUserStateChanged(zim: ZIM, data: ZIMEventOfCallUserStateChangedResult) {
        this.handler?.callUserStateChanged?.(zim, data)
    }
    callInvitationAccepted(zim: ZIM, data: ZIMEventOfCallInvitationAcceptedResult) {
        this.handler?.callInvitationAccepted?.(zim, data)


    }
    callInvitationRejected(zim: ZIM, data: ZIMEventOfCallInvitationRejectedResult) {
        this.handler?.callInvitationRejected?.(zim, data)


    }
    callInviteesAnsweredTimeout(zim: ZIM, data: ZIMEventOfCallInviteesAnsweredTimeoutResult) {
        this.handler?.callInviteesAnsweredTimeout?.(zim, data)

    }
    blacklistChanged(zim: ZIM, data: ZIMEventOfBlacklistChangedResult) {
        this.handler?.blacklistChanged?.(zim, data)
    }
    friendListChanged(zim: ZIM, data: ZIMEventOfFriendListChangedResult) {
        this.handler?.friendListChanged?.(zim, data)
    }
    friendInfoUpdated(zim: ZIM, data: ZIMEventOfFriendInfoUpdatedResult) {
        this.handler?.friendInfoUpdated?.(zim, data)
    }
    friendApplicationListChanged(zim: ZIM, data: ZIMEventOfFriendApplicationListChangedResult) {
        this.handler?.friendApplicationListChanged?.(zim, data)
    }
    friendApplicationUpdated(zim: ZIM, data: ZIMEventOfFriendApplicationUpdatedResult) {
        this.handler?.friendApplicationUpdated?.(zim, data)
    }


}