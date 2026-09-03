import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Mic2, Music } from "lucide-react"
import { setCategory } from "../../../../store/index.js"

/**
 * 分类切换组件（歌曲/纯音乐）
 */
export default function CategoryToggle() {
	const dispatch = useDispatch()
	const category = useSelector((state) => state.musicGen.category)

	const handleCategoryChange = (value) => dispatch(setCategory(value))

	return (
		<div className="bg-slate-800 p-1 rounded-lg flex">
			<button
				onClick={() => handleCategoryChange("song")}
				className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
					category === "song"
						? "bg-slate-700 shadow text-sky-400"
						: "text-slate-400 hover:text-slate-200"
				}`}
			>
				<Mic2 size={16} /> 歌曲模式
			</button>
			<button
				onClick={() => handleCategoryChange("instrumental")}
				className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
					category === "instrumental"
						? "bg-slate-700 shadow text-sky-400"
						: "text-slate-400 hover:text-slate-200"
				}`}
			>
				<Music size={16} /> 纯音乐
			</button>
		</div>
	)
}
