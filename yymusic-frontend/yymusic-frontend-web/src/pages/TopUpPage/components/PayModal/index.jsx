import React, { useState, useEffect, useRef } from "react"
import { X, Check, Smartphone, Wallet, QrCode, Loader2, HelpCircle } from "lucide-react"
import SimpleQRCode from "../SimpleQRCode"
import { buyByPayCode, getPayInfo, checkPayOrder, getHavePay } from "@/services/buy"
import { getCheckCode } from "../../../../services/account"
import { getResource } from "../../../../services/file"
import message from "../../../../utils/message"
import { setPolling } from "../../../../store"
import IntegralRecordModal from "@/components/IntegralRecordModal"
import WeixinQrcode from "/weixin.jpg"

// --- 工具函数 ---
const formatPrice = (price) => Number(price).toFixed(2)

// --- 组件: 支付弹窗 ---
const PayModal = ({ isOpen, onClose, product, onSuccess }) => {
	const [step, setStep] = useState(1) // 1: 确认, 2: 支付, 3: 成功
	const [payType, setPayType] = useState(1) // 1: 微信, 2: 支付宝, 0: 码

	// 支付码表单
	const [payCode, setPayCode] = useState("")
	const [checkCode, setCheckCode] = useState("")
	const [captchaUrl, setCaptchaUrl] = useState("")
	const [checkCodeKey, setCheckCodeKey] = useState("")

	// 支付信息
	const [payInfo, setPayInfo] = useState(null)
	const [loading, setLoading] = useState(false)

	// 积分记录弹窗状态
	const [integralModalOpen, setIntegralModalOpen] = useState(false)

	const timerRef = useRef(null)

	// 初始化验证码
	useEffect(() => {
		if (isOpen && payType === 0) {
			refreshCaptcha()
		}
	}, [isOpen, payType])

	// 关闭清理
	useEffect(() => {
		if (!isOpen) {
			clearInterval(timerRef.current)
			setStep(1)
			setPayInfo(null)
			setPayCode("")
			setCheckCode("")
			setCheckCodeKey("")
		}
	}, [isOpen])

	const refreshCaptcha = async () => {
		const res = await getCheckCode()
		// 根据request.js的响应拦截器，API返回的数据会被处理
		// 如果响应是 {code: 200, data: {checkCode: "..."}}，则res会是 {checkCode: "..."}
		// 如果响应是 {code: 200, checkCode: "..."}，则res直接包含checkCode
		setCaptchaUrl(res.checkCode)
		setCheckCodeKey(res.checkCodeKey)
	}

	// 提交订单 (Step 1 -> Step 2)
	const handleSubmitOrder = async () => {
		if (payType === 0) {
			// 支付码流程
			if (!payCode || !checkCode) return message.error("请填写完整信息")
			setLoading(true)
			try {
				await buyByPayCode({
					checkCodeKey,
					checkCode,
					productId: product.productId,
					payCode,
				})
				handleSuccess()
			} catch (error) {
				message.error(error.toString() || "兑换失败，请稍后重试")
			} finally {
				setLoading(false)
			}
		} else if (payType === 1) {
			// 微信支付
			setLoading(true)
			try {
				const res = await getPayInfo({
					productId: product.productId,
					payType,
				})
				// 根据request.js的响应拦截器，如果code===200，res会直接是data的值
				setPayInfo(res)
				setStep(2)
				// 开始轮询
				startPolling(res.orderId)
			} catch (error) {
				message.error(error.toString() || "获取支付信息失败，请稍后重试")
			} finally {
				setLoading(false)
			}
		} else if (payType === 2) {
			// 支付宝
			setLoading(true)
			try {
				const res = await getPayInfo({
					productId: product.productId,
					payType,
				})

				setPayInfo(res)
				const form = res.payUrl

				// 打开新窗口并注入表单
				const payWindow = window.open("", "_blank", "width=600,height=800")

				// 等待窗口加载完成
				setTimeout(() => {
					payWindow.document.open()
					payWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>支付宝支付</title>
                        <script>
                            // 传递 orderId 给父窗口
                            window.opener.postMessage({ 
                                type: 'paymentInitiated', 
                            }, '*');
                        </script>
                    </head>
                    <body>
                        ${form}
                    </body>
                    </html>
                `)
					payWindow.document.close()
				}, 100)

				// 监听支付窗口消息
				window.addEventListener("message", (event) => {
					if (event.data.type === "paymentCompleted") {
						// 处理支付完成逻辑
						setStep(3)
						payWindow.close()
					}
				})

				setStep(2) // 显示“已支付”确认页
				startPolling(res.orderId)
			} catch (error) {
				message.error(error.toString() || "获取支付信息失败，请稍后重试")
			} finally {
				setLoading(false)
			}
		}
	}

	// 轮询逻辑
	const startPolling = (orderId) => {
		if (timerRef.current) clearInterval(timerRef.current)
		timerRef.current = setInterval(async () => {
			try {
				const res = await checkPayOrder({ orderId })
				// 根据request.js的响应拦截器，如果code===200，res会直接是data的值
				if (res) {
					clearInterval(timerRef.current)
					handleSuccess(res)
				}
			} catch (error) {
				console.error("检查支付状态失败:", error)
			}
		}, 5000) // 5秒查一次
	}

	const handleSuccess = (data) => {
		setStep(3)
		if (onSuccess) onSuccess(data)
	}

	const handleManualCheck = async () => {
		// 手动点击"我已支付"
		if (payInfo?.orderId) {
			try {
				const res = await getHavePay({ orderId: payInfo.orderId })
				if (res.integral) {
					handleSuccess()
				} else {
					message.error("支付未完成，请继续支付或稍后重试")
				}
			} catch (error) {
				message.error(error.toString() || "检查支付状态失败，请稍后重试")
			}
		} else {
			// 支付宝情况，直接成功
			handleSuccess()
		}
	}

	if (!isOpen || !product) return null

	return (
		<>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
				<div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
					{/* Header */}
					<div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
						<h3 className="text-lg font-bold text-white">充值中心</h3>
						<button
							onClick={onClose}
							className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
						>
							<X size={20} />
						</button>
					</div>

					{/* Steps */}
					<div className="py-6 px-8 bg-slate-900">
						<div className="flex items-center justify-between relative">
							{/* Connecting Line */}
							<div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-700 -z-0"></div>
							<div
								className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-0 transition-all duration-500`}
								style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
							></div>

							{/* Step Dots */}
							{[1, 2, 3].map((s) => (
								<div
									key={s}
									className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${step >= s ? "bg-green-500 text-white scale-110" : "bg-slate-700 text-slate-400"}`}
								>
									{step > s ? <Check size={14} strokeWidth={4} /> : s}
									<span
										className={`absolute -bottom-6 text-[10px] w-16 text-center ${step >= s ? "text-green-400" : "text-slate-500"}`}
									>
										{s === 1 ? "确认订单" : s === 2 ? "支付" : "完成"}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Body Content */}
					<div className="p-6 flex-1 overflow-y-auto">
						{/* STEP 1: 确认订单 */}
						{step === 1 && (
							<div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
								{/* Product Info Box */}
								<div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex gap-4">
									<img
										src={product.cover ? getResource(product.cover) : ""}
										className="w-20 h-20 rounded-lg object-cover bg-slate-700"
										alt=""
									/>
									<div className="flex-1 min-w-0 flex flex-col justify-center">
										<h4 className="text-white font-bold text-lg truncate">
											{product.productName}
										</h4>
										<p className="text-slate-400 text-sm">
											充值积分:
											<span className="text-sky-400 font-bold pl-1">
												{product.integral}
											</span>
										</p>
										<p className="text-orange-400 text-xl font-bold mt-1">
											¥ {formatPrice(product.price)}
										</p>
									</div>
								</div>

								{/* Pay Method Selection */}
								<div className="space-y-3">
									<label className="text-sm font-medium text-slate-400">
										选择支付方式
									</label>
									<div className="grid grid-cols-1 gap-3">
										<label
											className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${payType === 1 ? "bg-green-900/20 border-green-500/50" : "bg-slate-800 border-slate-700 hover:border-slate-600"}`}
										>
											<input
												type="radio"
												name="payType"
												className="hidden"
												checked={payType === 1}
												onChange={() => setPayType(1)}
											/>
											<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white mr-3">
												<Smartphone size={18} />
											</div>
											<div className="flex-1">
												<div className="text-white font-medium">
													微信支付
												</div>
												<div className="text-xs text-slate-500">
													推荐使用，安全快捷
												</div>
											</div>
											{payType === 1 && (
												<div className="w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900"></div>
											)}
										</label>

										<label
											className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${payType === 2 ? "bg-system-primary/20 border-system-primary/50" : "bg-slate-800 border-slate-700 hover:border-slate-600"}`}
										>
											<input
												type="radio"
												name="payType"
												className="hidden"
												checked={payType === 2}
												onChange={() => setPayType(2)}
											/>
											<div className="w-8 h-8 bg-system-primary rounded-full flex items-center justify-center text-white mr-3">
												<Wallet size={18} />
											</div>
											<div className="flex-1">
												<div className="text-white font-medium">支付宝</div>
												<div className="text-xs text-slate-500">
													跳转网页支付
												</div>
											</div>
											{payType === 2 && (
												<div className="w-4 h-4 rounded-full bg-system-primary border-2 border-slate-900"></div>
											)}
										</label>

										<label
											className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${payType === 0 ? "bg-system-primary-dark/20 border-system-primary/50" : "bg-slate-800 border-slate-700 hover:border-slate-600"}`}
										>
											<input
												type="radio"
												name="payType"
												className="hidden"
												checked={payType === 0}
												onChange={() => setPayType(0)}
											/>
											<div className="w-8 h-8 bg-system-primary rounded-full flex items-center justify-center text-white mr-3">
												<QrCode size={18} />
											</div>
											<div className="flex-1">
												<div className="text-white font-medium flex items-center gap-2">
													支付码 / 兑换码
													<div className="relative group">
														<button className="p-1 text-slate-500 hover:text-white transition-colors">
															<HelpCircle size={16} />
														</button>
														{/* <!-- 悬停提示框 --> */}
														<div className="absolute left-6 bottom-[-50%] mt-2 w-60 bg-slate-600 border border-slate-700 rounded-lg p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
															<h4 className="text-white font-medium mb-3 text-center">
																如何获取支付码？
															</h4>
															<div className="flex flex-col items-center gap-4">
																{/* <!-- 微信二维码 --> */}
																<div className="w-40 h-40 bg-slate-700 rounded-lg flex items-center justify-center">
																	<img
																		src={WeixinQrcode}
																		className="w-full h-full object-cover"
																		alt=""
																	/>
																</div>
																{/* <!-- 步骤说明 --> */}
																<div className="space-y-2 text-left">
																	<div className="flex items-start gap-2">
																		<span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
																			1
																		</span>
																		<span className="text-slate-300 text-sm">
																			扫码加微信
																		</span>
																	</div>
																	<div className="flex items-start gap-2">
																		<span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
																			2
																		</span>
																		<span className="text-slate-300 text-sm">
																			沟通并转账
																		</span>
																	</div>
																	<div className="flex items-start gap-2">
																		<span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
																			3
																		</span>
																		<span className="text-slate-300 text-sm">
																			获得支付码
																		</span>
																	</div>
																	<div className="flex items-start gap-2">
																		<span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
																			4
																		</span>
																		<span className="text-slate-300 text-sm">
																			网页输入支付码和验证码点击立即兑换
																		</span>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
												<div className="text-xs text-slate-500">
													使用卡密兑换
												</div>
											</div>
											{payType === 0 && (
												<div className="w-4 h-4 rounded-full bg-system-primary border-2 border-slate-900"></div>
											)}
										</label>
									</div>
								</div>

								{/* Code Inputs */}
								{payType === 0 && (
									<div className="bg-slate-800/50 p-4 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
										<div>
											<input
												type="text"
												placeholder="请输入8位支付码"
												maxLength={8}
												value={payCode}
												onChange={(e) => setPayCode(e.target.value)}
												className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-system-primary transition-colors"
											/>
										</div>
										<div className="flex gap-2">
											<input
												type="text"
												placeholder="验证码"
												value={checkCode}
												onChange={(e) => setCheckCode(e.target.value)}
												className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-system-primary transition-colors"
											/>
											<img
												src={captchaUrl}
												onClick={refreshCaptcha}
												alt="captcha"
												className="h-10 w-24 rounded cursor-pointer border border-slate-600"
											/>
										</div>
									</div>
								)}

								<button
									onClick={handleSubmitOrder}
									disabled={loading}
									className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								>
									{loading && <Loader2 className="animate-spin" size={20} />}
									{payType === 0 ? "立即兑换" : "提交订单"}
								</button>
							</div>
						)}

						{/* STEP 2: 扫码支付 */}
						{step === 2 && (
							<div className="flex flex-col items-center justify-center py-4 space-y-6 animate-in slide-in-from-right-4 duration-300">
								<div className="text-center">
									<p className="text-slate-400 mb-1">应付金额</p>
									<p className="text-3xl font-bold text-orange-400">
										¥ {formatPrice(product.price)}
									</p>
								</div>
								{payType === 1 && (
									<div className="bg-white p-4 rounded-xl shadow-inner">
										{payInfo?.payUrl ? (
											<SimpleQRCode value={payInfo.payUrl} size={180} />
										) : (
											<div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-400">
												二维码加载中
											</div>
										)}
									</div>
								)}
								{payType === 2 && (
									<div className="w-[180px] h-[180px] bg-system-primary/20 rounded-xl flex items-center justify-center border border-system-primary/30">
										<div className="text-center p-4">
											<Loader2 className="w-10 h-10 text-system-primary animate-spin mx-auto mb-2" />
											<p className="text-system-primary-lighter text-sm">
												正在等待支付宝回调...
											</p>
										</div>
									</div>
								)}
								<div className="text-center space-y-4 w-full">
									<div className="flex items-center justify-center gap-2 text-sm text-slate-400">
										{payType === 1 && (
											<span className="flex items-center gap-1">
												<Smartphone size={16} /> 请使用微信扫一扫
											</span>
										)}
										{payType === 2 && (
											<span className="flex items-center gap-1">
												<Wallet size={16} /> 请在新页面完成支付
											</span>
										)}
									</div>

									<button
										onClick={() => handleManualCheck()}
										className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
									>
										我已支付
									</button>
								</div>
							</div>
						)}

						{/* STEP 3: 成功 */}
						{step === 3 && (
							<div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in duration-300">
								<div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
									<Check size={40} className="text-white" strokeWidth={3} />
								</div>
								<div className="text-center">
									<h3 className="text-2xl font-bold text-white mb-2">
										支付成功!
									</h3>
									<p className="text-slate-400">积分已充值到您的账户</p>
								</div>
								<button
									onClick={() => setIntegralModalOpen(true)}
									className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
								>
									查看订单
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 积分记录弹窗 */}
			<IntegralRecordModal
				isOpen={integralModalOpen}
				onClose={() => setIntegralModalOpen(false)}
			/>
		</>
	)
}

export default PayModal
