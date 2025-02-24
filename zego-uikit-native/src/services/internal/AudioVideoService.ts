
import {
    ZegoAudioRoute,
    ZegoPublishChannel
} from "../express/ZegoExpressUniApp";

import { ExpressEngineProxy } from '../express/ExpressEngineProxy';

import { UIKitCoreUser } from './UIKitCoreUser';

import {
    ZegoAudioOutputDevice,
    ZegoAudioOutputDeviceChangedListener,
    ZegoCameraStateChangeListener,
    ZegoMicrophoneStateChangeListener,
    ZegoSoundLevelUpdateListener,
    ZegoTurnOnYourCameraRequestListener,
    ZegoTurnOnYourMicrophoneRequestListener,
    ZegoUIKitUser
} from '../defines';

import { NotifyList } from './NotifyList';
import UIKitCore from './UIKitCore';
import { makeTag, zloginfo, zlogwarning } from '../../utils';

const TAG = makeTag('AudioVideoService')

export class AudioVideoService {


    // 然后在您的类中使用 NotifyList
    private micStateListeners: NotifyList<ZegoMicrophoneStateChangeListener> = new NotifyList<ZegoMicrophoneStateChangeListener>();
    private cameraStateListeners: NotifyList<ZegoCameraStateChangeListener> = new NotifyList<ZegoCameraStateChangeListener>();
    private audioOutputListeners: NotifyList<ZegoAudioOutputDeviceChangedListener> = new NotifyList<ZegoAudioOutputDeviceChangedListener>();
    private soundLevelListeners: NotifyList<ZegoSoundLevelUpdateListener> = new NotifyList<ZegoSoundLevelUpdateListener>();
    private turnOnYourCameraRequestListeners: NotifyList<ZegoTurnOnYourCameraRequestListener> = new NotifyList<ZegoTurnOnYourCameraRequestListener>();
    private turnOnYourMicrophoneRequestListeners: NotifyList<ZegoTurnOnYourMicrophoneRequestListener> = new NotifyList<ZegoTurnOnYourMicrophoneRequestListener>();

    public addMicrophoneStateListener(listenerID: string, listener: ZegoMicrophoneStateChangeListener) {
        this.micStateListeners.addListener(listenerID, listener);
    }

    public removeMicrophoneStateListener(listenerID: string) {
        this.micStateListeners.removeListener(listenerID);
    }

    public addCameraStateListener(listenerID: string, listener: ZegoCameraStateChangeListener) {
        this.cameraStateListeners.addListener(listenerID, listener);
    }

    public removeCameraStateListener(listenerID: string) {
        this.cameraStateListeners.removeListener(listenerID);
    }

    public async addAudioOutputDeviceChangedListener(listenerID: string, listener: ZegoAudioOutputDeviceChangedListener) {
        this.audioOutputListeners.addListener(listenerID, listener);
        const audioRouteType = await ExpressEngineProxy.getAudioRouteType();
        const audioRoute = audioRouteType as unknown as ZegoAudioOutputDevice;
        listener.onAudioOutputDeviceChanged?.(audioRoute);
    }

    public removeAudioOutputDeviceChangedListener(listenerID: string) {
        this.audioOutputListeners.removeListener(listenerID);
    }

    public addTurnOnYourCameraRequestListener(listenerID: string, listener: ZegoTurnOnYourCameraRequestListener) {
        this.turnOnYourCameraRequestListeners.addListener(listenerID, listener);
    }

    public removeTurnOnYourCameraRequestListener(listenerID: string) {
        this.turnOnYourCameraRequestListeners.removeListener(listenerID);
    }

    public addTurnOnYourMicrophoneRequestListener(listenerID: string, listener: ZegoTurnOnYourMicrophoneRequestListener) {
        this.turnOnYourMicrophoneRequestListeners.addListener(listenerID, listener);
    }

    public removeTurnOnYourMicrophoneRequestListener(listenerID: string) {
        this.turnOnYourMicrophoneRequestListeners.removeListener(listenerID);
    }


    public addSoundLevelUpdatedListener(listenerID: string, listener: ZegoSoundLevelUpdateListener) {
        this.soundLevelListeners.addListener(listenerID, listener);

        const userInfo = UIKitCore.getInstance().getLocalCoreUser();
        if (userInfo !== null) {
            listener.onSoundLevelUpdate?.(userInfo.getUIKitUser(), userInfo.soundLevel);
        }
    }

    public removeSoundLevelUpdatedListener(listenerID: string) {
        this.soundLevelListeners.removeListener(listenerID);
    }

    public clear() {
        this.micStateListeners.clear();
        this.cameraStateListeners.clear();
        this.audioOutputListeners.clear();
        this.soundLevelListeners.clear();
        this.turnOnYourCameraRequestListeners.clear();
        this.turnOnYourMicrophoneRequestListeners.clear();
    }

