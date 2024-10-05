<script lang="ts">
	import { action } from './action.svelte';
	import Message from '../../icons/message.svelte';
	import UserInteract from '../../icons/user-interact.svelte';
	import Forward from '../../icons/forward.svelte';
	import UserOptions from '../../icons/user-options.svelte';
	import Users from '../../icons/users.svelte';
	import Chat from '../../icons/chat.svelte';
	import Bag from '../../icons/bag.svelte';

	interface ActionText {
		action: string;
		text: string;
	}

	const actionIconSet = new Map<string, any>([
		['Player', UserInteract],
		['Menu', Forward],
		['View equipment', UserOptions],
		['Add as friend', Users],
		['Send message', Chat],
		['Pick-up', Bag]
	]);
</script>

<div
	class="pointer-events-auto flex h-2 min-w-[150px] flex-row items-center gap-2 self-start text-slate-300"
>
	{#if action.actionName}
		<span class="mt-[1px] h-6">
			{@render actionIconSet.get(action.actionName)({ size: 16 })}
		</span>
		<div class="action-text pointer-events-none flex gap-1 text-slate-300">
			{action.actionName}
			<span class="text-md font-medium text-primary">{action.actionDescription}</span>
		</div>
	{:else}
		<span class="mt-[1px] h-6">
			<Forward />
		</span>
		<span class="action-text">shrube</span>
	{/if}
</div>

<style>
	.action-text {
		font-family: 'Abaddon';
		font-size: 14px;
		font-weight: 300;
	}
</style>
