export type Message = {
	sender: string;
	content: string;
	timestamp: string;
};

function createChatStore() {
	let messages = $state<Message[]>([
		{ sender: 'shrube', content: 'Welcome to the game!', timestamp: '10:00' },
		{ sender: 'player1', content: 'thanks g ur a good one', timestamp: '10:02' }
	]);

	function addMessage(message: Message) {
		messages = [...messages, message].slice(-10);
	}

	return {
		get messages() {
			return messages;
		},
		addMessage
	};
}

export const chatStore = createChatStore();
