<script>
	// @ts-nocheck

	import { fly } from 'svelte/transition';
	import { EventBus } from '../../../game/event-bus';
	import Chat from '../../icons/chat.svelte';
	import Users from '../../icons/users.svelte';
	import Settings from '../../icons/settings.svelte';

	let mounted = $state(false);
	let buttons = $state([{ icon: Chat, event: 'chat-toggle' }, { icon: Users }, { icon: Settings }]);

	$effect(() => {
		mounted = true;
	});
</script>

{#each buttons as button, index}
	{#if mounted}
		<button
			onclick={() => {
				if (button.event) EventBus.emit(button.event);
			}}
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
