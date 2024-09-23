import { Boot } from './scenes/boot';
import { Game as GameScene } from './scenes/game';
import { MainMenu } from './scenes/main-menu';
import { AUTO, CANVAS, Game, WEBGL } from 'phaser';
import Preloader from './scenes/preloader';
import { NativeUI } from './scenes/native-ui';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: 640,
	height: 480,
	scale: {
		width: 640,
		height: 480,
		parent: 'game-container',
		autoRound: true
	},
	zoom: 1,
	backgroundColor: '#000',
	scene: [Boot, Preloader, MainMenu, GameScene, NativeUI],
	render: {
		powerPreference: 'high-performance',
		antialias: false,
		antialiasGL: false,
		pixelArt: true
	},
	roundPixels: true,
	input: {
		windowEvents: false
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 300 },
			debug: false
		}
	}
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
