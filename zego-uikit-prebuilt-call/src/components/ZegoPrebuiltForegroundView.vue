<template>
    <view v-if="isDurationVisible" class="container">
        <text class="timing">{{ formattedDuration }}</text>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { DurationTracker, durationFormat } from '../utils/DurationTracker';

import { makeListenerID } from '@/uni_modules/zego-UIKitCore';
const LISTENER_ID = makeListenerID() // 生成回调ID


const props = defineProps<{ isDurationVisible: boolean }>();

const formattedDuration = ref('');

// console.error('AudioVideoForegroundView === props', JSON.stringify(props))

onMounted(() => {
    formattedDuration.value = durationFormat(DurationTracker.getInstance().currentDuration());

    DurationTracker.getInstance().addListener(LISTENER_ID, (seconds: number) => {
        // console.error('AudioVideoForegroundView === seconds', seconds)
        formattedDuration.value = durationFormat(seconds);
    });
});

onUnmounted(() => {
    DurationTracker.getInstance().removeListener(LISTENER_ID);
});


</script>

<style scoped>
.container {
    flex: 1;
    position: absolute;
    top: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.timing {
    color: white;
}
</style>