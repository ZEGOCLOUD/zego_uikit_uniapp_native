
import { ZegoAudioRoute, ZegoEngineConfig, ZegoEngineProfile, ZegoIMSendBarrageMessageResult, ZegoIMSendBroadcastMessageResult, ZegoIMSendCustomCommandResult, ZegoMixerStartResult, ZegoMixerStopResult, ZegoMixerTask, ZegoOrientation, ZegoPlayerConfig, ZegoPublishChannel, ZegoPublisherConfig, ZegoRoomConfig, ZegoRoomLoginResult, ZegoRoomLogoutResult, ZegoRoomSetRoomExtraInfoResult, ZegoScenario, ZegoSoundLevelConfig, ZegoUser, ZegoVideoConfig, ZegoVideoConfigPreset } from "./ZegoExpressUniApp";
import { SimpleExpressEventHandler } from "./SimpleExpressEventHandler";
import { ZegoEventListener } from "./ZegoExpressUniApp";
import { makeTag, zloginfo } from "../../utils";
// 指定这个 App版本方便做语法提示
// import ZegoExpressEngine from "@/uni_modules/zego-ZegoExpressUniApp-JS/lib/ZegoExpressEngineApp";
import ZegoExpressEngine from "./ZegoExpressUniApp";

const TAG = makeTag('ExpressEngineProxy') 

export class ExpressEngineProxy {

    private static expressEventHandler?: SimpleExpressEventHandler | null;

    public static async createEngine(appID: number, appSign: string, scenario: ZegoScenario, config?: ZegoEngineConfig) {
        const profile: ZegoEngineProfile = {
            appID,
            appSign,
            scenario,
        };
        this.expressEventHandler = new SimpleExpressEventHandler();
        if (config) {
            await ZegoExpressEngine.setEngineConfig(config);
        }
        const engine = await ZegoExpressEngine.createEngineWithProfile(profile);

        zloginfo(TAG, `createEngine engine=${!!engine}, version=${(await ZegoExpressEngine.getVersion())}`)

        for (let key of Object.keys(this.expressEventHandler)) {
            const evt = key as unknown as keyof ZegoEventListener
            engine.on(evt, this.expressEventHandler[evt])
        }
    }

    public static startPlayingStream(streamID: string, config?: ZegoPlayerConfig) {
        zloginfo(TAG, 'startPlayingStream', streamID)
        return ZegoExpressEngine.instance().startPlayingStream(streamID, config);
    }

    public static startPreview(channel?: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().startPreview(channel);
    }

    public static stopPreview(channel?: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().stopPreview(channel);
    }

    public static setAppOrientation(orientation: ZegoOrientation, channel?: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().setAppOrientation(orientation, channel);
    }


    public static getAudioRouteType(): Promise<ZegoAudioRoute> {
        return ZegoExpressEngine.instance().getAudioRouteType();
    }

    public static useFrontCamera(isFrontFacing: boolean, channel?: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().useFrontCamera(isFrontFacing, channel);
    }

    public static setAudioRouteToSpeaker(routeToSpeaker: boolean) {
        return ZegoExpressEngine.instance().setAudioRouteToSpeaker(routeToSpeaker);
    }

    public static muteMicrophone(mute: boolean) {
        return ZegoExpressEngine.instance().muteMicrophone(mute);
    }

    public static async setStreamExtraInfo(extraInfo: string, channel?: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().setStreamExtraInfo(extraInfo, channel);
    }

    public static startPublishingStream(streamID: string, channel?: ZegoPublishChannel, config?: ZegoPublisherConfig) {
        return ZegoExpressEngine.instance().startPublishingStream(streamID, channel, config);
    }

    public static setVideoConfig(config: ZegoVideoConfig | ZegoVideoConfigPreset, channel: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().setVideoConfig(config, channel);
    }

    public static getVideoConfig(channel: ZegoPublishChannel): Promise<ZegoVideoConfig> {
        return ZegoExpressEngine.instance().getVideoConfig(channel);
    }

    public static stopPublishingStream(channel?: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().stopPublishingStream(channel);
    }

    public static enableCamera(on: boolean, channel?: ZegoPublishChannel) {
        return ZegoExpressEngine.instance().enableCamera(on, channel);
    }

