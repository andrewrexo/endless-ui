import { type MenuOption } from './user-interface.svelte';
import UserInteract from '../components/icons/user-interact.svelte';
import Users from '../components/icons/users.svelte';
import Chat from '../components/icons/chat.svelte';
import { EventBus } from '../game/event-bus';
import Book from '../components/icons/book.svelte';

// Existing menuOptions for players
export const menuOptions: MenuOption[] = [
	{
		icon: UserInteract,
		option: 'View equipment',
		callback: () => {
			//alert('yo!');
		}
	},
	{
		icon: Users,
		option: 'Add as friend',
		callback: () => {
			//alert('yo2!');
		}
	},
	{
		icon: Chat,
		option: 'Send message',
		callback: () => {
			//alert('yo3!');
		}
	}
];

// New menu options for items
export const itemMenuOptions: MenuOption[] = [
	{
		icon: Chat,
		option: 'Pick up',
		callback: (itemId: string) => {
			EventBus.emit('item:pickup', itemId);
		}
	},
	{
		icon: Book,
		option: 'Examine',
		callback: (itemId: string) => {
			EventBus.emit('item:examine', itemId);
		}
	}
];
