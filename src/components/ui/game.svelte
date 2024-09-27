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

	let chatboxText = $state('');
	let isChatboxFocused = $state(false);
	let chatboxInput: HTMLInputElement;

	let time = $state(new Date().getTime());

	let componentPositions = $state([
		{ id: 'chat', x: 5, y: 388 },
		{ id: 'context', x: 0, y: 0 },
		{ id: 'inventory', x: 655, y: 385 }
	]);

	let interfaceHotkeys = $state([
		{ id: 'chat', hotkey: 'c', modifier: true },
		{ id: 'inventory', hotkey: 'e', modifier: true },
		{ id: 'status', hotkey: 's', modifier: true },
		{ id: 'debug', hotkey: 'd', modifier: true }
	]);

	function dragAction(node: HTMLElement, componentId: string) {
		let startX: number;
		let startY: number;
		let isDragging = false;

		function handleMouseDown(event: MouseEvent) {
			// @ts-ignore
			if (event.target && event.target.id.includes('inventory-item')) {
				return;
			}

			isDragging = true;

			const component = componentPositions.find((c) => c.id === componentId);
			if (component) {
				startX = event.clientX - component.x;
				startY = event.clientY - component.y;
			}

			event.preventDefault();
		}

		function handleMouseMove(event: MouseEvent) {
			node.style.cursor = 'grab';

			if (!isDragging) return;

			const index = componentPositions.findIndex((c) => c.id === componentId);
			if (index !== -1) {
				componentPositions[index] = {
					...componentPositions[index],
					x: event.clientX - startX,
					y: event.clientY - startY
				};
			}
		}

		function handleMouseUp() {
			isDragging = false;
			node.style.cursor = 'grab';
		}

		node.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return {
			destroy() {
				node.removeEventListener('mousedown', handleMouseDown);
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
			}
		};
	}

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

		// @ts-ignore
		if (event.target && event.target.type === 'text') {
			return;
		}

		if (event.key === 'Escape') {
			EventBus.emit('context-hide');
			action.action = { action: '', text: '' };

			const prioritized = ['shop', 'chat', 'inventory', 'status'];
			const allInterfaces = Object.entries(ui.interfaces);

			// Close prioritized interfaces first
			for (const target of prioritized) {
				if (ui.interfaces[target as ButtonTarget]) {
					ui.handleButtonAction(target as ButtonTarget, 'close');
					return;
				}
			}

			// Close any remaining open interface
			for (const [target, isOpen] of allInterfaces) {
				if (isOpen && !prioritized.includes(target)) {
					ui.handleButtonAction(target as ButtonTarget, 'close');
					return;
				}
			}
		}

		const activeHotkey = interfaceHotkeys.find((value) => {
			const isHotkey = value.hotkey === event.key;
			return isHotkey && (value.modifier ? event.ctrlKey : true);
		});

		if (activeHotkey) {
			ui.handleButtonAction(activeHotkey.id as ButtonTarget, 'toggle');
		}

		if (event.key === ' ' && isChatboxFocused) {
			// Prevent space from triggering game actions when chat is focused
			event.preventDefault();
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
		}, 500);

		const fetchTime = setInterval(() => {
			time = time = new Date().getTime();
		}, 1000);

		return () => {
			clearInterval(fetchTime);
			clearTimeout(showUi);
		};
	});
</script>

<svelte:window
	on:keyup={handleGlobalKeyDown}
	on:contextmenu={(e) => {
		e.preventDefault();
	}}
/>

<div class="pointer-events-none absolute flex h-full w-full select-none flex-col justify-between">
	{#if ui.interfaces.status}
		<div
			in:fly={{ duration: 300, y: -20 }}
			out:fly={{ duration: 300, y: -20 }}
			class="flex w-full flex-col gap-2 px-4 py-2 text-sm"
		>
			<div
				class="jusify-between flex w-full items-center gap-2 rounded-lg bg-base-200/90 px-2 py-[2px]"
			>
				<span
					class="text-abaddon pointer-events-auto flex h-1 w-full items-center gap-2 rounded-lg"
				>
					<ActionText />
				</span>
				<div class="flex w-[600px] items-center gap-2 rounded-lg px-2">
					<span class="text-abaddon h-4">10</span>
					<div
						class="text-abaddon pointer-events-auto flex h-1 w-[300px] items-center gap-2 rounded-lg bg-base-100 pr-4"
					>
						<span class="h-full w-full rounded-lg bg-success"> </span>
					</div>
					<span class="text-abaddon h-4">10</span>

					<div
						class="text-abaddon pointer-events-auto flex h-1 w-[300px] items-center gap-2 rounded-lg bg-base-100 pr-4 text-lg"
					>
						<span class="h-full w-full rounded-lg bg-info"> </span>
					</div>
					<span class="text-abaddon h-4">99</span>
					<div
						class="text-abaddon pointer-events-auto flex h-1 w-[300px] items-center gap-2 rounded-lg bg-base-100 pr-4 text-lg duration-1000"
					>
						<span class="h-full w-1/3 rounded-lg bg-warning"> </span>
					</div>
					<span class="ml-4 text-nowrap">
						{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>
			</div>
		</div>
	{/if}

	{#if ui.interfaces.shop}
		<Shop />
		<div
			class="pointer-events-auto absolute z-10 h-full w-full bg-black/50"
			transition:fade={{ duration: 100 }}
			onclick={() => ui.handleButtonAction('shop', 'close')}
		></div>
	{/if}

	{#if ui.interfaces.chat}
		<Chatbox
			dragAction={(node) => dragAction(node, 'chat')}
			position={componentPositions.find((c) => c.id === 'chat') ?? { x: 0, y: 0 }}
		/>
	{/if}

	{#if ui.interfaces.players}
		<div>Players Interface</div>
	{/if}

	{#if ui.interfaces.inventory}
		<Inventory
			dragAction={(node) => dragAction(node, 'inventory')}
			position={componentPositions.find((c) => c.id === 'inventory') ?? { x: 0, y: 0 }}
		/>
	{/if}

	{#if ui.interfaces.settings}
		<div>Settings Interface</div>
	{/if}

	{#if ui.interfaces.debug}
		<Debug />
	{/if}

	<div class="mt-auto p-1">
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
				placeholder="Chat..."
				class="grow select-none bg-transparent pt-1 text-sm text-slate-300 focus:outline-none"
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
