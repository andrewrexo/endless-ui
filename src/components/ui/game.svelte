<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import ButtonSelection from './main/button-selection.svelte';
	import { EventBus } from '../../game/event-bus';

	let uiContainer: HTMLElement;
	let chatboxText = $state('');
	let isChatboxFocused = $state(false);
	let chatboxInput: HTMLInputElement;

	$effect(() => {
		const resizeUI = () => {
			const gameContainer = document.getElementById('game-container');
			const canvas = gameContainer?.querySelector('canvas');

			if (canvas && uiContainer) {
				const rect = canvas.getBoundingClientRect();
				uiContainer.style.width = `${rect.width}px`;
				uiContainer.style.height = `${rect.height}px`;
				uiContainer.style.top = `${rect.top}px`;
				uiContainer.style.left = `${rect.left}px`;
			}
		};

		resizeUI();
		window.addEventListener('resize', resizeUI);

		return () => {
			window.removeEventListener('resize', resizeUI);
		};
	});

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

<div class="ui-container" bind:this={uiContainer} in:fade={{ duration: 500 }}>
	<div class="top-right">
		<span class="status-text">connected: {$page.url.host}</span>
	</div>
	<div class="bottom-right">
		<ButtonSelection />
	</div>
	<div class="bottom-left">
		<input
			bind:this={chatboxInput}
			type="text"
			bind:value={chatboxText}
			placeholder="Chat..."
			onfocus={() => {
				isChatboxFocused = true;
			}}
			onblur={() => {
				isChatboxFocused = false;
			}}
			onkeydown={handleChatInput}
		/>
	</div>
</div>

<style>
	.ui-container {
		position: absolute;
		pointer-events: none; /* This allows clicks to pass through to the game */
	}

	.top-right {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		pointer-events: auto; /* This enables interactions for this element */
	}

	.bottom-right {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: flex-end;
		pointer-events: auto; /* This enables interactions for this element */
	}

	.bottom-left {
		width: 370px;
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;
		pointer-events: auto; /* This enables interactions for this element */
	}

	.bottom-left input {
		width: 100%;
		height: 1rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-family: 'Monogram';
		font-size: 16px;
		color: white;
		background: #000;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
	}

	.bottom-left input:focus {
		outline: none;
		outline: 1px solid white;
	}

	.bottom-left input::placeholder {
		color: #ccc;
	}

	.status-text {
		font-size: 1.25rem;
		user-select: none;
		color: white;
	}
</style>
