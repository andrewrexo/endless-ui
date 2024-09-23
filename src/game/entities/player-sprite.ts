import { Scene, GameObjects, Math as PhaserMath } from 'phaser';
import { ChatBubble } from './chat-bubble';

export class PlayerSprite extends GameObjects.Container {
	tileX: number = 0;
	tileY: number = 0;
	moveSpeed: number = 2; // Pixels per frame
	isMoving: boolean = false;
	targetTileX: number = 0;
	targetTileY: number = 0;
	movementProgress: number = 0;
	direction: 'up' | 'down' | 'left' | 'right' = 'down';
	offsetY: number;
	isShooting: boolean = false;
	isIdling: boolean = false;
	isAttacking: boolean = false;
	username: string;

	private usernameText: GameObjects.Text;
	private playerSprite: GameObjects.Sprite;
	private lastAttackTime: number = 0;
	private attackCooldown: number = 300; // ms
	private isAnimationPlaying: boolean = false;
	private currentAnimation: string = '';
	private animationMap = {
		up: { idle: 'player-idle-rear', attack: 'player-attack-rear' },
		down: { idle: 'player-idle-front', attack: 'player-attack-front' },
		left: { idle: 'player-idle-rear', attack: 'player-attack-rear' },
		right: { idle: 'player-idle-front', attack: 'player-attack-front' }
	};
	private particles: Phaser.GameObjects.Particles.ParticleEmitter;
	private chatBubble: ChatBubble | null = null;
	private chatBubbleTimer: Phaser.Time.TimerEvent | null = null;

	constructor(scene: Scene, x: number, y: number, username: string, tileHeight: number) {
		super(scene, x, y);
		scene.add.existing(this);
		this.username = username;

		this.playerSprite = scene.add.sprite(x, y, 'fighter', 1);
		this.add(this.playerSprite);
		this.createAnimations();
		this.playIdleAnimation();
		this.playerSprite.setDepth(3);
		// Create username text
		this.usernameText = scene.add.text(this.playerSprite.x, this.playerSprite.y, username, {
			fontSize: '16px',
			color: '#ffffff',
			fontFamily: 'Monogram',
			stroke: '#000000',
			strokeThickness: 2,
			align: 'center'
		});

		this.usernameText.setResolution(10);
		this.usernameText.setDepth(3);
		this.usernameText.setPosition(
			-this.playerSprite.getBounds().width / 2 + 4,
			this.playerSprite.y - 32
		);

		this.add(this.usernameText);

		// Create particle emitter
		this.particles = scene.add.particles(this.playerSprite.x, this.playerSprite.y, 'pixel', {
			lifespan: 500,
			speed: { min: 100, max: 200 },
			scale: { start: 1, end: 0 },
			quantity: 20,
			blendMode: 'ADD',
			emitting: false,
			tint: 0xffff00
		});

		this.particles.setDepth(4);

		this.offsetY = tileHeight / 4; // Set offset to 1/4 of tile height
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
			this.playerSprite.setFlipX(true);
		} else if (dx > 0) {
			this.faceDirection('right', { update: false });
			animKey = 'player-walk-right';
			this.playerSprite.setFlipX(false);
		} else if (dy < 0) {
			this.faceDirection('up', { update: false });
			animKey = 'player-walk-up';
			this.playerSprite.setFlipX(false);
		} else if (dy > 0) {
			this.faceDirection('down', { update: false });
			animKey = 'player-walk-down';
			this.playerSprite.setFlipX(true);
		}

		this.playAnimation(animKey);
	}

	updateMovement(tileWidth: number) {
		this.movementProgress += this.moveSpeed;

		if (this.movementProgress >= tileWidth) {
			this.isIdling = false;
			this.tileX = this.targetTileX;
			this.tileY = this.targetTileY;
			this.x = this.tileX * tileWidth;
			this.y = this.tileY * tileWidth;
			this.isMoving = false;
			this.movementProgress = 0;
			this.isAttacking = false;
			return true;
		} else {
			// Update position during movement
			const progress = this.movementProgress / tileWidth;
			this.x = Phaser.Math.Linear(this.tileX * tileWidth, this.targetTileX * tileWidth, progress);
			this.y = Phaser.Math.Linear(this.tileY * tileWidth, this.targetTileY * tileWidth, progress);
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
		console.log('Playing animation:', key);
		if (!key) return;
		if (this.currentAnimation !== key) {
			this.currentAnimation = key;
			this.playerSprite.play(key);
			if (onComplete) {
				this.playerSprite.once('animationcomplete', onComplete);
			}
		}
	}

	private createAnimations() {
		this.scene.anims.create({
			key: 'player-idle-rear',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 8, end: 8 }),
			frameRate: 1,
			repeat: -1 // Set to -1 for infinite repeat
		});

		this.scene.anims.create({
			key: 'player-idle-front',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 0, end: 0 }),
			frameRate: 1,
			repeat: -1 // Set to -1 for infinite repeat
		});

		this.scene.anims.create({
			key: 'player-walk-down',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 0, end: 7 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-up',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 8, end: 15 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-left',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 8, end: 15 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-right',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 0, end: 7 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-attack-rear',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 20, end: 23 }),
			frameRate: 10,
			repeat: 0
		});

		this.scene.anims.create({
			key: 'player-attack-front',
			frames: this.scene.anims.generateFrameNumbers('fighter', { start: 16, end: 19 }),
			frameRate: 10,
			repeat: 0
		});
	}

	showChatBubble(message: string) {
		if (this.chatBubble) {
			// Update existing chat bubble
			this.chatBubble.setMessage(message);
		} else {
			// Create new chat bubble
			const bubbleX = 0;
			const bubbleY = -16;
			this.chatBubble = new ChatBubble(this.scene, bubbleX, bubbleY, message);
			this.add(this.chatBubble);
		}

		// Hide username text
		this.usernameText.setVisible(false);

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
		this.usernameText.setVisible(true);
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
		this.playerSprite.setFlipX(['left', 'down'].includes(this.direction));
		this.playAnimation(animKey);
	}
}
