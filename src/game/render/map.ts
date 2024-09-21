import Phaser from 'phaser';
import { EventBus } from '../event-bus';

export class MapRenderer extends Phaser.GameObjects.Container {
	tileWidth: number = 64;
	tileHeight: number = 32;
	mapWidth: number = 1;
	mapHeight: number = 1;
	scene: Phaser.Scene;
	map: any;
	walkableTiles: boolean[][] = [];

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, 0, 0);

		this.scene = scene;
		this.load({});
		this.initializeWalkableTiles();
	}

	initializeWalkableTiles() {
		for (let y = 0; y < this.mapHeight; y++) {
			this.walkableTiles[y] = [];
			for (let x = 0; x < this.mapWidth; x++) {
				this.walkableTiles[y][x] = true; // Assume all tiles are walkable for now
			}
		}
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

		tileSprite.on('pointerdown', () => {
			EventBus.emit('tile-clicked', { x, y });
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

	findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
		// Implement A* pathfinding algorithm here
		// This is a simplified version and might need optimization for larger maps
		const openSet: {
			x: number;
			y: number;
			f: number;
			g: number;
			h: number;
			parent?: { x: number; y: number };
		}[] = [];
		const closedSet: Set<string> = new Set();
		const start = { x: startX, y: startY, f: 0, g: 0, h: 0 };
		openSet.push(start);

		while (openSet.length > 0) {
			let current = openSet[0];
			let currentIndex = 0;
			for (let i = 1; i < openSet.length; i++) {
				if (openSet[i].f < current.f) {
					current = openSet[i];
					currentIndex = i;
				}
			}

			if (current.x === endX && current.y === endY) {
				let path = [];
				while (current) {
					path.push({ x: current.x, y: current.y });
					//@ts-ignore
					current = current.parent;
				}
				return path.reverse();
			}

			openSet.splice(currentIndex, 1);
			closedSet.add(`${current.x},${current.y}`);

			const neighbors = [
				{ x: current.x + 1, y: current.y },
				{ x: current.x - 1, y: current.y },
				{ x: current.x, y: current.y + 1 },
				{ x: current.x, y: current.y - 1 }
			];

			for (let neighbor of neighbors) {
				if (
					!this.isValidTile(neighbor.x, neighbor.y) ||
					!this.walkableTiles[neighbor.y][neighbor.x] ||
					closedSet.has(`${neighbor.x},${neighbor.y}`)
				) {
					continue;
				}

				const gScore = current.g + 1;
				const hScore = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
				const fScore = gScore + hScore;

				const openNode = openSet.find((node) => node.x === neighbor.x && node.y === neighbor.y);
				if (!openNode || gScore < openNode.g) {
					if (!openNode) {
						openSet.push({
							x: neighbor.x,
							y: neighbor.y,
							f: fScore,
							g: gScore,
							h: hScore,
							parent: current
						});
					} else {
						openNode.f = fScore;
						openNode.g = gScore;
						openNode.h = hScore;
						openNode.parent = current;
					}
				}
			}
		}

		return []; // No path found
	}
}
