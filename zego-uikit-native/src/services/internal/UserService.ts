import { NotifyList } from './NotifyList';

import {
    ZegoMeRemovedFromRoomListener,
    ZegoOnlySelfInRoomListener,
    ZegoUIKitUser,
    ZegoUserCountOrPropertyChangedListener,
    ZegoUserUpdateListener
} from '../defines';

import { UIKitCoreUser } from './UIKitCoreUser';

export default class UserService {

    private userUpdateListeners: NotifyList<ZegoUserUpdateListener> = new NotifyList<ZegoUserUpdateListener>();
    private onlySelfListeners: NotifyList<ZegoOnlySelfInRoomListener> = new NotifyList<ZegoOnlySelfInRoomListener>();
    private roomUserCountOrPropertyChangedListeners: NotifyList<ZegoUserCountOrPropertyChangedListener> = new NotifyList<ZegoUserCountOrPropertyChangedListener>();
    private kickOutListenerNotifyList: NotifyList<ZegoMeRemovedFromRoomListener> = new NotifyList<ZegoMeRemovedFromRoomListener>();

    addUserUpdateListener(listenerID: string, listener: ZegoUserUpdateListener): void {
        this.userUpdateListeners.addListener(listenerID, listener);
    }

    removeUserUpdateListener(listenerID: string): void {
        this.userUpdateListeners.removeListener(listenerID);
    }

    addOnOnlySelfInRoomListener(listenerID: string, listener: ZegoOnlySelfInRoomListener): void {
        this.onlySelfListeners.addListener(listenerID, listener);
    }

    removeOnOnlySelfInRoomListener(listenerID: string): void {
        this.onlySelfListeners.removeListener(listenerID);
    }

    clear(): void {
        this.userUpdateListeners.clear();
        this.onlySelfListeners.clear();
        this.roomUserCountOrPropertyChangedListeners.clear();
        this.kickOutListenerNotifyList.clear();
    }

    notifyUserJoin(userInfoList: UIKitCoreUser[]): void {
        const zegoUsers = userInfoList.map(user => user.getUIKitUser());
        this.userUpdateListeners.notifyAllListener(listener => listener.onUserJoined?.(zegoUsers));
    }

    notifyUserLeave(userInfoList: UIKitCoreUser[]): void {
        const zegoUsers = userInfoList.map(user => user.getUIKitUser());
        this.userUpdateListeners.notifyAllListener(listener => listener.onUserLeft?.(zegoUsers));
    }

    notifyOnlySelfInRoom(): void {
        this.onlySelfListeners.notifyAllListener(listener => listener.onOnlySelf?.());
    }

    addUserCountOrPropertyChangedListener(listenerID: string, listener: ZegoUserCountOrPropertyChangedListener): void {
        this.roomUserCountOrPropertyChangedListeners.addListener(listenerID, listener);
    }

    removeUserCountOrPropertyChangedListener(listenerID: string): void {
        this.roomUserCountOrPropertyChangedListeners.removeListener(listenerID);
    }

    notifyRoomUserCountOrPropertyChanged(userList: ZegoUIKitUser[]): void {
        this.roomUserCountOrPropertyChangedListeners.notifyAllListener(listener => listener.onUserCountOrPropertyChanged?.(userList));
    }

    addOnMeRemovedFromRoomListener(listenerID: string, listener: ZegoMeRemovedFromRoomListener): void {
        this.kickOutListenerNotifyList.addListener(listenerID, listener);
    }

    removeOnMeRemovedFromRoomListener(listenerID: string): void {
        this.kickOutListenerNotifyList.removeListener(listenerID);
    }

    notifyRemovedFromRoomCommand(): void {
        this.kickOutListenerNotifyList.notifyAllListener(listener => listener.onSelfRemoved?.());
    }
}