import Phaser from 'phaser';
import { EventBus } from '../event-bus';

export class MapRenderer extends Phaser.GameObjects.Container {
	tileWidth: number = 64;
	tileHeight: number;
	mapWidth: number;
	mapHeight: number;
	scene: Phaser.Scene;
	map!: Phaser.Tilemaps.Tilemap;
	tileset!: Phaser.Tilemaps.Tileset;
	layer!: Phaser.Tilemaps.TilemapLayer;
	walkableTiles: boolean[][];
	activeTile: Phaser.Tilemaps.Tile | null = null;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y);

		this.scene = scene;
		this.tileWidth = 64;
		this.tileHeight = 32;
		this.mapWidth = 1;
		this.mapHeight = 1;
		this.walkableTiles = [];

		this.load();
		this.initializeWalkableTiles();

		this.on('navigationend', () => {
			if (this.activeTile) {
				this.scene.tweens.add({
					targets: this.activeTile,
					alpha: { from: 0.7, to: 1 },
					duration: 100,
					ease: 'Linear'
				});
				this.activeTile = null;
			}
		});
	}

	initializeWalkableTiles() {
		for (let y = 0; y < this.mapHeight; y++) {
			this.walkableTiles[y] = [];
			for (let x = 0; x < this.mapWidth; x++) {
				this.walkableTiles[y][x] = true; // Assume all tiles are walkable for now
			}
		}
	}

	create() {
		this.load();
		// Create the tilemap layer
		const layer = this.map.createLayer(0, this.tileset, 0, 0);
		if (!layer) {
			console.error('Failed to create tilemap layer');
			return;
		}
		this.layer = layer;
		this.layer.setPosition(-32, -16);

		this.add(this.layer);
		this.scene.add.existing(this);

		// Set up interactivity for the entire scene
		this.scene.input.on('pointerdown', this.onSceneClick, this);
	}

	load(): void {
		// Load the tilemap from the JSON file
		this.map = this.scene.make.tilemap({ key: 'map-1' });

		// Load the tileset image
		const tileset = this.map.addTilesetImage('tiles', 'tiles');
		if (!tileset) {
			console.error('Failed to load tileset');
			return;
		}
		this.tileset = tileset;

		// Update map dimensions
		this.mapWidth = this.map.width;
		this.mapHeight = this.map.height;
	}

	onSceneClick(pointer: Phaser.Input.Pointer) {
		const worldPoint = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
		const tile = this.layer.getIsoTileAtWorldXY(worldPoint.x, worldPoint.y);

		if (!tile) return;

		console.log('Clicked world position:', worldPoint.x, worldPoint.y);
		console.log('Calculated tile:', tile);

		if (this.activeTile) {
			this.scene.tweens.add({
				targets: this.activeTile,
				alpha: { from: 0.7, to: 1 },
				duration: 100,
				ease: 'Linear'
			});
		}

		this.activeTile = tile;
		this.activeTile.setAlpha(0.7);

		if (this.isValidTile(tile.x, tile.y)) {
			this.emit('tileclick', tile);
		} else {
			console.log('Invalid tile clicked');
		}
	}

	worldToTileXY(worldX: number, worldY: number): { x: number; y: number } {
		// Adjust for the layer position offset
		worldX += 32;
		worldY += 16;

		// Convert world coordinates to isometric tile coordinates
		const tileX = Math.floor((worldX / this.tileWidth + worldY / this.tileHeight) / 2);
		const tileY = Math.floor((worldY / this.tileHeight - worldX / this.tileWidth) / 2);

		return { x: tileX, y: tileY };
	}

	getTilePosition(tileX: number, tileY: number): Phaser.Math.Vector2 {
		const x = Math.floor(((tileX - tileY) * this.tileWidth) / 2);
		const y = Math.floor(((tileX + tileY) * this.tileHeight) / 2);
		return new Phaser.Math.Vector2(x, y);
	}

	isValidTile(tileX: number, tileY: number): boolean {
		return tileX >= 0 && tileX < this.mapWidth && tileY >= 0 && tileY < this.mapHeight;
	}

	getTileFromWorldPosition(x: number, y: number): Phaser.Math.Vector2 {
		const tileXY = this.map.worldToTileXY(x, y);
		return tileXY ?? new Phaser.Math.Vector2(0, 0);
	}

	findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
		console.log('Finding path from', startX, startY, 'to', endX, endY);
		const openSet: { x: number; y: number; f: number; g: number; h: number; parent: any }[] = [];
		const closedSet: { [key: string]: boolean } = {};
		const start = { x: startX, y: startY, f: 0, g: 0, h: 0, parent: null };
		const end = { x: endX, y: endY };

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

			if (current.x === end.x && current.y === end.y) {
				const path = [];

				while (current) {
					path.push({ x: current.x, y: current.y });
					current = current.parent;
				}
				return path.reverse();
			}

			openSet.splice(currentIndex, 1);
			closedSet[`${current.x},${current.y}`] = true;

			const neighbors = [
				{ x: current.x - 1, y: current.y },
				{ x: current.x + 1, y: current.y },
				{ x: current.x, y: current.y - 1 },
				{ x: current.x, y: current.y + 1 }
			];

			for (const neighbor of neighbors) {
				if (
					neighbor.x < 0 ||
					neighbor.x >= this.mapWidth ||
					neighbor.y < 0 ||
					neighbor.y >= this.mapHeight ||
					!this.walkableTiles[neighbor.y][neighbor.x] ||
					closedSet[`${neighbor.x},${neighbor.y}`]
				) {
					continue;
				}

				const gScore = current.g + 1;
				const hScore = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
				const fScore = gScore + hScore;

				const existingNeighbor = openSet.find(
					(node) => node.x === neighbor.x && node.y === neighbor.y
				);

				if (!existingNeighbor || gScore < existingNeighbor.g) {
					const newNode = {
						x: neighbor.x,
						y: neighbor.y,
						f: fScore,
						g: gScore,
						h: hScore,
						parent: current
					};

					if (!existingNeighbor) {
						openSet.push(newNode);
					} else {
						Object.assign(existingNeighbor, newNode);
					}
				}
			}
		}

		return []; // No path found
	}
}
