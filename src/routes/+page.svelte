<script lang="ts">
	import type { Scene } from 'phaser';
	import PhaserGame, { type TPhaserRef } from '../game/PhaserGame.svelte';
	import type { MainMenu } from '../game/scenes/main-menu';
	import Debug from '../components/pane-debug.svelte';

	let phaserRef: TPhaserRef = {
		game: null,
		scene: null
	};

	const changeScene = () => {
		const scene = phaserRef.scene as MainMenu;
		if (scene) {
			scene.changeScene();
		}
	};

	// Event emitted from the PhaserGame component
	const currentScene = (scene: Scene) => {
		console.log('currentScene', scene);
	};
</script>

<div id="app">
	<Debug {changeScene} />
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
