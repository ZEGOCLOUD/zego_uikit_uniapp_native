<template>
    <ZegoImageTextButton :style="{ backgroundColor: '#FF4A50', width: 56, height: 56, color: '#fff' }"
        :on-press="onButtonPress" :icon="iconSrc" :text="text" :icon-width="iconWidth" :icon-height="iconHeight">
        <slot />
    </ZegoImageTextButton>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ZegoImageTextButton from '../common/ZegoImageTextButton.vue';
import { ZegoUIKitSignaling, ZegoUIKitUser } from '../../services';
import { zlogerror, zloginfo } from '../../utils/logger';

import { ZegoSignalingNotificationConfig } from 'src/plugins';
import CancelImg from '../../assets/images/invitation/button_call_cancel@2x.png';

interface Props {
    icon?: string;
    iconWidth?: number;
    iconHeight?: number;

    text?: string;
    invitationID: string;
    invitees: ZegoUIKitUser[];
    customData?: string;

    onPressed?: () => void;
    onFailure?: (code: number, message: string) => void;
    onWillPressed?: () => Promise<boolean>;

    // 通知配置
    notificationConfig?: ZegoSignalingNotificationConfig
}

const props = withDefaults(defineProps<Props>(), {
    customData: '',
    iconWidth: 38,
    iconHeight: 38,
    text: ''
});

const iconSrc = ref(props.icon || CancelImg)



const onButtonPress = async () => {

    let canCancelInvitation = true;
    if (props.onWillPressed) {
        canCancelInvitation = await props.onWillPressed();
    }

    if (!canCancelInvitation) {
        return
    };

    zloginfo(
        `[Components]Cancel invitation start, invitationID: ${props.invitationID} invitees: ${JSON.stringify(props.invitees)}, customData: ${props.customData}`
    );

    const inviteeIDs = props.invitees.map(({ userID }) => userID)
    ZegoUIKitSignaling.getInstance().cancelInvitation(props.invitationID, inviteeIDs, props.notificationConfig)
        .then(({ successUsers }) => {
            if (props.onPressed) {
                props.onPressed(
                    // successUsers ?? props.invitees,
                );
            }
        }).catch(({ code, message }) => {
            // ZegoUIKitInternal.notifyErrorUpdate('CancelInvitation', code, message);
            zlogerror(`[Components]Cancel invitation error, code: ${code}, message: ${message}`);
            if (props.onFailure) {
                props.onFailure(code, message);
                return
            }
        })
};
</script>
<style scoped></style>