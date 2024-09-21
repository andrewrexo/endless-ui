<script>
	// @ts-nocheck

	import { fly } from 'svelte/transition';
	import { EventBus } from '../../../game/event-bus';
	import Book from '../../icons/book.svelte';
	import Chat from '../../icons/chat.svelte';
	import Target from '../../icons/target.svelte';
	import UserOptions from '../../icons/user-options.svelte';
	import Users from '../../icons/users.svelte';

	let mounted = $state(false);
	let buttons = $state([
		{ icon: Chat, event: 'chat-toggle' },
		{ icon: Book },
		{ icon: Target },
		{ icon: UserOptions },
		{ icon: Users }
	]);

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
			transition:fly={{ y: -100, duration: 200, delay: index * 100 }}
		>
			{@render button.icon()}
		</button>
	{/if}
{/each}

<style>
	button {
		width: 32px;
		height: 32px;
		outline: none;
		border: none;
		background: url('/assets/ui/button.png') 64px 0;
		color: #8b4513;
	}

	button:hover {
		background: url('/assets/ui/button.png') 96px 0;
		opacity: 0.9;
		padding: 6px;
	}
</style>
