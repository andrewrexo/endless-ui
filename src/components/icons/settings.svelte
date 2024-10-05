<script lang="ts">
	let { size = 24 } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="currentColor"
>
	<rect x="14" y="2" width="4" height="4" />
	<rect x="14" y="26" width="4" height="4" />
	<rect x="2" y="14" width="4" height="4" />
	<rect x="26" y="14" width="4" height="4" />
	<rect x="8" y="8" width="4" height="4" />
	<rect x="20" y="8" width="4" height="4" />
	<rect x="8" y="20" width="4" height="4" />
	<rect x="20" y="20" width="4" height="4" />
	<rect x="12" y="12" width="8" height="8" />
</svg>

<style>
	svg {
		display: block;
	}
</style>
