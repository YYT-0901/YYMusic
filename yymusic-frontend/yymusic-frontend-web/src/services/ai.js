import { useSelector } from "react-redux"

/**
 * 与AI智能客服聊天 - 流式处理
 * @param {string} message - 聊天消息
 * @param {function} onChunk - 接收流数据的回调函数
 * @param {function} onComplete - 流结束的回调函数
 * @param {function} onError - 错误处理回调函数
 * @param {AbortController} abortController - 中止控制器
 */
export const chatWithAI = (message, onChunk, onComplete, onError, abortController) => {
	const token = localStorage.getItem("token") // 从localStorage获取token

	// 构建带参数的URL
	const url = new URL("/api/ai/chatStream", window.location.origin)
	url.searchParams.append("message", message)

	fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			token: token || "",
		},
		signal: abortController?.signal,
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			if (!response.body) {
				throw new Error("ReadableStream not supported")
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()

			const processStream = ({ done, value }) => {
				if (done) {
					onComplete()
					return
				}

				const chunk = decoder.decode(value, { stream: true })
				onChunk(chunk)

				return reader.read().then(processStream)
			}

			return reader.read().then(processStream)
		})
		.catch((error) => {
			if (error.name !== "AbortError") {
				onError(error)
			}
		})
}
