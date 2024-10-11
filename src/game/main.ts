import { Boot } from './scenes/boot';
import { Game as GameScene } from './scenes/game';
import { Scale, WEBGL } from 'phaser';
import Preloader from './scenes/preloader';
import { NativeUI } from './scenes/native-ui';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
	type: WEBGL,
	width: 800,
	height: 600,
	parent: 'app',
	scale: {
		mode: Scale.NONE,
		autoRound: true
	},
	dom: {
		createContainer: true
	},
	disableContextMenu: true,
	backgroundColor: '#000',
	scene: [Boot, Preloader, GameScene, NativeUI],
	render: {
		powerPreference: 'high-performance',
		pixelArt: true,
		antialias: false
	},
	input: {
		windowEvents: false
	},
	fps: {
		target: 60,
		smoothStep: true
	}
};

export default config;
