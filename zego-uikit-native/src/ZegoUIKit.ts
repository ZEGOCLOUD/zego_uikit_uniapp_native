import {
    ZegoMixerTask,
    ZegoOrientation,
    ZegoPlayerConfig,
    ZegoPublishChannel,
} from "./services/express/ZegoExpressUniApp";

import { ExpressEngineProxy } from "./services/express/ExpressEngineProxy";

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
    ZegoMeRemovedFromRoomListener,
    ZegoMicrophoneStateChangeListener,
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
} from "./services/defines";


import UIKitCore from "./services/internal/UIKitCore";

import {
    ZegoMixerStartCallback,
    ZegoMixerStopCallback
} from "./services/defines";

import { ExpressEngineEventHandler } from "./services/express/ExpressEngineEventHandler";
import { makeTag, zloginfo, zlogwarning } from "./utils";
import { ZegoUIKitSignaling } from "./services";

const TAG = makeTag('ZegoUIKit')

export default class ZegoUIKit {

    public static init(appID: number, appSign: string, scenario: ZegoUIKitScenario): Promise<boolean> {
        zloginfo(TAG, '=========== init call ===========')
        return UIKitCore.getInstance().init(appID, appSign, scenario);
    }

    public static unInit() {
        zlogwarning(TAG, '=========== unInit call ===========')
        return UIKitCore.getInstance().unInit()
    }

    public static destroy() {
        zlogwarning(TAG, '=========== destroy call ============')
        UIKitCore.deleteInstance()
    }

    public static useFrontFacingCamera(isFrontFacing: boolean): void {
        UIKitCore.getInstance().useFrontFacingCamera(isFrontFacing);
    }

    public static isMicrophoneOn(userID?: string): boolean {
        return UIKitCore.getInstance().isMicrophoneOn(userID);
    }

    public static isCameraOn(userID?: string): boolean {
        return UIKitCore.getInstance().isCameraOn(userID);
    }

    public static setAudioOutputToSpeaker(enable: boolean): void {
        UIKitCore.getInstance().setAudioOutputToSpeaker(enable);
    }

    /**
     * 打开或关闭指定用户的麦克风, 如果是自己的, 会触发推流或停流
     * @param userID 
     * @param on 
     */
    public static turnMicrophoneOn(userID: string, on: boolean): void {
        UIKitCore.getInstance().turnMicrophoneOn(userID, on);
    }

    /**
     * 打开或关闭指定用户的摄像头, 如果是自己的, 会触发推流或停流
     * @param userID 
     * @param on 
     */
    public static turnCameraOn(userID: string, on: boolean): void {
        UIKitCore.getInstance().turnCameraOn(userID, on);
    }

    public static addMicrophoneStateListener(listenerID: string, listener: ZegoMicrophoneStateChangeListener): void {
        UIKitCore.getInstance().addMicrophoneStateListener(listenerID, listener);
    }

    public static removeMicrophoneStateListener(listenerID: string): void {
        UIKitCore.getInstance().removeMicrophoneStateListener(listenerID);
    }

    public static addCameraStateListener(listenerID: string, listener: ZegoCameraStateChangeListener): void {
        UIKitCore.getInstance().addCameraStateListener(listenerID, listener);
    }

    public static removeCameraStateListener(listenerID: string): void {
        UIKitCore.getInstance().removeCameraStateListener(listenerID);
    }

    public static addAudioOutputDeviceChangedListener(listenerID: string, listener: ZegoAudioOutputDeviceChangedListener): void {
        UIKitCore.getInstance().addAudioOutputDeviceChangedListener(listenerID, listener);
    }

    public static removeAudioOutputDeviceChangedListener(listenerID: string): void {
        UIKitCore.getInstance().removeAudioOutputDeviceChangedListener(listenerID);
    }

    public static setAppOrientation(orientation: ZegoOrientation): void {
        ExpressEngineProxy.setAppOrientation(orientation);
    }

    public static addSoundLevelUpdatedListener(listenerID: string, listener: ZegoSoundLevelUpdateListener): void {
        UIKitCore.getInstance().addSoundLevelUpdatedListener(listenerID, listener);
    }

    public static removeSoundLevelUpdatedListener(listenerID: string): void {
        UIKitCore.getInstance().removeSoundLevelUpdatedListener(listenerID);
    }

    public static joinRoom(roomID: string, markAsLargeRoom: boolean = false, callback?: ZegoUIKitCallback): void {
        UIKitCore.getInstance().joinRoom(roomID, markAsLargeRoom, callback);
    }



    public static leaveRoom(): Promise<void> {
        return UIKitCore.getInstance().leaveRoom();
    }

    public static getRoom(): ZegoUIKitRoom {
        return UIKitCore.getInstance().getRoom();
    }

    public static setRoomProperty(key: string, value: string): void {
        UIKitCore.getInstance().setRoomProperty(key, value);
    }

