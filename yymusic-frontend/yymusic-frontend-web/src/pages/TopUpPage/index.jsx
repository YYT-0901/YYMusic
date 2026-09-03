import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CreditCard, Loader2 } from "lucide-react"
import { ProductCard, PayModal } from "./components"
import { loadProduct } from "@/services/buy"
import { setUserInfo } from "../../store"

// --- 主页面 ---
const TopUpPage = () => {
	// 渲染全局样式组件
	return (
		<>
			<TopUpPageContent />
		</>
	)
}

// 主页面内容组件
const TopUpPageContent = () => {
	const dispatch = useDispatch()

	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const { integral } = useSelector((state) => state.user)

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState(null)

	useEffect(() => {
		// 加载商品数据和用户积分
		const init = async () => {
			setLoading(true)
			try {
				const productsRes = await loadProduct()
				setProducts(productsRes)
			} catch (error) {
				console.error("初始化数据失败:", error)
			}
			setLoading(false)
		}
		init()
	}, [])

	const openPayModal = (product) => {
		setSelectedProduct(product)
		setIsModalOpen(true)
	}

	const handlePaySuccess = async (data) => {
		dispatch(setUserInfo(data))
	}

	return (
		<div
			className="min-h-screen bg-slate-1000 text-white font-sans selection:bg-system-primary/50"
			style={{ overflow: "auto", minHeight: "100vh" }}
		>
			{/* Navbar / Header */}
			<header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
				<CreditCard className="text-system-primary" />
				<span className="font-bold text-xl tracking-tight">充值中心</span>
			</div>
					<div className="flex items-center gap-4">
						<div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
					<span className="text-slate-400 text-sm">当前积分</span>
					<span className="text-system-primary-light font-bold font-mono">{integral}</span>
				</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-6 py-12 min-h-[calc(100vh-80px)] overflow-y-auto">
				{/* Banner Section */}
				<div className="text-center mb-16 space-y-4">
					<h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-system-primary-light via-system-primary to-system-secondary pb-2">
					解锁无限创作可能
				</h1>
					<p className="text-slate-400 max-w-2xl mx-auto text-lg">
						获取积分以使用高级 AI 模型生成高质量音乐。支持微信、支付宝及兑换码支付。
					</p>
				</div>

				{/* Product Grid */}
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<Loader2 className="animate-spin text-system-primary" size={40} />
					</div>
				) : (
					<div className="flex flex-wrap justify-center gap-8">
						{products.map((product) => (
							<ProductCard
								key={product.productId}
								data={product}
								onBuy={openPayModal}
							/>
						))}
					</div>
				)}

				{/* FAQ Section (Optional filler) */}
				<div className="mt-24 border-t border-white-800 pt-12 ">
					<h2 className="text-2xl font-bold text-center mb-8 text-slate-200">常见问题</h2>
					<div className="grid md:grid-cols-3 gap-8 text-slate-400 text-sm">
						<div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
							<h3 className="text-white font-medium text-lg mb-2">积分会过期吗？</h3>
							<p>不会，充值的积分永久有效，您可以随时使用。</p>
						</div>
						<div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
							<h3 className="text-white font-medium text-lg mb-2">
								支付失败怎么办？
							</h3>
							<p>
								如果扣款成功但积分未到账，请联系客服并提供订单号，我们会在24小时内处理。
							</p>
						</div>
						<div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
							<h3 className="text-white font-medium text-lg mb-2">支持退款吗？</h3>
							<p>由于虚拟商品的特殊性，积分一经售出不支持退款，请确认后购买。</p>
						</div>
					</div>
				</div>
			</main>

			{/* Pay Modal */}
			<PayModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				product={selectedProduct}
				onSuccess={handlePaySuccess}
			/>
		</div>
	)
}

export default TopUpPage
