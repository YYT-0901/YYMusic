import axios from "axios"
import request from "@/utils/request"

/**
 * 2.1 加载推荐音乐
 * 获取被推荐的音乐列表（无分页）
 * @param {Object} params - 参数
 * @param {boolean} params.isRandomTwo - 是否返回的是推荐音乐列表的随机两个, 不传则返回所有推荐音乐
 * @returns {Promise<{musicId, userId, taskId, creationId, musicTitle, cover, audioPath, duration, lyrics, playCount, goodCount, commendType, createTime, musicStatus, musicType, avatar, nickName, doGood}[]>}
 */
export function loadCommendMusic(params = {}) {
	return request({
		url: "/music/loadCommendMusic",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 2.2 加载最新音乐（分页）
 * 获取最新生成的音乐列表
 * @param {Object} params - 参数
 * @param {number} params.pageNo - 页码
 * @param {number} params.indexType - 首页类型 (非空时每页12条，为空时每页20条)
 * @returns {Promise<{totalCount, pageSize, pageNo, pageTotal, list: []}>}
 */
export function loadLatestMusic(params) {
	return request({
		url: "/music/loadLatestMusic",
		method: "POST",
		data: params,
	})
}

/**
 * 2.3 获取音乐详情
 * 获取单首音乐的详细信息
 * @param {Object} params - 参数
 * @param {string} params.musicId - 音乐ID
 * @returns {Promise}
 */
export function getMusicDetail(params) {
	return request({
		url: "/music/musicDetail",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 2.4 点赞音乐
 * 对音乐进行点赞操作 (需登录)
 * @param {Object} params - 参数
 * @param {string} params.musicId - 音乐ID
 * @returns {Promise}
 */
export function doGood(params) {
	return request({
		url: "/music/doGood",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 3.2 查询我的音乐列表
 * 分页获取当前用户创建的音乐
 * @param {Object} params - 参数
 * @param {number} params.pageNo - 页码
 * @param {boolean} params.queryLikeMusic - 是否查询我喜欢的音乐 (true: 喜欢, false/null: 我创建的)
 * @returns {Promise<{musicId, userId, taskId, creationId, musicTitle, cover, audioPath, duration, lyrics, playCount, goodCount, commendType, createTime, musicStatus, musicType}[]>}
 */
export function loadMyMusic(params) {
	return request({
		url: "/my/loadMyMusic",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 3.4 上传音乐封面
 * 上传自定义封面
 * @param {Object} params - 参数
 * @param {string} params.musicId - 音乐ID
 * @param {File} params.cover - 图片文件 (MultipartFile)
 * @returns {Promise}
 */
export function uploadMusicCover(params) {
	const formData = new FormData()
	formData.append("musicId", params.musicId)
	formData.append("cover", params.cover)

	return request({
		url: "/my/uploadMusicCover",
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data: formData,
	})
}

/**
 * 3.5 修改音乐标题
 * 修改音乐标题
 * @param {Object} params - 参数
 * @param {string} params.musicId - 音乐ID
 * @param {string} params.musicTitle - 新标题
 * @returns {Promise}
 */
export function changeMusicTitle(params) {
	return request({
		url: "/my/changeMusicTitle",
		method: "PUT",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 3.6 删除音乐
 * 删除音乐
 * @param {Object} params - 参数
 * @param {string} params.musicId - 音乐ID
 * @returns {Promise}
 */
export function delMusic(params) {
	return request({
		url: "/my/delMusic",
		method: "DELETE",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 2.5 更新播放次数
 * 更新音乐播放次数
 * @param {Object} params - 参数
 * @param {string} params.musicId - 音乐ID
 * @returns {Promise}
 */
export function updatePlayCount(params) {
	return request({
		url: "/music/updatePlayCount",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 2.6 获取创作参数详情
 * 获取用于生成该音乐的提示词、风格等参数
 * @param {Object} params - 参数
 * @param {string} params.creationId - 创作记录ID
 * @returns {Promise}
 */
export function getCreation(params) {
	return request({
		url: "/music/getCreation",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: params,
	})
}

/**
 * 2.7 下载音频
 * 获取音乐音频文件
 * @param {Object} params - 参数
 * @param {string} params.musicId - 音乐ID
 * @returns {Promise}
 */
export function downloadMusic(params) {
	const token = localStorage.getItem("token")
	return axios({
		url: `${import.meta.env.VITE_API_BASE_URL || "/api"}/music/downloadMusic`,
		method: "GET",
		params,
		responseType: "blob",
		timeout: 60000,
		headers: token
			? {
					token,
				}
			: undefined,
	})
}
