import type { GameObjects } from 'phaser';
import { PixelArtBox } from '../canvas/box';
import { centerX, centerY } from '../scale';
import { EventBus } from '../event-bus';

export class NativeUI extends Phaser.Scene {
	chatBox!: PixelArtBox;

	constructor() {
		super({ key: 'NativeUI' });
	}

	create() {
		//EventBus.on('chat-toggle', this.toggleChat.bind(this));

		this.addChatBox();
	}

	toggleChat() {
		this.chatBox.setVisible(!this.chatBox.visible);
	}

	addChatBox() {
		this.chatBox = new PixelArtBox(
			this,
			centerX(this.scale),
			centerY(this.scale),
			400,
			140,
			'boxTexture',
			24
		);

		const { x, y } = this.bottomLeft(this.chatBox);

		this.chatBox.setPosition(x, y);
		this.add.existing(this.chatBox).setVisible(false);
	}

	resize() {
		const { x, y } = this.bottomLeft(this.chatBox);
		this.chatBox.setPosition(x, y);
	}

	getCorner(
		object: GameObjects.Container,
		corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
	): {
		x: number;
		y: number;
	} {
		const width = this.scale.width;
		const height = this.scale.height;
		const objectWidth = object.getBounds().width;
		const objectHeight = object.getBounds().height;

		switch (corner) {
			case 'topLeft':
				return { x: objectWidth / 2, y: objectHeight / 2 };
			case 'topRight':
				return { x: width - objectWidth / 2, y: objectHeight / 2 };
			case 'bottomLeft':
				return { x: objectWidth / 2, y: height - objectHeight / 2 };
			case 'bottomRight':
				return { x: width - objectWidth / 2, y: height - objectHeight / 2 };
		}
	}

	topLeft(object: GameObjects.Container) {
		return this.getCorner(object, 'topLeft');
	}

	topRight(object: GameObjects.Container) {
		return this.getCorner(object, 'topRight');
	}

	bottomLeft(object: GameObjects.Container) {
		return this.getCorner(object, 'bottomLeft');
	}

	bottomRight(object: GameObjects.Container) {
		return this.getCorner(object, 'bottomRight');
	}
}
