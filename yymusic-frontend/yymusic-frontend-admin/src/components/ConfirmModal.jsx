import React from "react"
import { X } from "lucide-react"
import PropTypes from "prop-types"

/**
 * ConfirmModal 确认弹窗组件
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示弹窗
 * @param {function} props.onClose - 关闭弹窗回调
 * @param {function} props.onConfirm - 确认回调
 * @param {string} props.title - 弹窗标题
 * @param {string} props.message - 弹窗消息
 * @param {string} props.confirmText - 确认按钮文本
 * @param {string} props.cancelText - 取消按钮文本
 */
export default function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title = "确认操作",
	message = "确定要执行此操作吗？",
	confirmText = "确定",
	cancelText = "取消",
}) {
	if (!isOpen) return null

	// 点击外部关闭
	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	return (
		<div
			className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
			onClick={handleOverlayClick}
		>
			<div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-700 relative">
				{/* 关闭按钮 */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
				>
					<X size={24} />
				</button>

				{/* 标题 */}
				<h2 className="text-2xl font-bold text-white mb-4">{title}</h2>

				{/* 消息内容 */}
				<p className="text-slate-300 mb-8">{message}</p>

				{/* 按钮组 */}
				<div className="flex gap-4 justify-end">
					<button
						onClick={onClose}
						className="px-6 py-3 bg-slate-900/50 border border-slate-700 rounded-xl font-medium text-white hover:bg-slate-900 transition-all"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all active:scale-95"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	)
}

ConfirmModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	title: PropTypes.string,
	message: PropTypes.string,
	confirmText: PropTypes.string,
	cancelText: PropTypes.string,
}
