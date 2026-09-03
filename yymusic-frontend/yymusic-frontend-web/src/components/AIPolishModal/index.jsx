import { useState, useEffect, useRef } from "react"
import { Sparkles, X, Check, Loader2, RefreshCw } from "lucide-react"
import { useSelector } from "react-redux"
import message from "../../utils/message"
export default function AIPolishModal({ isOpen, onClose, onConfirm, originalText, type = 0 }) {
	const [generatedText, setGeneratedText] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [isThinking, setIsThinking] = useState(false) // 连接还没建立时的思考状态
	const abortControllerRef = useRef(null)
	const { token } = useSelector((state) => state.user)

	// 监听打开状态，一旦打开立即开始生成
	useEffect(() => {
		if (isOpen && originalText) {
			startPolish()
		}
		return () => stopGeneration()
	}, [isOpen, originalText])

	const stopGeneration = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
			abortControllerRef.current = null
		}
		setIsLoading(false)
		setIsThinking(false)
	}

	const startPolish = async () => {
		setGeneratedText("")
		setIsLoading(true)
		setIsThinking(true)

		abortControllerRef.current = new AbortController()

		try {
			const response = await fetch("/api/agent/aiGen", {
				method: "POST",
				headers: { "Content-Type": "application/json", token: token },
				body: JSON.stringify({ text: originalText, type }),
				signal: abortControllerRef.current.signal,
			})

			setIsThinking(false) // 连接建立，开始接收流

			if (!response.ok) throw new Error("API request failed")
			if (!response.body) throw new Error("ReadableStream not supported")

			const reader = response.body.getReader()
			const decoder = new TextDecoder()

			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				const chunk = decoder.decode(value, { stream: true })
				// 实时更新文本，形成打字机效果
				setGeneratedText((prev) => prev + chunk)
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				message.error("润色失败，请稍后重试")
				console.error("Polish error:", error)
			}
		} finally {
			setIsLoading(false)
			abortControllerRef.current = null
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl w-[500px] max-w-[90vw] shadow-2xl flex flex-col overflow-hidden">
				{/* Header */}
				<div className="flex justify-between items-center p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800">
					<h3 className="text-white font-medium flex items-center gap-2">
						<Sparkles className="w-4 h-4 text-system-primary-lighter" />
						AI 智能润色
					</h3>
					{!isLoading && (
						<button
							onClick={onClose}
							className="text-slate-400 hover:text-white transition-all duration-300 hover:scale-105"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>

				{/* Content - 打字机效果区域 */}
				<div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 min-h-[150px] max-h-[60vh] overflow-y-auto">
					{isThinking ? (
						<div className="flex flex-col items-center justify-center h-24 space-y-3 text-slate-400">
							<Loader2 className="w-6 h-6 animate-spin text-system-primary" />
							<span className="text-xs">正在思考如何优化您的提示词...</span>
						</div>
					) : (
						<div className="prose prose-invert prose-sm max-w-none">
							<p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-mono">
								{generatedText}
								{isLoading && (
									<span className="inline-block w-2 h-4 ml-1 align-middle bg-system-primary animate-pulse" />
								)}
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-end gap-3">
					{isLoading ? (
						<button
							onClick={stopGeneration}
							className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-all duration-300"
						>
							停止生成
						</button>
					) : (
						<>
							<button
								onClick={startPolish}
								className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-all duration-300"
							>
								<RefreshCw className="w-3 h-3" />
								重试
							</button>
							<button
								onClick={() => onConfirm(generatedText)}
								disabled={!generatedText}
								className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-system-primary to-system-secondary hover:from-system-primary-light hover:to-system-secondary rounded-lg shadow-lg shadow-system-primary/20 flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Check className="w-3 h-3" />
								使用此提示词
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
