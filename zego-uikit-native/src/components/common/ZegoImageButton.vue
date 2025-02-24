<template>
    <view class="button-container" @click="onPress">
        <image :src="image" :style="{ width: width, height: height }" mode="aspectFit" class="image"
            @error="imageError" />
    </view>
</template>

<script setup lang="ts">
import { zlogerror } from '../../utils';

const props = withDefaults(defineProps<{
    image: string,
    onPress?: () => void,
    width?: number,
    height?: number,
}>(), {
    width: 48,
    height: 48,
});



const imageError = (e: any) => {
    zlogerror(`Load ${props.image} error: ${JSON.stringify(e)}`)
}

</script>

<style scoped>
.button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.image {
    flex: 1;
}
</style>