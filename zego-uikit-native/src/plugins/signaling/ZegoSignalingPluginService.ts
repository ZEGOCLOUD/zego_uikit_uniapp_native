import { NotifyList } from '../../services/internal/NotifyList';
import { makeTag, zloginfo, zlogwarning } from "../../utils";
import { ZegoSignalingNotificationConfig } from "./defines";
import { SimpleZIMEventHandler } from "./SimpleZIMEventHandler";
import { ZegoSignalingPluginEventHandler } from "./ZegoSignalingPluginEventHandler";
import ZIM, { ZIMAppConfig, ZIMCallAcceptConfig, ZIMCallCancelConfig, ZIMCallEndConfig, ZIMCallInvitationMode, ZIMCallInviteConfig, ZIMCallQuitConfig, ZIMCallRejectConfig, ZIMConversationType, ZIMEventHandler, ZIMMessagePriority, ZIMMessageSendConfig, ZIMMessageType, ZIMPushConfig, ZIMRoomAttributesBatchOperationConfig, ZIMRoomAttributesDeleteConfig, ZIMRoomAttributesSetConfig, ZIMRoomInfo, ZIMRoomMemberAttributesQueryConfig, ZIMRoomMemberAttributesSetConfig } from "./ZIMUniApp";

const TAG = makeTag('ZegoSignalingPluginService')

// 这个类是对ZIM接口调用的封装
export class ZegoSignalingPluginService {

    private signalingPluginEventHandlerNotifyList: NotifyList<ZegoSignalingPluginEventHandler> = new NotifyList();
    private zimEventHandler: SimpleZIMEventHandler = new SimpleZIMEventHandler(this.signalingPluginEventHandlerNotifyList)
    private isZIMInited: boolean = false;
    // private static zim: ZIM | null = null;

    constructor() {
        zloginfo(TAG, 'new ZegoSignalingPluginService')
    }

    async getVersion(): Promise<string> {
        return ZIM.getVersion()
    }

    async init(appID: number, appSign: string): Promise<boolean> {
        if (this.isZIMInited) {
            zlogwarning(TAG, 'ZegoSignalingPluginService has been inited')
            return false;
        }
        this.isZIMInited = true;

        const zimAppConfig: ZIMAppConfig = {
            appID, appSign
        }

        const zim = ZIM.create(zimAppConfig);

        const version = await this.getVersion()
        zloginfo(TAG, `init ZIM ${!!zim ? 'success' : 'failed'}, version=${version}`)
        if (!zim) {
            return false
        }
        for (let key of Object.keys(this.zimEventHandler)) {
            const evt = key as unknown as keyof ZIMEventHandler
            // zloginfo(TAG, `add event listener ${evt}`)
            // @ts-ignore
            zim.on(evt, this.zimEventHandler[evt])
        }

        return true
    }

    private getPushConfig(notificationConfig: ZegoSignalingNotificationConfig, extendedData: string) {
        const pushConfig: ZIMPushConfig = {
            title: notificationConfig.title || '',
            content: notificationConfig.message || '',
            resourcesID: notificationConfig.resourceID,
            payload: extendedData,
        };
        return pushConfig
    }

    connectUser(userID: string, userName: string) {
        return ZIM.getInstance().login(userID, { userName, token: '', isOfflineLogin: false });
    }

    disconnectUser() {
        return ZIM.getInstance().logout();
    }

    destroy() {
        zloginfo(TAG, 'destroy ZIM')
        this.isZIMInited = false
        this.signalingPluginEventHandlerNotifyList.clear();
        this.zimEventHandler.removeAllEventListeners()
        ZIM.getInstance().destroy()
    }

