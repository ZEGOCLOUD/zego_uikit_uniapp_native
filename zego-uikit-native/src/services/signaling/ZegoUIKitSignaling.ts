import { ZIMCallInvitationMode, ZIMError, ZIMEventHandler } from "../../plugins/signaling/ZIMUniApp";
import { ZegoPluginAdapter, ZegoSignalingConnectionState, ZegoSignalingInRoomCommandMessage, ZegoSignalingInRoomTextMessage, ZegoSignalingNotificationConfig, ZegoSignalingPluginEventHandler } from "../../plugins";
import { ZegoUIKitUser, ZegoUserInRoomAttributesInfo } from "../../services/defines";
import { deepClone, deleteSingletonInstance, getAppState, getSingletonInstance, makeCallID, makeListenerID, makeTag, SingletonScope, UIKitReport, zlogerror, zloginfo, zlogwarning } from "../../utils";
import UIKitCore from "../internal/UIKitCore";
import { UIKitSignalingService } from "./UIKitSignalingService";
import {
    CallingConfig,
    CallInvitationRejectReason,
    ZegoInvitationType, ZegoUIKitInvitationData, ZegoUIKitInvitationState, ZegoUIKitInvitationUser,
    ZegoUIKitSignalingCallback, ZegoUIKitSignalingConnectionStateChangeListener,
    ZegoUIKitSignalingInRoomCommandMessageListener, ZegoUIKitSignalingInRoomTextMessageListener,
    ZegoUIKitSignalingInvitationListener,
    ZegoUIKitSignalingRoomPropertyUpdateListener, ZegoUIKitSignalingUsersInRoomAttributesUpdateListener
} from "./defines";
import { InvitationEnvelope, InvitationMessage } from "./protocols";
import TextUtils from "../../utils/TextUtils";
import { isBoolean } from "../../utils/types";

const TAG = makeTag('ZegoUIKitSignaling')

// 这是对于 Signaling 插件的业务封装类
export class ZegoUIKitSignaling implements ZegoSignalingPluginEventHandler {

    private static name: string = '_ZegoUIKitSignaling'

    private signalingPlugin = ZegoPluginAdapter.signalingPlugin();
    private signalingService = new UIKitSignalingService();
    private usersInRoomAttributes: ZegoUserInRoomAttributesInfo[] = [];
    private oldUsersInRoomAttributes: ZegoUserInRoomAttributesInfo[] = [];
    private roomAttributes: Record<string, string> = {};
    private currentSignalUser?: ZegoUIKitUser | null;
    private isInLoginProcess: boolean = false;
    private currentRoomID?: string;
    private currentInvitationID: string = '';
    private signalConnectionState: ZegoSignalingConnectionState = ZegoSignalingConnectionState.Disconnected;
    private listenerID = '';

    private invitationMap: Record<string, ZegoUIKitInvitationData> = {};
    private callingConfig: CallingConfig = {
        canInvitingInCalling: false,
        onlyInitiatorCanInvite: false,
        endCallWhenInitiatorLeave: false,
    }

    public static getInstance(): ZegoUIKitSignaling {
        // ZIM 要做成全局的
        return getSingletonInstance(ZegoUIKitSignaling, SingletonScope.Global)
    }

    public static destroy() {
        deleteSingletonInstance(ZegoUIKitSignaling, SingletonScope.Global)
    }


    private getInvitee(invitationID: string, userID: string): ZegoUIKitInvitationUser | null {
        const invitationData = this.getInvitationByID(invitationID);
        // zloginfo(TAG, 'getInvitee', invitationData)
        if (!invitationData) {
            return null;
        }
        const invitees = invitationData.invitees.reverse()
        for (const invitee of invitees) {
            // zlogerror(TAG, 'getInvitee', invitee.user.userID, userID)
            if (invitee.user.userID === userID) {
                return invitee;
            }
        }
        return null;
    }

    private addInvitationData(invitationData: ZegoUIKitInvitationData) {
        this.invitationMap[invitationData.invitationID] = invitationData;
    }

    private getInvitationByID(invitationID: string): ZegoUIKitInvitationData | null {
        return this.invitationMap[invitationID];
    }

    private getInvitationByInvitee(inviteeID: string) {
        for (const invitationData of Object.values(this.invitationMap)) {
            const invitation = invitationData.invitees.find((invitee) => invitee.user.userID === inviteeID)
            if (invitation) {
                return invitation
            }
        }
    }

    private getInvitationByInviter(inviterID: string) {
        for (const invitationData of Object.values(this.invitationMap)) {
            if (invitationData.inviter.userID === inviterID) {
                return invitationData;
            }
        }
    }

    private removeInvitationData(invitationID: string): ZegoUIKitInvitationData | null {
        if (this.invitationMap[invitationID]) {
            const data = this.invitationMap[invitationID]
            delete this.invitationMap[invitationID]
            return data
        }
        return null;
    }

    private removeIfAllChecked(invitationID: string) {
        const invitationData = this.getInvitationByID(invitationID);
        if (!invitationData) {
            return;
        }
        const allChecked = invitationData.invitees.every(invitee => ![ZegoUIKitInvitationState.Waiting, ZegoUIKitInvitationState.Accept].includes(invitee.state));
        if (allChecked) {
            zlogwarning(TAG, 'removeIfAllChecked', invitationID)
            this.removeInvitationData(invitationID);
            this.currentInvitationID === invitationID && (this.currentInvitationID = '');
        }
        return invitationData
    }

    private getAllWaitingInviteesByID(invitationID: string): ZegoUIKitInvitationUser[] {
        const invitationData = this.getInvitationByID(invitationID);
        if (!invitationData) {
            return [];
        }
        return invitationData.invitees.filter(invitee => invitee.state === ZegoUIKitInvitationState.Waiting);
    }

