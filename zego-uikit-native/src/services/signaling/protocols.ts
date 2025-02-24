

// 邀请信令的协议

import { CallingConfig, CallInvitationRejectReason, ZegoInvitationType } from "./defines";

// 信封, 协议外层封装
// ZIM sendInvitation 中的参数 extendedData, JSON.stringfy 后传给 sendInvitation/calcelInvitation/...
export interface InvitationEnvelope extends CallingConfig {
    /**
     * 通话类型, 0: 语音通话, 1: 视频通话
     */
    type: ZegoInvitationType;
    /**
     * 发起邀请的人的uid
     */
    inviter_id: string;
    /**
     * 发起人的昵称
     */
    inviter_name: string;
    /**
     * 把 InvitationMessage JSON.stringfy 后的内容
     */
    data: string;
    /**
     * 拒绝呼叫邀请原因
     */
    reason?: CallInvitationRejectReason;
}


// 邀请消息本体
// extendedData.data 
export interface InvitationMessage {
    /**
     * 这个是 RTC 的 roomID, 由发起方来约定, 接收方收到消息后进入这个RTC房间. 
     * 注意: 不是 ZIM 的 callID(ZIM的callID 应该叫 invitationID, 历史原因保持不变)
     */
    call_id: string;
    /**
     * 被邀请者列表
     */
    invitees: { user_id: string, user_name: string }[];
    /**
     * 调用者自定义的数据, 内部不做任何处理, 直接透传
     */
    custom_data: string;
    /**
     * 主邀请人
     */
    inviter: { id: string, name: string };
}
