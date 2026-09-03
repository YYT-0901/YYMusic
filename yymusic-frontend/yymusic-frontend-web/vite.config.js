import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@components": path.resolve(__dirname, "src/components"),
			"@pages": path.resolve(__dirname, "src/pages"),
			"@hooks": path.resolve(__dirname, "src/hooks"),
			"@services": path.resolve(__dirname, "src/services"),
			"@store": path.resolve(__dirname, "src/store"),
			"@utils": path.resolve(__dirname, "src/utils"),
			"@styles": path.resolve(__dirname, "src/styles"),
			"@test": path.resolve(__dirname, "src/test"),
		},
	},
	server: {
		port: 3000,
		open: true,
		proxy: {
			"/api": {
				target: process.env.VITE_API_URL || "http://localhost:8090",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, "/api"),
			},
		},
	},
	build: {
		outDir: "dist",
		assetsDir: "assets",
		sourcemap: false,
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
		},
		rollupOptions: {
			output: {
				chunkFileNames: "js/[name]-[hash].js",
				entryFileNames: "js/[name]-[hash].js",
				assetFileNames: "[ext]/[name]-[hash].[ext]",
				manualChunks: {
					vendor: ["react", "react-dom", "react-router-dom"],
					utils: ["axios", "dayjs", "lodash"],
				},
			},
		},
	},
	define: {
		"process.env": {},
	},
})
