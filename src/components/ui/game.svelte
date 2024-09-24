<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import ButtonSelection from './main/button-selection.svelte';
	import { EventBus } from '../../game/event-bus';
	import ActionText from './main/action-text.svelte';
	import { buttonActions } from './buttons.svelte';
	import Chatbox from './main/chatbox.svelte';
	import { chatStore } from '../../stores/chatStore.svelte';
	import type { Message } from '../../stores/chatStore.svelte';

	let chatboxText = $state('');
	let isChatboxFocused = $state(false);
	let chatboxInput: HTMLInputElement;

	let componentPositions = $state([{ id: 'chat', x: 5, y: 388 }]);

	function dragAction(node: HTMLElement, componentId: string) {
		let startX: number;
		let startY: number;
		let isDragging = false;

		function handleMouseDown(event: MouseEvent) {
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

	$effect(() => {
		const interval = setInterval(() => {
			const newMessage: Message = {
				sender: Math.random() > 0.5 ? 'shrube' : `player${Math.floor(Math.random() * 1000)}`,
				content: `Random message ${Math.floor(Math.random() * 1000)}`,
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			};
			chatStore.addMessage(newMessage);
		}, 5000);

		return () => clearInterval(interval);
	});
</script>

<svelte:window on:keydown={handleGlobalKeyDown} />

<div
	class="flex flex-col justify-between relative z-10 h-full w-full pointer-events-none"
	transition:fly={{ duration: 500, y: 100 }}
>
	<ActionText />
	{#if buttonActions.interfaces.chat}
		<Chatbox
			dragAction={(node) => dragAction(node, 'chat')}
			position={componentPositions.find((c) => c.id === 'chat') ?? { x: 0, y: 0 }}
		/>
	{/if}

	{#if buttonActions.interfaces.players}
		<div>Players Interface</div>
	{/if}

	{#if buttonActions.interfaces.settings}
		<div>Settings Interface</div>
	{/if}

	<div class="p-1">
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
				class="select-none focus:outline-none grow bg-transparent"
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
