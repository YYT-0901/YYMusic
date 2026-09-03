import PropTypes from "prop-types"

/**
 * NavItem 导航条目组件
 * @param {object} props
 * @param {React.ReactNode} props.icon - 图标
 * @param {string} props.label - 标签文字
 * @param {boolean} props.active - 是否激活
 * @param {function} props.onClick - 点击事件
 * @param {boolean} props.collapsed - 是否折叠模式
 */
export default function NavItem({
	icon,
	label,
	active = false,
	onClick,
	collapsed = false,
}) {
	return (
		<button
			onClick={onClick}
			className={`w-full flex items-center gap-4 py-3 rounded-xl transition-all duration-300 group ${active ? "bg-system-primary/20 text-system-primary-lighter border-l-4 border-system-primary shadow-lg shadow-system-primary/20" : "text-slate-400 hover:bg-slate-800/60 hover:text-system-primary-lighter hover:shadow-lg hover:shadow-system-primary/20"} ${collapsed ? "justify-center px-0" : "px-4"}`}
			title={collapsed ? label : ""}
		>
			<span className={`transition-all duration-300 flex-shrink-0 ${active ? "text-system-primary-lighter scale-110" : "group-hover:text-system-primary-lighter group-hover:scale-110"}`}>
				{icon}
			</span>
			{/* 展开时显示文字 */}
			<span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"} ${active ? "text-system-primary-lighter" : "text-slate-400 group-hover:text-system-primary-lighter"}`}>
				{label}
			</span>
		</button>
	)
}

NavItem.propTypes = {
	icon: PropTypes.node.isRequired,
	label: PropTypes.string.isRequired,
	active: PropTypes.bool,
	onClick: PropTypes.func,
	collapsed: PropTypes.bool,
}