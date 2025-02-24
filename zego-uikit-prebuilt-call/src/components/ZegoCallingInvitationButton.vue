<template>
  <div class="container">
    <view class="button-wrap">
        <ZegoImageButton @click="onButtonPress" :image="imageSource" :width="width" :height="height" />
    </view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ZegoImageButton from '@/uni_modules/zego-UIKitCore/components/common/ZegoImageButton.vue'

const props = withDefaults(defineProps<{
  onPress?: () => void,
  width?: number,
  height?: number,
}>(), {
  width: 28,
  height: 28,
});

import AddMembers from '../assets/images/common/add_members.png';

const imageSource = ref(AddMembers)

const onButtonPress = async () => {
  if (props.onPress) {
      props.onPress();
  }
};
</script>

<style scoped>
.container {
  flex: 1;
  display: flex;
  align-items: center;
}

.button-wrap {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: rgba(49, 52, 67, 0.6);
  justify-content: center;
  align-items: center;
}
</style>