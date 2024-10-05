<script lang="ts">
	import { action } from './action.svelte';
	import Message from '../../icons/message.svelte';
	import UserInteract from '../../icons/user-interact.svelte';
	import Forward from '../../icons/forward.svelte';
	import UserOptions from '../../icons/user-options.svelte';
	import Users from '../../icons/users.svelte';
	import Chat from '../../icons/chat.svelte';

	interface ActionText {
		action: string;
		text: string;
	}

	const actionIconSet = new Map<string, any>([
		['Player', UserInteract],
		['Menu', Forward],
		['View equipment', UserOptions],
		['Add as friend', Users],
		['Send message', Chat]
	]);
</script>

<div
	class="min-w-[150px] self-start pointer-events-auto h-2 flex flex-row gap-2 items-center text-slate-300"
>
	{#if action.actionName}
		<span class="h-6 mt-[1px]">
			{@render actionIconSet.get(action.actionName)({ size: 16 })}
		</span>
		<div class="pointer-events-none action-text text-slate-300 flex gap-1">
			{action.actionName}
			<span class="text-primary text-md font-medium">{action.actionDescription}</span>
		</div>
	{:else}
		<span class="h-6 mt-[1px]">
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
