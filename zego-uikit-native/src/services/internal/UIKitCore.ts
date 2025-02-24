
import {
    ZegoAudioRoute,
    ZegoBroadcastMessageInfo,
    ZegoDeviceExceptionType,
    ZegoDeviceType,
    ZegoEngineConfig,
    ZegoMixerTask,
    ZegoPlayerConfig,
    ZegoPlayerState,
    ZegoPlayStreamQuality,
    ZegoPublishChannel,
    ZegoPublisherState,
    ZegoPublishStreamQuality,
    ZegoRemoteDeviceState,
    ZegoRoomExtraInfo,
    ZegoRoomStateChangedReason,
    ZegoScenario,
    ZegoSoundLevelInfo,
    ZegoStream,
    ZegoStreamResourceMode,
    ZegoUpdateType,
    ZegoUser,
    ZegoVideoConfig,
    ZegoVideoConfigPreset
} from "../express/ZegoExpressUniApp";

import { zlogerror, zloginfo, zlogwarning } from '../../utils/logger';
import TextUtils from '../../utils/TextUtils';
import { ExpressEngineProxy } from '../express/ExpressEngineProxy';

import RoomService from './RoomService';
import { UIKitCoreUser } from './UIKitCoreUser';
import UserService from './UserService';

import {
    RoomStateChangedListener,
    ZegoAudioOutputDeviceChangedListener,
    ZegoAudioVideoResourceMode,
    ZegoAudioVideoUpdateListener,
    ZegoCameraStateChangeListener,
    ZegoInRoomCommandListener,
    ZegoInRoomMessage,
    ZegoInRoomMessageListener,
    ZegoInRoomMessageSendStateListener,
    ZegoInRoomMessageState,
    ZegoMeRemovedFromRoomListener,
    ZegoMicrophoneStateChangeListener,
    ZegoMixerStartCallback,
    ZegoMixerStopCallback,
    ZegoOnlySelfInRoomListener,
    ZegoPresetResolution,
    ZegoRoomPropertyUpdateListener,
    ZegoSendInRoomCommandCallback,
    ZegoSoundLevelUpdateListener,
    ZegoTurnOnYourCameraRequestListener,
    ZegoTurnOnYourMicrophoneRequestListener,
    ZegoUIKitCallback,
    ZegoUIKitRoom,
    ZegoUIKitScenario,
    ZegoUIKitTokenExpireListener,
    ZegoUIKitUser,
    ZegoUserCountOrPropertyChangedListener,
    ZegoUserUpdateListener
} from '../defines';

import { makeTag, UIKitReport, Platform } from "../../utils";
import { deleteSingletonInstance, getSingletonInstance, SingletonScope } from "../../utils/singleton";
import ZegoUIKit from '../../ZegoUIKit';
import { DefaultExpressEventHandler } from '../express/DefaultExpressEventHandler';
import { EventHandlerList } from '../express/EventHandlerList';
import { ExpressEngineEventHandler } from '../express/ExpressEngineEventHandler';
import { AudioVideoService } from './AudioVideoService';
import { MessageService } from './MessageService';
import packageJson from '../../config/package.json';

const TAG = makeTag('UIKitCore')


/**
 * for internal use,DO NOT call it directly.
 */
export default class UIKitCore extends DefaultExpressEventHandler {
    private static name: string = '_UIKitCore'

    private static isDelete = false
    public static getInstance(): UIKitCore {
        if (UIKitCore.isDelete) {
            // 为了避免内部逻辑报错, 先这样看看
            zlogerror(TAG, 'deleteInstance() has called!')
        }
        return getSingletonInstance(UIKitCore, SingletonScope.Global)
    }

    public static deleteInstance() {
        UIKitCore.isDelete = true
        deleteSingletonInstance(UIKitCore, SingletonScope.Global)
    }


    private roomService: RoomService = new RoomService();
    private userService: UserService = new UserService();
    private audioVideoService: AudioVideoService = new AudioVideoService();
    private messageService: MessageService = new MessageService();
    private localUser: UIKitCoreUser | null = null;
    private readonly zegoUIKitRoom: ZegoUIKitRoom = { roomID: "" };
    private isFrontFacing: boolean = true;

    private remoteUserList: UIKitCoreUser[] = [];
    private inRoomMessages: ZegoInRoomMessage[] = [];
    private roomExtraInfoMap: Map<string, ZegoRoomExtraInfo> = new Map();
    private isLargeRoom: boolean = false;
    private markAsLargeRoom: boolean = false;
    private roomMemberCount: number = 0;
    private lastNotifyTokenTime: number = 0;
    private isUIKitInited: boolean = false;
    private token: string | null = '';

    private tokenExpireListener: ZegoUIKitTokenExpireListener | null = null;
    private resourceMode: ZegoAudioVideoResourceMode = ZegoAudioVideoResourceMode.Default;
    private eventHandlerList: EventHandlerList<ExpressEngineEventHandler> = new EventHandlerList<ExpressEngineEventHandler>()

    public getVersion(): string {
        return packageJson.version;
    }

    public async init(appID: number, appSign: string, scenario: ZegoUIKitScenario): Promise<boolean> {
        if (TextUtils.isEmpty(appSign)) {
            zlogerror(TAG, 'appSign is empty')
            return false
        }
        if (this.isUIKitInited) {
            zlogwarning(TAG, 'already init')
            return true
        }
        this.isUIKitInited = true
        const platform_version = Platform.getRuntimeVersion()
        const uikit_version = this.getVersion()
        await this.createExpressEngine(appID, appSign, scenario as unknown as ZegoScenario);

        zlogwarning(TAG, `platform_version: ${platform_version}, uikit_version: ${uikit_version}`)
        zlogwarning(TAG, `Reporter Version: ${UIKitReport.getVersion()}`)
        const reporterInit = UIKitReport.init(appID, appSign, {
            platform: 'uniapp',
            platform_version,
            uikit_version: uikit_version,
        })
        zlogwarning(TAG, `Reporter init ${reporterInit}`)
        if (ExpressEngineProxy.getEngine() === null) {
            zlogerror(TAG, 'createExpressEngine failed')
            return false;
        }
        // express will open camera by default
        ExpressEngineProxy.enableCamera(false);

        zloginfo(TAG, `init() called with: appID = [${appID}], isEmpty(appSign) = [${TextUtils.isEmpty(appSign)}]`);

        return true;
    }

    public async unInit() {
        if (this.isUIKitInited) {
            this.isUIKitInited = false
            UIKitReport.unInit()
            await this.destroyEngine()
        } else {
            zlogwarning(TAG, 'not init!')
        }
    }

