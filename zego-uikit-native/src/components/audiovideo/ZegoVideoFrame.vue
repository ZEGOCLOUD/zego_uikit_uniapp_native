<template>
    <view class="container">
        <ZegoExpress-Local-View v-if="local" :id="userID" class="video-container" :viewMode="viewMode" :channel="channel"
            :canvasType="canvasType" />
        <ZegoExpress-Remote-View v-else  :id="userID" class="video-container" :viewMode="viewMode" :streamID="streamID"
            :canvasType="canvasType" />
        <view class="audio-container">
            <slot />
        </view>
    </view>
</template>

<script lang="ts" setup>
import { zloginfo } from '../../utils';
import { onMounted } from 'vue';

const props = defineProps<{
    userID: string,
    viewMode: number,
    canvasType: number, 
    streamID: string,
    channel: number,
    local: boolean,
}>()

onMounted(() => {
    zloginfo(`[ZegoVideoFrame] mounted, userID=${props.userID}, local=${props.local}, streamID=${props.streamID}, channel=${props.channel}`);
})

</script>

<style scoped>
.container {
    flex: 1;
    position: relative;
}

.video-container {
    flex: 1;
}

.audio-container {
    flex: 1;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
}
</style>
