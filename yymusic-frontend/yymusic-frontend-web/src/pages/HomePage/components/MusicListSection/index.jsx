import { useState, useEffect, useMemo, useRef } from "react"
import { useOutletContext } from "react-router-dom"
import PropTypes from "prop-types"
import { TrendingUp, Clock, ListMusic } from "lucide-react"
import MusicCard from "../MusicCard"
import { loadLatestMusic } from "@/services/music"

/**
 * MusicListSection 音乐列表组件
 * @param {object} props
 * @param {string} props.sortType - 排序类型
 * @param {function} props.onSortChange - 排序变更事件
 */
export default function MusicListSection({ sortType = "hot", onSortChange }) {
	// 从父组件获取上下文数据
	const context = useOutletContext()
	const { currentMusic, isPlaying, onPlaySong, onTogglePlay } = context
	const [musicList, setMusicList] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [pagination, setPagination] = useState({
		pageNo: 1,
		pageSize: 12,
		totalCount: 0,
		pageTotal: 1,
	})

	// 加载最新音乐
	const fetchMusicList = async (pageNo = 1) => {
		try {
			setLoading(true)
			const response = await loadLatestMusic({
				pageNo,
			})

			if (response) {
				// 如果是第一页，直接替换数据；否则追加数据
				if (pageNo === 1) {
					setMusicList(response.list || [])
				} else {
					setMusicList((prevList) => [...prevList, ...(response.list || [])])
				}
				setPagination({
					// 使用传入的pageNo作为后备值，而不是固定的1
					pageNo: response.pageNo || pageNo,
					pageSize: response.pageSize || 12,
					totalCount: response.totalCount || 0,
					pageTotal: response.pageTotal || 1,
				})
			} else {
				setError("加载音乐列表失败")
			}
		} catch (err) {
			console.error("加载音乐列表失败:", err)
			setError("网络错误，请稍后重试")
		} finally {
			setLoading(false)
		}
	}

	// 监听排序类型变化，重新加载数据
	useEffect(() => {
		fetchMusicList(1)
	}, [])

	// 根据sortType排序
	const sortedMusic = useMemo(() => {
		if (sortType === "hot") {
			// 创建数组副本，避免原地修改
			return [...musicList].sort((a, b) => {
				// 根据goodCount倒序排序(大到小)
				return b.goodCount - a.goodCount
			})
		} else if (sortType === "new") {
			// 创建数组副本，避免原地修改
			return [...musicList].sort((a, b) => {
				// 根据创建时间倒序排序(最新的在前)
				// 假设后端返回了createTime字段
				return new Date(b.createTime) - new Date(a.createTime)
			})
		}
		return musicList
	}, [sortType, musicList])

	// 加载更多
	const loadMore = () => {
		if (pagination.pageNo < pagination.pageTotal && !loading) {
			fetchMusicList(pagination.pageNo + 1)
		}
	}

	// 加载指示器的ref
	const loadIndicatorRef = useRef(null)

	// 使用Intersection Observer实现滚动到底部自动加载
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries
				if (entry.isIntersecting && pagination.pageNo < pagination.pageTotal && !loading) {
					loadMore()
				}
			},
			{
				root: null, // 使用视口作为根元素
				rootMargin: "0px 0px 200px 0px", // 提前200px触发
				threshold: 0.1, // 当10%的元素可见时触发
			},
		)

		if (loadIndicatorRef.current) {
			observer.observe(loadIndicatorRef.current)
		}

		return () => {
			if (loadIndicatorRef.current) {
				observer.unobserve(loadIndicatorRef.current)
			}
		}
	}, [pagination.pageNo, pagination.pageTotal, loading])

	return (
		<section>
			{/* 优化：背景不透明度加强 bg-slate-900/90，确保吸顶时下方内容不可见 */}
			<div className="flex items-center justify-between mb-6 sticky top-0 z-10 py-4 -mx-8 px-8 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 transition-all shadow-xl shadow-slate-900/10">
				<h2 className="text-2xl font-bold text-white">
					发现音乐
				</h2>

				<div className="flex bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm border border-slate-700/50">
					<button
						onClick={() => onSortChange("hot")}
						className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sortType === "hot" ? "bg-system-primary/30 text-white shadow-lg shadow-system-primary/10 border border-system-primary/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"}`}
					>
						<div className="flex items-center gap-1.5">
							<TrendingUp
								size={14}
								className={sortType === "hot" ? "text-system-primary-lighter" : ""}
							/>{" "}
							热度
						</div>
					</button>
					<button
						onClick={() => onSortChange("new")}
						className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sortType === "new" ? "bg-system-primary/30 text-white shadow-lg shadow-system-primary/10 border border-system-primary/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"}`}
					>
						<div className="flex items-center gap-1.5">
							<Clock
								size={14}
								className={sortType === "new" ? "text-system-primary-lighter" : ""}
							/>{" "}
							最新
						</div>
					</button>
				</div>
			</div>

			{loading && musicList.length === 0 ? (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
					{[...Array(10)].map((_, i) => (
						<div
							key={i}
							className="aspect-square rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 animate-pulse border border-slate-700/50"
						></div>
					))}
				</div>
			) : error ? (
				<div className="flex items-center justify-center h-48 bg-system-primary/20 rounded-2xl border border-system-primary/30 backdrop-blur-sm shadow-lg">
												<p className="text-system-primary-lighter">{error}</p>
											</div>
			) : sortedMusic.length > 0 ? (
				<>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{sortedMusic.map((song) => (
							<MusicCard
								key={song.musicId}
								song={song}
								isPlaying={currentMusic?.musicId === song.musicId && isPlaying}
								onClick={() => {
									// 支持点击卡片进行播放/暂停切换
									if (currentMusic?.musicId === song.musicId) {
										onTogglePlay()
									} else {
										onPlaySong(song)
									}
								}}
							/>
						))}
					</div>

					{/* 加载指示器 */}
					{pagination.pageNo < pagination.pageTotal && (
						<div ref={loadIndicatorRef} className="flex justify-center mt-8 mb-16">
							<div className="flex items-center space-x-2 text-slate-400">
								{loading ? (
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-500"
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
								) : (
									<div className="h-5 w-5 rounded-full border-2 border-slate-500 border-t-transparent animate-spin"></div>
								)}
								<span>{loading ? "加载中..." : "滚动加载更多"}</span>
							</div>
						</div>
					)}
				</>
			) : (
				// 空状态样式
				<div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-system-primary/20 to-system-secondary/20 rounded-2xl text-center p-8 border border-system-primary/30 backdrop-blur-sm shadow-lg">
					<div className="w-20 h-20 rounded-full bg-gradient-to-br from-system-primary/30 to-system-secondary/30 flex items-center justify-center mb-4 border border-system-primary/40 shadow-xl">
						<ListMusic className="w-10 h-10 bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent" />
					</div>
					<h3 className="text-xl font-semibold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-2">
						暂无音乐
					</h3>
					<p className="text-system-primary-lighter max-w-md">
						目前还没有发现音乐，稍等片刻或稍后再来查看吧
					</p>
				</div>
			)}
		</section>
	)
}

MusicListSection.propTypes = {
	sortType: PropTypes.oneOf(["hot", "new"]),
	onSortChange: PropTypes.func,
}
