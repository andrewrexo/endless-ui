<script lang="ts">
	import { onMount } from 'svelte';
	import { EventBus } from './event-bus';
	import StartGame from './main';
	import UI from '../components/ui/game.svelte';
	import type { Scene } from 'phaser';

	let { phaserRef = $bindable() }: { phaserRef: { game: Phaser.Game; scene: Scene } } = $props();

	const currentScene = (scene: Scene) => {
		const isGameScene = scene.scene.key === 'Game';

		if (isGameScene) {
			isInGame = true;
		}
	};

	let isInGame = $state(false);

	$effect(() => {
		phaserRef.game = StartGame('game-container');

		EventBus.on('current-scene-ready', (sceneInstance: Scene) => {
			phaserRef.scene = sceneInstance;

			if (currentScene) {
				currentScene(sceneInstance);
			}
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
