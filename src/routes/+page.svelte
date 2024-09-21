<script lang="ts">
	import type { Scene } from 'phaser';
	import PhaserGame, { type TPhaserRef } from '../game/PhaserGame.svelte';
	import { MainMenu } from '../game/scenes/main-menu';
	import UI from '../components/ui/game.svelte';

	let phaserRef: TPhaserRef = $state({
		game: null,
		scene: null
	});

	let isInGame = $state(false);

	let gameContainer: HTMLElement;

	const changeScene = () => {
		const scene = phaserRef.scene as MainMenu;
		if (scene) {
			scene.changeScene();
		}
	};

	const currentScene = (scene: Scene) => {
		if (scene) {
			isInGame = true;
		}
		console.log('currentScene', scene);
	};
</script>

<div id="app">
	<div id="game-container" bind:this={gameContainer}>
		<PhaserGame bind:phaserRef currentActiveScene={currentScene} />
		{#if isInGame}
			<UI />
		{/if}
	</div>
</div>

<style>
	@font-face {
		font-family: 'Monogram';
		font-style: normal;
		font-weight: 500;
		src: url('/assets/fonts/monogram.ttf');
	}

	#app {
		overflow: hidden;
		background-color: #000;
		font-family: 'Monogram';
	}

	#game-container {
		position: relative;
		overflow: hidden;
	}
</style>
