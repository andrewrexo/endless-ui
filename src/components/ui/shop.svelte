<script lang="ts">
	import { ui } from '$lib/user-interface.svelte';
	import Card from '../icons/card.svelte';
	import Close from '../icons/close.svelte';
	import Coin from '../icons/coin.svelte';
	import Modal from './primitives/modal.svelte';

	interface ShopItem {
		name: string;
		description: string;
		price: number;
		rarity: string;
	}

	let shopCount = $state(8);

	let items: ShopItem[] = $derived(
		Array.from({ length: shopCount }, (_, i) => ({
			name: `Item ${i + 1}`,
			description: `Description for Item ${i + 1}`,
			price: Math.floor(Math.random() * 100) + 1,
			rarity: ['common', 'uncommon', 'rare', 'epic'][Math.floor(Math.random() * 4)]
		}))
	);
</script>

{#snippet shopItemPrice(price: number)}
	<div class="mono badge-xs mb-1 flex items-center gap-1">
		<Coin size={10} />
		<span class="mt-1">
			{price}
		</span>
	</div>
{/snippet}

{#snippet shopItem(item: ShopItem)}
	<button
		class="btn flex h-fit w-full min-w-[200px] gap-4 rounded-lg bg-base-100 p-2 transition-all duration-300 hover:scale-[1.02] hover:bg-base-content/20"
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
				<div class="flex h-full w-full justify-between text-left font-light">
					<span class="text-xs text-base-content/70">{item.description} </span>
				</div>
			</div>
		</div>
	</button>
{/snippet}

<Modal componentId="shop">
	<div class="header flex justify-between pb-2">
		<div class="flex items-center gap-2">
			<div class="flex gap-1 text-secondary">
				<Card size={18} />

				<span class="text-accent">Jim's</span>
				<span class="">Shop</span>
			</div>
		</div>
		<div class="flex gap-2">
			<button
				class="animate-spin-active btn btn-circle btn-xs rounded-full"
				aria-label="Close shop"
				onclick={() => {
					ui.handleButtonAction('shop', 'close');
				}}
			>
				<Close size={18} />
			</button>
		</div>
	</div>
	<div class="shop-items grid w-full grid-cols-2 gap-2">
		{#each items as item}
			{@render shopItem(item)}
		{/each}
	</div>
	<div class="mt-auto flex justify-end pt-1">
		<button class="rounded-sl text-transparent hover:scale-105"
			><span class="text-lg text-accent">Buy</span>
		</button>
	</div>
</Modal>

<style lang="postcss">
	.header,
	.shop-items,
	button {
		font-family: 'Abaddon';
	}

	button:active,
	button:focus,
	button:focus-visible {
		@apply ring-0;
	}

	.gradient-text {
		@apply box-decoration-clone bg-clip-text text-transparent;
		/* Direction */
		@apply bg-gradient-to-br;
		/* Color Stops */
		@apply from-secondary via-accent to-info;
	}

	.mono {
		font-family: 'Abaddon';
		font-size: 0.9rem;
		@apply font-light tracking-widest text-warning;
	}
</style>
