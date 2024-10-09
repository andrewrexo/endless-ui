import { EventBus } from '../event-bus';
import { Scene } from 'phaser';
import { MapRenderer } from '../render/map';
import { centerX as scaleCenterX, centerY as scaleCenterY } from '../scale';
import { PlayerSprite } from '../entities/player-sprite';
import { NPC } from '../entities/npc';
import { action } from '../../components/ui/main/action.svelte';
import type { NativeUI } from './native-ui';
import { ui } from '$lib/user-interface.svelte';
import { connect } from '../../hooks/connect';
import type { Client, Room } from 'colyseus.js';
import type { State } from '../../server/room/home-room';
import { chatbox } from '../../stores/chatStore.svelte';
import { MapItem, ItemType, type ItemProperties } from '../entities/item';
import { itemMenuOptions } from '$lib/context';

export class Game extends Scene {
	map!: MapRenderer; // Add the '!' to fix the initialization error
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	localPlayer: PlayerSprite | null = null;
	currentPath: { x: number; y: number }[] = [];
	private attackKey!: Phaser.Input.Keyboard.Key;
	private pendingDestination: { x: number; y: number } | null = null;
	private keyPressStartTime: number = 0;
	private keyPressThreshold: number = 80; // milliseconds
	private mapToggled: boolean = false;
	private client: Client;
	public npcs: NPC[] = [];
	public players: PlayerSprite[] = [];
	public minimapObjectLayer!: Phaser.GameObjects.Container;
	public minimapCamera!: Phaser.Cameras.Scene2D.Camera;
	private inputEnabled: boolean = true;
	private lastAttackTime: number = 0;
	private contextMenu: Phaser.GameObjects.DOMElement | null = null;
	private fixedUpdateRate: number = 1000 / 60; // Fixed update rate for 60 FPS
	private accumulatedTime: number = 0;
	private room: Room<State> | null = null;
	private items: Map<string, MapItem> = new Map();
	private fpsText: Phaser.GameObjects.Text;

	constructor() {
		super('Game');
		this.client = connect();
		this.handleTileClick = this.handleTileClick.bind(this);
	}

	create() {
		this.minimapCamera = this.cameras.add(0, 40, 800, 800, false, 'minimap').setVisible(false);
		this.minimapObjectLayer = this.add.container(0, 0);
		this.minimapObjectLayer.setDepth(1);

		this.map = new MapRenderer(this);
		this.map.create();

		const centerTileX = 12;
		const centerTileY = 7;

		this.createPlayerAnimations();
		this.localPlayer = this.createPlayer(centerTileX, centerTileY, '', '0');

		this.cameras.main.setZoom(1);
		this.cameras.main.setRoundPixels(true);
		this.cameras.main.fadeIn(500, 0, 0, 0);

		this.minimapCamera.startFollow(this.localPlayer);

		// Render UI
		this.scene.launch('NativeUI');

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.input.setPollOnMove();
		this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		EventBus.on('tileclick', this.handleTileClick, this);
		EventBus.on('interactableclick', this.handleInteractableClick, this);
		EventBus.on(
			'contextmenu',
			(this.game.scene.getScene('NativeUI') as NativeUI)!.handleContextMenu,
			this
		);

		EventBus.emit('current-scene-ready', this);
		EventBus.on('chatbox:send', this.sendMessage.bind(this));
		EventBus.on('refreshScene', this.reloadScene.bind(this), this);
		EventBus.on('minimap:toggle', this.toggleMinimap.bind(this), this);
		EventBus.on('item:pickup', this.handleItemPickup, this);
		EventBus.on('item:drop', this.dropItem, this);
		EventBus.on('itemclick', this.handleItemClick, this);

		this.createNPC('mage', 2, 2, 'Mage');
		this.addMinimap();

		this.cameras.main.startFollow(this.localPlayer, true, 0.8, 0.8);
		this.cameras.main.roundPixels = true;

		this.physics.world.createDebugGraphic();
		this.fpsText = this.add
			.text(10, 10, '', { font: '16px Courier', color: '#00ff00' })
			.setDepth(999)
			.setScrollFactor(0);

		this.connect();
	}

