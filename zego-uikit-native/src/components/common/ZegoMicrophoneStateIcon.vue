<template>
    <image :src="imageSource" mode="aspectFit" :style="{ width: 18, height: 18 }" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ZegoUIKit from '../../ZegoUIKit';
import { makeListenerID, zloginfo } from '../../utils';
const LISTENER_ID = makeListenerID() // 生成回调ID


const props = withDefaults(defineProps<{
    userID?: string;
    iconCameraOn?: string;
    iconCameraOff?: string;
    iconMicrophoneSpeaking?: string;
    minSoundLevel?: number
}>(), {
    minSoundLevel: 5
})

const isCurrentOn = ref(true);
const hasSound = ref(false);

import MicOffImg from '../../assets/images/common/white_icon_video_mic_off@2x.png';
import MicOnImg from '../../assets/images/common/white_icon_video_mic_on@2x.png';
import SpeakingImg from '../../assets/images/common/white_icon_video_mic_speaking@2x.png';

const imageSource = computed(() => {
    const pathOn = props.iconCameraOn || MicOnImg;
    const pathOff = props.iconCameraOff || MicOffImg;
    const pathSpeaking = props.iconMicrophoneSpeaking || SpeakingImg;
    return isCurrentOn.value ? (hasSound.value ? pathSpeaking : pathOn) : pathOff;
});

onMounted(() => {
    isCurrentOn.value = ZegoUIKit.isMicrophoneOn(props.userID);

    ZegoUIKit.addMicrophoneStateListener(LISTENER_ID, {
        onMicrophoneOn(uiKitUser, isOn) {
            zloginfo('onMicrophoneOn', uiKitUser, isOn)
            if (!props.userID && ZegoUIKit.isLocalUser(uiKitUser.userID)) {
                isCurrentOn.value = isOn
            } else if (uiKitUser.userID === props.userID) {
                isCurrentOn.value = isOn
            }
        },
    })

    ZegoUIKit.addSoundLevelUpdatedListener(LISTENER_ID, {
        onSoundLevelUpdate(uiKitUser, soundLevel) {
            // zloginfo('onSoundLevelUpdate', uiKitUser, soundLevel)
            if (uiKitUser.userID === props.userID) {
                hasSound.value = soundLevel > props.minSoundLevel
            }
        },
    })


});

onUnmounted(() => {
    ZegoUIKit.removeMicrophoneStateListener(LISTENER_ID)
    ZegoUIKit.removeSoundLevelUpdatedListener(LISTENER_ID)

});
</script>