    public login(userID: string, userName: string, callback?: ZegoUIKitSignalingCallback) {
        zloginfo(TAG, 'login', userID, userName)


        if (this.currentSignalUser && this.currentSignalUser.userID !== userID) {
            this.signalingPlugin.disconnectUser();
        }
        this.currentSignalUser = new ZegoUIKitUser(userID, userName);
        if (!this.isInLoginProcess) {
            this.isInLoginProcess = true;
            this.signalingPlugin.connectUser(userID, userName).then(() => {
                zloginfo(TAG, `login:${userID} success`)
                this.isInLoginProcess = false;
                if (callback) {
                    callback(0, '');
                }
                UIKitReport.reportEvent('zim/login', {
                    user_id: userID,
                    user_name: userName,
                    error: 0,
                    msg: '',
                 })
            }).catch((error: ZIMError) => {
                zlogerror(TAG, `login failed: ${error.code} ${error.message}`)
                this.isInLoginProcess = false;
                this.currentSignalUser = null;
                const code = error.code ?? -1
                const msg = error.message ?? ''
                if (callback) {
                    callback(code, msg);
                }
                UIKitReport.reportEvent('zim/login', {
                    user_id: userID,
                    user_name: userName,
                    error: code,
                    msg: msg,
                 })
            })
        }
    }

    public joinRoom(roomID: string, callback?: ZegoUIKitSignalingCallback) {


        this.signalingPlugin.joinRoom(roomID, '').then(() => {
            this.currentRoomID = roomID;
            if (callback) {
                callback(0, '');
            }
            UIKitReport.reportEvent('zim/joinRoom', {
                room_id: roomID,
                room_name: '',
                error: 0,
                msg: '',
            })
        }).catch((error: ZIMError) => {
            const code = error.code ?? -1
            const msg = error.message ?? ''
            if (callback) {
                callback(code, msg);
            }
            UIKitReport.reportEvent('zim/joinRoom', {
                room_id: roomID,
                room_name: '',
                error: code,
                msg: msg,
            })
        })
    }

    public leaveRoom(callback?: ZegoUIKitSignalingCallback) {

        const roomID = this.currentRoomID
        if (roomID) {
            this.signalingPlugin.leaveRoom(roomID).then(() => {
                if (callback) {
                    callback(0, '');
                }
                UIKitReport.reportEvent('zim/leaveRoom', {
                    room_id: roomID,
                    error: 0,
                    msg: '',
                })
            }).catch((error: ZIMError) => {
                const code = error.code ?? -1;
                const msg = error.message ?? '';
                if (callback) {
                    callback(code, msg);
                }
                UIKitReport.reportEvent('zim/leaveRoom', {
                    room_id: roomID,
                    error: code,
                    msg: msg,
                })
            })
            this.removeRoomListenersAndData();
            
        }
    }

    public unInit() {

        this.signalingPlugin.destroy();
    }


    private removeRoomListenersAndData() {
        this.signalingService.removeRoomListeners();
        this.roomAttributes = {};
        this.usersInRoomAttributes = [];
    }

    public setUsersInRoomAttributes(key: string, value: string, userIDs: string[], callback?: ZegoUIKitSignalingCallback) {


        const attributes: Record<string, string> = { [key]: value };
        this.signalingPlugin.setUsersInRoomAttributes(attributes, userIDs, this.currentRoomID!).then(({ attributesMap }) => {
            this.oldUsersInRoomAttributes = [...this.usersInRoomAttributes];
            this.usersInRoomAttributes = this.usersInRoomAttributes.map(user => {
                const updatedAttributes = attributesMap[user.userID];
                if (updatedAttributes) {
                    return { ...user, attributes: { ...user.attributes, ...updatedAttributes } };
                }
                return user;
            });

            UIKitCore.getInstance().dispatchRoomUserCountOrPropertyChanged(UIKitCore.getInstance().getAllUsers());
            if (callback) {
                callback(0, '');
            }
        }).catch((error: ZIMError) => {
            if (callback) {
                callback(error.code, error.message);
            }
        })
    }

    // private removeUsersInRoomAttributesForKey(info: ZegoUserInRoomAttributesInfo, key: string) {
    //     for (let i = 0; i < this.usersInRoomAttributes.length; i++) {
    //         const userInRoomAttributesInfo = this.usersInRoomAttributes[i];
    //         if (info.userID === userInRoomAttributesInfo.userID) {
    //             delete userInRoomAttributesInfo.attributes[key]
    //             break;
    //         }
    //     }
    // }

    // private updateUsersInRoomAttributesForKey(info: ZegoUserInRoomAttributesInfo, key: string, value: string) {
    //     let needAddData = true;
    //     for (let i = 0; i < this.usersInRoomAttributes.length; i++) {
    //         const userInRoomAttributesInfo = this.usersInRoomAttributes[i];
    //         if (info.userID === userInRoomAttributesInfo.userID) {
    //             needAddData = false;
    //             userInRoomAttributesInfo.attributes[key] = value
    //         }
    //     }

    //     if (needAddData) {
    //         this.usersInRoomAttributes.push(info);
    //     }
    // }

    // private insertOrUpdateUsersInRoomAttributes(infos: ZegoUserInRoomAttributesInfo[]) {
    //     if (!infos || infos.length === 0) {
    //         return;
    //     }

    //     if (!this.usersInRoomAttributes || this.usersInRoomAttributes.length === 0) {
    //         this.usersInRoomAttributes.push(...infos);
    //         return;
    //     }

    //     for (const newUserInRoomAttributesInfo of infos) {
    //         let needAddData = true;
    //         for (let i = 0; i < this.usersInRoomAttributes.length; i++) {
    //             const oldUserInRoomAttributesInfo = this.usersInRoomAttributes[i];
    //             if (newUserInRoomAttributesInfo.userID === oldUserInRoomAttributesInfo.userID) {
    //                 this.usersInRoomAttributes[i] = newUserInRoomAttributesInfo;
    //                 needAddData = false;
    //             }
    //         }

