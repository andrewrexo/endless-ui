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
		themes: [
			'forest',
			'halloween',
			'dim',
			'sunset',
			'pastel',
			'fantasy',
			'lofi',
			'retro',
			'emerald'
		]
	}
};
