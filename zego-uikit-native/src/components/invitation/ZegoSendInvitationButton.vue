<template>
    <ZegoImageTextButton class="button"
        :style="{ padding: '7.5px' }" :on-press="onButtonPress"
        :icon="iconSrc" :text="text" :icon-width="iconWidth" :icon-height="iconHeight">
        <slot />
    </ZegoImageTextButton>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ZegoImageTextButton from '../common/ZegoImageTextButton.vue';
import { ZegoInvitationType, ZegoUIKitSignaling, ZegoUIKitUser } from '../../services';
import { zlogerror, zloginfo } from '../../utils';

import AudioCallImg from '../../assets/images/invitation/blue_button_audio_call@2x.png';
import VideoCallImg from '../../assets/images/invitation/blue_button_video_call@2x.png';
import { ZegoSignalingNotificationConfig } from '../../plugins';

const TAG = '[ZegoSendInvitationButton]'

interface Props {
    type: ZegoInvitationType;
    invitees: ZegoUIKitUser[];
    customData?: string;
    timeout?: number;

    onPressed?: (invitationID: string, callID: string, successUsers: ZegoUIKitUser[], errorUsers: ZegoUIKitUser[]) => void;
    onFailure?: (code: number, message: string) => void;
    onWillPressed?: () => Promise<boolean>;

    // 图标和文本的配置
    icon?: string;
    iconWidth?: number;
    iconHeight?: number;
    text?: string;

    // 一些样式配置
    // backgroundColor?: string;
    // fontSize?: number;
    // color?: string;
    // width?: number;
    // height?: number;
    // borderRadius?: number;

    // 通知配置
    notificationConfig?: ZegoSignalingNotificationConfig
};


const props = withDefaults(defineProps<Props>(), {
    text: '',
    timeout: 60,
    customData: '',

    iconWidth: 25,
    iconHeight: 25,
});

const iconSrc = ref(props.icon || (props.type === ZegoInvitationType.VideoCall ? VideoCallImg : AudioCallImg))


const requesting = ref(false);

const onButtonPress = async () => {
    if (requesting.value) {
        zloginfo('[Components]Send invitation requesting..... return.');
        return;
    }
    requesting.value = true;

    let canSendInvitation = true;
    if (props.onWillPressed) {
        canSendInvitation = await props.onWillPressed();
    }

    if (!canSendInvitation) {
        requesting.value = false;
        return;
    }

    if (!props.invitees.length) {
        zlogerror(TAG, '[Components]Send invitation error, invitees is empty.');
        if (props.onFailure) {
            props.onFailure(-1, 'Send invitation error, invitees is empty');
        }
        requesting.value = false;
        return
    }

    zloginfo(
        `[Components]Send invitation start, invitees: ${JSON.stringify(props.invitees)}, timeout: ${props.timeout}, type: ${props.type}, data: ${props.customData}`
    );


    ZegoUIKitSignaling.getInstance().sendInvitation(
        props.invitees,
        props.type,
        props.customData,
        props.timeout,
        '', // callID is optional
        props.notificationConfig
    ).then(({ invitationID, callID, successUsers, errorUsers }) => {
            zloginfo(`[Components]Send invitation success, callID: ${callID} errorInvitees: ${errorUsers}`);
            if (props.onPressed) {
                props.onPressed(
                    invitationID,
                    callID,
                    successUsers,
                    errorUsers,
                );
            }

        }).catch((err) => {
            zlogerror(JSON.stringify(err))
            zlogerror(`[Components]Send invitation fail, code: ${err.code}, message: ${err.message}`);
            // ZegoUIKitInternal.notifyErrorUpdate('SendInvitation', code, message);
            if (props.onFailure) {
                props.onFailure(err.code, err.message);
            }
        }).finally(() => {
            setTimeout(() => requesting.value = false, 1000);
        })
}
</script>

<style scoped>
.button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F3F4F7;
    font-size: 16rpx;
    color: #2A2A2A;

    border: 1rpx solid rgb(198, 189, 189);
    border-radius: 1000rpx;
}
</style>