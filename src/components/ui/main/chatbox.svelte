<script lang="ts">
	import { fly } from 'svelte/transition';
	import { chatbox as chatState } from '../../../stores/chatStore.svelte';

	let {
		dragAction,
		position
	}: { dragAction: (node: HTMLElement) => void; position: { x: number; y: number } } = $props();

	let chatbox: HTMLDivElement;

	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	$effect(() => {
		if (chatbox && chatState.messages && chatState.messages.length > 0) {
			scrollToBottom(chatbox);
		}
	});
</script>

<div
	use:dragAction
	in:fly={{ duration: 300, y: 20 }}
	out:fly={{ duration: 300, y: 20 }}
	style="position: absolute; left: {position.x}px; top: {position.y}px;"
	class="chat-container bg-base-200/80 w-[360px] rounded-lg p-2 px-1 overflow-hidden pointer-events-auto cursor-grab"
>
	<div bind:this={chatbox} class="chat-messages overflow-y-auto h-[140px] pr-2 space-y-1">
		{#each chatState.messages as message}
			<div class="rounded-lg px-[0.7rem]">
				<div
					class={`chat-header leading-none text-md ${message.sender === 'shrube' ? 'text-primary' : ''}`}
				>
					{message.sender}
					<time class="text-xs leading-none opacity-50">{message.timestamp}</time>
				</div>
				<div class="flex items-center w-full text-md text-slate-300">
					<p>{message.content}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
	.chat-messages {
		scrollbar-width: thin;
		scrollbar-color: theme(colors.neutral) theme(colors.base-300);
	}

	.chat-messages::-webkit-scrollbar {
		width: 6px;
	}

	.chat-messages::-webkit-scrollbar-track {
		background: theme(colors.base-300);
	}

	.chat-messages::-webkit-scrollbar-thumb {
		background-color: theme(colors.neutral);
		border-radius: 20px;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.chat-message {
		animation: fadeIn 0.3s ease-out;
	}
</style>