    public static updateRoomProperties(newProperties: { [key: string]: string }): void {
        UIKitCore.getInstance().updateRoomProperties(newProperties);
    }

    public static getRoomProperties(): { [key: string]: string } {
        return UIKitCore.getInstance().getRoomProperties();
    }



    public static addRoomPropertyUpdateListener(listenerID: string, listener: ZegoRoomPropertyUpdateListener): void {
        UIKitCore.getInstance().addRoomPropertyUpdateListener(listenerID, listener);
    }

    public static removeRoomPropertyUpdateListener(listenerID: string): void {
        UIKitCore.getInstance().removeRoomPropertyUpdateListener(listenerID);
    }

    public static login(userID: string, userName: string, callback?: ZegoUIKitCallback): void {
        UIKitCore.getInstance().login(userID, userName, callback);
    }

    public static logout(): void {
        UIKitCore.getInstance().logout();
    }

    public static getUser(userID: string): ZegoUIKitUser | null {
        return UIKitCore.getInstance().getUser(userID);
    }

    public static getAllUsers(): ZegoUIKitUser[] {
        return UIKitCore.getInstance().getAllUsers();
    }

    public static isLocalUser(userID: string): boolean {
        return UIKitCore.getInstance().isLocalUser(userID)
    }

    public static isUserExist(userID: string): boolean {
        return UIKitCore.getInstance().isUserExist(userID)
    }

    public static isInviter(userID: string): boolean {
        return ZegoUIKitSignaling.getInstance().isInviter(userID)
    }

    public static addUserUpdateListener(listenerID: string, listener: ZegoUserUpdateListener): void {
        UIKitCore.getInstance().addUserUpdateListener(listenerID, listener);
    }

    public static removeUserUpdateListener(listenerID: string): void {
        UIKitCore.getInstance().removeUserUpdateListener(listenerID);
    }

    public static addOnOnlySelfInRoomListener(listenerID: string, listener: ZegoOnlySelfInRoomListener): void {
        UIKitCore.getInstance().addOnOnlySelfInRoomListener(listenerID, listener);
    }

    public static removeOnOnlySelfInRoomListener(listenerID: string): void {
        UIKitCore.getInstance().removeOnOnlySelfInRoomListener(listenerID);
    }

    public static addAudioVideoUpdateListener(listenerID: string, listener: ZegoAudioVideoUpdateListener): void {
        UIKitCore.getInstance().addAudioVideoUpdateListener(listenerID, listener);
    }

    public static removeAudioVideoUpdateListener(listenerID: string): void {
        UIKitCore.getInstance().removeAudioVideoUpdateListener(listenerID);
    }

    public static getVersion(): string {
        return UIKitCore.getInstance().getVersion();
    }

    public static getInRoomMessages(): ZegoInRoomMessage[] {
        return UIKitCore.getInstance().getInRoomMessages();
    }


    public static sendInRoomMessage(message: string, listener?: ZegoInRoomMessageSendStateListener): void {
        UIKitCore.getInstance().sendInRoomMessage(message, listener);
    }

    public static addInRoomMessageReceivedListener(listenerID: string, listener: ZegoInRoomMessageListener): void {
        UIKitCore.getInstance().addInRoomMessageReceivedListener(listenerID, listener);
    }

    public static removeInRoomMessageReceivedListener(listenerID: string): void {
        UIKitCore.getInstance().removeInRoomMessageReceivedListener(listenerID);
    }

    public static getLocalUser(): ZegoUIKitUser | null {
        return UIKitCore.getInstance().getLocalUser();
    }


    // public static IZegoUIKitSignaling getSignalingPlugin() {
    //     uiKitCore = UIKitCore.getInstance();
    //     return uiKitCore.getSignalingPlugin();
    // }


    public static startPlayingAllAudioVideo(): void {
        UIKitCore.getInstance().startPlayingAllAudioVideo();
    }

    public static stopPlayingAllAudioVideo(): void {
        UIKitCore.getInstance().stopPlayingAllAudioVideo();
    }

    public static sendInRoomCommand(command: string, toUserList: string[], callback: ZegoSendInRoomCommandCallback): void {
        UIKitCore.getInstance().sendInRoomCommand(command, toUserList, callback);
    }

    public static addInRoomCommandListener(listenerID: string, listener: ZegoInRoomCommandListener): void {
        UIKitCore.getInstance().addInRoomCommandListener(listenerID, listener);
    }

    public static removeInRoomCommandListener(listenerID: string): void {
        UIKitCore.getInstance().removeInRoomCommandListener(listenerID);
    }

    public static removeUserFromRoom(userIDs: string[]): void {
        UIKitCore.getInstance().removeUserFromRoom(userIDs);
    }

