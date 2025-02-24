// 导入必要的模块和函数
import { initReporter, unInitReporter, getVersion, reportCustomEvent, updateUserID, updateCommonParams } from "@/uni_modules/zego-UIKitReport";
import { zloginfo, zlogwarning } from "./logger";

const TAG = '[UIKitReport]'
/**
 * UIKitReport 类，用于与 Zego UIKit 数据上报功能进行交互。
 */
export class UIKitReport {
    static isInit: boolean = false;
    /**
     * 获取当前版本号。
     * @returns {string} 当前版本号。
     */
    static getVersion(): string {
        try {
            zloginfo(TAG, 'getVersion')
            return getVersion();
        } catch(err) {
            zlogwarning(TAG, 'getVersion err:', err)
            return ''
        }
    }

    /**
     * 初始化数据上报器。
     * @param appID - 应用程序的 ID。
     * @param signOrToken - 签名或令牌。
     * @param userID - 用户的 ID。
     * @param commonParams - 通用参数。
     */
    static init(appID: number, signOrToken: string, commonParams: object) {
        try {
            const _appID = Number(appID)
            zlogwarning(TAG, 'init appID:', _appID)
            initReporter(_appID, signOrToken, commonParams ?? {});
            this.isInit = true;
            return true
        } catch(err) {
            zlogwarning(TAG, 'init err:', err)
            return false
        }
    }

    /**
     * 注销数据上报器。
     * 该方法用于注销之前初始化的数据上报器，释放相关资源。
     */
    static unInit() {
        // 调用 unInitReporter 函数来注销数据上报器
        if (!this.isInit) return
        zlogwarning(TAG, 'unInit')
        unInitReporter();
        this.isInit = false;
    }

    /**
     * 更新用户ID。
     * @param userID - 要更新的用户ID。
     * @remarks
     * 这个方法用于更新数据上报器中的用户ID。
     * 如果传入的用户ID为空，则不会进行任何操作。
     */
    static updateUserID(userID: string) {
        if (!this.isInit) return
        zloginfo(TAG, 'updateUserID:', userID)
        if (userID) {
            updateUserID(userID)
        }
    }

    /**
     * 更新公共参数.
     * @param commonParams - 通用参数。
     * @remarks
     * 这个方法用于更新数据上报器中的用户ID。
     * 如果传入的用户ID为空，则不会进行任何操作。
     */
    static updateCommonParams(commonParams: object) {
        if (!this.isInit) return
        zloginfo(TAG, 'updateCommonParams:', JSON.stringify(commonParams))
        if (commonParams) {
            updateCommonParams(commonParams)
        }
    }
    /**
     * 上报自定义事件。
     * @param event - 要上报的事件名称。
     * @param paramsMap - 与事件相关的参数映射。
     * @remarks
     * 这个方法用于向服务器发送一个自定义事件上报，其中包含了事件名称和相关的参数。
     * 如果参数映射为空，则会发送一个空的参数对象。
     */
    static reportEvent(event: string, paramsMap: object) {
        // 调用 reportCustomEvent 函数来上报自定义事件
        if (!this.isInit) return
        zloginfo(TAG, 'reportEvent:', event)
        reportCustomEvent(event, paramsMap ?? {});
    }
}
