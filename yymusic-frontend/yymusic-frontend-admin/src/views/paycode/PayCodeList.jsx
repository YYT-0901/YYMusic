import React, { useState, useEffect } from "react"
import { Trash2, Plus, Search } from "lucide-react"
import Table from "../../components/Table"
import ConfirmModal from "../../components/ConfirmModal"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import PayCodeEdit from "./PayCodeEdit"
import toast from "react-hot-toast"

const PaycodeList = () => {
	const [searchFormData, setSearchFormData] = useState({
		createTimeStart: "",
		createTimeEnd: "",
	})
	const [dataSource, setDataSource] = useState({
		list: [],
		totalCount: 0,
		pageNo: 1,
		pageSize: 50,
	})
	const [showEdit, setShowEdit] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [currentRow, setCurrentRow] = useState(null)

	const loadDataList = async () => {
		const params = {
			pageNo: dataSource.pageNo,
			pageSize: dataSource.pageSize,
			...searchFormData,
		}

		const result = await Request({
			url: Api.loadPaycodeList,
			params,
		})

		if (result) {
			setDataSource(result.data)
		}
	}

	useEffect(() => {
		loadDataList()
	}, [dataSource.pageNo])

	const delCode = (row) => {
		setCurrentRow(row)
		setShowDeleteConfirm(true)
	}

	const handleDeleteConfirm = () => {
		if (currentRow) {
			Request({
				url: Api.delCode,
				params: { payCode: currentRow.payCode },
			}).then(() => {
				toast.success("删除成功")
				loadDataList()
			})
		}
		setShowDeleteConfirm(false)
	}

	const handleDeleteCancel = () => {
		setShowDeleteConfirm(false)
		setCurrentRow(null)
	}

	const columns = [
		{ label: "支付码", prop: "payCode", width: "20%" },
		{
			label: "金额",
			prop: "amount",
			render: (row) => `¥${row.amount.toFixed(2)}`,
		},
		{ label: "创建时间", prop: "createTime", width: "20%" },
		{
			label: "使用人",
			render: (row) => (row.nickName ? `${row.nickName}(${row.useUserId})` : "-"),
		},
		{ label: "使用时间", prop: "useTime", render: (row) => row.useTime || "-" },
		{
			label: "状态",
			width: 100,
			render: (row) =>
				row.status === 1 ? (
					<span className="text-green-600">已使用</span>
				) : (
					<span className="text-red-500">待使用</span>
				),
		},
		{
			label: "操作",
			width: 100,
			render: (row) => (
				<button
					onClick={() => delCode(row)}
					className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
				>
					<Trash2 size={14} /> 删除
				</button>
			),
		},
	]

	return (
		<div className="h-full flex flex-col">
			{/* Top Panel */}
			<div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
				<div className="flex items-end gap-4">
					<div className="flex flex-col gap-1">
						<label className="text-xs text-gray-500">日期范围</label>
						<div className="flex items-center gap-2">
							<input
								type="date"
								className="border rounded px-2 py-1.5 text-sm"
								value={searchFormData.createTimeStart}
								onChange={(e) =>
									setSearchFormData({
										...searchFormData,
										createTimeStart: e.target.value,
									})
								}
							/>
							<span className="text-gray-400">~</span>
							<input
								type="date"
								className="border rounded px-2 py-1.5 text-sm"
								value={searchFormData.createTimeEnd}
								onChange={(e) =>
									setSearchFormData({
										...searchFormData,
										createTimeEnd: e.target.value,
									})
								}
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							onClick={() => {
								dataSource.pageNo = 1
								loadDataList()
							}}
							className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
						>
							<Search size={16} /> 搜索
						</button>
						<button
							onClick={() => setShowEdit(true)}
							className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-1"
						>
							<Plus size={16} /> 新建
						</button>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden">
				<Table dataSource={dataSource} columns={columns} fetch={loadDataList} />
			</div>

			<PayCodeEdit
				show={showEdit}
				onClose={() => setShowEdit(false)}
				onReload={loadDataList}
			/>

			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				title="确认删除"
				message="你确定要删除吗？"
				confirmText="确定"
				cancelText="取消"
			/>
		</div>
	)
}

export default PaycodeList
