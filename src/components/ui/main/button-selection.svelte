<script lang="ts">
	// @ts-nocheck

	import { fly } from 'svelte/transition';
	import { EventBus } from '../../../game/event-bus';

	import { ui, type ButtonAction } from '../../../lib/user-interface.svelte';
	import FluentChatMail20Filled from '~icons/fluent/chat-mail-20-filled';
	import GisLocationMan from '~icons/gis/location-man';
	import PhTreasureChestFill from '~icons/ph/treasure-chest-fill';
	import FluentWrenchSettings24Filled from '~icons/fluent/wrench-settings-24-filled';

	let mounted = $state(false);
	let buttons = $state([
		{ icon: FluentChatMail20Filled, target: 'chat', action: 'toggle' },
		{ icon: PhTreasureChestFill, target: 'inventory', action: 'toggle' },
		{ icon: GisLocationMan, target: 'map', action: 'toggle' },
		{ icon: FluentWrenchSettings24Filled, target: 'settings', action: 'toggle' }
	]);

	$effect(() => {
		mounted = true;
	});
</script>

{#each buttons as button, index}
	{#if mounted}
		<button
			onclick={() => ui.handleButtonAction(button.target, button.action as ButtonAction)}
			transition:fly={{ x: 100, duration: 300, delay: index * 100 + 400 }}
			class="btn btn-sm px-2 transition-all hover:scale-105 hover:brightness-125"
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
