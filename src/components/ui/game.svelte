<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import ButtonSelection from './main/button-selection.svelte';
	import { EventBus } from '../../game/event-bus';

	let uiContainer: HTMLElement;
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
	bind:this={uiContainer}
	in:fade={{ duration: 500 }}
>
	<div class="self-end m-2 pointer-events-auto"></div>
	<div class="w-[370px] self-start m-2 pointer-events-auto">
		<input
			bind:this={chatboxInput}
			type="text"
			bind:value={chatboxText}
			placeholder="Chat..."
			class="w-full h-6 border border-gray-300 rounded px-2 py-1 text-gray-800 bg-gray-200 shadow-md focus:outline-none"
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

<style>
	input {
		font-family: 'Monogram';
	}
</style>
