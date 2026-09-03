import React, { useRef, useState, useEffect, useCallback } from "react"
import { Clock, Calendar, Play, Pause, ListMusic } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getResource } from "../../services/file"
import ImageCropModal from "../ImageCropModal"
import { useSelector, useDispatch } from "react-redux"
import { formatDuration } from "../../utils/format"
import { addToPlayList } from "../../store"

/**
 * 歌曲卡片组件
 */
export default function SongCard({
	song,
	onRename,
	onDelete,
	onChangeCover = () => {},
	onPlay = () => {},
	onPause = () => {},
}) {
	const fileInputRef = useRef(null)
	const titleInputRef = useRef(null)
	const [isEditing, setIsEditing] = useState(false)
	const [editTitle, setEditTitle] = useState(song.musicTitle)
	const cardRef = useRef(null)
	const [showCropModal, setShowCropModal] = useState(false)
	const [selectedFile, setSelectedFile] = useState(null)
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { currentMusic, isPlaying, playList } = useSelector((state) => state.musicPlay)
	// 检查歌曲是否在播放列表中
	const isInPlayList = playList.some((item) => item.musicId === song.musicId)

	// 处理歌曲名点击跳转
	const handleTitleClick = () => {
		if (!isEditing) {
			navigate(`/music/${song.musicId}?from=profile`)
		}
	}

	// 处理更换图片点击事件
	const handleChangeCoverClick = () => {
		fileInputRef.current?.click()
	}

	const formatDate = (dateString) => {
		if (!dateString) return ""
		const date = new Date(dateString)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const day = String(date.getDate()).padStart(2, "0")
		return `${year}-${month}-${day}`
	}

	const formatLyrics = (lyrics) => {
		if (!lyrics) return ""
		if (typeof lyrics === "string") {
			lyrics = JSON.parse(lyrics)
		}
		return Array.isArray(lyrics) ? lyrics.map((line) => line.text).join(" ") : lyrics
	}

	// 处理重命名点击
	const handleRenameClick = () => {
		setIsEditing(true)
		// 在下一个渲染周期后聚焦输入框
		setTimeout(() => {
			titleInputRef.current?.focus()
			// 选中整个文本
			titleInputRef.current?.select()
		}, 100)
	}

	// 处理保存编辑
	const handleSaveEdit = () => {
		if (editTitle && editTitle.trim() !== "") {
			onRename(song.musicId, editTitle.trim())
		}
		setIsEditing(false)
	}

	// 处理取消编辑
	const handleCancelEdit = () => {
		setEditTitle(song.musicTitle)
		setIsEditing(false)
	}

	// 处理键盘事件
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSaveEdit()
		} else if (e.key === "Escape") {
			handleCancelEdit()
		}
	}

	// 点击外部保存编辑
	const handleClickOutside = useCallback(
		(event) => {
			if (cardRef.current && !cardRef.current.contains(event.target)) {
				handleSaveEdit()
			}
		},
		[editTitle],
	)

	// 添加点击外部监听
	useEffect(() => {
		if (isEditing) {
			document.addEventListener("mousedown", handleClickOutside)
			return () => {
				document.removeEventListener("mousedown", handleClickOutside)
			}
		}
	}, [isEditing, handleClickOutside])

	// 处理文件选择事件
	const handleFileSelect = (e) => {
		const file = e.target.files[0]
		if (file) {
			// 检查文件类型和大小
			if (!file.type.startsWith("image/")) {
				alert("请选择图片文件")
				return
			}
			if (file.size > 5 * 1024 * 1024) {
				alert("图片大小不能超过5MB")
				return
			}
			// 保存选择的文件并显示裁剪弹窗
			setSelectedFile(file)
			setShowCropModal(true)
			// 清空文件输入
			e.target.value = ""
		}
	}

	// 处理裁剪确认
	const handleCropConfirm = async (croppedFile) => {
		// 调用父组件的onChangeCover函数（如果存在）
		if (onChangeCover) {
			await onChangeCover(song.musicId, croppedFile)
		}
		// 关闭裁剪弹窗
		setShowCropModal(false)
		setSelectedFile(null)
	}

	// 处理裁剪取消
	const handleCropCancel = () => {
		setShowCropModal(false)
		setSelectedFile(null)
	}
	return (
		<>
			<div
				ref={cardRef}
				className="group bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-slate-700/40 hover:shadow-lg hover:border-system-primary/50 transition-all duration-300 flex items-start gap-5"
			>
				{/* 歌曲封面 */}
				<div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 group-hover:border-system-primary/40 transition-all duration-300 shadow-md">
					<img
						src={
							song.cover
								? getResource(song.cover)
								: import.meta.env.VITE_MUSIC_DEFAULT_COVER
						}
						alt={song.musicTitle}
						className="w-full h-full object-cover"
					/>
					<div
						className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"
						onClick={handleChangeCoverClick}
					>
						<div className="text-center">
							<div className="text-white font-medium mb-1">更换图片</div>
							<div className="text-slate-300 text-xs">点击上传新封面</div>
						</div>
					</div>
					{/* 隐藏的文件输入框 */}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileSelect}
					/>
				</div>

				{/* 歌曲信息 */}
				<div className="flex-1 min-w-0 py-1">
					<div className="flex items-center gap-3 mb-2">
						{isEditing ? (
							<input
								ref={titleInputRef}
								type="text"
								value={editTitle}
								onChange={(e) => setEditTitle(e.target.value)}
								onKeyDown={handleKeyDown}
								className="text-lg font-bold text-white bg-slate-800/70 border border-system-primary/50 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-system-primary/60 transition-all duration-200"
								placeholder="请输入歌曲名"
							/>
						) : (
							<div className="flex items-center gap-2">
								<h3
									className="text-lg font-bold text-white truncate cursor-pointer hover:text-sky-400 transition-colors"
									title={song.musicTitle}
									onClick={handleTitleClick}
								>
									{song.musicTitle}
								</h3>

								{isPlaying && currentMusic?.musicId === song.musicId ? (
									<button
										onClick={() => onPause(song)}
										className="p-1.5 rounded-full bg-system-primary/20 hover:bg-system-primary/30 transition-all duration-200 hover:scale-105"
										title="暂停"
									>
										<Pause className="w-4 h-4 text-system-primary-lighter" />
									</button>
								) : (
									<button
										onClick={() => onPlay(song)}
										className="p-1.5 rounded-full bg-system-primary/20 hover:bg-system-primary/30 transition-all duration-200 hover:scale-105"
										title="播放"
									>
										<Play className="w-4 h-4 text-system-primary-lighter" />
									</button>
								)}

								{/* 播放列表按钮 */}
								<button
									onClick={() => dispatch(addToPlayList(song))}
									className="p-1.5 rounded-full bg-system-primary/20 hover:bg-system-primary/30 transition-all duration-200 hover:scale-105"
									title={isInPlayList ? "从播放列表中移除" : "添加到播放列表"}
								>
									<ListMusic
										size={16}
										className={
											isInPlayList
												? "text-system-secondary-lighter"
												: "text-system-primary-lighter"
										}
										fill={isInPlayList ? "currentColor" : "none"}
									/>
								</button>
							</div>
						)}
					</div>

					{/* 歌词展示 (带省略号) */}
					<p className="text-sm text-slate-400 mb-3 line-clamp-2 leading-relaxed h-[42px] text-opacity-80">
						{formatLyrics(song.lyrics)}
					</p>

					{/* 底部元数据 */}
					<div className="flex items-center gap-3 text-xs text-slate-400/70">
						<div className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full">
							<Clock className="w-3 h-3" />
							<span>{formatDuration(song.duration)}</span>
						</div>
						<div className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full">
							<Calendar className="w-3 h-3" />
							<span>{formatDate(song.createTime)}</span>
						</div>
					</div>
				</div>

				{/* 操作按钮组 */}
				<div className="flex flex-col gap-2 border-l border-slate-700/50 pl-4 ml-2 self-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
					<button
						onClick={handleRenameClick}
						className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-system-primary-lighter hover:bg-system-primary-dark/20 rounded-md transition-all duration-200"
					>
						重命名
					</button>
					<button
						onClick={() => onDelete(song.musicId)}
						className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-all duration-200"
					>
						删除
					</button>
				</div>
			</div>

			{/* 图片裁剪弹窗 */}
			<ImageCropModal
				isOpen={showCropModal}
				onClose={handleCropCancel}
				onConfirm={handleCropConfirm}
				imageFile={selectedFile}
			/>
		</>
	)
}
