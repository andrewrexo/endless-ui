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
	import { fly } from 'svelte/transition';
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

			const toClose = Object.entries(ui.interfaces).find(([_, value]) => value === true);

			if (toClose) {
				ui.handleButtonAction(toClose[0] as ButtonTarget, 'close');
			}
		}

		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

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

<div class="absolute flex flex-col w-full h-full pointer-events-none justify-between select-none">
	{#if ui.interfaces.status}
		<div
			in:fly={{ duration: 300, y: -20 }}
			out:fly={{ duration: 300, y: -20 }}
			class="px-4 py-2 flex flex-col gap-2 w-full text-sm"
		>
			<div
				class="flex gap-2 items-center jusify-between w-full bg-base-200/90 py-[2px] rounded-lg px-2"
			>
				<span
					class="text-abaddon w-full rounded-lg flex items-center gap-2 h-1 pointer-events-auto"
				>
					<ActionText />
				</span>
				<div class="flex items-center gap-2 w-[600px] rounded-lg px-2">
					<span class="text-abaddon h-4">10</span>
					<div
						class="text-abaddon pr-4 w-[300px] rounded-lg flex items-center gap-2 h-1 pointer-events-auto bg-base-100"
					>
						<span class="bg-success w-full h-full rounded-lg"> </span>
					</div>
					<span class="text-abaddon h-4">10</span>

					<div
						class="text-abaddon pr-4 w-[300px] rounded-lg text-lg flex items-center gap-2 h-1 pointer-events-auto bg-base-100"
					>
						<span class="bg-info w-full h-full rounded-lg"> </span>
					</div>
					<span class="text-abaddon h-4">99</span>
					<div
						class="text-abaddon pr-4 duration-1000 w-[300px] rounded-lg text-lg flex items-center gap-2 h-1 pointer-events-auto bg-base-100"
					>
						<span class="bg-warning w-1/3 h-full rounded-lg"> </span>
					</div>
					<span class="text-nowrap ml-4">
						{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>
			</div>
		</div>
	{/if}

	<Shop />
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

	<div class="p-1 mt-auto">
		<span
			class="w-full rounded-lg text-lg flex items-center gap-2 pointer-events-auto bg-base-200/90 py-2 pl-4 pr-2"
		>
			<input
				bind:this={chatboxInput}
				bind:value={chatboxText}
				onclick={() => {
					chatboxInput.select();
				}}
				type="text"
				placeholder="Chat..."
				class="select-none focus:outline-none grow text-sm pt-1 bg-transparent text-slate-300"
				onfocus={() => {
					isChatboxFocused = true;
				}}
				onblur={() => {
					isChatboxFocused = false;
				}}
				onkeydown={handleChatInput}
			/>
			<div class="flex flex-row gap-2 items-end pointer-events-auto">
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
