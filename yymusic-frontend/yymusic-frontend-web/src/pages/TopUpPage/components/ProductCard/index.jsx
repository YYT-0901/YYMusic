import React from "react"
import { ShoppingBag } from "lucide-react"
import { getResource } from "@/services/file"

// --- 工具函数 ---
const formatPrice = (price) => Number(price).toFixed(2)

// --- 组件: 商品卡片 ---
const ProductCard = ({ data, onBuy }) => {
	return (
		<div className="group relative w-full md:w-[300px] bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-system-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-system-primary/10 hover:-translate-y-1">
			{/* 封面区 */}
			<div className="h-50 overflow-hidden relative">
				<img
					src={getResource(data.cover)}
					alt={data.productName}
					className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
				<div className="absolute bottom-4 left-4 right-4">
					<h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-system-secondary-light via-system-primary to-system-primary-light">
						{data.productName}
					</h3>
				</div>
			</div>

			{/* 内容区 */}
			<div className="p-6 space-y-4">
				<div className="flex items-end justify-between">
					<div className="text-system-primary-light font-medium">
					¥
					<span className="text-3xl font-bold text-white">
						{formatPrice(data.price)}
					</span>
				</div>
					<div className="text-sm font-semibold px-3 py-1 bg-slate-700 rounded-full text-sky-400 border border-slate-600">
						+{data.integral} 积分
					</div>
				</div>

				<p className="text-slate-400 text-sm leading-relaxed h-10 line-clamp-2">
					{data.productDescription}
				</p>

				<button
						onClick={() => onBuy(data)}
						className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-system-primary to-system-secondary text-white font-bold shadow-lg shadow-system-primary/20 hover:shadow-system-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
					>
						<ShoppingBag size={18} />
						立即购买
					</button>
			</div>
		</div>
	)
}

export default ProductCard
