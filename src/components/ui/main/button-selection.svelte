<script lang="ts">
	// @ts-nocheck

	import { fly } from 'svelte/transition';
	import { EventBus } from '../../../game/event-bus';
	import Chat from '../../icons/chat.svelte';
	import Users from '../../icons/users.svelte';
	import Settings from '../../icons/settings.svelte';

	import { buttonActions, type ButtonAction } from '../buttons.svelte';

	let mounted = $state(false);
	let buttons = $state([
		{ icon: Chat, target: 'chat', action: 'toggle' },
		{ icon: Users, target: 'players', action: 'toggle' },
		{ icon: Settings, target: 'settings', action: 'toggle' }
	]);

	$effect(() => {
		mounted = true;
	});
</script>

{#each buttons as button, index}
	{#if mounted}
		<button
			onclick={() => buttonActions.handleButtonAction(button.target, button.action as ButtonAction)}
			transition:fly={{ x: 100, duration: 300, delay: index * 100 }}
			class="btn btn-primary btn-sm px-2"
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
