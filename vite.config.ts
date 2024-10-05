import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig(({ mode }) => ({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte'
		})
	]
}));
