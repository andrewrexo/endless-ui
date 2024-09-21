import { Boot } from './scenes/boot';
import { Game as MainGame } from './scenes/game';
import { MainMenu } from './scenes/main-menu';
import { AUTO, CANVAS, Game, WEBGL } from 'phaser';
import { Preloader } from './scenes/preloader';
import { NativeUI } from './scenes/native-ui';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
	type: WEBGL,
	width: 640,
	height: 480,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 640,
		height: 480,
		parent: 'game-container',
		autoRound: true
	},
	backgroundColor: '#000',
	scene: [Boot, Preloader, MainMenu, MainGame, NativeUI],
	render: {
		powerPreference: 'high-performance',
		antialias: false,
		antialiasGL: false
	}
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
