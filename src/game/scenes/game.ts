import { EventBus } from '../event-bus';
import { Scene } from 'phaser';
import { MapRenderer } from '../render/map';
import { centerX as scaleCenterX, centerY as scaleCenterY } from '../scale';

export class Game extends Scene {
	map!: MapRenderer;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	player!: Phaser.GameObjects.Rectangle;
	playerTileX: number = 0;
	playerTileY: number = 0;
	moveSpeed: number = 3; // Pixels per frame
	isMoving: boolean = false;
	targetTileX: number = 0;
	targetTileY: number = 0;
	movementProgress: number = 0;

	constructor() {
		super('Game');
	}

	create() {
		// Draw map
		this.map = new MapRenderer(this, this.centerX(), this.centerY());
		this.map.drawMap();

		// Create player
		this.player = this.add.rectangle(0, 0, 32, 32, 0xff0000);
		this.map.add(this.player);
		this.player.setDepth(1);

		// Set initial player position
		this.updatePlayerPosition();

		// Set up camera
		this.cameras.main.setZoom(1);

		// Render UI
		this.scene.launch('NativeUI');
		// Fade in the camera
		this.cameras.main.fadeIn(500, 0, 0, 0);
		this.cameras.main.startFollow(this.player, true);

		this.cursors = this.input.keyboard!.createCursorKeys();

		EventBus.emit('current-scene-ready', this);
	}

	update(time: number, delta: number) {
		this.handlePlayerInput();
		this.updatePlayerMovement();
	}

	handlePlayerInput() {
		if (this.isMoving) return;

		let dx = 0;
		let dy = 0;

		if (this.cursors.left.isDown) dx -= 1;
		else if (this.cursors.right.isDown) dx += 1;
		else if (this.cursors.up.isDown) dy -= 1;
		else if (this.cursors.down.isDown) dy += 1;

		if (dx !== 0 || dy !== 0) {
			this.startPlayerMovement(dx, dy);
		}
	}

	startPlayerMovement(dx: number, dy: number) {
		this.targetTileX = this.playerTileX + dx;
		this.targetTileY = this.playerTileY + dy;

		if (this.map.isValidTile(this.targetTileX, this.targetTileY)) {
			this.isMoving = true;
			this.movementProgress = 0;
		}
	}

	updatePlayerMovement() {
		if (!this.isMoving) return;

		this.movementProgress += this.moveSpeed;

		if (this.movementProgress >= this.map.tileWidth) {
			// Movement complete
			this.playerTileX = this.targetTileX;
			this.playerTileY = this.targetTileY;
			this.updatePlayerPosition();
			this.isMoving = false;
			this.movementProgress = 0;
		} else {
			// Interpolate position
			const startPos = this.map.getTilePosition(this.playerTileX, this.playerTileY);
			const endPos = this.map.getTilePosition(this.targetTileX, this.targetTileY);
			const progress = this.movementProgress / this.map.tileWidth;

			this.player.x = Math.round(startPos.x + (endPos.x - startPos.x) * progress);
			this.player.y = Math.round(startPos.y + (endPos.y - startPos.y) * progress);
		}
	}

	updatePlayerPosition() {
		const pos = this.map.getTilePosition(this.playerTileX, this.playerTileY);
		this.player.setPosition(Math.round(pos.x), Math.round(pos.y));
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
}
