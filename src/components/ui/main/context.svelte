<script lang="ts">
	import { fly } from 'svelte/transition';
	import { ui } from '../../../lib/user-interface.svelte';
	import { action } from './action.svelte';
	import { split } from 'postcss/lib/list';
	import { EventBus } from '../../../game/event-bus';

	type ContextGameData = {
		name: string;
	};

	let { position }: { position: { x: number; y: number } } = $props();

	let options = $state(['View equipment', 'Add as friend', 'Send message']);
	let menuHeight = $derived(options.length * 26);

	let onOptionClick = () => {
		ui.handleButtonAction('context', 'close');
		console.log('yo');
		ui.handleButtonAction('shop', 'open');
	};

	let onMenuClick = () => {
		ui.handleButtonAction('context', 'close');
	};

	let hidden = $derived(position.x == 0 || position.y == 0);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	in:fly={{ duration: 300, y: -20 }}
	out:fly={{ duration: 300, y: -10 }}
	bind:this={ui.contextMenu}
	onmouseleave={() => {
		EventBus.emit('context-hide');
	}}
	onclick={onMenuClick}
	id="context-menu"
	class="{hidden && 'hidden'} absolute left-[{position.x -
		110 /
			2}px] w-[110px] bg-base-200/80 h-[{menuHeight}px] pointer-events-none flex cursor-default flex-col overflow-hidden rounded-lg p-1"
>
	{#if ui.contextMenuState}
		<div class="flex w-full justify-between">
			<span class="text-sm uppercase text-slate-300">{ui.contextMenuState.name ?? ''}</span>
			<span class="flex text-xs font-bold text-primary"><ui.contextMenuState.identifier /> 99</span>
		</div>
		{#each options as option}
			<button
				onmouseover={() => {
					action.action = { action: option, text: ui.contextMenuState.name };
				}}
				onfocus={() => {}}
				class="option btn-ghost flex w-full"
				onmousedown={onOptionClick}>- {option}</button
			>
		{/each}
	{/if}
</div>

<style>
	div {
		font-family: 'Abaddon';
	}

	.option {
		@apply cursor-pointer select-none text-xs hover:text-slate-300;
	}
</style>
