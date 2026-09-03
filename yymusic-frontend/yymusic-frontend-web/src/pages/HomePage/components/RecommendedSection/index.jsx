import { useState, useEffect, useMemo } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { Heart, Headphones, Play, ListMusic } from "lucide-react"
import PropTypes from "prop-types"
import { useSelector, useDispatch } from "react-redux"
import { loadCommendMusic, doGood } from "@/services/music"
import { getResource } from "../../../../services/file"
import { formatDuration } from "../../../../utils/format"
import { setHasLike, showLoginModal, addToPlayList } from "@/store"
import LoginModal from "@/components/LoginModal"

/**
 * RecommendedCard 推荐卡片组件
 * @param {object} props
 * @param {object} props.song - 歌曲信息
 * @param {boolean} props.isPlaying - 是否正在播放
 * @param {function} props.onPlay - 播放事件
 */
export function RecommendedCard({ song, isPlaying = false, onPlay }) {
	const navigate = useNavigate()
	const dispatch = useDispatch()

	// 获取登录状态
	const { isLoggedIn } = useSelector((state) => state.user)
	// 获取播放列表
	const { playList } = useSelector((state) => state.musicPlay)
	// 检查歌曲是否在播放列表中
	const isInPlayList = playList.some((item) => item.musicId === song.musicId)

	// 点赞状态
	const [isLiked, setIsLiked] = useState(song.doGood)
	const [likeCount, setLikeCount] = useState(song.goodCount || 0)
	const [isLoading, setIsLoading] = useState(false)

	// 处理播放数量格式
	const formatPlayCount = (count) => {
		if (!count) return "0"
		if (count >= 10000) {
			return (count / 10000).toFixed(1) + "万"
		}
		return count.toString()
	}

	// 处理点赞
	const handleLike = async (e) => {
		e.stopPropagation()

		if (!isLoggedIn) {
			dispatch(showLoginModal())
			return
		}

		if (isLoading) return

		setIsLoading(true)
		try {
			// 先更新本地状态，提供即时反馈
			const newLiked = !isLiked
			setIsLiked(newLiked)
			setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1))

			// 调用点赞API
			await doGood({ musicId: song.musicId })
		} catch (error) {
			console.error("点赞失败:", error)
			// 回滚本地状态
			setIsLiked(!isLiked)
			setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1))
		} finally {
			setIsLoading(false)
		}
	}

	const formattedTime = useMemo(() => {
		return formatDuration(song.duration)
	}, [song.duration])

	return (
		<div
			className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-xl hover:shadow-system-primary/30 transition-all duration-300 transform hover:-translate-y-1"
			onClick={() => {
				dispatch(setHasLike(song.doGood))
				navigate(`/music/${song.musicId}?from=home`)
			}}
		>
			<img
				src={
					song.cover ? getResource(song.cover) : import.meta.env.VITE_MUSIC_DEFAULT_COVER
				}
				alt={song.musicTitle}
				className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
			/>

			{/* 播放次数标签 */}
			<div className="absolute top-2 right-2 text-xs font-bold text-white bg-system-primary/70 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-md">
							<Headphones size={10} /> {formatPlayCount(song.playCount)}
						</div>

			<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
				<h3 className="text-2xl font-bold mb-1 text-white">
					{song.musicTitle}
				</h3>

				{/* 作者信息 */}
				<div className="flex items-center gap-2 mb-2">
					<img
						src={getResource(song.avatar)}
						alt="creator"
						className="w-5 h-5 rounded-full border border-system-primary/30 shadow-sm"
					/>
					<span className="text-slate-300 hover:text-white transition-colors">
						{song.nickName}
					</span>
				</div>

				{/* 歌曲信息和操作按钮 */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{/* 播放按钮 */}
						<button
							onClick={(e) => {
								e.stopPropagation()
								onPlay(song)
							}}
							className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 ${isPlaying ? "bg-white text-system-primary" : "bg-system-primary text-white hover:bg-system-primary-light"}`}
						>
							{isPlaying ? (
								// 播放中的动态音柱效果
								<div className="flex items-center justify-center gap-1 h-5">
									<div className="w-1 bg-system-primary rounded-full animate-[bounce_1s_infinite] h-2"></div>
									<div className="w-1 bg-system-primary rounded-full animate-[bounce_1s_infinite_100ms] h-4"></div>
									<div className="w-1 bg-system-primary rounded-full animate-[bounce_1s_infinite_200ms] h-3"></div>
								</div>
							) : (
								// 暂停/普通状态图标
								<Play size={22} fill="currentColor" className="ml-1" />
							)}
						</button>

						{/* 点赞按钮 */}
						<button
							onClick={handleLike}
							onPlay={(e) => e.stopPropagation()}
							className={`flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all hover:bg-black/70 ${isLiked ? "text-red-500 hover:scale-105" : "text-slate-300 hover:text-white hover:scale-105"}`}
						>
							<Heart size={14} fill={isLiked ? "currentColor" : "none"} />
							<span className="text-sm">{formatPlayCount(likeCount)}</span>
						</button>

						{/* 播放列表按钮 */}
						<button
							onClick={(e) => {
								e.stopPropagation()
								dispatch(addToPlayList(song))
							}}
							className="bg-black/50 backdrop-blur-sm p-2.5 rounded-full transition-all hover:bg-black/70 hover:scale-105"
						>
							<ListMusic
								size={16}
								className={
									isInPlayList
										? "text-yellow-400"
										: "text-slate-300 hover:text-white"
								}
								fill={isInPlayList ? "currentColor" : "none"}
							/>
						</button>
					</div>

					<div className="flex items-center gap-3">
						{/* 歌曲时长 */}
						<span className="text-sm text-slate-200 font-mono bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-system-primary/20">
						{formattedTime}
					</span>
					</div>
				</div>
			</div>
		</div>
	)
}

RecommendedCard.propTypes = {
	song: PropTypes.object.isRequired,
	isPlaying: PropTypes.bool,
	onPlay: PropTypes.func,
}

/**
 * RecommendedSection 推荐区域组件
 */
export default function RecommendedSection() {
	// 从父组件获取上下文数据
	const context = useOutletContext()
	const { currentMusic, isPlaying, onPlaySong, onTogglePlay } = context
	const [recommendedMusic, setRecommendedMusic] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const navigate = useNavigate()

	// 加载推荐音乐
	useEffect(() => {
		const fetchRecommendedMusic = async () => {
			try {
				setLoading(true)
				// 首页调用时传入isRandomTwo: true，只返回随机两个推荐音乐
				const response = await loadCommendMusic({ isRandomTwo: true })
				if (response) {
					setRecommendedMusic(response)
				} else {
					setError("加载推荐音乐失败")
				}
			} catch (err) {
				console.error("加载推荐音乐失败:", err)
				setError("网络错误，请稍后重试")
			} finally {
				setLoading(false)
			}
		}

		fetchRecommendedMusic()
	}, [])

	return (
		<section className="mt-8 mb-10">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-system-primary-lighter flex items-center gap-2">
					<span className="w-3 h-10 rounded-full bg-gradient-to-b from-system-primary to-system-secondary block shadow-lg"></span>
					为你推荐
				</h2>
				<button
					className="px-4 py-2 text-xs font-medium bg-gradient-to-r from-system-primary/20 to-system-secondary/20 hover:from-system-primary/30 hover:to-system-secondary/30 text-system-primary-lighter hover:text-white rounded-full transition-all duration-300 border border-system-primary/30"
					onClick={() => {
						navigate("/recommended")
					}}
				>
					查看全部
				</button>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="h-48 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 animate-pulse border border-slate-700/50"
						></div>
					))}
				</div>
			) : error ? (
				<div className="flex items-center justify-center h-48 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-700/50">
					<p className="text-slate-400">
						<span className="text-red-400">⚠️</span> {error}
					</p>
				</div>
			) : recommendedMusic.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{recommendedMusic.map((song) => {
						return (
							<RecommendedCard
								key={song.musicId}
								song={song}
								isPlaying={isPlaying && currentMusic?.musicId === song.musicId}
								onPlay={(s) => {
									if (currentMusic?.musicId === s.musicId) {
										onTogglePlay()
									} else {
										onPlaySong(s)
									}
								}}
							/>
						)
					})}
				</div>
			) : (
				// 空状态样式
				<div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl text-center p-8 border border-slate-700/50">
					<div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700/50 to-system-primary/30 flex items-center justify-center mb-4 shadow-lg">
						<ListMusic className="w-10 h-10 bg-clip-text text-transparent bg-gradient-to-r from-system-primary-lighter to-system-secondary" />
					</div>
					<h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-system-primary-lighter mb-2">
						暂无推荐音乐
					</h3>
					<p className="text-slate-400 max-w-md">
						目前还没有推荐的音乐，稍等片刻或稍后再来查看吧
					</p>
				</div>
			)}
		</section>
	)
}

RecommendedSection.propTypes = {
	// 不再需要propTypes，因为使用useOutletContext
}
