<script lang="ts">
	let { size = 16, class: className = '' } = $props();
</script>

<svg
	class={className}
	width={size}
	height={size}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
>
	<path
		d="M2 4h18v2H4v2h16v4H4v6h10v2H2V4zm20 0h-2v8h2V4zm-4 10h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2z"
		fill="currentColor"
	/>
</svg>
