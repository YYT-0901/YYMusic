import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Settings2 } from "lucide-react"
import { setMode } from "../../../../store/index.js"

/**
 * 创作模式切换组件（简单/高级）
 */
export default function ModeToggle() {
	const dispatch = useDispatch()
	const mode = useSelector((state) => state.musicGen.mode)

	const handleModeChange = (value) => dispatch(setMode(value))

	return (
		<div className="flex items-center justify-between">
			<span className="text-sm font-bold text-slate-300 flex items-center gap-1">
				<Settings2 size={16} /> 创作模式
			</span>
			<div className="flex bg-slate-800 rounded-lg p-1">
				<button
					onClick={() => handleModeChange("simple")}
					className={`px-4 py-1 rounded text-xs font-medium transition-all ${
						mode === "simple" ? "bg-slate-700 shadow text-sky-400" : "text-slate-400"
					}`}
				>
					简单
				</button>
				<button
					onClick={() => handleModeChange("advanced")}
					className={`px-4 py-1 rounded text-xs font-medium transition-all ${
						mode === "advanced" ? "bg-slate-700 shadow text-sky-400" : "text-slate-400"
					}`}
				>
					高级
				</button>
			</div>
		</div>
	)
}
