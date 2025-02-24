<template>
    <ZegoImageButton @click="onButtonPress" :disabled="!isEnable" :image="imageSource" :width="width"
        :height="height" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ZegoUIKit, { ZegoAudioOutputDevice } from '../../';
import { makeListenerID } from '../../utils';
const LISTENER_ID = makeListenerID() // 生成回调ID

import ZegoImageButton from './ZegoImageButton.vue';

const props = withDefaults(defineProps<{
    iconSpeaker?: string;
    iconEarpiece?: string;
    iconBluetooth?: string;
    useSpeaker: boolean;
    onPress?: () => void;
    width?: number;
    height?: number;
}>(), {
    width: 48,
    height: 48,
    useSpeaker: false,
});

const currentDevice = ref<ZegoAudioOutputDevice>(ZegoAudioOutputDevice.Speaker)
const isEnable = ref(true)

import BluetoothImg from '../../assets/images/common/white_button_bluetooth_off@2x.png';
import EarpieceImg from '../../assets/images/common/white_button_speaker_off@2x.png';
import SpeakerImg from '../../assets/images/common/white_button_speaker_on@2x.png';

const imageSource = computed(() => {
    let path = props.iconEarpiece || EarpieceImg
    if (currentDevice.value === ZegoAudioOutputDevice.Speaker) {
        path = props.iconSpeaker || SpeakerImg
    } else if (currentDevice.value === ZegoAudioOutputDevice.Bluetooth) {
        path = props.iconBluetooth || BluetoothImg
    }
    return path
});


const onButtonPress = () => {
    if (isEnable.value) {
        const usingSpeaker = currentDevice.value === 0;
        ZegoUIKit.setAudioOutputToSpeaker(!usingSpeaker)
    }
};

const updateDeviceType = (type: ZegoAudioOutputDevice) => {
    currentDevice.value = type
    isEnable.value = type === ZegoAudioOutputDevice.Speaker || type === ZegoAudioOutputDevice.EarSpeaker
}

onMounted(() => {
    // setCurrentDevice(ZegoUIKitInternal.audioOutputDeviceType());
    ZegoUIKit.addAudioOutputDeviceChangedListener(LISTENER_ID, {
        onAudioOutputDeviceChanged(audioOutput) {
            updateDeviceType(audioOutput)
        },
    })
});

onUnmounted(() => {
    ZegoUIKit.removeAudioOutputDeviceChangedListener(LISTENER_ID)
});


</script>