    public static muteAllPlayStreamAudio(mute: boolean) {
        return ZegoExpressEngine.instance().muteAllPlayStreamAudio(mute);
    }

    public static muteAllPlayStreamVideo(mute: boolean) {
        return ZegoExpressEngine.instance().muteAllPlayStreamVideo(mute);
    }

    public static sendBroadcastMessage(roomID: string, message: string): Promise<ZegoIMSendBroadcastMessageResult> {
        return ZegoExpressEngine.instance().sendBroadcastMessage(roomID, message);
    }

    public static loginRoom(roomID: string, user: ZegoUser, config: ZegoRoomConfig): Promise<ZegoRoomLoginResult> {
        return ZegoExpressEngine.instance().loginRoom(roomID, user, config);
    }

    public static logoutRoom(roomID?: string): Promise<ZegoRoomLogoutResult> {
        // const result = await ZegoExpressEngine.instance().logoutRoom(roomID)
        // console.warn('logoutRoom', result)
        return ZegoExpressEngine.instance().logoutRoom(roomID);
    }

    public static setRoomExtraInfo(roomID: string, key: string, value: string): Promise<ZegoRoomSetRoomExtraInfoResult> {
        return ZegoExpressEngine.instance().setRoomExtraInfo(roomID, key, value);
    }

    public static sendCustomCommand(roomID: string, command: string, toUserList: ZegoUser[]): Promise<ZegoIMSendCustomCommandResult> {
        return ZegoExpressEngine.instance().sendCustomCommand(roomID, command, toUserList);
    }

    public static stopPlayingStream(streamID: string) {
        return ZegoExpressEngine.instance().stopPlayingStream(streamID);
    }

    public static stopSoundLevelMonitor() {
        return ZegoExpressEngine.instance().stopSoundLevelMonitor();
    }

    public static getEngine(): ZegoExpressEngine | null {
        return ZegoExpressEngine.instance();
    }

    public static setEngineConfig(config: ZegoEngineConfig) {
        return ZegoExpressEngine.setEngineConfig(config);
    }

    public static renewToken(roomID: string, token: string) {
        return ZegoExpressEngine.instance().renewToken(roomID, token);
    }

    public static startSoundLevelMonitor(config?: ZegoSoundLevelConfig) {
        return ZegoExpressEngine.instance().startSoundLevelMonitor(config);
    }

    public static addEventHandler(eventHandler: ZegoEventListener): void {
        return this.expressEventHandler?.addHandler(eventHandler);
    }

    public static removeEventHandler(eventHandler: ZegoEventListener): void {
        return this.expressEventHandler?.removeHandler(eventHandler);
    }

    /**
     * 移除事件处理器列表。
     * 
     * @param list 要移除的事件处理器列表。
     */
    public static removeEventHandlerList(list: ZegoEventListener[]): void {
        if (list.length === 0) {
            return;
        }
        this.expressEventHandler?.removeEventHandlerList(list);
    }

    public static sendBarrageMessage(roomID: string, message: string): Promise<ZegoIMSendBarrageMessageResult> {
        return ZegoExpressEngine.instance().sendBarrageMessage(roomID, message);
    }

    public static mutePlayStreamAudio(streamID: string, mute: boolean) {
        return ZegoExpressEngine.instance().mutePlayStreamAudio(streamID, mute);
    }

    public static mutePlayStreamVideo(streamID: string, mute: boolean) {
        return ZegoExpressEngine.instance().mutePlayStreamVideo(streamID, mute);
    }

    public static startMixerTask(task: ZegoMixerTask): Promise<ZegoMixerStartResult> {
        return ZegoExpressEngine.instance().startMixerTask(task);
    }

    public static stopMixerTask(task: ZegoMixerTask): Promise<ZegoMixerStopResult> {
        return ZegoExpressEngine.instance().stopMixerTask(task);
    }

    public static uploadLog() {
        return ZegoExpressEngine.instance().uploadLog();
    }

    public static destroyEngine() {
        zloginfo(TAG, 'destroyEngine')
        this.expressEventHandler?.removeAllEventHandlers()
        this.expressEventHandler = null
        return ZegoExpressEngine.destroyEngine();
    }
}
