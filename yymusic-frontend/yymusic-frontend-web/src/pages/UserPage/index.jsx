import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
// 引入新增的API方法
import { getUserInfo, loadUserMusic, updateUserInfo, updatePassword } from "@/services/account"
import { getResource } from "@/services/file"
import MusicCard from "@/pages/HomePage/components/MusicCard"
// 引入图标
import { ArrowLeft, Edit2, Camera, Lock, X, Check } from "lucide-react"
import { setUserInfo as setUserInfoOnStore } from "@/store"
import message from "../../utils/message"
// 引入图片裁剪模态框
import ImageCropModal from "../../components/ImageCropModal"
import { logout } from "../../services/account"

const UserPage = () => {
	const { userId } = useParams()
	const navigate = useNavigate()
	const dispatch = useDispatch()

	// 从Redux获取音乐播放状态
	const { currentMusic, isPlaying } = useSelector((state) => state.musicPlay)
	// 假设 Redux 中有一个 user 模块存储了当前登录人的信息
	// state.user.userInfo 包含 { userId, nickName, ... }
	const { userId: loggedInUserId } = useSelector((state) => state.user || {})

	// --- 状态管理 ---
	const [userInfo, setUserInfo] = useState(null)
	const [musicList, setMusicList] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [pageNo, setPageNo] = useState(1)
	const [hasMore, setHasMore] = useState(true)

	// --- 新增交互状态 ---
	const [isOwner, setIsOwner] = useState(false) // 是否是用户本人
	const [isEditingName, setIsEditingName] = useState(false) // 是否正在编辑昵称
	const [tempNickName, setTempNickName] = useState("") // 昵称临时状态
	const fileInputRef = useRef(null) // 头像文件Input引用

	// 图片裁剪相关状态
	const [showCropModal, setShowCropModal] = useState(false) // 裁剪模态框显示状态
	const [selectedImage, setSelectedImage] = useState(null) // 选中的原始图片

	// 密码弹窗状态
	const [showPwdModal, setShowPwdModal] = useState(false)
	const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "" })
	const [pwdLoading, setPwdLoading] = useState(false)

	// 判断是否是本人
	useEffect(() => {
		if (loggedInUserId && userId) {
			// 注意类型转换，API返回的可能是String或Number，统一转String对比
			setIsOwner(String(loggedInUserId) === String(userId))
		}
	}, [loggedInUserId, userId])

	// 获取页面展示的用户信息
	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const response = await getUserInfo({ userId })
				setUserInfo(response)
				setTempNickName(response.nickName) // 初始化临时昵称
			} catch (err) {
				console.error("获取用户信息失败:", err)
				setError("获取用户信息失败")
			}
		}
		fetchUserInfo()
	}, [userId])

	// 获取用户音乐列表
	useEffect(() => {
		const fetchUserMusic = async () => {
			if (!hasMore) return
			try {
				const response = await loadUserMusic({ userId, pageNo })
				const { list, totalCount, pageSize } = response
				if (pageNo === 1) {
					setMusicList(list)
				} else {
					setMusicList((prev) => [...prev, ...list])
				}
				setHasMore(list.length === pageSize)
			} catch (err) {
				console.error("获取用户音乐列表失败:", err)
				setError("获取用户音乐列表失败")
			} finally {
				setLoading(false)
			}
		}
		fetchUserMusic()
	}, [userId, pageNo, hasMore]) // 注意依赖项

	// --- 交互逻辑处理 ---

	// 1. 处理选择图片：显示裁剪模态框
	const handleAvatarChange = (e) => {
		const file = e.target.files[0]
		if (!file) return

		// 显示裁剪模态框，并传递选中的图片
		setSelectedImage(file)
		setShowCropModal(true)
	}

	// 2. 处理裁剪完成：上传裁剪后的图片
	const handleCropComplete = async (croppedImage) => {
		if (!croppedImage) return

		try {
			// 创建FormData对象上传裁剪后的图片
			await updateUserInfo({
				nickName: userInfo.nickName,
				avatar: croppedImage,
			})

			// 重新获取用户信息更新显示
			const response = await getUserInfo({ userId })
			setUserInfo(response)
			message.success("头像修改成功,请刷新后生效")
		} catch (error) {
			console.error(error)
			message.error("头像上传失败")
		} finally {
			// 关闭裁剪模态框
			setShowCropModal(false)
			// 重置文件输入
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		}
	}

	// 2. 修改昵称
	const handleSaveNickName = async () => {
		if (!tempNickName.trim()) return message.error("昵称不能为空")

		try {
			const response = await updateUserInfo({
				nickName: tempNickName,
				// avatar: null // 不传文件
			})
			setUserInfo(response)
			dispatch(setUserInfoOnStore(response))

			setIsEditingName(false)
		} catch (error) {
			console.error(error)
			message.error("昵称修改失败")
		}
	}

	// 3. 修改密码
	const handleUpdatePassword = async (e) => {
		e.preventDefault()
		setPwdLoading(true)
		try {
			await updatePassword(pwdForm)
			message.success("密码修改成功，请重新登录")
			setShowPwdModal(false)
			setPwdForm({ oldPassword: "", newPassword: "" })
			await logout()
			localStorage.removeItem("token")
			dispatch(setUserInfoOnStore({}))
			navigate("/home?loginShow=true")
			// 这里通常应该触发退出登录逻辑
		} catch (error) {
			console.error(error)
			message.error("修改失败，请检查旧密码是否正确")
		} finally {
			setPwdLoading(false)
		}
	}

	// 处理播放歌曲
	const handlePlaySong = (song) => {
		navigate(`/music/${song.musicId}?from=user`)
	}

	// 加载更多
	const handleLoadMore = () => {
		if (!loading && hasMore) setPageNo((prev) => prev + 1)
	}

	if (loading && pageNo === 1) {
		return (
			<div className="flex flex-col h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white font-sans overflow-hidden items-center justify-center">
				<div className="text-xl bg-gradient-to-r from-system-primary-light to-system-secondary bg-clip-text text-transparent">
					加载中...
				</div>
			</div>
		)
	}

	if (error && !userInfo) {
		return (
			<div className="flex flex-col h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white font-sans overflow-hidden items-center justify-center">
				<div className="text-xl bg-gradient-to-r from-system-primary-light to-system-secondary bg-clip-text text-transparent">
					{error}
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white font-sans overflow-hidden relative selection:bg-system-primary selection:text-white">
			{/* 顶部导航 */}
			<header className="sticky top-0 z-10 px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-system-primary/30 shadow-lg shadow-system-primary/10">
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate(-1)}
						className="p-2 rounded-full bg-gradient-to-r from-system-primary-dark/30 to-system-secondary-dark/30 hover:from-system-primary-dark/40 hover:to-system-secondary-dark/40 border border-system-primary/30 shadow-lg shadow-system-primary/10 transition-all"
					>
						<ArrowLeft size={20} className="text-system-primary-lighter" />
					</button>
					<h1 className="text-xl font-bold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
						用户主页
					</h1>
				</div>
			</header>

			{/* 主内容区 */}
			<main className="flex-1 overflow-y-auto p-6">
				{/* 用户信息卡片 */}
				<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 rounded-2xl p-6 mb-8 border border-system-primary-dark/50 relative shadow-2xl shadow-system-primary/20 backdrop-blur-sm">
					{/* 右上角：修改密码按钮 (仅本人可见) */}
					{isOwner && (
						<button
							onClick={() => setShowPwdModal(true)}
							className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 text-system-primary-lighter border border-system-primary-dark/50 rounded-lg hover:bg-gradient-to-r from-system-primary-dark/70 to-system-secondary-dark/70 transition-all shadow-lg shadow-system-primary/20"
						>
							<Lock size={14} />
							修改密码
						</button>
					)}

					<div className="flex flex-col md:flex-row items-center gap-6">
						{/* 头像区域 */}
						<div className="relative group">
							<img
								src={
									userInfo?.avatar
										? getResource(userInfo.avatar)
										: import.meta.env.VITE_MUSIC_DEFAULT_COVER
								}
								className="w-32 h-32 rounded-full border-4 border-system-primary/30 object-cover shadow-2xl shadow-system-primary/30"
								alt={userInfo?.nickName}
							/>
							{/* 头像遮罩 (仅本人可见) */}
							{isOwner && (
								<>
									<input
										type="file"
										ref={fileInputRef}
										hidden
										accept="image/*"
										onChange={handleAvatarChange}
									/>
									<div
										onClick={() => fileInputRef.current.click()}
										className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/60 rounded-b-full flex items-center justify-center cursor-pointer opacity-0 opacity-100 transition-opacity"
									>
										<div className="flex items-center gap-1 text-xs text-white font-medium">
											<Camera size={12} />
											<span>更换图片</span>
										</div>
									</div>
								</>
							)}
						</div>

						{/* 用户信息区域 */}
						<div className="flex-1 text-center md:text-left">
							<div className="flex items-center justify-center md:justify-start gap-3 mb-2">
								{/* 昵称显示与编辑 */}
								{isEditingName ? (
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={tempNickName}
											onChange={(e) => setTempNickName(e.target.value)}
											className="bg-slate-700 border border-system-primary/30 rounded px-2 py-1 text-white focus:outline-none focus:border-system-primary w-40"
											autoFocus
										/>
										<button
											onClick={handleSaveNickName}
											className="p-1 text-green-400 hover:bg-green-400/20 rounded"
										>
											<Check size={18} />
										</button>
										<button
											onClick={() => {
												setIsEditingName(false)
												setTempNickName(userInfo.nickName)
											}}
											className="p-1 text-red-400 hover:bg-red-400/20 rounded"
										>
											<X size={18} />
										</button>
									</div>
								) : (
									<>
										<h2 className="text-3xl font-bold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
											{userInfo?.nickName}
										</h2>
										{isOwner && (
											<button
												onClick={() => setIsEditingName(true)}
												className="text-system-primary-lighter hover:text-system-primary-light transition-colors p-1"
												title="修改昵称"
											>
												<Edit2 size={16} />
											</button>
										)}
									</>
								)}
							</div>

							<p className="text-slate-300 mb-4">{userInfo?.email}</p>

							{/* 统计信息 */}
							<div className="flex justify-center md:justify-start gap-8">
								<div className="text-center">
									<div className="text-2xl font-bold bg-gradient-to-r from-system-primary-light to-system-secondary bg-clip-text text-transparent">
										{userInfo?.musicCount || 0}
									</div>
									<div className="text-sm text-slate-300">音乐作品</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold bg-gradient-to-r from-system-primary-light to-system-secondary bg-clip-text text-transparent">
										{userInfo?.goodCount || 0}
									</div>
									<div className="text-sm text-slate-300">获赞总数</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 音乐列表 */}
				<div>
					<h3 className="text-xl font-bold mb-4">音乐作品</h3>
					{musicList.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{musicList.map((song) => (
								<MusicCard
									key={song.musicId}
									song={song}
									isUserPage={true}
									context={{
										currentMusic,
										isPlaying,
										onPlaySong: handlePlaySong,
									}}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-12 bg-gradient-to-r from-system-primary-dark/40 to-system-secondary-dark/40 rounded-2xl border border-system-primary-dark/50 shadow-xl shadow-system-primary/10 p-6">
							<p className="text-system-primary-lighter">该用户暂无音乐作品</p>
						</div>
					)}

					{/* 加载更多按钮 */}
					{hasMore && musicList.length > 0 && (
						<div className="flex justify-center mt-8">
							<button
								onClick={handleLoadMore}
								className="px-6 py-2 bg-gradient-to-r from-system-primary to-system-secondary hover:from-system-primary-dark hover:to-system-secondary-dark text-white rounded-full transition-all duration-300 border border-system-primary/30 shadow-2xl shadow-system-primary/30"
							>
								加载更多
							</button>
						</div>
					)}
				</div>
			</main>

			{/* 修改密码弹窗 */}
			{showPwdModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="bg-gradient-to-br from-system-primary-dark/60 to-system-secondary-dark/60 rounded-2xl w-full max-w-md border border-system-primary-dark/50 shadow-2xl shadow-system-primary/20 p-6 backdrop-blur-sm">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-bold text-white">修改密码</h3>
							<button
								onClick={() => setShowPwdModal(false)}
								className="text-slate-400 hover:text-white"
							>
								<X size={24} />
							</button>
						</div>

						<form onSubmit={handleUpdatePassword} className="space-y-4">
							<div>
								<label className="block text-sm text-slate-400 mb-1">旧密码</label>
								<input
									type="password"
									required
									value={pwdForm.oldPassword}
									onChange={(e) =>
										setPwdForm({ ...pwdForm, oldPassword: e.target.value })
									}
									className="w-full bg-slate-900 border border-system-primary/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-system-primary-light"
									placeholder="请输入当前使用的密码"
								/>
							</div>
							<div>
								<label className="block text-sm text-slate-300 mb-1">新密码</label>
								<input
									type="password"
									required
									value={pwdForm.newPassword}
									onChange={(e) =>
										setPwdForm({ ...pwdForm, newPassword: e.target.value })
									}
									className="w-full bg-slate-900 border border-system-primary/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-system-primary-light"
									placeholder="设置新密码"
								/>
							</div>

							<div className="pt-4 flex gap-3">
								<button
									type="button"
									onClick={() => setShowPwdModal(false)}
									className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
								>
									取消
								</button>
								<button
									type="submit"
									disabled={pwdLoading}
									className="flex-1 py-2 bg-gradient-to-r from-system-primary to-system-secondary hover:from-system-primary-dark hover:to-system-secondary-dark disabled:bg-system-primary/50 text-white rounded-lg transition-all duration-300 border border-system-primary/30 shadow-lg shadow-system-primary/20 font-medium"
								>
									{pwdLoading ? "提交中..." : "确认修改"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* 图片裁剪模态框 */}
			<ImageCropModal
				isOpen={showCropModal}
				onClose={() => {
					setShowCropModal(false)
					// 关闭模态框时重置文件输入
					if (fileInputRef.current) {
						fileInputRef.current.value = ""
					}
				}}
				onConfirm={handleCropComplete}
				imageFile={selectedImage}
			/>
		</div>
	)
}

export default UserPage
