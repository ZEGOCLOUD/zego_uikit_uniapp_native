import ZegoUIKit, {
    DefaultExpressEventHandler, DefaultZIMEventHandler, ExpressEngineEventHandler,
    SingletonScope, ZegoUIKitCallback, ZegoUIKitScenario, ZegoUIKitSignaling, ZegoUIKitSignalingInvitationListener,
    ZegoUIKitUser, getSingletonInstance, makeListenerID, deleteSingletonInstance, zlogerror, zloginfo, CallInvitationRejectReason,
    zlogwarning,
    getAppState,
    ZegoInvitationType,
    UIKitReport,
} from "@/uni_modules/zego-UIKitCore";
import { defalutPrebuiltCallInvitationConfig, ZegoUIKitPrebuiltCallInvitationConfig } from "../../config/ZegoUIKitPrebuiltCallInvitationConfig";
import { ZegoUIKitPrebuiltCallConfig } from "../../config/ZegoUIKitPrebuiltCallConfig";
import CallInvitationHelper from "./CallInvitationHelper";
import { isFunction } from "@/uni_modules/zego-UIKitCore/utils/types";
import ZPNs, { ZPNsRegisterMessage } from "@/js_sdk/zego-ZPNsUniPlugin-JS/lib";
import Permissions from '../../utils/Permissions'
import { t } from "../../lang";
import { CallInviteConfig, CancelInviteConfig } from "../../config/defines";
import { ZegoUser } from "@/uni_modules/zego-UIKitCore/services/express/ZegoExpressUniApp";
import { CallRespondAction } from "./CallState";
import packageJson from '../../config/package.json';
import { ZIMEventHandler } from "@/uni_modules/zego-UIKitCore/plugins/signaling/ZIMUniApp";

const TAG = '[CallInvitationServiceImpl]'

export class CallInvitationServiceImpl {

    private static name: string = '_CallInvitationServiceImpl'

    public getVersion() {
        return packageJson.version;
    }

    public static getInstance(): CallInvitationServiceImpl {
        // 这个单例做成全局一份
        return getSingletonInstance(CallInvitationServiceImpl, SingletonScope.Global)
    }

    public static deleteInstance() {
        deleteSingletonInstance(CallInvitationServiceImpl, SingletonScope.Global)
    }

    private alreadyInit: boolean = false;
    private alreadyLogin: boolean = false;

    private appInfo: { appID: number, appSign: string } | null = null;
    private localUser: ZegoUIKitUser | null = null;

    private inRoom: boolean = false;

    private invitationConfig: ZegoUIKitPrebuiltCallInvitationConfig = {
        ...defalutPrebuiltCallInvitationConfig,
    };

    private listenerID = makeListenerID()

    private expressEventHandler: ExpressEngineEventHandler = new DefaultExpressEventHandler({

        roomStateChanged(roomID, reason, errorCode, extendedData) {
            // const callEndListener = ZegoUIKitPrebuiltCallService.events.callEvents.getCallEndListener();
            // if (reason == ZegoRoomStateChangedReason.KickOut) {
            //     CallInvitationServiceImpl.getInstance().leaveRoom();
            //     if (callEndListener != null) {
            //         callEndListener.onCallEnd(ZegoCallEndReason.KickOut);
            //     }
            // }
        },

        IMRecvCustomCommand(roomID, fromUser, command) {
            // const localUser = ZegoUIKit.getLocalUser();
            // if (!localUser) {
            //     return
            // }
            // try {
            //     const jsonObject = JSON.parse(command);
            //     if ("zego_remove_user" in jsonObject) {
            //         const userIDArray = jsonObject.zego_remove_user as string[]
            //         for (const userID of userIDArray) {
            //             if (userID === localUser.userID) {
            //                 CallInvitationServiceImpl.getInstance().leaveRoom();
            //                 const callEndListener = ZegoUIKitPrebuiltCallService.events.callEvents.getCallEndListener();
            //                 if (callEndListener != null) {
            //                     callEndListener.onCallEnd(ZegoCallEndReason.KickOut, fromUser.userID);
            //                 }
            //             }
            //         }
            //     }
            // } catch (e) {
            //     console.error('Error parsing command:', e);
            // }
        },
    });

