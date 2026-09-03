import React from "react"
import { getResourceUrl } from "../utils/Api"
import defaultCover from "../assets/img/cover.png" // 假设你有这个文件

const Cover = ({ cover, width, scale = 1, borderRadius = "4px" }) => {
	const src = cover ? getResourceUrl(cover) : defaultCover

	const style = {
		width: width ? `${width}px` : "100%",
		height: width ? `${width * scale}px` : "100%",
		borderRadius,
	}

	return (
		<div className="overflow-hidden bg-gray-100 relative" style={style}>
			<img
				src={src}
				alt="Cover"
				className="w-full h-full object-cover transition-transform hover:scale-105"
				onError={(e) => {
					e.target.src = defaultCover
				}}
			/>
		</div>
	)
}

export default Cover
