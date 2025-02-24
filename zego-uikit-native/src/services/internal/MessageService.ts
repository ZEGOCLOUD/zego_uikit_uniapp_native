import { ExpressEngineProxy } from '../express/ExpressEngineProxy';
import {
    ZegoInRoomMessage,
    ZegoInRoomMessageListener,
    ZegoInRoomMessageSendStateListener,
    ZegoInRoomMessageState,
    ZegoUIKitRoom
} from '../defines';
import UIKitCore from './UIKitCore';
import { NotifyList } from './NotifyList';

export class MessageService {
    private messageListeners: NotifyList<ZegoInRoomMessageListener> = new NotifyList();

    public static messageID = 0;

    public async sendInRoomMessage(message: string, listener?: ZegoInRoomMessageSendStateListener): Promise<void> {
        const room: ZegoUIKitRoom = UIKitCore.getInstance().getRoom();
        MessageService.messageID -= 1;

        const inRoomMessage: ZegoInRoomMessage = {
            message: message,
            messageID: MessageService.messageID,
            timestamp: Date.now(),
            user: UIKitCore.getInstance().getLocalCoreUser()!.getUIKitUser(),
            state: ZegoInRoomMessageState.Idle
        };

        const inRoomMessages: ZegoInRoomMessage[] = UIKitCore.getInstance().getInRoomMessages();
        inRoomMessages.push(inRoomMessage);

        if (listener) {
            listener.onInRoomMessageSendingStateChanged?.(inRoomMessage);
        }
        this.messageListeners.notifyAllListener((listener) => {
            listener.onInRoomMessageSendingStateChanged?.(inRoomMessage);
        })

        const timer = setTimeout(() => {
            if (inRoomMessage.state === ZegoInRoomMessageState.Idle) {
                inRoomMessage.state = ZegoInRoomMessageState.Sending;
                if (listener) {
                    listener.onInRoomMessageSendingStateChanged?.(inRoomMessage);
                }
                this.messageListeners.notifyAllListener((listener) => {
                    listener.onInRoomMessageSendingStateChanged?.(inRoomMessage);
                })
            }
        }, 300);

        const result = await ExpressEngineProxy.sendBroadcastMessage(room.roomID, message)
        clearTimeout(timer)

        inRoomMessage.state = result.errorCode === 0 ? ZegoInRoomMessageState.Success : ZegoInRoomMessageState.Failed;
        if (listener) {
            listener.onInRoomMessageSendingStateChanged?.(inRoomMessage);
        }
        this.messageListeners.notifyAllListener((listener) => {
            listener.onInRoomMessageSendingStateChanged?.(inRoomMessage);
        })

    }

    public resendInRoomMessage(message: ZegoInRoomMessage, listener: ZegoInRoomMessageSendStateListener): void {
        const inRoomMessages: ZegoInRoomMessage[] = UIKitCore.getInstance().getInRoomMessages();
        for (const inRoomMessage of inRoomMessages) {
            if (inRoomMessage.messageID === message.messageID) {
                inRoomMessages.splice(inRoomMessages.indexOf(inRoomMessage), 1);
                break;
            }
        }
        this.sendInRoomMessage(message.message, listener);
    }

    public notifyInRoomMessageReceived(roomID: string, messageList: ZegoInRoomMessage[]): void {
        this.messageListeners.notifyAllListener((listener) => {
            listener.onInRoomMessageReceived?.(messageList);
        })
    }

    public addInRoomMessageReceivedListener(listenerID: string, listener: ZegoInRoomMessageListener): void {
        this.messageListeners.addListener(listenerID, listener);
    }

    public removeInRoomMessageReceivedListener(listenerID: string): void {
        this.messageListeners.removeListener(listenerID)
    }

    public clear(): void {
        this.messageListeners.clear();
    }
}