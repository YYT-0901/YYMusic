import { createRoot } from "react-dom/client"
import MessageModal from "../components/MessageModal"

// 创建一个消息队列
let messageQueue = []
let currentMessage = null
let container = null
let root = null

// 显示消息的函数
const showMessage = ({ type, content, duration = 3000 }) => {
	return new Promise((resolve) => {
		// 创建一个唯一的ID
		const id = Date.now() + Math.random()

		// 将消息添加到队列
		messageQueue.push({ id, type, message: content, duration, resolve })

		// 如果没有当前消息，立即处理
		if (!currentMessage) {
			processNextMessage()
		}
	})
}

// 处理下一条消息
const processNextMessage = () => {
	if (messageQueue.length === 0) {
		currentMessage = null
		// 如果队列空了，清理容器
		if (root) {
			root.unmount()
			root = null
		}
		if (container) {
			document.body.removeChild(container)
			container = null
		}
		return
	}

	// 获取下一条消息
	currentMessage = messageQueue.shift()

	// 创建容器元素
	if (!container) {
		container = document.createElement("div")
		document.body.appendChild(container)
		root = createRoot(container)
	}

	// 渲染消息组件
	root.render(
		<MessageModal
			isOpen={true}
			type={currentMessage.type}
			message={currentMessage.message}
			duration={currentMessage.duration}
			onClose={() => {
				// 调用resolve
				currentMessage.resolve()
				// 处理下一条消息
				processNextMessage()
			}}
		/>,
	)
}

// 创建message工具函数，支持不同类型的消息
const message = {
	success: (content, duration) => showMessage({ type: "success", content, duration }),
	error: (content, duration) => showMessage({ type: "error", content, duration }),
	warning: (content, duration) => showMessage({ type: "warning", content, duration }),
	info: (content, duration) => showMessage({ type: "info", content, duration }),
}

export default message
