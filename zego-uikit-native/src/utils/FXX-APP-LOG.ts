// @ts-nocheck

const LogCat = {
	init: function() {
		this.main = plus.android.runtimeMainActivity();
		this.Environment = plus.android.importClass('android.os.Environment');
		this.BufferedWriter = plus.android.importClass('java.io.BufferedWriter');
		this.BufferedReader = plus.android.importClass('java.io.BufferedReader');
		this.File = plus.android.importClass('java.io.File');
		this.FileOutputStream = plus.android.importClass('java.io.FileOutputStream');
		this.FileInputStream = plus.android.importClass('java.io.FileInputStream');
		this.OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter');
		this.InputStreamReader = plus.android.importClass('java.io.InputStreamReader');
		this.LogPath = '';
		if (this.Environment.MEDIA_MOUNTED || !this.Environment.isExternalStorageRemovable()) {
			this.LogPath = this.main.getExternalFilesDir(null).getPath() + '/fxx_log';
		} else {
			this.LogPath = this.main.getFilesDir().getPath() + '/fxx_log';
		}
		console.log('日志文件存放路径->', this.LogPath);
	},
	writeLog: function(tag, msg) {
		let date = getTime('YYYY-MM-DD');
		let datetime = getTime();

		msg = (typeof msg !== 'string' ? JSON.stringify(msg) : msg);

		//文件名
		let fileName = this.LogPath + "/log_" + date + ".txt"
		//写入的内容
		let content = `\n${datetime} ${tag}:${msg}\n`;

		let file = new this.File(this.LogPath);
		if (!file.exists()) {
			file.mkdirs(); //创建父路径
		}
		let fos = null;
		let bw = null;
		try {
			fos = new this.FileOutputStream(fileName, true);
			bw = new this.BufferedWriter(new this.OutputStreamWriter(fos));
			//bw.write(log);
			bw.append(content);
		} catch (e) {
			console.log('e->', e);
		} finally {
			try {
				if (bw != null) {
					bw.close(); //关闭缓冲流
					fos.close(); //关闭文件输出流
				}
			} catch (closeEx) {
				console.log('closeEx->', closeEx);
			}
		}
	},
	// 删除日志
	removeLogFile: function(fileName) {
		let file = new this.File(fileName);
		let fos = new this.FileOutputStream(fileName, true);
		fos.close();
		file.delete();
		console.log("删除------" + fileName);
	},
	// 获取所有日志文件列表
	getLogFileList: function() {
		let list = [];
		let file = new this.File(this.LogPath);
		let tempList = file.listFiles();
		for (let i = 0; i < tempList.length; i++) {
			let fileName = tempList[i].getName();
			let filePath = tempList[i].getPath();
			let obj = {
				name: fileName,
				filePath: filePath
			}
			list.push(obj);
		}
		return list
	},
	// 读取日志具体内容
	readLog: function(path) {
		// 编码格式
		const charset = 'utf-8';
		let file = new this.File(path);
		let inputStreamReader = null
		let bufferedReader = null
		let list = []
		try {
			//不存在
			if (!file.exists()) {
				return list;
			}
			inputStreamReader = new this.InputStreamReader(new this.FileInputStream(file), charset);
			bufferedReader = new this.BufferedReader(inputStreamReader);

			let line = ''
			while (null != (line = bufferedReader.readLine())) {
				if (line) {
					list.push(line);
				}
			}
			bufferedReader.close();
			inputStreamReader.close();
		} catch (e) {
			console.error(e);
			if (bufferedReader) {
				bufferedReader.close();
			}
			if (inputStreamReader) {
				inputStreamReader.close();
			}
			return list
		}
		return list

	}
}
/**
 *获取各种时间格式
 * @style 1. hh:mm:ss 时:分:秒
 *        2.YYYY-MM-DD 年-月-日
 *        3.YYYYMMDD 年月日
 *        4.YYYY-MM-DD hh:mm:ss 年-月-日 时:分:秒
 *        5.YYYYMMDDhhmmss 年月日时分秒
 *        6.DD 日
 *        7.getDay 获取当前星期几
 *        8.hhmmss 时分秒
 * */
const getTime = (style) => {
    let time = new Date();
    let times = "";
    //获取年月日
    let yyyy = time.getFullYear();
    let mm = time.getMonth();
    mm = mm >= 9 ? mm + 1 : "0" + (mm + 1);
    let dd = time.getDate();
    dd = dd >= 10 ? dd : "0" + dd;

    //获取时分秒
    let h = time.getHours();
    h = h >= 10 ? h : "0" + h
    let m = time.getMinutes();
    m = m >= 10 ? m : "0" + m
    let s = time.getSeconds();
    s = s >= 10 ? s : "0" + s;
    // 获取星期
    let z = time.getDay();
    z = '0'+z;

    if (style === "YYYY-MM-DD") {
        times = yyyy + "-" + mm + "-" + dd;
    }

    if (style === "hh:mm:ss") {
        times = h + ":" + m + ":" + s;
    }

    if (style === "YYYYMMDD") {
        times = yyyy + "" + mm + "" + dd;
    }
    if (style === "YYYY") {
        times = yyyy + ""
    }
    if (style === "MM") {
        times = mm + ""
    }
    if (style === "DD") {
        times =dd+"";
    }

    if (style === "YYYY-MM-DD hh:mm:ss" || !style) {
        times = yyyy + "-" + mm + "-" + dd + " " + h + ":" + m + ":" + s
    }
    if (style === 'YYYYMMDDhhmmss') {
        times = yyyy + "" + mm + "" + dd + "" + h + "" + m + "" + s
    }
    if (style === 'DD'){
        times = dd+''
    }
    if (style === 'getDay'){
        times = z+''
    }
    return times;
}

export default LogCat