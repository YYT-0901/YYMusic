import React, { useState, useEffect } from "react"
import Table from "../../components/Table"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import Avatar from "../../components/Avatar"
import Dialog from "../../components/Dialog"
import ConfirmModal from "../../components/ConfirmModal"
import toast from "react-hot-toast"

const UserList = () => {
	const [searchForm, setSearchForm] = useState({ nickNameFuzzy: "", status: "" })
	const [dataSource, setDataSource] = useState({
		list: [],
		totalCount: 0,
		pageNo: 1,
		pageSize: 50,
	})

	// Integral Modal
	const [integralModal, setIntegralModal] = useState({ show: false, userId: null, amount: "" })
	// Status change confirm modal
	const [showStatusConfirm, setShowStatusConfirm] = useState(false)
	const [currentRow, setCurrentRow] = useState(null)
	const [newStatus, setNewStatus] = useState(0)

	const loadData = async () => {
		const result = await Request({
			url: Api.loadUser,
			params: { ...searchForm, pageNo: dataSource.pageNo, pageSize: dataSource.pageSize },
		})
		if (result) setDataSource(result.data)
	}

	useEffect(() => {
		loadData()
	}, [dataSource.pageNo])

	const changeStatus = (row) => {
		const newStatusValue = row.status === 0 ? 1 : 0
		setCurrentRow(row)
		setNewStatus(newStatusValue)
		setShowStatusConfirm(true)
	}

	const handleStatusConfirm = () => {
		if (currentRow) {
			Request({
				url: Api.changeUserStatus,
				params: { userId: currentRow.userId, status: newStatus },
			}).then(() => {
				toast.success("操作成功")
				loadData()
			})
		}
		setShowStatusConfirm(false)
		setCurrentRow(null)
	}

	const handleStatusCancel = () => {
		setShowStatusConfirm(false)
		setCurrentRow(null)
	}

	const submitIntegral = async () => {
		if (!integralModal.amount) return
		await Request({
			url: Api.changeIntegral,
			params: { userId: integralModal.userId, integral: integralModal.amount },
		})
		toast.success("修改成功")
		setIntegralModal({ show: false, userId: null, amount: "" })
		loadData()
	}

	const columns = [
		{ label: "头像", width: 80, render: (row) => <Avatar avatar={row.avatar} /> },
		{ label: "昵称", prop: "nickName" },
		{ label: "邮箱", prop: "email" },
		{ label: "加入时间", render: (row) => <div>{row.createTime}</div> },
		{ label: "积分", prop: "integral" },
		{
			label: "状态",
			render: (row) => (
				<span className={row.status === 1 ? "text-green-600" : "text-red-600"}>
					{row.status === 1 ? "启用" : "禁用"}
				</span>
			),
		},
		{
			label: "操作",
			render: (row) => (
				<div className="flex gap-2 text-sm">
					<button
						onClick={() => changeStatus(row)}
						className="text-blue-600 hover:underline"
					>
						{row.status === 0 ? "启用" : "禁用"}
					</button>
					<span className="text-gray-300">|</span>
					<button
						onClick={() =>
							setIntegralModal({ show: true, userId: row.userId, amount: "" })
						}
						className="text-blue-600 hover:underline"
					>
						修改积分
					</button>
				</div>
			),
		},
	]

	return (
		<div className="h-full flex flex-col">
			{/* Search Bar */}
			<div className="bg-white p-4 mb-4 rounded-lg shadow-sm flex gap-4 items-end">
				<div>
					<label className="block text-xs text-gray-500 mb-1">昵称</label>
					<input
						className="border rounded px-3 py-2 text-sm w-40"
						value={searchForm.nickNameFuzzy}
						onChange={(e) =>
							setSearchForm({ ...searchForm, nickNameFuzzy: e.target.value })
						}
						placeholder="输入用户昵称"
					/>
				</div>
				<div>
					<label className="block text-xs text-gray-500 mb-1">状态</label>
					<select
						className="border rounded px-3 py-2 text-sm w-32"
						value={searchForm.status}
						onChange={(e) => setSearchForm({ ...searchForm, status: e.target.value })}
					>
						<option value="">全部</option>
						<option value="1">启用</option>
						<option value="0">禁用</option>
					</select>
				</div>
				<button
					onClick={() => {
						dataSource.pageNo = 1
						loadData()
					}}
					className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700"
				>
					搜索
				</button>
			</div>

			<div className="flex-1 overflow-hidden">
				<Table dataSource={dataSource} columns={columns} fetch={loadData} />
			</div>

			<Dialog
				show={integralModal.show}
				title="修改积分"
				width="400px"
				buttons={[{ text: "确定", click: submitIntegral }]}
				onClose={() => setIntegralModal({ ...integralModal, show: false })}
				showCancel={false}
			>
				<div className="py-4">
					<label className="block text-sm font-medium mb-2">积分数</label>
					<input
						type="number"
						placeholder="正数增加，负数扣除"
						className="w-full border rounded px-3 py-2"
						value={integralModal.amount}
						onChange={(e) =>
							setIntegralModal({ ...integralModal, amount: e.target.value })
						}
					/>
				</div>
			</Dialog>

			<ConfirmModal
				isOpen={showStatusConfirm}
				onClose={handleStatusCancel}
				onConfirm={handleStatusConfirm}
				title="确认操作"
				message={`确定要${newStatus === 1 ? "启用" : "禁用"}该用户吗？`}
				confirmText="确定"
				cancelText="取消"
			/>
		</div>
	)
}

export default UserList
