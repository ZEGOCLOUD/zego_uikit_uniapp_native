import { ZegoInvitationType, ZegoUIKitUser } from "@/uni_modules/zego-UIKitCore"



export class ZegoCallInvitationData {
    callID: string;
    type: ZegoInvitationType;
    invitees: ZegoUIKitUser[];
    inviter: ZegoUIKitUser;
    customData: string;
    invitationID?: string; // 如果invitationID可能存在也可能不存在，可以将其设置为可选属性

    constructor(callID: string, type: ZegoInvitationType, invitees: ZegoUIKitUser[], inviter: ZegoUIKitUser, customData: string, invitationID?: string) {
        this.callID = callID;
        this.type = type;
        this.invitees = invitees;
        this.inviter = inviter;
        this.customData = customData;
        if (invitationID) {
            this.invitationID = invitationID;
        }
    }
}