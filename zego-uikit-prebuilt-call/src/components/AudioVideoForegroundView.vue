<template>
    <view class="foreground-view-container">
        <view class="bottom-container" v-if="userInfo">
            <view v-if="showUserNameOnView" class="name-label-container">
                <text class="name-label">{{ userInfo.userName }}</text>
            </view>
            <ZegoCameraStateIcon v-if="showCameraStateOnView" :userID="userInfo.userID" class="device-icon" />
            <ZegoMicrophoneStateIcon v-if="showMicrophoneStateOnView" :userID="userInfo.userID" class="device-icon" />
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import ZegoCameraStateIcon from "@/uni_modules/zego-UIKitCore/components/common/ZegoCameraStateIcon.vue"
import ZegoMicrophoneStateIcon from "@/uni_modules/zego-UIKitCore/components/common/ZegoMicrophoneStateIcon.vue"

import ZegoUIKit, { ZegoUIKitUser } from '@/uni_modules/zego-UIKitCore';

const props = defineProps<{
    userInfo?: ZegoUIKitUser;
    showUserNameOnView?: boolean;
    showCameraStateOnView?: boolean;
    showMicrophoneStateOnView?: boolean;
}>();



</script>

<style scoped>
.foreground-view-container {
    flex: 1;
    z-index: 2;
}

.bottom-container {
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    background-color: #2A2A2A;

    opacity: 0.5;
    position: absolute;
    padding-left: 5rpx;
    padding-right: 5rpx;
    padding-bottom: 3rpx;
    padding-top: 3rpx;
    border-radius: 6rpx;
    bottom: 5rpx;
    right: 5rpx;
}

.name-label-container {
    align-items: center;
}

.name-label {
    color: #FFFFFF;
    font-size: 12px;
}

.device-icon {
    flex: 1;
}
</style>