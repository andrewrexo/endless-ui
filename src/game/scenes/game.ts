import { EventBus } from '../event-bus';
import { Scene } from 'phaser';
import { MapRenderer } from '../render/map';
import { centerX as scaleCenterX, centerY as scaleCenterY } from '../scale';
import { PlayerSprite } from '../entities/player-sprite';

export class Game extends Scene {
	map!: MapRenderer;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	player!: PlayerSprite;
	currentPath: { x: number; y: number }[] = [];
	private shootKey!: Phaser.Input.Keyboard.Key;

	constructor() {
		super('Game');
	}

	create() {
		// Draw map
		this.map = new MapRenderer(this, this.centerX(), this.centerY());
		this.map.drawMap();

		// Create player
		const startPos = this.map.getTilePosition(0, 0);
		const username = 'drei'; // Replace with actual username retrieval

		this.player = new PlayerSprite(this, startPos.x, startPos.y - 16, username);

		// Set up camera
		this.cameras.main.setZoom(1);
		this.cameras.main.startFollow(this.player, false);
		this.cameras.main.setRoundPixels(false);
		this.cameras.main.fadeIn(500, 0, 0, 0);

		// Render UI
		this.scene.launch('NativeUI');

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.shootKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		EventBus.emit('current-scene-ready', this);
		EventBus.on('tile-clicked', this.handleTileClick, this);
	}

	update(time: number, delta: number) {
		this.handlePlayerInput();
		this.updatePlayerMovement();
		this.updatePlayerPath();
		this.handleShooting();
	}

	handleTileClick = (tile: { x: number; y: number }) => {
		if (this.player.isMoving) return;

		const path = this.map.findPath(this.player.tileX, this.player.tileY, tile.x, tile.y);
		if (path.length > 1) {
			this.currentPath = path.slice(1); // Remove the first element (current position)
		}
	};

	updatePlayerPath() {
		if (this.currentPath.length > 0 && !this.player.isMoving) {
			const nextTile = this.currentPath[0];
			const dx = nextTile.x - this.player.tileX;
			const dy = nextTile.y - this.player.tileY;
			this.player.startMovement(dx, dy);
			this.currentPath.shift();
		}
	}

	handlePlayerInput() {
		if (this.player.isMoving || this.currentPath.length > 0) return;

		let dx = 0;
		let dy = 0;

		if (this.cursors.left.isDown) dx -= 1;
		else if (this.cursors.right.isDown) dx += 1;
		else if (this.cursors.up.isDown) dy -= 1;
		else if (this.cursors.down.isDown) dy += 1;

		if (dx !== 0 || dy !== 0) {
			const targetTileX = this.player.tileX + dx;
			const targetTileY = this.player.tileY + dy;
			if (this.map.isValidTile(targetTileX, targetTileY)) {
				this.player.startMovement(dx, dy);
			}
		}
	}

	updatePlayerMovement() {
		this.player.updateMovement(this.map.tileWidth);

		if (this.player.isMoving) {
			const startPos = this.map.getTilePosition(this.player.tileX, this.player.tileY);
			const endPos = this.map.getTilePosition(this.player.targetTileX, this.player.targetTileY);
			const progress = this.player.movementProgress / this.map.tileWidth;

			this.player.x = Math.round(startPos.x + (endPos.x - startPos.x) * progress);
			this.player.y = Math.round(
				startPos.y + (endPos.y - startPos.y) * progress - this.player.offsetY
			);
		} else {
			const pos = this.map.getTilePosition(this.player.tileX, this.player.tileY);
			this.player.setPosition(Math.round(pos.x), Math.round(pos.y - this.player.offsetY));
		}
	}

	changeScene() {
		this.scene.start('MainMenu');
	}

	centerX() {
		return scaleCenterX(this.scale);
	}

	centerY() {
		return scaleCenterY(this.scale);
	}

	destroy() {
		EventBus.off('tile-clicked', this.handleTileClick, this);
		// ... other cleanup code ...
	}

	handleShooting() {
		if (this.shootKey.isDown) {
			this.player.shoot();
		} else if (this.player.isShooting) {
			this.player.stopShooting();
		}
	}
}
