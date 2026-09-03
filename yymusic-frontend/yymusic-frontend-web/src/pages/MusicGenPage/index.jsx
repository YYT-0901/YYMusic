import React, { useEffect } from "react"
import { useOutletContext, useSearchParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { loadMyMusic, getCreation } from "../../services/music.js"
import { loadSysDict } from "../../services/create.js"
import ControlPanel from "./components/ControlPanel"
import SongList from "./components/SongList"
import {
	setCategory,
	setMode,
	setModel,
	setPrompt,
	setLyrics,
	toggleTag,
	clearPrompt,
	loadMyMusicStart,
	loadMyMusicSuccess,
	loadMyMusicFailure,
	setSysDict,
	clearTags,
} from "../../store/index.js"
import { getResource } from "../../services/file.js"

const MusicGenPage = () => {
	// 从Layout获取上下文数据
	const context = useOutletContext()

	// 获取URL参数
	const [searchParams] = useSearchParams()

	// 使用 Redux 管理创作状态
	const dispatch = useDispatch()

	// 事件处理函数 - 使用 dispatch 派发 actions
	const handleCategoryChange = (value) => dispatch(setCategory(value))
	const handleModeChange = (value) => dispatch(setMode(value))
	const handleModelChange = (value) => dispatch(setModel(value))
	const handlePromptChange = (value) => dispatch(setPrompt(value))
	const handleLyricsChange = (value) => dispatch(setLyrics(value))
	const handleToggleTag = (tag) => dispatch(toggleTag(tag))

	// 组件挂载时加载数据
	useEffect(() => {
		// 加载用户音乐列表
		const fetchMusicList = async () => {
			dispatch(loadMyMusicStart())
			try {
				let data = await loadMyMusic({ pageNo: 1, queryLikeMusic: false })
				dispatch(loadMyMusicSuccess(data))
			} catch (error) {
				console.error("加载音乐列表失败:", error)
				dispatch(loadMyMusicFailure(error.message))
			}
		}

		// 加载系统字典
		const fetchSysDict = async () => {
			try {
				const dictData = await loadSysDict()
				dispatch(setSysDict(dictData))
			} catch (error) {
				console.error("加载系统字典失败:", error)
			}
		}

		// 加载创作参数
		const fetchCreationParams = async () => {
			const creationId = searchParams.get("creationId")
			if (creationId) {
				try {
					const creationData = await getCreation({ creationId })
					if (creationData) {
						// 将创作参数对应到Redux状态中
						if (creationData.prompt) dispatch(setPrompt(creationData.prompt))
						if (creationData.lyrics) dispatch(setLyrics(creationData.lyrics))
						if (creationData.model) dispatch(setModel(creationData.model))
						if (creationData.musicType !== undefined)
							dispatch(
								setCategory(creationData.musicType == 0 ? "song" : "instrumental"),
							)
						if (creationData.modeType !== undefined)
							dispatch(setMode(creationData.modeType == 0 ? "simple" : "advanced"))

						// 解析settings参数
						if (creationData.settings) {
							try {
								const settings = JSON.parse(creationData.settings)

								// 处理音乐情感标签
								if (settings.musicEmotion) {
									dispatch(clearTags({ type: "emotion" }))

									const emotions = settings.musicEmotion.split(",")
									emotions.forEach((emotion) => {
										if (emotion.trim()) {
											dispatch(
												toggleTag({
													value: emotion.trim(),
													type: "emotion",
												}),
											)
										}
									})
								}

								if (settings.musicChord) {
									dispatch(clearTags({ type: "chord" }))

									const chords = settings.musicChord.split(",")
									chords.forEach((chord) => {
										if (chord.trim()) {
											dispatch(
												toggleTag({
													value: chord.trim(),
													type: "chord",
												}),
											)
										}
									})
								}

								if (settings.musicTone) {
									dispatch(clearTags({ type: "tone" }))

									const tones = settings.musicTone.split(",")
									tones.forEach((tone) => {
										if (tone.trim()) {
											dispatch(
												toggleTag({
													value: tone.trim(),
													type: "tone",
												}),
											)
										}
									})
								}

								// 处理音乐风格标签
								if (settings.musicGener) {
									dispatch(clearTags({ type: "genre" }))
									const genres = settings.musicGener.split(",")
									genres.forEach((genre) => {
										if (genre.trim()) {
											dispatch(
												toggleTag({ value: genre.trim(), type: "genre" }),
											)
										}
									})
								}

								// 处理音乐性别标签
								if (settings.musicSex) {
									dispatch(clearTags({ type: "sex" }))
									const sex = settings.musicSex.trim()
									if (sex) {
										dispatch(toggleTag({ value: sex, type: "sex" }))
									}
								}
							} catch (error) {
								console.error("解析settings失败:", error)
							}
						}
					}
				} catch (error) {
					console.error("加载创作参数失败:", error)
				}
			}
		}

		fetchMusicList()
		fetchSysDict()
		fetchCreationParams()
	}, [dispatch, searchParams])

	return (
		<div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden">
			{/* 左侧创作控制面板 */}
			<ControlPanel />

			{/* 右侧作品库列表 */}
			<SongList />
		</div>
	)
}

export default MusicGenPage
