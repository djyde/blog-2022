/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: [
			'cupcake'
		]
	},
	plugins: [
		require("daisyui"),
		require('@tailwindcss/typography')
	],
}
