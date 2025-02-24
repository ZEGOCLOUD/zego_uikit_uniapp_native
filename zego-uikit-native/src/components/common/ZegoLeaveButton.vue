<template>
    <ZegoImageButton @click="onButtonPress" :image="imageSource" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ZegoUIKit from '../../ZegoUIKit';
import { zlogerror } from '../../utils';
import ZegoImageButton from './ZegoImageButton.vue';

const props = withDefaults(defineProps<{
    iconLeave?: string,
    onLeaveConfirmation?: () => Promise<boolean>,
    onPressed?: () => void,
    width?: number,
    height?: number,
}>(), {
    width: 48,
    height: 48,
});

import HangUpImg from '../../assets/images/common/white_button_hang_up@2x.png';

const imageSource = ref(props.iconLeave ?? HangUpImg)
const confirming = ref(false)

const imageError = (e: any) => {
    zlogerror(`Load ${imageSource.value} error: ${JSON.stringify(e)}`)
}

const doLeave = async () => {
    ZegoUIKit.leaveRoom();
    if (props.onPressed) {
        props.onPressed();
    }
}

const onButtonPress = async () => {
    if (props.onLeaveConfirmation) {
        if (confirming.value) return
        confirming.value = true
        const result = await props.onLeaveConfirmation()
        if (result) {
            doLeave()
        }
    } else {
        doLeave()
    }
    confirming.value = false
};
</script>
