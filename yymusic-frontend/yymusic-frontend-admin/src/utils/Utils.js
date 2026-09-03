import moment from "moment"
// 这里简化资源获取，实际可用 Vite 的 new URL(..., import.meta.url).href
const getLocalResource = (path) => {
	return new URL(`../assets/${path}`, import.meta.url).href
}

moment.locale("zh-cn")

const formatDate = (timestamp, patten = "YYYY-MM-DD HH:mm:ss") => {
	if (!timestamp) return "-"
	return moment(timestamp).format(patten)
}

export default {
	formatDate,
	getLocalResource,
}