    private async createExpressEngine(appID: number, appSign: string, scenario: ZegoScenario) {
        const config: ZegoEngineConfig = {
            advancedConfig: {
                // @ts-ignore
                "notify_remote_device_unknown_status": "true",
                "notify_remote_device_init_status": "true"
            }
        };
        await ExpressEngineProxy.createEngine(appID, appSign, scenario, config);
        ExpressEngineProxy.addEventHandler(this);
    }


    public async destroyEngine() {
        zloginfo(TAG, 'destroyEngine')
        ExpressEngineProxy.removeEventHandler(this);
        return ExpressEngineProxy.destroyEngine();
    }




    private containsUser(uiKitCoreUser: UIKitCoreUser): boolean {
        return this.remoteUserList.some(user => user.userID === uiKitCoreUser.userID);
    }

    private removeUser(uiKitCoreUser: UIKitCoreUser) {
        this.remoteUserList = this.remoteUserList.filter(user => user.userID !== uiKitCoreUser.userID);
    }

    public isUserExist(userID: string) {
        return [...this.remoteUserList, this.localUser].some(user => user?.userID === userID);
    }


    public notifyTokenWillExpire(seconds: number) {

        if (Date.now() - this.lastNotifyTokenTime > 5 * 60 * 1000) {
            if (this.tokenExpireListener != null) {
                this.tokenExpireListener.onTokenWillExpire?.(seconds);
            }
        }
        this.lastNotifyTokenTime = Date.now()
    }

    public addEventHandler(eventHandler: ExpressEngineEventHandler, autoDelete: boolean) {
        this.eventHandlerList.addEventHandler(eventHandler, autoDelete);
        ExpressEngineProxy.addEventHandler(eventHandler);
    }

    public removeEventHandler(eventHandler: ExpressEngineEventHandler) {
        this.eventHandlerList.removeEventHandler(eventHandler)
        ExpressEngineProxy.removeEventHandler(eventHandler);
    }

    private removeAutoDeleteRoomListeners() {
        ExpressEngineProxy.removeEventHandlerList(this.eventHandlerList.getAutoDeleteHandlerList());
        this.eventHandlerList.removeAutoDeleteRoomListeners();
    }


    private notifyTurnMicrophoneOffCommand(uiKitUser: ZegoUIKitUser) {
        this.audioVideoService.notifyTurnMicrophoneCommand(uiKitUser, false);
    }

    private notifyTurnCameraOffCommand(uiKitUser: ZegoUIKitUser) {
        this.audioVideoService.notifyTurnCameraCommand(uiKitUser, false);
    }

    private notifyTurnMicrophoneOnCommand(uiKitUser: ZegoUIKitUser) {
        this.audioVideoService.notifyTurnMicrophoneCommand(uiKitUser, true);
    }

    private notifyTurnCameraOnCommand(uiKitUser: ZegoUIKitUser) {
        this.audioVideoService.notifyTurnCameraCommand(uiKitUser, true);
    }

    private notifyRemovedFromRoomCommand() {
        this.userService.notifyRemovedFromRoomCommand();
    }


    public renewToken(token: string) {
        if (token !== this.token) {
            if (!TextUtils.isEmpty(this.zegoUIKitRoom.roomID)) {
                ExpressEngineProxy.renewToken(this.zegoUIKitRoom.roomID, token);
            }
        }
        // !暂时不支持
        // getSignalingPlugin().renewToken(token);
        this.token = token;
    }

    private dispatchBroadcastMessages(roomID: string, messageList: ZegoInRoomMessage[]) {
        this.messageService.notifyInRoomMessageReceived(roomID, messageList);
    }

    public setPresetVideoConfig(preset: ZegoPresetResolution) {
        ExpressEngineProxy.setVideoConfig(preset as unknown as ZegoVideoConfigPreset, ZegoPublishChannel.Main);
    }

    public setVideoConfig(config: ZegoVideoConfig) {
        ExpressEngineProxy.setVideoConfig(config, ZegoPublishChannel.Main);
    }



    private dispatchOnlySelfInRoom() {
        this.userService.notifyOnlySelfInRoom();
    }

    private dispatchSoundLevelUpdate(userID: string, soundLevel: number) {
        this.audioVideoService.notifySoundLevelUpdate(userID, soundLevel);
    }

    private dispatchRemoteCameraStateUpdate(coreUser: UIKitCoreUser, open: boolean) {
        this.audioVideoService.notifyCameraStateChange(coreUser, open);
    }

    private dispatchRemoteMicStateUpdate(coreUser: UIKitCoreUser, open: boolean) {
        this.audioVideoService.notifyMicStateChange(coreUser, open);
    }

    private dispatchRoomStateUpdate(roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, jsonObject: any) {
        this.roomService.notifyRoomStateUpdate(roomID, reason, errorCode, jsonObject);
    }
    private dispatchStreamUpdate(roomID: string, zegoUpdateType: ZegoUpdateType, streamList: ZegoStream[], jsonObject: any) {
        this.roomService.notifyStreamUpdate(roomID, zegoUpdateType, streamList, jsonObject);
    }

    private dispatchUserLeave(userInfoList: UIKitCoreUser[]) {
        this.userService.notifyUserLeave(userInfoList);
    }

    private dispatchUserJoin(userInfoList: UIKitCoreUser[]) {
        this.userService.notifyUserJoin(userInfoList);
    }

    public dispatchRoomUserCountOrPropertyChanged(userList: ZegoUIKitUser[]) {
        this.userService.notifyRoomUserCountOrPropertyChanged(userList);
    }


    public getLocalCoreUser(): UIKitCoreUser | null {
        return this.localUser;
    }

    public checkIsLargeRoom(): boolean {
        return this.isLargeRoom || this.markAsLargeRoom;
    }

    public isLocalUser(userID: string): boolean {
        if (this.localUser == null) {
            return false;
        }
        return userID === this.localUser.userID;
    }


    public getUserFromStreamID(streamID: string): UIKitCoreUser | null {
        if (this.getLocalCoreUser() == null) {
            return null;
        }
        if (this.getLocalCoreUser()?.mainStreamID === streamID) {
            return this.getLocalCoreUser();
        }
        for (let uiKitUser of this.remoteUserList) {
            if (uiKitUser.mainStreamID === streamID) {
                return uiKitUser;
            }
        }
        return null;
    }