    //         if (needAddData) {
    //             this.usersInRoomAttributes.push(newUserInRoomAttributesInfo);
    //         }
    //     }
    // }

    public async queryUsersInRoomAttributes(count: number, nextFlag: string)
        : Promise<{ infos: ZegoUserInRoomAttributesInfo[], nextFlag: string }> {


        return this.signalingPlugin.queryUsersInRoomAttributes(this.currentRoomID!, count, nextFlag).then(({ attributesMap, nextFlag }) => {

            // attributesMap 的 key 是 userID, value是attributes, 转成 ZegoUserInRoomAttributesInfo 数组
            const infos: ZegoUserInRoomAttributesInfo[] = Object.entries(attributesMap).map(([userID, attributes]) => {
                return { userID, attributes };
            });
            this.updateCoreUserAndNotifyChanges(infos);
            this.onUsersInRoomAttributesUpdated(attributesMap, "", this.currentRoomID!);
            return Promise.resolve({ infos, nextFlag });
        }).catch((error: ZIMError) => {
            return Promise.reject({ code: error.code, message: error.message })
        })
    }

    public async updateRoomProperty(attributes: Record<string, string>, isDeleteAfterOwnerLeft: boolean, isForce: boolean, isUpdateOwner: boolean):
        Promise<{ errorKeys: string[] }> {


        return this.signalingPlugin.updateRoomProperty(attributes, this.currentRoomID!, isForce, isDeleteAfterOwnerLeft, isUpdateOwner)
            .then(({ errorKeys }) => {
                return Promise.resolve({ errorKeys });
            }).catch((error: ZIMError) => {
                return Promise.reject({ code: error.code, message: error.message })
            })

    }

    public async deleteRoomProperties(keys: string[], isForce: boolean)
        : Promise<{ errorKeys: string[] }> {


        return this.signalingPlugin.deleteRoomProperties(keys, this.currentRoomID!, isForce)
            .then(({ errorKeys }) => {
                return Promise.resolve({ errorKeys });
            }).catch((error: ZIMError) => {
                return Promise.reject({ code: error.code, message: error.message })
            })
    }

    public beginRoomPropertiesBatchOperation(isDeleteAfterOwnerLeft: boolean, isForce: boolean, isUpdateOwner: boolean) {


        this.signalingPlugin.beginRoomPropertiesBatchOperation(this.currentRoomID!, isDeleteAfterOwnerLeft, isForce, isUpdateOwner);
    }

    public async endRoomPropertiesBatchOperation() {


        return this.signalingPlugin.endRoomPropertiesBatchOperation(this.currentRoomID!)
            .then(() => {
                return Promise.resolve();
            }).catch((error: ZIMError) => {
                return Promise.reject({ code: error.code, message: error.message })

            })
    }

    public async queryRoomProperties()
        : Promise<{ roomAttributes: Record<string, string> }> {


        return this.signalingPlugin.queryRoomProperties(this.currentRoomID!)
            .then(({ roomAttributes }) => {
                this.roomAttributes = { ...roomAttributes };
                return Promise.resolve({ roomAttributes });
            }).catch((error: ZIMError) => {
                return Promise.reject({ code: error.code, message: error.message })

            });
    }

    public getRoomProperties(): Record<string, string> {
        return this.roomAttributes;
    }

    public updateCoreUserAndNotifyChanges(infos: ZegoUserInRoomAttributesInfo[]) {
        if (!infos || infos.length === 0) {
            return;
        }

        let shouldNotifyChange = false;

        for (const info of infos) {
            const uiKitUser = UIKitCore.getInstance().getUserByUserID(info.userID);
            if (uiKitUser !== null) {
                const attributes = info.attributes;
                const userAttributes = uiKitUser.attributes;

                if (!userAttributes) {
                    shouldNotifyChange = true;
                    uiKitUser.attributes = attributes
                } else {
                    for (const [newKey, newValue] of Object.entries(attributes)) {
                        let isUpdate = false;
                        for (const [oldKey, oldValue] of Object.entries(userAttributes)) {
                            if (oldKey === newKey) {
                                isUpdate = true;
                                shouldNotifyChange = true;
                                uiKitUser.attributes![oldKey] = newValue;
                            }
                        }
                        if (!isUpdate) {
                            shouldNotifyChange = true;
                            uiKitUser.attributes![newKey] = newValue;
                        }
                    }
                }
            }
        }

        if (shouldNotifyChange) {
            UIKitCore.getInstance().dispatchRoomUserCountOrPropertyChanged(UIKitCore.getInstance().getAllUsers());
        }
    }

    private getIndexFromUsersInRoomAttributes(userID: string): number {
        let index = -1;
        for (let i = 0; i < this.usersInRoomAttributes.length; i++) {
            const info = this.usersInRoomAttributes[i];
            if (userID === info.userID) {
                index = i;
            }
        }
        return index;
    }
    public addRoomPropertyUpdateListener(listenerID: string, listener: ZegoUIKitSignalingRoomPropertyUpdateListener) {
        this.signalingService.addRoomPropertyUpdateListener(listenerID, listener);
    }

    public removeRoomPropertyUpdateListener(listenerID: string,) {
        this.signalingService.removeRoomPropertyUpdateListener(listenerID);
    }

    public addUsersInRoomAttributesUpdateListener(listenerID: string, listener: ZegoUIKitSignalingUsersInRoomAttributesUpdateListener) {
        this.signalingService.addUsersInRoomAttributesUpdateListener(listenerID, listener);
    }

