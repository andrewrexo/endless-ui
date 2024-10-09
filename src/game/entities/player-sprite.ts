import { GameObjects } from 'phaser';
import { ChatBubble } from './chat-bubble';
import { Game, Game as GameScene } from '../scenes/game';

export class PlayerSprite extends GameObjects.Sprite {
	tileX: number = 0;
	tileY: number = 0;
	moveSpeed: number = 80; // Pixels per second
	attackCooldown: number = 600;
	isMoving: boolean = false;
	targetTileX: number = 0;
	targetTileY: number = 0;
	movementProgress: number = 0;
	direction: 'up' | 'down' | 'left' | 'right' = 'down';
	offsetY: number;
	isShooting: boolean = false;
	isIdling: boolean = false;
	isAttacking: boolean = false;
	textureKey: string = 'mage';
	action: string = 'Player';
	actionDescription: string = '';
	isHover: boolean = false;
	mapIcon: GameObjects.Sprite;
	playerId: string;
	public declare scene: GameScene;

	public usernameText: GameObjects.Text;
	private lastAttackTime: number = 0;
	public lastMoveUpdated: boolean = false;
	private animationMap = {
		up: { idle: 'player-idle-rear', attack: 'player-attack-rear' },
		down: { idle: 'player-idle-front', attack: 'player-attack-front' },
		left: { idle: 'player-idle-rear', attack: 'player-attack-rear' },
		right: { idle: 'player-idle-front', attack: 'player-attack-front' }
	};
	private particles: Phaser.GameObjects.Particles.ParticleEmitter;
	private chatBubble: ChatBubble | null = null;
	private chatBubbleTimer: Phaser.Time.TimerEvent | null = null;
	public isLocalPlayer: boolean = false;

	constructor(scene: GameScene, x: number, y: number, username: string, tileHeight: number) {
		super(scene, x, y, 'mage', 1);
		this.setOrigin(0.5);

		this.name = username;
		this.actionDescription = username;

		this.usernameText = scene.add
			.text(0, -24, username, {
				fontSize: '16px',
				color: '#ffffff',
				fontFamily: 'Abaddon',
				stroke: '#000000',
				strokeThickness: 2,
				align: 'center'
			})
			.setVisible(false)
			.setOrigin(0.5);

		this.setInteractive();

		this.mapIcon = scene.add.sprite(0, -this.height / 2 - 16 / 2, 'player-icon');
		this.mapIcon.setOrigin(0.5);
		this.mapIcon.setScale(7);
		this.mapIcon.setTint(0xffff80);

		this.on('pointerover', () => {
			if (this.isHover) return;

			this.postFX.addGlow(0x000000, 0.5, 0.5, false, 1, 4);
			this.isHover = true;
			this.usernameText.setVisible(true);
			scene.updateActionText(this.action, this.actionDescription);
		});

		this.on('pointerout', () => {
			if (!this.isHover) return;

			this.postFX.clear();
			this.isHover = false;
			this.usernameText.setVisible(false);
			scene.updateActionText('', '');
		});

		this.offsetY = Math.round(this.height / 4);
		scene.add.existing(this);
	}

	startMovement(dx: number, dy: number) {
		this.targetTileX = this.tileX + dx;
		this.targetTileY = this.tileY + dy;

		this.isMoving = true;
		this.movementProgress = 0;

		let animKey = '';
		if (dx < 0) {
			this.faceDirection('left', { update: false });
			animKey = 'player-walk-left';
			this.setFlipX(true);
		} else if (dx > 0) {
			this.faceDirection('right', { update: false });
			animKey = 'player-walk-right';
			this.setFlipX(false);
		} else if (dy < 0) {
			this.faceDirection('up', { update: false });
			animKey = 'player-walk-up';
			this.setFlipX(false);
		} else if (dy > 0) {
			this.faceDirection('down', { update: false });
			animKey = 'player-walk-down';
			this.setFlipX(true);
		}

		// Only start the animation if it's not already playing
		if (this.anims.currentAnim?.key !== animKey) {
			this.play(animKey);
		}
	}

	update(delta: number) {
		if (this.isMoving) {
			this.updateMovement(this.scene.map.tileWidth, delta);
		} else {
			if (this.needsDirectionUpdate()) {
				this.faceDirection(this.direction, { update: true });
			}
		}

		this.setDepth(this.y + this.height);
		this.updateChildrenPositions();

		if (
			this.isMoving &&
			Math.abs(this.tileX - this.targetTileX) < 1 &&
			Math.abs(this.tileY - this.targetTileY) < 1
		) {
			this.isMoving = false;
		}
	}

	private updateChildrenPositions() {
		// Update positions of children
		this.mapIcon.setPosition(this.x, this.y - this.height / 2 - 16 / 2);
		this.usernameText.setPosition(this.x, this.y - 24);
		this.usernameText.setDepth(100000);

		if (this.chatBubble) {
			const bubbleY = this.usernameText.visible ? -32 : -16; // Adjust Y position if username is visible
			this.chatBubble.setPosition(this.x, this.y + bubbleY);
			this.chatBubble.setDepth(100000);
		}
	}

	private needsDirectionUpdate(): boolean {
		const isFlipped = this.flipX;
		const currentAnim = this.anims.currentAnim;
		const expectedIdleAnim = this.animationMap[this.direction]?.idle;

		// If there's no expected idle animation for the current direction, always update
		if (!expectedIdleAnim) {
			return true;
		}

		return (
			(this.direction === 'left' && !isFlipped) ||
			(this.direction === 'right' && isFlipped) ||
			(this.direction === 'up' && isFlipped) ||
			(this.direction === 'down' && !isFlipped) ||
			(currentAnim && currentAnim.key !== expectedIdleAnim)
		);
	}