    public getUserByUserID(userID: string): UIKitCoreUser | null {
        // zlogerror(TAG, 'this.getLocalCoreUser()', this.getLocalCoreUser(), 'userID', userID)
        if (this.getLocalCoreUser() == null) {
            return null;
        }
        if (this.getLocalCoreUser()?.userID === userID) {
            return this.getLocalCoreUser();
        }
        for (let uiKitUser of this.remoteUserList) {
            if (uiKitUser.userID === userID) {
                return uiKitUser;
            }
        }
        return null;
    }


    public useFrontFacingCamera(isFrontFacing: boolean) {
        this.isFrontFacing = isFrontFacing;
        this.audioVideoService.useFrontFacingCamera(isFrontFacing);
    }

    public isUseFrontCamera(): boolean {
        return this.isFrontFacing;
    }


    public isMicrophoneOn(userID?: string): boolean {
        if (!userID) {
            return this.localUser?.isMicrophoneOn ?? false;
        }
        const uiKitCoreUser = this.getUserByUserID(userID);
        if (uiKitCoreUser != null) {
            return uiKitCoreUser.isMicrophoneOn!;
        }
        return false;
    }


    public isCameraOn(userID?: string): boolean {
        if (!userID) {
            return this.localUser?.isCameraOn ?? false;
        }
        const uiKitCoreUser = this.getUserByUserID(userID);
        if (uiKitCoreUser != null) {
            return uiKitCoreUser.isCameraOn!;
        }
        return false;
    }


    public setAudioOutputToSpeaker(enable: boolean) {
        this.audioVideoService.setAudioOutputToSpeaker(enable);
    }

    /**
     * is speaker or other output:Receiver/Bluetooth/Headphone.
     *
     * @return
     */
    public async isSpeakerOn(): Promise<boolean> {
        return (await ExpressEngineProxy.getAudioRouteType()) == ZegoAudioRoute.Speaker;
    }

    public static generateCameraStreamID(roomID: string, userID: string): string {
        return roomID + "_" + userID + "_main";
    }

    public static generateScreenShareStreamID(roomID: string, userID: string): string {
        return roomID + "_" + userID + "_screensharing";
    }

    /**
     * 
     * @param userID 传空或者不传, 表示本地用户
     * @param on 
     */
    public turnMicrophoneOn(userID: string, on: boolean) {
        zloginfo(TAG, "turnMicrophoneOn: " + userID + " " + on);
        if (TextUtils.isEmpty(userID) && this.isLocalUser(userID)) {
            // 没有传 userID, 那就是自己
            const localCoreUser = this.getLocalCoreUser();
            if (localCoreUser) {
                const stateChanged = (localCoreUser.isMicrophoneOn !== on);
                this.audioVideoService.turnMicrophoneOn(userID, on);
                if (stateChanged) {
                    this.eventHandlerList.notifyAllListener(eventHandler => {
                        eventHandler.onLocalMicrophoneStateUpdate(on);
                    });
                }
            } else {
                // 出错了
                zlogerror(TAG, "turnMicrophoneOn: localCoreUser is null");
            }
        } else {
            // 指定其他
            this.audioVideoService.turnMicrophoneOn(userID, on);
        }
    }

    /**
     * 打开/关闭指定用户的摄像头, 自己的会触发 onLocalCameraStateUpdate
     * @param userID 传空或者不传, 表示本地用户
     * @param on
     */
    public turnCameraOn(userID: string, on: boolean) {
        zloginfo(TAG, "turnCameraOn: " + userID + " " + on);
        if (TextUtils.isEmpty(userID) && this.isLocalUser(userID)) {
            // 没有传 userID, 那就是自己
            const localCoreUser = this.getLocalCoreUser();
            if (localCoreUser) {
                const stateChanged = (localCoreUser.isCameraOn !== on);
                this.audioVideoService.turnCameraOn(userID, on);
                if (stateChanged) {
                    this.eventHandlerList.notifyAllListener(eventHandler => {
                        eventHandler.onLocalCameraStateUpdate(on);
                    });
                }
            } else {
                // 出错了
                zlogerror(TAG, "turnCameraOn: localCoreUser is null");
            }
        } else {
            // 指定其他
            this.audioVideoService.turnCameraOn(userID, on);
        }
    }


    public startPlayingAllAudioVideo() {
        this.audioVideoService.startPlayingAllAudioVideo();
    }


    public stopPlayingAllAudioVideo() {
        this.audioVideoService.stopPlayingAllAudioVideo();
    }


    public mutePlayStreamAudio(streamID: string, mute: boolean) {
        return ExpressEngineProxy.mutePlayStreamAudio(streamID, mute);
    }


    public mutePlayStreamVideo(streamID: string, mute: boolean) {
        return ExpressEngineProxy.mutePlayStreamVideo(streamID, mute);
    }


    public async startMixerTask(task: ZegoMixerTask, callback?: ZegoMixerStartCallback) {
        const result = await ExpressEngineProxy.startMixerTask(task);
        if (callback) {
            callback.onMixerStartResult?.(result.errorCode, result.extendedData)
        }
    }

    public async stopMixerTask(task: ZegoMixerTask, callback?: ZegoMixerStopCallback) {

        const result = await ExpressEngineProxy.stopMixerTask(task);
        if (callback) {
            callback.onMixerStopResult?.(result.errorCode)
        }
    }

    public startPlayingStream(streamID: string, config?: ZegoPlayerConfig) {
        return ExpressEngineProxy.startPlayingStream(streamID, config);
    }


    public addMicrophoneStateListener(listenerID: string, listener: ZegoMicrophoneStateChangeListener) {
        this.audioVideoService.addMicrophoneStateListener(listenerID, listener);
    }


    public removeMicrophoneStateListener(listenerID: string) {
        this.audioVideoService.removeMicrophoneStateListener(listenerID);
    }



    public addCameraStateListener(listenerID: string, listener: ZegoCameraStateChangeListener) {
        this.audioVideoService.addCameraStateListener(listenerID, listener);
    }



    public removeCameraStateListener(listenerID: string,) {
        this.audioVideoService.removeCameraStateListener(listenerID);
    }



    public addAudioOutputDeviceChangedListener(listenerID: string, listener: ZegoAudioOutputDeviceChangedListener) {
        this.audioVideoService.addAudioOutputDeviceChangedListener(listenerID, listener);
    }


    public removeAudioOutputDeviceChangedListener(listenerID: string) {
        this.audioVideoService.removeAudioOutputDeviceChangedListener(listenerID);
    }



    public addSoundLevelUpdatedListener(listenerID: string, listener: ZegoSoundLevelUpdateListener) {
        this.audioVideoService.addSoundLevelUpdatedListener(listenerID, listener);
    }


