// TypeScript Version

import { ZegoUser } from "@/uni_modules/zego-UIKitCore/services/express/ZegoExpressUniApp";
import { ZegoUIKitPrebuiltCallConfig } from "../config/ZegoUIKitPrebuiltCallConfig";
import { CallingInvitationListSheetDisplayCallBack, RegisterPushConfig } from "./defines";
import { ZPNsConfig } from "@/js_sdk/zego-ZPNsUniPlugin-JS/lib";

export const defalutPrebuiltCallInvitationConfig = {
    showDeclineButton: true,
    endCallWhenInitiatorLeave: false,
    canInvitingInCalling: false,
    onlyInitiatorCanInvite: false,
}

export const defaultCallingInvitationListConfig = {
    waitingSelectUsers: [],
    defaultChecked: true,
}

export class ZegoUIKitPrebuiltCallInvitationConfig {

    // 呼叫邀请的来电铃声。
    incomingCallRingtone?: string;
    // 呼叫邀请的去电铃声。
    outgoingCallRingtone?: string;
    incomingCallBackground?: string;
    outgoingCallBackground?: string;

    // 显示拒绝邀请按钮。默认为true。
    showDeclineButton?: boolean;

    callConfig?: ZegoUIKitPrebuiltCallConfig;

    // 当呼叫发起者离开通话时，整个通话是否应该结束（导致其他参与者一起离开）。
    // 默认值为false。
    // 如果设置为false，则即使发起者离开，通话仍然可以继续。
    endCallWhenInitiatorLeave?: boolean;

    // 当应用程序在后台运行或退出时是否启用消息推送
    enableNotifyWhenAppRunningInBackgroundOrQuit?: boolean;

    // 离线推送注册配置 IOS端使用
    offlinePushConfigWhenRegister?: RegisterPushConfig;

    // 各家厂商的离线推送设置项
    offlinePushConfig?: ZPNsConfig;

    // 是否允许在通话中发送邀请
    // 默认值为false。
    canInvitingInCalling?: boolean;

    // 是否只有呼叫发起者有权限邀请其他人加入通话。
    // 默认值为false。
    // 如果设置为false，则通话中的所有参与者都可以邀请其他人。
    onlyInitiatorCanInvite?: boolean;

    // 当拒绝按钮被按下时（被叫用户拒绝呼叫邀请），将触发此回调。
    onIncomingCallDeclineButtonPressed?: () => void;

    // 当接受按钮被按下时（被叫用户接受呼叫邀请），将触发此回调。
    onIncomingCallAcceptButtonPressed?: () => void;

    // 当接收到呼叫邀请时，将触发此回调。
    onIncomingCallReceived?: (callID: string, caller: ZegoUser, callType: number, callees: ZegoUser[]) => void;

    // 当主叫用户取消呼叫邀请时，将触发此回调
    onIncomingCallCanceled?: (callID: string, caller: ZegoUser) => void;

    // 被叫用户在超时时间内未响应呼叫邀请时，将通过此回调接收到通知。
    onIncomingCallTimeout?: (callID: string, caller: ZegoUser) => void;

    // 当取消按钮被按下时（主叫用户取消呼叫邀请），将触发此回调。
    onOutgoingCallCancelButtonPressed?: () => void;

    // 当被叫用户接受呼叫邀请时，主叫用户将通过此回调接收到通知。
    onOutgoingCallAccepted?: (callID: string, callee: ZegoUser) => void;

    // 当被叫用户拒绝呼叫邀请时（被呼叫者忙碌），主叫用户将通过此回调接收到通知。
    onOutgoingCallRejectedCauseBusy?: (callID: string, callee: ZegoUser) => void;

    // 当被叫用户主动拒绝呼叫邀请时，主叫用户将通过此回调接收到通知。
    onOutgoingCallDeclined?: (callID: string, callee: ZegoUser) => void;

    // 当呼叫邀请在超时时间内未收到响应时，主叫用户将通过此回调接收到通知。
    onOutgoingCallTimeout?: (callID: string, callees: ZegoUser[]) => void

    // 用户点击邀请列表回调
    // 通过回调自定义邀请用户列表
    onCallingInvitationListSheetDisplay?: CallingInvitationListSheetDisplayCallBack;
}