    public notifyAudioRouteChange(zegoAudioRoute: ZegoAudioRoute) {
        this.audioOutputListeners.notifyAllListener((audioOutputChangeListener) => {
            const audioRoute = zegoAudioRoute as unknown as ZegoAudioOutputDevice;
            audioOutputChangeListener.onAudioOutputDeviceChanged?.(audioRoute);
        });
    }

    public notifyMicStateChange(coreUser: UIKitCoreUser, on: boolean) {
        this.micStateListeners.notifyAllListener((microphoneStateChangeListener) => {
            microphoneStateChangeListener.onMicrophoneOn?.(coreUser.getUIKitUser(), on);
        });
    }

    public notifyCameraStateChange(coreUser: UIKitCoreUser, on: boolean) {
        this.cameraStateListeners.notifyAllListener((cameraStateChangeListener) => {
            cameraStateChangeListener.onCameraOn?.(coreUser.getUIKitUser(), on);
        });
    }

    public notifySoundLevelUpdate(userID: string, soundLevel: number) {
        const uiKitUser = UIKitCore.getInstance().getUser(userID);
        if (uiKitUser) {
            this.soundLevelListeners.notifyAllListener((soundLevelUpdateListener) => {
                soundLevelUpdateListener.onSoundLevelUpdate?.(uiKitUser, soundLevel);
            });
        }
    }

    public useFrontFacingCamera(isFrontFacing: boolean) {
        ExpressEngineProxy.useFrontCamera(isFrontFacing);
    }

    public setAudioOutputToSpeaker(enable: boolean) {
        ExpressEngineProxy.setAudioRouteToSpeaker(enable);
    }

    public turnMicrophoneOn(userID: string, on: boolean) {
        const uiKitCore = UIKitCore.getInstance();
        const coreUser = uiKitCore.getUserByUserID(userID);
        if (coreUser) {
            const stateChanged = coreUser.isMicrophoneOn !== on;
            if (uiKitCore.isLocalUser(userID)) {
                ExpressEngineProxy.muteMicrophone(!on);
                const jsonObject = {
                    "isCameraOn": uiKitCore.isCameraOn(userID),
                    "isMicrophoneOn": on
                }
                const extraInfo = JSON.stringify(jsonObject);
                ExpressEngineProxy.setStreamExtraInfo(extraInfo, ZegoPublishChannel.Main);

                if (on) {
                    zloginfo(TAG, 'turnMicrophoneOn start publish, streamID:', coreUser.mainStreamID);
                    ExpressEngineProxy.startPublishingStream(coreUser.mainStreamID!, ZegoPublishChannel.Main);
                    ExpressEngineProxy.startPreview(ZegoPublishChannel.Main);
                } else if (!uiKitCore.isCameraOn(userID)) {
                    zloginfo(TAG, 'turnMicrophoneOn stop publish');
                    ExpressEngineProxy.stopPublishingStream(ZegoPublishChannel.Main);
                    ExpressEngineProxy.stopPreview(ZegoPublishChannel.Main);
                }
                // console.error(`openMicrophone from ${coreUser.isMicrophoneOn} to ${on}, has change=${stateChanged}`)
                coreUser.isMicrophoneOn = on;
                if (stateChanged) {
                    this.notifyMicStateChange(coreUser, on);
                }
            } else {
                const userIDs: string[] = [];
                if (!uiKitCore.checkIsLargeRoom()) {
                    userIDs.push(userID);
                }
                const jsonObject: any = {};
                if (on) {
                    jsonObject["zego_turn_microphone_on"] = userIDs;
                } else {
                    jsonObject["zego_turn_microphone_off"] = userIDs;
                }
                const command = JSON.stringify(jsonObject);
                UIKitCore.getInstance().sendInRoomCommand(command, userIDs, {
                    onSend(errorCode) {
                    },
                });
            }
        } else {
            zlogwarning(TAG, 'turnMicrophoneOn', userID, 'user not found');
        }
    }