    public removeUsersInRoomAttributesUpdateListener(listenerID: string,) {
        this.signalingService.removeUsersInRoomAttributesUpdateListener(listenerID);
    }

    public addInRoomTextMessageListener(listenerID: string, listener: ZegoUIKitSignalingInRoomTextMessageListener) {
        this.signalingService.addInRoomTextMessageListener(listenerID, listener);
    }

    public removeInRoomTextMessageListener(listenerID: string,) {
        this.signalingService.removeInRoomTextMessageListener(listenerID);
    }

    public addInRoomCommandMessageListener(listenerID: string, listener: ZegoUIKitSignalingInRoomCommandMessageListener) {
        this.signalingService.addInRoomCommandMessageListener(listenerID, listener);
    }

    public removeInRoomCommandMessageListener(listenerID: string,) {
        this.signalingService.removeInRoomCommandMessageListener(listenerID);
    }

    public addInvitationListener(listenerID: string, listener: ZegoUIKitSignalingInvitationListener) {
        zloginfo(TAG, `addInvitationListener listenerID: ${listenerID}`)
        this.signalingService.addInvitationListener(listenerID, listener);
    }

    public removeInvitationListener(listenerID: string) {
        zloginfo(TAG, `removeInvitationListener listenerID: ${listenerID}`)
        this.signalingService.removeInvitationListener(listenerID);
    }

    public async init(appID: number, appSign: string) {

        await this.signalingPlugin.init(appID, appSign);
        const version = await this.signalingPlugin.getVersion();
        UIKitReport.reportEvent('zim/init', {
            zim_version: version,
        })
        this.listenerID = makeListenerID();
        this.signalingPlugin.addPluginEventHandler(this.listenerID, this);
    }

    public sendInRoomCommandMessage(command: string, roomID: string, callback?: ZegoUIKitSignalingCallback) {


        this.signalingPlugin.sendInRoomCommandMessage(command, roomID).then(() => {
            if (callback) {
                callback(0, '');
            }
        }).catch((error: ZIMError) => {
            if (callback) {
                callback(error.code, error.message);
            }
        })
    }

    private separateUsers(invitees: ZegoUIKitUser[], errorUserList: { userID: string }[]): { errorUsers: ZegoUIKitUser[], successUsers: ZegoUIKitUser[] } {
        const errorUsers: ZegoUIKitUser[] = [];
        const successUsers: ZegoUIKitUser[] = [];

        invitees.forEach((invitee) => {
            if (errorUserList.length && errorUserList.some(errorUser => errorUser.userID === invitee.userID)) {
                errorUsers.push(invitee);
            } else {
                successUsers.push(invitee);
            }
        });

        return { errorUsers, successUsers };
    }

    /**
     * 
     * @param callID 这是由发起方来定的RTC的roomID
     * @param invitees 
     * @param timeout 
     * @param type 
     * @param customData 
     * @param notificationConfig 
     * @param callback 
     * @returns 
     */
    public async sendInvitation(invitees: ZegoUIKitUser[], type: ZegoInvitationType, customData: string, timeout: number = 60,
        callID?: string, notificationConfig?: ZegoSignalingNotificationConfig): Promise<{ invitationID: string, callID: string, successUsers: ZegoUIKitUser[], errorUsers: ZegoUIKitUser[] }> {


        if (!this.currentSignalUser) {
            return Promise.reject({ code: -1, message: 'USER_IS_NOT_LOGGED' })
        }
        const inviter = this.currentSignalUser
        const inviteeIDs = invitees.map((user) => user.userID);
        let expressRoomID = makeCallID(inviter.userID);
        if (callID && TextUtils.isEmpty(callID)) {
            expressRoomID = callID.trim()
        }

        // 这是这是邀请协议体
        const data: InvitationMessage = {
            call_id: expressRoomID,
            invitees: invitees.map((user) => ({ user_id: user.userID, user_name: user.userName })),
            custom_data: customData,
            inviter: { id: inviter.userID, name: inviter.userName },
        };

        UIKitReport.reportEvent('call/invite', {
            call_id: callID || '',
            room_id: expressRoomID,
            is_video_call: type,
        });

        // 这是发送给邀请者的协议外层
        const extendedData: InvitationEnvelope = {
            type,
            inviter_id: inviter.userID,
            inviter_name: inviter.userName,
            data: JSON.stringify(data),
        };
        const _notificationConfig = deepClone(notificationConfig || '')
        if (_notificationConfig) {
            const content = type === ZegoInvitationType.VideoCall
                ? '视频来电...'
                : '音频来电...'
            _notificationConfig.title = _notificationConfig.title || inviter.userName
            _notificationConfig.message = _notificationConfig.message || content
        }

        if (this.currentRoomID) {
            return this.addInvitation(invitees, _notificationConfig)
        }

        const mode = this.callingConfig.canInvitingInCalling
            ? ZIMCallInvitationMode.Advanced
            : ZIMCallInvitationMode.General
        const extendedDataStr = JSON.stringify(extendedData)
        return this.signalingPlugin.sendInvitation(inviteeIDs, timeout, extendedDataStr, _notificationConfig, mode)
            .then(({ callID: invitationID, errorUserList }) => {
                const invitationUsers: ZegoUIKitInvitationUser[] = invitees.map((user) => {
                    return {
                        user,
                        state: ZegoUIKitInvitationState.Waiting,
                    }
                });
                // 分离成功和失败的用户
                const { errorUsers, successUsers } = this.separateUsers(invitees, errorUserList);
                if (errorUsers.length < invitees.length) {
                    this.currentInvitationID = invitationID
                    const invitationData: ZegoUIKitInvitationData = {
                        invitationID,
                        inviter,
                        invitees: invitationUsers,
                        type,
                        roomID: expressRoomID,
                        customData,
                        pushConfig: _notificationConfig
                    };
                    // 保存起来, 取消的时候用
                    this.addInvitationData(invitationData);
                }
                UIKitReport.reportEvent('callInvite', {
                    invitees: inviteeIDs,
                    count: inviteeIDs.length,
                    error_userlist: errorUserList,
                    error_count: errorUserList.length,
                    call_id: callID,
                    error: 0,
                    msg: '',
                    extendedData: extendedDataStr,
                })
                return Promise.resolve({ invitationID, callID: expressRoomID, successUsers, errorUsers });
            }).catch((error: ZIMError) => {
                UIKitReport.reportEvent('callInvite', {
                    invitees: inviteeIDs,
                    count: inviteeIDs.length,
                    error: error.code,
                    msg: error.message
                })
                return Promise.reject({ code: error.code, message: error.message })
            });
    }

