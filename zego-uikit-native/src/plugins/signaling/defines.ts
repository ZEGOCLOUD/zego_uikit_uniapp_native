
// 房间命令消息类
export interface ZegoSignalingInRoomCommandMessage {
    // 消息ID
    messageID: string;
    // 时间戳
    timestamp: number;
    // 订单键
    orderKey: number;
    // 发送者用户ID
    senderUserID: string;
    // 文本内容
    text: string;
}

// 房间文本消息类
export interface ZegoSignalingInRoomTextMessage {
    // 消息ID
    messageID: string;
    // 时间戳
    timestamp: number;
    // 订单键
    orderKey: number;
    // 发送者用户ID
    senderUserID: string;
    // 文本内容
    text: string;
}

// 信令插件连接状态枚举
export enum ZegoSignalingConnectionState {
    // 断开连接状态
    Disconnected = 0,
    // 连接中状态
    Connecting = 1,
    // 已连接状态
    Connected = 2,
    // 重新连接中状态
    Reconnecting = 3
}

// 信令插件通知配置类
export interface ZegoSignalingNotificationConfig {
    // 资源ID
    resourceID?: string;
    // 标题
    title?: string;
    // 消息内容
    message?: string;
}


// 定义了房间内用户属性的接口，用于描述用户在房间内的各种属性信息
export interface ZegoSignalingUsersInRoomAttributes {
    // 下一个标志，用途根据不同上下文确定
    nextFlag: string;
    // 属性映射，映射每个用户的各种属性
    attributesMap: Record<string, Record<string, string>>;
}

// 定义了设置房间内用户属性结果的接口，用于返回设置操作的结果
export interface ZegoSignalingSetUsersInRoomAttributesResult {
    // 出错的用户列表，列出设置过程中出现错误的用户
    errorUserList: string[];
    // 成功设置的用户属性映射
    attributesMap: Record<string, Record<string, string>>;
    // 错误键映射，列出每个用户在设置过程中出错的属性键
    errorKeysMap: Record<string, string[]>
}