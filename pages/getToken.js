import keycenter from "./KeyCenter"
const tokenURL = 'https://sig-liveroom-admin.zego.cloud/thirdToken/get'
export const getLoginToken = (userID,roomId) => {
	return new Promise((resolve, reject) => {
		if(keycenter.token) {
			resolve(keycenter.token)
		}
		// #ifdef H5
		uni.request({
			url: tokenURL,// 该接口由开发者后台自行实现，开发者的 Token 从各自后台获取
			method: 'post',
			data: {
				appId: keycenter.getAppID(),
				idName: userID,
				version: '03',
				roomId,
				privilege: {
					"1": 1,
					"2": 1
				},
				expire_time: 7 * 24 * 60 * 60
			},
			header: {
				'content-type': 'application/json'
			},
			success(res) {
				if (res.statusCode === 200) resolve(res.data?.data?.token)
				else reject(res)
			},
			fail(err) {
				reject(err)
			}
		})
		// #endif
	})
}
