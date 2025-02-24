/**
 * 为了让 编译通过，这里先写一些空函数
 */
export const getVersion = function () {
    return "0.0.0";
};
export const initReporter = function (appID, signOrToken, params) {
    console.warn("initReporter");
};
export const unInitReporter = function () {
    console.warn("unInitReporter");
};
export const reportCustomEvent = function (eventName, params) {
    console.warn("reportCustomEvent");
};
export const updateUserID = function (userID) {
    console.warn("Not implement updateUserID");
};

export const updateCommonParams = function (params) {
    console.warn("Not implement updateCommonParams");
};