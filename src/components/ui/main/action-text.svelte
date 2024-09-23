<script lang="ts">
	import { EventBus } from '../../../game/event-bus';
	import Forward from '../../icons/forward.svelte';

	interface ActionText {
		action: string;
		text: string;
	}

	let action = $state('');
	let text = $state('');

	EventBus.on('action-text', (event: ActionText) => {
		action = event.action;
		text = event.text;
	});
</script>

<div class="self-start pointer-events-auto flex flex-row gap-2 items-center text-gray-300">
	{#if action}
		<span class="h-5">
			<Forward size={16} />
		</span>
		<div class="text-md pointer-events-none action-text text-gray-300">
			{action}
			<span class="text-gray-200 text-md font-bold">{text}</span>
		</div>
	{/if}
</div>

<style>
	.action-text {
		font-family: 'Abaddon';
		font-size: 14px;
		font-weight: 300;
	}
</style>
