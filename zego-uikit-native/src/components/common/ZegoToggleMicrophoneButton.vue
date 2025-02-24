<template>
    <ZegoImageButton @click="onButtonPress" :image="imageSource" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import ZegoUIKit from '../../ZegoUIKit';
import { makeListenerID } from '../../utils';
import ZegoImageButton from './ZegoImageButton.vue';
const LISTENER_ID = makeListenerID() // 生成回调ID


const props = withDefaults(defineProps<{
    userID: string;
    iconMicOn?: string;
    iconMicOff?: string;
    isOn: boolean;
    onPress?: () => void;
    width?: number;
    height?: number;
}>(), {
    width: 48,
    height: 48,
});


const isCurrentOn = ref(props.isOn); // 默认开启状态

import MicOffImg from '../../assets/images/common/white_button_mic_off@2x.png';
import MicOnImg from '../../assets/images/common/white_button_mic_on@2x.png';

const imageSource = computed(() => {
    const pathOn = props.iconMicOn || MicOnImg;
    const pathOff = props.iconMicOff || MicOffImg;
    return isCurrentOn.value ? pathOn : pathOff;
});

const onButtonPress = () => {
    if (ZegoUIKit.isLocalUser(props.userID)) {
        ZegoUIKit.openMicrophone(!isCurrentOn.value)
    }

    if (props.onPress) {
        props.onPress();
    }
};


onMounted(() => {
    ZegoUIKit.addMicrophoneStateListener(LISTENER_ID, {
        onMicrophoneOn(uiKitUser, isOn) {
            // zlogerror('onMicrophoneOn', uiKitUser, isOn)
            if (!props.userID && ZegoUIKit.isLocalUser(uiKitUser.userID)) {
                isCurrentOn.value = isOn
            } else if (uiKitUser.userID === props.userID) {
                isCurrentOn.value = isOn
            }
        },
    })
});

onUnmounted(() => {
    ZegoUIKit.removeMicrophoneStateListener(LISTENER_ID)
});


</script>

<style scoped>
.button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.image {
    flex: 1;
}
</style>