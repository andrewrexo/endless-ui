<script lang="ts">
	import { action } from './action.svelte';
	import Message from '../../icons/message.svelte';
	import UserInteract from '../../icons/user-interact.svelte';
	import Forward from '../../icons/forward.svelte';

	interface ActionText {
		action: string;
		text: string;
	}

	const actionIconSet = new Map<string, any>([
		['Player', UserInteract],
		['Talk to', Forward]
	]);
</script>

<div
	class="self-start pointer-events-auto flex flex-row gap-2 items-center text-gray-300 px-2 mt-2"
>
	{#if action.actionName}
		<span class="h-6">
			{@render actionIconSet.get(action.actionName)({ size: 16 })}
		</span>
		<div class="text-xl pointer-events-none action-text text-gray-300">
			{action.actionName}
			<span class="text-primary text-lg font-medium">{action.actionDescription}</span>
		</div>
	{/if}
</div>

<style>
	.action-text {
		font-family: 'Abaddon';
		font-size: 16px;
		font-weight: 300;
	}
</style>
