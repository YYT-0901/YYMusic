/**
 * 创建 HTMLImageElement 对象
 */
export const createImage = (url) =>
	new Promise((resolve, reject) => {
		const image = new Image()
		image.addEventListener("load", () => resolve(image))
		image.addEventListener("error", (error) => reject(error))
		image.setAttribute("crossOrigin", "anonymous")
		image.src = url
	})

/**
 * 将角度转换为弧度
 */
export function getRadianAngle(degreeValue) {
	return (degreeValue * Math.PI) / 180
}

/**
 * 核心裁剪函数：根据裁剪区域和旋转角度生成新的图片 Blob
 */
export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
	const image = await createImage(imageSrc)
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d")

	if (!ctx) {
		return null
	}

	// 计算旋转后的容器尺寸
	const rotRad = getRadianAngle(rotation)
	const { width: bBoxWidth, height: bBoxHeight } = {
		width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
		height:
			Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
	}

	canvas.width = bBoxWidth
	canvas.height = bBoxHeight

	// 平移画布中心并旋转
	ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
	ctx.rotate(rotRad)
	ctx.translate(-image.width / 2, -image.height / 2)

	// 绘制原图
	ctx.drawImage(image, 0, 0)

	// 获取裁剪区域的数据
	const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)

	// 将 Canvas 大小调整为裁剪框的大小
	canvas.width = pixelCrop.width
	canvas.height = pixelCrop.height

	// 将截取的数据放回 Canvas
	ctx.putImageData(data, 0, 0)

	// 返回 Promise，Resolve 为 Blob (File)
	return new Promise((resolve) => {
		canvas.toBlob(
			(file) => {
				if (file) {
					// 修复部分浏览器生成的 Blob 没有 name 的问题
					file.name = "cropped.jpeg"
					resolve(file)
				}
			},
			"image/jpeg",
			0.95,
		) // 0.95 为图片质量
	})
}
