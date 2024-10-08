import { Scene } from 'phaser';

export default class Preloader extends Scene {
	bar!: Phaser.GameObjects.Rectangle;
	rect!: Phaser.GameObjects.Rectangle;
	text!: Phaser.GameObjects.Text;
	progress: number = 0;

	constructor() {
		super('Preloader');
	}

	init(): void {
		this.rect = this.add
			.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width / 2, 32)
			.setStrokeStyle(2, 0x000000);
		this.text = this.add
			.text(this.scale.width / 2, this.scale.height / 2 - 40, 'Loading...', { color: '#000000' })
			.setOrigin(0.5);

		this.bar = this.add.rectangle(
			this.scale.width / 2,
			this.scale.height / 2,
			this.scale.width / 2,
			32,
			0x00ff00
		);

		this.load.on('progress', (progress: number) => {
			this.progress = progress;
			this.bar.width = (this.scale.width / 2) * progress;
		});

		this.load.on('filecomplete', (file: string) => {
			this.text.setColor('#00ff00');
			this.text.setBackgroundColor('#000000');
			this.text.setPadding(4, 4, 4, 4);
			this.text.setText(`loaded ${file}\n${(this.progress * 100).toFixed(2)}% complete.`);
		});
	}

	preload(): void {
		this.load.setPath('assets');
		this.load.image('logo', 'logo.png');
		this.load.image('boxTexture', 'paper-bg.png');
		this.load.image('tile', 'tile.png');
		this.load.image('tile-hover', 'tile-hover.png');
		this.load.image('pixel', 'pixel.png');
		this.load.image('player-icon', 'player-icon.png');
		this.load.image('quest-icon', 'quest-icon.png');
		this.load.image('teddy', 'teddy_floor.png');

		this.load.spritesheet('fighter', 'fighter.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('player', 'template-front-all.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('mage', 'mage.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('cleric', 'cleric.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('tiles', 'tiles.png', { frameWidth: 64, frameHeight: 32 });

		// Load the tilemap JSON
		this.load.tilemapTiledJSON('map-1', 'map/2.json');
		this.load.pack('objects', 'map/object-pack.json');
	}

	create(): void {
		// Create a black rectangle covering the entire screen
		const fadeRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000);
		fadeRect.setOrigin(0, 0);
		fadeRect.setAlpha(1); // Start fully opaque

		this.text.setText(`loading ${this.progress * 100}% complete. sending you to the game...`);

		this.scene.transition({
			target: 'Game',
			duration: 200,
			moveBelow: true,
			onUpdate: (progress: number) => {
				// Fade out the black rectangle
				this.text.setAlpha(1 - progress);
				this.bar.setAlpha(1 - progress);
				this.rect.setAlpha(1 - progress);
				fadeRect.setAlpha(1 - progress);
			}
		});
	}
}