    public removeSoundLevelUpdatedListener(listenerID: string) {
        this.audioVideoService.removeSoundLevelUpdatedListener(listenerID);
    }


    public addTurnOnYourCameraRequestListener(listenerID: string, listener: ZegoTurnOnYourCameraRequestListener) {
        this.audioVideoService.addTurnOnYourCameraRequestListener(listenerID, listener);
    }


    public removeTurnOnYourCameraRequestListener(listenerID: string) {
        this.audioVideoService.removeTurnOnYourCameraRequestListener(listenerID);
    }


    public addTurnOnYourMicrophoneRequestListener(listenerID: string, listener: ZegoTurnOnYourMicrophoneRequestListener) {
        this.audioVideoService.addTurnOnYourMicrophoneRequestListener(listenerID, listener);
    }


    public removeTurnOnYourMicrophoneRequestListener(listenerID: string) {
        this.audioVideoService.removeTurnOnYourMicrophoneRequestListener(listenerID);
    }


    public setAudioVideoResourceMode(mode: ZegoAudioVideoResourceMode) {
        this.resourceMode = mode;
    }


    public getAudioVideoResourceMode(): ZegoAudioVideoResourceMode | null {
        return this.resourceMode;
    }


    public stopPlayingStream(streamID: string) {
        return ExpressEngineProxy.stopPlayingStream(streamID);
    }


    public startPreview(channel?: ZegoPublishChannel) {
        return ExpressEngineProxy.startPreview(channel);
    }

    public stopPreview(channel?: ZegoPublishChannel) {
        ExpressEngineProxy.stopPreview(channel);
    }


    public startPublishingStream(streamID: string, channel?: ZegoPublishChannel) {
        return ExpressEngineProxy.startPublishingStream(streamID, channel);
    }


    public stopPublishingStream(channel?: ZegoPublishChannel) {
        return ExpressEngineProxy.stopPublishingStream(channel);
    }


    /**
     * 打开/关闭自己的麦克风, 会触发 onLocalMicrophoneStateUpdate
     * @param open
     */
    public openMicrophone(open: boolean) {
        const localCoreUser = this.getLocalCoreUser();
        if (localCoreUser != null) {
            const stateChanged = (localCoreUser.isMicrophoneOn != open);
            // localCoreUser.isMicrophoneOn = open
            this.audioVideoService.openMicrophone(open);
            if (stateChanged) {
                this.eventHandlerList.notifyAllListener(eventHandler => {
                    eventHandler.onLocalMicrophoneStateUpdate(open);
                });
            }
        }
    }

    /**
     * 打开/关闭自己的摄像头, 会触发摄像头状态变更事件 onLocalCameraStateUpdate
     * @param open
     */
    public openCamera(open: boolean) {
        const localCoreUser = this.getLocalCoreUser();
        if (localCoreUser != null) {
            const stateChanged = (localCoreUser.isCameraOn != open);
            // localCoreUser.isCameraOn = open
            this.audioVideoService.openCamera(open);
            if (stateChanged) {
                this.eventHandlerList.notifyAllListener(eventHandler => {
                    eventHandler.onLocalCameraStateUpdate(open);
                });
            }
        }
    }

    public inRoom() {
        return !!this.zegoUIKitRoom.roomID
    }


    public async joinRoom(roomID: string, markAsLargeRoom: boolean, callback?: ZegoUIKitCallback) {
        if (!ExpressEngineProxy.getEngine()) {
            zlogerror(`ExpressEngineProxy is null!`)
            return;
        }
        this.zegoUIKitRoom.roomID = roomID;
        this.markAsLargeRoom = markAsLargeRoom;
        zloginfo(`${TAG} joinRoom for '${roomID}'`)
        // 先之前的房
        await this.roomService.leaveRoom(roomID)
        await this.roomService.joinRoom(roomID, this.token!, (errorCode) => {
            if (errorCode !== 0) {
                zlogerror(`${TAG} joinRoom '${roomID}' error, code=${errorCode}`)
                this.zegoUIKitRoom.roomID = "";
            } else {
                zlogwarning(`${TAG} joinRoom '${roomID}' error, code=${errorCode}`)
                const localUser = this.getLocalCoreUser();
                const streamID = UIKitCore.generateCameraStreamID(roomID, localUser!.userID);
                localUser?.setStreamID(streamID)
                ExpressEngineProxy.startSoundLevelMonitor();
                // tryStartPublishStream
                // ExpressEngineProxy.startPublishingStream(streamID, ZegoPublishChannel.Main);
                // ExpressEngineProxy.startPreview(ZegoPublishChannel.Main)
                // this.roomService.notifyAudioVideoAvailable([localUser!.getUIKitUser()])
            }
            if (callback) {
                callback(errorCode);
            }
        });
    }


    public async leaveRoom() {
        if (!ExpressEngineProxy.getEngine()) {
            return;
        }
        const roomID = this.zegoUIKitRoom.roomID
        this.resetRoomData();

        zloginfo(`${TAG} leaveRoom roomID: "${roomID}"`)
        if (!roomID) {
            zlogwarning(`${TAG} leaveRoom roomID is null`);
            return;
        }

        this.audioVideoService.openMicrophone(false);
        this.audioVideoService.openCamera(false);
        ExpressEngineProxy.stopPreview();
        ExpressEngineProxy.stopSoundLevelMonitor();
        ExpressEngineProxy.useFrontCamera(true);
        ExpressEngineProxy.setAudioRouteToSpeaker(true);

        await this.stopPublishingStream()

        // const localCoreUser = UIKitCore.getInstance().getLocalCoreUser();
        // if(localCoreUser){
        //     zloginfo(`${TAG} leaveRoom try turnoff mic and camera, userid: `, localCoreUser.userID)
        //     this.audioVideoService.turnMicrophoneOn(localCoreUser.userID, false)
        //     this.audioVideoService.turnCameraOn(localCoreUser.userID, false)
        // }

        await this.roomService.leaveRoom(roomID);
    }

    /**
     * clear data,not device
     */
    private resetRoomData() {
        this.userService.clear();
        this.audioVideoService.clear();
        this.roomService.clear();
        this.messageService.clear();
        this.remoteUserList = [];
        this.inRoomMessages = [];
        this.zegoUIKitRoom.roomID = "";
        this.roomExtraInfoMap.clear();
        this.isFrontFacing = true;
        this.markAsLargeRoom = false;
        this.isLargeRoom = false;
        this.roomMemberCount = 0;

        this.removeAutoDeleteRoomListeners();
    }


    public getRoom(): ZegoUIKitRoom {
        return this.zegoUIKitRoom;
    }


