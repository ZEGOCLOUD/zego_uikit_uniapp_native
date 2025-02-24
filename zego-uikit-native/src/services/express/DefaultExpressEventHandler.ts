import { ExpressEngineEventHandler } from "./ExpressEngineEventHandler";
import { ZegoAudioRoute, ZegoBarrageMessageInfo, ZegoBroadcastMessageInfo, ZegoDataRecordConfig, ZegoDataRecordProgress, ZegoDataRecordState, ZegoDeviceExceptionType, ZegoDeviceType, ZegoEngineState, ZegoPlayerMediaEvent, ZegoPlayerState, ZegoPlayStreamQuality, ZegoPublishChannel, ZegoPublisherState, ZegoPublishStreamQuality, ZegoRemoteDeviceState, ZegoRoomExtraInfo, ZegoRoomState, ZegoRoomStateChangedReason, ZegoSoundLevelInfo, ZegoStream, ZegoStreamRelayCDNInfo, ZegoUpdateType, ZegoUser } from "./ZegoExpressUniApp";

/**
 * 提供 ExpressEngineEventHandler 的默认实现 
 */
export class DefaultExpressEventHandler implements ExpressEngineEventHandler {
    handler?: Partial<ExpressEngineEventHandler>;

    constructor(handler?: Partial<ExpressEngineEventHandler>) {
        this.handler = handler;
    }

    apiCalledResult(errorCode: number, funcName: string, info: string): void {
        this.handler?.apiCalledResult?.(errorCode, funcName, info);
    }

    onLocalCameraStateUpdate(open: boolean): void {
        this.handler?.onLocalCameraStateUpdate?.(open);
    }

    onLocalMicrophoneStateUpdate(open: boolean): void {
        this.handler?.onLocalMicrophoneStateUpdate?.(open);
    }

    engineStateUpdate(state: ZegoEngineState): void {
        this.handler?.engineStateUpdate?.(state);
    }

    roomStateUpdate(roomID: string, state: ZegoRoomState, errorCode: number, extendedData: string): void {
        this.handler?.roomStateUpdate?.(roomID, state, errorCode, extendedData);
    }

    roomStateChanged(roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, extendedData: string): void {
        this.handler?.roomStateChanged?.(roomID, reason, errorCode, extendedData);
    }

    roomUserUpdate(roomID: string, updateType: ZegoUpdateType, userList: ZegoUser[]): void {
        this.handler?.roomUserUpdate?.(roomID, updateType, userList);
    }

    roomOnlineUserCountUpdate(roomID: string, count: number): void {
        this.handler?.roomOnlineUserCountUpdate?.(roomID, count);
    }

    roomStreamUpdate(roomID: string, updateType: ZegoUpdateType, streamList: ZegoStream[], extendedData: string): void {
        this.handler?.roomStreamUpdate?.(roomID, updateType, streamList, extendedData);
    }

    roomStreamExtraInfoUpdate(roomID: string, streamList: ZegoStream[]): void {
        this.handler?.roomStreamExtraInfoUpdate?.(roomID, streamList);
    }

    roomExtraInfoUpdate(roomID: string, roomExtraInfoList: ZegoRoomExtraInfo[]): void {
        this.handler?.roomExtraInfoUpdate?.(roomID, roomExtraInfoList);
    }

    roomTokenWillExpire(roomID: string, remainTimeInSecond: number): void {
        this.handler?.roomTokenWillExpire?.(roomID, remainTimeInSecond);
    }

    publisherStateUpdate(streamID: string, state: ZegoPublisherState, errorCode: number, extendedData: string): void {
        this.handler?.publisherStateUpdate?.(streamID, state, errorCode, extendedData);
    }

    publisherQualityUpdate(streamID: string, quality: ZegoPublishStreamQuality): void {
        this.handler?.publisherQualityUpdate?.(streamID, quality);
    }

    publisherCapturedAudioFirstFrame(): void {
        this.handler?.publisherCapturedAudioFirstFrame?.();
    }

    publisherCapturedVideoFirstFrame(channel: ZegoPublishChannel): void {
        this.handler?.publisherCapturedVideoFirstFrame?.(channel);
    }

    publisherRenderVideoFirstFrame(channel: ZegoPublishChannel): void {
        this.handler?.publisherRenderVideoFirstFrame?.(channel);
    }

    publisherVideoSizeChanged(width: number, height: number, channel: ZegoPublishChannel): void {
        this.handler?.publisherVideoSizeChanged?.(width, height, channel);
    }

