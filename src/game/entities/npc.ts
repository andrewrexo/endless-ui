import { Scene, GameObjects } from 'phaser';
import { MapRenderer } from '../render/map';

export class NPC extends GameObjects.Container {
	private sprite: GameObjects.Sprite;
	private borderSprite: GameObjects.Sprite;
	private nameText: GameObjects.Text;
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

		this.tileX = tileX;
		this.tileY = tileY;
		// Create border sprite
		this.borderSprite = scene.add.sprite(0, 0, key);
		this.borderSprite.setTintFill(0xffffff);
		this.borderSprite.setScale(1.05);
		this.borderSprite.setVisible(false);
		this.add(this.borderSprite);

		// Create main sprite
		this.sprite = scene.add.sprite(0, 0, key);
		this.add(this.sprite);

		// Create name text
		this.nameText = scene.add.text(0, -30, name, {
			fontSize: '16px',
			color: '#ffffff',
			fontFamily: 'Monogram',
			stroke: '#000000',
			strokeThickness: 2,
			align: 'center'
		});

		this.nameText.setResolution(5);
		this.nameText.setOrigin(0.5);
		this.add(this.nameText);

		this.sprite.setInteractive();
		this.sprite.on('pointerover', () => {
			this.borderSprite.setVisible(true);
			this.nameText.setStroke('#D3D3D3', 4); // Add light gray stroke on hover
			this.nameText.setColor('#000000');
		});
		this.sprite.on('pointerout', () => {
			this.borderSprite.setVisible(false);
			this.nameText.setColor('#ffffff');
			this.nameText.setStroke('#000000', 2); // Reset to original stroke on pointer out
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
