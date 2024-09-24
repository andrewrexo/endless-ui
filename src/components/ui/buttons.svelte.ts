export type ButtonTarget = 'chat' | 'players' | 'settings'; // Add more targets as needed
export type ButtonAction = 'toggle' | 'open' | 'close';

export function createButtonAction() {
	let interfaces = $state({
		chat: false,
		players: false,
		settings: false
	});

	function toggleInterface(target: ButtonTarget) {
		interfaces[target] = !interfaces[target];
	}

	function openInterface(target: ButtonTarget) {
		interfaces[target] = true;
	}

	function closeInterface(target: ButtonTarget) {
		interfaces[target] = false;
	}

	function handleButtonAction(target: ButtonTarget, action: ButtonAction) {
		switch (action) {
			case 'toggle':
				toggleInterface(target);
				break;
			case 'open':
				openInterface(target);
				break;
			case 'close':
				closeInterface(target);
				break;
		}
	}

	let buttons = $derived(
		Object.entries(interfaces).map(([target, isOpen]) => ({
			target: target as ButtonTarget,
			action: isOpen ? 'close' : 'open',
			label: `${isOpen ? 'Close' : 'Open'} ${target}`
		}))
	);

	return {
		get interfaces() {
			return interfaces;
		},
		get buttons() {
			return buttons;
		},
		handleButtonAction
	};
}

export const buttonActions = createButtonAction();
