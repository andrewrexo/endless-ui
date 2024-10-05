import { GameObjects } from 'phaser';
import { ChatBubble } from './chat-bubble';
import { Game as GameScene } from '../scenes/game';

export class PlayerSprite extends GameObjects.Container {
	tileX: number = 0;
	tileY: number = 0;
	moveSpeed: number = 2; // Pixels per frame
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
	public declare scene: GameScene;

	public usernameText: GameObjects.Text;
	private playerSprite: GameObjects.Sprite;
	private lastAttackTime: number = 0;
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
		super(scene, 0, 0);

		this.name = username;
		this.actionDescription = username;

		this.playerSprite = scene.add.sprite(0, 0, this.textureKey, 1);
		this.playerSprite.setOrigin(0.5);
		this.add(this.playerSprite);
		this.createAnimations();
		this.playIdleAnimation();
		this.playerSprite.setDepth(3);
		// Create username text
		this.usernameText = scene.add
			.text(0, 0, username, {
				fontSize: '16px',
				color: '#ffffff',
				fontFamily: 'Abaddon',
				stroke: '#000000',
				strokeThickness: 2,
				align: 'center'
			})
			.setVisible(false);

		this.usernameText.setPosition(0, -24);
		this.usernameText.setOrigin(0.5);

		this.playerSprite.setInteractive();
		this.add(this.usernameText);

		this.mapIcon = scene.add.sprite(0, 0, 'player-icon');
		this.mapIcon.setOrigin(0.5);
		this.mapIcon.setPosition(0, -this.playerSprite.height / 2 - 16 / 2); // Position above the player
		this.mapIcon.setScale(7);
		this.mapIcon.setTint(0xffff80);

		this.playerSprite.on('pointerover', () => {
			if (this.isHover) return;

			this.playerSprite.postFX.addGlow(0xffffff, 4, 0.5, false, 2, 4);
			this.isHover = true;
			this.usernameText.setVisible(true);
			scene.updateActionText(this.action, this.actionDescription);
		});

		this.playerSprite.on('pointerout', () => {
			if (!this.isHover) return;

			this.playerSprite.postFX.clear();
			this.isHover = false;
			this.usernameText.setVisible(false);
			scene.updateActionText('', '');
		});

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
		this.offsetY = Math.round(tileHeight / 2);

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

	update() {
		super.update();

		if (this.isMoving) {
			this.updateMovement(this.scene.map.tileWidth);
		} else {
			if (this.needsDirectionUpdate()) {
				this.faceDirection(this.direction, { update: true });
			}
		}

		this.setDepth(this.y + this.playerSprite.height);
		this.mapIcon.setPosition(this.x, this.y);
		this.usernameText.setDepth(this.y + this.playerSprite.height * 10);
	}

	private needsDirectionUpdate(): boolean {
		const isFlipped = this.playerSprite.flipX;
		const currentAnim = this.playerSprite.anims.currentAnim;
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

	updateMovement(tileWidth: number) {
		this.movementProgress += this.moveSpeed;

		const startPos = this.scene.map.getTilePosition(this.tileX, this.tileY);
		const endPos = this.scene.map.getTilePosition(this.targetTileX, this.targetTileY);
		const progress = this.movementProgress / tileWidth;

		this.x = Math.round(startPos.x + (endPos.x - startPos.x) * progress);
		this.y = Math.round(startPos.y + (endPos.y - startPos.y) * progress - this.offsetY);

		if (this.movementProgress >= tileWidth) {
			this.isIdling = true;
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
		console.log('Playing animation:', key);
		if (!key) return;

		// Stop any current animation
		this.playerSprite.stop();

		// Reset the sprite to the first frame of the new animation
		const animationConfig = this.scene.anims.get(key);
		if (animationConfig) {
			this.playerSprite.setFrame(animationConfig.frames[0].frame.name);
		}

		this.playerSprite.play(key);

		if (onComplete) {
			this.playerSprite.once('animationcomplete', onComplete);
		}
	}

	private createAnimations() {
		this.scene.anims.create({
			key: 'player-idle-rear',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 8, end: 8 }),
			frameRate: 1,
			repeat: -1 // Set to -1 for infinite repeat
		});

		this.scene.anims.create({
			key: 'player-idle-front',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 0, end: 0 }),
			frameRate: 1,
			repeat: -1 // Set to -1 for infinite repeat
		});

		this.scene.anims.create({
			key: 'player-walk-down',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 0, end: 7 }),
			duration: 600,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-up',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 8, end: 15 }),
			duration: 600,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-left',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 8, end: 15 }),
			duration: 600,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-right',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 0, end: 7 }),
			duration: 600,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-attack-rear',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 20, end: 23 }),
			frameRate: 10,
			repeat: 0
		});

		this.scene.anims.create({
			key: 'player-attack-front',
			frames: this.scene.anims.generateFrameNumbers(this.textureKey, { start: 16, end: 19 }),
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
			const bubbleX = 4;
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
		console.log(
			`Updated animation: direction=${this.direction}, animKey=${animKey}, flipped=${this.playerSprite.flipX}`
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
