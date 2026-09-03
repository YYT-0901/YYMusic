import PropTypes from "prop-types"
import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
	Home,
	Music,
	User,
	CreditCard,
	LogOut,
	LogIn,
	ChevronLeft,
	Coins,
	History,
	Info,
	X,
	Loader2,
} from "lucide-react"
import NavItem from "../NavItem"
import IntegralRecordModal from "@/components/IntegralRecordModal"
import ConfirmModal from "@/components/ConfirmModal"
import { getResource } from "../../../../services/file"
import { getIntegralRecords } from "../../../../services/account"

/**
 * Sidebar 侧边栏组件
 * @param {object} props
 * @param {string} props.activeTab - 当前激活的标签
 * @param {function} props.onTabChange - 标签切换事件
 * @param {boolean} props.isLoggedIn - 是否已登录
 * @param {function} props.onLogin - 登录事件
 * @param {function} props.onLogout - 登出事件
 * @param {boolean} props.isSidebarCollapsed - 是否折叠模式
 */
export default function Sidebar({
	activeTab = "home",
	onTabChange,
	isLoggedIn = false,
	onLogin,
	onLogout,
	isSidebarCollapsed = false,
	isCustomerServiceOpen,
	setIsCustomerServiceOpen,
}) {
	// 从Redux获取用户信息（store的state是扁平的）
	const { nickName, avatar, integral, userId } = useSelector((state) => state.user)
	const navigate = useNavigate()

	// 真实用户数据
	const userAvatar = avatar ? getResource(avatar) : import.meta.env.VITE_MUSIC_DEFAULT_COVER
	const userName = nickName || "用户"
	const userPoints = integral || 0

	// 下拉框状态
	const [dropdownOpen, setDropdownOpen] = useState(false)
	// 积分记录弹窗状态
	const [integralModalOpen, setIntegralModalOpen] = useState(false)
	// 积分记录数据
	const [integralRecords, setIntegralRecords] = useState({
		list: [],
		totalCount: 0,
		pageNo: 1,
		pageSize: 12,
	})
	// 加载状态
	const [loading, setLoading] = useState(false)
	// 登出确认弹窗状态
	const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

	// 下拉框引用
	const dropdownRef = useRef(null)

	// 点击外部关闭下拉框
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	// 加载积分记录
	const loadIntegralRecords = async (pageNo = 1) => {
		setLoading(true)
		try {
			const res = await getIntegralRecords({ pageNo })
			if (res) {
				setIntegralRecords(res)
			}
		} catch (error) {
			console.error("获取积分记录失败:", error)
		} finally {
			setLoading(false)
		}
	}

	// 打开积分记录弹窗
	const handleOpenIntegralRecords = () => {
		setIntegralModalOpen(true)
	}

	// 关闭积分记录弹窗
	const handleCloseIntegralModal = () => {
		setIntegralModalOpen(false)
	}

	// 跳转到用户中心
	const handleGoToUserCenter = () => {
		navigate(`/user/${userId}`)
		setDropdownOpen(false)
	}

	// 跳转到关于平台页面
	const handleGoToAbout = () => {
		navigate("/about")
		setDropdownOpen(false)
	}

	// 显示登出确认弹窗
	const handleShowLogoutConfirm = (e) => {
		e.stopPropagation()
		setLogoutConfirmOpen(true)
	}

	// 确认登出
	const handleConfirmLogout = () => {
		setLogoutConfirmOpen(false)
		onLogout()
	}

	// 取消登出
	const handleCancelLogout = () => {
		setLogoutConfirmOpen(false)
	}

	// 切换下拉框
	const toggleDropdown = () => {
		setDropdownOpen(!dropdownOpen)
	}
	return (
		<>
			<aside
				className={`${
					isSidebarCollapsed ? "w-20" : "w-64"
				} flex-shrink-0 bg-slate-950/50 backdrop-blur-xl border-r border-slate-800 flex flex-col h-full z-20 transition-all duration-300 ease-in-out relative`}
			>
				{/* Logo 区 & 折叠按钮 */}
				<div
					className={`p-6 flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} transition-all border-b border-slate-800/50`}
				>
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-system-primary to-system-secondary flex items-center justify-center">
							<Music className="w-5 h-5 text-white" />
						</div>
						<span
							className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
						>
							YY Music
						</span>
					</div>

					{/* 折叠切换按钮 */}
					<button
						onClick={() => onTabChange("toggleCollapse")}
						className={`
          absolute -right-3 top-8 w-6 h-6 bg-gradient-to-br from-system-primary/80 to-system-secondary/80 border border-system-primary/50 rounded-full flex items-center justify-center text-white hover:from-system-primary/90 hover:to-system-secondary transition-all shadow-lg shadow-system-primary/30 z-30
          ${isSidebarCollapsed ? "rotate-180" : ""}
        `}
					>
						<ChevronLeft size={14} />
					</button>
				</div>

				{/* 导航菜单 */}
				<nav className="flex-1 px-3 space-y-2 mt-4">
					<NavItem
						icon={<Home size={20} />}
						label="首页"
						active={activeTab === "home"}
						onClick={() => onTabChange("home")}
						collapsed={isSidebarCollapsed}
					/>
					<NavItem
						icon={<Music size={20} />}
						label="音乐创作"
						active={activeTab === "create"}
						onClick={() => onTabChange("create")}
						collapsed={isSidebarCollapsed}
					/>
					<NavItem
						icon={<User size={20} />}
						label="我的作品"
						active={activeTab === "profile"}
						onClick={() => onTabChange("profile")}
						collapsed={isSidebarCollapsed}
					/>
					<NavItem
						icon={<CreditCard size={20} />}
						label="充值中心"
						active={activeTab === "recharge"}
						onClick={() => onTabChange("recharge")}
						collapsed={isSidebarCollapsed}
					/>
				</nav>

				{/* 底部用户/登录区 */}
				<div className="p-4 border-t border-slate-800 bg-slate-950/30 overflow-hidden">
					{isLoggedIn && (
						<div className="flex flex-col items-center mb-4 ">
							{/* AI智能客服图标按钮 */}
							<button
								className={`flex items-center justify-center w-full py-3 bg-gradient-to-r from-system-primary/90 to-system-secondary/90 hover:from-system-primary hover:to-system-secondary text-yellow-300 hover:text-yellow-200 text-center rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-system-primary/30 border border-system-primary/30 ${isSidebarCollapsed ? "h-10" : ""}`}
								onClick={() => setIsCustomerServiceOpen(!isCustomerServiceOpen)}
								aria-label="打开智能客服"
							>
								{!isSidebarCollapsed && (
									<div className="flex items-center gap-2">
										<i
											className="iconfont icon-ai_chat"
											style={{ fontSize: "24px" }}
										></i>
										<span className="text-sm font-medium">智能客服</span>
									</div>
								)}
								{isSidebarCollapsed && (
									<i
										className="iconfont icon-ai_chat"
										style={{ fontSize: "24px" }}
									></i>
								)}
							</button>
						</div>
					)}

					{isLoggedIn ? (
						<div ref={dropdownRef}>
							<div
								className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} group cursor-pointer p-2 rounded-xl hover:bg-gradient-to-br from-slate-800/70 to-slate-900/70 transition-colors relative border border-transparent hover:border-system-primary/30`}
								onClick={toggleDropdown}
							>
								<img
									src={userAvatar}
									alt="User"
									className="w-8 h-8 rounded-full border-2 border-system-primary/30 flex-shrink-0 shadow-lg shadow-system-primary/20"
								/>
								{/* 收起时隐藏用户信息 */}
								<div
									className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100"}`}
								>
									<p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent truncate">
										{userName}
									</p>
									<div className="flex items-center gap-1 text-xs text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
										<Coins size={12} className="flex-shrink-0" />
										<span>{userPoints.toLocaleString()}</span>
									</div>
								</div>
								<LogOut
									size={16}
									className={`text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 ${isSidebarCollapsed ? "hidden" : ""}`}
									onClick={handleShowLogoutConfirm}
								/>
							</div>

							{/* 用户下拉框 */}
							{dropdownOpen && !isSidebarCollapsed && (
								<div className="absolute bottom-16 left-0 right-0 m-2 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl border border-system-primary/30 shadow-2xl shadow-system-primary/20 z-50">
									<div className="flex flex-col">
										<button
											className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r from-system-primary/20 to-system-secondary/20 transition-colors text-left"
											onClick={() => {
												handleOpenIntegralRecords()
												setDropdownOpen(false)
											}}
										>
											<History
												size={18}
												className="text-system-primary-lighter"
											/>
											<span className="text-sm bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
												积分记录
											</span>
										</button>
										<button
											className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r from-system-primary/20 to-system-secondary/20 transition-colors text-left"
											onClick={handleGoToUserCenter}
										>
											<User
												size={18}
												className="text-system-primary-lighter"
											/>
											<span className="text-sm bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
												用户中心
											</span>
										</button>
										<button
											className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r from-system-primary/20 to-system-secondary/20 transition-colors text-left"
											onClick={handleGoToAbout}
										>
											<Info
												size={18}
												className="text-system-primary-lighter"
											/>
											<span className="text-sm bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
												关于平台
											</span>
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						<button
							onClick={onLogin}
							className={`w-full py-3 bg-gradient-to-r from-system-primary to-system-secondary rounded-xl font-medium hover:shadow-lg hover:shadow-system-primary/30 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center border border-system-primary/30`}
							title="登录"
						>
							{isSidebarCollapsed ? (
								<LogIn size={20} className="text-white" />
							) : (
								<span className="text-white bg-clip-text">立即登录</span>
							)}
						</button>
					)}
				</div>
			</aside>

			{/* 积分记录弹窗 */}
			<IntegralRecordModal isOpen={integralModalOpen} onClose={handleCloseIntegralModal} />

			{/* 登出确认弹窗 */}
			<ConfirmModal
				isOpen={logoutConfirmOpen}
				onClose={handleCancelLogout}
				onConfirm={handleConfirmLogout}
				title="确认登出"
				message="确定要退出登录吗？"
				confirmText="确定"
				cancelText="取消"
			/>
		</>
	)
}

Sidebar.propTypes = {
	activeTab: PropTypes.string.isRequired,
	onTabChange: PropTypes.func.isRequired,
	isLoggedIn: PropTypes.bool,
	onLogin: PropTypes.func,
	onLogout: PropTypes.func,
	isSidebarCollapsed: PropTypes.bool,
	isCustomerServiceOpen: PropTypes.bool,
	setIsCustomerServiceOpen: PropTypes.func,
}
