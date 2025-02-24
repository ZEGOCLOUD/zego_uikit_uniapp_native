<template>
    <view class="container" @click.stop="onPress" >
        <slot>
            <image :src="icon" :style="{ width: iconWidth + 'px', height: iconHeight + 'px', marginRight: text ? 6 : 0 }"
                mode="aspectFit" />
            <text v-if="text" class="desc" :style="{ paddingRight: 6 }">{{ text }}</text>
        </slot>
    </view>
</template>

<script setup lang="ts">

interface Props {
    icon: string;
    iconWidth?: number;
    iconHeight?: number;

    text?: string;

    onPress?: () => void,
}

const props = withDefaults(defineProps<Props>(), {
    iconWidth: 38,
    iconHeight: 38,
});

</script>
<style scoped>
.container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;

    color: #fff;
    border-radius: 1000rpx;
}

.desc {
    font-size: 32rpx;
}
</style>