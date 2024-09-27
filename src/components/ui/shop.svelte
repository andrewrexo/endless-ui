<script lang="ts">
	import { ui } from '$lib/user-interface.svelte';
	import { fade, fly } from 'svelte/transition';
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

	let rarityToColorMap = $state(
		new Map([
			['common', 'text-[#D2B48C]'],
			['uncommon', 'text-info/50'],
			['rare', 'text-secondary/50'],
			['epic', 'text-primary/50']
		])
	);

	let items: ShopItem[] = $state([
		{
			name: 'Withered Staff',
			description: "yeah this is a shitty staff but it's all you can afford",
			price: 25,
			rarity: 'Common'
		}
	]);

	$effect(() => {
		items = Array.from({ length: shopCount }, (_, i) => ({
			name: `Item ${i + 1}`,
			description: `Description for Item ${i + 1}`,
			price: Math.floor(Math.random() * 100) + 1,
			rarity: ['common', 'uncommon', 'rare', 'epic'][Math.floor(Math.random() * 4)]
		}));
	});
</script>

{#snippet shopItemRarity(rarity: string)}
	<span class="text-sm font-light capitalize {rarityToColorMap.get(rarity)}">{rarity}</span>
{/snippet}

{#snippet shopItemPrice(price: number)}
	<div class="mono badge badge-warning badge-xs mb-1 gap-1">
		<Coin size={10} />
		<span class="mt-1">
			{price}
		</span>
	</div>
{/snippet}

{#snippet shopItemDescription(description: string)}
	<span class="text-xs text-base-content/70">{description} </span>
{/snippet}

{#snippet shopItem(item: ShopItem)}
	<button
		transition:fly={{ duration: 100, y: -100 }}
		class="btn flex h-16 w-full gap-4 rounded-lg bg-base-100 p-2 transition-all duration-300 hover:scale-[1.02] hover:bg-base-content/20"
	>
		<div class="flex w-full gap-4">
			<div class="flex h-12 w-16 items-center justify-center rounded-lg bg-base-300/50">
				<img class="h-[28px] w-[28px] scale-150" src={`/assets/red-glove.png`} alt={item.name} />
			</div>
			<div class="flex h-full w-full flex-col items-start justify-between">
				<div class="header flex w-full items-center justify-between">
					<div class="text-xl">
						{item.name}
					</div>
					<div class="mb-1 flex items-center gap-2">
						{@render shopItemPrice(item.price)}
					</div>
				</div>
				<div class="flex w-full justify-between font-light">
					{@render shopItemDescription(item.description)}
					{@render shopItemRarity(item.rarity)}
				</div>
			</div>
		</div>
	</button>
{/snippet}

<div
	class="pointer-events-auto absolute left-[80px] top-[105px] z-50 flex h-[380px] w-4/5 flex-col justify-between rounded-lg bg-neutral p-3 transition-all duration-300"
	transition:fade={{ duration: 200 }}
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
				class="animate-spin-active btn btn-circle btn-xs rounded-full bg-base-content/20 p-1 focus:ring-0 active:ring-0"
				aria-label="Close shop"
				onclick={() => {
					ui.handleButtonAction('shop', 'close');
				}}
			>
				<Close />
			</button>
		</div>
	</div>
	<div class="shop-items grid w-full grid-cols-2 gap-2">
		{#each items as item}
			{#key items.length >= 0}
				{@render shopItem(item)}
			{/key}
		{/each}
	</div>
	<div class="mt-auto flex justify-end">
		<button class="text-md btn-neutral/30 btn h-8 min-h-8 text-xl hover:scale-105">Buy</button>
	</div>
</div>

<style>
	.header,
	.shop-items,
	button {
		font-family: 'Abaddon';
	}

	.mono {
		color: #684c06;
		font-family: 'Abaddon';
		font-size: 0.85rem;
		@apply font-light tracking-normal;
	}
</style>
