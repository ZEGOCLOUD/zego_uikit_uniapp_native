<template>
    <ZegoImageButton @click="onButtonPress" :image="imageSource" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import ZegoImageButton from './ZegoImageButton.vue';

import ZegoUIKit from '../../ZegoUIKit';
import { makeListenerID, zloginfo } from '../../utils';
const LISTENER_ID = makeListenerID() // 生成回调ID
const TAG = '[ZegoSwitchCameraButton]'

const props = withDefaults(defineProps<{
    iconFrontFacingCamera?: string;
    iconBackFacingCamera?: string;
    useFrontFacingCamera?: boolean;
    onPress?: () => void;
    width?: number;
    height?: number;
}>(), {
    width: 48,
    height: 48,
    useFrontFacingCamera: true,
});

const isFront = ref(props.useFrontFacingCamera);

import FacingCameraImg from '../../assets/images/common/white_button_flip_camera@2x.png';

const imageSource = computed(() => {
    const pathFront = props.iconFrontFacingCamera || FacingCameraImg;
    const pathBack = props.iconBackFacingCamera || FacingCameraImg;
    return isFront.value ? pathFront : pathBack
});


const onButtonPress = () => {
    zloginfo(TAG, 'useFrontFacingCamera isFront:', isFront.value)
    ZegoUIKit.useFrontFacingCamera(!isFront.value);
    isFront.value = !isFront.value;
    if (props.onPress) {
        props.onPress();
    }
};


onMounted(() => {
});

onUnmounted(() => {
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