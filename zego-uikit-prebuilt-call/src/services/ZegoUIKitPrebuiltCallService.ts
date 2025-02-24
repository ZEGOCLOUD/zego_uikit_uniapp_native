import { ZegoUIKitPrebuiltCallInvitationConfig } from "src/config/ZegoUIKitPrebuiltCallInvitationConfig";
import { CallInvitationServiceImpl } from "./internal/CallInvitationServiceImpl";
import { CallInviteConfig, CancelInviteConfig } from "../config/defines";
import { clearGlobalContext } from "@/uni_modules/zego-UIKitCore"


export default class ZegoUIKitPrebuiltCallService {

    public static getVersion(): string {
        return CallInvitationServiceImpl.getInstance().getVersion();
    }

    public static async init(appID: number, appSign: string, userID: string, userName: string,
        config: ZegoUIKitPrebuiltCallInvitationConfig): Promise<boolean> {

        // 初始化前清除全局实例 防止重复初始化及初始化完成前调用unit导致的报错
        clearGlobalContext()

        const result = await CallInvitationServiceImpl.getInstance().init(appID, appSign)
        if (!result) {
            return result
        }

        CallInvitationServiceImpl.getInstance().loginUser(userID, userName)

        CallInvitationServiceImpl.getInstance().setCallInvitationConfig(config)
        // 离线推送配置
        const enable = config.enableNotifyWhenAppRunningInBackgroundOrQuit
        CallInvitationServiceImpl.getInstance().enableOfflinePush(enable as boolean)
        return true;
    }

    public static setCallInvitationConfig(config: ZegoUIKitPrebuiltCallInvitationConfig) {
        CallInvitationServiceImpl.getInstance().setCallInvitationConfig(config)
    }

    // public static async reInit() {
    //     const { appID, appSign } = SessionStorage.get(StoreKeys.APP_INFO)
    //     const { userID, userName } = SessionStorage.get(StoreKeys.USER_INFO)
    //     const invitationConfig = SessionStorage.get(StoreKeys.CALL_INVITATION_CONFIG)
    //     return await ZegoUIKitPrebuiltCallService.init(appID, appSign, userID, userName, invitationConfig)
    // }

    public static sendInvitation(config: CallInviteConfig) {
        return CallInvitationServiceImpl.getInstance().sendInvitation(config)
    }

    public static cancelInvitation(config: CancelInviteConfig) {
        return CallInvitationServiceImpl.getInstance().cancelInvitation(config)
    }


    public static unInit(): void {
        CallInvitationServiceImpl.getInstance().logoutUser()
        CallInvitationServiceImpl.getInstance().unInit()
        // 销毁
        CallInvitationServiceImpl.deleteInstance()
    }


}