import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Music } from "lucide-react"
import SongCard from "../../../../components/SongCard"
import ConfirmModal from "../../../../components/ConfirmModal"
import { deleteSong, setCurrentMusic, setIsPlaying } from "../../../../store/index.js"
import {
	changeMusicTitle,
	uploadMusicCover,
	delMusic,
	loadMyMusic,
} from "../../../../services/music.js"
import {
	renameSong,
	loadMyMusicStart,
	loadMyMusicSuccess,
	loadMyMusicFailure,
} from "../../../../store/index.js"
import message from "../../../../utils/message.jsx"
import { getResource } from "../../../../services/file.js"

/**
 * 作品库列表组件
 */
export default function SongList() {
	const dispatch = useDispatch()
	const { songs, creatingSongs, loading, pagination } = useSelector((state) => state.musicGen)

	// 确认删除的状态
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [songToDelete, setSongToDelete] = useState(null)

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
		const songToRename = songs.find((s) => s.musicId === musicId)
		if (!songToRename) return

		// 检查新标题是否有效
		if (newTitle && newTitle.trim() !== "" && newTitle !== songToRename.musicTitle) {
			try {
				// 调用API修改音乐标题
				await changeMusicTitle({ musicId, musicTitle: newTitle.trim() })
				dispatch(renameSong({ musicId, newName: newTitle }))
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
		} catch (error) {
			console.error("上传音乐封面失败:", error)
			message.error(error || "上传音乐封面失败")
		}
	}

	// 加载更多歌曲
	const loadMore = async () => {
		if (loading) return

		const nextPage = pagination.pageNo + 1
		dispatch(loadMyMusicStart())

		try {
			const data = await loadMyMusic({ pageNo: nextPage, queryLikeMusic: false })
			dispatch(loadMyMusicSuccess(data))
		} catch (error) {
			console.error("加载更多歌曲失败:", error)
			message.error(error || "加载更多歌曲失败")
			dispatch(loadMyMusicFailure())
		}
	}

	// 播放音乐
	const handlePlay = (song) => {
		dispatch(setCurrentMusic(song))
		dispatch(setIsPlaying(true))
	}

	const handlePause = () => {
		dispatch(setIsPlaying(false))
		dispatch(setCurrentMusic(null))
	}

	return (
		<div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 h-full overflow-hidden flex flex-col">
			{/* 顶部栏 */}
			<header className="h-16 bg-slate-900/80 border-b border-system-primary/30 backdrop-blur-sm flex items-center justify-between px-8 flex-shrink-0 shadow-lg shadow-system-primary/10">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-lg bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
						我的作品库
					</h2>
					<span className="bg-gradient-to-r from-system-primary-dark/30 to-system-secondary-dark/30 text-system-primary-lighter text-xs px-2 py-0.5 rounded-full ml-2 border border-system-primary/30">
						{pagination.totalCount}
					</span>
				</div>
				<div className="text-sm text-slate-300">
					剩余点数:{" "}
					<span className="bg-gradient-to-r from-system-primary to-system-secondary bg-clip-text text-transparent font-bold">
						{useSelector((state) => state.user.integral)}
					</span>
				</div>
			</header>

			{/* 列表内容区 */}
			<div className="flex-1 overflow-y-auto p-8">
				<div className="max-w-5xl mx-auto space-y-4">
					{/* 生成中的音乐 */}
					{creatingSongs?.map((song) => (
						<div
							key={song.musicId}
							className="group bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-4 shadow-sm border border-system-primary/30 hover:shadow-lg hover:border-system-primary/50 transition-all duration-300 flex items-start gap-5 opacity-80 animate-fade-in animate-pulse-slow"
						>
							{/* 歌曲封面 - 生成中 */}
							<div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 ">
								<img
									src={import.meta.env.VITE_MUSIC_DEFAULT_COVER}
									alt={song.musicTitle}
									className="w-full h-full object-cover grayscale"
								/>
								<div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-slate-900/50 to-transparent flex items-center justify-center">
									<div className="text-center">
										<div className="text-white font-medium mb-1 flex items-center justify-center gap-2">
											<span>生成中</span>
											<div className="w-4 h-4 rounded-full border-2 border-system-primary-lighter/50 border-t-system-primary-lighter animate-spin"></div>
										</div>
									</div>
								</div>
								<div className="absolute inset-0 bg-gradient-to-r from-system-primary/10 via-transparent to-system-secondary/10 animate-gradient-x"></div>
							</div>

							{/* 歌曲信息 */}
							<div className="flex-1 min-w-0 py-1">
								<div className="flex items-center gap-3 mb-2">
									<h3 className="text-lg font-bold text-white truncate">
										{song.musicTitle}
									</h3>
									<div className="text text-system-primary-lighter bg-system-primary-dark/30 px-2 py-0.5 rounded animate-pulse border border-system-primary/30">
										正在创作您的音乐...
									</div>
								</div>

								{/* 歌词展示 */}
								<p className="text-sm text-slate-300 mb-3 line-clamp-2 leading-relaxed h-[42px] animate-fade-in">
									{song.lyrics}
								</p>

								{/* 底部元数据 */}
								<div className="flex items-center gap-4 text-xs text-system-primary-lighter">
									<div className="flex items-center gap-2 bg-system-primary-dark/30 px-2 py-1 rounded border border-system-primary/30">
										<div className="w-3 h-3 rounded-full border-2 border-system-primary-lighter/50 border-t-system-primary-lighter animate-spin"></div>
										<span>正在处理...</span>
									</div>
								</div>
							</div>
						</div>
					))}

					{/* 已完成的音乐 */}
					{songs?.length === 0 && creatingSongs?.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-64">
							<Music className="w-16 h-16 mb-4 opacity-30 text-system-primary" />
							<p className="text-slate-300">暂无生成的歌曲，快去左侧创作吧！</p>
						</div>
					) : (
						<>
							{songs?.map((song) => (
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
							{pagination.pageNo < pagination.pageTotal ? (
								<div className="flex justify-center mt-8 mb-8">
									<button
										onClick={loadMore}
										disabled={loading}
										className="px-6 py-2 bg-gradient-to-r from-system-primary-dark/30 to-system-secondary-dark/30 hover:from-system-primary-dark/40 hover:to-system-secondary-dark/40 text-white rounded-full transition-colors duration-300 flex items-center space-x-2 border border-system-primary/30 shadow-lg shadow-system-primary/10"
									>
										{loading && (
											<svg
												className="animate-spin -ml-1 h-4 w-4 text-system-primary"
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
							) : pagination.pageNo > 1 ? (
								<div className="flex justify-center mt-8 mb-8 text-slate-300 text-sm">
									没有更多数据了
								</div>
							) : null}
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
