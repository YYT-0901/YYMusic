import React, { useState, useEffect } from "react"
import { Search } from "lucide-react"
import Table from "../../components/Table"
import Request from "../../utils/Request"
import Api from "../../utils/Api"

const OrderList = () => {
	const STATUS_LIST = [
		{ status: 0, desc: "待支付" },
		{ status: 1, desc: "已支付" },
		{ status: -1, desc: "已超时" },
	]

	const [searchForm, setSearchForm] = useState({
		orderId: "",
		nickNameFuzzy: "",
		status: "",
	})
	const [dataSource, setDataSource] = useState({
		list: [],
		totalCount: 0,
		pageNo: 1,
		pageSize: 50,
	})

	const loadDataList = async () => {
		const params = {
			pageNo: dataSource.pageNo,
			pageSize: dataSource.pageSize,
			...searchForm,
		}
		const result = await Request({
			url: Api.loadOrder,
			params,
		})
		if (result) {
			setDataSource(result.data)
		}
	}

	useEffect(() => {
		loadDataList()
	}, [dataSource.pageNo])

	const getStatusName = (status) => {
		return STATUS_LIST.find((item) => item.status === status)?.desc || "未知"
	}

	const columns = [
		{
			label: "订单信息",
			width: "30%",
			render: (row) => (
				<div className="flex flex-col gap-1 text-xs">
					<div>
						支付订单号：<span className="text-gray-600">{row.orderId}</span>
					</div>
					<div>
						通道订单号：
						<span className="text-gray-600">{row.channelOrderId || "-"}</span>
					</div>
				</div>
			),
		},
		{
			label: "时间",
			width: "20%",
			render: (row) => (
				<div className="flex flex-col gap-1 text-xs">
					<div>创建：{row.createTime}</div>
					{row.payTime && <div>支付：{row.payTime}</div>}
				</div>
			),
		},
		{
			label: "用户",
			render: (row) => (
				<div className="text-sm">
					{row.nickName}
					<span className="text-gray-400 text-xs ml-1">({row.userId})</span>
				</div>
			),
		},
		{ label: "商品名称", prop: "productName" },
		{ label: "金额", prop: "amount", render: (row) => `¥${row.amount}` },
		{ label: "购买积分", prop: "integral" },
		{
			label: "状态",
			render: (row) => {
				const colors = { 0: "text-blue-500", 1: "text-green-500", "-1": "text-gray-400" }
				return <span className={colors[row.status]}>{getStatusName(row.status)}</span>
			},
		},
	]

	return (
		<div className="h-full flex flex-col">
			{/* Search Bar */}
			<div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
				<div className="grid grid-cols-4 gap-4 items-end">
					<div>
						<label className="block text-xs text-gray-500 mb-1">订单ID</label>
						<input
							className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
							placeholder="输入完整的订单ID"
							value={searchForm.orderId}
							onChange={(e) =>
								setSearchForm({ ...searchForm, orderId: e.target.value })
							}
						/>
					</div>

					<div>
						<label className="block text-xs text-gray-500 mb-1">状态</label>
						<select
							className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
							value={searchForm.status}
							onChange={(e) =>
								setSearchForm({ ...searchForm, status: e.target.value })
							}
						>
							<option value="">全部</option>
							{STATUS_LIST.map((item) => (
								<option key={item.status} value={item.status}>
									{item.desc}
								</option>
							))}
						</select>
					</div>
					<div>
						<button
							onClick={() => {
								dataSource.pageNo = 1
								loadDataList()
							}}
							className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
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
		</div>
	)
}

export default OrderList