    sendInvitation(
        invitees: string[],
        timeout: number,
        extendedData: string,
        notificationConfig?: ZegoSignalingNotificationConfig,
        mode = ZIMCallInvitationMode.General
    ) {
        const config: ZIMCallInviteConfig = {
            mode,
            timeout,
            extendedData: extendedData,
            enableNotReceivedCheck: true
        }
        if (notificationConfig) {
            config.pushConfig = this.getPushConfig(notificationConfig, extendedData);
        }
        zloginfo(TAG, `sendInvitation ${invitees} ${timeout} ${extendedData} ${notificationConfig}`)
        return ZIM.getInstance().callInvite(invitees, config);
    }

    callingInvitation(
        invitees: string[],
        callID: string,
        extendedData: string,
        notificationConfig?: ZegoSignalingNotificationConfig,
    ) {
        const config: Record<string, any> = {}
        if (notificationConfig) {
            config.pushConfig = this.getPushConfig(notificationConfig, extendedData);
        }
        zloginfo(TAG, `callingInvite ${invitees} ${callID} ${extendedData} ${JSON.stringify(notificationConfig)}`)
        return ZIM.getInstance().callingInvite(invitees, callID, config)
    }

    cancelInvitation(
        invitees: string[],
        invitationID: string,
        extendedData: string,
        notificationConfig?: ZegoSignalingNotificationConfig,
    ) {
        const config: ZIMCallCancelConfig = {
            extendedData: extendedData,
        };
        if (notificationConfig != null) {
            config.pushConfig = this.getPushConfig(notificationConfig, extendedData);
        }
        zloginfo(TAG, `cancelInvitation ${invitees} ${invitationID} ${extendedData} ${notificationConfig}`)
        return ZIM.getInstance().callCancel(invitees, invitationID, config);

    }
    refuseInvitation(invitationID: string, extendedData: string) {
        const config: ZIMCallRejectConfig = { extendedData: extendedData };
        zloginfo(TAG, `refuseInvitation ${invitationID} ${extendedData}`)
        return ZIM.getInstance().callReject(invitationID, config);
    }

    acceptInvitation(invitationID: string, extendedData: string) {
        const config: ZIMCallAcceptConfig = { extendedData: extendedData };
        zloginfo(TAG, `acceptInvitation ${invitationID} ${extendedData}`)
        return ZIM.getInstance().callAccept(invitationID, config);
    }

    callQuit(callID: string, extendedData: string, notificationConfig?: ZegoSignalingNotificationConfig,) {
        const config: ZIMCallQuitConfig = {
            extendedData: extendedData,
        }
        if (notificationConfig) {
            config.pushConfig = this.getPushConfig(notificationConfig, extendedData);
        }
        zloginfo(TAG, `callQuit ${callID} ${extendedData} ${notificationConfig}`)
        return ZIM.getInstance().callQuit(callID, config)
    }

    callEnd(callID: string, extendedData: string, notificationConfig?: ZegoSignalingNotificationConfig) {
        const config: ZIMCallEndConfig = {
            extendedData: extendedData,
        }
        if (notificationConfig) {
            config.pushConfig = this.getPushConfig(notificationConfig, extendedData);
        }
        zloginfo(TAG, `callEnd ${callID} ${extendedData} ${notificationConfig}`)
        return ZIM.getInstance().callEnd(callID, config)
    }

    joinRoom(roomID: string, roomName: string) {
        const zimRoomInfo: ZIMRoomInfo = { roomID, roomName };
        return ZIM.getInstance().enterRoom(zimRoomInfo)
    }

    leaveRoom(roomID: string) {
        return ZIM.getInstance().leaveRoom(roomID);
    }


    async setUsersInRoomAttributes(attributes: Record<string, string>, userIDs: string[], roomID: string) {
        const config: ZIMRoomMemberAttributesSetConfig = {
            isDeleteAfterOwnerLeft: false
        };
        const { infos, errorUserList } = await ZIM.getInstance().setRoomMembersAttributes(attributes, userIDs, roomID, config)

        const attributesMap: Record<string, Record<string, string>> = {};
        const errorKeysMap: Record<string, string[]> = {};
        for (const info of infos) {
            attributesMap[info.attributesInfo.userID] = info.attributesInfo.attributes;
            errorKeysMap[info.attributesInfo.userID] = info.errorKeys;
        }

        return { errorUserList, attributesMap, errorKeysMap }

    }

