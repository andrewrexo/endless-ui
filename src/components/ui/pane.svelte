<script lang="ts">
	import { Pane, type PanePosition } from 'svelte-tweakpane-ui';

	export let position: PanePosition = 'draggable';
	export let title: string = 'Panel';
</script>

<Pane {position} {title}>
	<slot />
</Pane>
