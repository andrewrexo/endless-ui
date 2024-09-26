<script lang="ts">
	import { fly } from 'svelte/transition';
	import Target from '../icons/target.svelte';

	let gridRows = $state(4);
	let gridCols = $state(3);

	let {
		dragAction,
		position
	}: { dragAction: (node: HTMLElement) => void; position: { x: number; y: number } } = $props();

	let gridSquares = $derived(new Array(gridRows * gridCols).fill(gridSquare));
</script>

{#snippet gridSquare()}
	<div
		class="w-10 h-8 flex justify-center items-center bg-base-content/40 rounded-md cursor-auto hover:scale-105 transition-all duration-200"
	>
		<Target size={16} />
	</div>
{/snippet}

<div
	use:dragAction
	id="inventory"
	class="bg-base-200/90 w-[150px] rounded-lg p-2 overflow-hidden pointer-events-auto text-base-content"
	in:fly={{ duration: 300, y: 20 }}
	out:fly={{ duration: 300, y: 20 }}
	style="position: absolute; left: {position.x}px; top: {position.y}px;"
>
	INVENTORY
	<div class="grid grid-cols-3 grid-rows-4 w-full h-full place-items-center gap-1 cursor-auto">
		{#each gridSquares as square}
			{@render square()}
		{/each}
	</div>
</div>

<style>
	div {
		font-family: 'Abaddon';
	}
</style>
