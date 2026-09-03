import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import App from "./App"
import { store, persistor } from "./store"
import "./styles/index.css"
import "./assets/icon/demo.css"
import "./assets/icon/iconfont.css"

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</PersistGate>
		</Provider>
	</React.StrictMode>,
)
