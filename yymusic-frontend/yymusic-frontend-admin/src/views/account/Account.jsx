import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import md5 from "js-md5"
import { User, Lock, CheckSquare } from "lucide-react"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import toast from "react-hot-toast"
// 引入背景图 (确保路径正确)
import bgImg from "../../assets/img/bg.webp"

const Account = () => {
	const navigate = useNavigate()
	const [formData, setFormData] = useState({ account: "", password: "", checkCode: "" })
	const [checkCodeInfo, setCheckCodeInfo] = useState({})

	const loadCheckCode = async () => {
		const result = await Request({ url: Api.checkCode, showLoading: false })
		if (result) {
			setCheckCodeInfo(result.data)
		}
	}

	useEffect(() => {
		loadCheckCode()
	}, [])

	const doSubmit = async (e) => {
		e.preventDefault()
		if (!formData.account || !formData.password || !formData.checkCode) {
			toast.error("请填写完整信息")
			return
		}

		const params = { ...formData, checkCodeKey: checkCodeInfo.checkCodeKey }
		params.password = md5(params.password)

		const result = await Request({
			url: Api.login,
			params,
			errorCallback: () => loadCheckCode(),
		})

		if (result) {
			localStorage.setItem("token", result.data.token)
			toast.success("登录成功")
			navigate("/dict/sysdict")
		}
	}

	return (
		<div
			className="min-h-screen flex items-center justify-center bg-cover bg-center"
			style={{ backgroundImage: `url(${bgImg})` }}
		>
			<div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-[400px]">
				<h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
					YYMusic后台系统登录
				</h2>
				<form onSubmit={doSubmit} className="space-y-4">
					<div className="relative">
						<User className="absolute left-3 top-3 text-gray-400" size={20} />
						<input
							type="text"
							placeholder="请输入账号"
							className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
							value={formData.account}
							onChange={(e) => setFormData({ ...formData, account: e.target.value })}
						/>
					</div>
					<div className="relative">
						<Lock className="absolute left-3 top-3 text-gray-400" size={20} />
						<input
							type="password"
							placeholder="请输入密码"
							className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
						/>
					</div>
					<div className="flex gap-2">
						<div className="relative flex-1">
							<CheckSquare
								className="absolute left-3 top-3 text-gray-400"
								size={20}
							/>
							<input
								type="text"
								placeholder="验证码"
								className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
								value={formData.checkCode}
								onChange={(e) =>
									setFormData({ ...formData, checkCode: e.target.value })
								}
							/>
						</div>
						<img
							src={checkCodeInfo.checkCode}
							alt="code"
							className="h-[42px] cursor-pointer rounded border border-gray-200"
							onClick={loadCheckCode}
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow-lg mt-4"
					>
						登录
					</button>
				</form>
			</div>
		</div>
	)
}

export default Account