    private zimEventHandler = new DefaultZIMEventHandler({})


    private invitationListener: ZegoUIKitSignalingInvitationListener = {
        onInvitationReceived: function (inviter: ZegoUIKitUser, type: number, data: Record<string, any>): void {
            zloginfo(TAG, `onInvitationReceived ${inviter.userID} ${type} ${JSON.stringify(data)}`)
            const { isHide, state } = getAppState()
            const { roomID, extendedData } = data
            const { userID, userName } = inviter
            const { invitees = [] } = extendedData || {}
            const { onIncomingCallReceived } = CallInvitationServiceImpl.getInstance().getCallInvitationConfig() || {}

            UIKitReport.reportEvent('call/invitationReceived', {
                call_id: data.invitationID,
                inviter: inviter.userID,
                app_state: state,
                extended_data: JSON.stringify(extendedData),
            })
            const isVideoCall = type === ZegoInvitationType.VideoCall
            CallInvitationHelper.getInstance().onInvitationReceived(data.invitationID, data.inviter, data.roomID, isVideoCall)

            const _invitees = invitees.map((i: { user_id: string; user_name: string }) => ({
                userID: i.user_id,
                userName: i.user_name,
            }))
            if (isFunction(onIncomingCallReceived)) {
                onIncomingCallReceived!(roomID, { userID, userName }, type, _invitees)
            }
            if (isHide) {
                const content = isVideoCall
                    ? t('Invite.videoIncoming')
                    : t('Invite.voiceIncoming')
                uni.createPushMessage({
                    title: inviter.userName || inviter.userID,
                    content,
                })
            }
        },
        onInvitationTimeout: function (inviter: ZegoUIKitUser, data: Record<string, any>): void {
            zloginfo(TAG, `onInvitationTimeout ${inviter.userID} ${data}`)
            const { onIncomingCallTimeout } = CallInvitationServiceImpl.getInstance().getCallInvitationConfig() || {}
            const { incomingCallResponseReport } = CallInvitationServiceImpl.getInstance()
            const { roomID, invitationID } = data
            if (isFunction(onIncomingCallTimeout)) {
                const { userID, userName } = inviter
                onIncomingCallTimeout!(roomID, { userID, userName })
            }
            incomingCallResponseReport(invitationID, CallRespondAction.Timeout)
        },
        onInvitationResponseTimeout: function (invitees: ZegoUIKitUser[], data: Record<string, any>): void {
            zloginfo(TAG, `onInvitationResponseTimeout ${invitees} ${JSON.stringify(data)}`)
            const { onOutgoingCallTimeout } = CallInvitationServiceImpl.getInstance().getCallInvitationConfig() || {}
            const { outgoingCallResponseReport } = CallInvitationServiceImpl.getInstance()
            const { roomID, invitationID } = data
            const _invitees = invitees.map((user: ZegoUIKitUser) => ({
                userID: user.userID,
                userName: user.userName,
            }))
            if (isFunction(onOutgoingCallTimeout)) {
                onOutgoingCallTimeout!(roomID, _invitees)
            }
            outgoingCallResponseReport(invitationID, CallRespondAction.Timeout, _invitees)
        },
        onInvitationAccepted: function (invitee: ZegoUIKitUser, data: Record<string, any>): void {
            zloginfo(TAG, `onInvitationAccepted ${invitee.userID} ${JSON.stringify(data)}`)
            // _onSomeoneAcceptedInvite
            const { onOutgoingCallAccepted } = CallInvitationServiceImpl.getInstance().getCallInvitationConfig() || {}
            const { outgoingCallResponseReport } = CallInvitationServiceImpl.getInstance()
            const { roomID, invitationID } = data
            const { userID, userName } = invitee
            if (isFunction(onOutgoingCallAccepted)) {
                onOutgoingCallAccepted!(roomID, { userID, userName })
            }
            outgoingCallResponseReport(invitationID, CallRespondAction.Accept, [{ userID, userName }])
        },
        onInvitationRefused: function (invitee: ZegoUIKitUser, data: Record<string, any>): void {
            zloginfo(TAG, `onInvitationRefused ${invitee.userID} ${JSON.stringify(data)}`)
            // _notifyInviteCompletedWithNobody
            const { extendedData, roomID, invitationID } = data || {}
            const { userID, userName } = invitee
            const { onOutgoingCallRejectedCauseBusy, onOutgoingCallDeclined } = CallInvitationServiceImpl.getInstance().getCallInvitationConfig() || {}
            const { outgoingCallResponseReport } = CallInvitationServiceImpl.getInstance()

            const isBusy = extendedData?.reason === CallInvitationRejectReason.Busy
            if (isBusy) {
                isFunction(onOutgoingCallRejectedCauseBusy) && onOutgoingCallRejectedCauseBusy!(roomID, { userID, userName })
            } else {
                isFunction(onOutgoingCallDeclined) && onOutgoingCallDeclined!(roomID, { userID, userName })
            }
            outgoingCallResponseReport(invitationID, CallRespondAction.Refuse, [{ userID, userName }])
        },
        onInvitationCanceled: function (inviter: ZegoUIKitUser, data: Record<string, any>): void {
            zloginfo(TAG, `onInvitationCanceled ${inviter.userID} ${JSON.stringify(data)}`)
            const { onIncomingCallCanceled } = CallInvitationServiceImpl.getInstance().getCallInvitationConfig() || {}
            const { incomingCallResponseReport } = CallInvitationServiceImpl.getInstance()
            const { roomID, invitationID } = data
            if (isFunction(onIncomingCallCanceled)) {
                const { userID, userName } = inviter
                onIncomingCallCanceled!(roomID, { userID, userName })
            }
            incomingCallResponseReport(invitationID, CallRespondAction.InviterCancel)
        }
    }

