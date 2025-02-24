<template>
    <ZegoSendInvitationButton :icon="icon" :text="text" :invitees="invitees" :type="type" :customData="customData"
        :timeout="timeout" :onWillPressed="onWillPressed" :onPressed="handlePress" :onFailure="handleFailure"
        :notificationConfig="notificationConfig" :iconWidth="iconWidth" :iconHeight="iconHeight"
    >
        <slot />
    </ZegoSendInvitationButton>
</template>

<script lang="ts" setup>
import { ZegoInvitationType, ZegoSignalingNotificationConfig, ZegoUIKitUser, zloginfo } from '@/uni_modules/zego-UIKitCore';
import ZegoSendInvitationButton from '@/uni_modules/zego-UIKitCore/components/invitation/ZegoSendInvitationButton.vue';
import { computed } from 'vue';
import CallInvitationHelper from '../../services/internal/CallInvitationHelper';
import { ZegoUser } from '@/uni_modules/zego-UIKitCore/services/express/ZegoExpressUniApp';

const TAG = '[ZegoSendCallInvitationButton]'

const props = defineProps<{
    type: ZegoInvitationType;
    invitees: ZegoUser[];
    timeout?: number;
    callID?: string; // 手动指定邀请ID
    callName?: string;
    showWaitingPageWhenGroupCall?: boolean;
    customData?: string;

    onPressed?: (code: number, message: string) => void;
    onWillPressed?: () => Promise<boolean>;

    // 图标和文本的配置
    icon?: string;
    iconWidth?: number;
    iconHeight?: number;
    text?: string;
    // 通知配置
    notificationConfig?: ZegoSignalingNotificationConfig;

}>();

const invitees = computed(() => {
    return props.invitees.map(({ userID, userName }) => new ZegoUIKitUser(userID, userName));
});

const handlePress = (invitationID: string, callID: string, successUsers: ZegoUIKitUser[], errorUsers: ZegoUIKitUser[]) => {
    zloginfo(`${TAG} handlePress, invitationID: ${invitationID}, callID: ${callID}, successUsers: ${JSON.stringify(successUsers)}, errorUsers: ${JSON.stringify(errorUsers)}`);
    CallInvitationHelper
        .getInstance()
        .onInvitationSent(
            invitationID,
            [...successUsers, ...errorUsers],
            successUsers, // successfulInvitees
            callID, // roomID
            props.type === ZegoInvitationType.VideoCall,
            props.callName ?? '',
            props.showWaitingPageWhenGroupCall
        );

    if (props.onPressed) {
        props.onPressed(0, '');
    }
};

const handleFailure = (code: number, message: string) => {
    if (props.onPressed) {
        props.onPressed(code, message);
    }
};

</script>

<style scoped></style>