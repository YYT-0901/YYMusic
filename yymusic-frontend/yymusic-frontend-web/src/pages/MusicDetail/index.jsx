import React, { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
	Play,
	Pause,
	Heart,
	Share2,
	ArrowLeft,
	CheckCircle,
	Clock,
	Eye,
	Download,
} from "lucide-react"
import { getMusicDetail, doGood, downloadMusic } from "@/services/music"
import { setCurrentMusic, setIsPlaying, setCurrentTime, showLoginModal } from "@/store"
import LoginModal from "@/components/LoginModal"
import { getResource } from "../../services/file"
import { setHasLike } from "../../store"

// 格式化时间为mm:ss格式
const formatDuration = (seconds) => {
	if (!seconds || isNaN(seconds)) return "00:00"
	const mins = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// 格式化日期
const formatDate = (dateString) => {
	if (!dateString) return ""
	const date = new Date(dateString)
	return date.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	})
}

// 格式化音乐类型
const formatMusicType = (type) => {
	const typeMap = {
		0: "歌曲",
		1: "纯音乐",
	}
	return typeMap[type] || "其他"
}

// 格式化推荐类型
const formatCommendType = (type) => {
	const commendMap = {
		0: "",
		1: "热门推荐",
	}
	return commendMap[type]
}

const parseDownloadFileName = (contentDisposition, fallbackName) => {
	if (!contentDisposition) {
		return fallbackName
	}

	const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
	if (utf8Match?.[1]) {
		return decodeURIComponent(utf8Match[1])
	}

	const defaultMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
	if (defaultMatch?.[1]) {
		return defaultMatch[1]
	}

	return fallbackName
}

