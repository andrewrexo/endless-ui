<script lang="ts">
	import { EventBus } from './event-bus';
	import StartGame from './main';
	import UI from '../components/ui/game.svelte';
	import type { Scene } from 'phaser';

	let game: Phaser.Game | null = null;
	let isInGame = $state(false);

	$effect(() => {
		game = StartGame('game-container');

		EventBus.on('current-scene-ready', (sceneInstance: Scene) => {
			isInGame = true;
		});
	});
</script>

<div id="game-container" class="relative w-full h-full">
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
