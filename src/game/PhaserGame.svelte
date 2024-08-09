<script context="module" lang="ts">
	import type { Game, Scene } from 'phaser';

	export type TPhaserRef = {
		game: Game | null;
		scene: Scene | null;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { EventBus } from './event-bus';
	import StartGame from './main';

	export let phaserRef: TPhaserRef = {
		game: null,
		scene: null
	};

	export let currentActiveScene: (scene: Scene) => void | undefined;

	onMount(() => {
		phaserRef.game = StartGame('game-container');

		EventBus.on('current-scene-ready', (sceneInstance: Scene) => {
			phaserRef.scene = sceneInstance;

			if (currentActiveScene) {
				currentActiveScene(sceneInstance);
			}
		});
	});
</script>

<div id="game-container"></div>
