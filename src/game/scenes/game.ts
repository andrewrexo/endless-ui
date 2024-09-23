import { EventBus } from '../event-bus';
import { Scene } from 'phaser';
import { MapRenderer } from '../render/map';
import { centerX as scaleCenterX, centerY as scaleCenterY } from '../scale';
import { PlayerSprite } from '../entities/player-sprite';
import { ChatBubble } from '../entities/chat-bubble';

export class Game extends Scene {
	map!: MapRenderer; // Add the '!' to fix the initialization error
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	player!: PlayerSprite;
	currentPath: { x: number; y: number }[] = [];
	private attackKey!: Phaser.Input.Keyboard.Key;
	private pendingDestination: { x: number; y: number } | null = null;

	constructor() {
		super('Game');
	}

	create() {
		// Create and initialize the map
		this.map = new MapRenderer(this, 0, 0);
		this.map.create();

		// Create player at the (0, 0) tile position
		const startPos = this.map.getTilePosition(0, 0);
		const username = 'drei'; // Replace with actual username retrieval

		this.player = new PlayerSprite(this, startPos.x, startPos.y, username, this.map.tileHeight);

		// Adjust the player's initial position to be centered on the tile
		this.player.setPosition(startPos.x, startPos.y - this.player.offsetY);

		// Set up camera
		this.cameras.main.setZoom(1);
		this.cameras.main.startFollow(this.player, true);
		this.cameras.main.setRoundPixels(true);
		this.cameras.main.fadeIn(500, 0, 0, 0);

		// Remove any camera offset adjustment
		// this.cameras.main.setFollowOffset(0, 0);

		// Render UI
		this.scene.launch('NativeUI');

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		// Remove the existing EventBus listener and add it directly to the map
		// EventBus.on('tile-clicked', this.handleTileClick, this);
		this.map.on('tileclick', this.handleTileClick, this);

		EventBus.emit('current-scene-ready', this);
		EventBus.on('chatbox:send', this.sendMessage.bind(this));
	}

	update(time: number, delta: number) {
		if (
			this.map.activeTile &&
			this.map.activeTile.x === this.player.tileX &&
			this.map.activeTile.y === this.player.tileY
		) {
			this.map.emit('navigationend');
		}

		this.handlePlayerInput();
		this.updatePlayerMovement();
		if (!this.player.isMoving) {
			this.movePlayerAlongPath();
		}
		this.handleShooting();
	}

	handleTileClick = (tile: { x: number; y: number }) => {
		console.log('Tile clicked:', tile);

		if (this.player.isMoving) {
			console.log('Player is moving, setting pending destination');
			this.pendingDestination = { x: tile.x, y: tile.y };
			return;
		}

		this.setNewDestination(tile);
	};

	setNewDestination(tile: { x: number; y: number }) {
		const startX = Math.floor(this.player.tileX);
		const startY = Math.floor(this.player.tileY);
		const endX = Math.floor(tile.x);
		const endY = Math.floor(tile.y);

		const path = this.map.findPath(startX, startY, endX, endY);
		console.log('Path found:', path);
		if (path.length > 1) {
			this.currentPath = path.slice(1); // Remove the first element (current position)
			console.log('Setting current path:', this.currentPath);
			this.movePlayerAlongPath();
		} else {
			console.log('No valid path found');
		}
	}

	movePlayerAlongPath() {
		if (this.currentPath.length > 0 && !this.player.isMoving) {
			const nextTile = this.currentPath[0];
			console.log('Moving to next tile:', nextTile);
			const dx = Math.floor(nextTile.x - this.player.tileX);
			const dy = Math.floor(nextTile.y - this.player.tileY);
			this.player.startMovement(dx, dy);
			this.currentPath.shift();
		} else if (this.currentPath.length === 0 && this.pendingDestination) {
			console.log('Reached current destination, processing pending destination');
			const newDestination = this.pendingDestination;
			this.pendingDestination = null;
			this.setNewDestination(newDestination);
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
		if (!this.player.isMoving) {
			if (!this.player.isAttacking && !this.player.isIdling) {
				this.player.isIdling = true;
				this.player.playIdleAnimation();
			}

			return;
		}

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

			// Check for pending destination after movement is complete
			if (this.pendingDestination) {
				console.log('Processing pending destination after movement');
				const newDestination = this.pendingDestination;
				this.pendingDestination = null;
				this.setNewDestination(newDestination);
			} else {
				this.movePlayerAlongPath();
			}
		}
	}

	sendMessage(message: string) {
		console.log(message);
		this.player.showChatBubble(message);
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
		if (this.attackKey.isDown) {
			this.player.attack();
		}
	}
}
