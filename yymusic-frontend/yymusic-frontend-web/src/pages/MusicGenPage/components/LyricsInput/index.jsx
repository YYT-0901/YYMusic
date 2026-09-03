import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setLyrics, showLoginModal } from "../../../../store/index.js"
import { Sparkles } from "lucide-react"
import AIPolishModal from "../../../../components/AIPolishModal"
import message from "../../../../utils/message"

/**
 * 歌词输入组件
 */
export default function LyricsInput() {
	const dispatch = useDispatch()
	const { lyrics, prompt } = useSelector((state) => state.musicGen)
	const [originalText, setOriginalText] = useState(lyrics)
	const { token } = useSelector((state) => state.user || {})
	const MAX_LYRICS_LENGTH = 1500
	const [showLyricsGenModal, setShowLyricsGenModal] = useState(false)

	const handleLyricsChange = (value) => {
		if (value.length <= MAX_LYRICS_LENGTH) {
			dispatch(setLyrics(value))
		}
	}

	// AI 生成歌词逻辑
	const handleAiLyricsGenClick = () => {
		// 校验 1: 是否登录
		if (!token) {
			dispatch(showLoginModal())
			return message.warning("请先登录后再使用AI功能")
		}

		// 校验 2: 校验歌词
		if (!lyrics || lyrics.trim().length === 0) {
			if (!prompt || prompt.trim().length === 0) {
				return message.warning("请先输入歌曲描述提示词，AI才能帮您生成歌词哦")
			}
			setOriginalText(prompt)
		} else {
			setOriginalText(lyrics)
		}

		setShowLyricsGenModal(true)
	}

	const handleLyricsGenConfirm = (newText) => {
		dispatch(setLyrics(newText))
		setShowLyricsGenModal(false)
		message.success("歌词已生成")
	}

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium text-slate-300 flex justify-between">
				<span>歌词内容</span>
				<span className="text-xs text-slate-500 font-normal">可选</span>
			</label>
			<textarea
				value={lyrics}
				onChange={(e) => handleLyricsChange(e.target.value)}
				placeholder="[Verse 1]&#10;在这里输入你的歌词..."
				className="w-full h-32 p-3 text-sm bg-slate-950 border border-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none outline-none font-mono placeholder-slate-600"
			/>
			<div className="flex justify-between items-center">
				<div>
					<button
						onClick={handleAiLyricsGenClick}
						className="text-xs px-3 py-1.5 bg-system-primary/30 hover:bg-system-primary/50 text-system-primary-lighter border border-system-primary/30 rounded-full transition-colors flex items-center gap-1 group"
					>
						<Sparkles className="w-3.5 h-3.5 group-hover:text-system-primary-lighter transition-colors" />
						AI 生成歌词
					</button>
				</div>
				<div className="text-right text-xs text-slate-500">
					{lyrics?.length || 0}/{MAX_LYRICS_LENGTH}
				</div>
			</div>

			{/* AI 生成歌词专用弹窗 */}
			<AIPolishModal
				isOpen={showLyricsGenModal}
				originalText={originalText}
				onClose={() => setShowLyricsGenModal(false)}
				onConfirm={handleLyricsGenConfirm}
				type={1} // 传入type=1表示生成歌词
			/>
		</div>
	)
}
