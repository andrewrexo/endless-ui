import Phaser from 'phaser';
import { Game as GameScene } from '../scenes/game';
import { NPC } from '../entities/npc';
import { PlayerSprite } from '../entities/player-sprite';
import { Item, type MapItem } from '../entities/item';

export class MapRenderer extends Phaser.GameObjects.Container {
	tileWidth: number = 64;
	tileHeight: number;
	mapWidth: number;
	mapHeight: number;
	scene: GameScene;
	map!: Phaser.Tilemaps.Tilemap;
	tileset!: Phaser.Tilemaps.Tileset;
	objectTileset!: Phaser.Tilemaps.Tileset;
	layer!: Phaser.Tilemaps.TilemapLayer;
	walkableTiles: boolean[][];
	activeTile: Phaser.Tilemaps.Tile | null = null;
	interactables: any[][];
	mapBoundsPolygon: Phaser.GameObjects.Polygon | null = null;
	graphics: Phaser.GameObjects.Graphics | null = null;

	constructor(scene: GameScene, x: number, y: number) {
		super(scene, x, y);

		this.scene = scene;
		this.tileWidth = 64;
		this.tileHeight = 32;
		this.mapWidth = 1;
		this.mapHeight = 1;
		this.walkableTiles = [];
		this.interactables = [];

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
			this.interactables[y] = [];
			for (let x = 0; x < this.mapWidth; x++) {
				this.walkableTiles[y][x] = true; // Assume all tiles are walkable for now
				this.interactables[y] = [];
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

		// Add the following code to create object sprites
		this.createObjectSprites();

		// Set up interactivity for the entire scene
		this.scene.input.on('pointerdown', this.onSceneClick, this);
	}

	addEntity(entity: NPC | PlayerSprite | MapItem, x: number, y: number) {
		this.interactables[x][y] = entity;
		this.walkableTiles[x][y] = false;
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

	findClosestEmptyTile(startX: number, startY: number): { x: number; y: number } | null {
		const maxDistance = 10; // Maximum search distance
		const directions = [
			{ dx: 0, dy: -1 }, // Up
			{ dx: 1, dy: 0 }, // Right
			{ dx: 0, dy: 1 }, // Down
			{ dx: -1, dy: 0 } // Left
		];

		for (let distance = 1; distance <= maxDistance; distance++) {
			for (const { dx, dy } of directions) {
				const x = startX + dx * distance;
				const y = startY + dy * distance;

				if (this.isValidTile(x, y) && !this.interactables[x][y]) {
					return { x, y };
				}
			}
		}

		return null; // No empty tile found within the search radius
	}

	onSceneClick(pointer: Phaser.Input.Pointer) {
		const worldPoint = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
		let tile = this.layer.getIsoTileAtWorldXY(worldPoint.x, worldPoint.y);

		if (!tile) return;

		let targetTile = tile;

		// if (this.interactables[tile.x][tile.y]) {
		// 	// Find the closest tile without an interactable
		// 	const closestEmptyTile = this.findClosestEmptyTile(tile.x, tile.y);

		// 	if (closestEmptyTile) {
		// 		// Emit the tileclick event with the closest empty tile
		// 		tile = this.layer.getTileAt(closestEmptyTile.x, closestEmptyTile.y);
		// 	} else {
		// 		console.log('No empty tiles found nearby');
		// 	}
		// }

		if (pointer.rightButtonDown()) {
			if (
				this.interactables[targetTile.x][targetTile.y] &&
				(this.interactables[targetTile.x][targetTile.y] instanceof NPC ||
					this.interactables[targetTile.x][targetTile.y] instanceof PlayerSprite)
			) {
				this.emit('contextmenu', this.interactables[targetTile.x][targetTile.y]);
			}

			return;
		}

		if (this.scene.cameras.getCamerasBelowPointer(pointer).length > 1) {
			return;
		}

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

		this.activeTile = targetTile;
		this.activeTile.setAlpha(0.7);

		const localPlayerTile = { x: this.scene.localPlayer.tileX, y: this.scene.localPlayer.tileY };
		const distance = Phaser.Math.Distance.Between(
			localPlayerTile.x,
			localPlayerTile.y,
			tile.x,
			tile.y
		);

		if (this.isValidTile(tile.x, tile.y) && distance >= 1) {
			this.emit('tileclick', tile);
		} else {
			console.log('Invalid tile clicked');
		}
	}

	initMinimap() {
		const cloned = Phaser.Utils.Objects.Clone(this.layer);

		this.scene.minimapCamera.ignore(this.layer);
		// @ts-ignore
		this.scene.minimapObjectLayer.add(cloned);
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
		type Node = { x: number; y: number; f: number; g: number; h: number; parent: Node | null };
		const openSet: Node[] = [];
		const closedSet: { [key: string]: boolean } = {};
		const start: Node = { x: startX, y: startY, f: 0, g: 0, h: 0, parent: null };
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

	drawIsometricGrid() {
		// Create a separate graphics object for the filled grid
		const filledGrid = this.scene.add.graphics();
		//filledGrid.fillStyle(0x20252e, 0.9); // Light purple with 50% opacity

		// Create an array to store the points for each diamond shape
		const diamondPoints = [];

		// Generate points for each diamond in the grid
		for (let y = 0; y <= this.mapHeight; y++) {
			for (let x = 0; x <= this.mapWidth; x++) {
				const topLeft = this.getTilePosition(x, y);
				const topRight = this.getTilePosition(x + 1, y);
				const bottomRight = this.getTilePosition(x + 1, y + 1);
				const bottomLeft = this.getTilePosition(x, y + 1);

				diamondPoints.push([
					{ x: topLeft.x, y: topLeft.y - 16 },
					{ x: topRight.x, y: topRight.y - 16 },
					{ x: bottomRight.x, y: bottomRight.y - 16 },
					{ x: bottomLeft.x, y: bottomLeft.y - 16 }
				]);
			}
		}

		// Fill each diamond shape
		diamondPoints.forEach((points) => {
			filledGrid.fillPoints(points, true, true);
		});

		// Add the filled grid to the minimapObjectLayer
		this.scene.minimapObjectLayer.add(filledGrid);
		filledGrid.setDepth(-100);

		// Draw the grid lines
		this.graphics = this.scene.add.graphics();
		this.graphics.lineStyle(6, 0xffffff, 0.3); // Slight green color with 30% opacity

		// Draw vertical lines
		for (let x = 0; x <= this.mapWidth; x++) {
			const start = this.getTilePosition(x, 0);
			const end = this.getTilePosition(x, this.mapHeight);
			this.graphics.moveTo(start.x, start.y - 16);
			this.graphics.lineTo(end.x, end.y - 16);
		}

		// Draw horizontal lines
		for (let y = 0; y <= this.mapHeight; y++) {
			const start = this.getTilePosition(0, y);
			const end = this.getTilePosition(this.mapWidth, y);
			this.graphics.moveTo(start.x, start.y - 16);
			this.graphics.lineTo(end.x, end.y - 16);
		}

		this.graphics.strokePath();
		this.scene.minimapObjectLayer.add(this.graphics);
		this.graphics.setDepth(-99); // Set depth slightly above the filled grid
	}

	createObjectSprites() {
		const objectLayer = this.map.layers[1];
		if (!objectLayer || !objectLayer.data) {
			console.error('Object layer not found or invalid');
			return;
		}

		for (let y = 0; y < objectLayer.height; y++) {
			for (let x = 0; x < objectLayer.width; x++) {
				const tile = objectLayer.data[y][x];
				if (tile && tile.index !== -1) {
					const spriteKey = (tile.index - 470).toString();
					if (spriteKey) {
						const worldPos = this.getTilePosition(x, y);
						const sprite = this.scene.add.sprite(worldPos.x, worldPos.y, spriteKey);
						//this.scene.minimapCamera.ignore(sprite);

						// Center the sprite on the tile
						sprite.setOrigin(1, 1);

						// Adjust the sprite's position to the center of the tile
						sprite.x += sprite.width / 2;
						sprite.y += 8;

						// Set the sprite's depth based on its bottom edge
						sprite.setDepth(worldPos.y + 16);
					}
				}
			}
		}
	}
}
