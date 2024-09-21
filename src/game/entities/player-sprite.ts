import { Scene, GameObjects } from 'phaser';

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
	private usernameText: GameObjects.Text;
	private playerSprite: GameObjects.Sprite;

	constructor(scene: Scene, x: number, y: number, username: string) {
		super(scene, x, y);
		scene.add.existing(this);

		this.playerSprite = scene.add.sprite(x, y, 'player', 1);
		this.add(this.playerSprite);
		this.createAnimations();
		this.playIdleAnimation();
		this.playerSprite.setDepth(3);
		// Create username text
		this.usernameText = scene.add.text(this.playerSprite.x, this.playerSprite.y, username, {
			fontSize: '12px',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 4
		});

		this.usernameText.setResolution(5);

		this.add(this.usernameText);

		this.playerSprite.setOrigin(0.5, 0);

		this.usernameText.setOrigin(0.5, 1);
		this.usernameText.setDepth(3);
	}

	startMovement(dx: number, dy: number) {
		this.targetTileX = this.tileX + dx;
		this.targetTileY = this.tileY + dy;

		this.isMoving = true;
		this.movementProgress = 0;

		if (dx < 0) {
			this.direction = 'left';
			this.playerSprite.play('player-walk-left', true);
			this.playerSprite.setFlipX(true);
		} else if (dx > 0) {
			this.direction = 'right';
			this.playerSprite.play('player-walk-right', true);
			this.playerSprite.setFlipX(false);
		} else if (dy < 0) {
			this.direction = 'up';
			this.playerSprite.play('player-walk-up', true);
			this.playerSprite.setFlipX(false);
		} else if (dy > 0) {
			this.direction = 'down';
			this.playerSprite.play('player-walk-down', true);
			this.playerSprite.setFlipX(true);
		}
	}

	updateMovement(tileWidth: number) {
		if (
			!this.isMoving &&
			this.playerSprite.anims.currentAnim?.key !== 'player-idle-rear' &&
			this.playerSprite.anims.currentAnim?.key !== 'player-idle-front'
		) {
			this.playIdleAnimation();
			return;
		}

		this.movementProgress += this.moveSpeed;

		if (this.movementProgress >= tileWidth) {
			this.tileX = this.targetTileX;
			this.tileY = this.targetTileY;
			this.isMoving = false;
			this.movementProgress = 0;
		}
	}

	playIdleAnimation() {
		switch (this.direction) {
			case 'up':
				this.playerSprite.play('player-idle-rear', true);
				break;
			case 'down':
				this.playerSprite.play('player-idle-front', true);
				break;
			case 'left':
				this.playerSprite.play('player-idle-rear', true);
				this.playerSprite.setFlipX(true);
				break;
			case 'right':
				this.playerSprite.play('player-idle-front', true);
				this.playerSprite.setFlipX(false);
				break;
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
	}
}
