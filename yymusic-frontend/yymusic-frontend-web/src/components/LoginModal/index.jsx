import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import PropTypes from "prop-types"
import md5 from "md5"
import { getCheckCode, login } from "@/services/account"
import { setUserInfo, hideLoginModal } from "@/store"

/**
 * LoginModal 登录弹窗组件
 * @param {Object} props
 * @param {function} props.onSuccess - 登录成功回调
 */
export default function LoginModal({ onSuccess }) {
	const dispatch = useDispatch()
	const { isLoginModalOpen } = useSelector((state) => state.user)
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		checkCodeKey: "",
		checkCode: "",
	})
	const [captchaUrl, setCaptchaUrl] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	// 获取验证码
	const loadCaptcha = async () => {
		try {
			const { checkCodeKey, checkCode } = await getCheckCode()
			setFormData((prev) => ({ ...prev, checkCodeKey }))
			setCaptchaUrl(checkCode)
		} catch (err) {
			setError("获取验证码失败，请重试")
		}
	}

	// 组件打开时获取验证码
	useEffect(() => {
		if (isLoginModalOpen) {
			loadCaptcha()
		}
	}, [isLoginModalOpen])

	// 输入框变化处理
	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
		setError("")
	}

	// 提交登录
	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError("")

		try {
			const result = await login({
				checkCodeKey: formData.checkCodeKey,
				checkCode: formData.checkCode,
				email: formData.email,
				password: md5(formData.password),
			})

			// 保存用户信息到 localStorage
			if (result.token) {
				localStorage.setItem("token", result.token)

				// 保存信息到 store
				dispatch(setUserInfo(result))
				// 刷新页面, 并且不带任何参数
				navigate("/home", { replace: true })
			}

			if (onSuccess && typeof onSuccess === "function") {
				onSuccess(result)
			}
			dispatch(hideLoginModal())
		} catch (err) {
			setError(err.message || "登录失败，请检查输入")
			// 刷新验证码
			loadCaptcha()
			setFormData((prev) => ({ ...prev, checkCode: "" }))
		} finally {
			setLoading(false)
		}
	}

	// 点击外部关闭
	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) {
			dispatch(hideLoginModal())
		}
	}

	// 跳转到注册页面
	const handleGoToRegister = () => {
		dispatch(hideLoginModal())
		navigate("/register")
	}

	if (!isLoginModalOpen) return null

	return (
		<div
			className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50 transition-all duration-300"
			onClick={handleOverlayClick}
		>
			<div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-700/50 relative transform transition-all duration-300 hover:shadow-system-primary/10">
				{/* 关闭按钮 */}
				<button
					onClick={() => dispatch(hideLoginModal())}
					className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
				>
					<X size={24} />
				</button>

				{/* 标题 */}
				<h2 className="text-2xl font-bold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-6">
					欢迎回来
				</h2>

				{/* 错误提示 */}
				{error && (
					<div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						{error}
					</div>
				)}

				{/* 登录表单 */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* 邮箱 */}
					<div className="space-y-2">
						<label className="block text-sm text-slate-300 font-medium">邮箱</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="请输入邮箱"
							required
							className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-system-primary/50 focus:ring-1 focus:ring-system-primary/30 transition-all duration-300"
						/>
					</div>

					{/* 密码 */}
					<div className="space-y-2">
						<label className="block text-sm text-slate-300 font-medium">密码</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="请输入密码"
							required
							minLength={8}
							maxLength={18}
							className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-system-primary/50 focus:ring-1 focus:ring-system-primary/30 transition-all duration-300"
						/>
					</div>

					{/* 验证码 */}
					<div className="space-y-2">
						<label className="block text-sm text-slate-300 font-medium">验证码</label>
						<div className="flex gap-3">
							<input
								type="text"
								name="checkCode"
								value={formData.checkCode}
								onChange={handleChange}
								placeholder="请输入验证码"
								required
								maxLength={4}
								className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-system-primary/50 focus:ring-1 focus:ring-system-primary/30 transition-all duration-300"
							/>
							{captchaUrl && (
								<img
									src={captchaUrl}
									alt="验证码"
									className="w-28 h-14 rounded-xl cursor-pointer border border-slate-700/50 hover:border-system-primary/50 transition-all duration-300 shadow-sm"
									onClick={loadCaptcha}
									title="点击刷新验证码"
								/>
							)}
						</div>
					</div>

					{/* 登录按钮 */}
					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 bg-gradient-to-r from-system-primary to-system-secondary rounded-xl font-medium text-white hover:shadow-lg hover:shadow-system-primary/20 hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
					>
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								登录中...
							</span>
						) : (
							<span className="flex items-center justify-center gap-2">
								<span className="w-4 h-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
										<polyline points="22 4 12 14.01 9 11.01" />
									</svg>
								</span>
								登录
							</span>
						)}
					</button>
				</form>

				{/* 注册链接 */}
				<p className="text-sm text-slate-400 mt-6 text-center">
					还没有账号？
					<button
						onClick={handleGoToRegister}
						className="text-system-primary-lighter hover:text-system-primary-light font-medium ml-1 transition-all duration-300 hover:underline"
					>
						立即注册
					</button>
				</p>

				{/* 提示信息 */}
				<p className="text-xs text-slate-500 mt-4 text-center">
					登录即表示您同意我们的服务条款
				</p>
			</div>
		</div>
	)
}

LoginModal.propTypes = {
	onSuccess: PropTypes.func,
}
