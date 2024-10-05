<script lang="ts">
	import { ui, type MenuOption } from '../../../lib/user-interface.svelte';
	import { action } from './action.svelte';
	import { EventBus } from '../../../game/event-bus';
	import { menuOptions, itemMenuOptions } from '$lib/context';

	let currentMenuOptions: MenuOption[];

	$: {
		currentMenuOptions = ui.contextMenuState.isItem ? itemMenuOptions : menuOptions;
		menuHeight = currentMenuOptions.length * 26;
	}

	let menuHeight: number;

	let onOptionClick = () => {
		ui.handleContextAction('close');
		ui.handleButtonAction('shop', 'open');
	};

	const onOptionMouseDown = (option: MenuOption) => {
		onOptionClick();
		if (ui.contextMenuState.isItem && ui.contextMenuState.itemId) {
			option.callback(ui.contextMenuState.itemId);
		} else {
			option.callback();
		}
	};

	const updateAction = (option: string) => {
		action.action = { action: option, text: ui.contextMenuState.name };
	};
</script>

<div
	bind:this={ui.contextMenu}
	role="button"
	tabindex={0}
	id="context-menu"
	onmouseleave={() => {
		EventBus.emit('context-hide');
	}}
	onkeydown={() => {}}
	class="absolute w-[110px] bg-base-200/80 h-[{menuHeight}px] pointer-events-none flex cursor-default flex-col overflow-hidden rounded-lg"
>
	{#if ui.contextMenuState.open}
		<div class="flex w-full justify-between p-1">
			<span class="text-sm uppercase">{ui.contextMenuState.name ?? ''}</span>
			<span class="flex text-xs font-bold text-primary">
				<svelte:component this={ui.contextMenuState.identifier} />
				{ui.contextMenuState.isItem ? '' : '99'}
			</span>
		</div>
		{#each currentMenuOptions as o}
			<button
				onmouseover={() => {
					updateAction(o.option);
				}}
				onfocus={() => {
					updateAction(o.option);
				}}
				class="option"
				onmousedown={() => {
					onOptionMouseDown(o);
				}}
			>
				{o.option}
			</button>
		{/each}
	{/if}
</div>

<style lang="postcss">
	div {
		font-family: 'Abaddon';
	}

	.option {
		@apply w-full cursor-pointer select-none p-1 py-1 text-left text-xs hover:bg-base-200 hover:text-slate-300;
	}
</style>
