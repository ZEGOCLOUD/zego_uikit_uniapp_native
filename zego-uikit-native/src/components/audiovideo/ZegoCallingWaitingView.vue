<template>
  <view class="container">
    <slot name="callingWaitingView" :userInfo="userInfo">
      <view class="content">
        <ZegoAudioFrame :userInfo="userInfo" :showSoundWave="false" :audioViewBackgroudColor="audioViewBackgroudColor"
          :audioViewBackgroudImage="audioViewBackgroudImage" :avatarSize="avatarSize" :avatarAlignment="avatarAlignment"
          :avatarBackgroundColor="avatarBackgroundColor" :soundWaveColor="soundWaveColor">
          <template v-if="$slots.avatar && userInfo" #avatar="{ userInfo }">
            <slot name="avatar" :userInfo="userInfo" />
          </template>
        </ZegoAudioFrame>
        <view v-if="!smallView" class="user-name-box">
          <text class="user-name">{{ userInfo.userName }}</text>
        </view>
      </view>
      <view class="bottom-bar" :class="smallView && 'small-view'">
        <ZegoCancelInvitationButton :invitation-i-d="invitationID" :invitees="[userInfo]" />
      </view>
    </slot>
  </view>
</template>
<script lang='ts' setup>
import { computed, ref } from 'vue';
import { AvatarAlignment, AvatarSize, ViewType } from '../defines';
import ZegoAudioFrame from './ZegoAudioFrame.vue';
import ZegoCancelInvitationButton from '../invitation/ZegoCancelInvitationButton.vue'
import { ZegoUIKitSignaling } from '../../services';

const TAG = '[ZegoCallingWaitingView]'

const props = defineProps<{
  userID: string,
  roomID?: string,
  userName?: string,
  viewType?: ViewType,
  audioViewBackgroudColor?: string,
  audioViewBackgroudImage?: string,
  useVideoViewAspectFill?: boolean,
  avatarSize?: AvatarSize,
  avatarAlignment?: AvatarAlignment,
  avatarBackgroundColor?: string,
  soundWaveColor?: string,
}>()

const { userID, userName = '' } = props

const userInfo = ref({ userID, userName })
const { invitationID } = ZegoUIKitSignaling.getInstance().getCurrentInvitationData() || { invitationID: '' }

const smallView = computed(() => {
  return props.viewType === ViewType.SMALL
})


</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex: 1;
  position: relative;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 100rpx;
  flex: 1;
  z-index: 2;
}

.user-name-box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 100rpx;
  flex: 1;
  z-index: 2;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 36rpx;
  line-height: 60rpx;
  margin-top: 400rpx;
  color: #ffffff;
}

.bottom-bar {
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  left: 0;
  right: 0;
  bottom: 60rpx;

  &.small-view {
    bottom: 10rpx;
  }
}
</style>
