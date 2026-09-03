import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setPrompt } from "../../../../store/index.js"
import { Wand2, Sparkles } from "lucide-react"
import ConfirmModal from "../../../../components/ConfirmModal"
import AIPolishModal from "../../../../components/AIPolishModal"
import message from "../../../../utils/message"
import { showLoginModal } from "../../../../store/index.js"

/**
 * 提示词输入组件
 */
export default function PromptInput({ mode }) {
	const dispatch = useDispatch()
	const { prompt, category, sysDict } = useSelector((state) => state.musicGen)
	const [originalText, setOriginalText] = useState(prompt)
	// 假设 user state 中有 token 或 userInfo，请根据实际情况调整
	const { token } = useSelector((state) => state.user || {})

	const MAX_PROMPT_LENGTH = 2000
	const [showRandomConfirm, setShowRandomConfirm] = useState(false)
	const [showPolishModal, setShowPolishModal] = useState(false)

	const handlePromptChange = (value) => {
		if (value.length <= MAX_PROMPT_LENGTH) {
			dispatch(setPrompt(value))
		}
	}

	// --- 逻辑处理 ---

	// 1. 随机生成逻辑
	const generateRandomPrompt = () => {
		if (!sysDict) return
		if (prompt && prompt.trim().length > 0) {
			setShowRandomConfirm(true)
		} else {
			doGenerateRandom()
		}
	}

	const doGenerateRandom = () => {
		const promptList =
			category === "instrumental"
				? sysDict.music_prompt_pure || []
				: sysDict.music_prompt || []

		if (promptList.length > 0) {
			const randomIndex = Math.floor(Math.random() * promptList.length)
			dispatch(setPrompt(promptList[randomIndex].dictCode))
		}
		setShowRandomConfirm(false)
	}

	// 2. AI 润色逻辑
	const handleAiPolishClick = () => {
		// 校验1 : 是否登录
		if (!token) {
			dispatch(showLoginModal())
			return message.warning("请先登录后再使用AI功能")
		}

		// 校验 2: 是否有内容
		if (!prompt || prompt.trim().length === 0) {
			return message.warning("请先输入一些简单的描述，AI才能帮您润色哦")
		}

		setOriginalText(prompt + "\n\n润色上面的提示词")

		setShowPolishModal(true)
	}

	const handlePolishConfirm = (newText) => {
		dispatch(setPrompt(newText))
		setShowPolishModal(false)
		message.success("提示词已更新")
	}

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium text-slate-300">
				{mode === "simple" ? "歌曲描述 / 提示词" : "风格提示词"}
			</label>
			<textarea
				value={prompt}
				onChange={(e) => handlePromptChange(e.target.value)}
				placeholder={
					mode === "simple"
						? "描述你想要的歌曲，例如：一首欢快的流行歌..."
						: "输入具体的提示词..."
				}
				className="w-full h-32 p-3 text-sm bg-slate-950 border border-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none outline-none transition-all placeholder-slate-600"
			/>
			<div className="flex justify-between items-center">
				<div className="flex gap-2">
					<button
						onClick={generateRandomPrompt}
						className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors flex items-center gap-1"
					>
						<Wand2 className="w-3.5 h-3.5" /> 变变变
					</button>
					<button
						onClick={handleAiPolishClick}
						className="text-xs px-3 py-1.5 bg-system-primary/30 hover:bg-system-primary/50 text-system-primary-lighter border border-system-primary/30 rounded-full transition-colors flex items-center gap-1 group"
					>
						<Sparkles className="w-3.5 h-3.5 group-hover:text-system-primary-lighter transition-colors" />
						AI 润色提示词
					</button>
				</div>
				<div className="text-right text-xs text-slate-500">
					{prompt?.length || 0}/{MAX_PROMPT_LENGTH}
				</div>
			</div>

			{/* 普通随机确认弹窗 */}
			<ConfirmModal
				isOpen={showRandomConfirm}
				onClose={() => setShowRandomConfirm(false)}
				onConfirm={doGenerateRandom}
				title="确认替换"
				message="确定要丢弃当前内容并生成随机提示词吗？"
				confirmText="确定替换"
				cancelText="取消"
			/>

			{/* AI 润色专用弹窗 */}
			<AIPolishModal
				isOpen={showPolishModal}
				originalText={originalText}
				onClose={() => setShowPolishModal(false)}
				onConfirm={handlePolishConfirm}
			/>
		</div>
	)
}
