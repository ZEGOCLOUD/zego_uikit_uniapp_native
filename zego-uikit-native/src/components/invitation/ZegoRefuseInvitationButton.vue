<template>
    <ZegoImageTextButton :style="{ backgroundColor: '#FF4A50', width: 56, height: 56, color: '#fff' }"
        :on-press="onButtonPress" :icon="iconSrc" :text="text" :icon-width="iconWidth" :icon-height="iconHeight">
        <slot />
    </ZegoImageTextButton>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ZegoImageTextButton from '../common/ZegoImageTextButton.vue';
import { CallInvitationRejectReason, ZegoUIKitSignaling } from '../../services';
import { zlogerror, zloginfo } from '../../utils/logger';

import RejectImg from '../../assets/images/invitation/button_call_reject@2x.png';

interface Props {
    invitationID: string;
    icon?: string;
    iconWidth?: number;
    iconHeight?: number;
    text?: string;
    customData?: string;

    onPressed?: () => void;
    onFailure?: (code: number, message: string) => void;
    onWillPressed?: () => Promise<boolean>;

}

const props = withDefaults(defineProps<Props>(), {
    customData: '',
    iconWidth: 38,
    iconHeight: 38,
    text: ''
});

const iconSrc = ref(props.icon || RejectImg)


const onButtonPress = async () => {

    let canAcceptInvitation = true;
    if (props.onWillPressed) {
        canAcceptInvitation = await props.onWillPressed();
    }

    if (!canAcceptInvitation) {
        return
    };

    zloginfo(
        `[Components]Refuse invitation start, inviterID: ${props.invitationID}, data: ${props.customData}`
    );

    ZegoUIKitSignaling.getInstance().refuseInvitation(props.invitationID, props.customData, CallInvitationRejectReason.Declined)
        .then(() => {
            if (props.onPressed) {
                props.onPressed();
            }
        }).catch(({ code, message }) => {
            if (props.onFailure) {
                props.onFailure(code, message);
                return
            }
        });

};

defineExpose({
    onButtonPress
})
</script>
<style scoped></style>