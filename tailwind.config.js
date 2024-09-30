import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			animation: {
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [daisyui],
	daisyui: {
		themes: ['dim']
	},
	safelist: [
		{
			pattern:
				/^bg-(primary|secondary|warning|info|pink|indigo|cyan|teal|lime|amber|orange|emerald|violet|fuchsia|rose|sky)-[1-9]00$/
		},
		{
			pattern:
				/^text-(primary|secondary|warning|info|purple|pink|indigo|cyan|teal|lime|amber|orange|emerald|violet|fuchsia|rose|sky)-[1-9]00$/
		}
	]
};