    public async init(appID: number, appSign: string): Promise<boolean> {
        if (this.alreadyInit) {
            // todo 是不是要报个错
            // errorEvents.onError(ErrorEventsListener.INIT_ALREADY,
            //     "ZEGO Express Engine is already initialized, do not initialize again");
            return true
        }
        const result = await ZegoUIKit.init(appID, appSign, ZegoUIKitScenario.StandardVideoCall);

        if (result) {
            zloginfo(`Call init() called with:  appID = [${appID}], appSign.isEmpty() = [${!appSign}]`);

            this.alreadyInit = true;
            this.appInfo = { appID, appSign };
            // SessionStorage.set(StoreKeys.APP_INFO, { appID, appSign });

            ZegoUIKit.addEventHandler(this.expressEventHandler, false);

            const startTime = Date.now()
            let msg = ''

            try {
                UIKitReport.updateCommonParams({
                    call_version: this.getVersion()
                })
                // 初始化信令插件
                await ZegoUIKitSignaling.getInstance().init(appID, appSign)

                ZegoUIKitSignaling.getInstance().addZIMEventHandler(this.listenerID, this.zimEventHandler as ZIMEventHandler)
            } catch(e: any) {
                zlogerror(TAG, "init failed e:", e, typeof e)
                msg = e.message ?? e
            }

            UIKitReport.reportEvent('call/init', {
                error: msg ? -1 : 0,
                msg,
                start_time: startTime,
            })

        } else {
            // const errorEvents = ZegoUIKitPrebuiltCallService.events.getErrorEventsListener();
            // if (errorEvents) {
            //     errorEvents.onError(ErrorEventsListenerCodes.INIT_PARAM_ERROR,
            //         "Create engine error, please check if your AppID and AppSign is correct");
            // }
            zlogerror(TAG, "init failed")
        }
        return result;
    }


    private initZPNsEvent() {
        ZPNs.getInstance().on('registered', (message: ZPNsRegisterMessage) => {
            zlogwarning(TAG, "registered pushID:", message.pushID, message.errorCode, message.msg)
        })
        ZPNs.getInstance().on('throughMessageReceived', function(message) {
            zlogwarning(TAG, "throughMessageReceived", message.extras.payload)
        });
        ZPNs.getInstance().on('notificationClicked', function(message) {
            zlogwarning(TAG, "notificationClicked", message.extras.payload)
        });
        ZPNs.getInstance().on('notificationArrived', function(message) {
            zlogwarning(TAG, "notificationArrived", message.extras.payload)
        });
    }

    private offZPNsEvent() {
        ZPNs.getInstance().off('registered')
        ZPNs.getInstance().off('throughMessageReceived')
        ZPNs.getInstance().off('notificationClicked')
        ZPNs.getInstance().off('notificationArrived')
    }

