import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Music, RefreshCw } from "lucide-react"
import SongCard from "../../components/SongCard"
import { useNavigate } from "react-router-dom"
import ConfirmModal from "../../components/ConfirmModal"
import { deleteSong } from "../../store/index.js"
import { changeMusicTitle, uploadMusicCover, delMusic, loadMyMusic } from "../../services/music.js"
import {
	renameSong,
	loadMyMusicStart,
	loadMyMusicSuccess,
	loadMyMusicFailure,
	setCurrentMusic,
	setIsPlaying,
} from "../../store/index.js"
import message from "../../utils/message.jsx"
import { getResource } from "../../services/file.js"

/**
 * 我的作品页面组件
 */
export default function MyProjectPage() {
	const dispatch = useDispatch()
	const { songs, loading } = useSelector((state) => state.musicGen)
	const navigate = useNavigate()

	// 分类状态：0-我的作品，1-我喜欢的作品
	const [activeTab, setActiveTab] = useState(0)
	// 确认删除的状态
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [songToDelete, setSongToDelete] = useState(null)
	// 分页状态 - 为每个分类单独维护
	const [pagination, setPagination] = useState({
		works: {
			pageNo: 1,
			pageSize: 10,
			pageTotal: 0,
		},
		liked: {
			pageNo: 1,
			pageSize: 10,
			pageTotal: 0,
		},
	})

	// 播放音乐
	const handlePlay = (song) => {
		dispatch(setCurrentMusic(song))
		dispatch(setIsPlaying(true))
	}

	const handlePause = () => {
		dispatch(setIsPlaying(false))
		dispatch(setCurrentMusic(null))
	}
	// 作品数据
	const [worksData, setWorksData] = useState([])
	// 喜欢的作品数据
	const [likedData, setLikedData] = useState([])
	const [worksDataTotal, setWorksDataTotal] = useState(0)
	const [likedDataTotal, setLikedDataTotal] = useState(0)
	// 标记数据是否已加载
	const [worksLoaded, setWorksLoaded] = useState(false)
	const [likedLoaded, setLikedLoaded] = useState(false)

	// 加载作品数据
	const loadWorks = async (isLiked = false, pageNo = 1, refresh = false) => {
		if (loading) return

		dispatch(loadMyMusicStart())

		try {
			const data = await loadMyMusic({
				pageNo,
				queryLikeMusic: isLiked,
			})

			if (isLiked) {
				// 如果是刷新或者首次加载，替换数据，否则追加
				if (refresh || pageNo === 1) {
					setLikedData(data.list)
				} else {
					setLikedData([...likedData, ...data.list])
				}
				setLikedDataTotal(data.totalCount)
				setLikedLoaded(true)
				// 更新喜欢的作品分页状态
				setPagination((prev) => ({
					...prev,
					liked: {
						pageNo,
						pageSize: data.pageSize,
						pageTotal: data.pageTotal,
					},
				}))
			} else {
				// 如果是刷新或者首次加载，替换数据，否则追加
				if (refresh || pageNo === 1) {
					setWorksData(data.list)
				} else {
					setWorksData([...worksData, ...data.list])
				}
				setWorksDataTotal(data.totalCount)
				setWorksLoaded(true)
				// 更新我的作品分页状态
				setPagination((prev) => ({
					...prev,
					works: {
						pageNo,
						pageSize: data.pageSize,
						pageTotal: data.pageTotal,
					},
				}))
			}

			dispatch(loadMyMusicSuccess(data))
		} catch (error) {
			console.error("加载作品失败:", error)
			message.error(error || "加载作品失败")
			dispatch(loadMyMusicFailure())
		}
	}

	// 切换分类
	const handleTabChange = (tabIndex) => {
		setActiveTab(tabIndex)
		// 切换tab时不重新加载数据，使用已缓存的数据
	}

	// 刷新当前分类数据
	const handleRefresh = () => {
		loadWorks(activeTab === 1, 1, true)
	}

	// 打开确认删除对话框
	const handleDelete = (musicId) => {
		setSongToDelete(musicId)
		setConfirmModalOpen(true)
	}

	// 确认删除
	const handleConfirmDelete = async () => {
		if (!songToDelete) return

		try {
			// 调用API删除音乐
			await delMusic({ musicId: songToDelete })
			// 本地更新数据
			if (activeTab === 0) {
				setWorksData(worksData.filter((song) => song.musicId !== songToDelete))
				setWorksDataTotal(worksDataTotal - 1)
			} else {
				setLikedData(likedData.filter((song) => song.musicId !== songToDelete))
				setLikedDataTotal(likedDataTotal - 1)
			}
			// 本地更新store
			dispatch(deleteSong(songToDelete))
			message.success("删除成功")
		} catch (error) {
			console.error("删除音乐失败:", error)
			message.error(error || "删除音乐失败")
		} finally {
			// 关闭确认对话框
			setConfirmModalOpen(false)
			setSongToDelete(null)
		}
	}

	// 取消删除
	const handleCancelDelete = () => {
		setConfirmModalOpen(false)
		setSongToDelete(null)
	}

	const handleRename = async (musicId, newTitle) => {
		const currentData = activeTab === 0 ? worksData : likedData
		const songToRename = currentData.find((s) => s.musicId === musicId)
		if (!songToRename) return

		// 检查新标题是否有效
		if (newTitle && newTitle.trim() !== "" && newTitle !== songToRename.musicTitle) {
			try {
				// 调用API修改音乐标题
				await changeMusicTitle({ musicId, musicTitle: newTitle.trim() })
				dispatch(renameSong({ musicId, newName: newTitle }))
				// 本地更新数据
				if (activeTab === 0) {
					setWorksData(
						worksData.map((song) =>
							song.musicId === musicId ? { ...song, musicTitle: newTitle } : song,
						),
					)
				} else {
					setLikedData(
						likedData.map((song) =>
							song.musicId === musicId ? { ...song, musicTitle: newTitle } : song,
						),
					)
				}
			} catch (error) {
				console.error("修改音乐标题失败:", error)
				message.error(error || "修改音乐标题失败")
			}
		}
	}

	// 更换音乐封面
	const handleChangeCover = async (musicId, file) => {
		try {
			// 调用API上传音乐封面
			const data = await uploadMusicCover({ musicId, cover: file })
			dispatch({
				type: "musicGen/updateSongCover",
				payload: { musicId, cover: data },
			})
			// 本地更新数据
			if (activeTab === 0) {
				setWorksData(
					worksData.map((song) =>
						song.musicId === musicId ? { ...song, cover: data } : song,
					),
				)
			} else {
				setLikedData(
					likedData.map((song) =>
						song.musicId === musicId ? { ...song, cover: data } : song,
					),
				)
			}
		} catch (error) {
			console.error("上传音乐封面失败:", error)
			message.error(error || "上传音乐封面失败")
		}
	}

	// 加载更多作品
	const loadMore = async () => {
		if (loading) return

		const currentPagination = activeTab === 0 ? pagination.works : pagination.liked
		loadWorks(activeTab === 1, currentPagination.pageNo + 1)
	}

	// 初始化加载两个分类的数据
	useEffect(() => {
		// 页面加载时同时加载两个分类的数据
		if (!worksLoaded) {
			loadWorks(false, 1)
		}
		if (!likedLoaded) {
			loadWorks(true, 1)
		}
	}, [worksLoaded, likedLoaded])

	// 获取当前显示的数据
	const currentData = activeTab === 0 ? worksData : likedData

	return (
		<div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 h-full overflow-hidden flex flex-col">
			{/* 顶部栏 */}
			<header className="h-16 bg-slate-900/80 border-b border-system-primary/30 flex items-center justify-between px-8 flex-shrink-0 shadow-lg shadow-system-primary/10">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-system-primary-lighter bg-clip-text">我的作品</h2>
					<button
						onClick={handleRefresh}
						className="p-1.5 rounded-md bg-gradient-to-r from-system-primary/30 to-system-secondary/30 hover:from-system-primary-light/30 hover:to-system-secondary-light/30 transition-all duration-200 border border-system-primary/30"
						title="刷新"
					>
						<RefreshCw className="w-4 h-4 text-system-primary hover:text-system-primary-lighter" />
					</button>
				</div>
			</header>
			{/* 分类标签 */}
			<div className="bg-slate-900/80 border-b border-system-primary/30 flex">
				<div
					className={`px-8 py-4 cursor-pointer transition-all duration-300 ${activeTab === 0 ? "border-b-2 border-system-primary text-system-primary-lighter bg-clip-text font-medium" : "text-white hover:text-system-primary-lighter"}`}
					onClick={() => handleTabChange(0)}
				>
					我的作品
					<span className="bg-gradient-to-r from-system-primary/50 to-system-secondary/50 text-system-primary-lighter text-xs px-2 py-0.5 rounded-full ml-2 border border-system-primary/30">
						{worksDataTotal || 0}
					</span>
				</div>
				<div
					className={`px-8 py-4 cursor-pointer transition-all duration-300 ${activeTab === 1 ? "border-b-2 border-system-primary text-system-primary-lighter bg-clip-text font-medium" : "text-white hover:text-system-primary-lighter"}`}
					onClick={() => handleTabChange(1)}
				>
					我喜欢的作品
					<span className="bg-gradient-to-r from-system-primary/50 to-system-secondary/50 text-system-primary-lighter text-xs px-2 py-0.5 rounded-full ml-2 border border-system-primary/30">
						{likedDataTotal || 0}
					</span>
				</div>
			</div>
			{/* 列表内容区 */}
			<div className="flex-1 overflow-y-auto p-8">
				<div className="max-w-5xl mx-auto space-y-4">
					{currentData?.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-64 text-slate-600">
							<Music className="w-16 h-16 mb-4 opacity-20" />
							<p>
								{activeTab === 0
									? "暂无生成的歌曲，快去左侧创作吧！"
									: "暂无喜欢的歌曲，快去发现喜欢的音乐吧！"}
							</p>
						</div>
					) : (
						<>
							{currentData?.map((song) => (
								<SongCard
									key={song.musicId}
									song={song}
									onRename={handleRename}
									onDelete={handleDelete}
									onChangeCover={handleChangeCover}
									onPlay={handlePlay}
									onPause={handlePause}
								/>
							))}

							{/* 加载更多按钮 */}
							{(() => {
								const currentPagination =
									activeTab === 0 ? pagination.works : pagination.liked
								return currentPagination.pageNo < currentPagination.pageTotal ? (
									<div className="flex justify-center mt-8 mb-8">
										<button
											onClick={loadMore}
											disabled={loading}
											className="px-6 py-2 bg-gradient-to-r from-system-primary to-system-secondary hover:from-system-primary-light hover:to-system-secondary-light text-white rounded-full transition-all duration-300 flex items-center space-x-2 border border-system-primary/30 shadow-2xl shadow-system-primary/30"
										>
											{loading && (
												<svg
													className="animate-spin -ml-1 h-4 w-4 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
											)}
											<span>{loading ? "加载中..." : "加载更多"}</span>
										</button>
									</div>
								) : currentPagination.pageNo > 1 ? (
									<div className="flex justify-center mt-8 mb-8 text-slate-500 text-sm">
										没有更多数据了
									</div>
								) : null
							})()}
						</>
					)}
				</div>
			</div>
			{/* 确认删除弹窗 */}
			<ConfirmModal
				isOpen={confirmModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title="确认删除"
				message="确定要删除这首歌曲吗？此操作不可恢复。"
				confirmText="删除"
				cancelText="取消"
			/>
		</div>
	)
}
