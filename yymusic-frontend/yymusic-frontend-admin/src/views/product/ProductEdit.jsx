import React, { useState, useEffect, useRef } from "react"
import Dialog from "../../components/Dialog"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import Verify from "../../utils/Verify"
import ImageCoverUpload from "../../components/ImageCoverUpload"
import toast from "react-hot-toast"

const ProductEdit = ({ show, data, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		cover: "",
		productName: "",
		price: "",
		integral: "",
		onsaleType: 1,
		productDescription: "",
	})

	useEffect(() => {
		if (show) {
			if (data) {
				setFormData({ ...data })
			} else {
				setFormData({
					cover: "",
					productName: "",
					price: "",
					integral: "",
					onsaleType: 1,
					productDescription: "",
				})
			}
		}
	}, [show, data])

	const handleSubmit = async () => {
		// 表单校验
		if (!formData.cover) return toast.error("请选择封面")
		if (!formData.productName) return toast.error("请输入商品名称")
		if (!formData.price) return toast.error("请输入价格")
		if (!Verify.regs.floatNumber.test(formData.price)) return toast.error("请输入正确的价格")
		if (!formData.integral) return toast.error("请输入积分")
		if (!Verify.regs.number.test(formData.integral)) return toast.error("请输入正确的积分")
		if (!formData.productDescription) return toast.error("请输入商品描述")

		const params = { ...formData }

		// 如果 cover 是 File 对象，则转为 coverFile 字段上传
		if (params.cover instanceof File) {
			params.coverFile = params.cover
			delete params.cover
		}

		const result = await Request({
			url: Api.saveProduct,
			params,
		})

		if (result) {
			toast.success("保存成功")
			onSuccess()
		}
	}

	return (
		<Dialog
			show={show}
			title={data ? "编辑商品" : "新增商品"}
			width="500px"
			buttons={[{ text: "确定", click: handleSubmit }]}
			onClose={onClose}
		>
			<div className="space-y-4 py-2">
				{/* 封面 */}
				<div className="flex gap-4">
					<label className="w-20 text-right text-sm font-medium text-gray-700 pt-2 required-label">
						封面
					</label>
					<div className="flex-1">
						<ImageCoverUpload
							modelValue={formData.cover}
							width={300}
							scale={0.6}
							onUpdate={(file) => setFormData({ ...formData, cover: file })}
						/>
					</div>
				</div>

				{/* 商品名称 */}
				<div className="flex gap-4 items-center">
					<label className="w-20 text-right text-sm font-medium text-gray-700 required-label">
						商品名称
					</label>
					<div className="flex-1">
						<input
							type="text"
							className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500"
							placeholder="请输入商品名称"
							value={formData.productName}
							onChange={(e) =>
								setFormData({ ...formData, productName: e.target.value })
							}
						/>
					</div>
				</div>

				{/* 价格 */}
				<div className="flex gap-4 items-center">
					<label className="w-20 text-right text-sm font-medium text-gray-700 required-label">
						价格
					</label>
					<div className="flex-1 relative">
						<input
							type="text"
							className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500 pr-8"
							placeholder="请输入价格"
							value={formData.price}
							onChange={(e) => setFormData({ ...formData, price: e.target.value })}
						/>
						<span className="absolute right-3 top-2 text-gray-500 text-sm">元</span>
					</div>
				</div>

				{/* 积分 */}
				<div className="flex gap-4 items-center">
					<label className="w-20 text-right text-sm font-medium text-gray-700 required-label">
						积分
					</label>
					<div className="flex-1">
						<input
							type="text"
							className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500"
							placeholder="请输入积分"
							value={formData.integral}
							onChange={(e) => setFormData({ ...formData, integral: e.target.value })}
						/>
					</div>
				</div>

				{/* 上架状态 */}
				<div className="flex gap-4 items-center">
					<label className="w-20 text-right text-sm font-medium text-gray-700">
						上架
					</label>
					<div className="flex-1">
						<label className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								className="sr-only peer"
								checked={formData.onsaleType === 1}
								onChange={(e) =>
									setFormData({
										...formData,
										onsaleType: e.target.checked ? 1 : 0,
									})
								}
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>
				</div>

				{/* 商品描述 */}
				<div className="flex gap-4">
					<label className="w-20 text-right text-sm font-medium text-gray-700 pt-2 required-label">
						商品描述
					</label>
					<div className="flex-1">
						<textarea
							className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500 h-24 resize-none"
							placeholder="请输入商品描述"
							value={formData.productDescription}
							onChange={(e) =>
								setFormData({ ...formData, productDescription: e.target.value })
							}
						/>
					</div>
				</div>
			</div>
		</Dialog>
	)
}

export default ProductEdit
