<template>
    <image :src="imageSource" mode="aspectFit" :style="{ width: 24, height: 18 }" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ZegoUIKit from '../../ZegoUIKit';
import { makeListenerID, zloginfo } from '../../utils';
const LISTENER_ID = makeListenerID() // 生成回调ID

const props = defineProps<{
    userID?: string;
    iconCameraOn?: string;
    iconCameraOff?: string;
}>();

const isCurrentOn = ref(true);

import CameraOffImg from '../../assets/images/common/white_icon_video_camera_off@2x.png';
import CameraOnImg from '../../assets/images/common/white_icon_video_camera_on@2x.png';

const imageSource = computed(() => {
    const pathOn = props.iconCameraOn || CameraOnImg;
    const pathOff = props.iconCameraOff || CameraOffImg;
    return isCurrentOn.value ? pathOn : pathOff;
});

onMounted(() => {
    isCurrentOn.value = ZegoUIKit.isCameraOn(props.userID);

    ZegoUIKit.addCameraStateListener(LISTENER_ID, {
        onCameraOn(uiKitUser, isOn) {
            zloginfo('onCameraOn', uiKitUser, isOn)
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