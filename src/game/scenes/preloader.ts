import { Scene } from 'phaser';

export class Preloader extends Scene {
	constructor() {
		super('Preloader');
	}

	init() {
		this.add.image(512, 384, 'background');
		this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
		const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

		this.load.on('progress', (progress: number) => {
			bar.width = 4 + 460 * progress;
		});
	}

	preload() {
		this.load.setPath('assets');
		this.load.image('logo', 'logo.png');
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.
		this.scene.start('MainMenu');
	}
}
