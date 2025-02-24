// 错误事件监听器接口
export interface ErrorEventsListener {
    /**
     * 当发生错误时调用此方法。
     * 
     * @param errorCode 错误代码，具体错误代码定义见 ErrorEventsListenerCode。
     * @param message   错误信息，对错误的详细描述。
     */
    onError(errorCode: ErrorEventsListenerCode, message: string): void;
}

// 错误代码定义类
export enum ErrorEventsListenerCode {
    // 成功（虽然在Java中未定义，但在TS中可作为参照对比）
    SUCCESS = 0,

    // 初始化参数错误
    INIT_PARAM_ERROR = -1,

    // 已经初始化过
    INIT_ALREADY = -2,
}