import { ZegoEventListener } from "./ZegoExpressUniApp";

export interface ExpressEngineEventHandler extends ZegoEventListener {
    
    // 比 ZegoEventListener 多了 onLocalCameraStateUpdate 和 onLocalMicrophoneStateUpdate

    onLocalCameraStateUpdate(open: boolean): void;

    onLocalMicrophoneStateUpdate(open: boolean): void;

}
