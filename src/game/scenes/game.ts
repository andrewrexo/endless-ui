import { EventBus } from '../event-bus';
import { Scene } from 'phaser';
import { MapRenderer } from '../render/map';
import { centerX as scaleCenterX, centerY as scaleCenterY } from '../scale';
import { PlayerSprite } from '../entities/player-sprite';
import { ChatBubble } from '../entities/chat-bubble';
import { NPC } from '../entities/npc';
import { action } from '../../components/ui/main/action.svelte';
import { ui } from '../../lib/user-interface.svelte';

export class Game extends Scene {
	map!: MapRenderer; // Add the '!' to fix the initialization error
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	player!: PlayerSprite;
	currentPath: { x: number; y: number }[] = [];
	private attackKey!: Phaser.Input.Keyboard.Key;
	private pendingDestination: { x: number; y: number } | null = null;
	private keyPressStartTime: number = 0;
	private keyPressThreshold: number = 80; // milliseconds
	public npcs: NPC[] = [];
	public players: PlayerSprite[] = [];
	private inputEnabled: boolean = true;
	private isAttackKeyDown: boolean = false;
	private lastAttackTime: number = 0;
	private contextMenu: Phaser.GameObjects.DOMElement | null = null;

	constructor() {
		super('Game');
	}

	create() {
		// Create and initialize the map
		this.map = new MapRenderer(this, 0, 0);
		this.map.create();

		const mapWidth = this.map.mapWidth;
		const mapHeight = this.map.mapHeight;
		// const centerTileX = Math.floor(mapWidth / 2) - 1;
		// const centerTileY = Math.floor(mapHeight / 2) - 1;
		const centerTileX = 4;
		const centerTileY = 3;

		const startPos = this.map.layer.getTileAt(centerTileX, centerTileY);
		const username = 'shrube'; // Replace with actual username retrieval

		this.player = this.createPlayer(startPos.x, startPos.y, username);
		this.player.faceDirection('left', { update: true });

		// Adjust the player's initial position to be centered on the tile
		this.player.setPosition(startPos.pixelX, startPos.pixelY - this.player.offsetY);
		this.player.setDepth(this.player.tileY + 1);

		// Update player's tile coordinates
		this.player.tileX = centerTileX;
		this.player.tileY = centerTileY;

		// Set up camera
		this.cameras.main.setZoom(1);
		this.cameras.main.startFollow(this.player, true);
		this.cameras.main.setRoundPixels(true);
		this.cameras.main.fadeIn(500, 0, 0, 0);

		// Render UI
		this.scene.launch('NativeUI');

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		this.map.on('tileclick', this.handleTileClick, this);
		this.map.on('interactableclick', this.handleInteractableClick, this);
		this.map.on('contextmenu', this.handleContextMenu, this);

		this.createNPC('mage', 2, 2, 'Mage');
		this.createNPC('fighter', 2, 3, 'Fighter');
		this.createNPC('cleric', 2, 4, '1Cleric');

		EventBus.emit('current-scene-ready', this);
		EventBus.on('chatbox:send', this.sendMessage.bind(this));
		EventBus.on(
			'context-hide',
			() => {
				this.contextMenu?.setVisible(false);
			},
			this
		);

		// Add event listeners for window focus and blur
		window.addEventListener('focus', this.onWindowFocus.bind(this));
		window.addEventListener('blur', this.onWindowBlur.bind(this));
	}

	updateActionText = (actionName: string, actionDescription: string) => {
		action.action = { action: actionName, text: actionDescription };
	};

	onWindowFocus() {
		this.cursors = this.input.keyboard!.createCursorKeys();
		this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
	}

	onWindowBlur() {
		// Remove active keydown events when the window loses focus
		this.input.keyboard?.resetKeys();
	}

	createNPC(spriteKey: string, tileX: number, tileY: number, name: string) {
		const npc = new NPC(this, spriteKey, tileX, tileY, name, this.map);
		this.npcs.push(npc);
		this.map.addEntity(npc, tileX, tileY);
		return npc;
	}

