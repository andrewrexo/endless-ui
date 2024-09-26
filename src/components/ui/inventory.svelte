<script lang="ts">
	import { fly } from 'svelte/transition';
	import Target from '../icons/target.svelte';
	import Bag from '../icons/bag.svelte';

	let gridRows = $state(4);
	let gridCols = $state(3);

	let {
		dragAction,
		position
	}: { dragAction: (node: HTMLElement) => void; position: { x: number; y: number } } = $props();

	let gridSquares = $derived(new Array(gridRows * gridCols).fill(gridSquare));
</script>

{#snippet gridSquare(index: number)}
	<div
		id="inventory-item-{index}"
		class="btn p-0 min-h-0 w-10 h-8 flex justify-center items-center rounded-md cursor-auto transition-all duration-200"
	></div>
{/snippet}

<div
	use:dragAction
	id="inventory"
	class="bg-base-200/90 w-[140px] rounded-lg p-2 overflow-hidden pointer-events-auto text-base-content"
	in:fly={{ duration: 300, y: 20 }}
	out:fly={{ duration: 300, y: 20 }}
	style="position: absolute; left: {position.x}px; top: {position.y}px;"
>
	<div class="flex w-full justify-between items-center pb-1 select-none">
		<p class="text-sm">inventory</p>
		<span class="flex-1 text-right text-yellow-200 text-xs font-light">102,298</span>
	</div>
	<div class="grid grid-cols-3 grid-rows-4 w-full h-full place-items-center gap-1 cursor-auto">
		{#each gridSquares as square, index}
			{@render square(index)}
		{/each}
	</div>
</div>

<style>
	div {
		font-family: 'Abaddon';
	}
</style>
