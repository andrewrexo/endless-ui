import { ui } from '$lib/user-interface.svelte';

function dragAction(node: HTMLElement, componentId: string) {
	let startX: number;
	let startY: number;
	let isDragging = false;

	function handleMouseDown(event: MouseEvent) {
		// @ts-ignore
		if (event.target && event.target.id.includes('inventory-item')) {
			return;
		}

		isDragging = true;

		const component = ui.componentPositions.find((c) => c.id === componentId);

		if (component) {
			startX = event.clientX - component.x;
			startY = event.clientY - component.y;
		}

		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		node.style.cursor = 'grab';

		if (!isDragging) return;

		const index = ui.componentPositions.findIndex((c) => c.id === componentId);

		if (index !== -1) {
			ui.updateComponentPosition(index, {
				x: event.clientX - startX,
				y: event.clientY - startY
			});
		}
	}

	function handleMouseUp() {
		isDragging = false;
		node.style.cursor = 'grab';
	}

	node.addEventListener('mousedown', handleMouseDown);
	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('mouseup', handleMouseUp);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		}
	};
}

export default dragAction;
