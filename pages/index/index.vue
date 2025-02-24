<template>
    <view class="zego-container">
        <view v-for="(item, index) in list" :key="item.id">
            <uni-section :title="item.section"></uni-section>
            <view v-for="(row, index) in item.rows" :key="row.id">
                <uni-list>
                    <uni-list-item :title="row.name" :clickable="true" :to="row.url" :preCheck="preCheck"></uni-list-item>
                </uni-list>
            </view>
        </view>
    </view>
</template>

<script>
import Permissions from "@/uni_modules/zego-PrebuiltCall/utils/Permissions";

export default {
    data() {
        return {
            list: [
                {
                    section: "快速开始",
                    rows: [
                        // {
                        //     name: "基础通话",
                        //     url: "/pages/example/uikit/base-call",
                        // },
						{
						    name: "语音通话",
						    url: "/pages/example/uikit/voice-call",
						},
						{
						    name: "视频通话",
						    url: "/pages/example/uikit/video-call",
						},
                        {
                            name: "自定义通话视图",
                            url: "/pages/example/uikit/custom-callview",
                        },
                        {
                            name: "自定义挂断弹窗",
                            url: "/pages/example/uikit/hangup-comfirm",
                        },
                        {
                            name: "自定义下方按钮",
                            url: "/pages/example/uikit/custom-bottombar",
                        },
                    ],
                },
                {
                    section: "呼叫邀请",
                    rows: [
                        {
                            name: "邀请按钮",
                            url: "/pages/example/uikit/invite",
                        },
                    ],
                },
                {
                    section: "调试与配置",
                    rows: [
                        {
                            name: "调试与配置",
                            url: "/pages/example/setting/debug-and-config",
                        },
                    ],
                },
            ],
        };
    },
    methods: {
        getNetworkType() {
            return new Promise((resolve, reject) => {
                uni.getNetworkType({
                    success: function (res) {
                        resolve(res.networkType);
                    },
                    fail: function (err) {
                        reject(err);
                    }
                })
            })
        },
        async permissionCheck() {
			const appAuthorizeSetting = uni.getAppAuthorizeSetting();
			if (appAuthorizeSetting.cameraAuthorized !== 'authorized' || appAuthorizeSetting.microphoneAuthorized !== 'authorized' ) {
				return Promise.all([
					Permissions.ensureAndroidPermission(Permissions.AuthInfo.Microphone),
					Permissions.ensureAndroidPermission(Permissions.AuthInfo.Camera)
				]).then(([micAuth, cameraAuth]) => {
                    return micAuth && cameraAuth
                }).catch(err => {
                    return false
                })
			} else {
                return true
            }
        },
        async preCheck() {
            if (await this.getNetworkType() === 'none') {
                uni.showToast({
                    title: '网络未连接',
                    icon: 'none'
                })
                return false
            }
            return this.permissionCheck()
        },
    },
};
</script>

<style></style>
