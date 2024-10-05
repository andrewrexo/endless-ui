const actionText = () => {
	let action = $state({ action: '', text: '' });
	let actionName = $derived(action.action);
	let actionDescription = $derived(action.text);

	return {
		get action() {
			return action;
		},
		set action(value) {
			action = value;
		},
		get actionName() {
			return actionName;
		},
		get actionDescription() {
			return actionDescription;
		}
	};
};

export const action = actionText();
