import { Heart, Headphones, Play, ListMusic } from "lucide-react"
import { useState, useMemo } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import PropTypes from "prop-types"
import { getResource } from "../../../../services/file"
import { doGood } from "../../../../services/music"
import LoginModal from "@/components/LoginModal"
import { formatDuration } from "../../../../utils/format"
import { setHasLike, showLoginModal, addToPlayList } from "@/store"

/**
 * MusicCard 音乐卡片组件
 * @param {object} props
 * @param {object} props.song - 歌曲信息
 */
export default function MusicCard({ song, isUserPage = false }) {
	// 从父组件获取上下文数据
	const context = useOutletContext()
	const { currentMusic, isPlaying: globalIsPlaying, onPlaySong, onTogglePlay } = context

	const navigate = useNavigate()

	const dispatch = useDispatch()

	// 判断当前歌曲是否正在播放
	const isPlaying = globalIsPlaying && currentMusic?.musicId === song.musicId
	// 获取登录状态
	const { isLoggedIn } = useSelector((state) => state.user)
	// 获取播放列表
	const { playList } = useSelector((state) => state.musicPlay)

	// 点赞状态
	const [isLiked, setIsLiked] = useState(song.doGood)
	const [likeCount, setLikeCount] = useState(song.goodCount || 0)
	const [isLoading, setIsLoading] = useState(false)

	// 检查歌曲是否在播放列表中
	const isInPlayList = playList.some((item) => item.musicId === song.musicId)

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
			// 可以在这里添加用户提示
		} finally {
			setIsLoading(false)
		}
	}

	const formattedTime = useMemo(() => {
		return formatDuration(song.duration)
	}, [song.duration])

	return (
		<div>
			<div className="group flex flex-col gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-system-primary/10 backdrop-blur-sm">
				{/* 封面区 */}
				<div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg bg-slate-800 border border-slate-700/50">
					<img
						src={
							song.cover
								? getResource(song.cover)
								: import.meta.env.VITE_MUSIC_DEFAULT_COVER
						}
						alt={song.musicTitle}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
					{/* 悬浮遮罩与播放按钮 */}
					<div
						className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? "opacity-100 ring-2 ring-inset ring-system-primary" : "opacity-0 group-hover:opacity-100"}`}
					>
						{/* 更新后的按钮设计，与上方推荐区一致 */}
						<button
																		onClick={() => {
																			// 支持点击卡片进行播放/暂停切换
																			if (currentMusic?.musicId === song.musicId) {
																				onTogglePlay()
																			} else {
																				onPlaySong(song)
																			}
																		}}
																		className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all ${isPlaying ? "bg-white text-system-primary" : "bg-system-primary text-white hover:bg-system-primary-light"}`}
																	>
																		{isPlaying ? (
																			<div className="flex items-center justify-center gap-1 h-5">
																				<div className="w-1 bg-system-primary rounded-full animate-[bounce_1s_infinite] h-2"></div>
																				<div className="w-1 bg-system-primary rounded-full animate-[bounce_1s_infinite_100ms] h-4"></div>
																				<div className="w-1 bg-system-primary rounded-full animate-[bounce_1s_infinite_200ms] h-3"></div>
																			</div>
																		) : (
																			<Play size={24} fill="currentColor" className="ml-1" />
																		)
																		}
																	</button>
					</div>
					<div className="absolute top-2 right-2 text-xs font-bold text-white bg-system-primary/80 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 border border-system-primary/30">
										<Headphones size={10} className="text-system-primary-lighter" />{" "}
										{formatPlayCount(song.playCount)}
									</div>
				</div>

				{/* 信息区 */}
				<div className="flex-1">
					<h3
										onClick={() => {
											dispatch(setHasLike(song.doGood))
											navigate(`/music/${song.musicId}?from=home`)
										}}
										className="cursor-pointer font-bold text-white truncate mb-1 group-hover:text-system-primary transition-colors"
									>
										{song.musicTitle}
									</h3>

					{/* 作者信息小行 */}
					{!isUserPage && (
						<div className="flex items-center gap-2 mb-2">
							<img
								src={getResource(song.avatar)}
								alt="creator"
								className="w-5 h-5 rounded-full border border-slate-600 cursor-pointer"
								onClick={() => navigate(`/user/${song.userId}`)}
							/>
							<span
								className="text-xs text-slate-400 truncate hover:text-system-primary cursor-pointer transition-colors"
								onClick={() => navigate(`/user/${song.userId}`)}
							>
								{song.nickName}
							</span>
						</div>
					)}

					{/* 底部数据 */}
					<div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-2 mt-1 bg-slate-800/50 rounded-lg p-2">
						<div className="flex items-center gap-3">
							<span
								onClick={handleLike}
								className={`flex items-center gap-1 cursor-pointer transition-all ${isLiked ? "text-red-400" : "hover:text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded-full"}`}
							>
								<Heart
									size={15}
									fill={isLiked ? "currentColor" : "none"}
									className={
										isLiked
											? "animate-[bounce_0.5s_ease-in-out]"
											: "hover:scale-110"
									}
								/>
								{formatPlayCount(likeCount)}
							</span>
							<button
								onClick={(e) => {
									e.stopPropagation()
									dispatch(addToPlayList(song))
								}}
								className={`flex items-center gap-1 cursor-pointer transition-all ${isInPlayList ? "text-yellow-400" : "text-slate-500 hover:text-system-primary hover:bg-system-primary/10 px-1.5 py-0.5 rounded-full"}`}
							>
								<ListMusic
									size={15}
									fill={isInPlayList ? "currentColor" : "none"}
									className="hover:scale-110"
								/>
							</button>
						</div>
						<span className="font-mono bg-system-primary/20 text-system-primary-lighter px-1.5 py-0.5 rounded-full border border-system-primary/30">
										{formattedTime}
									</span>
					</div>
				</div>
			</div>
		</div>
	)
}

// MusicCard.propTypes = {
// 	song: PropTypes.shape({
// 		musicId: PropTypes.string.isRequired,
// 		musicTitle: PropTypes.string.isRequired,
// 		cover: PropTypes.string,
// 		avatar: PropTypes.string,
// 		duration: PropTypes.number,
// 		playCount: PropTypes.number,
// 		goodCount: PropTypes.number,
// 		commendType: PropTypes.number,
// 		audioPath: PropTypes.string,
// 		lyrics: PropTypes.string,
// 		musicStatus: PropTypes.number,
// 		musicType: PropTypes.number,
// 		taskId: PropTypes.string,
// 		userId: PropTypes.string,
// 		nickName: PropTypes.string,
// 		creationId: PropTypes.string,
// 		createTime: PropTypes.string,
// 		doGood: PropTypes.number,
// 	}).isRequired,
// 	isPlaying: PropTypes.bool,
// 	onClick: PropTypes.func,
// }
