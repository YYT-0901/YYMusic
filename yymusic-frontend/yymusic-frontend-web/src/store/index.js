import { configureStore, createSlice, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage" // 使用localStorage作为存储引擎

// 用户信息 slice
const userSlice = createSlice({
	name: "user",
	initialState: {
		isLoggedIn: false,
		userId: null,
		nickName: null,
		avatar: null,
		integral: null,
		token: null,
		isLoginModalOpen: false, // 控制登录弹窗显示
	},
	reducers: {
		setUserInfo: (state, action) => {
			state.isLoggedIn = true
			state.userId = action.payload.userId
			state.nickName = action.payload.nickName
			state.avatar = action.payload.avatar
			state.integral = action.payload.integral
			state.token = action.payload.token
		},
		logout: (state) => {
			state.isLoggedIn = false
			state.userId = null
			state.nickName = null
			state.avatar = null
			state.integral = null
			state.token = null
		},
		updateIntegral: (state, action) => {
			state.integral = action.payload
		},
		showLoginModal: (state) => {
			state.isLoginModalOpen = true
		},
		hideLoginModal: (state) => {
			state.isLoginModalOpen = false
		},
	},
})

// 音乐播放 slice
const musicPlaySlice = createSlice({
	name: "musicPlay",
	initialState: {
		currentMusic: null,
		playList: [],
		isPlaying: false,
		hasLike: false,
		currentTime: 0,
		duration: 0,
		volume: 100,
		playMode: "sequence", // sequence: 顺序, repeat: 单曲循环
	},
	reducers: {
		setCurrentMusic: (state, action) => {
			state.currentMusic = action.payload
		},
		setPlayList: (state, action) => {
			state.playList = action.payload
		},
		addToPlayList: (state, action) => {
			const exists = state.playList.find((item) => item.musicId === action.payload.musicId)
			if (!exists) {
				state.playList.push(action.payload)
			}
		},
		removeFromPlayList: (state, action) => {
			state.playList = state.playList.filter((item) => item.musicId !== action.payload)
			// 如果移除的是当前播放的歌曲，需要处理
			if (state.currentMusic && state.currentMusic.musicId === action.payload) {
				// 如果播放列表还有其他歌曲，播放下一首
				if (state.playList.length > 0) {
					state.currentMusic = state.playList[0]
				} else {
					// 播放列表为空，重置当前播放状态
					state.currentMusic = null
					state.isPlaying = false
				}
			}
		},
		playNext: (state) => {
			if (!state.currentMusic) return
			if (state.playMode === "repeat") {
				state.currentTime = 0
				return
			}
			const currentIndex = state.playList.findIndex(
				(item) => item.musicId === state.currentMusic.musicId,
			)
			const nextIndex = (currentIndex + 1) % state.playList.length
			state.currentMusic = state.playList[nextIndex]
		},
		playPrev: (state) => {
			if (!state.currentMusic) return
			if (state.playMode === "repeat") {
				state.currentTime = 0
				return
			}
			const currentIndex = state.playList.findIndex(
				(item) => item.musicId === state.currentMusic.musicId,
			)
			const prevIndex = currentIndex === 0 ? state.playList.length - 1 : currentIndex - 1
			state.currentMusic = state.playList[prevIndex]
		},
		setIsPlaying: (state, action) => {
			state.isPlaying = action.payload
		},
		setCurrentTime: (state, action) => {
			state.currentTime = action.payload
		},
		setDuration: (state, action) => {
			state.duration = action.payload
		},
		setVolume: (state, action) => {
			state.volume = action.payload
		},
		setPlayMode: (state, action) => {
			state.playMode = action.payload
		},
		togglePlayMode: (state) => {
			state.playMode = state.playMode === "sequence" ? "repeat" : "sequence"
		},
		clearPlayList: (state) => {
			state.playList = []
			state.currentMusic = null
			state.isPlaying = false
		},
		setHasLike: (state, action) => {
			state.hasLike = action.payload
		},
	},
})

// 音乐创作 slice
const musicGenSlice = createSlice({
	name: "musicGen",
	initialState: {
		category: "song", // 'song' (歌曲) | 'instrumental' (纯音乐)
		mode: "simple", // 'simple' (简单) | 'advanced' (高级)
		model: "YYMusic",
		prompt: "",
		lyrics: "",
		selectedTags: [], // 简单字符串数组，包含选中的标签代码
		songs: [],
		creatingSongs: [], // 生成中的音乐列表
		styleTags: [],
		loading: false,
		polling: false, // 是否正在轮询
		pagination: {
			pageNo: 1,
			pageSize: 10,
			pageTotal: 0,
			totalCount: 0,
		},
		sysDict: null, // 系统字典数据
		modelUseIntegral: 40,
	},
	reducers: {
		setCategory: (state, action) => {
			state.category = action.payload
		},
		setMode: (state, action) => {
			state.mode = action.payload
		},
		setSysDict: (state, action) => {
			state.sysDict = action.payload
		},
		setModel: (state, action) => {
			state.model = action.payload
		},
		setPrompt: (state, action) => {
			state.prompt = action.payload
		},
		setLyrics: (state, action) => {
			state.lyrics = action.payload
		},
		toggleTag: (state, action) => {
			const { value, type } = action.payload
			const tagIndex = state.selectedTags.findIndex((tag) => tag.value === value)
			if (tagIndex !== -1) {
				// 如果标签已存在，则移除
				state.selectedTags = [
					...state.selectedTags.slice(0, tagIndex),
					...state.selectedTags.slice(tagIndex + 1),
				]
			} else {
				// 如果标签不存在，则添加
				state.selectedTags = [...state.selectedTags, { value, type }]
			}
		},
		clearTags: (state, action) => {
			const { type } = action.payload
			state.selectedTags = state.selectedTags.filter((tag) => tag.type !== type)
		},
		addSong: (state, action) => {
			state.songs = [action.payload, ...state.songs]
		},
		deleteSong: (state, action) => {
			state.songs = state.songs.filter((song) => song.musicId !== action.payload)
		},
		renameSong: (state, action) => {
			const { musicId, newName } = action.payload
			const song = state.songs.find((s) => s.musicId === musicId)
			if (song) {
				song.musicTitle = newName
			}
		},
		clearPrompt: (state) => {
			state.prompt = ""
		},
		clearLyrics: (state) => {
			state.lyrics = ""
		},
		setSongs: (state, action) => {
			state.songs = action.payload
		},
		setLoading: (state, action) => {
			state.loading = action.payload
		},
		setPagination: (state, action) => {
			state.pagination = action.payload
		},
		updateSongCover: (state, action) => {
			const { musicId, cover } = action.payload
			const song = state.songs.find((s) => s.musicId === musicId)
			if (song) {
				song.cover = cover
			}
		},
		updateSongTitle: (state, action) => {
			const { musicId, musicTitle } = action.payload
			const song = state.songs.find((s) => s.musicId === musicId)
			if (song) {
				song.musicTitle = musicTitle
			}
		},
		// 添加生成中的音乐
		addCreatingSong: (state, action) => {
			state.creatingSongs = [...action.payload, ...state.creatingSongs]
		},
		// 移除生成中的音乐
		removeCreatingSong: (state, action) => {
			state.creatingSongs = state.creatingSongs.filter(
				(song) => song.musicId !== action.payload,
			)
		},
		// 清空生成中的音乐
		clearCreatingSongs: (state) => {
			state.creatingSongs = []
		},
		// 设置轮询状态
		setPolling: (state, action) => {
			state.polling = action.payload
		},
		loadMyMusicStart: (state) => {
			state.loading = true
		},
		loadMyMusicSuccess: (state, action) => {
			state.loading = false
			const { pageNo, list } = action.payload
			const newCreatingSongs = list.filter((song) => song.musicStatus == 0)
			const newSongs = list.filter((song) => song.musicStatus == 1)

			// 如果是第一页，替换数据；否则追加数据
			if (pageNo === 1) {
				state.creatingSongs = newCreatingSongs
				state.songs = newSongs
			} else {
				// 避免重复添加
				const existingCreatingIds = new Set(state.creatingSongs.map((song) => song.musicId))
				const existingSongIds = new Set(state.songs.map((song) => song.musicId))
				state.creatingSongs = [
					...state.creatingSongs,
					...newCreatingSongs.filter((song) => !existingCreatingIds.has(song.musicId)),
				]
				state.songs = [
					...state.songs,
					...newSongs.filter((song) => !existingSongIds.has(song.musicId)),
				]
			}
			state.pagination = {
				pageNo: action.payload.pageNo,
				pageSize: action.payload.pageSize,
				pageTotal: action.payload.pageTotal,
				totalCount: action.payload.totalCount,
			}
		},
		loadMyMusicFailure: (state) => {
			state.loading = false
		},
		uploadCoverStart: (state) => {
			state.loading = true
		},
		uploadCoverSuccess: (state, action) => {
			state.loading = false
			const { musicId, cover } = action.payload
			const song = state.songs.find((s) => s.musicId === musicId)
			if (song) {
				song.cover = cover
			}
		},
		uploadCoverFailure: (state) => {
			state.loading = false
		},
		changeTitleStart: (state) => {
			state.loading = true
		},
		changeTitleSuccess: (state, action) => {
			state.loading = false
			const { musicId, musicTitle } = action.payload
			const song = state.songs.find((s) => s.musicId === musicId)
			if (song) {
				song.musicTitle = musicTitle
			}
		},
		changeTitleFailure: (state) => {
			state.loading = false
		},
		setModelUseIntegral: (state, action) => {
			state.modelUseIntegral = action.payload
		},
	},
})
export const { setUserInfo, logout, updateIntegral, showLoginModal, hideLoginModal } =
	userSlice.actions
export const {
	setCategory,
	setMode,
	setModel,
	setPrompt,
	setLyrics,
	toggleTag,
	clearTags,
	addSong,
	deleteSong,
	renameSong,
	clearPrompt,
	clearLyrics,
	setSongs,
	setLoading,
	setPagination,
	updateSongCover,
	updateSongTitle,
	loadMyMusicStart,
	loadMyMusicSuccess,
	loadMyMusicFailure,
	uploadCoverStart,
	uploadCoverSuccess,
	uploadCoverFailure,
	changeTitleStart,
	changeTitleSuccess,
	changeTitleFailure,
	setSysDict,
	addCreatingSong,
	removeCreatingSong,
	clearCreatingSongs,
	setPolling,
	setModelUseIntegral,
} = musicGenSlice.actions
export const {
	setCurrentMusic,
	setPlayList,
	addToPlayList,
	removeFromPlayList,
	playNext,
	playPrev,
	setIsPlaying,
	setCurrentTime,
	setDuration,
	setVolume,
	setPlayMode,
	togglePlayMode,
	clearPlayList,
	setHasLike,
} = musicPlaySlice.actions

// 配置持久化
const persistConfig = {
	key: "root",
	storage,
	whitelist: ["musicPlay"], // 只持久化musicPlay slice
}

// 创建root reducer
const rootReducer = {
	counter: (state = 0) => state,
	user: userSlice.reducer,
	musicPlay: musicPlaySlice.reducer,
	musicGen: musicGenSlice.reducer,
}

// 创建持久化reducer
const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer))

// 创建store
export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
			immutableCheck: true,
		}),
	devTools: process.env.NODE_ENV !== "production",
})

// 创建持久化store
export const persistor = persistStore(store)

// 导出 store 类型，用于 TypeScript（虽然本项目使用 JS）
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
