import { generateUUID, SessionStorage } from "@/uni_modules/zego-UIKitCore"
import { URLParser } from "./URLParser"



/**
 * uni 不支持跳转页面时待大量数据, 封装一下
 */
export class Navigation {

    static navigateTo(path: string, params: Record<string, any>) {

        const paramsKey = generateUUID(32)
        // 给 path 拼接上 key
        path = URLParser.append(path, { paramsKey })
        // 缓存参数
        SessionStorage.set(paramsKey, params)

        return uni.navigateTo({
            url: path,
        })
    }

    static redirectTo(path: string, params: Record<string, any>) {

        const paramsKey = generateUUID(32)
        // 给 path 拼接上 key
        path = URLParser.append(path, { paramsKey })

        // 缓存参数
        SessionStorage.set(paramsKey, params)

        return uni.redirectTo({
            url: path,
        })
    }

    static getParams(query: any) {
        // 从 query 解析出 paramsKey
        const { paramsKey } = query
        return SessionStorage.remove(paramsKey)
    }

}

