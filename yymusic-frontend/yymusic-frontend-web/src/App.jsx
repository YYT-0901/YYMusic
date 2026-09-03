import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import Layout from "@/pages/Layout"
import HomePage from "@/pages/HomePage"
import MusicGenPage from "@/pages/MusicGenPage"
import Register from "@/pages/Register"
import MusicDetail from "@/pages/MusicDetail"
import MyProjectPage from "@/pages/MyProjectPage"
import RecommendedMusicPage from "@/pages/RecommendedMusicPage"
import UserPage from "@/pages/UserPage"
import TopUpPage from "@/pages/TopUpPage"
import AboutPage from "@/pages/AboutPage"
import LandingPage from "@/pages/LandingPage"

function App() {
	useEffect(() => {
		document.title = "yy音乐 - 在线音乐平台"
	}, [])

	return (
		<div className="app">
			<Routes>
				{/* 1. 根路径：封面落地页 */}
				<Route path="/" element={<LandingPage />} />

				{/* 2. 注册页面 (独立布局) */}
				<Route path="/register" element={<Register />} />

				{/* 3. 系统主布局 (包含侧边栏和播放器) */}
				<Route element={<Layout />}>
					<Route path="home" element={<HomePage />} />
					<Route path="create" element={<MusicGenPage />} />
					<Route path="profile" element={<MyProjectPage />} />
					<Route path="recharge" element={<TopUpPage />} />
					<Route path="music/:musicId" element={<MusicDetail />} />
					<Route path="recommended" element={<RecommendedMusicPage />} />
					<Route path="user/:userId" element={<UserPage />} />
					<Route path="about" element={<AboutPage />} />
				</Route>
			</Routes>
		</div>
	)
}

export default App
