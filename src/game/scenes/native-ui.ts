import type { GameObjects } from 'phaser';
import { PixelArtBox } from '../canvas/box';
import { centerX, centerY } from '../scale';
import { EventBus } from '../event-bus';
import { ui } from '$lib/user-interface.svelte';
import type { NPC } from '../entities/npc';
import type { PlayerSprite } from '../entities/player-sprite';
import type { Game } from './game';
import { MapItem } from '../entities/item';

export class NativeUI extends Phaser.Scene {
	chatBox!: PixelArtBox;
	minimap!: Phaser.GameObjects.Graphics;
	minimapContainer!: Phaser.GameObjects.Container;
	contextMenu!: Phaser.GameObjects.DOMElement;

	constructor() {
		super({ key: 'NativeUI' });
	}

	create() {
		EventBus.on('context-hide', this.hideContextEvent.bind(this), this);
	}

	toggleChat() {
		this.chatBox.setVisible(!this.chatBox.visible);
	}

	handleContextMenu = (object: NPC | PlayerSprite) => {
		if ((this.game.scene.getScene('Game') as Game)!.localPlayer === object) {
			// don't need to show context menu for own player
			return;
		}

		console.log(object);

		let name = object.name;

		if (object instanceof MapItem) {
			name = object.properties.name;
		}

		ui.handleContextAction('open', {
			name: name
		});

		if (ui.contextMenu) {
			if (this.contextMenu) {
				this.contextMenu
					.setPosition(this.input.mousePointer.x - 10, this.input.mousePointer.y)
					.setVisible(true);
				return;
			}

			this.contextMenu = this.add
				.dom(this.input.mousePointer.x - 10, this.input.mousePointer.y, ui.contextMenu)
				.setVisible(true)
				.setScrollFactor(0);

			this.contextMenu.addListener('pointerdown');
			this.contextMenu.on('pointerdown', () => {
				this.contextMenu?.setVisible(false);
			});

			this.add.existing(this.contextMenu);
		}
	};

	hideContextEvent() {
		if (this.contextMenu) {
			console.log('closing');
			this.contextMenu.setVisible(false);
			ui.handleContextAction('close');
		}
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

		const { x, y } = this.topRight(this.chatBox);

		this.chatBox.setPosition(x, y);
		this.add.existing(this.chatBox).setVisible(true);
	}

	addMinimap() {}

	drawMinimap(mapSize: number, tileSize: number) {
		this.minimap.clear();

		for (let y = 0; y < mapSize; y++) {
			for (let x = 0; x < mapSize; x++) {
				const screenX = ((x - y) * tileSize) / 2;
				const screenY = ((x + y) * tileSize) / 4;

				// Example: Draw different colors based on tile type
				// You should replace this with your actual map data
				const tileType = Math.random() > 0.8 ? 'obstacle' : 'ground';
				const color = tileType === 'obstacle' ? 0x888888 : 0x44aa44;

				this.minimap.fillStyle(color);
				this.minimap.fillRect(screenX, screenY, tileSize, tileSize);
			}
		}
	}

	resize() {
		const minimapBounds = this.minimapContainer.getBounds();
		const { x: minimapX, y: minimapY } = this.topRight(this.minimapContainer);

		this.minimapContainer.setPosition(
			minimapX - minimapBounds.width / 2 - 10,
			minimapY + minimapBounds.height / 2 + 10
		);
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
