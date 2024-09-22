import { Scene } from 'phaser';

export class Preloader extends Scene {
	bar!: Phaser.GameObjects.Rectangle;
	text!: Phaser.GameObjects.Text;
	progress: number = 0;

	constructor() {
		super('Preloader');
	}

	init() {
		this.add.image(this.scale.width / 2, this.scale.height / 2, 'background-2');
		this.add
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
			this.text.setText(`loaded ${file}. ${this.progress * 100}% complete.`);
		});
	}

	preload() {
		this.load.setPath('assets');
		this.load.image('logo', 'logo.png');
		this.load.image('boxTexture', 'paper-bg.png');
		this.load.image('tile', 'tile.png');
		this.load.image('tile-hover', 'tile-hover.png');
		this.load.spritesheet('player', 'template-front-all.png', { frameWidth: 32, frameHeight: 32 });
		this.load.image('pixel', 'pixel.png');
	}

	create() {
		// Create a black rectangle covering the entire screen
		const fadeRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000);
		fadeRect.setOrigin(0, 0);
		fadeRect.setAlpha(1); // Start fully opaque

		this.text.setText(`loading ${this.progress * 100}% complete. sending you to the game...`);
		this.text.setColor('#00ff00');
		this.text.setBackgroundColor('#000000');
		this.text.setPadding(4, 4, 4, 4);

		this.scene.transition({
			target: 'Game',
			duration: 100,
			moveBelow: true,
			onUpdate: (progress: number) => {
				// Fade out the black rectangle
				fadeRect.setAlpha(0 + progress);
			}
		});
	}
}
