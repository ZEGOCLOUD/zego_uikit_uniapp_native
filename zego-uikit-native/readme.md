# zego-UIKitCore

UIKitCore 提供了一些基础的通话 API，可以引用该组件进行完全个性化的 UI 开发。若您希望使用一些预设的场景可以使用 `zego-PrebuiltCall` 插件。

这份文档将指导您如何在 uni-app 项目集成 `音视频通话 UIKit` uniapp SDK 并快速开始音视频通话。

## 准备环境

在开始集成音视频 UIKit 前，请确保开发环境满足以下要求：

- 参考 [uni-app 文档](https://zh.uniapp.dcloud.io/quickstart-hx.html)创建项目。
- HBuilderX 3.0.0 或以上版本。
- IOS
  - Xcode 15.0 或以上版本。
  - iOS 12.0 或以上版本且支持音视频的 iOS 设备。
- Android
  - Android Studio 2020.3.1 或以上版本。
  - Android SDK 25、Android SDK Build-Tools 25.0.2、Android SDK Platform-Tools 25.x.x 或以上版本。
  - Android 4.4 或以上版本，且支持音视频的 Android 设备。
- 设备已经连接到 Internet。

## 前提条件

- 已在 [ZEGO 控制台](https://console.zego.im) 创建项目，并申请有效的 AppID 和 AppSign，详情请参考 [控制台 - 项目信息](https://doc-zh.zego.im/article/12107)。
- 联系 ZEGO 技术支持，开通 UIKit 相关服务。

## 基础使用

### 引入SDK

1. 若您已有 uni-app 项目，则跳过此步骤。若尚无 uni-app 项目，请参考 uni-app 开发者文档 [创建 uni-app](https://uniapp.dcloud.net.cn/quickstart-hx.html) 快速创建项目。

> 注意：IOS 需要苹果开发者证书。为方便测试，可以暂时只勾选安卓端。

2. 设置 Android SdkVersion
单击项目目录的 “manifest.json” 文件后，单击 “App 常用其他设置”。 设置 Android minSdkVersion 为 23, targetSdkVersion 为 33。

<img src="https://media-resource.spreading.io/docuo/workspace743/b15828c70dcfacdbb1e91d99a16d0514/97cc39689b.png" alt=""/>

3. 在插件市场购买 [ZEGO 即构实时音视频 SDK](https://ext.dcloud.net.cn/plugin?id=3617)和[Zego ZIM 即时通讯 SDK](https://ext.dcloud.net.cn/plugin?id=8601)。购买时填入的 AppID 必须和后面需要运行的 AppID 一致。

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/fc005e6051.png" alt="free_buy_for_cloud_build.png"/>

<img src="https://media-resource.spreading.io/docuo/workspace743/b15828c70dcfacdbb1e91d99a16d0514/c30b1f1c5a.png" alt="free_buy_for_cloud_build.png"/>

单击项目目录的 “manifest.json” 文件后，单击 “App 原生插件配置 > 云端插件 [选择云端插件]”。

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/65c125a799.png" alt="choose_native_plugins.png" />

在“云端插件选择”弹窗勾选上面购买的 ZEGO 即构实时音视频 SDK 并确认。
<img src="https://media-resource.spreading.io/docuo/workspace743/b15828c70dcfacdbb1e91d99a16d0514/6ef174060a.png" alt="choose_native_plugins.png" />

4. 在插件市场导入 [Zego ZIM 即时通讯原生插件（JS 封装层）](https://ext.dcloud.net.cn/plugin?id=8648)

<img src="https://media-resource.spreading.io/docuo/workspace743/b15828c70dcfacdbb1e91d99a16d0514/18428d374c.png" alt="choose_native_plugins.png" />

5. 将插件市场的 [ZEGOUIKitCore](https://ext.dcloud.net.cn/plugin?id=19686) 下载并导入 HBuilderX。

6. 创建自定义基座，填入 AppID。

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/47d08e1b29.png" alt="run_with_custom.png"/>

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/02f56f8dad.png" alt="config_custom.png"/>

> 由于 iOS 项目需要 Apple 开发者证书。为方便测试，您可以暂时只勾选 Android 端。


7. 在业务页面中引入插件。

在 vue 的 js 引入 zego-UIKitCore。
```js
import { ZegoLayoutMode, ZegoViewPosition } from "@/uni_modules/zego-UIKitCore";

const appID = YOUR_APPID;
const appSign = YOUR_APPSIGN;
const userID = YOUR_USERID;
const userName = YOUR_USERNAME;
const callID = YOUR_CALLID;

const LISTENER_ID = makeListenerID() // 生成回调ID

// 初始化
await ZegoUIKit.init(appID, appSign, ZegoUIKitScenario.StandardVideoCall)

ZegoUIKit.addRoomStateChangedListener(LISTENER_ID, {
    onRoomStateChanged(roomID, reason, errorCode, jsonObject) {
        zloginfo(TAG, 'roomStateChangedListener onRoomStateChanged', roomID, reason, errorCode, jsonObject);
    },
})

// 登录
ZegoUIKit.login(userID, userName);


// 进房
ZegoUIKit.joinRoom(callID, false, (errorCode) => {
    if (errorCode === 0) {
        // 登录房间成功
        // 启动推流
        ZegoUIKit.useFrontFacingCamera(true);
        ZegoUIKit.turnCameraOn(userID, true)
        ZegoUIKit.turnMicrophoneOn(userID, true)
    } else {
        // 登录房间失败
    }
})
```

在 vue 的 template 中使用 zego-PrebuiltCall 带 ui 组件，并将配置传入组件。
```vue
<template>
   <view class="container fill-parent">
		<view class="fill-parent" pointer-events="auto">
			<ZegoAudioVideoContainer class="audio-video-view-container fill-parent"
				:audio-video-config="audioVideoViewConfig" :layout="layout">
				<template v-if="$slots.avatarView" #avatarView="{ userInfo }">
					<slot name="avatarView" :userInfo="userInfo"></slot>
				</template>
				<template v-if="$slots.audioVideoForeground" #audioVideoForeground="{ userInfo }">
					<slot name="audioVideoForeground" :userInfo="userInfo"></slot>
				</template>
				<template v-else #audioVideoForeground="{ userInfo }">
					<AudioVideoForegroundView :user-info="userInfo!"
						:show-camera-state-on-view="audioVideoViewConfig.showCameraStateOnView"
						:show-microphone-state-on-view="audioVideoViewConfig.showMicrophoneStateOnView"
						:show-user-name-on-view="audioVideoViewConfig.showUserNameOnView" />
				</template>
			</ZegoAudioVideoContainer>
		</view>
	</view>
</template>
```

## 运行和测试

至此，您已经完成了所有步骤！

只需在 HBuilderX 中点击**运行到手机或模拟器**，选择需要运行的端侧与基座，即可在设备上运行和测试您的应用程序。

## 常见问题

[如何处理接入错误](https://doc-zh.zego.im/faq?product=Call_Kit&platform=uni-app)