const MusicDetailPage = () => {
	// 获取URL中的音乐ID
	const { musicId } = useParams()
	const dispatch = useDispatch()
	const { currentMusic, isPlaying, currentTime, hasLike } = useSelector(
		(state) => state.musicPlay,
	)

	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	// --- 状态管理 ---
	const [currentLyricIndex, setCurrentLyricIndex] = useState(-1)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [songData, setSongData] = useState(null)
	const [isLiking, setIsLiking] = useState(false)
	const { isLoggedIn } = useSelector((state) => state.user)
	const [backVisible, setBackVisible] = useState(false)
	const [copySuccess, setCopySuccess] = useState(false)
	const [downloadSuccess, setDownloadSuccess] = useState(false)

	const lyricsContainerRef = useRef(null)

	// 检查是否需要显示返回按钮
	useEffect(() => {
		const from = searchParams.get("from")
		setBackVisible(from != null)
	}, [searchParams])

	// 获取音乐详情数据
	useEffect(() => {
		const fetchMusicDetail = async () => {
			if (!musicId) return

			try {
				setLoading(true)
				const response = await getMusicDetail({ musicId })
				if (response) {
					setSongData(response)
					setError(null)
					// 更新点赞状态
					dispatch(setHasLike(response.doGood === true))
				} else {
					setError("获取音乐详情失败")
					setSongData(null)
				}
			} catch (err) {
				console.error("获取音乐详情错误:", err)
				setError("网络错误，无法获取音乐详情")
				setSongData(null)
			} finally {
				setLoading(false)
			}
		}

		fetchMusicDetail()
	}, [musicId, dispatch])

	// --- 数据处理 ---
	const parsedLyrics = useMemo(() => {
		if (!songData?.lyrics) return []

		try {
			return JSON.parse(songData.lyrics)
				.filter((line) => !line.text.startsWith("<")) // 过滤掉 <inst> 等标记，让显示更纯净
				.map((line, index) => ({
					...line,
					id: index,
				}))
		} catch (e) {
			console.error("解析歌词错误:", e)
			return []
		}
	}, [songData?.lyrics])

	// --- 事件处理 ---
	const togglePlay = () => {
		if (!songData) return

		// 设置当前播放歌曲
		if (!currentMusic || currentMusic.musicId !== songData.musicId) {
			dispatch(setCurrentMusic(songData))
		}

		// 切换播放状态
		dispatch(setIsPlaying(!isPlaying))
	}

	// 监听播放状态和当前歌曲变化
	useEffect(() => {
		if (!currentMusic || currentMusic.musicId !== songData?.musicId) {
			// 如果当前播放的不是这首歌，重置播放状态
			setCurrentLyricIndex(-1)
		}
	}, [currentMusic, songData])

	// 根据播放时间更新歌词高亮
	useEffect(() => {
		if (!songData || !currentMusic || currentMusic.musicId !== songData.musicId) {
			return
		}

		const activeIndex = parsedLyrics.findIndex((line, index) => {
			const nextLine = parsedLyrics[index + 1]
			if (nextLine) {
				return currentTime >= line.start && currentTime < nextLine.start
			}
			return currentTime >= line.start
		})

		if (activeIndex !== -1 && activeIndex !== currentLyricIndex) {
			setCurrentLyricIndex(activeIndex)
		}
	}, [currentTime, songData, currentMusic, parsedLyrics, currentLyricIndex])

	// 处理点赞操作
	const handleLike = async () => {
		if (!songData || isLiking) return

		// 检查登录状态
		if (!isLoggedIn) {
			dispatch(showLoginModal())
			return
		}

		try {
			setIsLiking(true)

			// 调用点赞接口
			await doGood({
				musicId: songData.musicId,
			})

			// 更新点赞状态
			dispatch(setHasLike(!songData.doGood))

			// 更新本地状态
			setSongData((prev) => ({
				...prev,
				doGood: !prev.doGood,
				goodCount: prev.doGood ? prev.goodCount - 1 : prev.goodCount + 1,
			}))
		} catch (error) {
			console.error("点赞失败:", error)
			// 可以添加错误提示
		} finally {
			setIsLiking(false)
		}
	}

	// 复制URL到剪贴板
	const handleShare = async () => {
		try {
			// 获取当前页面URL
			const url = window.location.href
			// 复制到剪贴板
			await navigator.clipboard.writeText(url.split("?")[0])
			// 显示复制成功提示
			setCopySuccess(true)
			// 3秒后隐藏提示
			setTimeout(() => setCopySuccess(false), 3000)
		} catch (err) {
			console.error("复制失败:", err)
		}
	}

	const handleDownload = async () => {
		if (!songData?.musicId) return

		try {
			const response = await downloadMusic({
				musicId: songData.musicId,
			})
			const fileName = parseDownloadFileName(
				response.headers["content-disposition"],
				`${songData.musicTitle || "music"}.mp3`,
			)
			const blobUrl = window.URL.createObjectURL(response.data)
			const link = document.createElement("a")
			link.href = blobUrl
			link.download = fileName
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(blobUrl)
			setDownloadSuccess(true)
			setTimeout(() => setDownloadSuccess(false), 3000)
		} catch (error) {
			console.error("下载失败:", error)
			setDownloadSuccess(false)
		}
	}

	// 歌词滚动
	useEffect(() => {
		if (currentLyricIndex !== -1 && lyricsContainerRef.current) {
			const activeEl = lyricsContainerRef.current.children[currentLyricIndex]
			if (activeEl) {
				activeEl.scrollIntoView({
					behavior: "smooth",
					block: "center",
				})
			}
		}
	}, [currentLyricIndex])

	// 加载中状态
	if (loading) {
		return (
			<div className="flex flex-col h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white font-sans overflow-hidden relative selection:bg-system-primary selection:text-white">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-xl bg-gradient-to-r from-system-primary-lighter to-system-secondary-lighter bg-clip-text text-transparent">
						加载中...
					</div>
				</div>
			</div>
		)
	}

	// 错误状态
	if (error || !songData) {
		return (
			<div className="flex flex-col h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white font-sans overflow-hidden relative selection:bg-system-primary selection:text-white">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-xl bg-gradient-to-r from-system-primary to-system-secondary bg-clip-text text-transparent">
						{error || "音乐不存在"}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white font-sans overflow-hidden relative selection:bg-system-primary selection:text-white">
			{/* 2. 顶部导航：只保留返回按钮 */}
			<header className="absolute top-0 left-0 w-full z-20 px-6 py-6 flex items-center justify-between">
				{backVisible ? (
					<button
						onClick={() => navigate(-1)}
						className="p-3 rounded-full bg-gradient-to-br from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-md hover:from-system-primary-dark/80 hover:to-system-secondary-dark/80 text-white transition-all transform hover:scale-105 active:scale-95 border border-system-primary-dark/50 shadow-lg shadow-system-primary/20"
					>
						<ArrowLeft size={22} className="text-system-primary-lighter" />
					</button>
				) : (
					<div></div>
				)}
				{/* 右上角：制作同款和分享 */}
				<div className="flex items-center gap-3">
					{/* 制作同款按钮 */}
					<button
						className="px-4 py-2 rounded-full bg-gradient-to-r from-system-primary/90 to-system-secondary/90 hover:from-system-primary hover:to-system-secondary text-white text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-system-primary/30 border border-system-primary/30"
						onClick={() => navigate(`/create?creationId=${songData.creationId}`)}
					>
						制作同款
					</button>

					{/* 分享按钮 */}
					<div className="relative">
						{/* 复制成功提示 */}
						{copySuccess ? (
							<button className="p-3 rounded-full bg-gradient-to-br from-system-primary-dark/60 to-system-secondary-dark/60 hover:from-system-primary-dark/80 hover:to-system-secondary-dark/80 text-white transition-colors border border-system-primary-dark/50 shadow-lg shadow-system-primary/20">
								<CheckCircle size={20} className="text-green-400" />
							</button>
						) : (
							<button
								className="p-3 rounded-full bg-gradient-to-br from-system-primary-dark/60 to-system-secondary-dark/60 hover:from-system-primary-dark/80 hover:to-system-secondary-dark/80 text-white transition-colors border border-system-primary-dark/50 shadow-lg shadow-system-primary/20"
								onClick={handleShare}
							>
								<Share2 size={20} className="text-system-primary-lighter" />
							</button>
						)}

						{downloadSuccess ? (
							<button className="p-3 rounded-full bg-gradient-to-br from-system-primary-dark/60 to-system-secondary-dark/60 hover:from-system-primary-dark/80 hover:to-system-secondary-dark/80 text-white transition-colors border border-system-primary-dark/50 shadow-lg shadow-system-primary/20">
								<CheckCircle size={20} className="text-green-400" />
							</button>
						) : (
							<button
								className="p-3 rounded-full bg-gradient-to-br from-system-primary-dark/60 to-system-secondary-dark/60 hover:from-system-primary-dark/80 hover:to-system-secondary-dark/80 text-white transition-colors border border-system-primary-dark/50 shadow-lg shadow-system-primary/20"
								onClick={handleDownload}
							>
								<Download size={20} className="text-system-primary-lighter" />
							</button>
						)}
					</div>
				</div>
			</header>

			{/* 3. 主内容区 */}
			<main className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center gap-12 px-6 lg:px-20 pb-12 pt-20">
				{/* === 左侧：黑胶唱片与信息 === */}
				<div className="flex flex-col items-center w-full md:w-5/12 max-w-md space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
					{/* 黑胶唱片容器 (点击播放/暂停) */}
					<div
						onClick={togglePlay}
						className="relative group cursor-pointer w-[280px] h-[280px] md:w-[380px] md:h-[380px] select-none shadow-2xl shadow-system-primary/20 border border-system-primary/30 rounded-2xl p-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm"
					>
						{/* 唱片本体 */}
						<div
							className={`w-full h-full rounded-full overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border-[8px] border-slate-900 bg-slate-900 relative ${isPlaying ? "animate-[spin_20s_linear_infinite]" : ""}`}
						>
							{/* 封面图片 */}
							<img
								src={
									songData.cover
										? getResource(songData.cover)
										: import.meta.env.VITE_MUSIC_DEFAULT_COVER
								}
								alt="Cover"
								className="w-full h-full object-cover opacity-90 scale-105"
							/>

							{/* 黑胶纹理 (CSS 径向渐变模拟反光和纹路) */}
							<div className="absolute inset-0 rounded-full opacity-40 bg-[radial-gradient(circle,transparent_30%,#000_31%,transparent_32%,transparent_34%,#000_35%,transparent_36%,transparent_45%,#000_46%,transparent_47%,transparent_60%,#000_61%,transparent_62%)] pointer-events-none"></div>

							{/* 唱片反光层 */}
							<div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

							{/* 唱片中心标签 */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-24 h-24 md:w-32 md:h-32 bg-slate-950 rounded-full border-4 border-slate-800/80 shadow-inner flex items-center justify-center overflow-hidden">
									{/* 中心的小图或logo */}
									<img
										src={
											songData.cover
												? getResource(songData.cover)
												: import.meta.env.VITE_MUSIC_DEFAULT_COVER
										}
										className="w-full h-full object-cover opacity-50 blur-[1px]"
										alt="Inner label"
									/>
								</div>
							</div>
						</div>

						{/* 播放/暂停 状态遮罩 (悬停或暂停时显示) */}
						<div
							className={`absolute inset-0 rounded-full flex items-center justify-center bg-gradient-to-br from-black/40 to-system-primary-dark/40 backdrop-blur-[4px] transition-all duration-300 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
						>
							<div className="w-16 h-16 bg-gradient-to-br from-white/30 to-system-primary/30 backdrop-blur-md rounded-full flex items-center justify-center border border-system-primary/50 shadow-lg shadow-system-primary/30 transform scale-100 group-active:scale-90 transition-transform">
								{isPlaying ? (
									<Pause size={32} className="fill-white text-white" />
								) : (
									<Play size={32} className="fill-white text-white ml-1" />
								)}
							</div>
						</div>
					</div>

					{/* 歌曲详情 */}
					<div className="text-center space-y-3 w-full">
						<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent tracking-tight drop-shadow-md truncate px-4 flex items-center justify-center gap-2">
							{songData.musicTitle}
							<button
								className="flex p-2 rounded-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:from-slate-700/80 hover:to-slate-800/80 transition-all transform hover:scale-110 border border-slate-700/50"
								onClick={handleLike}
								disabled={isLiking}
							>
								<Heart
									size={24}
									className={`transition-all ${hasLike === true ? "fill-rose-500 text-rose-500" : "text-slate-300 hover:text-rose-500"}`}
								/>
								<div className={` text-sm text-slate-200 `}>
									<span>{songData.goodCount}</span>
								</div>
							</button>
						</h1>
						<div className="flex items-center justify-center gap-2 text-slate-300">
							{songData.avatar && (
								<img
									src={getResource(songData.avatar)}
									className="w-6 h-6 rounded-full border border-system-primary/30 cursor-pointer hover:border-system-primary transition-all transform hover:scale-110"
									alt="Avatar"
									onClick={() => navigate(`/user/${songData.userId}`)}
								/>
							)}
							<span
								className="text-lg font-medium cursor-pointer hover:text-system-primary transition-colors bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent"
								onClick={() => navigate(`/user/${songData.userId}`)}
							>
								{songData.nickName}
							</span>
						</div>

						{/* 歌曲详细信息 */}
						<div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 mt-2 pb-10">
							<div className="flex items-center gap-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/50">
								<Clock size={14} className="text-system-primary-lighter" />
								<span>{formatDuration(songData.duration)}</span>
							</div>
							<div className="flex items-center gap-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/50">
								<Eye size={14} className="text-system-primary-lighter" />
								<span>{songData.playCount} 播放</span>
							</div>
							<div className="flex items-center gap-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/50">
								<span>{formatDate(songData.createTime)}</span>
							</div>
							<div className="flex items-center gap-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/50">
								<span>{formatMusicType(songData.musicType)}</span>
							</div>
							<div className="flex items-center gap-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/50">
								<span>{formatCommendType(songData.commendType)}</span>
							</div>
						</div>

						{/* 简易互动栏 */}
						<div className="flex items-center justify-center gap-6 mt-4"></div>
					</div>
				</div>

				{/* === 右侧：美化后的歌词 === */}
				<div className="w-full md:w-6/12 h-[50vh] md:h-[70vh] flex flex-col relative animate-in fade-in slide-in-from-right-8 duration-700 delay-100 bg-gradient-to-br from-system-primary-dark/40 to-system-secondary-dark/40 border border-system-primary-dark/50 rounded-2xl p-6 shadow-xl shadow-system-primary/20 backdrop-blur-sm">
					{/* 歌词容器 */}
					<div
						ref={lyricsContainerRef}
						className="flex-1 overflow-y-auto no-scrollbar py-[50%] md:py-[40%] text-center space-y-6 scroll-smooth select-none"
						style={{
							// 使用 CSS mask 实现平滑的上下淡出效果
							maskImage:
								"linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
							WebkitMaskImage:
								"linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
						}}
					>
						{parsedLyrics.length > 0 ? (
							parsedLyrics.map((line, i) => {
								const isActive = i === currentLyricIndex
								const isNear = Math.abs(i - currentLyricIndex) <= 1 // 附近的歌词

								return (
									<p
										key={i}
										className={`
                      transition-all duration-700 ease-out cursor-pointer px-4
                      ${
							isActive
								? "text-white text-2xl md:text-3xl font-bold scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
								: isNear
									? "text-slate-300 text-lg md:text-xl font-medium scale-95 opacity-60 blur-[0.5px]"
									: "text-slate-500 text-base md:text-lg scale-90 opacity-30 blur-[1px]"
						}
                    `}
										onClick={() => {
											// 设置当前播放歌曲
											if (
												!currentMusic ||
												currentMusic.musicId !== songData.musicId
											) {
												dispatch(setCurrentMusic(songData))
											}

											// 设置播放时间到当前歌词行
											dispatch(setCurrentTime(line.start))

											// 开始播放
											dispatch(setIsPlaying(true))
										}}
									>
										{line.text}
									</p>
								)
							})
						) : (
							<div className="flex items-center justify-center h-full text-slate-500 italic">
								纯音乐 / 暂无歌词
							</div>
						)}
					</div>
				</div>
			</main>
			<style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
		</div>
	)
}

export default MusicDetailPage
