import { getSingletonInstance } from "@/uni_modules/zego-UIKitCore";
import { ZegoDurationUpdateListener } from "../config/defines";

export class DurationTracker {
    private static name: string = '_DurationTracker';
    private _durationStart: number = Date.now();
    private _duration: number = 0;
    private readonly _listeners: Map<string, ZegoDurationUpdateListener> = new Map(); // 将_callbacks更改为_listeners

    public static getInstance(): DurationTracker {
        return getSingletonInstance(DurationTracker)
    }

    public initialize(): void {
        this.reset();
    }

    public reset(): void {
        this._duration = 0;
        this._durationStart = Date.now();
    }

    public advance(): void {
        const realDuration = Math.floor((Date.now() - this._durationStart) / 1000);
        const duration = this._duration + 1;
        if (realDuration >= duration + 1) {
            this._duration = realDuration;
        } else {
            this._duration = duration;
        }
        this.notifyListeners(duration);
    }

    public currentDuration(): number {
        const realDuration = Math.floor((Date.now() - this._durationStart) / 1000);
        if (realDuration - this._duration > 2) {
            return realDuration;
        }
        return this._duration;
    }

    public addListener(listenerID: string, listener: ZegoDurationUpdateListener): void {
        this._listeners.set(listenerID, listener);
    }

    public removeListener(listenerID: string): void {
        this._listeners.delete(listenerID);
    }

    private notifyListeners(newDuration: number): void {
        this._listeners.forEach((listener) => listener(newDuration));
    }
}

export function durationFormat(duration: number): string {
    const totalSeconds = duration || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // 使用padStart方法自动补零
    const formatTime = (time: number): string => time.toString().padStart(2, '0');

    // 构建格式化的时间字符串
    return `${hours > 0 ? `${formatTime(hours)}:` : ''}${formatTime(minutes)}:${formatTime(seconds)}`;
}