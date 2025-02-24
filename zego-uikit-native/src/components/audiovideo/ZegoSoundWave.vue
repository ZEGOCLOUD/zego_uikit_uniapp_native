<template>
    <view class="circle-wave" :style="{ width: width * 1.2, height: height * 1.2 }">
        <view v-if="soundLevel > 15" class="sub-circle-wave" :style="computeStyle(1.18, 0.3)" />
        <view v-if="soundLevel > 10" class="sub-circle-wave" :style="computeStyle(1.14, 0.6)" />
        <view v-if="soundLevel > 5" class="sub-circle-wave" :style="computeStyle(1.10, 1)" />
    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ZegoUIKitUser } from '../../services/defines';
import { makeListenerID, zlogerror, zloginfo, zlogwarning } from '../../utils';
import ZegoUIKit from '../../ZegoUIKit';

const TAG = '[ZegoAudioFrame]'

const LISTENER_ID = makeListenerID() // 生成回调ID


const props = defineProps<{
    userID: string;
    soundWaveColor: string;
    width: number;
    height: number;
}>()

const soundLevel = ref(0);

const computeStyle = (sacle: number, opacity: number = 1) => {
    return {
        backgroundColor: props.soundWaveColor,
        borderRadius: 1000,
        width: props.width * sacle,
        height: props.height * sacle,
        opacity: opacity,
        left: props.width * (1.2 - sacle) / 2,
        top: props.height * (1.2 - sacle) / 2,
    }
}

onMounted(() => {
    ZegoUIKit.addSoundLevelUpdatedListener(LISTENER_ID, {
        onSoundLevelUpdate(uiKitUser, level) {
            if (uiKitUser.userID === props.userID) {
                soundLevel.value = level
            }
        },
    })
})

onBeforeUnmount(() => {
    ZegoUIKit.removeSoundLevelUpdatedListener(LISTENER_ID)
})

</script>

<style scoped>
.circle-wave,
.sub-circle-wave {
    z-index: 0;
}

.circle-wave {
    position: relative;
    display: flex;
    justify-content: center;

}

.sub-circle-wave {
    position: absolute;
}
</style>