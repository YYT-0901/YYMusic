import request from "@/utils/request"

/**
 * 加载商品列表
 * @returns {Promise<Array>} 商品列表数据
 */
export function loadProduct() {
	return request({
		url: "/buy/loadProduct",
		method: "POST",
	})
}

/**
 * 获取支付信息
 * @param {Object} params - 请求参数
 * @param {string} params.productId - 商品ID
 * @param {number} params.payType - 支付类型 (1: 微信, 2: 支付宝, 0: 支付码)
 * @returns {Promise<{orderId: string, payUrl?: string}>} 支付信息
 */
export function getPayInfo(params) {
	return request({
		url: "/buy/getPayInfo",
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: params,
	})
}

/**
 * 获取支付信息
 * @param {Object} params - 请求参数
 * @param {string} params.productId - 商品ID
 * @param {number} params.payType - 支付类型 (1: 微信, 2: 支付宝, 0: 支付码)
 * @param {string} params.token - 用户token
 * @returns {Promise<{orderId: string, payUrl?: string}>} 支付信息
 */
export function getPayInfoAlipay(params) {
	return request({
		url: "/buy/getPayInfoAlipay?" + params.toString(),
		method: "GET",
	})
}

/**
 * 检查支付状态 (轮询)
 * @param {Object} params - 请求参数
 * @param {string} params.orderId - 订单ID
 * @returns {Promise<boolean>} 支付是否成功
 */
export function checkPayOrder(params) {
	return request({
		url: "/buy/checkPayOrder",
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		data: params,
	})
}

/**
 * 使用支付码购买
 * @param {Object} params - 请求参数
 * @param {string} params.checkCodeKey - 验证码Key
 * @param {string} params.checkCode - 验证码内容
 * @param {string} params.productId - 商品ID
 * @param {string} params.payCode - 支付码
 * @returns {Promise} 购买结果
 */
export function buyByPayCode(params) {
	return request({
		url: "/buy/buyByPayCode",
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: params,
	})
}

export function getHavePay(params) {
	return request({
		url: "/buy/havePay",
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: params,
	})
}
