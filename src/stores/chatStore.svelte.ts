export type Message = {
	sender: string;
	content: string;
	timestamp: string;
};

function createChatState() {
	let messages = $state<Message[]>([]);

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

export const chatbox = createChatState();
