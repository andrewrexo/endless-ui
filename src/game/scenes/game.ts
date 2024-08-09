import { EventBus } from '../event-bus';
import { Scene } from 'phaser';

export class Game extends Scene {
	constructor() {
		super('Game');
	}

	create() {
		EventBus.emit('current-scene-ready', this);
	}

	changeScene() {
		this.scene.start('MainMenu');
	}
}
