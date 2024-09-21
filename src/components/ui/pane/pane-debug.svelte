<script lang="ts">
	import { Button, FpsGraph } from 'svelte-tweakpane-ui';
	import Pane from './ui/pane.svelte';

	export let changeScene: () => void;
</script>

<Pane title="Debug">
	<FpsGraph interval={50} label="FPS" rows={5} />
	<Button on:click={changeScene} title="Change Scene" />
</Pane>
