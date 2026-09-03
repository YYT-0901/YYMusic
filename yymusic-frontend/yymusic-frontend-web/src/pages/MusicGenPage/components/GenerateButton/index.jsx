import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Sparkles } from "lucide-react"
import {
	addSong,
	clearPrompt,
	clearLyrics,
	addCreatingSong,
	removeCreatingSong,
	setPolling,
	showLoginModal,
	updateIntegral,
} from "../../../../store/index.js"
import { createMusic, loadCreatingMusic } from "../../../../services/create"
import message from "../../../../utils/message"

/**
 * 生成按钮组件
 */
export default function GenerateButton() {
	const dispatch = useDispatch()
	const {
		category,
		mode,
		model,
		prompt,
		lyrics,
		selectedTags,
		creatingSongs,
		polling,
		modelUseIntegral,
	} = useSelector((state) => state.musicGen)
	const { isLoggedIn, integral } = useSelector((state) => state.user)
	// 处理生成音乐
	const handleGenerate = async () => {
		try {
			// 验证登录
			if (!isLoggedIn) {
				message.error("请先登录")
				dispatch(showLoginModal())
				return
			}

			// 验证输入
			if (!prompt.trim()) {
				message.error("请输入提示词")
				return
			}

			if (integral < modelUseIntegral) {
				message.error("积分不足")
				return
			}

			// 准备请求参数
			const params = {
				prompt,
				lyrics: mode === "advanced" ? lyrics : undefined,
				musicType: category === "song" ? 0 : 1,
				model,
				modeType: mode === "simple" ? 0 : 1,
			}

			if (mode === "advanced") {
				params.musicEmotion = selectedTags
					.filter((tag) => tag.type === "emotion")
					.map((tag) => tag.value)
					.join(",")
				params.musicGener = selectedTags
					.filter((tag) => tag.type === "genre")
					.map((tag) => tag.value)
					.join(",")
				params.musicSex = selectedTags
					.filter((tag) => tag.type === "gender")
					.map((tag) => tag.value)
					.join(",")
				params.musicChord = selectedTags
					.filter((tag) => tag.type === "chord")
					.map((tag) => tag.value)
					.join(",")
				params.musicTone = selectedTags
					.filter((tag) => tag.type === "tone")
					.map((tag) => tag.value)
					.join(",")
			}

			// 调用创建音乐接口
			const response = await createMusic(params)

			// 确保musicIds是数组格式
			const musicIds = Array.isArray(response) ? response : []

			if (musicIds && musicIds.length > 0) {
				// 创建生成中的音乐对象
				const creatingMusicItems = musicIds.map((musicId) => ({
					musicId,
					musicTitle: "",
					cover: null,
					duration: 0,
					lyrics,
					createTime: new Date().toISOString(),
					musicStatus: 0, // 0表示生成中
					musicType: category === "song" ? 0 : 1,
				}))

				// 添加到生成中的音乐列表
				dispatch(addCreatingSong(creatingMusicItems))

				dispatch(updateIntegral(integral - modelUseIntegral))

				// 清空输入
				dispatch(clearPrompt())
				if (mode === "advanced") {
					dispatch(clearLyrics())
				}

				message.success("音乐生成任务已提交！")
			} else {
				message.error("生成音乐失败，请稍后重试")
			}
		} catch (error) {
			console.error("生成音乐失败:", error)
			message.error(error || "生成音乐失败，请稍后重试")
		}
	}

	// 轮询生成中的音乐状态
	useEffect(() => {
		let pollInterval

		// 如果有生成中的音乐，则开始轮询
		if (creatingSongs.length > 0) {
			dispatch(setPolling(true))

			const pollMusicStatus = async () => {
				try {
					// 获取所有生成中的音乐ID
					const musicIds = creatingSongs.map((song) => song.musicId).join(",")

					// 调用轮询接口
					const response = await loadCreatingMusic(musicIds)
					const completedMusic = response

					// 如果返回了完成的音乐数据
					if (completedMusic) {
						// 如果是数组，处理多个音乐
						if (Array.isArray(completedMusic)) {
							completedMusic.forEach((music) => {
								if (music.musicStatus === 1) {
									// 添加到正式的音乐列表
									dispatch(addSong(music))
									// 从生成中的列表移除
									dispatch(removeCreatingSong(music.musicId))
									message.success(`音乐《${music.musicTitle}》生成完成！`)
								}
							})
						}
						// 如果是单个对象，处理单个音乐
						else {
							// 添加到正式的音乐列表
							dispatch(addSong(completedMusic))
							// 从生成中的列表移除
							dispatch(removeCreatingSong(completedMusic.musicId))
							message.success(`音乐《${completedMusic.musicTitle}》生成完成！`)
						}
					}
				} catch (error) {
					console.error("轮询音乐状态失败:", error)
					// 如果轮询失败，不提示用户，继续轮询
				}
			}

			// 立即执行一次轮询
			pollMusicStatus()

			// 设置轮询间隔为8秒
			pollInterval = setInterval(pollMusicStatus, 8000)
		} else if (polling) {
			// 如果没有生成中的音乐且正在轮询，则停止轮询
			dispatch(setPolling(false))
		}

		// 清理函数
		return () => {
			if (pollInterval) {
				clearInterval(pollInterval)
			}
		}
	}, [dispatch, creatingSongs])

	return (
		<button
			onClick={handleGenerate}
			className="w-full py-3.5 bg-gradient-to-r from-system-primary to-system-secondary hover:from-system-primary-light hover:to-system-secondary-light text-white rounded-xl font-bold text-lg border border-system-primary/30 shadow-2xl shadow-system-primary/30 transition-all duration-300 active:scale-[0.98] hover:shadow-system-primary/50 hover:shadow-lg flex items-center justify-center gap-2"
		>
			<Sparkles className="w-5 h-5" />
			立即创作
		</button>
	)
}
