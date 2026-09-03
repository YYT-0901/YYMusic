import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getResource } from "../../../../services/file"
import {
	Heart,
	ListMusic,
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
	Repeat,
	Repeat1,
	List,
} from "lucide-react"
import { formatDuration } from "../../../../utils/format"
import {
	setIsPlaying,
	setCurrentTime,
	setDuration,
	playNext,
	playPrev,
	setCurrentMusic,
	setHasLike,
	showLoginModal,
	removeFromPlayList,
	togglePlayMode,
} from "@/store"
import { doGood, updatePlayCount } from "@/services/music"
import LoginModal from "@/components/LoginModal"

/**
 * Player 底部播放器组件
 */
export default function Player() {
	const dispatch = useDispatch()
	const audioRef = useRef(null)
	const progressRef = useRef(null)
	const location = useLocation()
	const navigate = useNavigate()
	const { currentMusic, playList, isPlaying, currentTime, duration, playMode, hasLike } =
		useSelector((state) => state.musicPlay)
	const { isLoggedIn } = useSelector((state) => state.user)
	const [localVolume, setLocalVolume] = useState(100)
	const [isDragging, setIsDragging] = useState(false)
	const [showVolume, setShowVolume] = useState(false)
	const [isLiking, setIsLiking] = useState(false)
	const [hasUpdatedPlayCount, setHasUpdatedPlayCount] = useState(false)
	const [showPlaylist, setShowPlaylist] = useState(false)

	// 音频加载完成后播放
	useEffect(() => {
		if (currentMusic?.audioPath && audioRef.current) {
			const audioUrl = getResource(currentMusic.audioPath)
			if (audioRef.current.src !== audioUrl) {
				audioRef.current.src = audioUrl
				audioRef.current.load()
			}
		}
	}, [currentMusic?.audioPath])

	// 当切换歌曲时，重置播放次数更新状态
	useEffect(() => {
		setHasUpdatedPlayCount(false)
	}, [currentMusic?.musicId])

	// 播放时间更新时检查是否超过10秒，如果超过且未更新过播放次数，则调用接口
	useEffect(() => {
		if (isPlaying && currentTime > 10 && !hasUpdatedPlayCount && currentMusic) {
			// 更新播放次数
			updatePlayCount({ musicId: currentMusic.musicId })
				.then(() => {
					setHasUpdatedPlayCount(true)
				})
				.catch((error) => {
					console.error("更新播放次数失败:", error)
				})
		}
	}, [isPlaying, currentTime, hasUpdatedPlayCount, currentMusic])

	// 自动播放
	useEffect(() => {
		if (audioRef.current && currentMusic) {
			const playPromise = audioRef.current.play()
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						dispatch(setIsPlaying(true))
					})
					.catch((error) => {
						console.error("播放失败:", error)
						dispatch(setIsPlaying(false))
					})
			}
		}
	}, [currentMusic?.audioPath])

	// 播放/暂停状态同步
	useEffect(() => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.play().catch(() => {})
			} else {
				audioRef.current.pause()
			}
		}
	}, [isPlaying])

	// 音量同步
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = localVolume / 100
		}
	}, [localVolume])

	// 同步Redux中的currentTime到音频元素
	useEffect(() => {
		if (audioRef.current && !isDragging) {
			// 只有当不是用户拖动进度条时，才同步时间
			const audioTime = audioRef.current.currentTime
			// 允许100ms的误差，避免频繁更新
			if (Math.abs(currentTime - audioTime) > 0.1) {
				audioRef.current.currentTime = currentTime
			}
		}
	}, [currentTime, isDragging])

	// 时间更新
	const handleTimeUpdate = useCallback(() => {
		if (audioRef.current && !isDragging) {
			dispatch(setCurrentTime(audioRef.current.currentTime))
		}
	}, [dispatch, isDragging])

	// 加载元数据
	const handleLoadedMetadata = useCallback(() => {
		if (audioRef.current) {
			dispatch(setDuration(audioRef.current.duration))
		}
	}, [dispatch])

	// 播放结束
	const handleEnded = useCallback(() => {
		if (playMode === "repeat") {
			// 单曲循环
			if (audioRef.current) {
				audioRef.current.currentTime = 0
				dispatch(setCurrentTime(0))
				audioRef.current.play().catch(() => {})
			}
		} else {
			// 顺序播放下一首
			if (playList.length > 1) {
				dispatch(playNext())
			} else {
				dispatch(setIsPlaying(false))
			}
		}
	}, [dispatch, playMode, playList.length])

	// 切换播放/暂停
	const togglePlay = useCallback(() => {
		if (!currentMusic) return
		dispatch(setIsPlaying(!isPlaying))
	}, [dispatch, isPlaying, currentMusic])

	// 上一首
	const handlePrev = useCallback(() => {
		if (!currentMusic) return
		dispatch(playPrev())
	}, [dispatch, currentMusic])

	// 下一首
	const handleNext = useCallback(() => {
		if (!currentMusic) return
		dispatch(playNext())
	}, [dispatch, currentMusic])

	// 进度条点击
	const handleProgressClick = useCallback(
		(e) => {
			if (!progressRef.current || !duration) return
			const rect = progressRef.current.getBoundingClientRect()
			const percent = (e.clientX - rect.left) / rect.width
			const seekTime = percent * duration
			if (audioRef.current) {
				audioRef.current.currentTime = seekTime
				dispatch(setCurrentTime(seekTime))
			}
		},
		[dispatch, duration],
	)

	// 拖动进度条
	const handleDragStart = useCallback(() => setIsDragging(true), [])
	const handleDragEnd = useCallback(() => setIsDragging(false), [])

	// 音量控制
	const handleVolumeChange = useCallback((e) => {
		const newVolume = parseInt(e.target.value)
		setLocalVolume(newVolume)
	}, [])

	// 处理点赞操作
	const handleLike = async () => {
		if (!currentMusic || isLiking) return

		// 检查登录状态
		if (!isLoggedIn) {
			dispatch(showLoginModal())
			return
		}

		try {
			setIsLiking(true)

			// 调用点赞接口
			await doGood({
				musicId: currentMusic.musicId,
			})

			// 更新store中的点赞状态
			dispatch(setHasLike(!hasLike))
		} catch (error) {
			console.error("点赞失败:", error)
			// 可以添加错误提示
		} finally {
			setIsLiking(false)
		}
	}

	// 格式化当前时间
	const formatCurrentTime = (time) => {
		if (!time || isNaN(time)) return "0:00"
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds.toString().padStart(2, "0")}`
	}

	// 计算进度百分比
	const progressPercent = duration ? (currentTime / duration) * 100 : 0

	// 没有歌曲时隐藏播放器
	if (!currentMusic) {
		return null
	}

	// 播放模式图标
	const playModeIcon =
		playMode === "repeat" ? (
			<Repeat1 size={18} className="text-slate-400" />
		) : (
			<List size={18} className="text-slate-400 hover:text-white" />
		)

	return (
		<>
			{/* 隐藏的音频元素 */}
			<audio
				ref={audioRef}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onEnded={handleEnded}
				onError={(e) => console.error("音频错误:", e)}
			/>

			{/* 小圆形播放按钮 - 当不在/home和/music路由时显示 */}
			{currentMusic && !["home", "music"].includes(location.pathname.split("/")[1]) ? (
				<div
					className="fixed bottom-8 right-8 w-16 h-16 rounded-full overflow-hidden cursor-pointer shadow-lg shadow-system-primary/30 transition-all duration-300 hover:scale-110 z-50"
					onClick={togglePlay}
					style={{
						backgroundImage: `url(${
							currentMusic.cover != null
								? getResource(currentMusic.cover)
								: import.meta.env.VITE_MUSIC_DEFAULT_COVER
						})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				>
					<div className="w-full h-full bg-gradient-to-r from-system-primary/50 to-system-secondary/50 flex items-center justify-center">
						{isPlaying ? (
							<Pause size={24} fill="white" />
						) : (
							<Play size={24} fill="white" className="ml-1" />
						)}
					</div>
				</div>
			) : (
				<div
					className={`h-24 bg-gradient-to-r from-slate-950/90 to-slate-900/90 backdrop-blur-xl border-t border-slate-800/50 px-8 flex items-center justify-between z-30 transition-all duration-300 ease-in-out absolute bottom-0 left-0 right-0 shadow-lg shadow-system-primary/5`}
				>
					{/* 当前歌曲信息 */}
					<div className="flex items-center gap-4 w-1/4">
						<div
							className={`w-14 h-14 rounded-lg overflow-hidden relative flex-shrink-0 ${
								isPlaying ? "animate-pulse-slow" : ""
							}`}
						>
							<img
								src={
									currentMusic.cover != null
										? getResource(currentMusic.cover)
										: import.meta.env.VITE_MUSIC_DEFAULT_COVER
								}
								alt="Cover"
								className="w-full h-full object-cover shadow-lg shadow-system-primary/20 border border-system-primary/20"
							/>
						</div>
						<div className="min-w-0">
							<h4
								className="text-white font-medium truncate hover:underline cursor-pointer"
								onClick={() => navigate(`/music/${currentMusic.musicId}`)}
							>
								{currentMusic.musicTitle}
							</h4>
							<p
								className="text-slate-400 text-sm truncate hover:text-slate-300 cursor-pointer"
								onClick={() => navigate(`/user/${currentMusic.userId}`)}
							>
								{currentMusic.nickName}
							</p>
						</div>
						<button
							className="transition-all duration-300 ml-2 hover:scale-110"
							onClick={handleLike}
							disabled={isLiking}
						>
							<Heart
								size={18}
								className={`${hasLike ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500"}`}
							/>
						</button>
					</div>

					{/* 播放控制 */}
					<div className="flex flex-col items-center gap-2 flex-1 max-w-lg">
						<div className="flex items-center gap-6">
							<button
								onClick={handlePrev}
								className={`text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 ${
									!currentMusic ||
									playList.length === 0 ||
									!playList.some((item) => item.musicId === currentMusic.musicId)
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
								title="上一首"
								disabled={
									!currentMusic ||
									playList.length === 0 ||
									!playList.some((item) => item.musicId === currentMusic.musicId)
								}
							>
								<SkipBack size={20} />
							</button>
							<button
								onClick={togglePlay}
								className="w-10 h-10 rounded-full bg-gradient-to-r from-system-primary to-system-secondary text-white flex items-center justify-center shadow-lg shadow-system-primary/30 hover:shadow-xl hover:shadow-system-primary/50 transition-all duration-300 hover:scale-105"
								title={isPlaying ? "暂停" : "播放"}
							>
								{isPlaying ? (
									<Pause size={20} fill="currentColor" />
								) : (
									<Play size={20} fill="currentColor" className="ml-1" />
								)}
							</button>
							<button
								onClick={handleNext}
								className={`text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 ${
									!currentMusic ||
									playList.length === 0 ||
									!playList.some((item) => item.musicId === currentMusic.musicId)
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
								title="下一首"
								disabled={
									!currentMusic ||
									playList.length === 0 ||
									!playList.some((item) => item.musicId === currentMusic.musicId)
								}
							>
								<SkipForward size={20} />
							</button>
						</div>
						{/* 进度条 */}
						<div className="w-full flex items-center gap-3 text-xs text-slate-400 font-mono">
							<span>{formatCurrentTime(currentTime)}</span>
							<div
								ref={progressRef}
								className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer group hover:bg-slate-600 transition-colors"
								onClick={handleProgressClick}
								onMouseDown={handleDragStart}
								onMouseUp={handleDragEnd}
								onMouseLeave={handleDragEnd}
							>
								<div
									className="h-full bg-gradient-to-r from-system-primary to-system-secondary rounded-full group-hover:from-system-primary-lighter group-hover:to-system-secondary-lighter relative transition-all"
									style={{ width: `${progressPercent}%` }}
								>
									<div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-sm transition-opacity" />
								</div>
							</div>
							<span>{formatDuration(duration)}</span>
						</div>
					</div>

					{/* 额外控制 */}
					<div className="flex items-center gap-4 w-1/4 justify-end">
						<div className="relative">
							<button
								className="text-slate-400 hover:text-white cursor-pointer transition-all duration-300 hover:scale-110"
								onClick={() => setShowVolume(!showVolume)}
							>
								{localVolume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
							</button>
							{showVolume && (
								<div className="absolute bottom-full left-0 mb-2 p-3 bg-slate-800 rounded-lg shadow-lg">
									<input
										type="range"
										min="0"
										max="100"
										value={localVolume}
										onChange={handleVolumeChange}
										className="w-24 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer hover:bg-slate-500 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
										style={{
											background: `linear-gradient(to right, var(--system-primary) 0%, var(--system-primary) ${localVolume}%, var(--system-surface-light) ${localVolume}%, var(--system-surface-light) 100%)`,
										}}
									/>
								</div>
							)}
						</div>
						<button
							onClick={() => {
								dispatch(togglePlayMode())
							}}
							className="transition-all duration-300 hover:text-white hover:scale-110"
							title={playMode === "repeat" ? "单曲循环" : "顺序播放"}
						>
							{playModeIcon}
						</button>

						{/* 播放列表 */}
						<div className="relative">
							<button
								className="text-slate-400 hover:text-white cursor-pointer transition-all duration-300 hover:scale-110"
								onClick={() => setShowPlaylist(!showPlaylist)}
							>
								<ListMusic size={20} />
							</button>
							{showPlaylist && (
								<div className="absolute z-40 bottom-full right-0 mb-2 w-80 max-h-96 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-xl shadow-xl p-3 overflow-y-auto border border-slate-700">
									<h4 className="text-white font-bold mb-3">播放列表</h4>
									{playList.length === 0 ? (
										<p className="text-slate-400 text-center py-4">
											播放列表为空
										</p>
									) : (
										<ul>
											{playList.map((song, index) => (
												<li
													key={song.musicId}
													className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
														currentMusic?.musicId === song.musicId
															? "bg-gradient-to-r from-system-primary/30 to-system-secondary/30 text-white border-l-2 border-system-primary"
															: "hover:bg-slate-700/80 hover:shadow-md text-slate-300"
													}`}
													onClick={() => {
														dispatch(setCurrentMusic(song))
														dispatch(setIsPlaying(true))
													}}
												>
													<div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
														<img
															src={
																song.cover
																	? getResource(song.cover)
																	: import.meta.env
																			.VITE_MUSIC_DEFAULT_COVER
															}
															alt={song.musicTitle}
															className="w-full h-full object-cover"
														/>
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">
															{song.musicTitle}
														</p>
														<p className="text-xs text-slate-400 truncate">
															{song.nickName}
														</p>
													</div>
													<div className="flex items-center gap-2">
														{currentMusic?.musicId === song.musicId &&
															isPlaying && (
																<div className="flex items-center gap-1 h-4">
																	<div className="w-1 bg-white rounded-full animate-[bounce_1s_infinite] h-1"></div>
																	<div className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_100ms] h-3"></div>
																	<div className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_200ms] h-2"></div>
																</div>
															)}
														<button
															onClick={(e) => {
																e.stopPropagation()
																dispatch(
																	removeFromPlayList(
																		song.musicId,
																	),
																)
															}}
															className="text-slate-500 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
															title="移除"
														>
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
																<path d="M3 6h18" />
																<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
																<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
															</svg>
														</button>
													</div>
												</li>
											))}
										</ul>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	)
}
