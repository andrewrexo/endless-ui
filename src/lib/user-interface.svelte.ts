import { type Component } from 'svelte';
import UserInteract from '../components/icons/user-interact.svelte';
import { menuOptions } from './context';
import type { Position } from '$lib';
import { action } from '../components/ui/main/action.svelte';
import { EventBus } from '../game/event-bus';

export type ButtonTarget =
	| 'chat'
	| 'players'
	| 'settings'
	| 'inventory'
	| 'status'
	| 'debug'
	| 'shop';

export type ButtonAction = 'toggle' | 'open' | 'close';

export const contextMenuOptions = ['View equipment', 'Add as friend', 'Send message'] as const;
export const contextMenuEvent = ['user-equip', 'friend-add', 'message-send'] as const;

export type ContextMenuOption = keyof typeof contextMenuOptions;

export interface MenuOption {
	icon?: Component;
	option: string;
	emit?: ContextMenuOption;
	callback: () => void;
}

export interface InterfaceProps {
	header?: string;
	data?: {};
}

export interface ContextMenuState {
	name: string;
	open: boolean;
	identifier: Component;
	options: MenuOption[];
}

export function createUserInterface() {
	let interfaces = $state({
		chat: false,
		players: false,
		settings: false,
		inventory: false,
		status: false,
		debug: false,
		shop: false
	});

	let contextMenuState: ContextMenuState = $state({
		name: '',
		open: false,
		identifier: UserInteract,
		options: menuOptions
	});

	let contextMenu: HTMLElement | null = $state(null);

	function toggleInterface(target: ButtonTarget) {
		interfaces[target] = !interfaces[target];
	}

	function openInterface(target: ButtonTarget) {
		interfaces[target] = true;
	}

	function closeInterface(target: ButtonTarget) {
		interfaces[target] = false;
	}

	function handleContextAction(
		action: ContextMenuOption | ButtonAction,
		props?: Partial<ContextMenuState>
	) {
		switch (action) {
			case 'open': {
				if (props) {
					contextMenuState = { ...contextMenuState, ...props };
				}

				contextMenuState.open = true;
				console.log('opening context menu');
				break;
			}
			case 'close': {
				contextMenuState.open = false;
				console.log('closing context menu');
				break;
			}
		}
	}

	function handleButtonAction(target: ButtonTarget, action: ButtonAction, props?: InterfaceProps) {
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

	function updateComponentPosition(index: number, position: Position) {
		componentPositions[index] = {
			...componentPositions[index],
			...position
		};
	}

	let buttons = $derived(
		Object.entries(interfaces).map(([target, isOpen]) => ({
			target: target as ButtonTarget,
			action: isOpen ? 'close' : 'open',
			label: `${isOpen ? 'Close' : 'Open'} ${target}`
		}))
	);

	let componentPositions = $state([
		{ id: 'chat', x: 10, y: 382 },
		{ id: 'context', x: 0, y: 0 },
		{ id: 'inventory', x: 647, y: 382 },
		{ id: 'debug', title: 'Debug', x: 15, y: 45 }
	]);

	let interfaceHotkeys = $state([
		{ id: 'chat', hotkey: 'c', modifier: false },
		{ id: 'inventory', hotkey: 'i', modifier: false },
		{ id: 'status', hotkey: 's', modifier: false },
		{ id: 'debug', hotkey: 'd', modifier: false }
	]);

	function hidePanel() {
		action.action = { action: '', text: '' };

		const prioritized = ['shop', 'settings', 'context', 'chat', 'inventory', 'debug'];
		const allInterfaces = Object.entries(interfaces);

		if (contextMenuState.open) {
			EventBus.emit('context-hide');
			return;
		}

		// Close prioritized interfaces first
		for (const target of prioritized) {
			if (interfaces[target as ButtonTarget]) {
				handleButtonAction(target as ButtonTarget, 'close');
				return;
			}
		}

		// Close any remaining open interface
		for (const [target, isOpen] of allInterfaces) {
			if (isOpen && !prioritized.includes(target)) {
				handleButtonAction(target as ButtonTarget, 'close');
				return;
			}
		}
	}

	return {
		handleButtonAction,
		handleContextAction,
		updateComponentPosition,
		hidePanel,
		get interfaceHotkeys() {
			return interfaceHotkeys;
		},
		get componentPositions() {
			return componentPositions;
		},
		get interfaces() {
			return interfaces;
		},
		get buttons() {
			return buttons;
		},
		get contextMenuState() {
			return contextMenuState;
		},
		get contextMenu() {
			return contextMenu;
		},
		set contextMenu(data) {
			contextMenu = data;
		}
	};
}

export const ui = createUserInterface();
