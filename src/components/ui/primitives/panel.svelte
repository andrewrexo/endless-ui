<script lang="ts">
	import dragAction from '$lib/ui/panels';
	import { ui } from '$lib/user-interface.svelte';
	import type { Component, Snippet } from 'svelte';
	import { fly, type FlyParams } from 'svelte/transition';
	import type { HTMLAttributes } from 'svelte/elements';

	interface PanelProps extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		fixed?: boolean;
		componentId: string;
		width?: string;
		height?: string;
		flyParams?: FlyParams;
		className?: string;
	}

	let {
		children,
		fixed = false,
		componentId = '',
		width = '180',
		height = '120',
		flyParams = { duration: 300, x: -20 },
		className = '',
		...props
	}: PanelProps = $props();

	let component = $derived(ui.componentPositions.find((val) => val.id === componentId));
	let position = $derived(component ? { x: component.x, y: component.y } : { x: 0, y: 0 });

	const drag = (node: HTMLElement) => dragAction(node, componentId);
</script>

<div
	use:drag
	transition:fly={flyParams}
	class="pointer-events-auto flex flex-col gap-1 rounded-lg bg-base-300/80 {className}"
	style={!fixed
		? `${componentId != 'context' ? `position: absolute; left: ${position.x}px; top: ${position.y}px;` : ''} width: ${width}; height: ${height}`
		: ``}
	{...props}
>
	{#if component && component.title}
		<span class="px-1 tracking-wider">{component.title}</span>
	{/if}
	{@render children()}
</div>

<style>
	div > span {
		font-family: 'Abaddon';
		@apply text-sm font-medium;
	}
</style>
