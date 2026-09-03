import { Music, Info, Heart, Shield, Users, Award } from "lucide-react"

/**
 * AboutPage 关于平台页面
 */
function AboutPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white p-6 md:p-8">
			<div className="max-w-4xl mx-auto h-full overflow-y-auto">
				{/* 页面标题 */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-system-primary to-system-secondary mb-4 shadow-2xl shadow-system-primary/30">
						<Info className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-4">
						关于YY Music
					</h1>
					<p className="text-slate-300 max-w-2xl mx-auto">
						YY Music是一个专注于AI音乐创作的平台，为用户提供高品质的音乐生成和分享服务。
					</p>
				</div>

				{/* 平台简介 */}
				<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-sm rounded-2xl border border-system-primary-dark/50 p-6 mb-8 shadow-2xl shadow-system-primary/20">
					<h2 className="text-xl font-semibold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-4">
						平台简介
					</h2>
					<p className="text-system-primary-lighter leading-relaxed">
						YY Music致力于为音乐爱好者和创作者提供一个简单、高效的AI音乐创作平台。
						我们利用先进的深度学习技术，让用户能够轻松生成各种风格的音乐作品，无需专业的音乐知识。
						无论您是音乐爱好者、内容创作者还是专业音乐人，YY Music都能满足您的需求。
					</p>
				</div>

				{/* 核心特色 */}
				<div className="mb-8">
					<h2 className="text-xl font-semibold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-6">
						核心特色
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-sm rounded-xl border border-system-primary-dark/50 p-5 shadow-lg shadow-system-primary/20">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-system-primary to-system-secondary flex items-center justify-center border border-system-primary-dark/50">
									<Music className="w-5 h-5 text-white" />
								</div>
								<h3 className="font-medium bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
									AI音乐生成
								</h3>
							</div>
							<p className="text-system-primary-lighter text-sm">
								支持多种音乐风格和流派，一键生成高品质音乐作品。
							</p>
						</div>

						<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-sm rounded-xl border border-system-primary-dark/50 p-5 shadow-lg shadow-system-primary/20">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-system-primary to-system-secondary flex items-center justify-center border border-system-primary-dark/50">
									<Users className="w-5 h-5 text-white" />
								</div>
								<h3 className="font-medium bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
									社区分享
								</h3>
							</div>
							<p className="text-system-primary-lighter text-sm">
								与全球音乐爱好者分享您的创作，获得反馈和灵感。
							</p>
						</div>

						<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-sm rounded-xl border border-system-primary-dark/50 p-5 shadow-lg shadow-system-primary/20">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-system-primary to-system-secondary flex items-center justify-center border border-system-primary-dark/50">
									<Award className="w-5 h-5 text-white" />
								</div>
								<h3 className="font-medium bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
									专业品质
								</h3>
							</div>
							<p className="text-system-primary-lighter text-sm">
								采用先进的AI算法，生成接近专业水准的音乐作品。
							</p>
						</div>

						<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-sm rounded-xl border border-system-primary-dark/50 p-5 shadow-lg shadow-system-primary/20">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-system-primary to-system-secondary flex items-center justify-center border border-system-primary-dark/50">
									<Shield className="w-5 h-5 text-white" />
								</div>
								<h3 className="font-medium bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent">
									版权保护
								</h3>
							</div>
							<p className="text-system-primary-lighter text-sm">
								为用户提供作品版权保护，保障创作者的合法权益。
							</p>
						</div>
					</div>
				</div>

				{/* 团队介绍 */}
				<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-sm rounded-2xl border border-system-primary-dark/50 p-6 mb-8 shadow-2xl shadow-system-primary/20">
					<h2 className="text-xl font-semibold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-4">
						团队介绍
					</h2>
					<p className="text-system-primary-lighter leading-relaxed mb-6">
						我们是一个充满激情的团队，致力于将AI技术与音乐创作完美结合。
					</p>
					<div className="flex items-center justify-center gap-2 text-system-primary-lighter text-sm">
						<Heart className="w-4 h-4 text-system-secondary" />
						<span>用心打造每一个音符</span>
					</div>
				</div>

				{/* 联系方式 */}
				<div className="bg-gradient-to-r from-system-primary-dark/60 to-system-secondary-dark/60 backdrop-blur-sm rounded-2xl border border-system-primary-dark/50 p-6 shadow-2xl shadow-system-primary/20">
					<h2 className="text-xl font-semibold bg-gradient-to-r from-white to-system-primary-lighter bg-clip-text text-transparent mb-4">
						联系方式
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center gap-3">
							<span className="text-system-primary-lighter w-24">邮箱:</span>
							<span className="text-white">1820221050@bit.edu.cn</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-system-primary-lighter w-24">社交媒体:</span>
							<span className="text-white">-</span>
						</div>
					</div>
				</div>

				{/* 页脚 */}
				<div className="text-center mt-12 text-slate-500 text-sm">
					<p>&copy; {new Date().getFullYear()} YY Music. All rights reserved.</p>
				</div>
			</div>
		</div>
	)
}

export default AboutPage
