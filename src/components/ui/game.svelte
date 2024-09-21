<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import ButtonSelection from './main/button-selection.svelte';

	let uiContainer: HTMLElement;

	$effect(() => {
		const resizeUI = () => {
			const gameContainer = document.getElementById('game-container');
			const canvas = gameContainer?.querySelector('canvas');

			if (canvas && uiContainer) {
				const rect = canvas.getBoundingClientRect();
				uiContainer.style.width = `${rect.width}px`;
				uiContainer.style.height = `${rect.height}px`;
				uiContainer.style.top = `${rect.top}px`;
				uiContainer.style.left = `${rect.left}px`;
			}
		};

		resizeUI();

		window.addEventListener('resize', resizeUI);

		return () => {
			window.removeEventListener('resize', resizeUI);
		};
	});
</script>

<div class="ui-container" bind:this={uiContainer} in:fade={{ duration: 500 }}>
	<div class="top-right">
		<span class="status-text">connected: {$page.url.host}</span>
	</div>
	<div class="bottom-right">
		<ButtonSelection />
	</div>
</div>

<style>
	.ui-container {
		position: absolute;
		pointer-events: none; /* This allows clicks to pass through to the game */
	}

	.top-right {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		pointer-events: auto; /* This enables interactions for this element */
	}

	.bottom-right {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: flex-end;
		pointer-events: auto; /* This enables interactions for this element */
	}

	.status-text {
		font-size: 1.25rem;
		user-select: none;
		color: white;
	}
</style>