	private createPlayerAnimations() {
		const textureKey = 'mage'; // Assuming 'mage' is the texture key for all players

		this.anims.create({
			key: 'player-idle-rear',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 8, end: 8 }),
			frameRate: 1,
			repeat: -1
		});

		this.anims.create({
			key: 'player-idle-front',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: 0 }),
			frameRate: 1,
			repeat: -1
		});

		this.anims.create({
			key: 'player-walk-down',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: 7 }),
			duration: 600,
			repeat: -1
		});

		this.anims.create({
			key: 'player-walk-up',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 8, end: 15 }),
			duration: 600,
			repeat: -1
		});

		this.anims.create({
			key: 'player-walk-left',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 8, end: 15 }),
			duration: 600,
			repeat: -1
		});

		this.anims.create({
			key: 'player-walk-right',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: 7 }),
			duration: 600,
			repeat: -1
		});

		this.anims.create({
			key: 'player-attack-rear',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 20, end: 23 }),
			frameRate: 10,
			repeat: 0
		});

		this.anims.create({
			key: 'player-attack-front',
			frames: this.anims.generateFrameNumbers(textureKey, { start: 16, end: 19 }),
			frameRate: 10,
			repeat: 0
		});
	}

	handleItemDrop(itemId: string, tileX: number, tileY: number) {
		// Always create a new item, regardless of whether it already exists
		this.createItem(itemId, tileX, tileY);
	}

	createItem(itemId: string, tileX: number, tileY: number) {
		const itemProperties: ItemProperties = {
			name: 'Teddy',
			description: 'A cute teddy bear',
			type: ItemType.KEY_ITEM,
			sprite: `${itemId.split('_')[0]}`,
			value: 50
		};

		const { x, y } = this.map.getTilePosition(tileX, tileY);
		const item = new MapItem(this, x, y, itemProperties.sprite, itemProperties, itemId, this.map);
		item.setDepth(y + this.map.tileHeight / 2);
		item.tileX = tileX;
		item.tileY = tileY;
		this.items.set(itemId, item);
		this.map.addEntity(item, tileX, tileY);
	}

	dropItem(itemId: string, tileX: number, tileY: number) {
		// This method is called when the local player wants to drop an item
		if (this.room) {
			this.room.send('item:drop', { itemId, tileX, tileY });
		}
	}

	addClientHandlers(room: Room<State>) {
		room.state.players.onAdd((player, key) => {
			console.log('player added', player, 'with key', key);
			if (key === room.sessionId) {
				// This is the local player
				if (!this.localPlayer) {
					this.localPlayer = this.createPlayer(
						player.x,
						player.y,
						`Player ${key.substr(0, 4)}`,
						key
					);
					this.localPlayer.isLocalPlayer = true;
				} else {
					this.localPlayer.playerId = key;
					this.localPlayer.name = `Player ${key.substr(0, 4)}`;
					this.localPlayer.usernameText.setText(this.localPlayer.name);
				}
			} else {
				// This is a remote player
				if (!this.players.find((p) => p.playerId === key)) {
					this.createPlayer(player.x, player.y, `Player ${key.substr(0, 4)}`, key);
				} else {
					console.log('Player already exists:', key);
				}
			}
		});

		// room.state.players.onChange((player, key) => {
		// 	if (player) {
		// 		const playerSprite = this.players.find((p) => p && p.playerId === key);
		// 		if (playerSprite && !playerSprite.isLocalPlayer) {
		// 			playerSprite.serverUpdate(player);
		// 		}
		// 	}
		// });

		room.state.players.onRemove((player, key) => {
			const playerIndex = this.players.findIndex((p) => p.playerId === key);
			if (playerIndex !== -1) {
				const removedPlayer = this.players.splice(playerIndex, 1)[0];
				removedPlayer.destroy();
			}
		});

		room.onMessage('player:move', (message) => {
			console.log('player:move', message);
			const playerSprite = this.players.find((p) => p.playerId === message.sessionId);
			if (playerSprite) {
				playerSprite.startMovement(message.dx, message.dy);
				playerSprite.serverUpdate({
					x: message.x,
					y: message.y,
					targetTileX: message.targetTileX,
					targetTileY: message.targetTileY
				});
			}
		});

		room.onMessage('player:face', (message) => {
			console.log('player:face', message);
			const playerSprite = this.players.find((p) => p.playerId === message.sessionId);

			if (playerSprite) {
				playerSprite.direction = message.direction;
			}
		});

		room.onMessage('player:moved', (message) => {
			console.log('player:moved', message);
			const playerSprite = this.players.find((p) => p.playerId === message.sessionId);
			if (playerSprite) {
				playerSprite.serverUpdate({
					x: message.x,
					y: message.y,
					targetTileX: message.targetTileX,
					targetTileY: message.targetTileY
				});
			}
		});

		room.onMessage('player:disconnected', (message) => {
			console.log('disconnected', message);
		});

		room.onMessage('player:reconnected', (message) => {
			console.log('player:reconnected', message);
			const playerSprite = this.players.find((p) => p.playerId === message.sessionId);
			if (playerSprite) {
				// Restore the player's appearance
				playerSprite.setAlpha(1);
			}
		});

		room.onMessage('chat', (message) => {
			console.log('Received chat message:', message);
			const { playerId, message: chatMessage } = message;
			const playerSprite = this.players.find((p) => p.playerId === playerId);
			if (playerSprite) {
				chatbox.addMessage({
					sender: playerSprite.name,
					content: chatMessage,
					timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
				});
				console.log(`Showing chat bubble for player ${playerId}`);
				playerSprite.showChatBubble(chatMessage);
			} else {
				console.log(`Could not find player sprite for ${playerId}`);
			}
		});

		room.onMessage('item:remove', (message: { itemId: string }) => {
			const item = this.items.get(message.itemId);

			if (item) {
				item.destroy();
				this.items.delete(message.itemId);
			}
		});

		room.onMessage('item:drop', (message: { itemId: string; tileX: number; tileY: number }) => {
			this.handleItemDrop(message.itemId, message.tileX, message.tileY);
			console.log('item:drop', message);
		});
	}

	connect() {
		this.client
			.joinOrCreate('home_room')
			.then((room: Room) => {
				this.addClientHandlers(room);
				console.log(room.sessionId, 'joined', room.name);

				// Generate starting position
				const centerTileX = 12;
				const centerTileY = 7;

				room.send('player:add', {
					x: centerTileX,
					y: centerTileY,
					targetTileX: centerTileX,
					targetTileY: centerTileY,
					name: 'Player ' + room.sessionId.substr(0, 4)
				});

				this.room = room;
			})
			.catch((e) => {
				console.log('JOIN ERROR', e);
			});
	}

	toggleMinimap() {
		if (this.mapToggled) {
			this.cameras.remove(this.minimapCamera, false);
			this.mapToggled = false;
			this.cameras.main.setAlpha(1);
			this.cameras.main.postFX.clear();

			ui.handleButtonAction('chat', 'open');
			ui.handleButtonAction('inventory', 'open');
			ui.handleButtonAction('debug', 'open');
			ui.handleButtonAction('tasks', 'open');
		} else {
			this.cameras.addExisting(this.minimapCamera, false);
			this.mapToggled = true;
			this.cameras.main.setAlpha(0.5);
			this.minimapCamera.setVisible(true);

			ui.handleButtonAction('chat', 'close');
			ui.handleButtonAction('inventory', 'close');
			ui.handleButtonAction('debug', 'close');
			ui.handleButtonAction('tasks', 'close');

			this.cameras.main.postFX.addColorMatrix().blackWhite(true);
		}
	}

	alignMinimapToPlayer() {}

	addMinimap() {
		this.cameras.main.ignore(this.minimapObjectLayer);

		this.minimapCamera.setZoom(0.2);
		this.minimapCamera.fadeIn(500, 0, 0, 0);

		this.minimapCamera.setPosition(
			0,
			(-(this.map.mapHeight * this.map.tileHeight) * this.minimapCamera.zoom) / 2
		);

		this.map.initMinimap();

		this.npcs.forEach((npc) => {
			this.minimapObjectLayer.add(npc.mapIcon);
			this.minimapCamera.ignore(npc);
		});

		this.minimapObjectLayer.add(this.localPlayer!.mapIcon);
		this.minimapObjectLayer.bringToTop(this.localPlayer!.mapIcon);
		this.minimapCamera.ignore(this.localPlayer!);

		this.cameras.main.ignore(this.minimapObjectLayer);

		this.input.on(
			'wheel',
			(
				p: Phaser.Input.Pointer,
				gameObjects: any[],
				deltaX: number,
				deltaY: number,
				deltaZ: number
			) => {
				const zoomFactor = this.minimapCamera.zoom + deltaY * 0.01;

				this.minimapCamera.setZoom(zoomFactor);
			}
		);

		this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
			if (!p.isDown) return;

			// Check if the cursor is within the minimap bounds
			if (
				p.x >= this.minimapCamera.x &&
				p.x <= this.minimapCamera.x + this.minimapCamera.width &&
				p.y >= this.minimapCamera.y &&
				p.y <= this.minimapCamera.y + this.minimapCamera.height
			) {
				this.minimapCamera.scrollX -= (p.x - p.prevPosition.x) / this.minimapCamera.zoom;
				this.minimapCamera.scrollY -= (p.y - p.prevPosition.y) / this.minimapCamera.zoom;
			}
		});
	}

	reloadScene() {
		this.scene.restart();
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
		// this.input.keyboard?.resetKeys();
	}

	createNPC(spriteKey: string, tileX: number, tileY: number, name: string) {
		const npc = new NPC(this, spriteKey, tileX, tileY, name, this.map);
		this.npcs.push(npc);
		this.map.addEntity(npc, tileX, tileY);
		return npc;
	}

	createPlayer(tileX: number, tileY: number, name: string, sessionId: string = '') {
		const { x, y } = this.map.getTilePosition(tileX, tileY);
		const player = new PlayerSprite(this, 0, 0, name, this.map.tileHeight);

		this.players.push(player);
		this.map.addEntity(player, tileX, tileY);

		this.minimapObjectLayer.add(player.mapIcon);

		player.setImmediatePosition(tileX, tileY);
		player.setDepth(y + this.map.tileHeight / 2);
		player.playerId = sessionId;

		player.name = name;
		console.log(`Created player ${name} with ID ${sessionId} at tile (${tileX}, ${tileY})`);

		return player;
	}

	update(time: number, delta: number) {
		this.accumulatedTime -= this.fixedUpdateRate;

		if (this.inputEnabled && this.localPlayer) {
			this.handlePlayerInput(time);
		}

		this.players.forEach((player) => player.update(this.fixedUpdateRate));

		if (this.localPlayer) {
			if (this.localPlayer.isMoving) {
				if (
					this.localPlayer.tileX === this.localPlayer.targetTileX &&
					this.localPlayer.tileY === this.localPlayer.targetTileY
				) {
					this.recalculatePath();
				}
			} else {
				this.movePlayerAlongPath();
			}
		}

		this.npcs.forEach((npc) => npc.update());

		// Update the FPS text
		this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
	}

	handleInteractableClick = ({ npc, tile }: { npc: NPC; tile: { x: number; y: number } }) => {
		console.log('Interactable clicked:', tile);

		const closestTile = this.findClosestTile(tile);

		if (this.localPlayer!.isMoving) {
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

	handleTileClick = (tile: Phaser.Tilemaps.Tile) => {
		console.log('Tile clicked:', tile);

		if (this.contextMenu) {
			this.contextMenu.setVisible(false);
		}

		this.setNewDestination({ x: tile.x, y: tile.y });
	};

	setNewDestination(tile: { x: number; y: number }) {
		if (!this.localPlayer) return;

		let startX = this.localPlayer.tileX;
		let startY = this.localPlayer.tileY;
		const endX = tile.x;
		const endY = tile.y;

		// If the player is already moving, use their target position as the start
		if (this.localPlayer.isMoving) {
			startX = this.localPlayer.targetTileX;
			startY = this.localPlayer.targetTileY;
		}

		const path = this.map.findPath(startX, startY, endX, endY);

		console.log('Path found:', path);
		if (path.length > 1) {
			this.currentPath = path.slice(1); // Remove the first element (current position)
			console.log('Setting current path:', this.currentPath);

			// If the player is not moving, start movement immediately
			if (!this.localPlayer.isMoving) {
				this.movePlayerAlongPath();
			}
		} else {
			console.log('No valid path found');
		}
	}

	movePlayerAlongPath() {
		if (this.currentPath.length > 0 && this.localPlayer && !this.localPlayer.isMoving) {
			const nextTile = this.currentPath[0];
			console.log('Moving to next tile:', nextTile);
			this.room?.send('player:move', {
				x: this.localPlayer.tileX,
				y: this.localPlayer.tileY,
				targetTileX: nextTile.x,
				targetTileY: nextTile.y
			});
			const dx = Math.floor(nextTile.x - this.localPlayer.tileX);
			const dy = Math.floor(nextTile.y - this.localPlayer.tileY);
			this.localPlayer.startMovement(dx, dy);
			this.currentPath.shift();
		} else {
			const navigationEndCursor =
				this.map.activeTile &&
				Math.abs(this.map.activeTile.x - this.localPlayer.tileX) <= 1 &&
				Math.abs(this.map.activeTile.y - this.localPlayer.tileY) <= 1;

			if (navigationEndCursor) {
				this.room?.send('player:move', {
					x: this.localPlayer.tileX,
					y: this.localPlayer.tileY,
					targetTileX: this.localPlayer.tileX,
					targetTileY: this.localPlayer.tileY
				});
				// Replace this line
				// this.map.events.emit('navigationend');

				// With this:
				EventBus.emit('navigationend');
			}
		}
	}

	// Add this new method to recalculate the path
	recalculatePath() {
		console.log('huh');
		if (this.currentPath.length > 0 && this.localPlayer) {
			const endTile = this.currentPath[this.currentPath.length - 1];
			this.setNewDestination(endTile);
		}
	}

	handlePlayerInput(fixedTime: number) {
		if (
			!this.inputEnabled ||
			!this.localPlayer ||
			this.localPlayer.isMoving ||
			this.currentPath.length > 0
		)
			return;

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
				this.keyPressStartTime = fixedTime;
			}

			const keyPressDuration = fixedTime - this.keyPressStartTime;
			const direction = dx === -1 ? 'left' : dx === 1 ? 'right' : dy === -1 ? 'up' : 'down';

			if (keyPressDuration >= this.keyPressThreshold) {
				// Key held long enough, initiate movement
				const targetTileX = this.localPlayer.tileX + dx;
				const targetTileY = this.localPlayer.tileY + dy;
				if (this.map.isValidTile(targetTileX, targetTileY)) {
					// Send the move message to the server
					this.room?.send('player:move', {
						x: this.localPlayer.tileX,
						y: this.localPlayer.tileY,
						targetTileX: targetTileX,
						targetTileY: targetTileY
					});

					this.localPlayer.startMovement(dx, dy);
				}
			} else if (keyPressDuration && this.localPlayer.direction != direction) {
				this.room.send('player:face', {
					direction: direction
				});

				this.localPlayer.faceDirection(direction, { update: true });
			}
		} else {
			// No key pressed, reset the start time
			this.keyPressStartTime = 0;
		}
	}

	sendMessage(message: string) {
		if (this.localPlayer && this.room) {
			console.log(`Sending chat message: ${message}`);
			chatbox.addMessage({
				sender: this.localPlayer.name,
				content: message,
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			});
			this.localPlayer.showChatBubble(message);
			this.room.send('chat', message);
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
		// Add these lines to remove the event listeners when the scene is destroyed
		EventBus.off('tileclick', this.handleTileClick, this);
		EventBus.off('interactableclick', this.handleInteractableClick, this);
		EventBus.off(
			'contextmenu',
			(this.game.scene.getScene('NativeUI') as NativeUI)!.handleContextMenu,
			this
		);
		EventBus.off('itemclick', this.handleItemClick, this);

		// ... existing cleanup code ...
		window.removeEventListener('focus', this.onWindowFocus);
		window.removeEventListener('blur', this.onWindowBlur);
	}

	handleShooting() {
		const currentTime = this.time.now;
		if (this.attackKey.isDown) {
			if (currentTime - this.lastAttackTime >= this.localPlayer!.attackCooldown) {
				this.localPlayer!.attack();
			}
		}
	}

	private isMobile(): boolean {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
	}

	private isLandscape(): boolean {
		if (this.isMobile()) {
			return window.orientation === 90 || window.orientation === -90;
		} else {
			return false;
		}
	}

	handleItemPickup = ({ itemId }: { itemId: string }) => {
		const item = this.items.get(itemId);
		if (!item) {
			console.log('Item not found:', itemId);
			return;
		}

		if (!this.localPlayer) {
			console.log('Local player not found, cannot pick up item');
			return;
		}

		const distance = Phaser.Math.Distance.Between(
			this.localPlayer.x,
			this.localPlayer.y,
			item.x,
			item.y
		);

		if (distance > this.map.tileWidth * 2) {
			console.log('Item is too far away to pick up');
			return;
		}

		console.log('Sending item pickup request to server');
		if (this.room) {
			this.room.send('item:pickup', { itemId });
		}
	};

	handleItemClick = (item: MapItem) => {
		console.log('Item clicked:', item);

		if (this.contextMenu) {
			this.contextMenu.setVisible(false);
		}

		// Update the context menu state for the item
		// ui.handleContextAction('open', {
		// 	name: item.properties.name,
		// 	open: true,
		// 	identifier: item.properties.sprite,
		// 	options: itemMenuOptions,
		// 	isItem: true,
		// 	itemId: item.itemId
		// });

		// // Position the context menu near the item
		// const screenPosition = this.cameras.main.worldToScreen(item.x, item.y);
		// ui.contextMenu.style.left = `${screenPosition.x}px`;
		// ui.contextMenu.style.top = `${screenPosition.y}px`;
	};
}
