import React, { useState, useRef } from "react"
import SysDictData from "./SysDictData"

const SysDict = () => {
	const [selectedDict, setSelectedDict] = useState(null)

	return (
		<div className="flex h-full gap-4">
			<div className="w-1/3 h-full border-r border-gray-100 pr-4">
				<SysDictData dictPcode="0" onSelect={(row) => setSelectedDict(row)} />
			</div>
			<div className="w-2/3 h-full pl-4">
				{selectedDict ? (
					<SysDictData
						key={selectedDict.dictId} // Key change forces remount/refresh
						dictPcode={selectedDict.dictCode}
					/>
				) : (
					<div className="h-full flex items-center justify-center text-gray-400">
						请选择左侧字典分类
					</div>
				)}
			</div>
		</div>
	)
}

export default SysDict
