import axios from "axios"

// 创建 axios 实例
const request = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
})

// 请求拦截器
request.interceptors.request.use(
	(config) => {
		// 在这里可以添加 token 等认证信息
		const token = localStorage.getItem("token")
		if (token) {
			config.headers.token = `${token}`
		}
		return config
	},
	(error) => {
		console.error("请求错误:", error)
		return Promise.reject(error)
	},
)

// 响应拦截器
request.interceptors.response.use(
	(response) => {
		const { data } = response
		// 根据实际后端接口结构调整响应处理逻辑
		// 适配格式: { status: "success", code: 200, data: {...} }
		if (data.code === 200 || data.code === 0 || data.status === "success") {
			return data.data
		}
		return Promise.reject(new Error(data.info || data.message || "请求失败"))
	},
	(error) => {
		console.error("响应错误:", error)
		// 处理HTTP错误状态码
		if (error.response) {
			const { status, data } = error.response
			if (status === 401) {
				return Promise.reject(new Error(data.info || "登录已过期，请重新登录"))
			} else if (status === 403) {
				return Promise.reject(new Error(data.info || "没有权限访问"))
			} else if (status === 404) {
				return Promise.reject(new Error(data.info || "请求的资源不存在"))
			} else if (status === 901) {
				localStorage.removeItem("token")
				window.location.href = "/home?loginShow=true"
				return
			} else {
				return Promise.reject(new Error(data.info || `请求失败 (${status})`))
			}
		}
		return Promise.reject(error)
	},
)

export default request
