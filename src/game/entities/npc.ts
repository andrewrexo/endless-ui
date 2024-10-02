import { GameObjects } from 'phaser';
import { MapRenderer } from '../render/map';
import { Game as GameScene } from '../scenes/game';

export class NPC extends GameObjects.Container {
	private sprite: GameObjects.Sprite;
	private nameText: GameObjects.Text;
	private action: string;
	private text: string;
	private isHover: boolean = false;
	public tileX: number;
	public tileY: number;
	public name: string;
	public mapIcon: GameObjects.Sprite;
	public declare scene: GameScene;

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
		this.setDepth(2);

		this.sprite.on('pointerover', () => {
			if (this.isHover) return;
			this.sprite.postFX.addGlow(0xffffff, 4, 0.5, false, 2, 4);

			this.isHover = true;
			this.nameText.setVisible(true);
			scene.updateActionText(this.action, this.text);
		});

		this.sprite.on('pointerout', () => {
			if (!this.isHover) return;
			this.sprite.postFX.clear();

			this.isHover = false;
			this.nameText.setVisible(false);
			scene.updateActionText('', '');
		});
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

		// Create red block sprite
		this.mapIcon = scene.add.sprite(0, 0, 'quest-icon');
		this.mapIcon.setScale(8);
		this.mapIcon.setOrigin(0.5);
		this.mapIcon.tint = 0x00ff00;
		this.mapIcon.postFX.addShine();
		this.mapIcon.setPosition(0, -this.sprite.height / 2 - 16 / 2); // Position above the NPC

		// Add to scene
		scene.add.existing(this);
	}

	public setAnimation(key: string) {
		this.sprite.play(key);
	}

	public faceDirection(direction: 'up' | 'down' | 'left' | 'right') {
		// Implement direction facing logic here
		// This might involve changing the sprite's frame or playing a specific animation
	}

	public update() {
		if (this.mapIcon.x === this.x && this.mapIcon.y === this.y) {
			return;
		}

		this.mapIcon.setPosition(this.x, this.y);
		// Implement any per-frame update logic here
	}
}
