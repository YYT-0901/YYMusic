import React from "react"
import Cover from "./Cover"

const Avatar = ({ avatar, width = 50 }) => {
	return <Cover cover={avatar} width={width} borderRadius="50%" />
}

export default Avatar
