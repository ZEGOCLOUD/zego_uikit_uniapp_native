import { NotifyList } from './NotifyList';
import { ZegoAudioVideoUpdateListener, ZegoScreenSharingUpdateListener, RoomStateChangedListener, ZegoRoomPropertyUpdateListener, ZegoInRoomCommandListener, ZegoSendInRoomCommandCallback, ZegoUIKitCallback, ZegoUIKitUser, ZegoRoomLogoutCallback } from '../defines';
import { ZegoUpdateType, ZegoStream, ZegoUser, ZegoRoomConfig, ZegoRoomState, ZegoRoomStateChangedReason } from "../express/ZegoExpressUniApp";

import { ExpressEngineProxy } from '../express/ExpressEngineProxy';
import UIKitCore from './UIKitCore';
import { makeTag, UIKitReport, zlogerror, zloginfo, zlogwarning } from '../../utils';

const TAG = makeTag('RoomService')

export default class RoomService {
    private mainStreamUpdateListeners: NotifyList<ZegoAudioVideoUpdateListener> = new NotifyList();
    private shareStreamUpdateListeners: NotifyList<ZegoScreenSharingUpdateListener> = new NotifyList();
    private roomStateChangedListeners: NotifyList<RoomStateChangedListener> = new NotifyList();
    private roomPropertyUpdateListeners: NotifyList<ZegoRoomPropertyUpdateListener> = new NotifyList();
    private inRoomCommandListenerNotifyList: NotifyList<ZegoInRoomCommandListener> = new NotifyList();

    constructor(){
        zloginfo(TAG, 'new RoomService')
    }

    public addRoomStateUpdatedListener(listenerID: string, listener: RoomStateChangedListener): void {
        this.roomStateChangedListeners.addListener(listenerID, listener);
    }

    public removeRoomStateUpdatedListener(listenerID: string): void {
        this.roomStateChangedListeners.removeListener(listenerID);
    }

    public addRoomPropertyUpdatedListener(listenerID: string, listener: ZegoRoomPropertyUpdateListener): void {
        this.roomPropertyUpdateListeners.addListener(listenerID, listener);
    }

    public removeRoomPropertyUpdatedListener(listenerID: string): void {
        this.roomPropertyUpdateListeners.removeListener(listenerID);
    }

    public addInRoomCommandListener(listenerID: string, listener: ZegoInRoomCommandListener): void {
        this.inRoomCommandListenerNotifyList.addListener(listenerID, listener);
    }

    public removeInRoomCommandListener(listenerID: string): void {
        this.inRoomCommandListenerNotifyList.removeListener(listenerID);
    }

    public addScreenSharingUpdateListener(listenerID: string, listener: ZegoScreenSharingUpdateListener): void {
        this.shareStreamUpdateListeners.addListener(listenerID, listener);
    }

    public removeScreenSharingUpdateListener(listenerID: string): void {
        this.shareStreamUpdateListeners.removeListener(listenerID);
    }

    public clear(): void {
        this.clearOtherListeners();
        this.clearRoomStateListeners();
    }

    public clearOtherListeners(): void {
        this.mainStreamUpdateListeners.clear();
        this.roomPropertyUpdateListeners.clear();
        this.inRoomCommandListenerNotifyList.clear();
        this.shareStreamUpdateListeners.clear();
    }

    public clearRoomStateListeners(): void {
        this.roomStateChangedListeners.clear();
    }


    public notifyStreamUpdate(roomID: string, zegoUpdateType: ZegoUpdateType, streamList: ZegoStream[], jsonObject: any): void {
        zloginfo(TAG, `notifyStreamUpdate roomID=${roomID}, zegoUpdateType=${zegoUpdateType}, streamList=${JSON.stringify(streamList)}, jsonObject=${JSON.stringify(jsonObject)}`);
        const mainStreamList: ZegoStream[] = streamList.filter(stream => stream.streamID.includes("main"));
        const shareStreamList: ZegoStream[] = streamList.filter(stream => !stream.streamID.includes("main"));

        const mainUserList: ZegoUIKitUser[] = mainStreamList.map(stream => ({
            userID: stream.user.userID,
            userName: stream.user.userName,
            streamID: stream.streamID,
        }));
        const shareUserList: ZegoUIKitUser[] = shareStreamList.map(stream => ({
            userID: stream.user.userID,
            userName: stream.user.userName,
            streamID: stream.streamID,
        }));

        if (zegoUpdateType === ZegoUpdateType.Add) {
            zlogwarning(TAG, `notifyStreamUpdate add stream, mainUserList=${JSON.stringify(mainUserList)}, mainStreamUpdateListeners=${this.mainStreamUpdateListeners.length}`);
            if (mainUserList.length > 0) {
                this.mainStreamUpdateListeners.notifyAllListener(audioVideoUpdateListener => {
                    audioVideoUpdateListener.onAudioVideoAvailable?.(mainUserList);
                });
            }
            if (shareUserList.length > 0) {
                this.shareStreamUpdateListeners.notifyAllListener(screenSharingUpdateListener => {
                    screenSharingUpdateListener.onScreenSharingAvailable?.(shareUserList);
                });
            }
        } else {
            if (mainUserList.length > 0) {
                this.mainStreamUpdateListeners.notifyAllListener(audioVideoUpdateListener => {
                    audioVideoUpdateListener.onAudioVideoUnAvailable?.(mainUserList);
                });
            }
            if (shareUserList.length > 0) {
                this.shareStreamUpdateListeners.notifyAllListener(screenSharingUpdateListener => {
                    screenSharingUpdateListener.onScreenSharingUnAvailable?.(shareUserList);
                });
            }
        }
    }

