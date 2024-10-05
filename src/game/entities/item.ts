import { Scene } from 'phaser';
import { EventBus } from '../event-bus';
import { MapRenderer } from '../render/map';
import { action } from '../../components/ui/main/action.svelte';

export enum ItemType {
	WEAPON,
	ARMOR,
	CONSUMABLE,
	KEY_ITEM
}

export interface ItemProperties {
	name: string;
	description: string;
	type: ItemType;
	sprite: string;
	value: number;
}

export class Item {
	private properties: ItemProperties;

	constructor(properties: ItemProperties) {
		this.properties = properties;
	}

	onAdd() {
		// This method will be called when the item is added to the scene
	}

	onRemove() {
		// This method will be called when the item is removed from the scene
	}
}

export class MapItem extends Phaser.GameObjects.Sprite {
	public properties: ItemProperties;
	private itemNameText: Phaser.GameObjects.Text;
	public itemId: string;
	private map: MapRenderer;
	public tileX: number;
	public tileY: number;

	constructor(
		scene: Scene,
		x: number,
		y: number,
		texture: string,
		properties: ItemProperties,
		itemId: string,
		map: MapRenderer
	) {
		super(scene, x, y, texture);
		this.properties = properties;
		this.itemId = itemId; // Store the item ID
		this.map = map;

		// Add the item to the scene
		scene.add.existing(this);

		// Create the item name text
		this.itemNameText = scene.add.text(0, 0, this.properties.name, {
			fontSize: '16px',
			color: '#e4c1fb',
			fontFamily: 'Abaddon',
			stroke: '#000000',
			strokeThickness: 2,
			align: 'center'
		});
		this.itemNameText.setOrigin(0.5, 1);
		this.itemNameText.setVisible(false);

		// Set up interactive properties
		this.setInteractive();
		this.on('pointerdown', this.onPickup, this);
		this.on('pointerover', this.onHoverStart, this);
		this.on('pointerout', this.onHoverEnd, this);
	}

	onPickup(): void {
		console.log(`Attempting to pick up ${this.properties.name}`);
		// Emit an event to be handled by the Game scene
		// We'll pass the item's position along with the itemId
		EventBus.emit('item:pickup', { itemId: this.itemId, x: this.x, y: this.y });
	}

	// Add this new method to check if the player is within range
	isPlayerInRange(playerX: number, playerY: number): boolean {
		const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
		const tileSize = 32; // Assuming MapRenderer has a method to get tile size
		return distance <= tileSize * Math.SQRT2; // Allow diagonal adjacency
	}

	onHoverStart(): void {
		// Show the item name when hovering
		this.itemNameText.setPosition(this.x, this.y - this.height / 2);
		this.itemNameText.setVisible(true);

		console.log('yo');

		this.postFX.addColorMatrix().contrast(1.25);
		this.postFX.addGlow(0x000000, 0.5, 0.5, false, 2, 4);

		action.action = {
			action: 'Pick-up',
			text: this.properties.name
		};
	}

	onHoverEnd(): void {
		// Hide the item name when not hovering
		this.itemNameText.setVisible(false);

		this.postFX.clear();

		action.action = {
			action: '',
			text: ''
		};
	}

	getName(): string {
		return this.properties.name;
	}

	getDescription(): string {
		return this.properties.description;
	}

	getType(): ItemType {
		return this.properties.type;
	}

	getValue(): number {
		return this.properties.value;
	}

	drop(tileX: number, tileY: number): void {
		const { x, y } = this.map.getTilePosition(tileX, tileY);
		this.setPosition(x, y);
		this.setVisible(true);
		console.log(
			`Dropped ${this.properties.name} at tile (${tileX}, ${tileY}), world position (${x}, ${y})`
		);
	}

	destroy(fromScene?: boolean): void {
		// Make sure to destroy the item name text when the item is destroyed
		if (this.itemNameText) {
			this.itemNameText.destroy();
		}
		super.destroy(fromScene);
	}
}