    async queryUsersInRoomAttributes(roomID: string, count: number, nextFlag: string) {
        const config: ZIMRoomMemberAttributesQueryConfig = {
            count,
            nextFlag
        };
        const { infos } = await ZIM.getInstance().queryRoomMemberAttributesList(roomID, config)
        const attributesMap: Record<string, Record<string, string>> = {};
        for (const info of infos) {
            attributesMap[info.userID] = info.attributes;
        }
        return { nextFlag, attributesMap }
    }
    updateRoomProperty(attributes: Record<string, string>, roomID: string, isForce: boolean, isDeleteAfterOwnerLeft: boolean, isUpdateOwner: boolean,) {
        const config: ZIMRoomAttributesSetConfig = {
            isDeleteAfterOwnerLeft,
            isForce,
            isUpdateOwner
        };
        return ZIM.getInstance().setRoomAttributes(attributes, roomID, config)
    }

    deleteRoomProperties(keys: string[], roomID: string, isForce: boolean) {
        const config: ZIMRoomAttributesDeleteConfig = {
            isForce
        };
        return ZIM.getInstance().deleteRoomAttributes(keys, roomID, config)
    }
    queryRoomProperties(roomID: string,) {
        return ZIM.getInstance().queryRoomAllAttributes(roomID);

    }

    beginRoomPropertiesBatchOperation(roomID: string, isDeleteAfterOwnerLeft: boolean, isForce: boolean, isUpdateOwner: boolean) {
        const config: ZIMRoomAttributesBatchOperationConfig = {
            isForce,
            isDeleteAfterOwnerLeft,
            isUpdateOwner
        };
        return ZIM.getInstance().beginRoomAttributesBatchOperation(roomID, config);
    }

    endRoomPropertiesBatchOperation(roomID: string) {
        return ZIM.getInstance().endRoomAttributesBatchOperation(roomID)
    }

    sendRoomMessage(text: string, roomID: string) {
        const textMessage = {
            type: ZIMMessageType.Text,
            message: text
        }
        const config: ZIMMessageSendConfig = {
            priority: ZIMMessagePriority.Low
        };
        return ZIM.getInstance().sendMessage(textMessage, roomID, ZIMConversationType.Room, config)
    }

    sendInRoomCommandMessage(command: string, roomID: string) {
        // 将 string 转换为 Uint8Array
        const encoder = new TextEncoder();
        const commandMessage = {
            type: ZIMMessageType.Command,
            message: encoder.encode(command),
        }
        const config: ZIMMessageSendConfig = {
            priority: ZIMMessagePriority.Low
        };
        return ZIM.getInstance().sendMessage(commandMessage, roomID, ZIMConversationType.Room, config)
    }

    addPluginEventHandler(listenerID: string, handler: ZegoSignalingPluginEventHandler) {
        zloginfo(TAG, `addPluginEventHandler ${listenerID}`)
        this.signalingPluginEventHandlerNotifyList.addListener(listenerID, handler);
    }

    removePluginEventHandler(listenerID: string) {
        zloginfo(TAG, `removePluginEventHandler ${listenerID}`)
        this.signalingPluginEventHandlerNotifyList.removeListener(listenerID)
    }

    addZIMEventHandler(listenerID: string, handler: ZIMEventHandler) {
        zloginfo(TAG, `addZIMEventHandler ${listenerID}`)
        this.zimEventHandler?.addListener(listenerID, handler);
    }

    removeZIMEventHandler(listenerID: string) {
        zloginfo(TAG, `removeZIMEventHandler ${listenerID}`)
        this.zimEventHandler?.removeListener(listenerID);
    }
}
