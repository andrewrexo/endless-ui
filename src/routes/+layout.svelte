<svelte:head>
	<title>Endless UI Demo</title>
</svelte:head>

<slot />

<style>
	:global(body) {
		background-color: #000;
		margin: 0;
		padding: 0;
		color: rgba(255, 255, 255, 0.87);
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
