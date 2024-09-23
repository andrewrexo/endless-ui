<script lang="ts">
	import type { Scene } from 'phaser';
	import PhaserGame, { type TPhaserRef } from '../game/PhaserGame.svelte';
	import { MainMenu } from '../game/scenes/main-menu';
	import UI from '../components/ui/game.svelte';

	let phaserRef: TPhaserRef = $state({
		game: null,
		scene: null
	});

	let gameContainer: HTMLElement;

	const changeScene = () => {
		const scene = phaserRef.scene as MainMenu;
		if (scene) {
			scene.changeScene();
		}
	};

	let isInGame = $state(false);
</script>

<div id="app">
	<div id="container" bind:this={gameContainer}>
		<PhaserGame bind:phaserRef />
	</div>
</div>

<style>
	#app {
		overflow: hidden;
		background-color: #000;
	}

	#container {
		position: relative;
		overflow: hidden;
	}
</style>
