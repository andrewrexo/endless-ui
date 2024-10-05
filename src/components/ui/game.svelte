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
	import Tasks from './tasks.svelte';

	let chatboxText = $state('');
	let isChatboxFocused = $state(false);
	let chatboxInput: HTMLInputElement;

	let pressedKeys = $state(new Set<string>());

	let windowHeight = $state(0);
	let windowWidth = $state(0);
	let isLandscapeMobile = $state(false);

	const sendMessage = () => {
		EventBus.emit('chatbox:send', chatboxText);
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

	const checkLandscapeMobile = () => {
		const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
		isLandscapeMobile = isMobileDevice && window.innerWidth > window.innerHeight;
	};

	const adjustUIPositions = () => {
		if (isLandscapeMobile) {
			ui.handleButtonAction('debug', 'close');
			ui.componentPositions = ui.componentPositions.map((component) => {
				switch (component.id) {
					case 'chat':
						return { ...component, y: windowHeight - 220 };
					case 'inventory':
						return { ...component, y: windowHeight - 220 };
					case 'debug':
						return { ...component, y: 10 };
					case 'tasks':
						return { ...component, y: 50 };
					case 'status':
						return { ...component, y: 10, x: 10 };
					default:
						return component;
				}
			});
		} else {
			// Reset to default positions when not in landscape mobile mode
			ui.componentPositions = [
				{ id: 'chat', x: 10, y: 382 },
				{ id: 'context', x: 0, y: 0 },
				{ id: 'inventory', x: 647, y: 382 },
				{ id: 'debug', title: 'Debug', x: 15, y: 45 },
				{ id: 'minimap', x: 590, y: 45 },
				{ id: 'tasks', title: 'Tasks', x: 604, y: 46 },
				{ id: 'status', x: 10, y: 10 }
			];
		}
	};

	onMount(() => {
		const showUi = setTimeout(() => {
			ui.handleButtonAction('chat', 'open');
			ui.handleButtonAction('inventory', 'open');
			ui.handleButtonAction('status', 'open');
			ui.handleButtonAction('debug', 'open');
			ui.handleButtonAction('tasks', 'open');
		}, 2000);

		// Check if the device is mobile
		isLandscapeMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);

		// Set initial window dimensions and check for landscape mobile
		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;
		checkLandscapeMobile();

		// Update window dimensions and check landscape mobile on resize
		const handleResize = () => {
			windowHeight = window.innerHeight;
			windowWidth = window.innerWidth;
			checkLandscapeMobile();
			adjustUIPositions();
		};

		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleResize);

		return () => {
			clearTimeout(showUi);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('orientationchange', handleResize);
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
	class="pointer-events-none absolute flex select-none flex-col items-center justify-between"
	style={isLandscapeMobile
		? `height: ${windowHeight}px; width: 100%`
		: 'height: 100%; width: 100%;'}
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

	{#if ui.interfaces.tasks}
		<Tasks />
	{/if}

	<Shop />
	<Settings />

	<div
		class="mt-auto w-full p-2"
		style={isLandscapeMobile ? `margin-bottom: env(safe-area-inset-bottom);` : ''}
	>
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

	/* Add styles for mobile panels */
	@media (max-width: 768px) {
		:global(.panel) {
			max-height: calc(100vh - 120px); /* Adjust this value as needed */
			overflow-y: auto;
		}
	}

	/* Adjust styles for landscape mobile panels */
	@media (max-width: 1024px) and (orientation: landscape) {
		:global(.panel) {
			max-height: calc(100vh - 60px); /* Reduced from 80px */
			max-width: 25%; /* Reduced from 30% */
			overflow-y: auto;
		}
	}
</style>
