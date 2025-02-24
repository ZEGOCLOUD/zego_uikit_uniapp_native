<template>
    <view v-if="isNormalStyle" class="normal-bar">
        <view v-for="(button, index) in firstLevelButtons" :key="index" class="normal-button">
            <ZegoToggleCameraButton v-if="button === ZegoMenuBarButtonName.ToggleCameraButton"
                :is-on="turnOnCameraWhenJoining" :user-i-d="userID" />
            <ZegoToggleMicrophoneButton v-else-if="button === ZegoMenuBarButtonName.ToggleMicrophoneButton"
                :is-on="turnOnMicrophoneWhenJoining" :user-i-d="userID" />
            <ZegoLeaveButton v-else-if="button === ZegoMenuBarButtonName.HangUpButton"
                :onLeaveConfirmation="onHangUpConfirmation" :onPressed="onHangUp" />
            <ZegoSwitchAudioOutputButton v-else-if="button === ZegoMenuBarButtonName.SwitchAudioOutputButton"
                :useSpeaker="useSpeakerWhenJoining" />
            <ZegoSwitchCameraButton v-else-if="button === ZegoMenuBarButtonName.SwitchCameraButton"
                :onPress="onSwitchCamera" />
            <ZegoCallingInvitationButton v-else-if="button === ZegoMenuBarButtonName.CallingInvitationButton"
                :onPress="onShowCallingInvitationList" />
            <ZegoMoreButton v-else :onPress="onMoreButtonPress" />
        </view>
    </view>
    <view v-else class="popup-container fill-parent">
        <view class="popup-mask fill-parent" @click="closePopup"></view>
        <view class="popup-bar">
            <view v-for="(button, index) in secondLevelButtons" :key="index" class="popup-button">
                <ZegoToggleCameraButton v-if="button === ZegoMenuBarButtonName.ToggleCameraButton"
                    :is-on="turnOnCameraWhenJoining" :user-i-d="userID" />
                <ZegoToggleMicrophoneButton v-else-if="button === ZegoMenuBarButtonName.ToggleMicrophoneButton"
                    :is-on="turnOnMicrophoneWhenJoining" :user-i-d="userID" />
                <ZegoLeaveButton v-else-if="button === ZegoMenuBarButtonName.HangUpButton"
                    :onLeaveConfirmation="onHangUpConfirmation" :onPressed="onHangUp" />
                <ZegoSwitchAudioOutputButton v-else-if="button === ZegoMenuBarButtonName.SwitchAudioOutputButton"
                    :useSpeaker="useSpeakerWhenJoining" />
                <ZegoSwitchCameraButton v-else-if="button === ZegoMenuBarButtonName.SwitchCameraButton"
                    :onPress="onSwitchCamera" />
                <ZegoCallingInvitationButton v-else-if="button === ZegoMenuBarButtonName.CallingInvitationButton"
                    :onPress="onShowCallingInvitationList" />
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount } from "vue"

import ZegoUIKit, { ZegoUIKitSignaling, zlogerror, zloginfo, zlogwarning } from '@/uni_modules/zego-UIKitCore'

import ZegoLeaveButton from '@/uni_modules/zego-UIKitCore/components/common/ZegoLeaveButton.vue'
import ZegoSwitchAudioOutputButton from '@/uni_modules/zego-UIKitCore/components/common/ZegoSwitchAudioOutputButton.vue'
import ZegoSwitchCameraButton from '@/uni_modules/zego-UIKitCore/components/common/ZegoSwitchCameraButton.vue'
import ZegoToggleCameraButton from '@/uni_modules/zego-UIKitCore/components/common/ZegoToggleCameraButton.vue'
import ZegoToggleMicrophoneButton from '@/uni_modules/zego-UIKitCore/components/common/ZegoToggleMicrophoneButton.vue'
import ZegoCallingInvitationButton from './ZegoCallingInvitationButton.vue'

import ZegoMoreButton from './ZegoMoreButton.vue';

import { ZegoMenuBarButtonName } from "../config/defines"

const TAG = '======================= ZegoBottomBar ======================='

const props = withDefaults(defineProps<{
    userID: string;
    menuBarButtonsMaxCount?: number;
    menuBarButtons: ZegoMenuBarButtonName[];
    onHangUp?: () => void;
    onHangUpConfirmation?: () => Promise<boolean>;
    turnOnCameraWhenJoining?: boolean;
    turnOnMicrophoneWhenJoining?: boolean;
    useSpeakerWhenJoining?: boolean;
    onMorePress?: () => void;
    onSwitchCamera?: () => void;
    onShowCallingInvitationList?: () => void;
}>(), {
    menuBarButtonsMaxCount: 5,
});

const isNormalStyle = ref(true)

const firstLevelButtons = ref<number[]>([]);
const secondLevelButtons = ref<number[]>([]);

// zlogerror(TAG, 'props', JSON.stringify(props))

const closePopup = () => {
    isNormalStyle.value = true;
};

const onMoreButtonPress = () => {
    isNormalStyle.value = false;
    if (props.onMorePress) {
        props.onMorePress()
    }
}

const getButtons = () => {
    const { canInvitingInCalling, onlyInitiatorCanInvite } = ZegoUIKitSignaling.getInstance().getCallingConfig()
    const buttons = props.menuBarButtons || []
    const callingButtonIndex = buttons.findIndex((buttonName) => buttonName === ZegoMenuBarButtonName.CallingInvitationButton)
    if (!canInvitingInCalling) return buttons
    if (!onlyInitiatorCanInvite) {
        !~callingButtonIndex && buttons.push(ZegoMenuBarButtonName.CallingInvitationButton)
    } else {
        ZegoUIKit.isInviter(props.userID) &&
        !~callingButtonIndex && buttons.push(ZegoMenuBarButtonName.CallingInvitationButton)
    }
    return buttons
}

const getDisplayButtons = () => {
    const buttons = getButtons()
    let maxCount = props.menuBarButtonsMaxCount < 1 ? 1 : props.menuBarButtonsMaxCount;
    maxCount = maxCount > 5 ? 5 : maxCount;
    const needMoreButton = buttons.length > maxCount;

    buttons.forEach(buttonIndex => {
        const limitCount = needMoreButton ? maxCount - 1 : maxCount;
        if (firstLevelButtons.value.length < limitCount) {
            firstLevelButtons.value.push(buttonIndex);
        } else {
            secondLevelButtons.value.push(buttonIndex);
        }
    });
    if (needMoreButton) {
        firstLevelButtons.value.push(-1)
    }
}

onMounted(() => {
    zloginfo(TAG, "ZegoBottomBar mounted")
    getDisplayButtons()
})

</script>
<style scoped>
.normal-bar {
    position: absolute;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    left: 0;
    right: 0;
    bottom: 50rpx;
    height: 100rpx;
    z-index: 2;
}
.normal-button{
    flex: 1;
}

.popup-container {
    flex: 1;
    display: flex;
    justify-content: flex-end;
}

.fill-parent {
    position: absolute;
    flex: 1;
    z-index: 10;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.popup-mask {
    background-color: rgb(38, 42, 45);
    opacity: 0.3;
}

.popup-button + .popup-button {
    margin-left: 20rpx;
}

.popup-bar {
    flex: 1;
    padding-top: 27rpx;
    padding-bottom: 3rpx;
    padding-left: 28.5rpx;
    padding-right: 28.5rpx;
    position: absolute;
    height: 240rpx;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    bottom: 0;
    z-index: 2;
    background-color:rgba(38, 42, 45, 0.5);
    border-radius: 20rpx 20rpx 0 0;
}
</style>