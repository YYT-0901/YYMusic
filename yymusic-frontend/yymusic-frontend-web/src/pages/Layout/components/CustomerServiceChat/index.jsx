import { useState, useEffect, useRef } from "react"
import { chatWithAI } from "@/services/ai"

const DEFAULT_DRAWER_WIDTH = 384
const MIN_DRAWER_WIDTH = 320
const MAX_DRAWER_WIDTH = 720

const clampDrawerWidth = (nextWidth) => {
	if (typeof window === "undefined") {
		return nextWidth
	}

	const viewportWidth = window.innerWidth
	const maxWidth = Math.min(MAX_DRAWER_WIDTH, Math.floor(viewportWidth * 0.85))
	const minWidth = Math.min(MIN_DRAWER_WIDTH, maxWidth)

	return Math.min(maxWidth, Math.max(minWidth, Math.round(nextWidth)))
}

/**
 * YYMusic智能客服聊天组件
 */
const CustomerServiceChat = ({ visible, onClose }) => {
	const [messages, setMessages] = useState([
		{
			id: "1",
			content: "您好！我是YYMusic智能客服，有什么可以帮助您的吗？",
			type: "ai",
		},
	])
	const [inputValue, setInputValue] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [currentMessageId, setCurrentMessageId] = useState(null)
	const [drawerWidth, setDrawerWidth] = useState(() =>
		clampDrawerWidth(DEFAULT_DRAWER_WIDTH),
	)
	const [isResizing, setIsResizing] = useState(false)
	const messagesEndRef = useRef(null)
	const abortControllerRef = useRef(null)
	const resizeStateRef = useRef({
		startX: 0,
		startWidth: DEFAULT_DRAWER_WIDTH,
	})
	const bodyStyleRef = useRef({
		cursor: "",
		userSelect: "",
	})

	// 自动滚动到底部
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	// 保持抽屉宽度始终处于可视范围内
	useEffect(() => {
		const syncDrawerWidth = () => {
			setDrawerWidth((currentWidth) => clampDrawerWidth(currentWidth))
		}

		syncDrawerWidth()
		window.addEventListener("resize", syncDrawerWidth)

		return () => {
			window.removeEventListener("resize", syncDrawerWidth)
		}
	}, [])

	// 拖拽拉伸抽屉宽度
	useEffect(() => {
		if (!isResizing) {
			return undefined
		}

		const handlePointerMove = (event) => {
			const { startX, startWidth } = resizeStateRef.current
			const nextWidth = startWidth + (startX - event.clientX)

			setDrawerWidth(clampDrawerWidth(nextWidth))
		}

		const handlePointerUp = () => {
			setIsResizing(false)
		}

		bodyStyleRef.current = {
			cursor: document.body.style.cursor,
			userSelect: document.body.style.userSelect,
		}
		document.body.style.cursor = "ew-resize"
		document.body.style.userSelect = "none"

		window.addEventListener("pointermove", handlePointerMove)
		window.addEventListener("pointerup", handlePointerUp)
		window.addEventListener("pointercancel", handlePointerUp)

		return () => {
			window.removeEventListener("pointermove", handlePointerMove)
			window.removeEventListener("pointerup", handlePointerUp)
			window.removeEventListener("pointercancel", handlePointerUp)
			document.body.style.cursor = bodyStyleRef.current.cursor
			document.body.style.userSelect = bodyStyleRef.current.userSelect
		}
	}, [isResizing])

	// 停止生成
	const stopGeneration = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
			abortControllerRef.current = null
		}
		setIsLoading(false)
	}

	// 处理发送消息 - 流式处理
	const handleSend = () => {
		if (!inputValue.trim() || isLoading) return

		const userMessage = {
			id: Date.now().toString(),
			content: inputValue.trim(),
			type: "user",
		}

		setMessages((prev) => [...prev, userMessage])
		setInputValue("")
		setIsLoading(true)
		setCurrentMessageId(userMessage.id)

		// 创建AI消息对象
		const aiMessageId = (Date.now() + 1).toString()
		const aiMessage = {
			id: aiMessageId,
			content: "",
			type: "ai",
		}

		setMessages((prev) => [...prev, aiMessage])
		// 设置当前正在生成的消息ID
		setCurrentMessageId(aiMessageId)

		// 创建中止控制器
		abortControllerRef.current = new AbortController()

		// 处理流数据
		const handleChunk = (chunk) => {
			// 更新AI消息内容
			setMessages((prev) => {
				return prev.map((msg) => {
					if (msg.id === aiMessageId) {
						return { ...msg, content: msg.content + chunk }
					}
					return msg
				})
			})
		}

		// 处理流结束
		const handleComplete = () => {
			setIsLoading(false)

			abortControllerRef.current = null
			// 重置当前消息ID
			setCurrentMessageId(null)
		}

		// 处理错误
		const handleError = (error) => {
			console.error("聊天请求失败:", error)
			// 更新AI消息为错误提示
			setMessages((prev) => {
				return prev.map((msg) => {
					if (msg.id === aiMessageId) {
						return {
							...msg,
							content: msg.content || "抱歉，网络连接失败，请稍后再试。",
						}
					}
					return msg
				})
			})
			setIsLoading(false)

			abortControllerRef.current = null
			// 重置当前消息ID
			setCurrentMessageId(null)
		}

		// 发起流式请求
		chatWithAI(
			userMessage.content,
			handleChunk,
			handleComplete,
			handleError,
			abortControllerRef.current,
		)
	}

	// 处理键盘发送
	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	const handleResizeStart = (event) => {
		event.preventDefault()
		resizeStateRef.current = {
			startX: event.clientX,
			startWidth: drawerWidth,
		}
		setIsResizing(true)
	}

	const handleResizeReset = () => {
		setDrawerWidth(clampDrawerWidth(DEFAULT_DRAWER_WIDTH))
	}

	return (
		<div
			className={`fixed top-0 right-0 z-50 flex h-full flex-col bg-slate-800 text-slate-100 shadow-2xl transition-transform duration-500 ease-in-out ${visible ? "translate-x-0" : "translate-x-full"}`}
			style={{ width: `${drawerWidth}px` }}
		>
			<button
				type="button"
				onPointerDown={handleResizeStart}
				onDoubleClick={handleResizeReset}
				className={`absolute left-0 top-0 h-full w-4 -translate-x-1/2 touch-none cursor-ew-resize ${visible ? "pointer-events-auto" : "pointer-events-none"}`}
				aria-label="Resize customer service drawer"
				title="Drag to resize. Double-click to reset width."
			>
				<span
					className={`mx-auto block h-full w-px transition-colors ${isResizing ? "bg-system-primary" : "bg-slate-600/80 hover:bg-system-primary/70"}`}
				/>
			</button>

			{/* 头部 */}
			<div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
				<div className="flex items-center space-x-2">
					<div className="w-8 h-8 rounded-full bg-system-primary flex items-center justify-center text-white font-bold">
						AI
					</div>
					<h3 className="font-semibold text-lg">智能客服</h3>
				</div>
				<button
					onClick={onClose}
					className="text-slate-400 hover:text-slate-200 transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			{/* 聊天记录 */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
				{messages.map((message) => {
					// 如果是AI消息且正在生成，显示打字机效果
					const isAiGenerating =
						message.type === "ai" && isLoading && message.id === currentMessageId

					return (
						<div
							key={message.id}
							className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[80%] rounded-lg p-3 ${message.type === "user" ? "bg-system-primary text-white" : "bg-slate-700 text-slate-200 border border-slate-600"}`}
							>
								{message.content}
								{isAiGenerating && (
									<span className="inline-block w-2 h-4 ml-1 align-middle bg-system-primary-lighter animate-pulse"></span>
								)}
							</div>
						</div>
					)
				})}

				<div ref={messagesEndRef} />
			</div>

			{/* 输入区域 */}
			<div className="p-4 border-t border-slate-700 bg-slate-800">
				<div className="flex space-x-2">
					<textarea
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="请输入您的问题..."
						className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-system-primary placeholder-slate-400"
						rows={3}
						disabled={isLoading}
					/>
					{isLoading ? (
						<button
							onClick={stopGeneration}
							className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
						>
							停止
						</button>
					) : (
						<button
							onClick={handleSend}
							disabled={isLoading}
							className="bg-system-primary hover:bg-system-primary-darker text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center disabled:bg-system-primary-light disabled:opacity-50"
						>
							发送
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default CustomerServiceChat
