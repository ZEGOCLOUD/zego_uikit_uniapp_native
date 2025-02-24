import { gotoAppPermissionSetting, judgeIosPermission, requestAndroidPermission } from "@/uni_modules/zego-UIKitCore/utils/permission";
import { t } from "../lang";
import { Platform, zlogerror, zloginfo } from "@/uni_modules/zego-UIKitCore";

function getMajorVersion(versionStr: string): number {
    // 首先尝试将整个字符串转换为整数
    const majorVersion = parseInt(versionStr, 10);

    // 如果转换成功并且是一个有效的整数，则返回
    if (!isNaN(majorVersion)) {
        return majorVersion;
    }

    // 使用正则表达式匹配主版本号
    const match = versionStr.match(/^(\d+)\./);
    if (match && match[1]) {
        // 转换匹配到的第一个数字为整数并返回
        return parseInt(match[1], 10);
    }
    // 如果没有找到匹配项，则返回0
    return 0;
}


type PermissionConfig = {
    authorizedKey: keyof UniApp.GetAppAuthorizeSettingResult;
    permissionName: string;

    settings?: boolean;         // 拒绝授权时是否跳转至设置页
    modalTitle?: string;        // 申请权限弹窗标题
    modalContent?: string;      // 申请权限弹窗内容
};

type Permission = 'None' | 'Camera' | 'Microphone' | 'Notifications'

const AuthInfo: Record<Permission, PermissionConfig> = {
    None: { // 做Nothing
        authorizedKey: "cameraAuthorized",
        permissionName: ""
    },
    Camera: {
        authorizedKey: 'cameraAuthorized',
        permissionName: 'android.permission.CAMERA',
        settings: true,
        modalContent: t("AuthConfirmation.cameraDeny")
    },
    Microphone: {
        authorizedKey: 'microphoneAuthorized',
        permissionName: 'android.permission.RECORD_AUDIO',
        settings: true,
        modalContent: t("AuthConfirmation.microphoneDeny")
    },
    Notifications: {
      authorizedKey: 'notificationAuthorized',
      permissionName: 'android.permission.POST_NOTIFICATIONS',
      settings: true,
      modalContent: t("AuthConfirmation.microphoneDeny")
    }
}

async function ensureAndroidPermission(config: PermissionConfig): Promise<boolean> {
    const appAuthorizeSetting = uni.getAppAuthorizeSetting();
    let isAuthorized = appAuthorizeSetting[config.authorizedKey] === 'authorized';
    // const isDenied = appAuthorizeSetting[config.authorizedKey] === 'denied';
    if (isAuthorized) {
        // 已经有权限
        return true
    }
    if (Platform.isAndroid) {
        const result = await requestAndroidPermission(config.permissionName);
        zloginfo('requestAndroidPermission permissionName:', config.permissionName, 'result:', JSON.stringify(result))
        if (result.code === 1) { // 通过授权
            // 但是这里有坑, 低端机, 比如 android 6, 不会有弹窗, 且会直接告诉你授权通过了, 这里要再确认一下
            // https://project.feishu.cn/uikit/issue/detail/4876382986
            const appAuthorizeSetting = uni.getAppAuthorizeSetting();
            isAuthorized = appAuthorizeSetting[config.authorizedKey] === 'authorized';
            if (isAuthorized) {
                // 是真的授权了
                return true;
            }
            // 假授权, 需要跳转到设置页
            // run over
        }
    } else {
        return true
    }
    // 其他情况, 跳转到设置页
    if (config.settings) {
        const {
            modalTitle = t("AuthConfirmation.permissionTitle"),
            modalContent = ""
        } = config

        const { confirm } = await uni.showModal({
            title: modalTitle,
            content: modalContent,
            showCancel: true,
            confirmText: t("AuthConfirmation.confirmButton")
        });
        if (confirm) {
            // 确认要跳转
            gotoAppPermissionSetting();
        }
    }
    // 不管调不跳转, 这次的权限申请都是失败了
    return false;
}

async function ensureAllPermissions(psermissionList: PermissionConfig[]): Promise<boolean> {
    if (Platform.isAndroid) {
        for (const permission of psermissionList) {
            if (permission === AuthInfo.None) {
                continue;
            }
            const auth = await ensureAndroidPermission(permission)
            if (!auth) {
                zlogerror('Android Permissions [', permission.permissionName, '] permission denied')
                return false
            }
        }
        return true
    }
    return true
}