    public async enableOfflinePush(enable: boolean) {
        // 申请通知权限
        Permissions.setPushPermissions()
        if (enable) {
            zlogwarning(TAG, "enableOfflinePush", enable)
            const { offlinePushConfigWhenRegister, offlinePushConfig } = CallInvitationServiceImpl.getInstance().getCallInvitationConfig() || {}
            this.initZPNsEvent()
            ZPNs.setPushConfig({enableFCMPush: false, ...offlinePushConfig});
            ZPNs.getInstance().registerPush(offlinePushConfigWhenRegister);
        } else {
            this.offZPNsEvent()
            ZPNs.getInstance().unregisterPush();
        }
    }

    public setCallInvitationConfig(invitationConfig: ZegoUIKitPrebuiltCallInvitationConfig) {
        const { callConfig: _callConfig } = this.invitationConfig
        const callConfig = {
            ..._callConfig as ZegoUIKitPrebuiltCallConfig,
            ...invitationConfig?.callConfig,
        }
        this.invitationConfig = {
            ...this.invitationConfig,
            ...invitationConfig,
            callConfig
        }

        ZegoUIKitSignaling.getInstance().setCallingConfig(this.invitationConfig)
        zloginfo(TAG, `setCallInvitationConfig ${JSON.stringify(this.invitationConfig)}`)
        // SessionStorage.set(StoreKeys.CALL_INVITATION_CONFIG, invitationConfig)
    }

    public getAppInfo() {
        return this.appInfo
    }

    public getLocalUser() {
        return this.localUser
    }

    public getCallInvitationConfig(): ZegoUIKitPrebuiltCallInvitationConfig | null {
        return this.invitationConfig // || SessionStorage.get(StoreKeys.CALL_INVITATION_CONFIG);
    }


    public getCallConfig(): ZegoUIKitPrebuiltCallConfig | null {
        return this.getCallInvitationConfig()?.callConfig || null;
    }


    /**
     * 登录用户到系统。
     * 
     * @param userID 用户ID字符串。
     * @param userName 用户名字符串。
     * 
     * 如果用户尚未登录（`alreadyLogin`为`false`），则尝试使用提供的用户ID和用户名登录。
     * 成功登录后，会尝试启用和注册推送通知服务。登录失败则重置登录状态。
     */
    public loginUser(userID: string, userName: string): void {
        zloginfo(TAG, `loginUser(): userID = [${userID}]，userName = [${userName}]， alreadyLogin: ${this.alreadyLogin}`);
        if (this.alreadyLogin) {
            return;
        }
        this.alreadyLogin = true;

        // 使用ZegoUIKit登录
        ZegoUIKit.login(userID, userName);
        this.localUser = new ZegoUIKitUser(userID, userName);
        // SessionStorage.set(StoreKeys.USER_INFO, { userID, userName })

        ZegoUIKitSignaling.getInstance().addInvitationListener(this.listenerID, this.invitationListener)

        // 登录到ZegoUIKit的信号插件部分，并提供回调处理登录结果
        ZegoUIKitSignaling.getInstance().login(userID, userName, (code) => {
            if (code === 0) {
                // 登录成功，检查并启用其他推送服务（例如FCM）
                // if (!this.isOtherPushEnable()) {
                //     this.enableFCMPush();
                // }
                // this.registerPush();
            } else {
                // 登录失败，重置登录状态
                this.alreadyLogin = false;
            }
        })
    }


    public logoutUser() {
        zlogwarning(TAG, 'logoutUser')
        this.alreadyLogin = false;
        ZegoUIKit.logout();
        ZegoUIKitSignaling.getInstance().logout()
        // SessionStorage.set(StoreKeys.USER_LOGIN_STATE, false)
        ZegoUIKitSignaling.getInstance().removeInvitationListener(this.listenerID)
    }


