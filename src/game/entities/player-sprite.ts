import { Scene, GameObjects, Math as PhaserMath } from 'phaser';
import { ChatBubble } from './chat-bubble';

export class PlayerSprite extends GameObjects.Container {
	tileX: number = 0;
	tileY: number = 0;
	moveSpeed: number = 3; // Pixels per frame
	isMoving: boolean = false;
	targetTileX: number = 0;
	targetTileY: number = 0;
	movementProgress: number = 0;
	direction: 'up' | 'down' | 'left' | 'right' = 'down';
	offsetY: number = 16;
	isShooting: boolean = false;
	username: string;

	private usernameText: GameObjects.Text;
	private playerSprite: GameObjects.Sprite;
	private lastShotTime: number = 0;
	private shootCooldown: number = 400; // ms
	private hasWeaponOut: boolean = false;
	private isAnimationPlaying: boolean = false;
	private currentAnimation: string = '';
	private animationMap = {
		up: { idle: 'player-idle-rear', shoot: 'player-shoot-rear', draw: 'player-draw-weapon-rear' },
		down: { idle: 'player-idle-front', shoot: 'player-shoot', draw: 'player-draw-weapon' },
		left: { idle: 'player-idle-rear', shoot: 'player-shoot-rear', draw: 'player-draw-weapon-rear' },
		right: { idle: 'player-idle-front', shoot: 'player-shoot', draw: 'player-draw-weapon' }
	};

	private particles: Phaser.GameObjects.Particles.ParticleEmitter;
	private chatBubble: ChatBubble | null = null;

	constructor(scene: Scene, x: number, y: number, username: string) {
		super(scene, x, y);
		scene.add.existing(this);
		this.username = username;

		this.playerSprite = scene.add.sprite(x, y, 'player', 1);
		this.add(this.playerSprite);
		this.createAnimations();
		this.playIdleAnimation();
		this.playerSprite.setDepth(3);
		this.playerSprite.setOrigin(0.5, 0);
		// Create username text
		this.usernameText = scene.add.text(this.playerSprite.x, this.playerSprite.y, username, {
			fontSize: '24px',
			color: '#ffffff',
			fontFamily: 'Monogram',
			stroke: '#000000',
			strokeThickness: 5,
			fontStyle: 'bold'
		});

		this.usernameText.setResolution(10);
		this.usernameText.setOrigin(0.5, 1);
		this.usernameText.setDepth(3);
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
	}

	startMovement(dx: number, dy: number) {
		this.targetTileX = this.tileX + dx;
		this.targetTileY = this.tileY + dy;

		this.isMoving = true;
		this.movementProgress = 0;

		let animKey = '';
		if (dx < 0) {
			this.direction = 'left';
			animKey = 'player-walk-left';
			this.playerSprite.setFlipX(true);
		} else if (dx > 0) {
			this.direction = 'right';
			animKey = 'player-walk-right';
			this.playerSprite.setFlipX(false);
		} else if (dy < 0) {
			this.direction = 'up';
			animKey = 'player-walk-up';
			this.playerSprite.setFlipX(false);
		} else if (dy > 0) {
			this.direction = 'down';
			animKey = 'player-walk-down';
			this.playerSprite.setFlipX(true);
		}

		this.playAnimation(animKey);
	}

	updateMovement(tileWidth: number) {
		if (!this.isMoving) {
			if (!this.isShooting) {
				this.playIdleAnimation();
			}
			return;
		}

		this.movementProgress += this.moveSpeed;

		if (this.movementProgress >= tileWidth) {
			this.tileX = this.targetTileX;
			this.tileY = this.targetTileY;
			this.x = this.tileX * tileWidth;
			this.y = this.tileY * tileWidth;
			this.isMoving = false;
			this.movementProgress = 0;
			this.hasWeaponOut = false;
			this.isShooting = false;
		} else {
			// Update position during movement
			const progress = this.movementProgress / tileWidth;
			this.x = Phaser.Math.Linear(this.tileX * tileWidth, this.targetTileX * tileWidth, progress);
			this.y = Phaser.Math.Linear(this.tileY * tileWidth, this.targetTileY * tileWidth, progress);
		}
	}

	playIdleAnimation() {
		const animKey = this.animationMap[this.direction].idle;
		this.playerSprite.setFlipX(['left', 'down'].includes(this.direction));
		this.playAnimation(animKey);
	}

	canShoot(): boolean {
		return !this.isMoving && this.scene.time.now - this.lastShotTime >= this.shootCooldown;
	}

