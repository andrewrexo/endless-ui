<script lang="ts">
	import type { Scene } from 'phaser';
	import PhaserGame from '../game/PhaserGame.svelte';
	import { MainMenu } from '../game/scenes/main-menu';
	import UI from '../components/ui/game.svelte';
</script>

<div id="app">
	<div id="container">
		<PhaserGame />
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
