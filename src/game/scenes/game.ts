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
	private minimapShape!: Phaser.GameObjects.Shape;
	private room: Room | null = null;

	constructor() {
		super('Game');
		this.client = connect();
	}

	create() {
		this.minimapCamera = this.cameras.add(0, 40, 800, 800, false, 'minimap').setVisible(false);
		this.minimapObjectLayer = this.add.container(0, 0);
		this.minimapObjectLayer.setDepth(1);
		// Create and initialize the map
		this.map = new MapRenderer(this, 0, 0);
		this.map.create();

		const mapWidth = this.map.mapWidth;
		const mapHeight = this.map.mapHeight;
		// const centerTileX = Math.floor(mapWidth / 2) - 1;
		// const centerTileY = Math.floor(mapHeight / 2) - 1;
		const centerTileX = 12;
		const centerTileY = 7;

		const startPos = this.map.layer.getTileAt(centerTileX, centerTileY);

		this.localPlayer = this.createPlayer(centerTileX, centerTileY, '');

		this.cameras.main.setZoom(1);
		this.cameras.main.startFollow(this.localPlayer, false, 1, 1);
		this.cameras.main.setRoundPixels(true);
		this.cameras.main.fadeIn(500, 0, 0, 0);

		this.minimapCamera.startFollow(this.localPlayer);

		// Render UI
		this.scene.launch('NativeUI');

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.input.setPollOnMove();
		this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		this.map.on('tileclick', this.handleTileClick, this);
		this.map.on('interactableclick', this.handleInteractableClick, this);
		this.map.on(
			'contextmenu',
			(this.game.scene.getScene('NativeUI') as NativeUI)!.handleContextMenu,
			this
		);

		EventBus.emit('current-scene-ready', this);
		EventBus.on('chatbox:send', this.sendMessage.bind(this));
		EventBus.on('refreshScene', this.reloadScene.bind(this), this);
		EventBus.on('minimap:toggle', this.toggleMinimap.bind(this), this);

		this.createNPC('mage', 2, 2, 'Mage');
		this.addMinimap();

		this.connect();
	}

	addClientHandlers(room: Room<State>) {
		room.state.players.onAdd((player, key) => {
			console.log('player added', player);
			if (key === room.sessionId) {
				// This is the local player
				if (!this.localPlayer) {
					this.localPlayer = this.createPlayer(
						player.x,
						player.y,
						`Player ${room.sessionId.substr(0, 4)}`
					);
					this.localPlayer.isLocalPlayer = true;
					this.cameras.main.startFollow(this.localPlayer, false, 1, 1);
					this.minimapCamera.startFollow(this.localPlayer);
				} else {
					this.localPlayer.usernameText.setText(`Player ${room.sessionId.substr(0, 4)}`);
				}
			} else {
				// This is a remote player
				if (!this.players.find((p) => p.name === player.name)) {
					this.createPlayer(player.x, player.y, player.name);
				} else {
					console.log('already exists');
				}
			}
		});

		room.state.players.onChange((player, key) => {
			if (player) {
				const playerSprite = this.players.find((p) => p && p.name === player.name);
				if (playerSprite && !playerSprite.isLocalPlayer) {
					playerSprite.serverUpdate(player);
				}
			}
		});

		room.state.players.onRemove((player, key) => {
			const playerIndex = this.players.findIndex((p) => p.name === player.name);
			if (playerIndex !== -1) {
				const removedPlayer = this.players.splice(playerIndex, 1)[0];
				removedPlayer.destroy();
			}
		});

		room.onMessage('player:joined', (message) => {
			console.log('player:joined', message);
			if (message.sessionId !== room.sessionId) {
				this.createPlayer(message.x, message.y, message.name);
			}
		});

		room.onMessage('player:move', (message) => {
			console.log('player:move', message);
			const playerSprite = this.players.find((p) => p.name === message.name);
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
			const playerSprite = this.players.find((p) => p.name === message.name);

			if (playerSprite) {
				playerSprite.direction = message.direction;
			}
		});

		room.onMessage('player:moved', (message) => {
			console.log('player:moved', message);
			const playerSprite = this.players.find((p) => p.name !== this.localPlayer?.name);
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
			const playerSprite = this.players.find((p) => p.name === message.sessionId);
			if (playerSprite) {
				// Restore the player's appearance
				playerSprite.setAlpha(1);
			}
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

	createPlayer(tileX: number, tileY: number, name: string) {
		const { x, y } = this.map.getTilePosition(tileX, tileY);
		const player = new PlayerSprite(this, 0, 0, name, this.map.tileHeight);

		this.players.push(player);
		this.map.addEntity(player, tileX, tileY);

		this.minimapObjectLayer.add(player.mapIcon);

		player.setImmediatePosition(tileX, tileY);
		player.setDepth(y + this.map.tileHeight / 2);

		console.log(
			`Created player ${name} at tile (${tileX}, ${tileY}), pixel (${x}, ${y - this.map.tileHeight / 2})`
		);

		return player;
	}

	update(time: number, delta: number) {
		this.accumulatedTime += delta;

		while (this.accumulatedTime >= this.fixedUpdateRate) {
			this.accumulatedTime -= this.fixedUpdateRate;

			if (this.inputEnabled && this.localPlayer) {
				this.handlePlayerInput(time * 1);
			}

			this.players.forEach((player) => player.update());

			if (this.localPlayer) {
				if (this.localPlayer.isMoving) {
					// Check if the player has reached their immediate destination
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
		}
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

	handleTileClick = (tile: { x: number; y: number }) => {
		console.log('Tile clicked:', tile);

		if (this.contextMenu) {
			this.contextMenu.setVisible(false);
		}

		this.setNewDestination(tile);
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
			if (
				this.map.activeTile &&
				this.map.activeTile.x === this.localPlayer.tileX &&
				this.map.activeTile.y === this.localPlayer.tileY
			) {
				this.room?.send('player:move', {
					x: this.localPlayer.tileX,
					y: this.localPlayer.tileY,
					targetTileX: this.localPlayer.tileX,
					targetTileY: this.localPlayer.tileY
				});
				this.map.emit('navigationend');
			}
		}
	}

	// Add this new method to recalculate the path
	recalculatePath() {
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
		this.localPlayer!.showChatBubble(message);
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
			if (currentTime - this.lastAttackTime >= this.localPlayer!.attackCooldown) {
				this.localPlayer!.attack();
			}
		}
	}
}
