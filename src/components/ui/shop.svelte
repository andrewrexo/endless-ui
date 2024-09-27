<script lang="ts">
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Card from '../icons/card.svelte';
	import Close from '../icons/close.svelte';
	import Coin from '../icons/coin.svelte';

	interface ShopItem {
		name: string;
		description: string;
		price: number;
		rarity: string;
	}

	let shopCount = $state(8);

	let rarityToColorMap = new Map([
		['common', 'base-content/75'],
		['uncommon', 'secondary'],
		['rare', 'info'],
		['epic', 'primary']
	]);

	let items: ShopItem[] = $state([
		{
			name: 'Withered Staff',
			description: "yeah this is a shitty staff but it's all you can afford",
			price: 25,
			rarity: 'Common'
		}
	]);

	let hoveredItem = $state(null);

	function handleMouseEnter(item: ShopItem) {
		hoveredItem = item;
	}

	function handleMouseLeave() {
		hoveredItem = null;
	}

	$effect(() => {
		items = Array.from({ length: shopCount }, (_, i) => ({
			name: `Item ${i + 1}`,
			description: `Description for Item ${i + 1}`,
			price: Math.floor(Math.random() * 100) + 1,
			rarity: ['common', 'uncommon', 'rare', 'epic'][Math.floor(Math.random() * 4)]
		}));
	});
</script>

{#snippet shopItemPrice(price: number)}
	<div class="badge badge-warning badge-xs gap-1 mono">
		<Coin size={8} />
		<span class="mb-[2px]">
			{price}
		</span>
	</div>
{/snippet}

{#snippet shopItem(item: ShopItem)}
	{#key hoveredItem === item}
		<button
			class="bg-base-200 rounded-lg p-2 h-16 w-full flex gap-4 hover:bg-base-300 transition-all duration-300"
			onmouseenter={() => handleMouseEnter(item)}
			onmouseleave={handleMouseLeave}
			transition:scale={{ duration: 200, easing: quintOut, start: 0.95, opacity: 1 }}
		>
			<div class="flex w-full gap-4">
				<div class="w-12 h-12 bg-base-content rounded-lg">img</div>
				<div class="flex flex-col w-full h-full">
					<div class="flex justify-between w-full header items-start">
						<div class="text-xl">
							{item.name}
						</div>
						<div class="text-xs flex items-start gap-2">
							{@render shopItemPrice(item.price)}
							<span class="text-{rarityToColorMap.get(item.rarity)}"> {item.rarity} </span>
						</div>
					</div>
					<div class="w-full blockgap-1">
						<span class="text-xs text-base-content/70">{item.description} </span>
					</div>
				</div>
			</div>
		</button>
	{/key}
{/snippet}

<div
	class="h-[380px] absolute w-4/5 left-[80px] top-[105px] z-50 bg-base-100 rounded-lg p-3 pointer-events-auto flex flex-col justify-between"
>
	<div class="header flex justify-between pb-2">
		<div class="flex gap-2">
			<Card size={20} />
			<div class="title text-xl">
				<span class="text-primary/70">Jim's</span>
				Shop
			</div>
		</div>
		<div class="flex gap-2">
			<button
				class="bg-base-content/20 rounded-full p-1 h-6 animate-spin-active"
				aria-label="Close shop"
			>
				<Close />
			</button>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-2 shop-items w-full">
		{#each items as item}
			{@render shopItem(item)}
		{/each}
	</div>
	<div class="flex justify-end mt-auto">
		<button class="btn btn-primary h-8 hover:scale-105 min-h-8 text-black text-md text-xl"
			>Buy</button
		>
	</div>
</div>

<style>
	.header,
	.shop-items,
	button {
		font-family: 'Abaddon';
	}

	.mono {
		font-family: 'Monogram';
		font-size: 1.1rem;
	}
</style>
