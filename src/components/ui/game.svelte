<script lang="ts">
	import ButtonSelection from './main/button-selection.svelte';
	import { EventBus } from '../../game/event-bus';
	import ActionText from './main/action-text.svelte';
	import { ui, type ButtonTarget } from '../../lib/user-interface.svelte';
	import Chatbox from './main/chatbox.svelte';
	import { type Message, chatbox } from '../../stores/chatStore.svelte';

	let chatboxText = $state('');
	let isChatboxFocused = $state(false);
	let chatboxInput: HTMLInputElement;

	let rightClickPosition = $state({ x: 0, y: 0 });

	let componentPositions = $state([
		{ id: 'chat', x: 5, y: 388 },
		{ id: 'context', x: 0, y: 0 }
	]);

	let contextMenuPosition = $derived(rightClickPosition);

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

		if (event.key === 'Escape') {
			const toClose = Object.entries(ui.interfaces).find(([_, value]) => value === true);

			if (toClose) {
				ui.handleButtonAction(toClose[0] as ButtonTarget, 'close');
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
			chatbox.addMessage(newMessage);
		}, 5000);

		return () => clearInterval(interval);
	});
</script>

<svelte:window
	on:keydown={handleGlobalKeyDown}
	on:contextmenu={(e) => {
		e.preventDefault();
	}}
/>

<div class="absolute flex flex-col w-full h-full pointer-events-none justify-between">
	<ActionText />
	{#if ui.interfaces.chat}
		<Chatbox
			dragAction={(node) => dragAction(node, 'chat')}
			position={componentPositions.find((c) => c.id === 'chat') ?? { x: 0, y: 0 }}
		/>
	{/if}

	{#if ui.interfaces.players}
		<div>Players Interface</div>
	{/if}

	{#if ui.interfaces.settings}
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
				class="select-none focus:outline-none grow bg-transparent text-slate-300"
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
