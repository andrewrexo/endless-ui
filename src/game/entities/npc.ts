import { Scene, GameObjects } from 'phaser';
import { MapRenderer } from '../render/map';
import { EventBus } from '../event-bus';

export class NPC extends GameObjects.Container {
	private sprite: GameObjects.Sprite;
	private borderSprite: GameObjects.Sprite;
	private nameText: GameObjects.Text;
	private action: string;
	private text: string;
	public tileX: number;
	public tileY: number;

	constructor(
		scene: Scene,
		key: string,
		tileX: number,
		tileY: number,
		name: string,
		map: MapRenderer
	) {
		super(scene, 0, 0);

		this.action = 'Talk to';
		this.text = name;

		this.tileX = tileX;
		this.tileY = tileY;
		// Create border sprite
		this.borderSprite = scene.add.sprite(0, 0, key);
		this.borderSprite.setTintFill(0xffffff);
		this.borderSprite.setScale(1.2);
		this.borderSprite.setVisible(false);
		this.add(this.borderSprite);

		// Create main sprite
		this.sprite = scene.add.sprite(0, 0, key);
		this.add(this.sprite);

		// Create name text
		this.nameText = scene.add.text(0, -24, name, {
			fontSize: '16px',
			color: '#000000',
			fontFamily: 'Monogram',
			stroke: '#ffffff',
			strokeThickness: 2,
			align: 'center'
		});

		this.nameText.setResolution(10);
		this.nameText.setOrigin(0.5);
		this.add(this.nameText);
		this.nameText.setVisible(false);

		this.sprite.setInteractive();
		this.sprite.on('pointerover', () => {
			this.borderSprite.setVisible(true);
			this.nameText.setVisible(true);

			EventBus.emit('action-text', {
				action: this.action,
				text: this.text
			});
		});
		this.sprite.on('pointerout', () => {
			this.borderSprite.setVisible(false);
			this.nameText.setVisible(false);

			EventBus.emit('action-text', {
				action: '',
				text: ''
			});
		});

		// Set Position
		const position = map.getTilePosition(tileX, tileY);
		this.setPosition(position.x, position.y - 8);

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