function requestPermission() {
  
}

function toPermissionPage() {
  const main: any = plus.android.runtimeMainActivity();
  const pkName = main.getPackageName();
  const uid = main.getApplicationInfo().plusGetAttribute('uid');
  uni.showModal({
    title: '通知权限开启提醒',
    content: '您还没有开启通知权限，无法接受到消息通知，请前往设置！',
    showCancel: true,
    confirmText: '去设置',
    cancelText: '稍后设置',
    success: function (res) {
      if (res.confirm) {
        const Intent: any = plus.android.importClass(
          'android.content.Intent',
        );
        const Build: any = plus.android.importClass('android.os.Build');
        //android 8.0引导
        if (Build.VERSION.SDK_INT >= 26) {
          const intent = new Intent(
            'android.settings.APP_NOTIFICATION_SETTINGS',
          );
          intent.putExtra('android.provider.extra.APP_PACKAGE', pkName);
          main.startActivity(intent); // 跳转到该应用的系统通知设置页
        } else if (Build.VERSION.SDK_INT >= 21) {
          //android 5.0-7.0
          const intent = new Intent(
            'android.settings.APP_NOTIFICATION_SETTINGS',
          );
          intent.putExtra('app_package', pkName);
          intent.putExtra('app_uid', uid);
          main.startActivity(intent); // 跳转到该应用的系统通知设置页
        }
      }
    },
  });
}
/**
 * 设置手机通知权限
 */
const setPushPermissions = () => {
    // #ifdef APP-PLUS
    if (plus.os.name == 'Android') {
      // 判断是Android
      const main: any = plus.android.runtimeMainActivity();
      let NotificationManagerCompat: any = plus.android.importClass(
        'android.support.v4.app.NotificationManagerCompat',
      );
      //android.support.v4升级为androidx
      if (NotificationManagerCompat == null) {
        NotificationManagerCompat = plus.android.importClass(
          'androidx.core.app.NotificationManagerCompat',
        );
      }
      const areNotificationsEnabled =
        NotificationManagerCompat.from(main).areNotificationsEnabled();
      // 未开通‘允许通知’权限，则弹窗提醒开通，并点击确认后，跳转到系统设置页面进行设置
      if (!areNotificationsEnabled) {
        const { permissionName } = AuthInfo.Notifications
        const Build: any = plus.android.importClass("android.os.Build");
        if (Build.VERSION.SDK_INT >= 33) {
          plus.android.requestPermissions(
            [permissionName],
            ({ granted = [] }) => {
              if (!granted.includes(permissionName)) toPermissionPage()
            },
            (error) => {
              console.log("申请权限错误：" + error.code + " = " + error.message);
              toPermissionPage()
            }
          );
          return
        }
        toPermissionPage()
      }
    } else if (plus.os.name == 'iOS') {
      // 判断是ISO
      let isOn = undefined;
      let types = 0;
      const app = plus.ios.invoke('UIApplication', 'sharedApplication');
      const settings = plus.ios.invoke(app, 'currentUserNotificationSettings');
      if (settings) {
        types = settings.plusGetAttribute('types');
        plus.ios.deleteObject(settings);
      } else {
        types = plus.ios.invoke(app, 'enabledRemoteNotificationTypes');
      }
      plus.ios.deleteObject(app);
      isOn = 0 != types;
      if (isOn == false) {
        uni.showModal({
          title: '通知权限开启提醒',
          content: '您还没有开启通知权限，无法接受到消息通知，请前往设置！',
          showCancel: true,
          confirmText: '去设置',
          cancelText: '稍后设置',
          success: function (res) {
            if (res.confirm) {
              const app = plus.ios.invoke('UIApplication', 'sharedApplication');
              const setting = plus.ios.invoke(
                'NSURL',
                'URLWithString:',
                'app-settings:',
              );
              plus.ios.invoke(app, 'openURL:', setting);
              plus.ios.deleteObject(setting);
              plus.ios.deleteObject(app);
            }
          },
        });
      }
    }
    // #endif
};

export default {
    AuthInfo,
    ensureAndroidPermission,
    ensureAllPermissions,
    setPushPermissions,
}