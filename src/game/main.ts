import { Boot } from './scenes/boot';
import { Game as MainGame } from './scenes/game';
import { MainMenu } from './scenes/main-menu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: 1024,
	height: 768,
	parent: 'game-container',
	backgroundColor: '#000',
	scene: [Boot, Preloader, MainMenu, MainGame],
	pixelArt: true,
	antialias: false
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
