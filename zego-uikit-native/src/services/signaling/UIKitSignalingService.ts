import { zlogerror } from '../../utils';
import { ZegoSignalingConnectionState, ZegoSignalingInRoomCommandMessage, ZegoSignalingInRoomTextMessage } from '../../plugins';
import { ZegoUIKitUser, ZegoUserInRoomAttributesInfo } from '../defines';
import { NotifyList } from '../internal/NotifyList';
import { ZegoUIKitInvitationData, ZegoUIKitSignalingConnectionStateChangeListener, ZegoUIKitSignalingInRoomCommandMessageListener, ZegoUIKitSignalingInRoomTextMessageListener, ZegoUIKitSignalingInvitationListener, ZegoUIKitSignalingRoomPropertyUpdateListener, ZegoUIKitSignalingUsersInRoomAttributesUpdateListener } from './defines';

const TAG = '[UIKitSignalingService]'

// 这个类主要是通知类，用于通知邀请相关的事件
export class UIKitSignalingService {
    private invitationListenerList: NotifyList<ZegoUIKitSignalingInvitationListener> = new NotifyList();
    private roomPropertyUpdateListenerList: NotifyList<ZegoUIKitSignalingRoomPropertyUpdateListener> = new NotifyList();
    private usersInRoomAttributesUpdateListenerList: NotifyList<ZegoUIKitSignalingUsersInRoomAttributesUpdateListener> = new NotifyList();
    private inRoomTextMessageListenerNotifyList: NotifyList<ZegoUIKitSignalingInRoomTextMessageListener> = new NotifyList();
    private inRoomCommandMessageListenerNotifyList: NotifyList<ZegoUIKitSignalingInRoomCommandMessageListener> = new NotifyList();
    private connectionStateChangeListenerNotifyList: NotifyList<ZegoUIKitSignalingConnectionStateChangeListener> = new NotifyList();
    public notifyCallInvitationReceived(inviter: ZegoUIKitUser, type: number, data: ZegoUIKitInvitationData): void {
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onInvitationReceived?.(inviter, type, data);
        });
    }

    public notifyCallInvitationCancelled(inviter: ZegoUIKitUser, data: ZegoUIKitInvitationData): void {
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onInvitationCanceled?.(inviter, data);
        });
    }

    public notifyCallInvitationAccepted(invitee: ZegoUIKitUser, data: ZegoUIKitInvitationData): void {
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onInvitationAccepted?.(invitee, data);
        });
    }

    public notifyCallInvitationRejected(invitee: ZegoUIKitUser, data: ZegoUIKitInvitationData): void {
        // zlogerror(TAG, `this.invitationListenerList.length: ${this.invitationListenerList.length}`)
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onInvitationRefused?.(invitee, data);
        });
    }

    public notifyCallInvitationTimeout(inviter: ZegoUIKitUser, data: ZegoUIKitInvitationData): void {
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onInvitationTimeout?.(inviter, data);
        });
    }

    public notifyCallInviteesAnsweredTimeout(users: ZegoUIKitUser[], data: ZegoUIKitInvitationData): void {
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onInvitationResponseTimeout?.(users, data);
        });
    }

    public notifyCallingInvitationSend(invitees: ZegoUIKitUser[], data: ZegoUIKitInvitationData): void {
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onCallingInvitationSend?.(invitees, data);
        });
    }

    public notifyCancelInvitaion(invitees: ZegoUIKitUser[], data: ZegoUIKitInvitationData): void {
        this.invitationListenerList.notifyAllListener((invitationListener: ZegoUIKitSignalingInvitationListener) => {
            invitationListener.onCancelInvitaion?.(invitees, data);
        });
    }

    public notifyRoomPropertyUpdated(key: string, oldValue: string, newValue: string): void {
        this.roomPropertyUpdateListenerList.notifyAllListener((listener: ZegoUIKitSignalingRoomPropertyUpdateListener) => {
            listener.onRoomPropertyUpdated(key, oldValue, newValue);
        });
    }

    public notifyRoomPropertyFullUpdated(updateKeys: string[], oldRoomAttributes: Record<string, string>, roomAttributes: Record<string, string>): void {
        this.roomPropertyUpdateListenerList.notifyAllListener((listener: ZegoUIKitSignalingRoomPropertyUpdateListener) => {
            listener.onRoomPropertiesFullUpdated(updateKeys, oldRoomAttributes, roomAttributes);
        });
    }

    public notifyUsersInRoomAttributesUpdated(updateKeys: string[], oldAttributes: ZegoUserInRoomAttributesInfo[], attributes: ZegoUserInRoomAttributesInfo[], editor: ZegoUIKitUser | null): void {
        this.usersInRoomAttributesUpdateListenerList.notifyAllListener((listener: ZegoUIKitSignalingUsersInRoomAttributesUpdateListener) => {
            listener.onUsersInRoomAttributesUpdated(updateKeys, oldAttributes, attributes, editor);
        });
    }

    public addRoomPropertyUpdateListener(listenerID: string, listener: ZegoUIKitSignalingRoomPropertyUpdateListener): void {
        this.roomPropertyUpdateListenerList.addListener(listenerID, listener);
    }

    public removeRoomPropertyUpdateListener(listenerID: string): void {
        this.roomPropertyUpdateListenerList.removeListener(listenerID);
    }

    public addUsersInRoomAttributesUpdateListener(listenerID: string, listener: ZegoUIKitSignalingUsersInRoomAttributesUpdateListener): void {
        this.usersInRoomAttributesUpdateListenerList.addListener(listenerID, listener);
    }

    public removeUsersInRoomAttributesUpdateListener(listenerID: string): void {
        this.usersInRoomAttributesUpdateListenerList.removeListener(listenerID);
    }

    public addInvitationListener(listenerID: string, listener: ZegoUIKitSignalingInvitationListener): void {
        // zlogerror(TAG, `addInvitationListener listenerID: ${listenerID}`)
        this.invitationListenerList.addListener(listenerID, listener);
    }

    public removeInvitationListener(listenerID: string): void {
        this.invitationListenerList.removeListener(listenerID);
    }

    public clear(): void {
        this.invitationListenerList.clear();
        this.removeRoomListeners();
    }

    public removeRoomListeners(): void {
        this.usersInRoomAttributesUpdateListenerList.clear();
        this.roomPropertyUpdateListenerList.clear();
        this.inRoomTextMessageListenerNotifyList.clear();
        this.connectionStateChangeListenerNotifyList.clear();
        this.inRoomCommandMessageListenerNotifyList.clear();
    }

    public addInRoomTextMessageListener(listenerID: string, listener: ZegoUIKitSignalingInRoomTextMessageListener): void {
        this.inRoomTextMessageListenerNotifyList.addListener(listenerID, listener);
    }

    public removeInRoomTextMessageListener(listenerID: string): void {
        this.inRoomTextMessageListenerNotifyList.removeListener(listenerID);
    }

    public addInRoomCommandMessageListener(listenerID: string, listener: ZegoUIKitSignalingInRoomCommandMessageListener): void {
        this.inRoomCommandMessageListenerNotifyList.addListener(listenerID, listener);
    }

    public removeInRoomCommandMessageListener(listenerID: string): void {
        this.inRoomCommandMessageListenerNotifyList.removeListener(listenerID);
    }

    public notifyInRoomTextMessageReceived(messages: ZegoSignalingInRoomTextMessage[], roomID: string): void {
        this.inRoomTextMessageListenerNotifyList.notifyAllListener((listener: ZegoUIKitSignalingInRoomTextMessageListener) => {
            listener.onInRoomTextMessageReceived(messages, roomID);
        });
    }

    public addConnectionStateChangeListener(listenerID: string, listener: ZegoUIKitSignalingConnectionStateChangeListener): void {
        this.connectionStateChangeListenerNotifyList.addListener(listenerID, listener);
    }

    public removeConnectionStateChangeListener(listenerID: string): void {
        this.connectionStateChangeListenerNotifyList.removeListener(listenerID);
    }

    public notifyConnectionStateChange(connectionState: ZegoSignalingConnectionState): void {
        this.connectionStateChangeListenerNotifyList.notifyAllListener((listener: ZegoUIKitSignalingConnectionStateChangeListener) => {
            listener.onConnectionStateChanged(connectionState);
        });
    }

    public onInRoomCommandMessageReceived(messages: ZegoSignalingInRoomCommandMessage[], roomID: string): void {
        this.inRoomCommandMessageListenerNotifyList.notifyAllListener((listener: ZegoUIKitSignalingInRoomCommandMessageListener) => {
            listener.onInRoomCommandMessageReceived(messages, roomID);
        });
    }
}