import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"

/**
 * MessageModal 消息弹窗组件
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示弹窗
 * @param {function} props.onClose - 关闭弹窗回调
 * @param {string} props.type - 消息类型：success, error, warning, info
 * @param {string} props.message - 消息内容
 * @param {number} props.duration - 自动关闭时间（毫秒），0表示不自动关闭
 */
export default function MessageModal({ isOpen, onClose, type = "info", message, duration = 3000 }) {
	// 根据消息类型获取对应的样式和图标
	const getTypeConfig = () => {
		switch (type) {
			case "success":
				return {
				bgColor: "bg-green-900/20 backdrop-blur-sm",
				borderColor: "border-green-500/30",
				textColor: "text-green-400",
				icon: (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				),
			}
			case "error":
				return {
				bgColor: "bg-red-900/20 backdrop-blur-sm",
				borderColor: "border-red-500/30",
				textColor: "text-red-400",
				icon: (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
				),
			}
			case "warning":
				return {
				bgColor: "bg-yellow-900/20 backdrop-blur-sm",
				borderColor: "border-yellow-500/30",
				textColor: "text-yellow-400",
				icon: (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
				),
			}
			case "info":
			default:
				return {
				bgColor: "bg-system-primary-dark/20 backdrop-blur-sm",
borderColor: "border-system-primary/30",
textColor: "text-system-primary-lighter",
				icon: (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clipRule="evenodd"
						/>
					</svg>
				),
			}
		}
	}

	const typeConfig = getTypeConfig()

	// 自动关闭计时器
	useEffect(() => {
		if (isOpen && duration > 0) {
			const timer = setTimeout(() => {
				onClose()
			}, duration)

			return () => clearTimeout(timer)
		}
	}, [isOpen, duration, onClose])

	if (!isOpen) return null

	return (
		<div className="fixed top-8  right-8 z-50">
			<div
			className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border ${typeConfig.bgColor} ${typeConfig.borderColor} ${typeConfig.textColor} animate-slide-in`}
		>
				{/* 消息图标 */}
				<div className="flex-shrink-0">{typeConfig.icon}</div>
				{/* 消息内容 */}
				<div className="text-sm font-medium">{message}</div>
				{/* 关闭按钮 */}
				{duration === 0 && (
					<button
					onClick={onClose}
					className="ml-auto text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
					aria-label="关闭"
				>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
				)}
			</div>
		</div>
	)
}

MessageModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	type: PropTypes.oneOf(["success", "error", "warning", "info"]),
	message: PropTypes.string.isRequired,
	duration: PropTypes.number,
}
