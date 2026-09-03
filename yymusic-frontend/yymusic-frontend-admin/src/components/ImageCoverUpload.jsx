import React, { useState, useRef } from "react"
import { Image as ImageIcon } from "lucide-react"
import { getResourceUrl } from "../utils/Api"
import ImageCropModal from "./ImageCropModal" // 引用新组件

const ImageCoverUpload = ({ modelValue, onUpdate, width = 200, scale = 1 }) => {
	// 状态管理
	const [selectedFile, setSelectedFile] = useState(null)
	const fileInputRef = useRef(null)

	// 计算预览容器的高度
	const height = width * scale

	// 处理显示图片源
	let imgSrc = null
	if (modelValue) {
		if (typeof modelValue === "string") {
			imgSrc = getResourceUrl(modelValue)
		} else if (modelValue instanceof File) {
			imgSrc = URL.createObjectURL(modelValue)
		}
	}

	// 1. 点击上传区域 -> 触发文件选择
	const handleTriggerSelect = () => {
		fileInputRef.current.click()
	}

	// 2. 文件选择后 -> 打开裁剪弹窗
	const handleFileChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			setSelectedFile(file)
			// 重置 input 以便能重复选择同一文件
			e.target.value = ""
		}
	}

	// 3. 裁剪完成 -> 更新父组件 -> 关闭弹窗
	const handleCropConfirm = (croppedFile) => {
		// 这里处理裁剪后的图片文件
		console.log("裁剪后的图片:", croppedFile)
		onUpdate(croppedFile)
		// 关闭裁剪弹窗
		setSelectedFile(null)
	}

	// 4. 关闭弹窗
	const handleClose = () => {
		setSelectedFile(null)
	}

	return (
		<div className="relative group select-none">
			{/* 隐藏的文件输入框 */}
			<input
				type="file"
				accept="image/*"
				className="hidden"
				ref={fileInputRef}
				onChange={handleFileChange}
			/>

			{/* 图片展示区域 */}
			<div
				className="bg-gray-100 border border-gray-200 rounded overflow-hidden flex items-center justify-center relative"
				style={{ width: `${width}px`, height: `${height}px` }}
			>
				{imgSrc ? (
					<img src={imgSrc} alt="Cover" className="w-full h-full object-scale-down" />
				) : (
					<ImageIcon className="text-gray-300" size={32} />
				)}

				{/* 遮罩层 - 点击上传 */}
				<div
					onClick={handleTriggerSelect}
					className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-center py-1 text-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
				>
					{modelValue ? "重新上传" : "上传"}
				</div>
			</div>

			{/* 新的裁剪弹窗 - 只有当 selectedFile 存在时才渲染/打开 */}
			<ImageCropModal
				isOpen={!!selectedFile}
				imageFile={selectedFile}
				onClose={handleClose}
				onConfirm={handleCropConfirm}
			/>
		</div>
	)
}

export default ImageCoverUpload