	updateMovement(tileWidth: number, delta: number) {
		const pixelsToMove = Math.floor((this.moveSpeed * delta) / 1000); // Ensure whole pixels
		this.movementProgress += pixelsToMove;

		const startPos = this.scene.map.getTilePosition(this.tileX, this.tileY);
		const endPos = this.scene.map.getTilePosition(this.targetTileX, this.targetTileY);
		const totalDistance = Math.max(
			Math.abs(endPos.x - startPos.x),
			Math.abs(endPos.y - startPos.y)
		);
		const progress = Math.min(this.movementProgress / totalDistance, 1);

		// Calculate new position, ensuring whole pixels
		const newX = Math.floor(startPos.x + (endPos.x - startPos.x) * progress);
		const newY = Math.floor(startPos.y + (endPos.y - startPos.y) * progress);

		this.x = newX;
		this.y = newY - this.offsetY;

		if (progress >= 1) {
			this.x = endPos.x;
			this.y = endPos.y - this.offsetY;
			this.tileX = this.targetTileX;
			this.tileY = this.targetTileY;
			this.isMoving = false;
			this.movementProgress = 0;
			this.isAttacking = false;
			this.playIdleAnimation();

			return true;
		}

		return false;
	}

	playIdleAnimation() {
		this.updateAnimation();
	}

	canAttack(): boolean {
		return !this.isMoving && this.scene.time.now - this.lastAttackTime >= this.attackCooldown;
	}

	attack() {
		if (!this.canAttack()) return;
		this.isAttacking = true;
		this.lastAttackTime = this.scene.time.now;

		this.playAttackAnimation();
	}

	private playAttackAnimation() {
		const attackAnim = this.animationMap[this.direction].attack;
		this.playAnimation(attackAnim, () => {
			this.isAttacking = false;
			this.playIdleAnimation();
		});
	}

	private playAnimation(key: string, onComplete?: () => void) {
		if (!key || this.anims.currentAnim?.key === key) return;

		this.play(key);

		if (onComplete) {
			this.once('animationcomplete', onComplete);
		}
	}

	showChatBubble(message: string) {
		console.log(`Showing chat bubble for ${this.name}: ${message}`);
		if (this.chatBubble) {
			// Update existing chat bubble
			this.chatBubble.setMessage(message);
		} else {
			// Create new chat bubble
			const bubbleX = 0;
			const bubbleY = this.usernameText.visible ? -32 : -16; // Adjust Y position if username is visible
			this.chatBubble = new ChatBubble(this.scene, bubbleX, bubbleY, message);
			this.scene.add.existing(this.chatBubble);
		}

		// Reset or create new timer
		if (this.chatBubbleTimer) {
			this.chatBubbleTimer.remove();
		}
		this.chatBubbleTimer = this.scene.time.delayedCall(5000, this.removeChatBubble, [], this);
	}

	private removeChatBubble() {
		if (this.chatBubble) {
			this.chatBubble.destroy();
			this.chatBubble = null;
		}
		this.chatBubbleTimer = null;
	}

	faceDirection(direction: 'up' | 'down' | 'left' | 'right', options: { update: boolean }) {
		this.direction = direction;

		if (options.update) {
			this.updateAnimation();
		}
	}

	updateAnimation() {
		const animKey = this.animationMap[this.direction].idle;
		this.setFlipX(['left', 'down'].includes(this.direction));
		this.playAnimation(animKey);
		console.log(
			`Updated animation: direction=${this.direction}, animKey=${animKey}, flipped=${this.flipX}`
		);
	}

	serverUpdate(data: {
		x: number;
		y: number;
		targetTileX: number;
		targetTileY: number;
		direction?: 'up' | 'down' | 'left' | 'right';
	}) {
		if (this.isLocalPlayer) return;

		this.tileX = data.x;
		this.tileY = data.y;
		this.targetTileX = data.targetTileX;
		this.targetTileY = data.targetTileY;

		if (this.targetTileX !== this.tileX || this.targetTileY !== this.tileY) {
			const dx = this.targetTileX - this.tileX;
			const dy = this.targetTileY - this.tileY;
			this.startMovement(dx, dy);
		} else {
			this.isMoving = false;
			this.movementProgress = 0;
			const { x, y } = this.scene.map.getTilePosition(this.tileX, this.tileY);
			this.setPosition(x, y - this.offsetY);
		}
	}

	updateLocalPosition(targetTileX: number, targetTileY: number) {
		this.targetTileX = targetTileX;
		this.targetTileY = targetTileY;
		this.isMoving = true;
		this.movementProgress = 0;
	}

	setImmediatePosition(tileX: number, tileY: number) {
		this.tileX = tileX;
		this.tileY = tileY;
		this.targetTileX = tileX;
		this.targetTileY = tileY;
		const { x, y } = this.scene.map.getTilePosition(tileX, tileY);
		this.setPosition(x, y - this.offsetY);
		this.isMoving = false;
		this.movementProgress = 0;
		this.playIdleAnimation();
		console.log(
			`Set ${this.name} to immediate position: tile (${tileX}, ${tileY}), pixel (${x}, ${y - this.offsetY})`
		);
	}
}