	createPlayer(tileX: number, tileY: number, name: string) {
		const player = new PlayerSprite(this, tileX, tileY, name, this.map.tileHeight);
		this.players.push(player);
		this.map.addEntity(player, tileX, tileY);
		return player;
	}
	update(time: number, delta: number) {
		if (
			this.map.activeTile &&
			this.map.activeTile.x === this.player.tileX &&
			this.map.activeTile.y === this.player.tileY
		) {
			this.map.emit('navigationend');
		}

		if (this.inputEnabled) {
			this.handlePlayerInput(time);
			this.updatePlayerMovement();
			if (!this.player.isMoving) {
				this.movePlayerAlongPath();
			}
			this.handleShooting();
		}

		this.npcs.forEach((npc) => npc.update());
	}

	handleContextMenu = (object: NPC | PlayerSprite) => {
		ui.handleContextAction('open', {
			name: object.name
		});

		if (ui.contextMenu) {
			if (this.contextMenu) {
				this.contextMenu.setPosition(object.x - 10, object.y).setVisible(true);
				return;
			}

			this.contextMenu = this.add.dom(object.x - 10, object.y, ui.contextMenu).setVisible(true);

			this.contextMenu.addListener('pointerdown');
			this.contextMenu.on('pointerdown', () => {
				this.contextMenu?.setVisible(false);
			});

			this.add.existing(this.contextMenu);
		}
	};

	handleInteractableClick = ({ npc, tile }: { npc: NPC; tile: { x: number; y: number } }) => {
		console.log('Interactable clicked:', tile);

		const closestTile = this.findClosestTile(tile);

		if (this.player.isMoving) {
			console.log('Player is moving, setting pending destination');
			this.pendingDestination = { x: closestTile.x, y: closestTile.y };
			return;
		}

		this.setNewDestination(closestTile);
	};

	findClosestTile = (tile: { x: number; y: number }) => {
		const { x, y } = tile;

		return { x, y };
	};

	handleTileClick = (tile: { x: number; y: number }) => {
		console.log('Tile clicked:', tile);

		if (this.contextMenu) {
			this.contextMenu.setVisible(false);
		}

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

	handlePlayerInput(time: number) {
		if (!this.inputEnabled || this.player.isMoving || this.currentPath.length > 0) return;

		let dx = 0;
		let dy = 0;
		let keyPressed = false;

		if (this.cursors.left.isDown) {
			dx = -1;
			keyPressed = true;
		} else if (this.cursors.right.isDown) {
			dx = 1;
			keyPressed = true;
		} else if (this.cursors.up.isDown) {
			dy = -1;
			keyPressed = true;
		} else if (this.cursors.down.isDown) {
			dy = 1;
			keyPressed = true;
		}

		if (keyPressed) {
			if (this.keyPressStartTime === 0) {
				this.keyPressStartTime = time;
			}

			const keyPressDuration = time - this.keyPressStartTime;
			const direction = dx === -1 ? 'left' : dx === 1 ? 'right' : dy === -1 ? 'up' : 'down';

			if (keyPressDuration >= this.keyPressThreshold) {
				// Key held long enough, initiate movement
				const targetTileX = this.player.tileX + dx;
				const targetTileY = this.player.tileY + dy;
				if (this.map.isValidTile(targetTileX, targetTileY)) {
					this.player.startMovement(dx, dy);
				}
			} else if (keyPressDuration > 10 && this.player.direction != direction) {
				this.player.faceDirection(direction, { update: true });
			}
		} else {
			// No key pressed, reset the start time
			this.keyPressStartTime = 0;
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
		window.removeEventListener('focus', this.onWindowFocus);
		window.removeEventListener('blur', this.onWindowBlur);
	}

	handleShooting() {
		const currentTime = this.time.now;
		if (this.attackKey.isDown) {
			if (currentTime - this.lastAttackTime >= this.player.attackCooldown) {
				this.player.attack();
			}
		}
	}
}
