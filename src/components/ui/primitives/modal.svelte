<script lang="ts">
	import { ui, type ButtonTarget } from '$lib/user-interface.svelte';
	import type { Snippet } from 'svelte';
	let { children, componentId, ...props }: { children: Snippet; componentId: ButtonTarget } =
		$props();

	let sendBehind = $state(false);
	let component = $derived(ui.interfaces[componentId]);

	$effect(() => {
		if (!component) {
			setTimeout(() => {
				sendBehind = true;
			}, 200);
		} else {
			sendBehind = false;
		}
	});

	$effect(() => {
		const modal = document.getElementById(`${componentId}-modal`) as HTMLDialogElement;
		component && modal ? modal.showModal() : modal.close();
	});
</script>

<dialog id="{componentId}-modal" class:-z-50={sendBehind} class="modal" {...props}>
	<div
		class="modal-box pointer-events-auto z-50 flex min-w-[600px] flex-col justify-between gap-2 rounded-lg bg-base-200 p-3"
	>
		{@render children()}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={() => ui.handleButtonAction(componentId, 'close')}>close</button>
	</form>
</dialog>
