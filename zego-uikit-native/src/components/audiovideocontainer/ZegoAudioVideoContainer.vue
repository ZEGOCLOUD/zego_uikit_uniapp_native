<template>
    <view class="container">
        <PictureInPictureLayout class="audio-video-view" v-if="renderPictureInPicture" :config="layout.config"
            :audioVideoConfig="audioVideoConfig" :showWaitingCallAcceptAudioVideoView="showWaitingCallAcceptAudioVideoView">
            <template v-if="$slots.avatarView" #avatarView="{ userInfo }">
                <slot name="avatarView" :userInfo="userInfo"></slot>
            </template>
            <template v-if="$slots.callingWaitingView" #callingWaitingView="{ userInfo }">
                <slot name="callingWaitingView" :userInfo="userInfo"></slot>
            </template>
            <template #audioVideoForeground="{ userInfo }">
                <slot name="audioVideoForeground" :userInfo="userInfo"></slot>
            </template>
        </PictureInPictureLayout>
    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue"

import PictureInPictureLayout from "./PictureInPictureLayout.vue"
// import GalleryLayout from "./GalleryLayout.nvue"
import { ZegoLayoutConfig, ZegoLayout, ZegoLayoutMode, ZegoAudioVideoViewConfig } from '../defines';
import { zloginfo } from '../../utils';

const TAG = '[ZegoAudioVideoContainer]'

const props = defineProps<{
    layout: ZegoLayout,
    audioVideoConfig: ZegoAudioVideoViewConfig,
    showWaitingCallAcceptAudioVideoView?: boolean,
}>()

zloginfo(TAG, 'config=' + JSON.stringify(props))

const {
    layout = {
        mode: ZegoLayoutMode.PictureInPicture,
        config: {}
    },
    audioVideoConfig: { },
    showWaitingCallAcceptAudioVideoView = true,
} = props

const renderPictureInPicture = ref(layout.mode === ZegoLayoutMode.PictureInPicture)

zloginfo(TAG, `renderPictureInPicture=${renderPictureInPicture.value}`)

</script>

<style scoped>
.container {
    display: flex;
    flex: 1;
    /* justify-content: space-between; */
}

.audio-video-view {
    display: flex;
    flex: 1;
}
</style>