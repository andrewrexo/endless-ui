<script>
	import ActionText from './main/action-text.svelte';
	import Panel from './primitives/panel.svelte';

	let time = $state(new Date().getTime());

	const tick = () => {
		time = time = new Date().getTime();
	};

	$effect(() => {
		const fetchTime = setInterval(() => tick(), 1000);

		return () => {
			clearInterval(fetchTime);
		};
	});

	let width = 140;
</script>

<Panel
	componentId="status"
	fixed={true}
	className="mt-2 self-start ml-4 z-10"
	flyParams={{ y: -50 }}
>
	<div class="flex items-center pr-2">
		<span
			class="text-abaddon pointer-events-auto flex h-1 w-full min-w-[190px] items-center gap-2 rounded-lg px-2"
		>
			<ActionText />
		</span>
		<div class="flex items-center gap-2 rounded-lg">
			<span class="text-abaddon mb-1">10</span>
			<div
				style="width: {width}px"
				class="text-abaddon pointer-events-auto flex h-1 items-center gap-2 rounded-lg bg-base-100 pr-4"
			>
				<span class="h-full w-full rounded-lg bg-success"> </span>
			</div>
			<span class="text-abaddon mb-1">10</span>

			<div
				style="width: {width}px"
				class="text-abaddon pointer-events-auto flex h-1 items-center gap-2 rounded-lg bg-base-100 pr-4 text-lg"
			>
				<span class="h-full w-full rounded-lg bg-info"> </span>
			</div>
			<span class="text-abaddon mb-1">99</span>
			<div
				style="width: {width}px"
				class="text-abaddon pointer-events-auto flex h-1 w-[{width}px] items-center gap-2 rounded-lg bg-base-100 pr-4 text-lg duration-1000"
			>
				<span class="h-full w-1/3 rounded-lg bg-warning"></span>
			</div>
			<span class="mt-1 min-w-[65px] text-right">
				{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
			</span>
		</div>
	</div>
</Panel>

<style>
	.text-right {
		font-family: 'Abaddon';
		font-size: 14px;
	}
</style>
