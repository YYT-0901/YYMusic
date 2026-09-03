import React, { useState, useEffect } from "react"
import { Copy, Check, X } from "lucide-react"
import Dialog from "../../components/Dialog"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import Verify from "../../utils/Verify"
import Cover from "../../components/Cover"
import toast from "react-hot-toast"

const PayCodeEdit = ({ show, onClose, onReload }) => {
	const [formData, setFormData] = useState({ amount: "" })
	const [payCode, setPayCode] = useState(null) // 存储生成的付款码
	const [createType, setCreateType] = useState("product") // manual: 手动输入金额, product: 选择商品
	const [productList, setProductList] = useState([]) // 商品列表
	const [selectedProduct, setSelectedProduct] = useState(null) // 选中的商品

	// 每次打开弹窗重置状态
	useEffect(() => {
		if (show) {
			setFormData({ amount: "" })
			setPayCode(null)
			setCreateType("product")
			setSelectedProduct(null)
			loadProductList()
		}
	}, [show])

	// 加载商品列表
	const loadProductList = async () => {
		const result = await Request({ url: Api.loadProduct })
		if (result) setProductList(result.data)
	}

	const handleSubmit = async () => {
		// 根据创建类型进行不同的校验
		if (createType === "manual") {
			// 手动输入金额校验
			if (!formData.amount) {
				toast.error("请输入付款码金额")
				return
			}
			if (!Verify.regs.floatNumber.test(formData.amount)) {
				toast.error("请输入正确的金额")
				return
			}

			const result = await Request({
				url: Api.createCode,
				params: { amount: formData.amount },
			})

			if (result) {
				setPayCode(result.data)
				if (onReload) onReload()
			}
		} else {
			// 选择商品校验
			if (!selectedProduct) {
				toast.error("请选择商品")
				return
			}

			const result = await Request({
				url: Api.createCodeWithProductId,
				params: { productId: selectedProduct.productId },
			})

			if (result) {
				setPayCode(result.data)
				if (onReload) onReload()
			}
		}
	}

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(payCode)
			toast.success("复制成功")
		} catch (err) {
			toast.error("复制失败，请手动复制")
		}
	}

	// 根据当前状态决定按钮配置
	const buttons = payCode
		? [{ text: "关闭", click: onClose }] // 生成成功后只显示关闭
		: [{ text: "确定", click: handleSubmit }] // 初始显示确定

	return (
		<Dialog
			show={show}
			title="新建付款码"
			width="500px"
			buttons={buttons}
			onClose={onClose}
			showCancel={!payCode} // 生成成功后不显示取消按钮
		>
			<div className="py-4">
				{!payCode ? (
					<>
						{/* 创建类型选择 */}
						<div className="flex items-center gap-4 mb-4">
							<label className="w-24 text-right text-sm font-medium text-gray-700">
								创建方式
							</label>
							<div className="flex items-center gap-6">
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										<input
											type="radio"
											id="product"
											value="product"
											checked={createType === "product"}
											onChange={(e) => setCreateType(e.target.value)}
											className="text-blue-600"
										/>
										<label htmlFor="product" className="text-sm text-gray-700">
											选择商品
										</label>
									</div>
									<input
										type="radio"
										id="manual"
										value="manual"
										checked={createType === "manual"}
										onChange={(e) => setCreateType(e.target.value)}
										className="text-blue-600"
									/>
									<label htmlFor="manual" className="text-sm text-gray-700">
										手动输入金额
									</label>
								</div>
							</div>
						</div>

						{/* 根据创建类型显示不同的表单 */}
						{createType === "manual" ? (
							// 输入金额阶段
							<div className="flex items-center gap-4">
								<label className="w-24 text-right text-sm font-medium text-gray-700">
									金额
								</label>
								<div className="flex-1">
									<input
										type="text"
										className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
										placeholder="请输入付款码金额"
										value={formData.amount}
										onChange={(e) =>
											setFormData({ ...formData, amount: e.target.value })
										}
									/>
								</div>
							</div>
						) : (
							// 选择商品阶段
							<div className="flex flex-col gap-4">
								<label className="text-sm font-medium text-gray-700">
									选择商品
								</label>
								<div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
									{productList.map((product) => (
										<div
											key={product.productId}
											className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
												selectedProduct?.productId === product.productId
													? "border-blue-500 shadow-md"
													: "border-gray-200 hover:border-gray-300"
											}`}
											onClick={() => setSelectedProduct(product)}
										>
											<div className="h-32">
												<Cover cover={product.cover} borderRadius="0" />
											</div>
											<div className="p-2">
												<h4 className="text-sm font-medium truncate">
													{product.productName}
												</h4>
												<p className="text-xs text-gray-500 mt-1">
													价格: ¥{product.price}
												</p>
												<p className="text-xs text-gray-500">
													积分: {product.integral}
												</p>
											</div>
										</div>
									))}
								</div>
								{selectedProduct && (
									<div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
										<p className="font-medium">已选择商品:</p>
										<p className="mt-1">{selectedProduct.productName}</p>
										<p>
											价格: ¥{selectedProduct.price} | 积分:{" "}
											{selectedProduct.integral}
										</p>
									</div>
								)}
							</div>
						)}
					</>
				) : (
					// 显示结果阶段
					<div className="flex flex-col items-center gap-4 py-2">
						<div className="text-sm text-gray-500">付款码已生成</div>
						<div className="flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200 w-full justify-between">
							<span className="font-mono text-lg font-bold text-blue-600 truncate select-all">
								{payCode}
							</span>
							<button
								onClick={handleCopy}
								className="flex items-center gap-1 text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-200 transition"
							>
								<Copy size={14} /> 复制
							</button>
						</div>
					</div>
				)}
			</div>
		</Dialog>
	)
}

export default PayCodeEdit