    public turnCameraOn(userID: string, on: boolean) {
        const uiKitCore = UIKitCore.getInstance();
        const coreUser = uiKitCore.getUserByUserID(userID);
        if (coreUser) {
            zloginfo(TAG, 'turnCameraOn', userID, on);
            // console.error("turnCameraOn: coreUser: ", JSON.stringify(coreUser), 'open', on)
            const stateChanged = coreUser.isCameraOn !== on;
            if (uiKitCore.isLocalUser(userID)) {
                ExpressEngineProxy.enableCamera(on, ZegoPublishChannel.Main);
                coreUser.isCameraOn = on;

                const jsonObject: any = {
                    isCameraOn: on,
                    isMicrophoneOn: uiKitCore.isMicrophoneOn(userID)
                }
                const extraInfo = JSON.stringify(jsonObject);
                ExpressEngineProxy.setStreamExtraInfo(extraInfo, ZegoPublishChannel.Main);

                if (on) {
                    zloginfo(TAG, 'turnCameraOn start publish, streamID:', coreUser.mainStreamID);
                    ExpressEngineProxy.startPublishingStream(coreUser.mainStreamID!, ZegoPublishChannel.Main);
                    ExpressEngineProxy.startPreview(ZegoPublishChannel.Main);
                } else if (!uiKitCore.isMicrophoneOn(userID)) {
                    zloginfo(TAG, 'turnCameraOn stop publish');
                    ExpressEngineProxy.stopPublishingStream(ZegoPublishChannel.Main);
                    ExpressEngineProxy.stopPreview(ZegoPublishChannel.Main)
                }
                if (stateChanged) {
                    this.notifyCameraStateChange(coreUser, on);
                }
            } else {
                const userIDs: string[] = [];
                if (!uiKitCore.checkIsLargeRoom()) {
                    userIDs.push(userID);
                }
                const jsonObject: any = {}
                if (on) {
                    jsonObject["zego_turn_camera_on"] = userIDs;
                } else {
                    jsonObject["zego_turn_camera_off"] = userIDs;
                }
                const command = JSON.stringify(jsonObject)
                UIKitCore.getInstance().sendInRoomCommand(command, userIDs, {
                    onSend(errorCode) {

                    },
                });
            }
        } else {
            zlogwarning(TAG, 'turnCameraOn', userID, 'user is null');
        }
    }
    public startPlayingAllAudioVideo() {
        ExpressEngineProxy.muteAllPlayStreamAudio(false);
        ExpressEngineProxy.muteAllPlayStreamVideo(false);
    }

    public stopPlayingAllAudioVideo() {
        ExpressEngineProxy.muteAllPlayStreamAudio(true);
        ExpressEngineProxy.muteAllPlayStreamVideo(true);
    }

    public notifyTurnMicrophoneCommand(uiKitUser: ZegoUIKitUser, turnOn: boolean) {
        if (turnOn) {
            this.turnOnYourMicrophoneRequestListeners.notifyAllListener((zegoTurnOnYourMicrophoneRequestListener: ZegoTurnOnYourMicrophoneRequestListener) => {
                zegoTurnOnYourMicrophoneRequestListener.onTurnOnYourMicrophoneRequest?.(uiKitUser);
            });
        }
    }

    public notifyTurnCameraCommand(uiKitUser: ZegoUIKitUser, turnOn: boolean) {
        if (turnOn) {
            this.turnOnYourCameraRequestListeners.notifyAllListener((zegoTurnOnYourCameraRequestListener: ZegoTurnOnYourCameraRequestListener) => {
                zegoTurnOnYourCameraRequestListener.onTurnOnYourCameraRequest?.(uiKitUser);
            });
        }
    }

    public openCamera(open: boolean) {
        const localCoreUser = UIKitCore.getInstance().getLocalCoreUser();
        if (localCoreUser) {
            // console.error("openCamera: localCoreUser: ", JSON.stringify(localCoreUser), 'open', open)
            const stateChanged = localCoreUser.isCameraOn !== open;
            localCoreUser.isCameraOn = open;
            ExpressEngineProxy.enableCamera(open, ZegoPublishChannel.Main);
            if (stateChanged) {
                this.notifyCameraStateChange(localCoreUser, open);
            }
            const jsonObject = {
                "isCameraOn": open,
                "isMicrophoneOn": localCoreUser.isMicrophoneOn
            }
            const extraInfo = JSON.stringify(jsonObject)
            ExpressEngineProxy.setStreamExtraInfo(extraInfo, ZegoPublishChannel.Main);

        }
    }

    public openMicrophone(open: boolean) {
        const localCoreUser = UIKitCore.getInstance().getLocalCoreUser();
        if (localCoreUser) {
            const stateChanged = localCoreUser.isMicrophoneOn !== open;
            localCoreUser.isMicrophoneOn = open;
            // console.error(`openMicrophone from ${localCoreUser.isMicrophoneOn} to ${open}, has change=${stateChanged}`)
            ExpressEngineProxy.muteMicrophone(!open);
            if (stateChanged) {
                this.notifyMicStateChange(localCoreUser, open);
            }
            const jsonObject = {
                "isCameraOn": localCoreUser.isCameraOn,
                "isMicrophoneOn": open
            }
            const extraInfo = JSON.stringify(jsonObject)
            ExpressEngineProxy.setStreamExtraInfo(extraInfo, ZegoPublishChannel.Main);
        }
    }
}
