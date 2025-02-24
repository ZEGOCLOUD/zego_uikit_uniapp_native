
/**
 * 使用uni的api实现的本地缓存
 */
export class LocalStorage {
    static get(key: string) {
        return uni.getStorageSync(key)
    }

    static set(key: string, value: any) {
        return uni.setStorageSync(key, value)
    }
    static remove(key: string) {
        return uni.removeStorageSync(key)
    }
}