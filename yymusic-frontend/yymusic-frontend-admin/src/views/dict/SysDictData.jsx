import React, { useState, useEffect, useRef } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import Table from "../../components/Table"
import Dialog from "../../components/Dialog"
import ConfirmModal from "../../components/ConfirmModal"
import toast from "react-hot-toast"

const SysDictData = ({ dictPcode, onSelect }) => {
	const [dataSource, setDataSource] = useState({ list: [], pageNo: 1, pageSize: 50 })

	// Edit Modal State
	const [showEdit, setShowEdit] = useState(false)
	const [editForm, setEditForm] = useState({})
	// Delete Confirm Modal
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [currentRow, setCurrentRow] = useState(null)

	const loadData = async () => {
		const result = await Request({
			url: Api.loadSysDict,
			params: {
				pageNo: dataSource.pageNo,
				pageSize: dataSource.pageSize,
				dictPcode: dictPcode,
			},
		})
		if (result) {
			setDataSource((prev) => ({ ...prev, ...result.data }))
			// 如果是根目录，默认选中第一个
			if (dictPcode === "0" && result.data.list.length > 0 && onSelect) {
				// 这里逻辑稍微调整，React不建议自动触发副作用，由用户点击更好，或者在Init时处理
			}
		}
	}

	useEffect(() => {
		loadData()
	}, [dictPcode, dataSource.pageNo])

	// Delete
	const handleDelete = (row) => {
		setCurrentRow(row)
		setShowDeleteConfirm(true)
	}

	const handleDeleteConfirm = () => {
		if (currentRow) {
			Request({ url: Api.delDict, params: { dictId: currentRow.dictId } }).then(() => {
				toast.success("删除成功")
				loadData()
			})
		}
		setShowDeleteConfirm(false)
		setCurrentRow(null)
	}

	const handleDeleteCancel = () => {
		setShowDeleteConfirm(false)
		setCurrentRow(null)
	}

	// Save
	const handleSave = async () => {
		if (!editForm.dictCode) return toast.error("请输入编号")
		const result = await Request({ url: Api.saveSysDict, params: editForm })
		if (result) {
			toast.success("保存成功")
			setShowEdit(false)
			loadData()
		}
	}

	const openEdit = (row = {}) => {
		setEditForm({ dictPcode, ...row })
		setShowEdit(true)
	}

	const columns = [
		{ label: "编号", prop: "dictCode", width: "30%" },
		...(dictPcode !== "0" ? [{ label: "值", prop: "dictValue", width: "20%" }] : []),
		{ label: "描述", prop: "dictDesc", width: "30%" },
		{
			label: "操作",
			width: "20%",
			render: (row) => (
				<div className="flex gap-2">
					<button
						onClick={(e) => {
							e.stopPropagation()
							openEdit(row)
						}}
						className="text-blue-500 hover:text-blue-700"
					>
						<Edit2 size={16} />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation()
							handleDelete(row)
						}}
						className="text-red-500 hover:text-red-700"
					>
						<Trash2 size={16} />
					</button>
				</div>
			),
		},
	]

	// 重写Table的行点击逻辑
	const handleRowClick = (row) => {
		if (dictPcode === "0" && onSelect) onSelect(row)
	}

	// 简单拦截Table的onClick，这里通过修改Table组件支持行点击
	// 为了简化，我们在Table.jsx里已经加了onClick

	return (
		<div className="flex flex-col h-full">
			<div className="mb-4">
				<button
					onClick={() => openEdit()}
					className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
				>
					<Plus size={16} /> 新增
				</button>
			</div>

			<div
				className="flex-1 overflow-hidden"
				onClick={(e) => {
					// 利用事件冒泡捕获行点击，或者修改Table组件传递onRowClick
				}}
			>
				{/* Table 组件需要稍微改造支持 onRowClick */}
				<div className="h-full overflow-auto">
					<table className="w-full text-sm text-left text-gray-600 border border-gray-200 rounded">
						<thead className="text-xs text-gray-700 uppercase bg-gray-50">
							<tr>
								{columns.map((col, idx) => (
									<th key={idx} className="px-4 py-3">
										{col.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{dataSource.list.map((row) => (
								<tr
									key={row.dictId}
									onClick={() => handleRowClick(row)}
									className={`border-b hover:bg-blue-50 cursor-pointer ${
										dictPcode === "0" ? "active:bg-blue-100" : ""
									}`}
								>
									{columns.map((col, idx) => (
										<td key={idx} className="px-4 py-3">
											{col.render ? col.render(row) : row[col.prop]}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<Dialog
				show={showEdit}
				title={editForm.dictId ? "修改字典" : "新增字典"}
				onClose={() => setShowEdit(false)}
				buttons={[{ text: "确定", click: handleSave }]}
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">字典编号</label>
						<input
							value={editForm.dictCode || ""}
							onChange={(e) => setEditForm({ ...editForm, dictCode: e.target.value })}
							className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
						/>
					</div>
					{dictPcode !== "0" && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								字典值
							</label>
							<input
								value={editForm.dictValue || ""}
								onChange={(e) =>
									setEditForm({ ...editForm, dictValue: e.target.value })
								}
								className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
							/>
						</div>
					)}
					<div>
						<label className="block text-sm font-medium text-gray-700">描述</label>
						<input
							value={editForm.dictDesc || ""}
							onChange={(e) => setEditForm({ ...editForm, dictDesc: e.target.value })}
							className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
						/>
					</div>
				</div>
			</Dialog>

			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				title="确认删除"
				message="确定要删除吗？"
				confirmText="确定"
				cancelText="取消"
			/>
		</div>
	)
}

export default SysDictData
