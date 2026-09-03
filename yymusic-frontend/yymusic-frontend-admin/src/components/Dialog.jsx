import { X } from "lucide-react"
import React from "react"

const Dialog = ({
	show,
	title,
	width = "500px",
	children,
	buttons,
	showCancel = true,
	onClose,
}) => {
	if (!show) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div
				className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
				style={{ width }}
			>
				{/* Header */}
				<div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
					<h3 className="text-lg font-medium text-gray-800">{title}</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600">
						<X size={20} />
					</button>
				</div>

				{/* Body */}
				<div className="p-5 overflow-y-auto flex-1">{children}</div>

				{/* Footer */}
				{((buttons && buttons.length > 0) || showCancel) && (
					<div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
						{showCancel && (
							<button
								onClick={onClose}
								className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
							>
								取消
							</button>
						)}
						{buttons?.map((btn, index) => (
							<button
								key={index}
								onClick={btn.click}
								className={`px-4 py-2 text-sm text-white rounded transition-colors ${
									btn.type === "danger"
										? "bg-red-500 hover:bg-red-600"
										: "bg-blue-600 hover:bg-blue-700"
								}`}
							>
								{btn.text}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default Dialog
