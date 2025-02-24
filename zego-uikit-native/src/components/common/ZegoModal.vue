<template>
  <view v-if="show" class="zego-modal" @touchmove.stop.prevent="bindTouchmove">
    <view class="zego-modal__mask" @click="clickMask"></view>
    <view :style="width ? 'width:' + width : ''" class="zego-modal__container">
      <template v-if="$slots.title">
        <slot name="title" />
      </template>
      <template v-else>
        <text class="zego-modal__header" v-if="title.length > 0">{{ title }}</text>
      </template>
      <view class="zego-modal__content" :class="content ? 'zego-modal--mb' : ''">
        <template v-if="$slots.default || $slots.content">
          <view>
            <slot name="content" />
          </view>
          <view>
            <slot />
          </view>
        </template>
        <template v-else>
          <text class="content">
            {{ content }}
          </text>
        </template>
      </view>
      <view class="zego-modal__footer">
        <template v-if="$slots.footer">
          <slot name="footer" />
        </template>
        <template v-else>
          <text v-if="showCancel" class="zego-modal__footer-left" @click="clickLeft" :style="{ color: cancelColor }">
            {{ cancelText }}
          </text>
          <text class="zego-modal__footer-right" @click="clickRight" :style="{ color: confirmColor }">
            {{ confirmText }}
          </text>
        </template>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';


const props = withDefaults(defineProps<{
  title?: string;
  content?: string;
  cancelColor?: string;
  confirmColor?: string;
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
  autoClose?: boolean;
  width?: string;
  modelValue: boolean;
}>(), {
  title: '',
  cancelText: '取消',
  confirmText: '确定',
  showCancel: true,
  autoClose: false,
  cancelColor: '#0055ff',
  confirmColor: '#0055ff',
  modelValue: false,
})

const emits = defineEmits<{
  (event: 'cancel'): void
  (event: 'confirm'): void
  (event: 'close'): void
  (event: 'update:modelValue', val: boolean): void
}>()

const show = computed({
  get() { return props.modelValue },
  set(val: boolean) {
    return emits('update:modelValue', val)
  }
})

const bindTouchmove = () => { }

const clickLeft = () => {
  show.value = false
  emits('cancel')
}

const clickRight = () => {
  show.value = false
  emits('confirm')
}

const clickMask = () => {
  if (props.autoClose) {
    closeModal()
  }
}

const closeModal = () => {
  show.value = false
  emits('close')
}

</script>

<style lang="scss">
$bg-color-mask: rgba(0, 0, 0, 0.5); //遮罩颜色

.zego-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  align-items: center;
  justify-content: center;

  &__container {
    padding: 48rpx;
    position: relative;
    z-index: 999;
    transition: transform 0.3s;
    width: 600rpx;
    border-radius: 20rpx;
    background-color: #fff;
    overflow: hidden;
    font-weight: 400;

  }

  &__header {
    margin-bottom: 20rpx;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
    font-size: 36rpx;
    font-weight: 600;
  }

  &__content {
    position: relative;
    font-size: 28rpx;

    .content {
      color: #333;
    }
  }

  &__footer {
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 32rpx;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;

    &-left,
    &-right {
      position: relative;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 28rpx;
      text-align: center;
      background-color: #fff;
      color: #333;
    }

    &-right {
      margin-left: 60rpx;
    }
  }

  &__mask {
    position: absolute;
    z-index: 998;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $bg-color-mask;

    &.zego-modal--show {
      opacity: 1;
    }
  }

  &--mb {
    margin-bottom: 40rpx;
  }
}
</style>