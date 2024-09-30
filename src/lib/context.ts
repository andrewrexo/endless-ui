import { type MenuOption } from './user-interface.svelte';
import UserInteract from '../components/icons/user-interact.svelte';
import Users from '../components/icons/users.svelte';
import Chat from '../components/icons/chat.svelte';

export const menuOptions: MenuOption[] = [
	{
		icon: UserInteract,
		option: 'View equipment',
		callback: () => {
			alert('yo!');
		}
	},
	{
		icon: Users,
		option: 'Add as friend',
		callback: () => {
			alert('yo2!');
		}
	},
	{
		icon: Chat,
		option: 'Send message',
		callback: () => {
			alert('yo3!');
		}
	}
];
