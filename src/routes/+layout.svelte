<script lang="ts">
	import '../app.css'; // Import the CSS file
	let { children } = $props();

	let mounted = $state(false);

	$effect(() => {
		if (mounted) return;

		mounted = true;
	});
</script>

<svelte:head>
	<title>Hometown</title>
</svelte:head>

<main class="flex flex-col items-center justify-center h-screen">
	{#if mounted}
		{@render children()}
	{:else}
		<div class="flex flex-col items-center justify-center h-screen">
			<div class="loader"></div>
		</div>
	{/if}
</main>

<style>
	@font-face {
		font-family: 'Monogram';
		font-style: normal;
		font-weight: 500;
		src: url('/assets/fonts/monogram.ttf');
	}

	@font-face {
		font-family: 'Abaddon';
		font-style: normal;
		font-weight: 500;
		src: url('/assets/fonts/abaddon-bold.ttf');
	}

	:global(body) {
		background-color: #000;
		margin: 0;
		padding: 0;
		font-family: 'Monogram';
	}
</style>
