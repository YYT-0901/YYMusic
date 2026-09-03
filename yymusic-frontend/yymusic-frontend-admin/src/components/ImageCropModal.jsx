import React, { useState, useCallback, useEffect } from "react"
import Cropper from "react-easy-crop"
import PropTypes from "prop-types"
import { X, Check, RotateCw, ZoomIn, Image as ImageIcon, Grid3X3 } from "lucide-react"
import getCroppedImg from "../utils/canvasUtils" // 路径根据实际情况调整

const ASPECT_RATIOS = [
	{ text: "自由", value: null }, // null 代表不限制比例
	{ text: "1:1", value: 1 / 1 },
	{ text: "4:3", value: 4 / 3 },
	{ text: "16:9", value: 16 / 9 },
]

const ImageCropModal = ({ isOpen, onClose, onConfirm, imageFile }) => {
	const [imageSrc, setImageSrc] = useState(null)
	const [crop, setCrop] = useState({ x: 0, y: 0 })
	const [zoom, setZoom] = useState(1)
	const [rotation, setRotation] = useState(0)
	const [aspect, setAspect] = useState(1) // 默认 1:1
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
	const [isProcessing, setIsProcessing] = useState(false)

	// 1. 当传入 imageFile 时，将其转换为 URL 预览
	useEffect(() => {
		if (imageFile) {
			const objectUrl = URL.createObjectURL(imageFile)
			setImageSrc(objectUrl)
			// 清理内存
			return () => URL.revokeObjectURL(objectUrl)
		}
	}, [imageFile])

	// 2. 裁剪区域变化回调
	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels)
	}, [])

	// 3. 确认裁剪
	const handleConfirm = async () => {
		if (!imageSrc || !croppedAreaPixels) return

		try {
			setIsProcessing(true)
			const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
			if (croppedImage) {
				// 将裁剪后的 Blob/File 传回父组件
				// 转换为 File 对象以保持兼容性
				const file = new File([croppedImage], "cover.jpg", { type: "image/jpeg" })
				onConfirm(file)
				onClose()
			}
		} catch (e) {
			console.error("裁剪失败", e)
		} finally {
			setIsProcessing(false)
		}
	}

	// 如果不显示，直接返回 null
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 transition-all duration-300">
			<div className="relative w-full h-full md:w-[800px] md:h-[600px] bg-zinc-900 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-800">
				{/* --- 顶部栏 --- */}
				<div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800 z-10">
					<h3 className="text-zinc-100 font-medium text-lg flex items-center gap-2">
						<ImageIcon className="w-5 h-5 text-blue-500" />
						图片裁剪
					</h3>
					<button
						onClick={onClose}
						className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
					>
						<X size={20} />
					</button>
				</div>

				{/* --- 裁剪区域 (核心) --- */}
				<div className="relative flex-1 w-full bg-black overflow-hidden">
					{imageSrc ? (
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							rotation={rotation}
							aspect={aspect}
							onCropChange={setCrop}
							onCropComplete={onCropComplete}
							onZoomChange={setZoom}
							onRotationChange={setRotation}
							objectFit="contain"
							// 样式覆盖，让裁剪框看起来更高级
							classes={{
								containerClassName: "bg-zinc-950",
								cropAreaClassName:
									"border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]",
							}}
						/>
					) : (
						<div className="flex items-center justify-center h-full text-zinc-500">
							加载图片中...
						</div>
					)}
				</div>

				{/* --- 控制面板 --- */}
				<div className="px-6 py-5 bg-zinc-900 border-t border-zinc-800 space-y-4 z-10">
					{/* 滑块控制区 */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* 缩放 */}
						<div className="flex items-center gap-3">
							<ZoomIn size={18} className="text-zinc-400" />
							<input
								type="range"
								value={zoom}
								min={1}
								max={3}
								step={0.1}
								aria-labelledby="Zoom"
								onChange={(e) => setZoom(Number(e.target.value))}
								className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
							/>
						</div>

						{/* 旋转 */}
						<div className="flex items-center gap-3">
							<RotateCw size={18} className="text-zinc-400" />
							<input
								type="range"
								value={rotation}
								min={0}
								max={360}
								step={1}
								aria-labelledby="Rotation"
								onChange={(e) => setRotation(Number(e.target.value))}
								className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
							/>
						</div>
					</div>

					{/* 比例选择与底部按钮 */}
					<div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
						{/* 比例按钮组 */}
						<div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
							<Grid3X3 size={18} className="text-zinc-500 mr-2 shrink-0" />
							{ASPECT_RATIOS.map((ratio) => (
								<button
									key={ratio.text}
									onClick={() => setAspect(ratio.value)}
									className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all shrink-0
                    ${
						aspect === ratio.value
							? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
							: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
					}`}
								>
									{ratio.text}
								</button>
							))}
						</div>

						{/* 操作按钮 */}
						<div className="flex gap-3 w-full md:w-auto">
							<button
								onClick={onClose}
								className="flex-1 md:flex-none px-6 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
							>
								取消
							</button>
							<button
								onClick={handleConfirm}
								disabled={isProcessing}
								className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isProcessing ? (
									"处理中..."
								) : (
									<>
										<Check size={16} />
										确认裁剪
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

ImageCropModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	imageFile: PropTypes.object,
}

export default ImageCropModal
