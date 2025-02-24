
const TAG = 'ZEGOUIKit'
function getStorage() {
    const app = getApp({ allowDefault: true })
    if (!app.globalData) {
        app.globalData = {}
    }
    if (!app.globalData[TAG]) {
        app.globalData[TAG] = {}
    }
    return app.globalData[TAG]
}

/**
 * 临时的会话缓存, 应用退出后就会销毁
 * 数据是挂载在 globalData 上的
 */
export class SessionStorage {

    static get(key: string) {
        const store = getStorage()
        return store[key] || null
    }

    static set(key: string, value: any) {
        const store = getStorage()
        store[key] = value
    }

    static remove(key: string) {
        const store = getStorage()
        const value = store[key]
        delete store[key]
        return value
    }
}