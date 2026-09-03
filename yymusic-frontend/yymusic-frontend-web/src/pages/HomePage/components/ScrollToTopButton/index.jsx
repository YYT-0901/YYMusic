import { Rocket } from "lucide-react"
import PropTypes from "prop-types"

/**
 * ScrollToTopButton 回到顶部按钮组件
 * 职责：提供快速回到页面顶部的功能
 */
export default function ScrollToTopButton({ showScrollTop = false, onScrollToTop }) {
	return (
		<button
			onClick={onScrollToTop}
			className={`
            absolute bottom-28 right-8 z-20 p-3 rounded-full bg-system-primary text-white shadow-lg shadow-system-primary/30
            hover:-translate-y-1 hover:bg-system-primary-light hover:shadow-system-primary/50 transition-all duration-500 ease-in-out border border-white/10
            ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
          `}
			title="回到顶部"
		>
			<Rocket size={24} className={showScrollTop ? "animate-pulse" : ""} />
		</button>
	)
}

ScrollToTopButton.propTypes = {
	showScrollTop: PropTypes.bool,
	onScrollToTop: PropTypes.func,
}