    public setRoomProperty(key: string, value: string) {
        const map: Record<string, string> = {};

        map[key] = value;
        this.updateRoomProperties(map);
    }

    public getRoomProperties(): Record<string, string> {
        if (this.roomExtraInfoMap.has('extra_info')) {
            return this.roomExtraInfoValueToMap(this.roomExtraInfoMap.get("extra_info"));
        } else {
            return {}
        }
    }

    private roomExtraInfoValueToMap(roomExtraInfo: ZegoRoomExtraInfo | null | undefined): Record<string, string> {
        let map: Record<string, string> = {};

        if (!roomExtraInfo || roomExtraInfo.value === '') {
            return map;
        }

        try {
            map = JSON.parse(roomExtraInfo.value);
        } catch (e) {
            // 在TypeScript中，通常我们会使用console.error来处理错误打印，而不是e.printStackTrace()
            console.error('Error parsing room extra info:', e);
        }

        return map;
    }



    public updateRoomProperties(map: Record<string, string>) {

        const key = 'extra_info';
        const currentProperties = this.roomExtraInfoValueToMap(this.roomExtraInfoMap.get(key)) as Record<string, string>;
        const tempProperties = { ...currentProperties };

        for (const key in map) {
            tempProperties[key] = map[key];
        }

        const roomID = this.zegoUIKitRoom.roomID;
        if (!roomID) {
            return;
        }
        try {
            this.roomService.setRoomProperty(roomID, key, JSON.stringify(tempProperties), (errorCode) => {

                if (errorCode === 0) {
                    const oldProperties = { ...currentProperties };
                    const updateTime = Date.now();

                    for (const [key, value] of Object.entries(map)) {
                        currentProperties[key] = value;
                    }

                    let roomExtraInfo = this.roomExtraInfoMap.get(key);
                    if (!roomExtraInfo) {
                        roomExtraInfo = {
                            key,
                            value: JSON.stringify(currentProperties),
                            updateUser: {
                                userID: this.getLocalCoreUser()!.userID,
                                userName: this.getLocalCoreUser()!.userName!,
                            },
                            updateTime,

                        };
                    }
                    this.roomExtraInfoMap.set(roomExtraInfo.key, roomExtraInfo);

                    const updateKeys = Object.keys(map);
                    for (const updateKey of updateKeys) {
                        this.dispatchRoomPropertyUpdated(updateKey, oldProperties[updateKey], currentProperties[updateKey]);
                    }
                    this.dispatchRoomPropertiesFullUpdated(updateKeys, oldProperties, currentProperties);
                }
            });
        } catch (error) {
            console.error('Error updating room properties:', error);
        }
    }

    private dispatchRoomPropertiesFullUpdated(keys: string[], oldProperties: Record<string, string>,
        roomProperties: Record<string, string>) {
        this.roomService.notifyRoomPropertiesFullUpdated(keys, oldProperties, roomProperties);
    }

    private dispatchRoomPropertyUpdated(key: string, oldValue: string, value: string) {
        this.roomService.notifyRoomPropertyUpdate(key, oldValue, value);
    }


    public addRoomPropertyUpdateListener(listenerID: string, listener: ZegoRoomPropertyUpdateListener) {
        this.roomService.addRoomPropertyUpdatedListener(listenerID, listener);
    }


    public removeRoomPropertyUpdateListener(listenerID: string) {
        this.roomService.removeRoomPropertyUpdatedListener(listenerID);
    }

    public addRoomStateUpdatedListener(listenerID: string, listener: RoomStateChangedListener) {
        this.roomService.addRoomStateUpdatedListener(listenerID, listener);
    }


    public removeRoomStateUpdatedListener(listenerID: string) {
        this.roomService.removeRoomStateUpdatedListener(listenerID);
    }


    public setTokenWillExpireListener(listener: ZegoUIKitTokenExpireListener) {
        this.tokenExpireListener = listener;
    }


    public getTokenExpireListener(): ZegoUIKitTokenExpireListener | null {
        return this.tokenExpireListener;
    }


    public addAudioVideoUpdateListener(listenerID: string, listener: ZegoAudioVideoUpdateListener) {
        this.roomService.addAudioVideoUpdateListener(listenerID, listener);
    }


    public removeAudioVideoUpdateListener(listenerID: string) {
        this.roomService.removeAudioVideoUpdateListener(listenerID);
    }



    public sendInRoomCommand(command: string, toUserList: string[], callback?: ZegoSendInRoomCommandCallback) {
        this.roomService.sendInRoomCommand(this.getRoom().roomID, command, toUserList, callback);
    }


    public addInRoomCommandListener(listenerID: string, listener: ZegoInRoomCommandListener) {
        this.roomService.addInRoomCommandListener(listenerID, listener);
    }


    public removeInRoomCommandListener(listenerID: string) {
        this.roomService.removeInRoomCommandListener(listenerID);
    }


    public addUserUpdateListener(listenerID: string, listener: ZegoUserUpdateListener) {
        this.userService.addUserUpdateListener(listenerID, listener);
    }


    public removeUserUpdateListener(listenerID: string) {
        this.userService.removeUserUpdateListener(listenerID);
    }


    public addUserCountOrPropertyChangedListener(listenerID: string, listener: ZegoUserCountOrPropertyChangedListener) {
        this.userService.addUserCountOrPropertyChangedListener(listenerID, listener);
    }

    public removeUserCountOrPropertyChangedListener(listenerID: string) {
        this.userService.removeUserCountOrPropertyChangedListener(listenerID);
    }


    /**
     * 移除用户出房间。
     *
     * @param userIDs 要移除的用户ID列表。
     */
    public removeUserFromRoom(userIDs: string[]) {

        const command = {
            'zego_remove_user': userIDs
        };

        if (this.isLargeRoom || this.markAsLargeRoom) {
            ZegoUIKit.sendInRoomCommand(JSON.stringify(command), [], {
                onSend(errorCode) {

                },
            });
        } else {
            ZegoUIKit.sendInRoomCommand(JSON.stringify(command), userIDs, {
                onSend(errorCode) {

                },
            });
        }
    }


    public addOnMeRemovedFromRoomListener(listenerID: string, listener: ZegoMeRemovedFromRoomListener) {
        this.userService.addOnMeRemovedFromRoomListener(listenerID, listener);
    }


    public removeOnMeRemovedFromRoomListener(listenerID: string) {
        this.userService.removeOnMeRemovedFromRoomListener(listenerID);
    }


    // public removeUserCountOrPropertyChangedListenerInternal(listenerID: string,listener: ZegoUserCountOrPropertyChangedListener) {
    //     this.userService.removeUserCountOrPropertyChangedListener(listener, true);
    // }