	animateWeapon() {
		const drawAnim = this.animationMap[this.direction].draw;
		this.playAnimation(drawAnim, () => {
			this.hasWeaponOut = true;
			this.playShootAnimation();
		});
	}

	shoot() {
		if (!this.canShoot()) return;
		this.isShooting = true;
		this.lastShotTime = this.scene.time.now;

		if (!this.hasWeaponOut) {
			this.animateWeapon();
		} else {
			this.createShootingEffect();
			this.playShootAnimation();
		}
	}

	private createShootingEffect() {
		const offsetX = 16; // Horizontal offset
		const offsetY = 8; // Vertical offset

		// Calculate emission point based on player's current position and direction
		let emitX = this.playerSprite.getBounds().x;
		let emitY = this.playerSprite.getBounds().y + this.playerSprite.height / 2; // Center vertically

		// Adjust emission point based on direction
		switch (this.direction) {
			case 'up':
				emitY += offsetY;
				emitX += offsetX + 8;
				break;
			case 'down':
				emitY += offsetY + 8;
				break;
			case 'left':
				emitX += 8;
				emitY += offsetY + 6;
				break;
			case 'right':
				emitX += this.playerSprite.width - 4;
				emitY += offsetY + 8;
				break;
		}

		// Update particle emitter configuration
		this.particles.setConfig({
			lifespan: 600,
			speed: { min: 10, max: 50 },
			scale: { start: 0.3, end: 0.1 },
			quantity: 10,
			blendMode: 'ADD',
			tint: 0xffff00
		});

		// Emit particles
		this.particles.emitParticle(15, emitX, emitY);

		// Stop the emitter after a short duration
		this.scene.time.delayedCall(300, () => {
			this.particles.stop();
		});
	}

	private getDirectionVector(): Phaser.Math.Vector2 {
		switch (this.direction) {
			case 'up':
				return new Phaser.Math.Vector2(0, -1);
			case 'down':
				return new Phaser.Math.Vector2(0, 1);
			case 'left':
				return new Phaser.Math.Vector2(-1, 0);
			case 'right':
				return new Phaser.Math.Vector2(1, 0);
		}
	}

	private getDirectionAngle(): number {
		switch (this.direction) {
			case 'up':
				return -60;
			case 'down':
				return 120;
			case 'left':
				return -150;
			case 'right':
				return 30;
		}
	}

	private playShootAnimation() {
		const shootAnim = this.animationMap[this.direction].shoot;
		this.playAnimation(shootAnim);
	}

	stopShooting() {
		this.isShooting = false;
		if (this.hasWeaponOut) {
			this.playAnimation(this.animationMap[this.direction].idle);
		} else {
			this.playIdleAnimation();
		}
	}

	private playAnimation(key: string, onComplete?: () => void) {
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
			frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
			frameRate: 1,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-idle-front',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 18, end: 18 }),
			frameRate: 1,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-down',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 19, end: 21 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-up',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-left',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-walk-right',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 19, end: 21 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'player-draw-weapon-rear',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
			frameRate: 10,
			repeat: 0
		});

		this.scene.anims.create({
			key: 'player-shoot-rear',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 5, end: 6 }),
			frameRate: 10,
			repeat: -1, // Play the animation twice for a full shoot cycle
			repeatDelay: 100
		});

		this.scene.anims.create({
			key: 'player-shoot',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 23, end: 24 }),
			frameRate: 10,
			repeat: -1,
			repeatDelay: 100 // Play the animation twice for a full shoot cycle
		});

		this.scene.anims.create({
			key: 'player-draw-weapon',
			frames: this.scene.anims.generateFrameNumbers('player', { start: 22, end: 22 }),
			frameRate: 10,
			repeat: 0
		});
	}

	showChatBubble(message: string) {
		if (this.chatBubble) {
			this.chatBubble.destroy();
		}

		const bubbleX = 0;
		const bubbleY = -this.playerSprite.height + 2;

		this.chatBubble = new ChatBubble(this.scene, bubbleX, bubbleY, message);
		this.add(this.chatBubble);

		// hide username text cause it looks ugly with too much visible
		this.usernameText.setVisible(false);

		// Auto-destroy after 5 seconds
		this.scene.time.delayedCall(5000, () => {
			if (this.chatBubble) {
				this.usernameText.setVisible(true);
				this.chatBubble.destroy();
				this.chatBubble = null;
			}
		});
	}
}