    public async addInvitation(invitees: ZegoUIKitUser[], notificationConfig?: ZegoSignalingNotificationConfig) {
        const inviteeIDs = invitees.map((user) => user.userID);
        const invitationData = this.getCurrentInvitationData()
        if (!invitationData) {
            zlogwarning(TAG, 'addInvitation: no invitationData', this.currentInvitationID)
            return Promise.reject({ code: -1, message: 'no invitationData' })
        }
        const { invitationID, extendedData, pushConfig } = invitationData

        return this.signalingPlugin.callingInvitation(inviteeIDs, invitationID, JSON.stringify(extendedData), notificationConfig || pushConfig)
            .then(({ errorUserList }) => {
                // 分离成功和失败的用户
                const { errorUsers, successUsers } = this.separateUsers(invitees, errorUserList);
                const invitationUsers: ZegoUIKitInvitationUser[] = successUsers.map((user) => {
                    return {
                        user,
                        state: ZegoUIKitInvitationState.Waiting,
                    }
                });

                invitationData.invitees.push(...invitationUsers)

                this.signalingService.notifyCallingInvitationSend(successUsers, invitationData)

                return Promise.resolve({ invitationID, callID: invitationID, successUsers, errorUsers });
            })
            .catch((error: ZIMError) => {
                zlogerror(TAG, 'addInvitation failed: ', error)
                return Promise.reject({ code: error.code, message: error.message })
            })
    }

    public async cancelInvitation(invitationID: string, inviteeIDs?: string[], notificationConfig?: ZegoSignalingNotificationConfig):
        Promise<{ invitationID: string, successUsers?: ZegoUIKitUser[], errorUsers?: ZegoUIKitUser[] }> {

        const invitationData = this.getInvitationByID(invitationID)
        if (!invitationData) {
            return Promise.resolve({ invitationID });
        }
        const extendedData: InvitationEnvelope = {
            inviter_id: invitationData.inviter.userID,
            inviter_name: invitationData.inviter.userName,
            type: invitationData.type,
            data: JSON.stringify({ custom_data: invitationData.customData }),
        };

        const _inviteeIDs = inviteeIDs?.length && inviteeIDs || this.getAllWaitingInviteesByID(invitationID).map((invitee) => invitee.user.userID);
        const _notificationConfig = deepClone(notificationConfig || invitationData.pushConfig || '')
        if (_notificationConfig) {
            _notificationConfig.title = _notificationConfig.title || invitationData.inviter.userName
            _notificationConfig.message = notificationConfig?.message || '已取消邀请'
        }
        if (!inviteeIDs?.length) {
            return Promise.resolve({ invitationID });
        }
        zloginfo(TAG, 'cancelInvitation for invitationID: ', invitationID, 'inviteeIDs: ', JSON.stringify(inviteeIDs), 'notificationConfig: ', JSON.stringify(_notificationConfig))
        return this.signalingPlugin.cancelInvitation(_inviteeIDs, invitationID, JSON.stringify(extendedData), _notificationConfig)
            .then(({ errorInvitees }) => {

                const errorUsers: ZegoUIKitUser[] = [];
                const successUsers: ZegoUIKitUser[] = [];
                invitationData.invitees
                    .filter(({ user }) => _inviteeIDs.includes(user.userID))
                    .forEach((invitee) => {
                    if (errorInvitees.length && errorInvitees.some(errorUser => errorUser === invitee.user.userID)) {
                        invitee.state = ZegoUIKitInvitationState.Error;
                        errorUsers.push(invitee.user);
                    } else {
                        invitee.state = ZegoUIKitInvitationState.Cancel;
                        successUsers.push(invitee.user);
                    }
                });
                this.signalingService.notifyCancelInvitaion(successUsers, invitationData)
                this.removeIfAllChecked(invitationID);
                return Promise.resolve({ invitationID, successUsers, errorUsers })
            }).catch((error: ZIMError) => {
                zlogerror(TAG, 'cancelInvitation error: ', JSON.stringify(error))
                return Promise.reject({ code: error.code, message: error.message })
            });

    }


    public async refuseInvitation(inviterID: string, customData: string, reason: CallInvitationRejectReason) {

        const invitationData = this.getInvitationByID(inviterID)
        zloginfo(TAG, 'refuseInvitation', JSON.stringify(invitationData))
        if (!invitationData) {
            return Promise.resolve();
        }
        const invitationID = invitationData.invitationID
        const extendedData: InvitationEnvelope = {
            inviter_id: inviterID,
            inviter_name: invitationData.inviter.userName,
            type: invitationData.type,
            data: JSON.stringify({ custom_data: customData }),
            reason,
        };

        return this.signalingPlugin.refuseInvitation(invitationID, JSON.stringify(extendedData),)
            .then(() => {
                invitationData.invitees.forEach((invitationUser: ZegoUIKitInvitationUser) => {
                    if (invitationUser.user.userID === this.currentSignalUser!.userID) {
                        invitationUser.state = ZegoUIKitInvitationState.Refuse;
                    }
                });
                this.removeIfAllChecked(invitationID);
                return Promise.resolve();
            }).catch((error: ZIMError) => {
                return Promise.reject({ code: error.code, message: error.message })
            });
    }