    publisherRelayCDNStateUpdate(streamID: string, infoList: ZegoStreamRelayCDNInfo[]): void {
        this.handler?.publisherRelayCDNStateUpdate?.(streamID, infoList);
    }

    playerStateUpdate(streamID: string, state: ZegoPlayerState, errorCode: number, extendedData: string): void {
        this.handler?.playerStateUpdate?.(streamID, state, errorCode, extendedData);
    }

    playerQualityUpdate(streamID: string, quality: ZegoPlayStreamQuality): void {
        this.handler?.playerQualityUpdate?.(streamID, quality);
    }

    playerMediaEvent(streamID: string, event: ZegoPlayerMediaEvent): void {
        this.handler?.playerMediaEvent?.(streamID, event);
    }

    playerRecvAudioFirstFrame(streamID: string): void {
        this.handler?.playerRecvAudioFirstFrame?.(streamID);
    }

    playerRecvVideoFirstFrame(streamID: string): void {
        this.handler?.playerRecvVideoFirstFrame?.(streamID);
    }

    playerRenderVideoFirstFrame(streamID: string): void {
        this.handler?.playerRenderVideoFirstFrame?.(streamID);
    }

    playerVideoSizeChanged(streamID: string, width: number, height: number): void {
        this.handler?.playerVideoSizeChanged?.(streamID, width, height);
    }

    mixerRelayCDNStateUpdate(taskID: string, infoList: ZegoStreamRelayCDNInfo[]): void {
        this.handler?.mixerRelayCDNStateUpdate?.(taskID, infoList);
    }

    mixerSoundLevelUpdate(soundLevels: Map<number, number>): void {
        this.handler?.mixerSoundLevelUpdate?.(soundLevels);
    }

    autoMixerSoundLevelUpdate(soundLevels: Map<string, number>): void {
        this.handler?.autoMixerSoundLevelUpdate?.(soundLevels);
    }

    capturedSoundLevelInfoUpdate(soundLevelInfo: ZegoSoundLevelInfo): void {
        this.handler?.capturedSoundLevelInfoUpdate?.(soundLevelInfo);
    }

    remoteSoundLevelUpdate(soundLevelInfos: Map<string, ZegoSoundLevelInfo>): void {
        this.handler?.remoteSoundLevelUpdate?.(soundLevelInfos);
    }

    localDeviceExceptionOccurred(exceptionType: ZegoDeviceExceptionType, deviceType: ZegoDeviceType, deviceID: string): void {
        this.handler?.localDeviceExceptionOccurred?.(exceptionType, deviceType, deviceID);
    }

    remoteCameraStateUpdate(streamID: string, state: ZegoRemoteDeviceState): void {
        this.handler?.remoteCameraStateUpdate?.(streamID, state);
    }

    remoteMicStateUpdate(streamID: string, state: ZegoRemoteDeviceState): void {
        this.handler?.remoteMicStateUpdate?.(streamID, state);
    }

    remoteSpeakerStateUpdate(streamID: string, state: ZegoRemoteDeviceState): void {
        this.handler?.remoteSpeakerStateUpdate?.(streamID, state);
    }

    audioRouteChange(audioRoute: ZegoAudioRoute): void {
        this.handler?.audioRouteChange?.(audioRoute);
    }

    IMRecvBroadcastMessage(roomID: string, messageList: ZegoBroadcastMessageInfo[]): void {
        this.handler?.IMRecvBroadcastMessage?.(roomID, messageList);
    }

    IMRecvBarrageMessage(roomID: string, messageList: ZegoBarrageMessageInfo[]): void {
        this.handler?.IMRecvBarrageMessage?.(roomID, messageList);
    }

    IMRecvCustomCommand(roomID: string, fromUser: ZegoUser, command: string): void {
        this.handler?.IMRecvCustomCommand?.(roomID, fromUser, command);
    }

    capturedDataRecordStateUpdate(state: ZegoDataRecordState, errorCode: number, config: ZegoDataRecordConfig, channel: ZegoPublishChannel): void {
        this.handler?.capturedDataRecordStateUpdate?.(state, errorCode, config, channel);
    }

    capturedDataRecordProgressUpdate(progress: ZegoDataRecordProgress, config: ZegoDataRecordConfig, channel: ZegoPublishChannel): void {
        this.handler?.capturedDataRecordProgressUpdate?.(progress, config, channel);
    }
}
