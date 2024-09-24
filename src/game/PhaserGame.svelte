<script lang="ts">
	import { EventBus } from './event-bus';
	import UI from '../components/ui/game.svelte';
	import { Game, type Scene } from 'phaser';
	import config from './main';

	let isInGame = $state(false);
	let isBlurred = $state(true);

	const StartGame = (parent: string) => {
		return new Game({ ...config, parent });
	};

	$effect(() => {
		StartGame('game-container');
	});

	EventBus.on('current-scene-ready', (sceneInstance: Scene) => {
		isInGame = true;
		// Add a slight delay before removing the blur
		setTimeout(() => {
			isBlurred = false;
		}, 500);
		console.log('current-scene-ready', sceneInstance);
	});
</script>

<div
	id="game-container"
	class={`relative w-full h-full ${isInGame ? 'scale-100' : 'scale-125'} transition-all duration-300`}
>
	{#if isInGame}
		<UI />
	{/if}
</div>

<style lang="postcss">
	#game-container {
		position: relative;
		width: 800px;
		height: 600px;
	}

	:global(canvas) {
		position: absolute;
		z-index: 0;
		top: 0;
		left: 0;
		width: 800px;
		height: 600px;
	}
</style>