    public async acceptInvitation(invitationID: string, customData: string) {
        zloginfo(TAG, 'acceptInvitation', invitationID, customData);
        let invitationData = this.getInvitationByID(invitationID)
        if (!invitationData) {
            return Promise.resolve();
        }
        // const invitationID = invitationData.invitationID
        const extendedData: InvitationEnvelope = {
            inviter_id: invitationData.inviter.userID,
            inviter_name: invitationData.inviter.userName,
            type: invitationData.type,
            data: JSON.stringify({ custom_data: customData }),
        };

        return this.signalingPlugin.acceptInvitation(invitationID, JSON.stringify(extendedData))
            .then(() => {
                zloginfo(TAG, 'accept success');
                invitationData.invitees.forEach((invitationUser: ZegoUIKitInvitationUser) => {
                    if (invitationUser.user.userID === this.currentSignalUser?.userID) {
                        invitationUser.state = ZegoUIKitInvitationState.Accept;
                    }
                });
                return Promise.resolve();
            }).catch((error: ZIMError) => {
                zlogerror(TAG, 'accept err');
                return Promise.reject({ code: error.code, message: error.message })
            });
    }

    public callQuit() {
        const invitationData= this.getCurrentInvitationData()
        if (!invitationData) {
            zlogwarning(TAG, 'callQuit no invitation', this.currentInvitationID);
            return Promise.reject({ code: -1, message: 'no invitation' });
        }
        const { invitationID, extendedData } = invitationData
        return this.signalingPlugin.callQuit(invitationID, JSON.stringify(extendedData))
    }

    public callEnd() {
        const invitationData= this.getCurrentInvitationData()
        if (!invitationData) {
            zlogwarning(TAG, 'callEnd no invitation', this.currentInvitationID);
            return Promise.reject({ code: -1, message: 'no invitation' });
        }
        const { invitationID, extendedData } = invitationData
        return this.signalingPlugin.callEnd(invitationID, JSON.stringify(extendedData))
    }

    public logout() {
        zloginfo(TAG, 'logout');
        UIKitReport.reportEvent('zim/logout', {})
        this.signalingPlugin.disconnectUser();
        this.isInLoginProcess = false;

        this.removeRoomListenersAndData();
        this.signalingService.clear();
        this.invitationMap = {};
        this.currentInvitationID = '';
    }

    public connectUser() {

        const isDisconnected = this.signalConnectionState === ZegoSignalingConnectionState.Disconnected;
        if (this.currentSignalUser && isDisconnected && !this.isInLoginProcess) {
            this.signalingPlugin.connectUser(this.currentSignalUser.userID, this.currentSignalUser.userName ?? '');
        }
    }

    public isPluginExited(): boolean {

        return this.signalingPlugin !== null;
    }


    public onConnectionStateChanged(state: ZegoSignalingConnectionState) {
        zloginfo(TAG, 'onConnectionStateChanged: ', state)
        this.signalConnectionState = state;
        this.signalingService.notifyConnectionStateChange(state);
        UIKitReport.reportEvent('zim/connectionStateChanged', {
            state,
        })
    }

    public onCallInvitationReceived(invitationID: string, inviterID: string, extendedData: string) {
        zloginfo(TAG, 'onCallInvitationReceived: ', invitationID, inviterID, extendedData)
        if (!TextUtils.isEmpty(extendedData)) { // InvitationEnvelope
            const envelope: InvitationEnvelope = JSON.parse(extendedData)
            const message: InvitationMessage = JSON.parse(envelope.data || '{}')
            const userID = envelope.inviter_id || message.inviter?.id
            let inviter = UIKitCore.getInstance().getUser(userID);
            if (!inviter) {
                inviter = new ZegoUIKitUser(userID, envelope.inviter_name);
            }

            // this.setCallingConfig(envelope)
            const invitee: ZegoUIKitInvitationUser = {
                user: this.currentSignalUser!,
                state: ZegoUIKitInvitationState.Waiting,
            }
            // 被邀请者就是自己, 不管其他人
            const invitationData: ZegoUIKitInvitationData = {
                invitationID,
                inviter,
                invitees: [invitee],
                type: envelope.type,
                roomID: message.call_id,
                customData: message.custom_data,
                extendedData: message,
            }
            this.addInvitationData(invitationData);
            UIKitReport.reportEvent('invitationReceived', {
                call_id: invitationID,
                inviter: inviterID,
                extended_data: extendedData,
            })

            if (this.currentInvitationID) {
                zlogwarning(TAG, 'onCallInvitationReceived refuseInvitation invitationID: ', invitationID)
                if (this.currentInvitationID === invitationID) return
                // 如果已被邀请，就拒绝其他的
                this.refuseInvitation(invitationID, message.custom_data, CallInvitationRejectReason.Busy)
                const { state } = getAppState()
                UIKitReport.reportEvent('call/respondInvitation', {
                    call_id: invitationID,
                    action: CallInvitationRejectReason.Busy,
                    app_state: state,
                })
                return
            }
            this.currentInvitationID = invitationID;

            this.signalingService.notifyCallInvitationReceived(inviter, envelope.type, invitationData);
        } else {
            zlogwarning(TAG, `onCallInvitationReceived, extendedData is empty: ${extendedData}`)
        }
    }

