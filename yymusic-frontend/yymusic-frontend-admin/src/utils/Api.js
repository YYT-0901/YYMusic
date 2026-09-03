const RESOURCE_URL_PREFIX = "/api/file/getResource?filePath="

const isAbsoluteUrl = (value) => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) || /^(?:blob|data):/i.test(value)

export const getResourceUrl = (resource) => {
	const value = typeof resource === "string" ? resource.trim() : ""
	if (!value) {
		return ""
	}

	if (isAbsoluteUrl(value) || value.startsWith("/api/")) {
		return value
	}

	return `${RESOURCE_URL_PREFIX}${value}`
}

const Api = {
	checkCode: "/account/checkCode",
	login: "/account/login",
	logout: "/account/logout",
	getResource: RESOURCE_URL_PREFIX,
	loadSysDict: "/settings/loadSysDictList",
	saveSysDict: "/settings/saveSysDict",
	delDict: "/settings/delSysDict",
	changeDictSort: "/settings/changeSort",
	loadProduct: "/product/loadProduct",
	saveProduct: "/product/saveProduct",
	changeProductSort: "/product/changeProductSort",
	delProduct: "/product/delProduct",
	loadOrder: "/order/loadOrder",
	loadMusic: "/music/loadMusic",
	changeMusicCommendType: "/music/changeMusicCommendType",
	loadUser: "/user/loadUser",
	changeUserStatus: "/user/changeUserStatus",
	changeIntegral: "/user/changeIntegral",
	loadPaycodeList: "/payCode/loadPayCodeList",
	createCode: "/payCode/createCode",
	createCodeWithProductId: "/payCode/createCodeWithProductId",
	delCode: "/payCode/delCode",
}

export default Api
