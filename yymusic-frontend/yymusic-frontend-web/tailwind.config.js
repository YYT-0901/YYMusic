/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// System Primary Colors
				"system-primary": "var(--system-primary)",
				"system-primary-light": "var(--system-primary-light)",
				"system-primary-lighter": "var(--system-primary-lighter)",
				"system-primary-dark": "var(--system-primary-dark)",
				"system-primary-darker": "var(--system-primary-darker)",

				// System Secondary Colors
				"system-secondary": "var(--system-secondary)",
				"system-secondary-dark": "var(--system-secondary-dark)",

				// System Accent Colors
				"system-accent": "var(--system-accent)",
				"system-accent-dark": "var(--system-accent-dark)",
				"system-indigo": "var(--system-indigo)",
				"system-indigo-dark": "var(--system-indigo-dark)",

				// System Neutral Colors
				"system-background": "var(--system-background)",
				"system-background-light": "var(--system-background-light)",
				"system-surface": "var(--system-surface)",
				"system-surface-light": "var(--system-surface-light)",
				"system-text-primary": "var(--system-text-primary)",
				"system-text-secondary": "var(--system-text-secondary)",
				"system-text-muted": "var(--system-text-muted)",
				"system-border": "var(--system-border)",
				"system-border-light": "var(--system-border-light)",

				primary: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
					950: "#082f49",
				},
				secondary: {
					50: "#fdf4ff",
					100: "#fae8ff",
					200: "#f5d0fe",
					300: "#f0abfc",
					400: "#e879f9",
					500: "#d946ef",
					600: "#c026d3",
					700: "#a21caf",
					800: "#86198f",
					900: "#701a75",
					950: "#4a044e",
				},
			},
			fontFamily: {
				sans: [
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial",
					'"Noto Sans"',
					"sans-serif",
				],
			},
			boxShadow: {
				custom: "0 2px 12px rgba(0, 0, 0, 0.08)",
				"custom-hover": "0 4px 20px rgba(0, 0, 0, 0.12)",
			},
			animation: {
				"fade-in": "fadeIn 0.3s ease-in-out",
				"slide-up": "slideUp 0.3s ease-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
			},
		},
	},
	plugins: [],
	corePlugins: {
		preflight: false, // 禁用 Tailwind 的 CSS 重置，使用自定义的全局样式
	},
}
