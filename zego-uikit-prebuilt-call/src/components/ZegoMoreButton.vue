<template>
    <ZegoImageButton @click="onButtonPress" :image="imageSource" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ZegoImageButton from '@/uni_modules/zego-UIKitCore/components/common/ZegoImageButton.vue'

const props = withDefaults(defineProps<{
    onPress?: () => void,
    width?: number,
    height?: number,
}>(), {
    width: 48,
    height: 48,
});

import MoreImg from '../assets/images/common/white_button_more@2x.png';

const imageSource = ref(MoreImg)

const onButtonPress = async () => {
    if (props.onPress) {
        props.onPress();
    }
};
</script>

<style scoped>
</style>