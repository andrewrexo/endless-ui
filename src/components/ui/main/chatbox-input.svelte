<script lang="ts">
	import { chatboxStore } from '$lib/chatbox-store';

	let chatboxInput: HTMLInputElement;

	function handleFocus() {
		chatboxStore.isChatboxFocused = true;
	}

	function handleBlur() {
		chatboxStore.isChatboxFocused = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		chatboxStore.handleChatInput(event);
		if (event.key === 'Enter') {
			chatboxStore.sendMessage();
			chatboxInput?.blur();
		}
	}
</script>

<input
	type="text"
	bind:this={chatboxInput}
	bind:value={chatboxStore.chatboxText}
	on:focus={handleFocus}
	on:blur={handleBlur}
	on:keydown={handleKeyDown}
	placeholder="Type a message..."
/>

<style>
	input {
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

	input:focus {
		outline: none;
		outline: 1px solid white;
	}

	input::placeholder {
		color: #ccc;
	}
</style>
