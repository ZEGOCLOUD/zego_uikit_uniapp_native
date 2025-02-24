/**
 * 为了让 编译通过，这里先写一些空函数
 */
declare type UTSJSONObject = object;
export declare const getVersion: () => string;
export declare const initReporter: (appID: number, signOrToken: string, params: UTSJSONObject) => void;
export declare const unInitReporter: () => void;
export declare const reportCustomEvent: (eventName: string, params: UTSJSONObject) => void;
export declare const updateUserID: (userID: string) => void;
export declare const updateCommonParams: (params: UTSJSONObject) => void;
export {};
