import { Scene, GameObjects } from 'phaser';
import { MapRenderer } from '../render/map';
import { EventBus } from '../event-bus';
import { Game as GameScene } from '../scenes/game';

export class NPC extends GameObjects.Container {
	private sprite: GameObjects.Sprite;
	private borderSprite: GameObjects.Sprite;
	private nameText: GameObjects.Text;
	private action: string;
	private text: string;
	private isHover: boolean = false;
	public tileX: number;
	public tileY: number;
	public name: string;

	constructor(
		scene: GameScene,
		key: string,
		tileX: number,
		tileY: number,
		name: string,
		map: MapRenderer
	) {
		super(scene, 0, 0);

		this.action = 'Menu';
		this.text = name;
		this.name = name;

		this.tileX = tileX;
		this.tileY = tileY;

		// Create main sprite
		this.sprite = scene.add.sprite(0, 0, key).setInteractive();
		this.add(this.sprite);

		this.sprite.on('pointerover', () => {
			if (this.isHover) return;

			this.isHover = true;
			this.borderSprite.setVisible(true);
			this.nameText.setVisible(true);
			scene.updateActionText(this.action, this.text);
		});

		this.sprite.on('pointerout', () => {
			if (!this.isHover) return;

			this.isHover = false;
			this.borderSprite.setVisible(false);
			this.nameText.setVisible(false);
			scene.updateActionText('', '');
		});

		// Create border sprite
		this.borderSprite = scene.add.sprite(0, 0, key);
		this.borderSprite.setTintFill(0xffffff).setScale(1.1).setVisible(false);
		this.add(this.borderSprite).sendToBack(this.borderSprite);

		// Create name text
		this.nameText = scene.add
			.text(0, -24, name, {
				fontSize: '16px',
				color: '#ffffff',
				fontFamily: 'Abaddon',
				stroke: '#000000',
				strokeThickness: 2,
				align: 'center'
			})
			.setVisible(false)
			.setOrigin(0.5)
			.setResolution(1);

		this.add(this.nameText);

		// Set Position
		const { x, y } = map.getTilePosition(tileX, tileY);
		this.setPosition(x, y - this.sprite.height / 3);

		// Add to scene
		scene.add.existing(this);
	}

	public setAnimation(key: string) {
		this.sprite.play(key);
		this.borderSprite.play(key);
	}

	public faceDirection(direction: 'up' | 'down' | 'left' | 'right') {
		// Implement direction facing logic here
		// This might involve changing the sprite's frame or playing a specific animation
	}

	public update() {
		// Implement any per-frame update logic here
	}
}
