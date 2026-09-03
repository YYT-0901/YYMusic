import request from "@/utils/request"

/**
 * 1.1 获取图形验证码
 * @returns {Promise<{checkCodeKey: string, checkCode: string}>}
 */
export function getCheckCode() {
	return request({
		url: "/account/checkCode",
		method: "GET",
	})
}

/**
 * 1.2 用户注册
 * @param {Object} params - 注册参数
 * @param {string} params.checkCodeKey - 验证码 Key
 * @param {string} params.checkCode - 验证码内容
 * @param {string} params.email - 邮箱 (最大50字符)
 * @param {string} params.password - 密码 (8-18位)
 * @param {string} params.nickName - 昵称 (最大20字符)
 * @returns {Promise}
 */
export function register(params) {
	return request({
		url: "/account/register",
		method: "POST",
		data: params,
	})
}

/**
 * 1.3 用户登录
 * @param {Object} params - 登录参数
 * @param {string} params.checkCodeKey - 验证码 Key
 * @param {string} params.checkCode - 验证码内容
 * @param {string} params.email - 邮箱
 * @param {string} params.password - 密码
 * @returns {Promise<{userId: string, nickName: string, token: string, avatar: string, integral: number}>}
 */
export function login(params) {
	return request({
		url: "/account/login",
		method: "POST",
		data: params,
	})
}

/**
 * 1.4 获取/刷新登录用户信息
 * @returns {Promise<{userId: string, nickName: string, token: string, avatar: string, integral: number}>}
 */
export function getLoginInfo() {
	return request({
		url: "/account/getLoginInfo",
		method: "POST",
	})
}

/**
 * 1.5 用户登出
 * @returns {Promise}
 */
export function logout() {
	return request({
		url: "/account/logout",
		method: "POST",
	})
}

/**
 * 获取积分记录
 * @param {Object} params - 请求参数
 * @param {number} params.pageNo - 页码
 * @returns {Promise<any>} - 返回积分记录列表
 */
export function getIntegralRecords(params) {
	return request({
		url: "/my/integralRecords",
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data: params,
	})
}

/**
 * 5.1 获取用户公开信息
 * @param {Object} params - 请求参数
 * @param {string} params.userId - 用户ID
 * @returns {Promise<{userId: string, email: string, nickName: string, avatar: string, musicCount: number, goodCount: number}>}
 */
export function getUserInfo(params) {
	return request({
		url: "/user/getUserInfo",
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data: params,
	})
}

/**
 * 5.2 获取用户公开音乐列表
 * @param {Object} params - 请求参数
 * @param {string} params.userId - 用户ID
 * @param {number} [params.pageNo] - 页码
 * @returns {Promise<{totalCount: number, pageSize: number, pageNo: number, pageTotal: number, list: Array}>}
 */
export function loadUserMusic(params) {
	return request({
		url: "/user/loadUserMusic",
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data: params,
	})
}

export const updatePassword = (data) => {
	return request({
		url: "/account/updatePassword",
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data: {
			oldPassword: data.oldPassword,
			newPassword: data.newPassword,
		},
	})
}

export const updateUserInfo = (data) => {
	const formData = new FormData()
	formData.append("nickName", data.nickName)
	if (data.avatar) {
		formData.append("avatar", data.avatar)
	}

	return request({
		url: "/account/updateUserInfo",
		method: "POST",
		data: formData,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	})
}
