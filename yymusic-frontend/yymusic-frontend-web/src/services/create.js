import request from "@/utils/request"

// 加载系统字典
export const loadSysDict = () => {
	return request({
		url: "/my/loadSysDict",
		method: "GET",
	})
}

// 创建音乐（AI生成）
export const createMusic = (params) => {
	return request({
		url: "/my/createMusic",
		method: "POST",
		data: params,
	})
}

// 轮询创建中的音乐状态
export const loadCreatingMusic = (musicIds) => {
	return request({
		url: "/my/loadCreatingMusic",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: {
			musicIds: musicIds,
		},
	})
}
