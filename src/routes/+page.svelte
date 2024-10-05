<script lang="ts">
	import PhaserGame from '../game/PhaserGame.svelte';
</script>

<div id="app">
	<div id="container">
		<PhaserGame />
	</div>
</div>

<style>
	#app {
		overflow: hidden;
	}

	#container {
		position: relative;
		overflow: hidden;
	}
</style>
