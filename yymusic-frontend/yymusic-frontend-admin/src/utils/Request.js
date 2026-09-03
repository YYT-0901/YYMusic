import axios from "axios"
import toast from "react-hot-toast"

const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8"
const contentTypeJson = "application/json"
const responseTypeJson = "json"

const instance = axios.create({
	withCredentials: true,
	baseURL: "/api",
	timeout: 10 * 1000,
})

// 简单的Loading管理，实际项目中可以使用Context或Zustand
let loadingCount = 0
const showLoading = () => {
	loadingCount++
	// 这里可以触发一个全局的Loading组件显示
	if (loadingCount === 1) document.body.classList.add("loading-active")
}
const hideLoading = () => {
	loadingCount--
	if (loadingCount <= 0) {
		loadingCount = 0
		document.body.classList.remove("loading-active")
	}
}

instance.interceptors.request.use(
	(config) => {
		if (config.showLoading !== false) {
			showLoading()
		}
		return config
	},
	(error) => {
		if (error.config.showLoading !== false) {
			hideLoading()
		}
		toast.error("请求发送失败")
		return Promise.reject("请求发送失败")
	},
)

instance.interceptors.response.use(
	async (response) => {
		const {
			showLoading: isShowLoading,
			errorCallback,
			showError = true,
			responseType,
		} = response.config
		if (isShowLoading !== false) {
			hideLoading()
		}
		const responseData = response.data
		if (responseType === "arraybuffer" || responseType === "blob") {
			return responseData
		}
		if (responseData.code === 200) {
			return responseData
		} else if (responseData.code === 901) {
			// React中非组件内跳转通常用window.location
			localStorage.removeItem("token")
			window.location.href = "/login"
			return Promise.reject({ showError: false })
		} else {
			if (errorCallback) {
				errorCallback(responseData)
			}
			return Promise.reject({ showError: showError, msg: responseData.info })
		}
	},
	(error) => {
		if (error.config && error.config.showLoading !== false) {
			hideLoading()
		}
		return Promise.reject({ showError: true, msg: "网络异常" })
	},
)

const request = (config) => {
	const {
		url,
		params,
		dataType,
		showLoading = true,
		responseType = responseTypeJson,
		showError = true,
	} = config
	let contentType = contentTypeForm
	let formData = new FormData()
	for (let key in params) {
		formData.append(key, params[key] === undefined ? "" : params[key])
	}
	if (dataType != null && dataType === "json") {
		contentType = contentTypeJson
	}
	let token = localStorage.getItem("token")
	let headers = {
		"Content-Type": contentType,
		"X-Requested-With": "XMLHttpRequest",
		token: token,
	}

	return instance
		.post(url, formData, {
			onUploadProgress: (event) => {
				if (config.uploadProgressCallback) {
					config.uploadProgressCallback(event)
				}
			},
			responseType: responseType,
			headers: headers,
			showLoading: showLoading,
			errorCallback: config.errorCallback,
			showError: showError,
		})
		.catch((error) => {
			if (error?.showError) {
				toast.error(error.msg)
			}
			return null
		})
}

export default request
