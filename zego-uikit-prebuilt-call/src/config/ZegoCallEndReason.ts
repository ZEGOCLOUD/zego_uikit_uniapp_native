/**
 * 定义通话结束原因的枚举类型。
 */
export enum ZegoCallEndReason {
    /**
     * 本地挂断
     */
    LocalHangup,

    /**
     * 远程挂断
     */
    RemoteHangup,

    /**
     * 被踢出通话
     */
    KickOut
}