# UIKits Uniapp 移动端

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

## 运行调试

1. 前置依赖

将插件市场的 [ZegoExpressEngine 音视频插件（JS）](https://ext.dcloud.net.cn/plugin?id=7748) 插件 **下载并导入到HBuilderX** 中。

2. 安装依赖

通过 `pnpm i`，安装好依赖后，会自动进行构建，将 `zego-uikit-native` 和 `zego-uikit-prebuilt-call` 打包到 `uni_modules`。

3. 使用 zgdev 账号将个人开发账号加入该 `uni-app 应用标识` 对应的项目，或者使用 HBuilderX 打开 manifest.json，重新生成一个 `uni-app 应用标识`

4. 创建自定义基座，填入 AppID。

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/47d08e1b29.png" alt="run_with_custom.png"/>

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/02f56f8dad.png" alt="config_custom.png"/>

> 注意：IOS 需要苹果开发者证书。为方便测试，可以暂时只勾选安卓端。

5. 使用 zgdev 账号可以跳过该步骤。若为重新生成的 `uni-app 应用标识`，则需将插件市场的 [ZEGO 即构实时音视频 SDK](https://ext.dcloud.net.cn/plugin?id=3617) SDK 引入到项目中，并找到 manifest.json 中的 App 原生插件配置。

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/fc005e6051.png" alt="free_buy_for_cloud_build.png"/>

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/65c125a799.png" alt="choose_native_plugins.png" />

勾选上面购买的 ZEGO 即构实时音视频 SDK 并确认。
<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/2a4289a346.png" alt="check_and_confirm.png" />

6. 运行 `pnpm run dev` 启动开发，此时会监听 zego-uikit-native 和 zego-uikit-prebuilt-call 的 src 下所有ts、vue、nvue文件，并在文件修改后 3 秒执行一次构建，生成最新的 zego-PrebuiltCall 与 zego-UIKitCore 插件。

<img src="https://media-resource.spreading.io/docuo/workspace564/27e54a759d23575969552654cb45bf89/84e2c5cda7.png" alt="imported.png"/>

7. 运行和测试

在 HBuilderX 中点击**运行到手机或模拟器**，选择需要运行的端侧与基座，即可在设备上运行和测试应用程序。

8. 发行插件

该操作必须使用 `zgdev` 的账号。具体流程如下：
- 执行 `yarn build:all` 即可将最新代码打包为插件。
- 此后，在 HBuildX 中，选中 uni_modules 下的 `zego-UIKitCore`，右键选择 `发布到插件市场`。
- 此后，在 HBuildX 中，选中 uni_modules 下的 `zego-PrebuiltCall`，右键选择 `发布到插件市场`。