    public onCallInvitationCancelled(invitationID: string, inviterID: string, extendedData: string) {
        const invitationData = this.getInvitationByID(invitationID);
        zloginfo(TAG, `onCallInvitationCancelled invitationID: ${invitationID}, invitationData: ${JSON.stringify(invitationData)}`)
        if (invitationData) {
            let inviter = invitationData.inviter;
            const uiKitUser = UIKitCore.getInstance().getUser(inviterID);
            if (uiKitUser) {
                inviter = uiKitUser;
            }
            invitationData.invitees.forEach((invitationUser: ZegoUIKitInvitationUser) => {
                if (invitationUser.user.userID === this.currentSignalUser?.userID) {
                    invitationUser.state = ZegoUIKitInvitationState.Cancel;
                }
            });
            this.removeIfAllChecked(invitationID)
            !UIKitCore.getInstance().inRoom() &&
            this.signalingService.notifyCallInvitationCancelled(inviter, invitationData);
        } else {
            zlogwarning(TAG, 'onCallInvitationCancelled, invitationData is null')
        }
    }
    public onCallInvitationAccepted(invitationID: string, invitee: string, extendedData: string) {
        const invitationData = this.getInvitationByID(invitationID);
        zloginfo(TAG, `onCallInvitationAccepted invitationID: ${invitationID}, invitationData: ${JSON.stringify(invitationData)}`)
        if (invitationData) {
            const invitationUser = this.getInvitee(invitationID, invitee);
            if (invitationUser) {
                if (invitationUser.state !== ZegoUIKitInvitationState.Waiting) return
                invitationUser.state = ZegoUIKitInvitationState.Accept;
                let inviteeUser = invitationUser.user;
                const uiKitUser = UIKitCore.getInstance().getUser(invitee);
                if (uiKitUser) {
                    inviteeUser = uiKitUser;
                }

                this.signalingService.notifyCallInvitationAccepted(inviteeUser, invitationData);
            }
        } else {
            zlogwarning(TAG, 'onCallInvitationAccepted, invitationData is null')
        }
    }

    public onCallInvitationRejected(invitationID: string, invitee: string, extendedData: string) {
        const invitationData = this.getInvitationByID(invitationID);
        zloginfo(TAG, `onCallInvitationRejected invitationID: ${invitationID}, invitee: ${invitee}, invitationData: ${JSON.stringify(invitationData)}`)
        if (invitationData) {
            const invitationUser = this.getInvitee(invitationID, invitee);
            if (invitationUser) {
                const envelope: InvitationEnvelope = JSON.parse(extendedData || '{}');
                invitationData.extendedData = envelope;
                invitationUser.state = ZegoUIKitInvitationState.Refuse;
                this.removeIfAllChecked(invitationID);
                let inviteeUser = invitationUser.user;
                const uiKitUser = UIKitCore.getInstance().getUser(invitee);
                if (uiKitUser) {
                    inviteeUser = uiKitUser;
                }
                this.signalingService.notifyCallInvitationRejected(inviteeUser, invitationData);
            }
        } else {
            zlogwarning(TAG, 'onCallInvitationRejected, invitationData is null')
        }
    }

    public onCallInvitationTimeout(invitationID: string) {
        const invitationData = this.getInvitationByID(invitationID);
        zloginfo(TAG, `onCallInvitationTimeout invitationID: ${invitationID}, invitationData: ${JSON.stringify(invitationData)}`)
        if (invitationData) {
            let inviter = invitationData.inviter;
            const uiKitUser = UIKitCore.getInstance().getUser(inviter.userID);
            if (uiKitUser) {
                inviter = uiKitUser;
            }
            invitationData.invitees.forEach((invitationUser: ZegoUIKitInvitationUser) => {
                if (invitationUser.user.userID === this.currentSignalUser!.userID) {
                    invitationUser.state = ZegoUIKitInvitationState.Timeout;
                }
            });
            this.removeIfAllChecked(invitationID);
            this.signalingService.notifyCallInvitationTimeout(inviter, invitationData);
        } else {
            zlogwarning(TAG, 'onCallInvitationTimeout, invitationData is null')
        }
    }

    public onCallInviteesAnsweredTimeout(invitationID: string, invitees: string[]) {
        const invitationData = this.getInvitationByID(invitationID);
        zloginfo(TAG, `onCallInviteesAnsweredTimeout invitationID: ${invitationID}, invitationData: ${JSON.stringify(invitationData)}`)
        if (invitationData) {
            const timeoutInvitees: ZegoUIKitUser[] = []
            invitationData.invitees.forEach((invitationUser: ZegoUIKitInvitationUser) => {
                if (invitees.includes(invitationUser.user.userID)) {
                    invitationUser.state = ZegoUIKitInvitationState.Timeout;
                    let user = invitationUser.user
                    const uiKitUser = UIKitCore.getInstance().getUser(user.userID);
                    if (uiKitUser) {
                        user = uiKitUser
                    }
                    timeoutInvitees.push(user)
                }
            });
            this.removeIfAllChecked(invitationID);

            this.signalingService.notifyCallInviteesAnsweredTimeout(timeoutInvitees, invitationData);
        } else {
            zlogwarning(TAG, 'onCallInviteesAnsweredTimeout, invitationData is null')
        }

    }

    public onUsersInRoomAttributesUpdated(attributesMap: Record<string, Record<string, string>>, editor: string, roomID: string) {
        const oldAttributes: ZegoUserInRoomAttributesInfo[] = [];
        const userLocalID = UIKitCore.getInstance().getLocalUser()!.userID;
        if (userLocalID === editor) {
            oldAttributes.push(...this.oldUsersInRoomAttributes);
        } else {
            oldAttributes.push(...this.usersInRoomAttributes);
        }

        const updateKeys: string[] = [];
        const infos: ZegoUserInRoomAttributesInfo[] = [];
        for (const [userID, attributes] of Object.entries(attributesMap)) {
            infos.push({ userID, attributes });
        }
        for (const info of infos) {
            const index = this.getIndexFromUsersInRoomAttributes(info.userID);
            for (const [key, value] of Object.entries(info.attributes)) {
                if (!updateKeys.includes(key)) {
                    updateKeys.push(key);
                }
                if (index !== -1) {
                    this.usersInRoomAttributes[index].attributes[key] = value;
                }
            }
            if (index === -1) {
                this.usersInRoomAttributes.push(info);
            }
        }

        this.updateCoreUserAndNotifyChanges(infos);

        const uiKitUser = UIKitCore.getInstance().getUser(editor);
        this.signalingService.notifyUsersInRoomAttributesUpdated(updateKeys, oldAttributes, this.usersInRoomAttributes, uiKitUser!);
    }