    public static addOnMeRemovedFromRoomListener(listenerID: string, listener: ZegoMeRemovedFromRoomListener): void {
        UIKitCore.getInstance().addOnMeRemovedFromRoomListener(listenerID, listener);
    }

    public static removeOnMeRemovedFromRoomListener(listenerID: string): void {
        UIKitCore.getInstance().removeOnMeRemovedFromRoomListener(listenerID);
    }

    public static addRoomStateChangedListener(listenerID: string, listener: RoomStateChangedListener): void {
        UIKitCore.getInstance().addRoomStateUpdatedListener(listenerID, listener);
    }

    public static removeRoomStateChangedListener(listenerID: string): void {
        UIKitCore.getInstance().removeRoomStateUpdatedListener(listenerID);
    }

    public static addUserCountOrPropertyChangedListener(listenerID: string, listener: ZegoUserCountOrPropertyChangedListener): void {
        UIKitCore.getInstance().addUserCountOrPropertyChangedListener(listenerID, listener);
    }

    public static removeUserCountOrPropertyChangedListener(listenerID: string): void {
        UIKitCore.getInstance().removeUserCountOrPropertyChangedListener(listenerID);
    }

    public static addTurnOnYourCameraRequestListener(listenerID: string, listener: ZegoTurnOnYourCameraRequestListener): void {
        UIKitCore.getInstance().addTurnOnYourCameraRequestListener(listenerID, listener);
    }

    public static removeTurnOnYourCameraRequestListener(listenerID: string): void {
        UIKitCore.getInstance().removeTurnOnYourCameraRequestListener(listenerID);
    }

    public static addTurnOnYourMicrophoneRequestListener(listenerID: string, listener: ZegoTurnOnYourMicrophoneRequestListener): void {
        UIKitCore.getInstance().addTurnOnYourMicrophoneRequestListener(listenerID, listener);
    }

    public static removeTurnOnYourMicrophoneRequestListener(listenerID: string): void {
        UIKitCore.getInstance().removeTurnOnYourMicrophoneRequestListener(listenerID);
    }

    public static setAudioVideoResourceMode(mode: ZegoAudioVideoResourceMode): void {
        UIKitCore.getInstance().setAudioVideoResourceMode(mode);
    }

    public static setPresetVideoConfig(preset: ZegoPresetResolution): void {
        UIKitCore.getInstance().setPresetVideoConfig(preset);
    }


    public static mutePlayStreamAudio(streamID: string, mute: boolean): void {
        UIKitCore.getInstance().mutePlayStreamAudio(streamID, mute);
    }

    public static mutePlayStreamVideo(streamID: string, mute: boolean): void {
        UIKitCore.getInstance().mutePlayStreamVideo(streamID, mute);
    }

    public static startMixerTask(task: ZegoMixerTask, callback: ZegoMixerStartCallback): void {
        UIKitCore.getInstance().startMixerTask(task, callback);
    }

    public static stopMixerTask(task: ZegoMixerTask, callback: ZegoMixerStopCallback): void {
        UIKitCore.getInstance().stopMixerTask(task, callback);
    }

    public static addEventHandler(eventHandler: ExpressEngineEventHandler, autoDelete: boolean = true): void {
        UIKitCore.getInstance().addEventHandler(eventHandler, autoDelete);
    }

    public static removeEventHandler(eventHandler: ExpressEngineEventHandler): void {
        UIKitCore.getInstance().removeEventHandler(eventHandler);
    }

    public static startPlayingStream(streamID: string, config?: ZegoPlayerConfig): void {
        UIKitCore.getInstance().startPlayingStream(streamID, config);
    }

    public static stopPlayingStream(streamID: string): void {
        UIKitCore.getInstance().stopPlayingStream(streamID);
    }

    public static startPublishingStream(streamID: string): void {
        UIKitCore.getInstance().startPublishingStream(streamID);
    }

    public static stopPublishingStream(): void {
        UIKitCore.getInstance().stopPublishingStream();
    }

    public static startPreview(channel?: ZegoPublishChannel): void {
        UIKitCore.getInstance().startPreview(channel);
    }

    public static stopPreview(): void {
        UIKitCore.getInstance().stopPreview();
    }

    /**
     * 打开或关闭自己的麦克风, 不会推流
     * @param open 
     */
    public static openMicrophone(open: boolean): void {
        UIKitCore.getInstance().openMicrophone(open);
    }

    /**
     * 打开或关闭自己的摄像头, 不会推流
     * @param open 
     */
    public static openCamera(open: boolean): void {
        UIKitCore.getInstance().openCamera(open);
    }

    public static renewToken(token: string): void {
        UIKitCore.getInstance().renewToken(token);
    }

    public static setTokenWillExpireListener(listener: ZegoUIKitTokenExpireListener): void {
        UIKitCore.getInstance().setTokenWillExpireListener(listener);
    }
}

