export * from "./logger"
export * as Types from "./types"
export * from "./singleton"
export * from "./LocalStorage"
export * from "./SessionStorage"
export * from "./UIKitReport"

import { AppState } from "../services/defines"
import Platform from "./platform"

export {
    Platform
}

export function generateUUID(length: number = 4): string {
    // 确保长度在合理的范围内
    if (length < 4 || length > 36) {
        throw new Error('UUID length must be between 8 and 36 characters.');
    }

    // 生成指定长度的UUID
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.substring(0, length).replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });

    return uuid;
}


/**
 * 生成推流ID
 * @param roomID 
 * @param userID 
 * @param channel 
 * @returns 
 */
export function makeStreamID(roomID: string, userID: string, channel = 'main'): string {
    return `${roomID}_${userID}_${channel}`
}

export function makeListenerID(): string {
    return `listener_${generateUUID()}`
}


export function makeCallID(userID: string) {
    return `call_${userID}_${generateUUID()}`
}

export function makeTag(tag: string): string {
    return `[${tag}:${generateUUID(4)}]`
}


// 深度合并函数
function mergeDeep(target: any, source: any) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
    }

    return Object.assign({}, target, source);
}

/**
 * 辅助函数：合并默认配置和用户配置
 * @param defaultConfig 
 * @param userConfig 
 * @returns 
 */
export function mergeConfigs<T>(defaultConfig: T, userConfig: Partial<T> | null | undefined): T {
    // 如果用户配置为 null 或 undefined，则直接返回默认配置
    if (!userConfig) {
        return defaultConfig;
    }

    // 使用深度合并函数合并默认配置和用户配置
    return mergeDeep(defaultConfig, userConfig) as T;
}

/**
 * 深拷贝一个对象
 * @param obj 
 */
export function deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
};


/**
 * 创建一个防抖函数，确保在指定的时间间隔内只执行一次。
 * 
 * @param func - 要防抖的函数。
 * @param wait - 等待时间（毫秒）。
 * @returns 防抖后的函数。
 * 
 * @example
 * // 示例用法
 * const debouncedFunction = debounce(() => {
 *   console.log('Function called');
 * }, 1000);
 * 
 * // 连续调用 debouncedFunction，但在 1000 毫秒内只会执行一次
 * debouncedFunction();
 * debouncedFunction();
 * debouncedFunction();
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>): void {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, wait);
    };
}

export function getAppState() {
    const app = getApp({ allowDefault: true })
    const { isHide } = app.globalData || {}
    const state = isHide ? AppState.Background : AppState.Active
    return {
        isHide,
        state,
    }
}

export const getShotName = (name?: string) => {
    if (!name) {
        return '';
    }
    const nl = name.split(' ');
    let shotName = '';
    nl.forEach((part) => {
        if (part !== '') {
            shotName += part.substring(0, 1);
        }
    });
    return shotName;
};