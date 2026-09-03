import React, { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { BookOpen, ShoppingBag, QrCode, ClipboardList, Music, Users, LogOut } from "lucide-react"
import Request from "../utils/Request"
import Api from "../utils/Api"
import ConfirmModal from "../components/ConfirmModal"
import toast from "react-hot-toast"

const Layout = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

	const menuList = [
		{ icon: BookOpen, name: "字典", url: "/dict/sysdict" },
		{ icon: ShoppingBag, name: "商品", url: "/product/productList" },
		{ icon: QrCode, name: "付款码", url: "/paycode/paycodeList" },
		{ icon: ClipboardList, name: "订单", url: "/order/orderList" },
		{ icon: Music, name: "音乐", url: "/music/musicList" },
		{ icon: Users, name: "用户", url: "/user/userList" },
	]

	const logout = () => {
		setShowLogoutConfirm(true)
	}

	const handleLogoutConfirm = () => {
		Request({ url: Api.logout }).then(() => {
			localStorage.removeItem("token")
			navigate("/login")
		})
		setShowLogoutConfirm(false)
	}

	const handleLogoutCancel = () => {
		setShowLogoutConfirm(false)
	}

	return (
		<div className="flex h-screen bg-gray-50 overflow-hidden">
			{/* Sidebar */}
			<div className="w-24 bg-white border-r border-gray-200 flex flex-col py-4 shadow-sm z-10 relative">
				<div className="flex-1 flex flex-col items-center gap-2">
					{menuList.map((item) => {
						const isActive = location.pathname.includes(item.url)
						return (
							<div
								key={item.name}
								onClick={() => navigate(item.url)}
								className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl cursor-pointer transition-all duration-200 ${
									isActive
										? "bg-blue-50 text-blue-600 shadow-sm"
										: "text-gray-500 hover:bg-gray-100"
								}`}
							>
								<item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
								<span className="text-[10px] mt-1 font-medium">{item.name}</span>
							</div>
						)
					})}
				</div>
				<div
					className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
					onClick={logout}
				>
					<LogOut size={20} />
					<span className="text-xs mt-1">退出</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 p-4 overflow-hidden">
				<div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4">
					<Outlet />
				</div>
			</div>

			<ConfirmModal
				isOpen={showLogoutConfirm}
				onClose={handleLogoutCancel}
				onConfirm={handleLogoutConfirm}
				title="确认退出"
				message="确定要退出登录吗？"
				confirmText="确定"
				cancelText="取消"
			/>
		</div>
	)
}

export default Layout
