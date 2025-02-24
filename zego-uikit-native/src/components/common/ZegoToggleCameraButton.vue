<template>
    <ZegoImageButton @click="onButtonPress" :image="imageSource" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ZegoUIKit from '../../ZegoUIKit';
import { makeListenerID, zloginfo } from '../../utils';
import ZegoImageButton from './ZegoImageButton.vue';
const LISTENER_ID = makeListenerID() // 生成回调ID


const props = withDefaults(defineProps<{
    userID: string;
    iconCameraOn?: string;
    iconCameraOff?: string;
    isOn?: boolean;
    onPress?: () => void;
    width?: number;
    height?: number;
}>(), {
    width: 48,
    height: 48,
});

const isCurrentOn = ref(props.isOn); // Default on

import CameraOffImg from '../../assets/images/common/white_button_camera_off@2x.png';
import CameraOnImg from '../../assets/images/common/white_button_camera_on@2x.png';

// console.error('Props', JSON.stringify(props))

const imageSource = computed(() => {
    const pathOn = props.iconCameraOn || CameraOnImg;
    const pathOff = props.iconCameraOff || CameraOffImg;
    return isCurrentOn.value ? pathOn : pathOff;
});


const onButtonPress = () => {
    if (ZegoUIKit.isLocalUser(props.userID)) {
        ZegoUIKit.openCamera(!isCurrentOn.value)
    }

    if (props.onPress) {
        props.onPress();
    }
};



onMounted(() => {
    ZegoUIKit.addCameraStateListener(LISTENER_ID, {
        onCameraOn(uiKitUser, isOn) {
            zloginfo('onCameraOn', JSON.stringify(uiKitUser), isOn)
            if (!props.userID && ZegoUIKit.isLocalUser(uiKitUser.userID)) {
                isCurrentOn.value = isOn
            } else if (uiKitUser.userID === props.userID) {
                isCurrentOn.value = isOn
            }
        },
    })

});

onUnmounted(() => {
    ZegoUIKit.removeCameraStateListener(LISTENER_ID)
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