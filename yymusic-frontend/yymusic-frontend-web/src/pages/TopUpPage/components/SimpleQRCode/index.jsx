import React from "react"

// --- Simple QR Code Component (No external dependencies) ---
// 为了避免安装外部库导致的错误，这里使用一个简单的SVG生成二维码的替代方案
// 或者使用网络API生成二维码图片
const SimpleQRCode = ({ value, size = 180 }) => {
	// 使用 qrcode.tec-it.com 的 API 生成二维码图片
	// 备用: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`
	const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`

	return (
		<div style={{ width: size, height: size }} className="bg-white">
			<img src={qrUrl} alt="QR Code" style={{ width: "100%", height: "100%" }} />
		</div>
	)
}

export default SimpleQRCode