    /**
     * 反初始化方法，用于清理通话相关的资源与状态。
     * 包括离开房间、结束通话、移除事件处理器、注销登录等操作。
     */
    public async unInit() {
        zloginfo(TAG, "call unInit()");
        // await this.leaveRoom();

        // 移除expressEventHandler的事件处理
        ZegoUIKit.removeEventHandler(this.expressEventHandler);

        ZegoUIKit.unInit()

        // 注销ZIM事件处理器
        ZegoUIKitSignaling.getInstance().removeZIMEventHandler(this.listenerID);

        // 初始化信令插件
        // 信令作为单例, 不要销毁
        ZegoUIKitSignaling.getInstance().unInit()
        // 这个单例也销毁掉
        ZegoUIKitSignaling.destroy()

        // RTC 的实例也要销毁
        ZegoUIKit.destroy()

        UIKitReport.reportEvent('call/unInit', {})
    }


    /** 检查是否已在房间内 */
    public isInRoom(): boolean {
        return this.inRoom;
    }

    /**
     * 加入房间。
     * 
     * @param roomID 房间ID字符串。
     * @param callback 加入房间操作的回调函数。
     */
    public joinRoom(roomID: string, callback: ZegoUIKitCallback): void {
        ZegoUIKit.joinRoom(roomID, false, (errorCode: number) => {
            // 根据错误码判断是否成功加入房间
            this.inRoom = errorCode === 0;

            if (this.inRoom) {
                // 若成功加入房间，开始计时并清理推送消息
                // this.startTimeCount();
                // this.clearPushMessage();
            }

            // 如果外部传入了回调函数，则调用该回调函数并传递错误码
            if (callback) {
                callback(errorCode);
            }
        });
    }
    /**
     * 离开房间。
     */
    public async leaveRoom() {
        zloginfo("leaveRoom() 被调用，已初始化状态：", this.alreadyInit, "，通话状态："); // 类似于Timber的日志输出
        // if (this.alreadyInit) {
        //     if (this.callState === CallState.Outgoing) {
        //         if (this.callInvitationData !== null) {
        //             const waitedUserIDs: string[] = []; // 初始化等待用户的ID列表
        //             for (const invitee of this.callInvitationData.invitees) {
        //                 if (this.callUserStates.get(invitee) === CallInvitationState.Waiting) {
        //                     waitedUserIDs.push(invitee.userID);
        //                 }
        //             }
        //             // !important
        //             // if (waitedUserIDs.length > 0) {
        //             //     CallInvitationServiceImpl.getInstance().cancelInvitation(waitedUserIDs, null);
        //             // }
        //         }
        //     }
        // }

        // if (this.getCallState() > 0) {
        //     this.setCallState(CallState.None);
        // }
        // this.clearInvitationData();
        // this.stopRoomTimeCount();
        // this.updateListener = null;
        this.inRoom = false;
        // this.clearPushMessage();
        await ZegoUIKit.leaveRoom();
    }

    private getUIKitUser(invitees: ZegoUser[]) {
        return invitees.map(({ userID, userName }) => new ZegoUIKitUser(userID, userName));
    }

    public sendInvitation(config: CallInviteConfig) {
        const { callID, invitees, timeout, type, customData = '', notificationConfig } = config
        const _invitees = this.getUIKitUser(invitees)
        return ZegoUIKitSignaling.getInstance().sendInvitation(_invitees, type, customData, timeout, callID, notificationConfig)
    }

    public addInvitation(invitees: ZegoUser[]) {
        const _invitees = this.getUIKitUser(invitees)
        return ZegoUIKitSignaling.getInstance().addInvitation(_invitees)
    }

    public cancelInvitation(config: CancelInviteConfig) {
        const { invitationID, invitees, notificationConfig } = config
        return ZegoUIKitSignaling.getInstance().cancelInvitation(invitationID, invitees, notificationConfig)
    }

    // 被叫方对邀请做出回应数据上报
    public incomingCallResponseReport(callID: string, action: CallRespondAction) {
        const { state } = getAppState()
        UIKitReport.reportEvent('call/callee/respondInvitation', {
            call_id: callID,
            action,
            app_state: state,
        })
    }

    // 发起方对邀请回应数据上报
    public outgoingCallResponseReport(callID: string, action: CallRespondAction, invitees: ZegoUser[]) {
        const { state } = getAppState()
        const invitee = invitees.map(({ userID }) => userID)
        UIKitReport.reportEvent('call/caller/respondInvitation', {
            call_id: callID,
            action,
            app_state: state,
            invitee,
        })
    }
}
