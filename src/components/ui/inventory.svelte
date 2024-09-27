<script lang="ts">
	import { fly } from 'svelte/transition';
	import Target from '../icons/target.svelte';
	import Bag from '../icons/bag.svelte';
	import type { Component } from 'svelte';
	import Forward from '../icons/forward.svelte';

	let gridRows = $state(4);
	let gridCols = $state(3);

	let {
		dragAction,
		position
	}: { dragAction: (node: HTMLElement) => void; position: { x: number; y: number } } = $props();

	let gridSquares = $derived(new Array(gridRows * gridCols).fill(gridSquare));

	let bounce = $state(false);

	const bounceEffect = () => {
		bounce = true;

		setTimeout(() => {
			bounce = false;
		});
	};

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
		class=" pointer-events-auto hover:animate-pulse w-full h-full flex items-center justify-center"
	>
		<item.icon />
	</div>
{/snippet}

{#snippet gridSquare(index: number, item: typeof testItem)}
	<div
		id="inventory-item-{index}"
		class="btn p-0 min-h-0 w-10 h-8 pointer-events-none flex justify-center items-center rounded-md cursor-auto transition-all bg-opacity-75 duration-200"
	>
		{#if item}
			{@render inventoryItem(item)}
		{/if}
	</div>
{/snippet}

<div
	use:dragAction
	id="inventory"
	class="bg-base-200/90 w-[140px] rounded-lg p-2 overflow-hidden pointer-events-auto text-slate-300"
	in:fly={{ duration: 300, y: 20 }}
	out:fly={{ duration: 300, y: 20 }}
	style="position: absolute; left: {position.x}px; top: {position.y}px;"
>
	<div class="flex w-full justify-between items-center pb-1 select-none">
		<p class="text-sm"></p>
		<span class="flex-1 text-right text-yellow-200 text-xs font-light"></span>
	</div>
	<div class="grid grid-cols-3 grid-rows-4 w-full h-full place-items-center gap-1 cursor-auto">
		{#each gridSquares as square, index}
			{@render square(index, items[index])}
		{/each}
	</div>
</div>

<style>
	div {
		font-family: 'Abaddon';
	}
</style>
