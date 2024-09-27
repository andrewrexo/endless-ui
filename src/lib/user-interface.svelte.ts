import { createRawSnippet, type Component, type Snippet } from 'svelte';
import UserInteract from '../components/icons/user-interact.svelte';
import { menuOptions } from './context';

export type ButtonTarget =
	| 'chat'
	| 'players'
	| 'settings'
	| 'context'
	| 'inventory'
	| 'status'
	| 'debug';

export type ButtonAction = 'toggle' | 'open' | 'close';

export const contextMenuOptions = ['View equipment', 'Add as friend', 'Send message'] as const;
export const contextMenuEvent = ['user-equip', 'friend-add', 'message-send'] as const;

export type ContextMenuOption = keyof typeof contextMenuOptions;

export interface MenuOption {
	icon?: Component;
	option: string;
	emit?: ContextMenuOption;
	callback?: () => void;
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
		context: false,
		status: false,
		debug: false
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
					contextMenuState = { ...contextMenuState, open: true, ...props };
				}
			}
			case 'close': {
				contextMenuState.open = false;
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

	let buttons = $derived(
		Object.entries(interfaces).map(([target, isOpen]) => ({
			target: target as ButtonTarget,
			action: isOpen ? 'close' : 'open',
			label: `${isOpen ? 'Close' : 'Open'} ${target}`
		}))
	);

	return {
		handleButtonAction,
		handleContextAction,
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