    public onRoomPropertiesUpdated(setProperties: Record<string, string>[], deleteProperties: Record<string, string>[], roomID: string) {
        const updateKeys: string[] = [];
        // 把 this.roomAttributes 深拷贝一次
        const oldRoomAttributes = deepClone(this.roomAttributes);

        for (const setProperty of setProperties) {
            for (const [key, value] of Object.entries(setProperty)) {
                if (!updateKeys.includes(key)) {
                    updateKeys.push(key);
                }
                const oldValue = this.roomAttributes[key]
                this.roomAttributes[key] = value
                this.signalingService.notifyRoomPropertyUpdated(key, oldValue, value);
            }
        }
        for (const deleteProperty of deleteProperties) {
            for (const [key, value] of Object.entries(deleteProperty)) {
                if (!updateKeys.includes(key)) {
                    updateKeys.push(key);
                }
                const oldValue = this.roomAttributes[key]
                delete this.roomAttributes[key]
                this.signalingService.notifyRoomPropertyUpdated(key, oldValue, '');
            }
        }
        this.signalingService.notifyRoomPropertyFullUpdated(updateKeys, oldRoomAttributes, this.roomAttributes);
    }

    public onRoomMemberLeft(userIDList: string[], roomID: string) {
        const oldAttributes = [...this.usersInRoomAttributes];
        for (const userID of userIDList) {
            const index = this.getIndexFromUsersInRoomAttributes(userID);
            if (index !== -1) {
                this.usersInRoomAttributes.splice(index, 1);
            }
        }
        this.signalingService.notifyUsersInRoomAttributesUpdated([], oldAttributes, this.usersInRoomAttributes, null);
    }
    public onRoomMemberJoined(userIDList: string[], roomID: string) {
        // Implementation for onRoomMemberJoined
    }

    public onInRoomTextMessageReceived(messages: ZegoSignalingInRoomTextMessage[], roomID: string) {
        this.signalingService.notifyInRoomTextMessageReceived(messages, roomID);
    }

    public onInRoomCommandMessageReceived(messages: ZegoSignalingInRoomCommandMessage[], roomID: string) {
        this.signalingService.onInRoomCommandMessageReceived(messages, roomID);
    }

    // public enableNotifyWhenAppRunningInBackgroundOrQuit(enable: boolean) {
    //     
    //     
    //         this.signalingPlugin.enableNotifyWhenAppRunningInBackgroundOrQuit(enable);
    //     }
    // }

    public addConnectionStateChangeListener(listenerID: string, listener: ZegoUIKitSignalingConnectionStateChangeListener) {
        this.signalingService.addConnectionStateChangeListener(listenerID, listener);
    }

    public removeConnectionStateChangeListener(listenerID: string,) {
        this.signalingService.removeConnectionStateChangeListener(listenerID);
    }

    public addZIMEventHandler(listenerID: string, handler: ZIMEventHandler) {


        this.signalingPlugin.addZIMEventHandler(listenerID, handler)
    }

    public removeZIMEventHandler(listenerID: string) {


        this.signalingPlugin.removeZIMEventHandler(listenerID)
    }

    public setCallingConfig({ canInvitingInCalling, onlyInitiatorCanInvite, endCallWhenInitiatorLeave }: CallingConfig) {
        isBoolean(canInvitingInCalling) && (this.callingConfig.canInvitingInCalling = canInvitingInCalling)
        isBoolean(onlyInitiatorCanInvite) && (this.callingConfig.onlyInitiatorCanInvite = onlyInitiatorCanInvite)
        isBoolean(endCallWhenInitiatorLeave) && (this.callingConfig.endCallWhenInitiatorLeave = endCallWhenInitiatorLeave)
    }

    public isInviter(userID: string) {
        return this.getCurrentInvitationData()?.inviter?.userID === userID
    }

    public getCallingConfig() {
        return this.callingConfig
    }


    public getCurrentInvitationData() {
        return this.getInvitationByID(this.currentInvitationID)
    }

    public async endCall() {
        const { canInvitingInCalling, endCallWhenInitiatorLeave } = this.callingConfig
        const userLocalID = UIKitCore.getInstance().getLocalUser()!.userID;
        const isInviter = this.isInviter(userLocalID)
        zlogwarning(TAG,`endCall canInvitingInCalling: ${canInvitingInCalling}, endCallWhenInitiatorLeave: ${endCallWhenInitiatorLeave}, isInviter: ${isInviter} invitationID: ${this.currentInvitationID}`)
        // 离开房间取消所有未接受的呼叫
        try {
            await this.cancelInvitation(this.currentInvitationID)
        } catch (error) {
            zlogerror(TAG, `cancelInvitation failed on endCall: ${error}`)
        };
        if (canInvitingInCalling) {
            if (endCallWhenInitiatorLeave && isInviter) {
                this.callEnd()
                .then((res) => {
                    zlogwarning('callEnd', res)
                })
                .catch((error) => {
                    zlogwarning('callEnd', error)
                })
            } else {
                this.callQuit()
                .then((res) => {
                    zlogwarning('callQuit', res)
                })
                .catch((error) => {
                    zlogwarning('callQuit', error)
                })
            }
        }
        this.currentInvitationID = ''
    }

}
