import { zlogwarning } from "../../utils";

export class NotifyList<T> {
    private listeners: Record<string, T> = {};
    public addListener(key: string, listener: T): void {
        // 检查一下是否已经有这个key 
        if (this.listeners[key]) {
            zlogwarning(`The listener key: ${key} already exists, please check the key`)
        }
        this.listeners[key] = listener
    }

    public removeListener(key: string): void {
        delete this.listeners[key];
    }

    public notifyAllListener(notifier: (listener: T) => void): void {

        Object.values(this.listeners).forEach(listener => {
            notifier(listener);
        });
    }

    public get length() {
        return Object.keys(this.listeners).length;
    }

    public clear(): void {
        this.listeners = {};
    }
}