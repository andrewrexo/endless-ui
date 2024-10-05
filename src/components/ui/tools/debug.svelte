<script lang="ts">
	import { ui } from '$lib/user-interface.svelte';
	import { EventBus } from '../../../game/event-bus';
	import { invoke } from '@tauri-apps/api/tauri';
	import Panel from '../primitives/panel.svelte';
	import Button from '../primitives/button.svelte';

	const refreshBrowser = () => {
		window.location.reload();
	};

	const refreshScene = () => {
		EventBus.emit('refreshScene');
	};

	const openModal = () => {
		ui.handleButtonAction('shop', 'open');
	};

	const openBrowserDevtools = () => {
		if ('__TAURI__' in window) {
			invoke('open_devtools');
			return;
		}

		// This will trigger a breakpoint if DevTools is open
		debugger;
	};
</script>

<Panel componentId="debug" className="p-1">
	<Button onclick={refreshBrowser}>Refresh client</Button>
	<Button onclick={refreshScene}>Refresh scene</Button>
	<Button onclick={openModal}>Open modal</Button>
	<Button onclick={openBrowserDevtools}>Open Devtools</Button>
</Panel>
