


declare const plus: any;

let isIos: boolean = false;
let isAndroid: boolean = false;
// #ifdef APP-PLUS
isIos = (plus.os.name == "iOS")
isAndroid = (plus.os.name == "Android")
// #endif

// uniapp 获取运行环境版本
const getRuntimeVersion = () => {
    const { uniRuntimeVersion } = uni.getSystemInfoSync()
    return uniRuntimeVersion
}

export default {
    isIos,
    isAndroid,
    getRuntimeVersion,
}