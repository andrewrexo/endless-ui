<script lang="ts">
	import { EventBus } from './event-bus';
	import UI from '../components/ui/game.svelte';
	import { Game, type Scene } from 'phaser';
	import config from './main';
	import Context from '../components/ui/main/context.svelte';

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
	class={`relative w-full h-full ${isInGame ? 'scale-100' : 'scale-150'} transition-all duration-500`}
>
	<UI />
	<Context position={{ x: 0, y: 0 }} />
</div>

<style lang="postcss">
</style>
