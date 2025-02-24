

import { ZegoEngineState, ZegoRoomState, ZegoUpdateType, ZegoUser, ZegoStream, ZegoRoomExtraInfo, ZegoPublisherState, ZegoPublishStreamQuality, ZegoPublishChannel, ZegoStreamRelayCDNInfo, ZegoPlayerState, ZegoPlayStreamQuality, ZegoPlayerMediaEvent, ZegoSoundLevelInfo, ZegoDeviceExceptionType, ZegoDeviceType, ZegoRemoteDeviceState, ZegoAudioRoute, ZegoBroadcastMessageInfo, ZegoBarrageMessageInfo, ZegoDataRecordState, ZegoDataRecordConfig, ZegoDataRecordProgress, ZegoRoomStateChangedReason } from "./ZegoExpressUniApp";
import { ZegoEventListener } from "./ZegoExpressUniApp";
import { makeTag, zlogerror, zloginfo } from "../../utils";

const TAG = makeTag('SimpleExpressEventHandler')

export class SimpleExpressEventHandler implements ZegoEventListener {
    // 给个默认实现

    private handlerList: ZegoEventListener[] = [];

    constructor() {
        // 对外隐藏 handlerList
        Object.defineProperty(this, 'handlerList', {
            enumerable: false
        })
    }

    addHandler(handler: ZegoEventListener): void {
        if (handler) {
            this.handlerList.push(handler);
        }
    }

    removeHandler(handler: ZegoEventListener): void {
        if (handler) {
            const index = this.handlerList.indexOf(handler);
            if (index > -1) {
                this.handlerList.splice(index, 1);
            }
        }
    }

    removeEventHandlerList(list: ZegoEventListener[]): void {
        this.handlerList = this.handlerList.filter((handler) => !list.includes(handler));
    }

    removeAllEventHandlers() {
        this.handlerList.length = 0
    }

    apiCalledResult = (errorCode: number, funcName: string, info: string) => {
        // if (errorCode === 0) {
        //     zloginfo(`${TAG} apiCalledResult: ${funcName} ${errorCode} ${info}`)
        // } else {
        //     zlogerror(`${TAG} apiCalledResult: ${funcName} ${errorCode} ${info}`)
        // }
        this.handlerList.forEach(handler => handler.apiCalledResult?.(errorCode, funcName, info));
    };

    engineStateUpdate = (state: ZegoEngineState) => {
        zloginfo(`${TAG} engineStateUpdate: state=${state}`)
        this.handlerList.forEach(handler => handler.engineStateUpdate?.(state));
    };

    roomStateUpdate = (roomID: string, state: ZegoRoomState, errorCode: number, extendedData: string) => {
        zloginfo(`${TAG} roomStateUpdate: roomID=${roomID}, state=${state}, errorCode=${errorCode}, ${JSON.stringify(extendedData)}`)
        this.handlerList.forEach(handler => handler.roomStateUpdate?.(roomID, state, errorCode, extendedData));
    };

    roomStateChanged = (roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, extendedData: string) => {
        zloginfo(`${TAG} roomStateChanged: roomID=${roomID}, reason=${reason}, errorCode=${errorCode}, ${JSON.stringify(extendedData)}`)
        this.handlerList.forEach(handler => handler.roomStateChanged?.(roomID, reason, errorCode, extendedData));
    }

    roomUserUpdate = (roomID: string, updateType: ZegoUpdateType, userList: ZegoUser[]) => {
        zloginfo(`${TAG} roomUserUpdate: roomID=${roomID}, updateType=${updateType}, userList=${JSON.stringify(userList)}`)
        this.handlerList.forEach(handler => handler.roomUserUpdate?.(roomID, updateType, userList));
    };

    roomOnlineUserCountUpdate = (roomID: string, count: number) => {
        zloginfo(`${TAG} roomOnlineUserCountUpdate: ${roomID} ${count}`)
        this.handlerList.forEach(handler => handler.roomOnlineUserCountUpdate?.(roomID, count));
    };

    roomStreamUpdate = (roomID: string, updateType: ZegoUpdateType, streamList: ZegoStream[], extendedData: string) => {
        zloginfo(`${TAG} roomStreamUpdate: roomID=${roomID}, updateType=${updateType}, streamList=${JSON.stringify(streamList)}, ${JSON.stringify(extendedData)}`)
        this.handlerList.forEach(handler => handler.roomStreamUpdate?.(roomID, updateType, streamList, extendedData));
    };

    roomStreamExtraInfoUpdate = (roomID: string, streamList: ZegoStream[]) => {
        // zloginfo(`${TAG} roomStreamExtraInfoUpdate: ${roomID} ${JSON.stringify(streamList)}`)
        this.handlerList.forEach(handler => handler.roomStreamExtraInfoUpdate?.(roomID, streamList));
    };

