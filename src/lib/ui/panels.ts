import { ui } from '$lib/user-interface.svelte';

export function draggable(node: HTMLElement) {
	let isDragging = false;
	let startX: number, startY: number;
	let originalX: number, originalY: number;

	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		originalX = node.offsetLeft;
		originalY = node.offsetTop;

		// Add event listeners only when starting to drag
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;

		const dx = event.clientX - startX;
		const dy = event.clientY - startY;

		node.style.left = `${originalX + dx}px`;
		node.style.top = `${originalY + dy}px`;
	}

	function handleMouseUp() {
		isDragging = false;

		// Remove event listeners when not dragging
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	// Only add the mousedown event listener to the node
	node.addEventListener('mousedown', handleMouseDown);

	return {
		destroy() {
			// Clean up event listeners
			node.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}
	};
}

export default draggable;
