import React, { useEffect, useState } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import Request from "../../utils/Request"
import Api from "../../utils/Api"
import Cover from "../../components/Cover"
import ProductEdit from "./ProductEdit"
import ConfirmModal from "../../components/ConfirmModal"
import toast from "react-hot-toast"

// 单个可排序商品组件
const SortableItem = ({ product, onEdit, onDelete }) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: product.productId,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-[320px] flex flex-col"
		>
			<div className="h-[200px]">
				<Cover cover={product.cover} borderRadius="0" />
			</div>
			<div className="p-3 flex-1 flex flex-col justify-between">
				<h4 className="font-bold text-center truncate">{product.productName}</h4>
				<div className="text-sm text-gray-600">
					<p>价格: ¥{product.price}</p>
					<p>积分: {product.integral}</p>
					<p>
						状态:{" "}
						<span
							className={
								product.onsaleType === 1 ? "text-green-500" : "text-gray-400"
							}
						>
							{product.onsaleType === 1 ? "已上架" : "未上架"}
						</span>
					</p>
				</div>
				<div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={() => onEdit(product)}
						className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
					>
						编辑
					</button>
					<button
						onClick={() => onDelete(product)}
						className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded"
					>
						删除
					</button>
				</div>
			</div>
			{/* Drag Handle */}
			<div
				{...attributes}
				{...listeners}
				className="absolute top-2 right-2 bg-black/30 text-white p-1 rounded cursor-move opacity-0 group-hover:opacity-100"
			>
				:::
			</div>
		</div>
	)
}

const ProductList = () => {
	const [list, setList] = useState([])
	const [showEdit, setShowEdit] = useState(false)
	const [editData, setEditData] = useState(null)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [currentRow, setCurrentRow] = useState(null)

	const loadData = async () => {
		const result = await Request({ url: Api.loadProduct })
		if (result) setList(result.data)
	}

	useEffect(() => {
		loadData()
	}, [])

	const handleDragEnd = async (event) => {
		const { active, over } = event
		if (active.id !== over.id) {
			const oldIndex = list.findIndex((i) => i.productId === active.id)
			const newIndex = list.findIndex((i) => i.productId === over.id)

			// 简单的数组移动逻辑 (Frontend update)
			const newList = [...list]
			const [moved] = newList.splice(oldIndex, 1)
			newList.splice(newIndex, 0, moved)
			setList(newList)

			// Backend update
			const ids = newList.map((i) => i.productId).join(",")
			await Request({ url: Api.changeProductSort, params: { productIds: ids } })
			toast.success("排序成功")
		}
	}

	const handleDelete = (item) => {
		setCurrentRow(item)
		setShowDeleteConfirm(true)
	}

	const handleDeleteConfirm = () => {
		if (currentRow) {
			Request({ url: Api.delProduct, params: { productId: currentRow.productId } }).then(() => {
				loadData()
				setShowDeleteConfirm(false)
			})
		}
	}

	const handleDeleteCancel = () => {
		setShowDeleteConfirm(false)
		setCurrentRow(null)
	}

	return (
		<div className="h-full overflow-y-auto">
			<div className="grid grid-cols-5 gap-4">
				<div
					onClick={() => {
						setEditData(null)
						setShowEdit(true)
					}}
					className="h-[320px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:text-blue-500 text-gray-400 transition-colors"
				>
					<Plus size={48} />
				</div>

				<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext
						items={list.map((i) => i.productId)}
						strategy={rectSortingStrategy}
					>
						{list.map((item) => (
							<SortableItem
								key={item.productId}
								product={item}
								onEdit={(data) => {
									setEditData(data)
									setShowEdit(true)
								}}
								onDelete={handleDelete}
							/>
						))}
					</SortableContext>
				</DndContext>
			</div>

			<ProductEdit
			show={showEdit}
			data={editData}
			onClose={() => setShowEdit(false)}
			onSuccess={() => {
				setShowEdit(false)
				loadData()
			}}
		/>

		<ConfirmModal
			isOpen={showDeleteConfirm}
			onClose={handleDeleteCancel}
			onConfirm={handleDeleteConfirm}
			title="确认删除"
			message={`确定要删除商品 ${currentRow?.productName} 吗？`}
			confirmText="确定"
			cancelText="取消"
		/>
		</div>
	)
}

export default ProductList