    // public removeUserUpdateListenerInternal(listenerID: string,listener: ZegoUserUpdateListener) {
    //     this.userService.removeUserUpdateListener(listener, true);
    // }


    public login(userID: string, userName: string, callback?: ZegoUIKitCallback) {
        zloginfo(TAG, 'login', userID, userName)
        UIKitReport.updateUserID(userID)
        this.localUser = new UIKitCoreUser(userID, userName,)
        if (callback != null) {
            callback(0);
        }
    }


    public logout() {
        this.resetRoomData();
        // this.roomService.clearRoomStateListeners();
        this.localUser = null;
        this.token = null;
    }


    public getUser(userID: string): ZegoUIKitUser | null {
        const coreUser = this.getUserByUserID(userID);
        if (coreUser != null) {
            return coreUser.getUIKitUser();
        } else {
            zlogwarning(TAG, 'getUser', 'userID not found', userID)
            return null;
        }
    }


    public getLocalUser(): ZegoUIKitUser | null {
        const localCoreUser = this.getLocalCoreUser();
        if (localCoreUser == null) {
            return null;
        }
        return localCoreUser?.getUIKitUser();
    }

    public getAllUsers(): ZegoUIKitUser[] {
        // 使用Array.map来转换remoteUserList
        const uiKitUsers = this.remoteUserList.map(user => user.getUIKitUser());

        // 在数组前端添加localUser
        const localUIKitUser = this.localUser!.getUIKitUser();
        return [localUIKitUser, ...uiKitUsers];
    }

    public getRemoteUsers(): UIKitCoreUser[] {
        // 创建一个新数组来复制远程用户列表
        const remoteUsersCopy: UIKitCoreUser[] = [...this.remoteUserList];

        return remoteUsersCopy;
    }


    public addOnOnlySelfInRoomListener(listenerID: string, listener: ZegoOnlySelfInRoomListener) {
        this.userService.addOnOnlySelfInRoomListener(listenerID, listener);
    }


    public removeOnOnlySelfInRoomListener(listenerID: string) {
        this.userService.removeOnOnlySelfInRoomListener(listenerID);
    }


    public getInRoomMessages(): ZegoInRoomMessage[] {
        return this.inRoomMessages;
    }


    public sendInRoomMessage(message: string, listener?: ZegoInRoomMessageSendStateListener) {
        this.messageService.sendInRoomMessage(message, listener);
    }

    public resendInRoomMessage(message: ZegoInRoomMessage, listener: ZegoInRoomMessageSendStateListener) {
        this.messageService.resendInRoomMessage(message, listener);
    }


    public addInRoomMessageReceivedListener(listenerID: string, listener: ZegoInRoomMessageListener) {
        this.messageService.addInRoomMessageReceivedListener(listenerID, listener);
    }

    public removeInRoomMessageReceivedListener(listenerID: string) {
        this.messageService.removeInRoomMessageReceivedListener(listenerID);
    }


    //**************   DefaultExpressEventHandler  的相关事件 *********************** */


