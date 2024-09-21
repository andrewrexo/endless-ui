import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../event-bus';

export class MainMenu extends Scene {
	background!: GameObjects.Image;
	logo!: GameObjects.Image;
	title!: GameObjects.Text;

	constructor() {
		super('MainMenu');
	}

	create() {
		this.background = this.add.image(this.centerX(), this.centerY(), 'background-2');
		this.background.setDisplaySize(this.scale.width, this.scale.height);
		this.logo = this.add.image(this.centerX(), this.centerY() / 4, 'logo').setDepth(100);
		//this.scale.on('resize', this.resize, this);
		this.title = this.add
			.text(this.centerX(), this.centerY() / 2, 'Main Menu', {
				fontFamily: 'Arial Black',
				fontSize: 38,
				color: '#ffffff',
				stroke: '#000000',
				strokeThickness: 8,
				align: 'center'
			})
			.setOrigin(0.5)
			.setDepth(100);

		EventBus.emit('current-scene-ready', this);
	}

	changeScene() {
		this.scene.start('Game');
	}

	centerX() {
		return this.scale.width / 2;
	}
	centerY() {
		return this.scale.height / 2;
	}

	resize(gameSize: { width: any; height: any }, baseSize: any, displaySize: any, resolution: any) {
		let width = gameSize.width;
		let height = gameSize.height;

		this.background.setPosition(this.centerX(), this.centerY());
		this.background.setDisplaySize(width, height);

		this.title.setPosition(this.centerX(), this.centerY() / 2);
		this.logo.setPosition(this.centerX(), this.centerY() / 4);
	}
}
