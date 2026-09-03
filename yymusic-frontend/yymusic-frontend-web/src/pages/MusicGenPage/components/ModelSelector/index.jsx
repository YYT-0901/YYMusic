import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { setModel, setModelUseIntegral } from "../../../../store/index.js"

/**
 * 模型选择组件
 */
export default function ModelSelector() {
	const dispatch = useDispatch()
	const { model, category, sysDict } = useSelector((state) => state.musicGen)

	const handleModelChange = (value) => {
		dispatch(setModel(value.dictCode))
		dispatch(setModelUseIntegral(value.dictValue))
	}

	// 根据分类选择模型列表
	const modelList = sysDict
		? category === "instrumental"
			? sysDict.music_model_pure || []
			: sysDict.music_model || []
		: []

	const displayModels = modelList.length > 0 ? modelList : []

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium text-slate-300">选择模型</label>
			<div className="grid grid-cols-2 gap-3">
				{displayModels.map((modelItem, index) => (
					<label
						key={index}
						className={`cursor-pointer relative flex flex-col items-center p-3 border rounded-xl transition-all ${
							model === modelItem.dictCode
								? "border-sky-500 bg-sky-900/20 ring-1 ring-sky-500"
								: "border-slate-700 hover:border-slate-600 bg-slate-950"
						}`}
					>
						<input
							type="radio"
							name="model"
							value={modelItem.dictCode}
							checked={model === modelItem.dictCode}
							onChange={() => handleModelChange(modelItem)}
							className="hidden"
						/>
						<span className="font-bold text-slate-200">Model {modelItem.dictCode}</span>
						<span className="text-xs text-yellow-500 mt-1 font-bold">
							{modelItem.dictValue || ""} 积分
						</span>
						<span className="text-xs text-slate-500 mt-1">
							{modelItem.dictDesc || ""}
						</span>
						{modelItem.isHot && (
							<span className="absolute -top-2 -right-2 bg-fuchsia-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg">
								HOT
							</span>
						)}
					</label>
				))}
			</div>
		</div>
	)
}
