<script lang="ts">
	import { fly } from 'svelte/transition';
	import Target from '../icons/target.svelte';
	import Bag from '../icons/bag.svelte';
	import type { Component } from 'svelte';
	import Forward from '../icons/forward.svelte';
	import Panel from './primitives/panel.svelte';

	let gridRows = $state(4);
	let gridCols = $state(3);

	let gridSquares = $derived(new Array(gridRows * gridCols).fill(gridSquare));

	const testItem = {
		id: 0,
		icon: Forward,
		name: 'item',
		stats: []
	};

	let items = $derived(new Array(gridRows * gridCols).fill(testItem));
</script>

{#snippet inventoryItem(item: typeof testItem)}
	<div
		class=" pointer-events-auto flex h-full w-full items-center justify-center hover:animate-pulse"
	>
		<item.icon />
	</div>
{/snippet}

{#snippet gridSquare(index: number, item: typeof testItem)}
	<div
		id="inventory-item-{index}"
		class="btn pointer-events-none flex h-8 min-h-0 w-10 cursor-auto items-center justify-center rounded-md bg-opacity-75 p-0 transition-all duration-200"
	>
		{#if item}
			{@render inventoryItem(item)}
		{/if}
	</div>
{/snippet}

<Panel componentId="inventory" className="p-2">
	<div class="grid h-full w-full cursor-auto grid-cols-3 grid-rows-4 place-items-center gap-1">
		{#each gridSquares as square, index}
			{@render square(index, items[index])}
		{/each}
	</div>
</Panel>

<style>
	div {
		font-family: 'Abaddon';
	}
</style>
