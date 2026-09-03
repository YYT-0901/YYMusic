import { useState, useEffect } from "react"
import { Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Sidebar } from "../HomePage/components"
import LoginModal from "@/components/LoginModal"
import {
	setUserInfo,
	logout,
	setCurrentMusic,
	setIsPlaying,
	setPlayList,
	showLoginModal,
} from "@/store"
import { logout as logoutApi, getLoginInfo } from "@/services/account"
import Player from "../HomePage/components/Player"
import CustomerServiceChat from "./components/CustomerServiceChat"

/**
 * Layout 布局组件
 * 职责：提供左右布局，左侧Sidebar保持不变，右侧通过Outlet显示不同页面内容
 */
export default function Layout() {
	// 状态管理
	const dispatch = useDispatch()
	const { currentMusic, isPlaying } = useSelector((state) => state.musicPlay)
	const [searchParams] = useSearchParams()
	const [activeTab, setActiveTab] = useState("home")
	const { isLoggedIn } = useSelector((state) => state.user)
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
	const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false)

	const navigate = useNavigate()
	const location = useLocation()

	// 检查登录状态并自动获取用户信息
	useEffect(() => {
		const token = localStorage.getItem("token")
		if (token) {
			// 尝试获取最新的用户信息
			getLoginInfo().then((res) => {
				if (res && res.userId) {
					dispatch(setUserInfo(res))
				}
			})
		}
	}, [])

	// 检测是否需要自动弹出登录框（从注册页面返回时）
	useEffect(() => {
		const loginShow = searchParams.get("loginShow")
		if (loginShow === "true") {
			dispatch(showLoginModal())
		}
	}, [searchParams, dispatch])

	// 根据路由同步activeTab状态
	useEffect(() => {
		const path = location.pathname.slice(1) || "home"
		if (["home", "create", "profile", "recharge"].includes(path)) {
			setActiveTab(path)
		}
	}, [location.pathname])

	// 处理标签切换
	const handleTabChange = (tab) => {
		if (tab === "toggleCollapse") {
			setIsSidebarCollapsed(!isSidebarCollapsed)
		} else {
			setActiveTab(tab)
			navigate(`/${tab}`)
		}
	}

	// 处理播放歌曲
	const handlePlaySong = (song) => {
		dispatch(setCurrentMusic(song))
		dispatch(setIsPlaying(true))
	}

	// 处理播放/暂停切换
	const handleTogglePlay = () => {
		dispatch(setIsPlaying(!isPlaying))
	}

	// 处理登录/登出
	const handleLogin = () => dispatch(showLoginModal())
	// 处理登出
	const handleLogout = async () => {
		try {
			// 调用后端登出接口
			await logoutApi()
		} catch (err) {
			console.error("登出接口调用失败:", err)
		} finally {
			// 清除本地状态
			localStorage.removeItem("token")
			localStorage.removeItem("userInfo")
			dispatch(logout())
		}
	}

	return (
		<div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-system-primary selection:text-white">
			{/* 左侧导航栏 - 保持不变 */}
			<Sidebar
				activeTab={activeTab}
				onTabChange={handleTabChange}
				isLoggedIn={isLoggedIn}
				onLogin={handleLogin}
				onLogout={handleLogout}
				isSidebarCollapsed={isSidebarCollapsed}
				isCustomerServiceOpen={isCustomerServiceOpen}
				setIsCustomerServiceOpen={setIsCustomerServiceOpen}
			/>

			{/* 右侧内容区 - 根据路由变化 */}
			<main className="flex-1 flex flex-col h-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-l border-system-primary/30">
				<Outlet
					context={{
						currentMusic,
						isPlaying,
						onPlaySong: handlePlaySong,
						onTogglePlay: handleTogglePlay,
						isSidebarCollapsed,
					}}
				/>

				{/* 底部播放器 - 使用Redux管理播放状态 */}
				<Player />
			</main>

			{/* 智能客服抽屉 - 占位式布局 */}
			<CustomerServiceChat
				visible={isCustomerServiceOpen}
				onClose={() => setIsCustomerServiceOpen(false)}
			/>

			{/* 登录弹窗 */}
			<LoginModal />
		</div>
	)
}
