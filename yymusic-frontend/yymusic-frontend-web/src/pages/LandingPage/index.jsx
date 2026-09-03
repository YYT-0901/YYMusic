import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Music, Sparkles, Play, Zap, Globe, Headphones } from "lucide-react"

export default function LandingPage() {
	const navigate = useNavigate()
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		setIsVisible(true)
	}, [])

	const handleStart = () => {
		navigate("/home")
	}

	return (
		<div className="relative w-full h-screen bg-slate-950 overflow-hidden text-white selection:bg-system-primary selection:text-white font-sans">
			{/* --- 背景装饰 --- */}
			<div className="absolute inset-0 z-0">
				{/* 渐变光晕 */}
				<div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-system-primary-dark/20 rounded-full blur-[120px] animate-pulse-extra-slow"></div>
				<div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-system-indigo-dark/10 rounded-full blur-[120px] animate-pulse-extra-slow delay-1000"></div>

				{/* 网格背景 */}
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
			</div>

			{/* --- 顶部导航 (仅展示Logo) --- */}
			<header className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
				<div className="flex items-center gap-2">
					<div className="w-10 h-10 bg-gradient-to-tr from-system-primary to-system-secondary rounded-xl flex items-center justify-center shadow-lg shadow-system-primary/20">
						<Music className="text-white w-6 h-6" />
					</div>
					<span className="text-xl font-bold tracking-tight">YY Music</span>
				</div>
				<div className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
					<span>AI 驱动</span>
					<span>极速创作</span>
					<span>版权保护</span>
				</div>
			</header>

			{/* --- 主内容区 --- */}
			<main className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4">
				<div
					className={`transition-all duration-1000 transform ${
						isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
					}`}
				>
					{/* 标签 */}
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-system-primary-lighter text-xs font-medium mb-8 backdrop-blur-sm animate-bounce-slow">
						<Sparkles size={12} />
						<span>新一代 AI 音乐创作引擎</span>
					</div>

					{/* 主标题 */}
					<h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-tight">
						释放你的 <br className="md:hidden" />
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-system-primary-light via-system-secondary to-system-indigo animate-gradient-move-x">
							音乐灵感
						</span>
					</h1>

					{/* 副标题 */}
					<p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
						无需专业乐理知识，输入提示词，AI 即刻为您生成专业级音乐作品。
						<br className="hidden md:block" />
						从流行到古典，从歌词到旋律，一切由你掌控。
					</p>

					{/* 核心按钮 */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<button
							onClick={handleStart}
							className="group relative px-8 py-4 bg-white text-slate-950 text-lg font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] flex items-center gap-2"
						>
							<span className="relative z-10">开始体验</span>
							<Play
								size={18}
								fill="currentColor"
								className="relative z-10 group-hover:translate-x-1 transition-transform"
							/>
						</button>

						<button
							onClick={() => window.open("https://github.com", "_blank")}
							className="px-8 py-4 bg-gradient-to-r from-system-primary/30 to-system-secondary/30 hover:from-system-primary/40 hover:to-system-secondary/40 text-system-primary-lighter hover:text-white text-lg font-medium rounded-full border border-system-primary/30 hover:border-system-primary/50 transition-all backdrop-blur-sm shadow-lg"
						>
							了解更多
						</button>
					</div>

					{/* 特性概览小图标 */}
					<div className="mt-16 grid grid-cols-3 gap-8 md:gap-16 opacity-70">
						<div className="flex flex-col items-center gap-2">
							<div className="w-12 h-12 rounded-full bg-gradient-to-r from-system-primary to-system-secondary flex items-center justify-center text-white mb-1 shadow-lg">
								<Zap size={20} />
							</div>
							<span className="text-xs text-system-primary-lighter">极速生成</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<div className="w-12 h-12 rounded-full bg-gradient-to-r from-system-primary to-system-secondary flex items-center justify-center text-white mb-1 shadow-lg">
								<Headphones size={20} />
							</div>
							<span className="text-xs text-system-primary-lighter">高音质</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<div className="w-12 h-12 rounded-full bg-gradient-to-r from-system-primary to-system-secondary flex items-center justify-center text-white mb-1 shadow-lg">
								<Globe size={20} />
							</div>
							<span className="text-xs text-system-primary-lighter">社区共享</span>
						</div>
					</div>
				</div>
			</main>

			{/* --- 底部版权 --- */}
			<footer className="absolute bottom-6 w-full text-center text-xs text-slate-600">
				© {new Date().getFullYear()} YY Music AI. All rights reserved.
			</footer>
		</div>
	)
}
