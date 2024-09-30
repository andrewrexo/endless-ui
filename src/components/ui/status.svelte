<script>
	import ActionText from './main/action-text.svelte';
	import Panel from './primitives/panel.svelte';

	let time = $state(0);

	const tick = () => {
		time = time = new Date().getTime();
	};

	$effect(() => {
		const fetchTime = setInterval(() => tick(), 1000);

		return () => {
			clearInterval(fetchTime);
		};
	});
</script>

<Panel componentId="status" fixed={true} className="mt-2">
	<div class="flex items-center">
		<span
			class="text-abaddon pointer-events-auto flex h-1 w-full min-w-[190px] items-center gap-2 rounded-lg px-2"
		>
			<ActionText />
		</span>
		<div class="flex max-w-[580px] items-center gap-2 rounded-lg">
			<span class="text-abaddon mb-1">10</span>
			<div
				class="text-abaddon pointer-events-auto flex h-1 w-[300px] items-center gap-2 rounded-lg bg-base-100 pr-4"
			>
				<span class="h-full w-full rounded-lg bg-success"> </span>
			</div>
			<span class="text-abaddon mb-1">10</span>

			<div
				class="text-abaddon pointer-events-auto flex h-1 w-[300px] items-center gap-2 rounded-lg bg-base-100 pr-4 text-lg"
			>
				<span class="h-full w-full rounded-lg bg-info"> </span>
			</div>
			<span class="text-abaddon mb-1">99</span>
			<div
				class="text-abaddon pointer-events-auto flex h-1 w-[300px] items-center gap-2 rounded-lg bg-base-100 pr-4 text-lg duration-1000"
			>
				<span class="h-full w-1/3 rounded-lg bg-warning"> </span>
			</div>
			<span class="ml-4 text-nowrap pr-2">
				{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
			</span>
		</div>
	</div>
</Panel>
