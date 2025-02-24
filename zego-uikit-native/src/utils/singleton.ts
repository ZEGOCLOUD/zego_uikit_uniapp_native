import { zloginfo, zlogwarning } from "./logger";

const TAG = 'ZEGOUIKit'
function getTypeName<T extends { new(...args: any[]): any }>(T: T): string {
    return T.name;
}

function getGlobalContext() {
    const app = getApp({ allowDefault: true })
    if (!app.globalData) {
        app.globalData = {}
    }
    if (!app.globalData[TAG]) {
        app.globalData[TAG] = {}
    }
    return app.globalData[TAG]
}

const sessionContext: Record<string, any> = {}

function getSessionContext() {
    return sessionContext
}

export enum SingletonScope {
    Session,
    Global,
}

export function getSingletonInstance<T>(constructor: new () => T, scope: SingletonScope = SingletonScope.Session): T {
    const name = getTypeName(constructor)
    const context = scope === SingletonScope.Global ? getGlobalContext() : getSessionContext()
    if (!context[name]) {
        zlogwarning(TAG, `Make new singleton instance of ${name}, scope=${scope}`)
        context[name] = new constructor();
    }
    return context[name];
}

export function deleteSingletonInstance(constructor: new () => any, scope: SingletonScope = SingletonScope.Session) {
    const name = getTypeName(constructor)
    const context = scope === SingletonScope.Global ? getGlobalContext() : getSessionContext()
    zlogwarning(TAG, `Delete singleton instance of ${name}, scope=${scope}`)
    delete context[name]
}

export function clearGlobalContext() {
    const app = getApp({ allowDefault: true })
    app.globalData = {}
}