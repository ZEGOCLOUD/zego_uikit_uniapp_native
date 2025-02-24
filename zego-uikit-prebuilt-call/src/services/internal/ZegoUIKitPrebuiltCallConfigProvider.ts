import { ZegoUIKitPrebuiltCallConfig } from "../../config/ZegoUIKitPrebuiltCallConfig";
import { ZegoCallInvitationData } from "./ZegoCallInvitationData";

export interface ZegoUIKitPrebuiltCallConfigProvider {

    requireConfig(invitationData: ZegoCallInvitationData): ZegoUIKitPrebuiltCallConfig;
}