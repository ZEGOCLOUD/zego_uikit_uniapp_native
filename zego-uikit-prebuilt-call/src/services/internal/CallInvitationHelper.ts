import { ZegoUIKitUser, zlogerror, zloginfo, zlogwarning } from "@/uni_modules/zego-UIKitCore";

import PageConfig from './CallPageConfig';
import { CallInvitationServiceImpl } from "./CallInvitationServiceImpl";
import { Navigation } from "../../utils/Navigation";

const TAG = '[CallInvitationHelper]'

// 呼叫邀请的工具类
export default class CallInvitationHelper {
    private static _instance: CallInvitationHelper | null = null;
    private constructor() { }
    static getInstance() {
        return this._instance || (this._instance = new CallInvitationHelper());
    }

    // sendCallInvitation(invitees, isVideoCall, navigation, options) {
    //   const {
    //     resourceID = '',
    //     timeout = 60,
    //     notificationTitle,
    //     notificationMessage,
    //     callID,
    //     customData = '',
    //     callName,
    //     showWaitingPageWhenGroupCall = false,
    //   } = options;

    //   const localUser = ZegoPrebuiltPlugins.getLocalUser();
    //   const roomID = callID ?? `call_${localUser.userID}_${Date.now()}`;
    //   const data = JSON.stringify({
    //     call_id: roomID,
    //     call_name: callName,
    //     invitees: invitees.map(invitee => {
    //       return { user_id: invitee.userID, user_name: invitee.userName }
    //     }),
    //     type: isVideoCall ? ZegoInvitationType.videoCall : ZegoInvitationType.voiceCall,
    //     inviter: { id: localUser.userID, name: localUser.userName },
    //     custom_data: customData,
    //   });
    //   const inviteeIDs = invitees.map(invitee => {
    //     return invitee.userID
    //   });
    //   const type = isVideoCall ? ZegoInvitationType.videoCall : ZegoInvitationType.voiceCall

    //   // set notification config.
    //   const notificationConfig = {
    //     resourceID,
    //     title: notificationTitle ?? InnerTextHelper.instance().getIncomingCallDialogTitle(
    //       localUser.userName,
    //       isVideoCall ? ZegoInvitationType.videoCall : ZegoInvitationType.voiceCall,
    //       invitees.length),
    //     message: notificationMessage ?? InnerTextHelper.instance().getIncomingCallDialogMessage(
    //       isVideoCall ? ZegoInvitationType.videoCall : ZegoInvitationType.voiceCall,
    //       invitees.length
    //     )
    //   }

    //   return new Promise((resolve, reject) => {
    //     ZegoUIKit.getSignalingPlugin().sendInvitation(inviteeIDs, timeout, type, data, notificationConfig)
    //       .then(({ code, message, callID, errorInvitees }) => {
    //         zloginfo(
    //           `[CallInvitation]Send invitation success, code: ${code}, message: ${message}, errorInvitees: ${errorInvitees}`
    //         );
    //         if (inviteeIDs.length > errorInvitees.length) {
    //           const successfulInvitees = JSON.parse(JSON.stringify(inviteeIDs));
    //           errorInvitees.forEach((errorInviteeID) => {
    //             const index = successfulInvitees.findIndex(
    //               (inviteeID) => errorInviteeID === inviteeID
    //             );
    //             index !== -1 && successfulInvitees.splice(index, 1);
    //           });
    //           this.onInvitationSent(navigation, callID, invitees, successfulInvitees, roomID, isVideoCall, callName, showWaitingPageWhenGroupCall);
    //           resolve();
    //         } else {
    //           reject(-1, 'All invitees failed.');
    //         }
    //       })
    //       .catch(({ code, message }) => {
    //         reject(code, message);
    //       });
    //   });
    // }

    onInvitationSent(invitationID: string, allInvitees: ZegoUIKitUser[], successfulInvitees: ZegoUIKitUser[], roomID: string,
        isVideoCall: boolean, callName: string, showWaitingPageWhenGroupCall: boolean) {
        zlogwarning(TAG, '[onInvitationSent] roomID: ' + roomID);
        const localUser = CallInvitationServiceImpl.getInstance().getLocalUser();
        if (!localUser) {
            zlogerror('localUser is null')
            return
        }
        const targetPath = (allInvitees.length === 1 || showWaitingPageWhenGroupCall) ?
            PageConfig.PAGES.ZegoUIKitPrebuiltCallWaitingScreen : PageConfig.PAGES.ZegoUIKitPrebuiltCallInCallScreen;
        zloginfo('Jump to ' + targetPath);
        Navigation.navigateTo(targetPath, {
            roomID,
            callName,
            isVideoCall,
            invitationID: invitationID,
            invitees: allInvitees,
            inviter: localUser,
        })
    }

    onInvitationAccept(invitationID: string, allInvitees: ZegoUIKitUser[], roomID: string, isVideoCall: boolean, isRedirect: boolean = false) {
        zloginfo(TAG, '[onInvitationAccept] roomID: ' + roomID);
        const localUser = CallInvitationServiceImpl.getInstance().getLocalUser();
        if (!localUser) {
            zlogerror('localUser is null')
            return
        }
        // Jump to call room page
        zloginfo(TAG, 'Jump to call room page.');
        if (isRedirect) {
            Navigation.redirectTo(PageConfig.PAGES.ZegoUIKitPrebuiltCallInCallScreen, {
                roomID,
                isVideoCall,
                invitationID,
                invitees: allInvitees,
                inviter: localUser,
            })
        } else {
            Navigation.navigateTo(PageConfig.PAGES.ZegoUIKitPrebuiltCallInCallScreen, {
                roomID,
                isVideoCall,
                invitationID,
                invitees: allInvitees,
                inviter: localUser,
            })
        }
    }

    onInvitationReceived(invitationID: string, inviter: ZegoUIKitUser, roomID: string, isVideoCall: boolean) {
        zloginfo(TAG, '[onInvitationReceived]', invitationID, inviter, roomID, isVideoCall);
        zlogwarning(TAG, '[onInvitationReceived]page', PageConfig.PAGES.ZegoUIKitPrebuiltCallInviteeScreen)
        Navigation.navigateTo(PageConfig.PAGES.ZegoUIKitPrebuiltCallInviteeScreen, {
            invitationID,
            roomID,
            inviter,
            isVideoCall
        })
    }
}