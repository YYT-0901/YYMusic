import React, { Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import Layout from "../views/Layout"
import Account from "../views/account/Account"

// Lazy load components
const SysDict = React.lazy(() => import("../views/dict/SysDict"))
const ProductList = React.lazy(() => import("../views/product/ProductList"))
const PaycodeList = React.lazy(() => import("../views/paycode/PaycodeList"))
const OrderList = React.lazy(() => import("../views/order/OrderList"))
const MusicList = React.lazy(() => import("../views/music/MusicList"))
const UserList = React.lazy(() => import("../views/user/UserList"))

const router = createBrowserRouter([
	{
		path: "/login",
		element: <Account />,
	},
	{
		path: "/",
		element: <Layout />,
		children: [
			{ index: true, element: <Navigate to="/login" replace /> },
			{
				path: "dict/sysdict",
				element: (
					<Suspense fallback={<div>Loading...</div>}>
						<SysDict />
					</Suspense>
				),
			},
			{
				path: "product/productList",
				element: (
					<Suspense fallback={<div>Loading...</div>}>
						<ProductList />
					</Suspense>
				),
			},
			{
				path: "paycode/paycodeList",
				element: (
					<Suspense fallback={<div>Loading...</div>}>
						<PaycodeList />
					</Suspense>
				),
			},
			{
				path: "order/orderList",
				element: (
					<Suspense fallback={<div>Loading...</div>}>
						<OrderList />
					</Suspense>
				),
			},
			{
				path: "music/musicList",
				element: (
					<Suspense fallback={<div>Loading...</div>}>
						<MusicList />
					</Suspense>
				),
			},
			{
				path: "user/userList",
				element: (
					<Suspense fallback={<div>Loading...</div>}>
						<UserList />
					</Suspense>
				),
			},
		],
	},
])

export default router
