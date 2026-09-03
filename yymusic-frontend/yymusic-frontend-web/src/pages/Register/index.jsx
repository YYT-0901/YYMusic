import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Mail, Lock, User, Image, ArrowLeft, Music } from "lucide-react"
import PropTypes from "prop-types"
import md5 from "md5"
import { getCheckCode, register } from "@/services/account"
import { setUserInfo } from "@/store"

/**
 * 注册页面组件
 */
export default function Register() {
	const [searchParams] = useSearchParams()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		nickName: "",
		checkCodeKey: "",
		checkCode: "",
	})
	const [checkCodeUrl, setCheckCodeUrl] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState(false)

	// 页面加载时获取验证码
	useEffect(() => {
		handleGetCheckCode()
	}, [])

	// 获取验证码
	const handleGetCheckCode = async () => {
		try {
			const result = await getCheckCode()
			setFormData((prev) => ({ ...prev, checkCodeKey: result.checkCodeKey }))
			setCheckCodeUrl(result.checkCode)
		} catch (err) {
			setError("获取验证码失败，请重试")
		}
	}

	// 输入框变化处理
	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
		setError("")
	}

	// 表单验证
	const validateForm = () => {
		if (!formData.email) {
			setError("请输入邮箱地址")
			return false
		}
		if (!formData.password) {
			setError("请输入密码")
			return false
		}
		if (formData.password.length < 8 || formData.password.length > 18) {
			setError("密码长度必须为8-18位")
			return false
		}
		if (formData.password !== formData.confirmPassword) {
			setError("两次输入的密码不一致")
			return false
		}
		if (!formData.nickName) {
			setError("请输入昵称")
			return false
		}
		if (formData.nickName.length > 20) {
			setError("昵称长度不能超过20个字符")
			return false
		}
		if (!formData.checkCode) {
			setError("请输入验证码")
			return false
		}
		return true
	}

	// 提交注册
	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")

		if (!validateForm()) {
			return
		}

		setLoading(true)

		try {
			await register({
				email: formData.email,
				// 密码使用 md5 加密
				password: md5(formData.password),
				nickName: formData.nickName,
				checkCodeKey: formData.checkCodeKey,
				checkCode: formData.checkCode,
			})

			setSuccess(true)
			// 1.5秒后跳转到首页
			setTimeout(() => {
				navigate("/home?loginShow=true")
			}, 1500)
		} catch (err) {
			setError(err.message || "注册失败，请检查输入信息")
			// 重新获取验证码
			handleGetCheckCode()
			setFormData((prev) => ({ ...prev, checkCode: "" }))
		} finally {
			setLoading(false)
		}
	}

	// 返回登录
	const handleGoBack = () => {
		navigate(-1)
	}

	// 成功页面
	if (success) {
		return (
			<div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center p-4">
				<div className="bg-gradient-to-br from-system-primary/60 to-system-secondary/60 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-system-primary/50 shadow-2xl shadow-system-primary/20">
					<div className="text-center">
						<div className="w-16 h-16 bg-gradient-to-br from-system-primary/60 to-system-secondary/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-system-primary/30">
							<Music className="w-8 h-8 text-system-primary-lighter" />
						</div>
						<h2 className="text-2xl font-bold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-2">
							注册成功！
						</h2>
						<p className="text-system-primary-lighter mb-4">
							正在自动登录，即将跳转到首页...
						</p>
						<div className="w-full bg-system-primary/30 h-1 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-system-primary to-system-secondary animate-pulse"
								style={{ width: "100%" }}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* 返回按钮 */}
				<button
					onClick={handleGoBack}
					className="flex items-center gap-2 text-system-primary-lighter hover:text-white mb-6 transition-colors"
				>
					<ArrowLeft className="w-5 h-5 text-system-primary-lighter" />
					<span>返回</span>
				</button>

				{/* Logo */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-system-primary to-system-secondary rounded-2xl mb-4 shadow-lg shadow-system-primary/30 border border-system-primary/50">
						<Music className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-2">
						yy音乐
					</h1>
					<p className="text-system-primary-lighter">创建你的音乐账号</p>
				</div>

				{/* 注册表单 */}
				<div className="bg-gradient-to-br from-system-primary/60 to-system-secondary/60 backdrop-blur-xl rounded-2xl p-8 border border-system-primary/50 shadow-2xl shadow-system-primary/20">
					{error && (
						<div className="bg-gradient-to-r from-system-primary/60 to-system-secondary/60 border border-system-primary/50 text-system-primary-lighter px-4 py-3 rounded-xl mb-6 text-sm shadow-lg shadow-system-primary/10">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* 邮箱 */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								邮箱地址
							</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="请输入邮箱"
									className="w-full bg-system-primary/40 border border-system-primary/50 rounded-xl px-12 py-3 text-white placeholder-system-primary/50 focus:outline-none focus:border-system-primary focus:ring-1 focus:ring-system-primary transition-all"
								/>
							</div>
						</div>

						{/* 昵称 */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								昵称
							</label>
							<div className="relative">
								<User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
								<input
									type="text"
									name="nickName"
									value={formData.nickName}
									onChange={handleChange}
									placeholder="请输入昵称（最多20字符）"
									maxLength={20}
									className="w-full bg-system-primary/40 border border-system-primary/50 rounded-xl px-12 py-3 text-white placeholder-system-primary/50 focus:outline-none focus:border-system-primary focus:ring-1 focus:ring-system-primary transition-all"
								/>
							</div>
						</div>

						{/* 密码 */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								密码
							</label>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
								<input
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="请输入密码（8-18位）"
									maxLength={18}
									className="w-full bg-system-primary/40 border border-system-primary/50 rounded-xl px-12 py-3 text-white placeholder-system-primary/50 focus:outline-none focus:border-system-primary focus:ring-1 focus:ring-system-primary transition-all"
								/>
							</div>
						</div>

						{/* 确认密码 */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								确认密码
							</label>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
								<input
									type="password"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder="请再次输入密码"
									maxLength={18}
									className="w-full bg-system-primary/40 border border-system-primary/50 rounded-xl px-12 py-3 text-white placeholder-system-primary/50 focus:outline-none focus:border-system-primary focus:ring-1 focus:ring-system-primary transition-all"
								/>
							</div>
						</div>

						{/* 验证码 */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								验证码
							</label>
							<div className="flex gap-3">
								<div className="relative flex-1">
									<Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
									<input
										type="text"
										name="checkCode"
										value={formData.checkCode}
										onChange={handleChange}
										placeholder="请输入验证码"
										maxLength={4}
										className="w-full bg-system-primary/40 border border-system-primary/50 rounded-xl px-12 py-3 text-white placeholder-system-primary/50 focus:outline-none focus:border-system-primary focus:ring-1 focus:ring-system-primary transition-all"
									/>
								</div>
								<button
									type="button"
									onClick={handleGetCheckCode}
									className="flex-shrink-0 w-28 bg-system-primary/40 border border-system-primary/50 rounded-xl overflow-hidden hover:border-system-primary transition-colors"
								>
									{checkCodeUrl ? (
										<img
											src={checkCodeUrl}
											alt="验证码"
											className="w-full h-11 object-cover"
										/>
									) : (
										<div className="w-full h-11 flex items-center justify-center text-system-primary-lighter text-sm">
											加载中...
										</div>
									)}
								</button>
							</div>
						</div>

						{/* 注册按钮 */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-system-primary to-system-secondary text-white font-medium py-3 rounded-xl hover:from-system-primary-darker hover:to-system-secondary-darker focus:outline-none focus:ring-2 focus:ring-system-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-system-primary/30 border border-system-primary/50"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
											fill="none"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										/>
									</svg>
									注册中...
								</span>
							) : (
								"立即注册"
							)}
						</button>
					</form>

					{/* 登录链接 */}
					<p className="mt-6 text-center text-system-primary-lighter">
						已有账号？
						<button
							onClick={() => navigate("/?loginShow=true")}
							className="text-white hover:text-system-primary-lighter font-medium ml-1 bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent"
						>
							立即登录
						</button>
					</p>
				</div>
			</div>
		</div>
	)
}

Register.propTypes = {}
