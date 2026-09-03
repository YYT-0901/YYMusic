import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.locale("zh-cn")
dayjs.extend(relativeTime)

/**
 * 格式化时间
 * @param {string|Date} date - 日期
 * @param {string} format - 格式
 * @returns {string}
 */
export function formatTime(date, format = "YYYY-MM-DD HH:mm:ss") {
	if (!date) return "-"
	return dayjs(date).format(format)
}

/**
 * 格式化相对时间
 * @param {string|Date} date - 日期
 * @returns {string}
 */
export function formatRelativeTime(date) {
	if (!date) return "-"
	return dayjs(date).fromNow()
}

/**
 * 格式化数字
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
export function formatNumber(num, decimals = 0) {
	if (num === null || num === undefined) return "-"
	return Number(num).toLocaleString("zh-CN", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	})
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string}
 */
export function formatFileSize(bytes) {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * 字符串截断
 * @param {string} str - 字符串
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string}
 */
function truncate(str, maxLength = 50, suffix = "...") {
	if (!str) return ""
	if (str.length <= maxLength) return str
	return str.slice(0, maxLength) + suffix
}

// 处理时长格式
export const formatDuration = (seconds) => {
	if (!seconds) return "0:00"
	if (isNaN(seconds)) return "0:00"
	seconds = Math.floor(seconds)
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, "0")}`
}