    roomExtraInfoUpdate = (roomID: string, roomExtraInfoList: ZegoRoomExtraInfo[]) => {
        zloginfo(`${TAG} roomExtraInfoUpdate: ${roomID} ${roomExtraInfoList}`)
        this.handlerList.forEach(handler => handler.roomExtraInfoUpdate?.(roomID, roomExtraInfoList));
    };

    roomTokenWillExpire = (roomID: string, remainTimeInSecond: number) => {
        zloginfo(`${TAG} roomTokenWillExpire: ${roomID} ${remainTimeInSecond}`)
        this.handlerList.forEach(handler => handler.roomTokenWillExpire?.(roomID, remainTimeInSecond));
    };

    publisherStateUpdate = (streamID: string, state: ZegoPublisherState, errorCode: number, extendedData: string) => {
        zloginfo(`${TAG} publisherStateUpdate: streamID=${streamID}, state=${state}, errorCode=${errorCode}, extendedData=${JSON.stringify(extendedData)}`)
        this.handlerList.forEach(handler => handler.publisherStateUpdate?.(streamID, state, errorCode, extendedData));
    };

    publisherQualityUpdate = (streamID: string, quality: ZegoPublishStreamQuality) => {
        // zloginfo(`${TAG} publisherQualityUpdate: ${streamID} ${JSON.stringify(quality)}`)
        this.handlerList.forEach(handler => handler.publisherQualityUpdate?.(streamID, quality));
    };

    publisherCapturedAudioFirstFrame = () => {
        zloginfo(`${TAG} publisherCapturedAudioFirstFrame`)
        this.handlerList.forEach(handler => handler.publisherCapturedAudioFirstFrame?.());
    };

    publisherCapturedVideoFirstFrame = (channel: ZegoPublishChannel) => {
        zloginfo(`${TAG} publisherCapturedVideoFirstFrame ${channel}`)
        this.handlerList.forEach(handler => handler.publisherCapturedVideoFirstFrame?.(channel));
    };

    publisherRenderVideoFirstFrame = (channel: ZegoPublishChannel) => {
        zloginfo(`${TAG} publisherRenderVideoFirstFrame ${channel}`)
        this.handlerList.forEach(handler => handler.publisherRenderVideoFirstFrame?.(channel));
    };

    publisherVideoSizeChanged = (width: number, height: number, channel: ZegoPublishChannel) => {
        zloginfo(`${TAG} publisherVideoSizeChanged ${width} ${height} ${channel}`)
        this.handlerList.forEach(handler => handler.publisherVideoSizeChanged?.(width, height, channel));
    };

    publisherRelayCDNStateUpdate = (streamID: string, infoList: ZegoStreamRelayCDNInfo[]) => {
        zloginfo(`${TAG} publisherRelayCDNStateUpdate ${streamID} ${infoList}`)
        this.handlerList.forEach(handler => handler.publisherRelayCDNStateUpdate?.(streamID, infoList));
    };

    playerStateUpdate = (streamID: string, state: ZegoPlayerState, errorCode: number, extendedData: string) => {
        zloginfo(`${TAG} playerStateUpdate ${streamID} ${state} ${errorCode} ${JSON.stringify(extendedData)}`)
        this.handlerList.forEach(handler => handler.playerStateUpdate?.(streamID, state, errorCode, extendedData));
    };

    playerQualityUpdate = (streamID: string, quality: ZegoPlayStreamQuality) => {
        // zloginfo(`${TAG} playerQualityUpdate ${streamID} ${JSON.stringify(quality)}`)
        this.handlerList.forEach(handler => handler.playerQualityUpdate?.(streamID, quality));
    };

    playerMediaEvent = (streamID: string, event: ZegoPlayerMediaEvent) => {
        zloginfo(`${TAG} playerMediaEvent ${streamID} ${event}`)
        this.handlerList.forEach(handler => handler.playerMediaEvent?.(streamID, event));
    };

    playerRecvAudioFirstFrame = (streamID: string) => {
        zloginfo(`${TAG} playerRecvAudioFirstFrame ${streamID}`)
        this.handlerList.forEach(handler => handler.playerRecvAudioFirstFrame?.(streamID));
    };

    playerRecvVideoFirstFrame = (streamID: string) => {
        zloginfo(`${TAG} playerRecvVideoFirstFrame ${streamID}`)
        this.handlerList.forEach(handler => handler.playerRecvVideoFirstFrame?.(streamID));
    };

    playerRenderVideoFirstFrame = (streamID: string) => {
        zloginfo(`${TAG} playerRenderVideoFirstFrame ${streamID}`)
        this.handlerList.forEach(handler => handler.playerRenderVideoFirstFrame?.(streamID));
    };

    playerVideoSizeChanged = (streamID: string, width: number, height: number) => {
        zloginfo(`${TAG} playerVideoSizeChanged ${streamID} ${width} ${height}`)
        this.handlerList.forEach(handler => handler.playerVideoSizeChanged?.(streamID, width, height));
    };

