import Phaser from 'phaser';
import { Game as GameScene } from '../scenes/game';
import { NPC } from '../entities/npc';
import { PlayerSprite } from '../entities/player-sprite';
import { Item, type MapItem } from '../entities/item';
import { EventBus } from '../event-bus';

export class MapRenderer {
	scene: GameScene;
	tileWidth: number = 64;
	tileHeight: number = 32;
	mapWidth: number = 1;
	mapHeight: number = 1;
	map!: Phaser.Tilemaps.Tilemap;
	tileset!: Phaser.Tilemaps.Tileset;
	layer!: Phaser.Tilemaps.TilemapLayer;
	walkableTiles: boolean[][] = [];
	activeTile: Phaser.Tilemaps.Tile | null = null;
	interactables: any[][] = [];
	objects: Phaser.GameObjects.Sprite[] = [];
	events: Phaser.Events.EventEmitter;

	constructor(scene: GameScene) {
		this.scene = scene;
		this.load();
		this.initializeWalkableTiles();
	}

	initializeWalkableTiles() {
		this.walkableTiles = Array(this.mapHeight)
			.fill(null)
			.map(() => Array(this.mapWidth).fill(true));
		this.interactables = Array(this.mapHeight)
			.fill(null)
			.map(() => Array(this.mapWidth).fill(null));
	}

	create() {
		this.load();
		const layer = this.map.createLayer(0, this.tileset, 0, 0);
		if (!layer) {
			console.error('Failed to create tilemap layer');
			return;
		}
		this.layer = layer;
		this.layer.setPosition(-32, -16);

		this.createObjectSprites();
		this.setupInteractivity();

		EventBus.on('navigationend', () => {
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

	setupInteractivity() {
		this.scene.input.on('pointerdown', this.onSceneClick, this);
	}

	load(): void {
		this.map = this.scene.make.tilemap({ key: 'map-1' });
		this.tileset = this.map.addTilesetImage('tiles', 'tiles') as Phaser.Tilemaps.Tileset;
		if (!this.tileset) {
			console.error('Failed to load tileset');
			return;
		}
		this.mapWidth = this.map.width;
		this.mapHeight = this.map.height;
	}

	addEntity(entity: NPC | PlayerSprite | MapItem, x: number, y: number) {
		this.interactables[y][x] = entity;
		this.walkableTiles[y][x] = false;
	}

	onSceneClick(pointer: Phaser.Input.Pointer) {
		const worldPoint = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
		const tile = this.layer.getIsoTileAtWorldXY(worldPoint.x, worldPoint.y);

		if (!tile) return;

		if (pointer.rightButtonDown()) {
			const interactable = this.interactables[tile.y][tile.x];
			if (interactable instanceof NPC || interactable instanceof PlayerSprite) {
				EventBus.emit('contextmenu', interactable);
			}
			return;
		}

		if (this.scene.cameras.getCamerasBelowPointer(pointer).length > 1) return;

		this.updateActiveTile(tile);

		const localPlayerTile = { x: this.scene.localPlayer.tileX, y: this.scene.localPlayer.tileY };
		const distance = Phaser.Math.Distance.Between(
			localPlayerTile.x,
			localPlayerTile.y,
			tile.x,
			tile.y
		);

		if (this.isValidTile(tile.x, tile.y) && distance >= 1) {
			EventBus.emit('tileclick', tile);
		}
	}

	updateActiveTile(newTile: Phaser.Tilemaps.Tile) {
		if (this.activeTile) {
			this.scene.tweens.add({
				targets: this.activeTile,
				alpha: { from: 0.7, to: 1 },
				duration: 100,
				ease: 'Linear'
			});
		}
		this.activeTile = newTile;
		this.activeTile.setAlpha(0.7);
	}

	initMinimap() {
		const minimapLayer = this.map.createLayer(0, this.tileset, 0, 0);
		if (minimapLayer) {
			minimapLayer.setPosition(-32, -16);
			this.scene.minimapCamera.ignore(this.layer);
			this.scene.minimapObjectLayer.add(minimapLayer);
		}
	}

	worldToTileXY(worldX: number, worldY: number): { x: number; y: number } {
		worldX += 32;
		worldY += 16;
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

	findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
		const openSet: { x: number; y: number; f: number; g: number; h: number; parent: any }[] = [];
		const closedSet: { [key: string]: boolean } = {};
		const start: Node = { x: startX, y: startY, f: 0, g: 0, h: 0, parent: null };
		const end: Node = { x: endX, y: endY, f: 0, g: 0, h: 0, parent: null };

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
					!this.isValidTile(neighbor.x, neighbor.y) ||
					!this.walkableTiles[neighbor.y][neighbor.x] ||
					closedSet[`${neighbor.x},${neighbor.y}`]
				) {
					continue;
				}

				const g = current.g + 1;
				const h = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
				const f = g + h;

				const openNode = openSet.find((node) => node.x === neighbor.x && node.y === neighbor.y);
				if (!openNode || g < openNode.g) {
					if (!openNode) {
						openSet.push({ x: neighbor.x, y: neighbor.y, f, g, h, parent: current });
					} else {
						openNode.f = f;
						openNode.g = g;
						openNode.h = h;
						openNode.parent = current;
					}
				}
			}
		}

		return []; // No path found
	}

	createObjectSprites() {
		const objectLayer = this.map.layers[1];
		const tileOffset = 100;

		if (!objectLayer || !objectLayer.data) {
			console.error('Object layer not found or invalid');
			return;
		}

		objectLayer.data.forEach((row, y) => {
			row.forEach((tile, x) => {
				if (tile && tile.index !== -1) {
					const spriteKey = (tile.index + tileOffset).toString();
					if (spriteKey) {
						const worldPos = this.getTilePosition(x, y);
						const sprite = this.scene.add.sprite(worldPos.x, worldPos.y, spriteKey);
						this.objects.push(sprite);
						sprite.setOrigin(1, 1);
						sprite.x += sprite.width / 2;
						sprite.y += 8;
						sprite.setDepth(worldPos.y + 16);
					}
				}
			});
		});
	}
}

interface Node {
	x: number;
	y: number;
	f: number;
	g: number;
	h: number;
	parent: Node | null;
}
