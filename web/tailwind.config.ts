import type { Config } from "tailwindcss";

export default {
	content: ["./app/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				roboto: ["Roboto", "sans-serif"],
			},
			colors: {
				"geek-blue-4": "#85A5FF",
				"Neutral-7": "#8C8C8C",
				"light-gray": "#F0F0F0",
			},
			fill: {
				"Neutral-7": "#8C8C8C", // Custom fill color for SVGs
			},
			stroke: {
				"light-gray": "#F0F0F0", // Custom stroke color for SVGs
			},
		},
	},
	plugins: [],
} satisfies Config;
