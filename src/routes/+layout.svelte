<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Hometown</title>
</svelte:head>

<main class="flex flex-col items-center justify-center h-screen">
	{@render children()}
</main>

<style>
	:global(body) {
		background-color: #000;
		margin: 0;
		padding: 0;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
