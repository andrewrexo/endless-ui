<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, ...props }: { children: Snippet } & HTMLAttributes<HTMLButtonElement> = $props();
</script>

<button {...props}>
	{@render children()}
</button>

<style lang="postcss">
	button {
		font-family: 'Abaddon';
		@apply btn btn-sm text-sm font-light text-accent;
	}
</style>
