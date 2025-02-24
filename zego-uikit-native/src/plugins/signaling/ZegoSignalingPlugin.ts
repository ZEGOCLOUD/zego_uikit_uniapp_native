import { ZegoPluginType } from "../ZegoPluginType";
import { ZegoSignalingNotificationConfig } from "./defines";
import { ZegoSignalingPluginEventHandler } from "./ZegoSignalingPluginEventHandler";
import { ZegoSignalingPluginProtocol } from "./ZegoSignalingPluginProtocol";
import { ZegoSignalingPluginService } from "./ZegoSignalingPluginService";
import { ZIMCallInvitationMode, ZIMEventHandler } from "./ZIMUniApp";

const TAG = '[ZegoSignalingPlugin]'
const VERSION = '1.0.0'

// ZegoSignalingPlugin, 插件的实现类

export class ZegoSignalingPlugin implements ZegoSignalingPluginProtocol {


    getPluginType(): ZegoPluginType {
        return ZegoPluginType.Signling
    }
    getVersion(): string {
        return VERSION
    }

    private service: ZegoSignalingPluginService = new ZegoSignalingPluginService();

    init(appID: number, appSign: string): Promise<boolean> {
        return this.service.init(appID, appSign);
    }

    connectUser(userID: string, userName: string) {
        return this.service.connectUser(userID, userName);
    }

    disconnectUser() {
        return this.service.disconnectUser();
    }

    destroy(): void {
        this.service.destroy();
    }

    sendInvitation(invitees: string[], timeout: number, extendedData: string, notificationConfig?: ZegoSignalingNotificationConfig, mode?: ZIMCallInvitationMode) {
        return this.service.sendInvitation(invitees, timeout, extendedData, notificationConfig, mode);
    }

    callingInvitation(invitees: string[], callID: string, extendedData: string, notificationConfig?: ZegoSignalingNotificationConfig) {
        return this.service.callingInvitation(invitees, callID, extendedData, notificationConfig)
    }

    cancelInvitation(invitees: string[], invitationID: string, extendedData: string, notificationConfig?: ZegoSignalingNotificationConfig) {
        return this.service.cancelInvitation(invitees, invitationID, extendedData, notificationConfig);
    }

    refuseInvitation(invitationID: string, extendedData: string) {
        return this.service.refuseInvitation(invitationID, extendedData);
    }

    acceptInvitation(invitationID: string, extendedData: string) {
        return this.service.acceptInvitation(invitationID, extendedData);
    }

    callQuit(callID: string, extendedData: string, notificationConfig?: ZegoSignalingNotificationConfig) {
        return this.service.callQuit(callID, extendedData, notificationConfig)
    }

    callEnd(callID: string, extendedData: string, notificationConfig?: ZegoSignalingNotificationConfig) {
        return this.service.callEnd(callID, extendedData, notificationConfig)
    }

    joinRoom(roomID: string, roomName: string) {
        return this.service.joinRoom(roomID, roomName);
    }

    leaveRoom(roomID: string) {
        return this.service.leaveRoom(roomID);
    }

    setUsersInRoomAttributes(attributes: Record<string, string>, userIDs: string[], roomID: string) {
        return this.service.setUsersInRoomAttributes(attributes, userIDs, roomID);
    }

    queryUsersInRoomAttributes(roomID: string, count: number, nextFlag: string) {
        return this.service.queryUsersInRoomAttributes(roomID, count, nextFlag);
    }

    updateRoomProperty(attributes: Record<string, string>, roomID: string, isForce: boolean, isDeleteAfterOwnerLeft: boolean, isUpdateOwner: boolean) {
        return this.service.updateRoomProperty(attributes, roomID, isForce, isDeleteAfterOwnerLeft, isUpdateOwner);
    }

    deleteRoomProperties(keys: string[], roomID: string, isForce: boolean) {
        return this.service.deleteRoomProperties(keys, roomID, isForce);
    }

    queryRoomProperties(roomID: string) {
        return this.service.queryRoomProperties(roomID);
    }

    beginRoomPropertiesBatchOperation(roomID: string, isDeleteAfterOwnerLeft: boolean, isForce: boolean, isUpdateOwner: boolean) {
        return this.service.beginRoomPropertiesBatchOperation(roomID, isDeleteAfterOwnerLeft, isForce, isUpdateOwner);
    }

    endRoomPropertiesBatchOperation(roomID: string) {
        return this.service.endRoomPropertiesBatchOperation(roomID);
    }

    sendRoomMessage(text: string, roomID: string) {
        return this.service.sendRoomMessage(text, roomID);
    }

    sendInRoomCommandMessage(command: string, roomID: string) {
        return this.service.sendInRoomCommandMessage(command, roomID);
    }

    addPluginEventHandler(listenerID: string, handler: ZegoSignalingPluginEventHandler) {
        this.service.addPluginEventHandler(listenerID, handler);
    }

    removePluginEventHandler(listenerID: string) {
        this.service.removePluginEventHandler(listenerID);
    }

    addZIMEventHandler(listenerID: string, handler: ZIMEventHandler) {
        this.service.addZIMEventHandler(listenerID, handler);
    }

    removeZIMEventHandler(listenerID: string) {
        this.service.removeZIMEventHandler(listenerID);
    }
}