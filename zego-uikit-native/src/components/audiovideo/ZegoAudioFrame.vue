<template>
    <view class="container" :style="{ backgroundColor: audioViewBackgroudColor }">
        <image v-if="audioViewBackgroudImage" :src="audioViewBackgroudImage" mode="aspectFill" class="image-background"
            @error="audioBackgroundError" />
        <view class="avatar-container" :style="{ justifyContent: avatarAlignment }">
            <ZegoSoundWave v-if="showSoundWave" :userID="userInfo.userID" :soundWaveColor="soundWaveColor"
                :width="avatarImageSize.width" :height="avatarImageSize.height" />
            <view class="avatar"
                :style="{ backgroundColor: avatarBackgroundColor, width: avatarImageSize.width, height: avatarImageSize.height, borderRadius: avatarImageSize.width / 2 }">
                <slot name="avatar" :userInfo="userInfo">
                    <text v-if="!avatar || isLoadError" class="name-label">{{ getShotName(userInfo.userName)
                        }}</text>
                    <image v-else class="avatar-image" mode="aspectFit"
                        :style="{ width: avatarImageSize.width, height: avatarImageSize.height, borderRadius: avatarImageSize.width / 2 }"
                        :src="avatar" @error="avatarError" />
                </slot>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { AvatarAlignment, AvatarSize } from '../defines';
import { ZegoUIKitUser } from '../../services/defines';

import { makeListenerID, zlogerror, getShotName } from '../../utils';
import ZegoSoundWave from './ZegoSoundWave.vue';

const TAG = '[ZegoAudioFrame]'

const LISTENER_ID = makeListenerID() // 生成回调ID

const DEFAULT_AVATAR_SIZE: AvatarSize = {
    width: 130, height: 130
}

const props = withDefaults(defineProps<{
    userInfo: ZegoUIKitUser;
    showSoundWave?: boolean;
    soundWaveColor?: string;
    audioViewBackgroudColor?: string;
    audioViewBackgroudImage?: string;
    avatarBackgroundColor?: string;
    avatarSize?: AvatarSize;
    avatarAlignment?: AvatarAlignment;
    avatar?: string;
}>(), {
    audioViewBackgroudColor: '#4A4B4D',
    audioViewBackgroudImage: '',
    showSoundWave: true,
    soundWaveColor: '#6B6A71',
    avatar: '',
    avatarBackgroundColor: '#DBDDE3',
    avatarAlignment: 'center',
})

const avatarImageSize = ref(props.avatarSize ?? DEFAULT_AVATAR_SIZE)

const isLoadError = ref(false);

const avatarError = (err: any) => {
    zlogerror(`Load avatar(${props.avatar}) error: ${err}`)
    isLoadError.value = true
}

const audioBackgroundError = (err: any) => {
    zlogerror(`Load audio background(${props.audioViewBackgroudImage}) error: ${err}`)
}

</script>

<style scoped>
.container {
    flex: 1;
    justify-content: center;
    position: relative;
}

.image-background {
    flex: 1;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.avatar-container {
    flex: 1;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    align-items: center;
    justify-content: center;
}

.avatar {
    position: absolute;
    width: 130;
    height: 130;
    border-radius: 65;
    z-index: 2;
    overflow: hidden;
    align-items: center;
    justify-content: center;
}

.name-label {
    color: #222222;
    font-size: 22px;
}

.avatar-image {
    flex: 1;
    overflow: hidden;
}
</style>