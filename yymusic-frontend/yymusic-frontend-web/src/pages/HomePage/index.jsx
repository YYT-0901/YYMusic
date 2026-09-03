import { useState, useRef, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { RecommendedSection, MusicListSection, ScrollToTopButton } from "./components"

/**
 * HomePage 首页组件
 * 职责：作为页面内容容器，展示首页内容
 */
export default function HomePage() {
	// 从Layout获取上下文数据
	const context = useOutletContext()
	const { currentMusic, isPlaying, onPlaySong, onTogglePlay } = context

	// 状态管理
	const [sortType, setSortType] = useState("hot") // 'hot' or 'new'

	// Back to Top 状态
	const [showScrollTop, setShowScrollTop] = useState(false)
	// 滚动容器的引用
	const scrollContainerRef = useRef(null)

	// 监听滚动事件
	useEffect(() => {
		const handleScroll = () => {
			if (scrollContainerRef.current) {
				// 当滚动超过 400px 时显示火箭
				setShowScrollTop(scrollContainerRef.current.scrollTop > 400)
			}
		}

		const container = scrollContainerRef.current
		if (container) {
			container.addEventListener("scroll", handleScroll)
		}

		return () => {
			if (container) {
				container.removeEventListener("scroll", handleScroll)
			}
		}
	}, [])

	// 回到顶部函数
	const scrollToTop = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTo({
				top: 0,
				behavior: "smooth",
			})
		}
	}

	// 处理排序变化
	const handleSortChange = (type) => setSortType(type)

	return (
		<div className="flex-1 flex flex-col h-full relative overflow-hidden">
			{/* 滚动内容容器 */}
			<div
				ref={scrollContainerRef}
				className="flex-1 overflow-y-auto pb-32 px-8 custom-scrollbar scroll-smooth"
			>
				{/* 推荐区域 */}
				<RecommendedSection />

				{/* 音乐列表区域 */}
				<MusicListSection sortType={sortType} onSortChange={handleSortChange} />
			</div>

			{/* 回到顶部按钮 */}
			<ScrollToTopButton showScrollTop={showScrollTop} onScrollToTop={scrollToTop} />
		</div>
	)
}
