<script lang="ts">
	import '../app.css';
	let { children } = $props();

	let mounted = $state(false);

	$effect(() => {
		if (mounted) return;
	});

	const loadFonts = async () => {
		const monogram = new FontFace('Monogram', 'url(/assets/fonts/monogram.ttf)');
		const abaddon = new FontFace('Abaddon', 'url(/assets/fonts/abaddon-bold.ttf)');
		await Promise.all([monogram.load(), abaddon.load()]);
		document.fonts.add(monogram);
		document.fonts.add(abaddon);
	};

	loadFonts().then(() => {
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
</style>
