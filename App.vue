<script>
export default {
	globalData: {
		appID: "",
		appSign: "",
		userID: "",
		token: "",
		callID: "",
		isHide: false,
	},
	onLaunch: function () {
		console.log('App Launch')
	},
	onShow: function () {
		console.log('App Show')
		this.globalData.isHide = false
	},
	onHide: function () {
		console.log('App Hide')
		this.globalData.isHide = true
	},
	onError: function (e) {
		console.error(`App Error: ${e.message || e}`, e.stack)
	}
}
</script>

<style>
/*每个页面公共css */
/* @import './common/uni-nvue.css'; */
@import './common/zego-nvue.css';

.video-view {
	height: 400rpx;
	flex: 1;
}

/* #ifdef H5 */
video {
	height: 400rpx;
	flex: 1;
}

uni-page-wrapper,
uni-page-body {
	height: 100%;
	overflow: scroll;
}

button {
	margin: 10rpx;
}

button:active {
	opacity: 0.7;
}

/* #endif */
</style>
