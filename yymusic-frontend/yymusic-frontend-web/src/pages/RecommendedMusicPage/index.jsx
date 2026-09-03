import { useState, useEffect } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { loadCommendMusic } from "@/services/music"
import { RecommendedCard } from "@/pages/HomePage/components/RecommendedSection"

/**
 * RecommendedMusicPage 推荐音乐列表页面
 */
export default function RecommendedMusicPage() {
	// 从父组件获取上下文数据
	const context = useOutletContext()
	const { currentMusic, isPlaying, onPlaySong, onTogglePlay } = context
	const [recommendedMusic, setRecommendedMusic] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// 加载推荐音乐
	useEffect(() => {
		const fetchRecommendedMusic = async () => {
			try {
				setLoading(true)
				// 查看全部时不传入isRandomTwo参数，返回所有推荐音乐
				const response = await loadCommendMusic()

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
		<div className="min-h-screen py-10 bg-gradient-to-br from-slate-900 to-slate-950">
			<div className="container mx-auto px-4">
				<h1 className="text-4xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-system-primary-lighter">
					全部推荐音乐
				</h1>

				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className="h-48 rounded-2xl bg-gradient-to-br from-system-primary/30 to-system-secondary/30 animate-pulse border border-system-primary/30"
							></div>
						))}
					</div>
				) : error ? (
					<div className="flex items-center justify-center h-48 bg-gradient-to-br from-system-primary/20 to-system-secondary/20 rounded-2xl border border-system-primary/30 shadow-lg">
						<p className="text-system-primary-lighter">{error}</p>
					</div>
				) : recommendedMusic.length === 0 ? (
					<div className="flex items-center justify-center h-48 bg-gradient-to-br from-system-primary/20 to-system-secondary/20 rounded-2xl border border-system-primary/30 shadow-lg">
						<p className="text-system-primary-lighter">暂无推荐音乐</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{recommendedMusic.map((song) => (
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
						))}
					</div>
				)}
			</div>
		</div>
	)
}
