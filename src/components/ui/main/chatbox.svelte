<script lang="ts">
	import { fly } from 'svelte/transition';
	import { chatbox as chatState } from '../../../stores/chatStore.svelte';
	import Panel from '../primitives/panel.svelte';

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

<Panel
	componentId="chat"
	className="chat-container bg-base-200/90 w-[360px] rounded-lg p-2 px-0 overflow-hidden pointer-events-auto cursor-grab"
>
	<div bind:this={chatbox} class="chat-messages h-[140px] w-full space-y-1 overflow-y-auto pr-2">
		{#each chatState.messages as message}
			<div class="w-full rounded-lg px-[0.7rem]">
				<div
					class={`chat-header leading-none ${message.sender === 'shrube' ? 'text-secondary/80' : 'text-slate-200'}`}
				>
					<time class="leading-none text-slate-100 opacity-50">{message.timestamp}</time>
					{message.sender}
				</div>
				<div class="flex w-full items-center text-slate-300">
					<p class="w-full flex-wrap text-wrap break-words">{message.content}</p>
				</div>
			</div>
		{/each}
	</div>
</Panel>

<style lang="postcss">
	.chat-messages {
		font-family: 'Abaddon';
		font-size: 0.75rem;
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