    public notifyRoomStateUpdate(roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, jsonObject: any): void {
        this.roomStateChangedListeners.notifyAllListener(roomStateChangedListener => {
            roomStateChangedListener.onRoomStateChanged?.(roomID, reason, errorCode, jsonObject);
        });
    }

    public addAudioVideoUpdateListener(listenerID: string, listener: ZegoAudioVideoUpdateListener): void {
        this.mainStreamUpdateListeners.addListener(listenerID, listener);
        zloginfo(TAG, `addAudioVideoUpdateListener listenerID=${listenerID}, this.mainStreamUpdateListeners=${this.mainStreamUpdateListeners.length}`);
    }

    public removeAudioVideoUpdateListener(listenerID: string): void {
        zloginfo(TAG, `removeAudioVideoUpdateListener listenerID=${listenerID}`);
        this.mainStreamUpdateListeners.removeListener(listenerID);
    }

    // public notifyAudioVideoAvailable(mainUserList: ZegoUIKitUser[]) {
    //     if (mainUserList.length > 0) {
    //         this.mainStreamUpdateListeners.notifyAllListener(audioVideoUpdateListener => {
    //             audioVideoUpdateListener.onAudioVideoAvailable?.(mainUserList);
    //         });
    //     }
    // }

    public async joinRoom(roomID: string, token: string, callback?: ZegoUIKitCallback): Promise<void> {
        const localUser = UIKitCore.getInstance().getLocalCoreUser();
        zloginfo(`${TAG} joinRoom for ${roomID}, localUser=${JSON.stringify(localUser)}`)
        if (localUser) {
            const user: ZegoUser = {
                userID: localUser.userID,
                userName: localUser.userName!
            }
            const config: ZegoRoomConfig = {
                maxMemberCount: 0,
                isUserStatusNotify: true,
                token: ''
            };
            if (token) {
                config.token = token;
            }
            const startTime = Date.now()
            const result = await ExpressEngineProxy.loginRoom(roomID, user, config)
            if (!result) {
                zlogerror(`${TAG} loginRoom fail! ${JSON.stringify(result)}`)
            } else {
                zloginfo(`${TAG} loginRoom success`)
            }
            const errorCode = result?.errorCode ?? 0
            const errorMsg = result?.extendedData ?? ''
            if (callback) {
                callback(errorCode)
            }
            UIKitReport.reportEvent('loginRoom', {
                room_id: roomID,
                error: errorCode,
                msg: errorMsg,
                start_time: startTime,
            })
        }
    }

    public async leaveRoom(roomID?: string, callback?: ZegoRoomLogoutCallback): Promise<void> {
        const result = await ExpressEngineProxy.logoutRoom(roomID);
        zloginfo(`${TAG} leaveRoom for ${roomID}, result: ${JSON.stringify(result)}`)
        const errorCode = result?.errorCode ?? 0
        const errorMsg = result?.extendedData ?? ''
        if (callback) {
            callback.onRoomLogoutResult?.(errorCode, errorMsg)
        }
        UIKitReport.reportEvent('logoutRoom', {
            room_id: roomID,
            error: errorCode,
            msg: errorMsg,
        })
    }

    public async setRoomProperty(roomID: string, key: string, value: string, callback?: ZegoUIKitCallback): Promise<void> {
        const result = await ExpressEngineProxy.setRoomExtraInfo(roomID, key, value)
        if (callback) {
            callback(result?.errorCode ?? 0);
        }
    }

    public notifyRoomPropertyUpdate(key: string, oldValue: string, value: string): void {
        this.roomPropertyUpdateListeners.notifyAllListener(roomPropertyUpdateListener => {
            roomPropertyUpdateListener.onRoomPropertyUpdated?.(key, oldValue, value);
        });
    }

    public notifyRoomPropertiesFullUpdated(keys: string[], oldProperties: Record<string, string>, roomProperties: Record<string, string>): void {
        this.roomPropertyUpdateListeners.notifyAllListener(roomPropertyUpdateListener => {
            roomPropertyUpdateListener.onRoomPropertiesFullUpdated?.(keys, oldProperties, roomProperties);
        });
    }

    public async sendInRoomCommand(roomID: string, command: string, toUserList: string[], callback?: ZegoSendInRoomCommandCallback): Promise<void> {

        const zegoUserList: ZegoUser[] = toUserList
            .map(userID => UIKitCore.getInstance().getUser(userID))
            .filter(user => !!user)
            .map(uiKitUser => ({
                userID: uiKitUser!.userID,
                userName: uiKitUser!.userName!
            }));

        const result = await ExpressEngineProxy.sendCustomCommand(roomID, command, zegoUserList);
        if (callback) {
            callback.onSend?.(result.errorCode);
        }
    }

    public notifyIMRecvCustomCommand(roomID: string, fromUser: ZegoUser, command: string): void {
        this.inRoomCommandListenerNotifyList.notifyAllListener(zegoInRoomCommandListener => {
            const uiKitUser: ZegoUIKitUser = {
                userID: fromUser.userID,
                userName: fromUser.userName
            };
            zegoInRoomCommandListener.onInRoomCommandReceived?.(uiKitUser, command);
        });
    }
}
