import React from "react"

const Table = ({ dataSource, columns, fetch, options = {}, showPagination = true }) => {
	const { list = [], pageNo = 1, pageSize = 50, totalCount = 0 } = dataSource

	const handlePageChange = (newPage) => {
		dataSource.pageNo = newPage
		fetch()
	}

	return (
		<div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
			<div className="flex-1 overflow-auto">
				<table className="w-full text-sm text-left text-gray-600">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
						<tr>
							{columns.map((col, idx) => (
								<th
									key={idx}
									className="px-6 py-3 font-medium"
									style={{ width: col.width }}
								>
									{col.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{list.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-10 text-center text-gray-400"
								>
									暂无数据
								</td>
							</tr>
						) : (
							list.map((row, rowIndex) => (
								<tr
									key={dataSource.rowKey ? row[dataSource.rowKey] : rowIndex}
									className="hover:bg-blue-50/50 transition-colors"
								>
									{columns.map((col, colIndex) => (
										<td key={colIndex} className="px-6 py-4">
											{col.render ? col.render(row, rowIndex) : row[col.prop]}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{showPagination && totalCount > 0 && (
				<div className="px-6 py-3 border-t border-gray-200 flex justify-end items-center gap-2">
					<span className="text-xs text-gray-500">共 {totalCount} 条</span>
					<button
						disabled={pageNo === 1}
						onClick={() => handlePageChange(pageNo - 1)}
						className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
					>
						上一页
					</button>
					<span className="text-sm px-2">{pageNo}</span>
					<button
						disabled={list.length < pageSize} // 简单判断，实际应计算总页数
						onClick={() => handlePageChange(pageNo + 1)}
						className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
					>
						下一页
					</button>
				</div>
			)}
		</div>
	)
}

export default Table