    roomUserUpdate(roomID: string, updateType: ZegoUpdateType, userList: ZegoUser[]): void {

        zloginfo(`${TAG} roomUserUpdate: roomID=${roomID}, updateType=${updateType} userList=${JSON.stringify(userList)}`)
        const userInfoList: UIKitCoreUser[] = userList.map((user: ZegoUser) => {
            return new UIKitCoreUser(user.userID, user.userName)
        })

        if (updateType == ZegoUpdateType.Add) {
            for (const uiKitCoreUser of userInfoList) {
                if (!this.containsUser(uiKitCoreUser)) {
                    this.remoteUserList.push(uiKitCoreUser);
                }
            }
            this.roomMemberCount += userList.length;
            if (this.roomMemberCount > 500) {
                this.isLargeRoom = true;
            }
            this.dispatchUserJoin(userInfoList);

        } else {
            for (const uiKitCoreUser of userInfoList) {
                this.removeUser(uiKitCoreUser)
            }
            this.roomMemberCount -= userList.length;
            this.dispatchUserLeave(userInfoList);
            if (this.remoteUserList.length === 0) {
                this.dispatchOnlySelfInRoom();
            }
        }
        this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers());
    }

    roomStreamUpdate(roomID: string, updateType: ZegoUpdateType, streamList: ZegoStream[], extendedData: string): void {

        // 把参数都用格式化字符串来打印
        zloginfo(`${TAG} roomStreamUpdate: roomID=${roomID}, updateType=${updateType}, streamList=${JSON.stringify(streamList)}, extendedData=${JSON.stringify(extendedData)}`)
        if (updateType == ZegoUpdateType.Add) {
            for (const zegoStream of streamList) {
                const uiKitUser = this.getUserByUserID(zegoStream.user.userID);
                if (uiKitUser) {
                    uiKitUser.setStreamID(zegoStream.streamID);
                    // zlogerror(TAG, 'add user=', JSON.stringify(uiKitUser))
                } else {
                    const user = UIKitCoreUser.createFromStream(zegoStream);
                    this.remoteUserList.push(user);
                    // zlogerror(TAG, 'add user=', JSON.stringify(user))
                }
                if (zegoStream.streamID.includes("main")) {
                    if (!this.resourceMode) {
                        zloginfo(TAG, 'roomStreamUpdate', 'startPlayingStream', zegoStream.streamID)
                        ExpressEngineProxy.startPlayingStream(zegoStream.streamID);
                    } else {
                        const config: ZegoPlayerConfig = { resourceMode: this.resourceMode as unknown as ZegoStreamResourceMode };
                        ExpressEngineProxy.startPlayingStream(zegoStream.streamID, config);
                    }
                }

            }
        }

        if (updateType == ZegoUpdateType.Delete) {
            for (const zegoStream of streamList) {
                const uiKitUser = this.getUserByUserID(zegoStream.user.userID);
                if (uiKitUser) {
                    uiKitUser.deleteStream(zegoStream.streamID);
                    if (zegoStream.streamID.includes("main")) {
                        if (uiKitUser.isCameraOn || uiKitUser.isMicrophoneOn) {
                            if (uiKitUser.isCameraOn) {
                                uiKitUser.isCameraOn = false;
                                this.dispatchRemoteCameraStateUpdate(uiKitUser, false);
                            }
                            if (uiKitUser.isMicrophoneOn) {
                                uiKitUser.isMicrophoneOn = false;
                                this.dispatchRemoteMicStateUpdate(uiKitUser, false);
                            }
                        }
                        uiKitUser.soundLevel = 0;
                    }
                    this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers());
                }
                ExpressEngineProxy.stopPlayingStream(zegoStream.streamID);
            }
        }

        this.dispatchStreamUpdate(roomID, updateType, streamList, extendedData);

        if (updateType == ZegoUpdateType.Add) {
            this.roomStreamExtraInfoUpdate?.(roomID, streamList);
        }
    }

    publisherStateUpdate(streamID: string, state: ZegoPublisherState, errorCode: number, extendedData: string): void {

        // 把参数都用格式化字符串来打印
        zloginfo(TAG, `publisherStateUpdate: streamID=${streamID}, state=${state}, errorCode=${errorCode}, extendedData=${JSON.stringify(extendedData)}`);

        if (state == ZegoPublisherState.Publishing) {
            const streamList: ZegoStream[] = [];
            if (this.localUser != null) {
                this.localUser.setStreamID(streamID);
                const zegoStream: ZegoStream = {
                    user: new ZegoUser(this.localUser.userID, this.localUser.userName!),
                    streamID,
                    extraInfo: ""
                };
                streamList.push(zegoStream);
            }
            this.dispatchStreamUpdate(this.getRoom().roomID, ZegoUpdateType.Add, streamList, extendedData);
        } else if (state == ZegoPublisherState.NoPublish) {
            const streamList: ZegoStream[] = [];
            if (this.localUser != null) {
                const zegoStream: ZegoStream = {
                    user: new ZegoUser(this.localUser.userID, this.localUser.userName!),
                    streamID,
                    extraInfo: ""
                }
                streamList.push(zegoStream);
                this.localUser.deleteStream(zegoStream.streamID);
            }
            this.dispatchStreamUpdate(this.getRoom().roomID, ZegoUpdateType.Delete, streamList, extendedData);
        }
    }

    publisherQualityUpdate(streamID: string, quality: ZegoPublishStreamQuality): void {

        zloginfo(TAG, "publisherQualityUpdate", streamID, quality);
    }

    playerStateUpdate(streamID: string, state: ZegoPlayerState, errorCode: number, extendedData: string): void {

        zloginfo(TAG, "playerStateUpdate", streamID, state, errorCode, extendedData);
    }

    playerQualityUpdate(streamID: string, quality: ZegoPlayStreamQuality): void {

        zloginfo(TAG, "playerQualityUpdate", streamID, quality);
    }

    roomStateChanged(roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, extendedData: string): void {

        zloginfo(`${TAG} roomStateChanged: reason=${reason}`)

        this.dispatchRoomStateUpdate(roomID, reason, errorCode, extendedData);
        if (reason == ZegoRoomStateChangedReason.KickOut) {
            this.userService.notifyRemovedFromRoomCommand();
        }
    }

    localDeviceExceptionOccurred(exceptionType: ZegoDeviceExceptionType, deviceType: ZegoDeviceType, deviceID: string): void {

        zlogerror(`${TAG} localDeviceExceptionOccurred: ${exceptionType} ${deviceType}`)
        // ios端首次授权会出现 exceptionType 1和3的报错
        if (Platform.isIos && [ZegoDeviceExceptionType.PermissionNotGranted, ZegoDeviceExceptionType.Generic]) return
        const localCoreUser = this.getLocalCoreUser();
        if (localCoreUser != null) {
            if (deviceType == ZegoDeviceType.Camera) {
                if (localCoreUser.isCameraOn) {
                    this.turnCameraOn(localCoreUser.userID, false);
                    this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers());
                }
            } else if (deviceType == ZegoDeviceType.Microphone) {
                if (localCoreUser.isMicrophoneOn) {
                    this.turnMicrophoneOn(localCoreUser.userID, false);
                    this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers());
                }
            }
        }
    }

    remoteCameraStateUpdate(streamID: string, state: ZegoRemoteDeviceState): void {

        zloginfo(`${TAG} remoteCameraStateUpdate: ${state}`)
        // 若不支持获取状态，则不进行改动（采用流额外信息的状态）
        if (state === ZegoRemoteDeviceState.NotSupport) return
        // 对端频繁切换摄像头会出现Interruption状态导致界面不显示画面，先忽略此状态
        if (state === ZegoRemoteDeviceState.Interruption) return


        const coreUser = this.getUserFromStreamID(streamID)
        if (coreUser) {
            const open = state == ZegoRemoteDeviceState.Open
            coreUser.isCameraOn = open
            this.dispatchRemoteCameraStateUpdate(coreUser, open)
            this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers())
        }
    }


    remoteMicStateUpdate(streamID: string, state: ZegoRemoteDeviceState): void {

        zloginfo(`${TAG} remoteMicStateUpdate: ${state}`)

        const coreUser = this.getUserFromStreamID(streamID)
        if (coreUser) {
            const open = state == ZegoRemoteDeviceState.Open
            zloginfo(`${TAG} remoteMicStateUpdate from ${coreUser.isMicrophoneOn} to ${open}, has change=${coreUser.isMicrophoneOn !== open}`)
            coreUser.isMicrophoneOn = open
            this.dispatchRemoteMicStateUpdate(coreUser, open)
            this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers())
        }
    }


    audioRouteChange(audioRoute: ZegoAudioRoute): void {
        zloginfo(`${TAG} audioRouteChange: ${audioRoute}`)

        this.audioVideoService.notifyAudioRouteChange(audioRoute)
    }


    remoteSoundLevelUpdate(soundLevelInfos: Map<string, ZegoSoundLevelInfo>): void {
        // zloginfo(`${TAG} remoteSoundLevelUpdate: ${JSON.stringify(soundLevelInfos)}`)

        for (const [streamID, soundLevel] of Object.entries(soundLevelInfos)) {
            const coreUser = this.getUserFromStreamID(streamID)
            if (coreUser) {
                coreUser.soundLevel = soundLevel ?? 0
                this.dispatchSoundLevelUpdate(coreUser.userID, coreUser.soundLevel)
            }
        }
    }


    capturedSoundLevelInfoUpdate(soundLevelInfo: ZegoSoundLevelInfo): void {
        // zloginfo(`${TAG} capturedSoundLevelInfoUpdate: ${soundLevelInfo}`)

        if (this.localUser != null) {
            this.localUser.soundLevel = soundLevelInfo.soundLevel;
            this.dispatchSoundLevelUpdate(this.localUser.userID, this.localUser.soundLevel);
        }
    }

    IMRecvCustomCommand(roomID: string, fromUser: ZegoUser, command: string): void {
        zloginfo(`${TAG} IMRecvCustomCommand: ${roomID} ${fromUser} ${command}`)

        this.roomService.notifyIMRecvCustomCommand(roomID, fromUser, command);

        const localUser = this.getLocalCoreUser()
        if (!localUser) {
            zlogerror(`${TAG} [IMRecvCustomCommand] wrong! localUser is null!`)
            return
        }

        try {
            const commandObj = JSON.parse(command);
            if ("zego_remove_user" in commandObj) {
                const userList = commandObj.zego_remove_user as string[]
                for (const userID of userList) {
                    if (userID === localUser.userID) {
                        this.notifyRemovedFromRoomCommand()
                        this.leaveRoom()
                        break
                    }
                }

            } else if ("zego_turn_camera_on" in commandObj) {

                const userList = commandObj.zego_turn_camera_on as string[]
                for (const userID of userList) {
                    if (userID === localUser.userID && !this.isCameraOn(userID)) {
                        this.notifyTurnCameraOnCommand({ userID: fromUser.userID, userName: fromUser.userName })
                        break
                    }
                }

            } else if ("zego_turn_microphone_on" in commandObj) {
                const userList = commandObj.zego_turn_microphone_on as string[]
                for (const userID of userList) {
                    if (userID === localUser.userID && !this.isMicrophoneOn(userID)) {
                        this.notifyTurnMicrophoneOnCommand({ userID: fromUser.userID, userName: fromUser.userName })
                        break
                    }
                }

            } else if ("zego_turn_camera_off" in commandObj) {
                const userList = commandObj.zego_turn_camera_off as string[]
                for (const userID of userList) {
                    if (userID === localUser.userID) {
                        this.turnCameraOn(userID, false)
                        this.notifyTurnCameraOffCommand({ userID: fromUser.userID, userName: fromUser.userName })
                        break
                    }
                }
            } else if ("zego_turn_microphone_off" in commandObj) {
                const userList = commandObj.zego_turn_microphone_off as string[]
                for (const userID of userList) {
                    if (userID === localUser.userID) {
                        this.turnMicrophoneOn(userID, false)
                        this.notifyTurnMicrophoneOffCommand({ userID: fromUser.userID, userName: fromUser.userName })
                        break
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing command:', e);
        }
    }
    IMRecvBroadcastMessage(roomID: string, messageList: ZegoBroadcastMessageInfo[]): void {
        zloginfo(`${TAG} IMRecvBroadcastMessage: ${roomID} ${messageList}`)

        const list: ZegoInRoomMessage[] = messageList.map((zegoBroadcastMessageInfo) => {
            const { userID, userName } = zegoBroadcastMessageInfo.fromUser;
            const user: ZegoUIKitUser = { userID, userName };

            return {
                message: zegoBroadcastMessageInfo.message,
                messageID: zegoBroadcastMessageInfo.messageID,
                timestamp: zegoBroadcastMessageInfo.sendTime,
                state: ZegoInRoomMessageState.Idle,
                user,
            };
        });

        this.inRoomMessages.push(...list);
        this.dispatchBroadcastMessages(roomID, list);
    }

    roomStreamExtraInfoUpdate(roomID: string, streamList: ZegoStream[]): void {
        zloginfo(`${TAG} roomStreamExtraInfoUpdate: ${roomID} ${JSON.stringify(streamList)}`)

        for (const zegoStream of streamList) {
            let extraInfoObj = {}
            if (zegoStream.extraInfo) {
                try {
                    extraInfoObj = JSON.parse(zegoStream.extraInfo);
                } catch (e) {
                    zlogerror('Error parsing extraInfo or updating user state:', e);
                }
            }
            let coreUser = this.getUserByUserID(zegoStream.user.userID);
            if (!coreUser) {
                coreUser = new UIKitCoreUser(zegoStream.user.userID, zegoStream.user.userName);
            }

            if ('isCameraOn' in extraInfoObj) {
                const isCameraOn = extraInfoObj.isCameraOn as boolean;
                if (coreUser.isCameraOn !== isCameraOn) {
                    coreUser.isCameraOn = isCameraOn;
                    this.dispatchRemoteCameraStateUpdate(coreUser, coreUser.isCameraOn);
                    this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers());
                }
            }

            if ('isMicrophoneOn' in extraInfoObj) {
                const isMicrophoneOn = extraInfoObj.isMicrophoneOn as boolean;
                if (coreUser.isMicrophoneOn !== isMicrophoneOn) {
                    coreUser.isMicrophoneOn = isMicrophoneOn;
                    this.dispatchRemoteMicStateUpdate(coreUser, coreUser.isMicrophoneOn);
                    this.dispatchRoomUserCountOrPropertyChanged(this.getAllUsers());
                }
            }

        }
    }

    roomExtraInfoUpdate(roomID: string, roomExtraInfoList: ZegoRoomExtraInfo[]): void {
        zloginfo(`${TAG} roomExtraInfoUpdate: ${roomID} ${JSON.stringify(roomExtraInfoList)}`)

        for (const roomExtraInfo of roomExtraInfoList) {
            const oldRoomExtraInfo = this.roomExtraInfoMap.get(roomExtraInfo.key);
            if (oldRoomExtraInfo != null) {
                if (roomExtraInfo.updateUser.userID === this.getLocalCoreUser()!.userID) {
                    continue;
                }
                if (roomExtraInfo.updateTime < oldRoomExtraInfo.updateTime) {
                    continue;
                }
            }
            this.roomExtraInfoMap.set(roomExtraInfo.key, roomExtraInfo);
            if ("extra_info" === roomExtraInfo.key) {
                const updateKeys: string[] = []

                const oldProperties = this.roomExtraInfoValueToMap(oldRoomExtraInfo);
                const currentProperties = this.roomExtraInfoValueToMap(roomExtraInfo);
                for (const key in currentProperties) {
                    const value = currentProperties[key]
                    const oldValue = oldProperties[key]
                    if (value === oldValue) {
                        continue
                    }
                    updateKeys.push(key)
                }

                for (const updateKey of updateKeys) {
                    this.dispatchRoomPropertyUpdated(updateKey, oldProperties[updateKey],
                        currentProperties[updateKey]);
                }
                if (updateKeys.length > 0) {
                    this.dispatchRoomPropertiesFullUpdated(updateKeys, oldProperties, currentProperties);
                }
            }
        }
    }

    roomTokenWillExpire(roomID: string, remainTimeInSecond: number): void {
        zloginfo(`${TAG} roomTokenWillExpire: ${roomID} ${remainTimeInSecond}`)

        this.notifyTokenWillExpire(remainTimeInSecond);
    }

}
