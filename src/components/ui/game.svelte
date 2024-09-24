<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import ButtonSelection from './main/button-selection.svelte';
	import { EventBus } from '../../game/event-bus';
	import ActionText from './main/action-text.svelte';
	import Chat from '../icons/chat.svelte';

	let chatboxText = $state('');
	let isChatboxFocused = $state(false);
	let chatboxInput: HTMLInputElement;

	const sendMessage = () => {
		EventBus.emit('chatbox:send', chatboxText);
		chatboxText = '';
		chatboxInput?.blur();
	};

	const handleGlobalKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			if (!isChatboxFocused) {
				chatboxInput?.focus();
			} else {
				const text = chatboxText.trim();
				const isEmpty = text === '';

				if (isEmpty) {
					chatboxText = '';
				}

				text ? sendMessage() : (event.target as HTMLElement)?.blur();
			}
		}
		// Prevent space from triggering game actions when chat is focused
		if (event.key === ' ' && isChatboxFocused) {
			event.preventDefault();
		}
	};

	const handleChatInput = (event: KeyboardEvent) => {
		if (event.key === ' ') {
			event.stopPropagation();
		}
	};
</script>

<svelte:window on:keydown={handleGlobalKeyDown} />

<div
	class="flex flex-col justify-between relative pointer-events-none z-10 h-full w-full"
	transition:fade={{ duration: 500 }}
>
	<ActionText />
	<div
		class="w-[370px] self-start pointer-events-auto relative text-white bottom-2 left-2"
		transition:fly={{ x: -100, duration: 300, delay: 200 }}
	>
		<input
			bind:this={chatboxInput}
			type="text"
			bind:value={chatboxText}
			placeholder="Chat..."
			class="input input-sm w-full text-lg"
			onfocus={() => {
				isChatboxFocused = true;
			}}
			onblur={() => {
				isChatboxFocused = false;
			}}
			onkeydown={handleChatInput}
		/>
	</div>
	<div class="absolute bottom-2 right-2 flex flex-row gap-2 items-end pointer-events-auto">
		<ButtonSelection />
	</div>
</div>
