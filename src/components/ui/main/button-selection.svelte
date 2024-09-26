<script lang="ts">
	// @ts-nocheck

	import { fly } from 'svelte/transition';
	import { EventBus } from '../../../game/event-bus';
	import Chat from '../../icons/chat.svelte';
	import Users from '../../icons/users.svelte';
	import Settings from '../../icons/settings.svelte';

	import { ui, type ButtonAction } from '../../../lib/user-interface.svelte';
	import Bag from '../../icons/bag.svelte';
	import Book from '../../icons/book.svelte';

	let mounted = $state(false);
	let buttons = $state([
		{ icon: Chat, target: 'chat', action: 'toggle' },
		{ icon: Book, target: 'inventory', action: 'toggle' },
		{ icon: Users, target: 'players', action: 'toggle' }
	]);

	$effect(() => {
		mounted = true;
	});
</script>

{#each buttons as button, index}
	{#if mounted}
		<button
			onclick={() => ui.handleButtonAction(button.target, button.action as ButtonAction)}
			transition:fly={{ x: 100, duration: 300, delay: index * 100 }}
			class="btn hover:brightness-125 transition-all hover:scale-105 btn-sm px-2"
		>
			{@render button.icon({ size: 32 })}
		</button>
	{/if}
{/each}

<style>
	button {
		width: 32px;
		height: 32px;
	}
</style>
