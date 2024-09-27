<script lang="ts">
	import { ui } from '$lib/user-interface.svelte';
	import { fly } from 'svelte/transition';
	import { EventBus } from '../../../game/event-bus';

	let {
		dragAction,
		position
	}: { dragAction: (node: HTMLElement) => void; position: { x: number; y: number } } = $props();

	const refreshBrowser = () => {
		window.location.reload();
	};

	const refreshScene = () => {
		EventBus.emit('refreshScene');
	};

	const openModal = () => {
		ui.handleButtonAction('shop', 'open');
	};
</script>

<div
	use:dragAction
	transition:fly={{ duration: 300, x: -20 }}
	style="position: absolute; left: {position.x}px; top: {position.y}px;"
	class="pointer-events-auto flex w-[140px] flex-col gap-1 rounded-lg bg-base-300/80 p-1"
>
	<span class="px-1 text-sm font-bold tracking-wider">Debug</span>

	<button onclick={refreshBrowser}>
		<span class="text-accent">Refresh</span>
		<span class="text-accent">client</span>
	</button>
	<button onclick={refreshScene} class="text-accent">
		<span class="">Refresh</span>
		<span class="">scene</span>
	</button>
	<button onclick={openModal} class=""> Open modal </button>
</div>

<style>
	button {
		font-family: 'Abaddon';
		@apply btn btn-sm text-sm font-light text-accent;
	}

	div > span {
		font-family: 'Abaddon';
		@apply text-sm font-bold;
	}
</style>
