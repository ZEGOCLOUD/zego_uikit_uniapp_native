export class EventHandlerList<T> {
    private handlerList: T[] = [];
    private autoDeleteHandlerList: T[] = [];

    addEventHandler(eventHandler: T, autoDelete: boolean = false): void {
        if (autoDelete) {
            this.autoDeleteHandlerList.push(eventHandler);
        } else {
            this.handlerList.push(eventHandler);
        }
    }

    removeEventHandler(eventHandler: T): void {
        this.autoDeleteHandlerList = this.autoDeleteHandlerList.filter(handler => handler !== eventHandler);
        this.handlerList = this.handlerList.filter(handler => handler !== eventHandler);
    }

    removeAutoDeleteRoomListeners(): void {
        this.autoDeleteHandlerList = [];
    }

    clear(): void {
        this.removeAutoDeleteRoomListeners();
        this.handlerList = [];
    }

    getAutoDeleteHandlerList(): T[] {
        return this.autoDeleteHandlerList;
    }

    getHandlerList(): T[] {
        return this.handlerList;
    }

    notifyAllListener(notifier: (handler: T) => void): void {
        this.autoDeleteHandlerList.forEach(handler => {
            if (handler !== null) {
                notifier(handler);
            }
        });
        this.handlerList.forEach(handler => notifier(handler));
    }
}