    mixerRelayCDNStateUpdate = (taskID: string, infoList: ZegoStreamRelayCDNInfo[]) => {
        zloginfo(`${TAG} mixerRelayCDNStateUpdate ${taskID} ${infoList}`)
        this.handlerList.forEach(handler => handler.mixerRelayCDNStateUpdate?.(taskID, infoList));
    };

    mixerSoundLevelUpdate = (soundLevels: Map<number, number>) => {
        zloginfo(`${TAG} mixerSoundLevelUpdate ${soundLevels}`)
        this.handlerList.forEach(handler => handler.mixerSoundLevelUpdate?.(soundLevels));
    };

    autoMixerSoundLevelUpdate = (soundLevels: Map<string, number>) => {
        zloginfo(`${TAG} autoMixerSoundLevelUpdate ${soundLevels}`)
        this.handlerList.forEach(handler => handler.autoMixerSoundLevelUpdate?.(soundLevels));
    };

    capturedSoundLevelInfoUpdate = (soundLevelInfo: ZegoSoundLevelInfo) => {
        // zloginfo(`${TAG} capturedSoundLevelInfoUpdate ${soundLevelInfo}`)
        this.handlerList.forEach(handler => handler.capturedSoundLevelInfoUpdate?.(soundLevelInfo));
    };

    remoteSoundLevelUpdate = (soundLevelInfos: Map<string, ZegoSoundLevelInfo>) => {
        // zloginfo(`${TAG} remoteSoundLevelUpdate ${soundLevelInfos}`)
        this.handlerList.forEach(handler => handler.remoteSoundLevelUpdate?.(soundLevelInfos));
    };

    localDeviceExceptionOccurred = (exceptionType: ZegoDeviceExceptionType, deviceType: ZegoDeviceType, deviceID: string) => {
        zloginfo(`${TAG} localDeviceExceptionOccurred ${exceptionType} ${deviceType} ${deviceID}`)
        this.handlerList.forEach(handler => handler.localDeviceExceptionOccurred?.(exceptionType, deviceType, deviceID));
    };

    remoteCameraStateUpdate = (streamID: string, state: ZegoRemoteDeviceState) => {
        zloginfo(`${TAG} remoteCameraStateUpdate ${streamID} ${state}`)
        this.handlerList.forEach(handler => handler.remoteCameraStateUpdate?.(streamID, state));
    };

    remoteMicStateUpdate = (streamID: string, state: ZegoRemoteDeviceState) => {
        zloginfo(`${TAG} remoteMicStateUpdate ${streamID} ${state}`)
        this.handlerList.forEach(handler => handler.remoteMicStateUpdate?.(streamID, state));
    };

    remoteSpeakerStateUpdate = (streamID: string, state: ZegoRemoteDeviceState) => {
        zloginfo(`${TAG} remoteSpeakerStateUpdate ${streamID} ${state}`)
        this.handlerList.forEach(handler => handler.remoteSpeakerStateUpdate?.(streamID, state));
    };

    audioRouteChange = (audioRoute: ZegoAudioRoute) => {
        zloginfo(`${TAG} audioRouteChange ${audioRoute}`)
        this.handlerList.forEach(handler => handler.audioRouteChange?.(audioRoute));
    };

    IMRecvBroadcastMessage = (roomID: string, messageList: ZegoBroadcastMessageInfo[]) => {
        zloginfo(`${TAG} IMRecvBroadcastMessage ${roomID} ${messageList}`)
        this.handlerList.forEach(handler => handler.IMRecvBroadcastMessage?.(roomID, messageList));
    };

    IMRecvBarrageMessage = (roomID: string, messageList: ZegoBarrageMessageInfo[]) => {
        zloginfo(`${TAG} IMRecvBarrageMessage ${roomID} ${messageList}`)
        this.handlerList.forEach(handler => handler.IMRecvBarrageMessage?.(roomID, messageList));
    };

    IMRecvCustomCommand = (roomID: string, fromUser: ZegoUser, command: string) => {
        zloginfo(`${TAG} IMRecvCustomCommand ${roomID} ${fromUser} ${command}`)
        this.handlerList.forEach(handler => handler.IMRecvCustomCommand?.(roomID, fromUser, command));
    };

    capturedDataRecordStateUpdate = (state: ZegoDataRecordState, errorCode: number, config: ZegoDataRecordConfig, channel: ZegoPublishChannel) => {
        zloginfo(`${TAG} capturedDataRecordStateUpdate ${state} ${errorCode} ${config} ${channel}`)
        this.handlerList.forEach(handler => handler.capturedDataRecordStateUpdate?.(state, errorCode, config, channel));
    };

    capturedDataRecordProgressUpdate = (progress: ZegoDataRecordProgress, config: ZegoDataRecordConfig, channel: ZegoPublishChannel) => {
        zloginfo(`${TAG} capturedDataRecordProgressUpdate ${progress} ${config} ${channel}`)
        this.handlerList.forEach(handler => handler.capturedDataRecordProgressUpdate?.(progress, config, channel));
    };


}
