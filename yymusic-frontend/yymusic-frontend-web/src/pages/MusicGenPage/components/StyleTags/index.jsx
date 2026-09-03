import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleTag } from "../../../../store/index.js"

/**
 * 风格标签选择组件 - 包含曲风、情绪和人声
 */
export default function StyleTags() {
	const dispatch = useDispatch()
	const { selectedTags, sysDict } = useSelector((state) => state.musicGen)

	const handleToggleTag = (tag, type) => dispatch(toggleTag({ value: tag, type }))

	// 获取标签数据，优先使用系统字典，否则使用空数组
	const genres = sysDict?.music_grenre || []
	const emotions = sysDict?.music_emotion || []
	const genders = sysDict?.music_sex || []
	const chords = sysDict?.music_chord || []
	const tones = sysDict?.music_tone || []

	return (
		<div className="space-y-4">
			{/* 曲风选择 */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-300">选择曲风</label>
				<div className="flex flex-wrap gap-2">
					{genres.map((genre) => (
						<button
							key={genre.dictId}
							onClick={() => handleToggleTag(genre.dictCode, "genre")}
							className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
								selectedTags.some((tag) => tag.value === genre.dictCode)
									? "bg-sky-900/30 border-sky-500 text-sky-400"
									: "bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800"
							}`}
						>
							{genre.dictCode}
						</button>
					))}
				</div>
			</div>

			{/* 情绪选择 */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-300">选择情绪</label>
				<div className="flex flex-wrap gap-2">
					{emotions.map((emotion) => (
						<button
							key={emotion.dictId}
							onClick={() => handleToggleTag(emotion.dictCode, "emotion")}
							className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
								selectedTags.some((tag) => tag.value === emotion.dictCode)
									? "bg-sky-900/30 border-sky-500 text-sky-400"
									: "bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800"
							}`}
						>
							{emotion.dictCode}
						</button>
					))}
				</div>
			</div>

			{/* 拍号选择 */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-300">选择拍号</label>
				<div className="flex flex-wrap gap-2">
					{chords.map((chord) => (
						<button
							key={chord.dictId}
							onClick={() => handleToggleTag(chord.dictCode, "chord")}
							className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
								selectedTags.some((tag) => tag.value === chord.dictCode)
									? "bg-sky-900/30 border-sky-500 text-sky-400"
									: "bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800"
							}`}
						>
							{chord.dictCode}
						</button>
					))}
				</div>
			</div>

			{/* 音调选择 */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-300">选择音调</label>
				<div className="flex flex-wrap gap-2">
					{tones.map((tone) => (
						<button
							key={tone.dictId}
							onClick={() => handleToggleTag(tone.dictCode, "tone")}
							className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
								selectedTags.some((tag) => tag.value === tone.dictCode)
									? "bg-sky-900/30 border-sky-500 text-sky-400"
									: "bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800"
							}`}
						>
							{tone.dictCode}
						</button>
					))}
				</div>
			</div>

			{/* 人声选择 */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-300">选择人声</label>
				<div className="flex flex-wrap gap-2">
					{genders.map((gender) => (
						<button
							key={gender.dictId}
							onClick={() => handleToggleTag(gender.dictCode, "gender")}
							className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
								selectedTags.some((tag) => tag.value === gender.dictCode)
									? "bg-sky-900/30 border-sky-500 text-sky-400"
									: "bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800"
							}`}
						>
							{gender.dictCode}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
