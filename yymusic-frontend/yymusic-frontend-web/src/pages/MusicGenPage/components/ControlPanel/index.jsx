import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Sparkles } from "lucide-react"
import CategoryToggle from "../CategoryToggle"
import ModeToggle from "../ModeToggle"
import PromptInput from "../PromptInput"
import StyleTags from "../StyleTags"
import LyricsInput from "../LyricsInput"
import ModelSelector from "../ModelSelector"
import GenerateButton from "../GenerateButton"
import {
	setCategory,
	setMode,
	setModel,
	setPrompt,
	setLyrics,
	toggleTag,
} from "../../../../store/index.js"

/**
 * 创作控制面板组件
 * 包含：标题、分类切换、模式切换、输入区域、模型选择、生成按钮
 */
export default function ControlPanel() {
	const dispatch = useDispatch()
	const { category, mode, model, prompt, lyrics, selectedTags, styleTags } = useSelector(
		(state) => state.musicGen,
	)

	// 事件处理函数
	const handleCategoryChange = (value) => dispatch(setCategory(value))
	const handleModeChange = (value) => dispatch(setMode(value))
	const handleModelChange = (value) => dispatch(setModel(value))
	const handlePromptChange = (value) => dispatch(setPrompt(value))
	const handleLyricsChange = (value) => dispatch(setLyrics(value))
	const handleToggleTag = (tag) => dispatch(toggleTag(tag))

	return (
		<div className="w-full md:w-[400px] flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-950 border-b md:border-b-0 md:border-r border-system-primary/30 flex flex-col h-full shadow-2xl shadow-system-primary/10 z-10">
			{/* 顶部标题 */}
			<div className="p-6 border-b border-system-primary/30">
				<h1 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-system-primary-lighter to-system-secondary-lighter bg-clip-text text-transparent">
					<Sparkles className="w-6 h-6 text-system-primary" />
					AI 音乐创作工坊
				</h1>
			</div>

			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* 1. 分类切换 */}
				<CategoryToggle />

				{/* 2. 模式切换 */}
				<ModeToggle />

				{/* 3. 输入区域 */}
				<div className="space-y-4">
					<PromptInput mode={mode} />

					{/* 高级模式特有组件 */}
					{mode === "advanced" && (
						<div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
							<StyleTags />
							{category === "song" && <LyricsInput />}
						</div>
					)}
				</div>

				{/* 4. 模型选择 */}
				<ModelSelector />
			</div>

			{/* 底部按钮 */}
			<div className="p-6 border-t border-system-primary/30 bg-slate-900/80 backdrop-blur-sm">
				<GenerateButton />
			</div>
		</div>
	)
}
