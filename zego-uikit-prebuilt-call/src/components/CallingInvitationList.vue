<template>
  <view class="invitation-dialog">
    <view class="invitation-header" @click="handleClose">
      <image :src="closeImageSource" :style="{ width: 40, height: 40 }" mode="aspectFit" />
      <text class="title">{{ t('Invite.invitees') }}</text>
    </view>
    <view class="invitation-container">
      <scroll-view scroll-y class="invitation-scroll_view">
        <view v-for="userInfo in invitationList" :key="userInfo.userID" class="invitation-item"
          @click="handleClick(userInfo)">
          <view class="invitation-item_left">
            <view class="avatar">
              <text class="name-label">{{ getShotName(userInfo.userName) }}</text>
            </view>
            <text class="name">{{ userInfo.userName }}</text>
          </view>
          <view class="invitation-item_right">
            <image v-if="!userInfo.canEdit || userInfo.checked" :src="getCheckIcon(userInfo)"
              :style="{ width: 20, height: 20 }" alt="" />
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="invitaion-bottom" @click="handleInvitation">
      <image :src="callImageSource" :style="{ width: 20, height: 20 }" mode="aspectFit" />
    </view>
  </view>
</template>
<script lang='ts' setup>
import { ref, watch } from 'vue';
import { t } from "../lang";
import { ZegoUser } from '@/uni_modules/zego-ZegoExpressUniApp-JS/components/zego-ZegoExpressUniApp-JS/lib';
import { CallInvitationServiceImpl } from '../services/internal/CallInvitationServiceImpl';
import { getShotName } from '@/uni_modules/zego-UIKitCore'

import ArrowDownImg from '../assets/images/common/white_button_arrow@2x.png';
import CallingImg from '../assets/images/common/icon_call.png';
import CheckOnImg from '../assets/images/common/icon_check_on.png';
import CheckImg from '../assets/images/common/icon_checked.png';
import ZegoUIKit from '@/uni_modules/zego-UIKitCore/ZegoUIKit';

interface InvitationItem extends ZegoUser {
  checked?: boolean;
  canEdit?: boolean;
}


const props = withDefaults(defineProps<{
  defaultCheck?: boolean,
  userList: ZegoUser[],
}>(), {
  defaultCheck: true,
});

const emits = defineEmits<{
  (event: 'close'): void
}>()

const closeImageSource = ref(ArrowDownImg)
const callImageSource = ref(CallingImg)
const CheckOnImgSource = ref(CheckOnImg)
const CheckImgSource = ref(CheckImg)

const invitationList = ref<InvitationItem[]>([])

const formatUserList = (userList: InvitationItem[]) => {
  return userList.map((userInfo) => {
    const isExit = ZegoUIKit.isUserExist(userInfo.userID)
    return {
      ...userInfo,
      checked: userInfo.checked ?? props.defaultCheck,
      canEdit: !isExit
    }
  })
}

watch(() => props.userList, () => {
  invitationList.value = formatUserList(props.userList)
}, {
  immediate: true
})

const getCheckIcon = ({ canEdit, checked }: InvitationItem) => {
  if (!canEdit) return CheckImgSource.value
  if (checked) return CheckOnImgSource.value
}

const handleClick = (item: InvitationItem) => {
  if (!item.canEdit) return
  item.checked = !item.checked
}

const handleInvitation = () => {
  const invitees = invitationList.value
    .filter((item) => item.canEdit && item.checked)
    .map((item) => {
      return {
        userID: item.userID,
        userName: item.userName
      }
    })
  if (invitees.length) {
    CallInvitationServiceImpl.getInstance().addInvitation(invitees)
      .then(({ errorUsers }) => {
        const errorUserNames = errorUsers.map(({ userName }) => userName).join(",")
        errorUserNames && uni.showToast({
          title: errorUserNames + t('Tips.sendInvitationFail'),
          icon: 'none'
        })
      })
      .catch(() => {
        uni.showToast({
          title: t('Tips.sendInvitationFail'),
          icon: 'none'
        })
      })
  }
  handleClose()
}

const handleClose = () => {
  emits('close')
}
</script>

<style scoped lang='scss'>
.invitation-dialog {
  position: absolute;
  top: 400rpx;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background-color: #242736;
  border-radius: 46rpx 46rpx 0px 0px;
  overflow: hidden;
}

.invitation-header {
  height: 100rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #3d4054;

  .title {
    color: #ffffff;
    font-size: 36rpx;
  }
}

.invitation-container {
  flex: 1;

  .invitation-scroll_view {
    display: flex;
    flex: 1;

    .invitation-item {
      height: 100rpx;
      padding: 0 36rpx;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      &_left {
        flex: 1;
        flex-direction: row;
        align-items: center;

        .avatar {
          margin-right: 24rpx;
          width: 64rpx;
          height: 64rpx;
          border-radius: 36rpx;
          background-color: rgba(255, 255, 255, 0.1);
          align-items: center;
          justify-content: center;

          .name-label {
            color: #557bff;
            font-size: 32rpx;
          }
        }

        .name {
          color: #fff;
          font-size: 32rpx;
        }
      }

      &_right {
        width: 40rpx;
      }
    }
  }
}

.invitaion-bottom {
  height: 80rpx;
  border-top: 1rpx solid #3d4054;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
