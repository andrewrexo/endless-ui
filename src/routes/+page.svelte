<script lang="ts">
	import type { Scene } from 'phaser';
	import PhaserGame, { type TPhaserRef } from '../game/PhaserGame.svelte';
	let phaserRef: TPhaserRef = { game: null, scene: null };
	// Event emitted from the PhaserGame component
	const currentScene = (scene: Scene) => {};
</script>

<div id="app">
	<PhaserGame bind:phaserRef currentActiveScene={currentScene} />
</div>

<style>
	#app {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
