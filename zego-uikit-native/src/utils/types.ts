const toString = Object.prototype.toString;

export function isType(type: string, obj: any) {
    var clas = toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

export function isString(obj: any) {
    return toString.call(obj) === '[object String]';
}

export function isArray(obj: any) {
    return toString.call(obj) === '[object Array]';
}

export function isArguments(obj: any) {
    return toString.call(obj) === '[object Arguments]';
}

export function isObject(obj: any) {
    return toString.call(obj) === '[object Object]';
}

export function isFunction(obj: any) {
    return toString.call(obj) === '[object Function]';
}

export function isUndefined(obj: any) {
    return toString.call(obj) === '[object Undefined]';
}

export function isBoolean(obj: any) {
    return toString.call(obj) === '[object Boolean]';
}

export function isNumber(obj: any) {
    return toString.call(obj) === '[object Number]';
}