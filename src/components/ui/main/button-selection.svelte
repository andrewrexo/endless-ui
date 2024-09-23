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
			class="icon-container"
		>
			{@render button.icon()}
		</button>
	{/if}
{/each}

<style>
	button {
		padding: 0.5rem;
		width: 32px;
		height: 32px;
		outline: none;
		border: none;
		font-size: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #333;
		border: 1px solid #ccc;
		background: #eee;
		border-radius: 0.25rem;
		box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
		cursor: pointer;
	}

	button:hover {
		translate: 0 2px;
	}
</style>
