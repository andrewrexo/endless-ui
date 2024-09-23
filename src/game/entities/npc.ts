import { Scene, GameObjects } from 'phaser';
import { MapRenderer } from '../render/map';

export class NPC extends GameObjects.Container {
	private sprite: GameObjects.Sprite;
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

		// Create sprite
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
			// Create a border graphics object
			const border = this.scene.add.graphics();
			border.lineStyle(1, 0xffffff, 1);

			// Calculate the border rectangle
			const bounds = this.sprite.getBounds();
			const borderRect = new Phaser.Geom.Rectangle(
				-Math.floor(bounds.width / 2) - 1,
				-Math.floor(bounds.height / 2) - 1,
				Math.floor(bounds.width) + 2,
				Math.floor(bounds.height) + 2
			);

			// Draw the border
			border.strokeRect(borderRect.x, borderRect.y, borderRect.width, borderRect.height);

			// Add the border to the container and set it behind the sprite
			this.add(border);
			this.sendToBack(border);

			// Hide the border initially
			border.setVisible(false);

			// Show the border on pointer over
			border.setVisible(true);
		});
		// Set Position
		const position = map.getTilePosition(tileX, tileY);
		this.setPosition(position.x, position.y - 8);

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
		// Implement any per-frame update logic here
	}
}
