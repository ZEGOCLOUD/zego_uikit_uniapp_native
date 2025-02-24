<template>
    <view class="container">
        <ZegoVideoFrame class="video-container" :userID="userID" :streamID="streamID" :local="isLocal" :viewMode="viewMode"
            :channel="channel" :canvasType="canvasType">
            <ZegoAudioFrame v-if="!isCameraOn" :userInfo="userInfo" :showSoundWave="showSoundWave"
                :audioViewBackgroudColor="audioViewBackgroudColor" :audioViewBackgroudImage="audioViewBackgroudImage"
                :avatar="avatar" :avatarSize="avatarSize" :avatarAlignment="avatarAlignment"
                :avatarBackgroundColor="avatarBackgroundColor" :soundWaveColor="soundWaveColor">
                <template v-if="$slots.avatar && userInfo" #avatar="{ userInfo }">
                    <slot name="avatar" :userInfo="userInfo" />
                </template>
            </ZegoAudioFrame>
        </ZegoVideoFrame>
        <view class="video-mask" v-if="userInfo">
            <slot name="foreground" :userInfo="userInfo" />
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import ZegoAudioFrame from './ZegoAudioFrame.vue';
import ZegoVideoFrame from './ZegoVideoFrame.vue';
import ZegoUIKit, { AvatarAlignment, AvatarSize, ZegoUIKitUser } from '../../';
import { makeListenerID, zlogerror, zloginfo, zlogwarning } from '../../utils';
import { ZegoViewMode, ZegoPublishChannel } from '../../services/express/ZegoExpressUniApp';

const TAG = '[ZegoAudioVideoView]'

const LISTENER_ID = makeListenerID() // 生成回调ID

enum CanvasType {
    // 这个模式在多人的时候, 切换view的位置, 会导致没切换的view不显示画面了, 无语 
    // https://project.feishu.cn/uikit/issue/detail/4860138766
    SurfaceView = 0, 
    TextureView = 1
}

const props = defineProps<{
    userID: string,
    roomID?: string,
    audioViewBackgroudColor?: string,
    audioViewBackgroudImage?: string,
    showSoundWave?: boolean,
    useVideoViewAspectFill?: boolean,
    avatarSize?: AvatarSize,
    avatarAlignment?: AvatarAlignment,
    avatarBackgroundColor?: string,
    soundWaveColor?: string,
    isPictureInPicture: boolean,
}>()

const { userID } = props

const isLocal = ref(ZegoUIKit.isLocalUser(userID))
const userInfo = ZegoUIKit.getUser(userID)!
if (!userInfo) {
    zlogerror(TAG, `Unknown Error, userID: ${userID} not found!`)
}
const streamID = ref(userInfo?.streamID ?? '');
const viewMode = ref(props.useVideoViewAspectFill ? ZegoViewMode.AspectFill : ZegoViewMode.AspectFit)
const channel = ref(ZegoPublishChannel.Main)
const canvasType = ref(CanvasType.TextureView)
const isCameraOn = ref(userInfo?.isCameraOn ?? false)
const inRoomAttributes = userInfo?.inRoomAttributes ?? {}
const avatar = ref(inRoomAttributes.avatar ?? '')

// zlogerror(`${TAG} userID=${userID} isLocal=${isLocal.value} streamID=${streamID.value} isCameraOn=${isCameraOn.value}`)

onMounted(async () => {
    zloginfo(`${TAG} mounted userID=${userID}, isLocal=${isLocal.value}, streamID=${streamID.value}`)

    if (isLocal.value) {
        ZegoUIKit.addCameraStateListener(LISTENER_ID, { // ZegoCameraStateChangeListener
            onCameraOn(user, isOn) {
                // zloginfo(`onUserCountOrPropertyChanged,  user.isCameraOn: ${user.isCameraOn}`)
                if (isLocal.value && user.userID === userID) {
                    isCameraOn.value = isOn;
                }
            },
        })
    }

    ZegoUIKit.addUserCountOrPropertyChangedListener(LISTENER_ID, { // ZegoUserCountOrPropertyChangedListener
        onUserCountOrPropertyChanged(userList) {
            userList.forEach(user => {
                if (user.userID === userID) {
                    const inRoomAttributes = user.inRoomAttributes ?? {}
                    if (inRoomAttributes.avatar) {
                        avatar.value = inRoomAttributes.avatar
                    }
                    // zloginfo(`onUserCountOrPropertyChanged,  user.isCameraOn: ${user.isCameraOn}`)
                    isCameraOn.value = user.isCameraOn!
                }
            });
        },
    })

    ZegoUIKit.addRoomStateChangedListener(LISTENER_ID, { // RoomStateChangedListener
        onRoomStateChanged(roomID, reason, errorCode, jsonObject) {
            const user = ZegoUIKit.getUser(userID);
            if (user) {
                // zloginfo(`onRoomStateChanged,  user.isCameraOn: ${user.isCameraOn}`)
                isCameraOn.value = user.isCameraOn!
            }
        },
    })
})

onBeforeUnmount(() => {
    zloginfo(`${TAG} destroy userID=${userID}`)
    ZegoUIKit.removeUserCountOrPropertyChangedListener(LISTENER_ID)
    ZegoUIKit.removeRoomStateChangedListener(LISTENER_ID)
})





</script>

<style scoped>
.container {
    flex: 1;
    display: flex;
    position: relative;
}

.video-container {
    flex: 1;
    /* height: 400rpx; */
}

.video-mask {
    flex: 1;
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
    overflow: hidden;
}
</style>