<script lang="ts">
	import Modal from './primitives/modal.svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Close from '../icons/close.svelte';
	import { ui } from '$lib/user-interface.svelte';

	let volume = $state(50);
	let brightness = $state(75);
	let chatBalloons = $state(true);
	let soundEffects = $state(true);
	let zoom = $state(100);

	function saveSettings() {
		// ...
	}
</script>

<Modal componentId="settings">
	<div in:fly={{ y: 50, duration: 500, easing: quintOut }} class="modal-content">
		<div class="flex justify-between">
			<h2 class="mb-2 text-2xl font-light">Settings</h2>
			<button
				class="animate-spin-active btn btn-circle btn-xs rounded-full"
				aria-label="Close settings"
				onclick={() => {
					ui.handleButtonAction('settings', 'close');
				}}
			>
				<Close size={18} />
			</button>
		</div>
		<div class="flex flex-col gap-4">
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text mr-2">Zoom</span>
					<input
						type="range"
						bind:value={zoom}
						min="50"
						max="150"
						step="10"
						class="range-neutral range range-sm"
					/>
					<span class="label-text-alt ml-2">{zoom}%</span>
				</label>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text mr-2">Volume</span>
					<input
						type="range"
						bind:value={volume}
						min="0"
						max="100"
						class="range-neutral range range-sm"
					/>
					<span class="label-text-alt ml-2">{volume}%</span>
				</label>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text mr-2">Brightness</span>
					<input
						type="range"
						bind:value={brightness}
						min="0"
						max="100"
						class="range-neutral range range-sm"
					/>
					<span class="label-text-alt ml-2">{brightness}%</span>
				</label>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Chat Balloons</span>
					<input type="checkbox" bind:checked={chatBalloons} class="toggle-neutral toggle" />
				</label>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Sound Effects</span>
					<input type="checkbox" bind:checked={soundEffects} class="toggle-neutral toggle" />
				</label>
			</div>
		</div>
		<button onclick={saveSettings} class="btn btn-neutral mt-2 w-full font-light">
			Save Settings
		</button>
	</div>
</Modal>

<style lang="postcss">
	.modal-content {
		font-family: 'Abaddon';
		font-weight: 300;
	}

	.form-control {
		@apply flex w-full justify-between rounded-xl bg-base-100 p-2;
	}

	.label-text {
		font-size: 15px;
	}

	.label-text {
		@apply min-w-[100px] font-thin;
	}
</style>
