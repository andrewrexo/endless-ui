<script lang="ts">
	import ButtonSelection from './main/button-selection.svelte';
	import { EventBus } from '../../game/event-bus';
	import ActionText from './main/action-text.svelte';
	import { ui, type ButtonTarget } from '../../lib/user-interface.svelte';
	import Chatbox from './main/chatbox.svelte';
	import { type Message, chatbox } from '../../stores/chatStore.svelte';
	import { action } from './main/action.svelte';
	import Inventory from './inventory.svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Shop from './shop.svelte';
	import Debug from './tools/debug.svelte';
	import dragAction from '$lib/ui/panels';
	import Panel from './primitives/panel.svelte';
	import Status from './status.svelte';
	import Settings from './settings.svelte';

	let chatboxText = $state('');
	let isChatboxFocused = $state(false);
	let chatboxInput: HTMLInputElement;

	let pressedKeys = $state(new Set<string>());

	const sendMessage = () => {
		EventBus.emit('chatbox:send', chatboxText);
		chatbox.addMessage({
			sender: 'shrube',
			content: chatboxText,
			timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		});
		chatboxText = '';
		chatboxInput?.blur();
	};

	const handleKeyUp = (event: KeyboardEvent) => {
		pressedKeys.delete(event.key);
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (pressedKeys.has(event.key)) {
			return;
		}

		pressedKeys.add(event.key);

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

		// @ts-ignore
		if (event.target && event.target.type === 'text') {
			return;
		}

		if (event.key === 'Escape') {
			ui.hidePanel();
		}

		const activeHotkey = ui.interfaceHotkeys.find((value) => {
			const isHotkey = value.hotkey === event.key;
			return isHotkey && (value.modifier ? event.ctrlKey : true);
		});

		if (activeHotkey) {
			ui.handleButtonAction(activeHotkey.id as ButtonTarget, 'toggle');
		}
	};

	const handleChatInput = (event: KeyboardEvent) => {
		if (event.key === ' ') {
			event.stopPropagation();
		}
	};

	onMount(() => {
		const showUi = setTimeout(() => {
			ui.handleButtonAction('chat', 'open');
			ui.handleButtonAction('inventory', 'open');
			ui.handleButtonAction('status', 'open');
			ui.handleButtonAction('debug', 'open');
			ui.handleButtonAction('minimap', 'open');
		}, 500);

		return () => {
			clearTimeout(showUi);
		};
	});
</script>

<svelte:window
	on:keydown={handleKeyPress}
	on:keyup={handleKeyUp}
	on:contextmenu={(e) => {
		e.preventDefault();
	}}
/>

<div
	class="pointer-events-none absolute flex h-full w-full select-none flex-col items-center justify-between"
>
	{#if ui.interfaces.status}
		<Status />
	{/if}

	{#if ui.interfaces.chat}
		<Chatbox />
	{/if}

	{#if ui.interfaces.players}
		<div>Players Interface</div>
	{/if}

	{#if ui.interfaces.inventory}
		<Inventory />
	{/if}

	{#if ui.interfaces.debug}
		<Debug />
	{/if}

	<Shop />
	<Settings />

	<div class="mt-auto w-full p-2">
		<span
			class="pointer-events-auto flex w-full items-center gap-2 rounded-lg bg-base-200/90 py-2 pl-4 pr-2 text-lg"
		>
			<input
				bind:this={chatboxInput}
				bind:value={chatboxText}
				onclick={() => {
					chatboxInput.select();
				}}
				type="text"
				placeholder="Enter your message"
				class="grow select-none bg-transparent pt-1 text-sm tracking-widest text-slate-300 placeholder:tracking-widest focus:outline-none"
				onfocus={() => {
					isChatboxFocused = true;
				}}
				onblur={() => {
					isChatboxFocused = false;
				}}
				onkeydown={handleChatInput}
			/>
			<div class="pointer-events-auto flex flex-row items-end gap-2">
				<ButtonSelection />
			</div>
		</span>
	</div>
</div>

<style type="postcss">
	input {
		font-family: 'Abaddon';
	}

	.text-abaddon {
		font-family: 'Abaddon';
		font-size: 14px;

		@apply text-slate-300;
	}
</style>
