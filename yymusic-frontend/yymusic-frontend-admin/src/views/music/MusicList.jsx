import React, { useState, useEffect } from "react"
import { Search, ThumbsUp } from "lucide-react"
import Table from "../../components/Table"
import ConfirmModal from "../../components/ConfirmModal"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import Cover from "../../components/Cover"
import toast from "react-hot-toast"

const MusicList = () => {
	const [searchForm, setSearchForm] = useState({
		nickNameFuzzy: "",
		status: "",
	})
	const [dataSource, setDataSource] = useState({
		list: [],
		totalCount: 0,
		pageNo: 1,
		pageSize: 50,
	})
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const [currentRow, setCurrentRow] = useState(null)
	const [confirmAction, setConfirmAction] = useState("")

	const loadDataList = async () => {
		const params = {
			pageNo: dataSource.pageNo,
			pageSize: dataSource.pageSize,
			...searchForm,
		}
		const result = await Request({
			url: Api.loadMusic,
			params,
		})
		if (result) {
			setDataSource(result.data)
		}
	}

	useEffect(() => {
		loadDataList()
	}, [dataSource.pageNo])

	const changeCommendType = (row) => {
		const action = row.commendType === 0 ? "推荐" : "取消推荐"
		setCurrentRow(row)
		setConfirmAction(action)
		setShowConfirmModal(true)
	}

	const handleConfirmAction = () => {
		if (currentRow) {
			Request({
				url: Api.changeMusicCommendType,
				params: {
					musicId: currentRow.musicId,
					commendType: currentRow.commendType === 0 ? 1 : 0,
				},
			}).then(() => {
				toast.success("操作成功")
				loadDataList()
			})
		}
		setShowConfirmModal(false)
	}

	const handleCancelAction = () => {
		setShowConfirmModal(false)
		setCurrentRow(null)
		setConfirmAction("")
	}

	const columns = [
		{
			label: "封面",
			width: 80,
			render: (row) => <Cover cover={row.cover} />,
		},
		{ label: "歌曲名称", prop: "musicTitle" },
		{ label: "作者", prop: "nickName" },
		{ label: "歌曲时长", prop: "duration" }, // 假设后端返回的是格式化好的或者秒数，这里保持原样
		{ label: "播放数", prop: "playCount" },
		{ label: "点赞数", prop: "goodCount" },
		{
			label: "推荐",
			render: (row) => (
				<span
					className={
						row.commendType === 1 ? "text-green-600 font-medium" : "text-gray-400"
					}
				>
					{row.commendType === 1 ? "已推荐" : "未推荐"}
				</span>
			),
		},
		{
			label: "状态",
			render: (row) => (
				<span className={row.musicStatus === 1 ? "text-blue-600" : "text-orange-500"}>
					{row.musicStatus === 1 ? "已完成" : "创作中..."}
				</span>
			),
		},
		{
			label: "操作",
			width: 100,
			render: (row) => {
				if (row.musicStatus !== 1) return null // 只有已完成的音乐可以推荐
				return (
					<button
						onClick={() => changeCommendType(row)}
						className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
					>
						{row.commendType === 0 ? "推荐" : "取消推荐"}
					</button>
				)
			},
		},
	]

	return (
		<div className="h-full flex flex-col">
			{/* Search Panel */}
			<div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
				<div className="flex gap-4 items-end">
					<div className="w-1/4">
						<label className="block text-xs text-gray-500 mb-1">用户昵称</label>
						<input
							className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
							placeholder="输入用户昵称"
							value={searchForm.nickNameFuzzy}
							onChange={(e) =>
								setSearchForm({ ...searchForm, nickNameFuzzy: e.target.value })
							}
						/>
					</div>
					<div className="w-1/4">
						<label className="block text-xs text-gray-500 mb-1">状态</label>
						<select
							className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
							value={searchForm.status}
							onChange={(e) =>
								setSearchForm({ ...searchForm, status: e.target.value })
							}
						>
							<option value="">全部</option>
							<option value="1">启用</option>
							<option value="0">禁用</option>
						</select>
					</div>
					<div>
						<button
							onClick={() => {
								dataSource.pageNo = 1
								loadDataList()
							}}
							className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
						>
							<Search size={16} /> 搜索
						</button>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden">
				<Table dataSource={dataSource} columns={columns} fetch={loadDataList} />
			</div>

			<ConfirmModal
				isOpen={showConfirmModal}
				onClose={handleCancelAction}
				onConfirm={handleConfirmAction}
				title="确认操作"
				message={`确定要${confirmAction}吗？`}
				confirmText="确定"
				cancelText="取消"
			/>
		</div>
	)
}

export default MusicList
