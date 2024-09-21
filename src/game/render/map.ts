import Phaser from 'phaser';

export class MapRenderer extends Phaser.GameObjects.Container {
	tileWidth: number = 64;
	tileHeight: number = 32;
	mapWidth: number = 1;
	mapHeight: number = 1;
	scene: Phaser.Scene;
	map: any;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, 0, 0);

		this.scene = scene;
		this.load({});
	}

	create() {}

	load(map: any): void {
		this.map = map;
		//this.mapWidth = this.map.width;
		//this.mapHeight = this.map.height;
		this.mapWidth = 25;
		this.mapHeight = 25;
	}

	drawTile(x: number, y: number, id: number): void {
		const { x: iCoord, y: jCoord } = this.getTilePosition(x, y);

		const tileSprite = this.scene.add.image(iCoord, jCoord, 'tile');
		tileSprite.setInteractive(this.scene.input.makePixelPerfect());

		this.add(tileSprite);

		tileSprite.on('pointerover', () => {
			if (tileSprite.texture.key === 'tile') {
				tileSprite.setTexture('tile-hover');
				tileSprite.setToTop();
			}
		});

		tileSprite.on('pointerout', () => {
			tileSprite.setTexture('tile');
			tileSprite.setToBack();
		});
	}

	drawMap() {
		let tileCount = 0;

		for (let i = 0; i < this.mapHeight; i++) {
			for (let j = 0; j < this.mapWidth; j++) {
				this.drawTile(i, j, 1);
			}
		}

		this.scene.add.existing(this);
	}

	getTilePosition(tileX: number, tileY: number): { x: number; y: number } {
		const x = ((tileX - tileY) * this.tileWidth) / 2;
		const y = ((tileX + tileY) * this.tileHeight) / 2;
		return { x, y };
	}

	isValidTile(tileX: number, tileY: number): boolean {
		const buffer = 0.5; // Adjust this value as needed
		return (
			tileX >= -buffer &&
			tileX < this.mapWidth - 1 + buffer &&
			tileY >= -buffer &&
			tileY < this.mapHeight - 1 + buffer
		);
	}

	getTileFromWorldPosition(x: number, y: number): { x: number; y: number } {
		// Adjust for the tile's origin being at the top-left corner
		x += this.tileWidth / 2;
		y += this.tileHeight / 2;

		// Convert screen coordinates to isometric coordinates
		const tileX = Math.floor((y / this.tileHeight + x / this.tileWidth) / 2);
		const tileY = Math.floor((y / this.tileHeight - x / this.tileWidth) / 2);

		return { x: tileX, y: tileY };
	}
}
