/**
 * 呼叫状态枚举。
 */
export enum CallState {
    /**
     * 无通话 - 未回复
     */
    NoneCallNoReply = -5,

    /**
     * 无通话 - 错过接听
     */
    NoneReceiveMissed = -4,

    /**
     * 无通话 - 被拒绝
     */
    NoneRejected = -3,

    /**
     * 无通话 - 已取消
     */
    NoneCanceled = -2,

    /**
     * 无通话 - 已挂断
     */
    NoneHangUp = -1,

    /**
     * 无通话
     */
    None = 0,

    /**
     * 呼出中
     */
    Outgoing = 1,

    /**
     * 通话中
     */
    Connected = 2,

    /**
     * 呼入中
     */
    Incoming = 3,
}


export enum CallRespondAction {
    /**
     * 接受
     */
    Accept = 'accept',

    /**
     * 拒绝
     */
    Refuse = 'refuse',

    /**
     * 对方繁忙
     */
    Busy = 'busy',

    /**
     * 发起方取消
     */
    InviterCancel = 'inviterCancel',

    /**
     * 被叫方未响应直到超时
     */
    Timeout = 'timeout',
}