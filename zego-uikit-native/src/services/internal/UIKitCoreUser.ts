import { ZegoStream } from "../express/ZegoExpressUniApp";
import { ZegoUIKitUser } from "../defines";

export class UIKitCoreUser {

    userID: string;

    userName: string;

    isCameraOn: boolean = false;

    isMicrophoneOn: boolean = false;

    mainStreamID?: string;

    shareStreamID?: string;

    soundLevel: number = 0;

    attributes?: Record<string, string>;

    constructor(userID: string, userName?: string) {
        this.userID = userID;
        this.userName = userName || userID;
    }

    public getUIKitUser(): ZegoUIKitUser {
        const { userID, userName, isCameraOn, isMicrophoneOn, mainStreamID, attributes } = this;
        const user: ZegoUIKitUser = {
            userID,
            userName,
            isCameraOn,
            isMicrophoneOn,
            streamID: mainStreamID,
            inRoomAttributes: attributes,
        };

        // 直接检查并设置avatar
        if (attributes && attributes.avatar) {
            user.avatar = attributes.avatar;
        }

        return user;
    }


    private static readonly MAIN_STREAM_ID = "main";

    public setStreamID(streamID: string): void {

        this[streamID.includes(UIKitCoreUser.MAIN_STREAM_ID) ? 'mainStreamID' : 'shareStreamID'] = streamID;
    }

    public static createFromStream(stream: ZegoStream): UIKitCoreUser {
        const userName = stream.user.userName ?? "";
        const user = new UIKitCoreUser(stream.user.userID, userName);
        user.setStreamID(stream.streamID)
        return user;
    }

    public deleteStream(streamID: string): void {
        if (streamID.includes("main")) {
            this.mainStreamID = '';
        } else {
            this.shareStreamID = '';
        }
    }
}