<script>
	import Panel from './primitives/panel.svelte';
	import SolarMapArrowRightBoldDuotone from '~icons/solar/map-arrow-right-bold-duotone';
</script>

<Panel componentId="tasks" className="w-[180px]  p-2 py-1">
	<div class="panel-body">
		<ul>
			<li><SolarMapArrowRightBoldDuotone /> Getting Started</li>
		</ul>
	</div>
</Panel>

<style lang="postcss">
	.panel-header h2 {
		font-family: 'Abaddon';
		color: #eee;
		text-shadow:
			-1px -1px 0 #000,
			1px -1px 0 #000,
			-1px 1px 0 #000,
			1px 1px 0 #000;
	}

	.panel-body li {
		font-family: 'Abaddon';

		@apply flex cursor-default select-none gap-3 text-sm transition-all hover:translate-x-1 hover:text-primary;
		text-shadow:
			-1px -1px 0 #000,
			1px -1px 0 #000,
			-1px 1px 0 #000,
			1px 1px 0 #000;
	}
</style>
