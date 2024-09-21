import { Scene, GameObjects } from 'phaser';

export class PlayerSprite extends GameObjects.Sprite {
	tileX: number = 0;
	tileY: number = 0;
	moveSpeed: number = 3; // Pixels per frame
	isMoving: boolean = false;
	targetTileX: number = 0;
	targetTileY: number = 0;
	movementProgress: number = 0;
	direction: 'up' | 'down' | 'left' | 'right' = 'down';
	offsetY: number = 16;

	constructor(scene: Scene, x: number, y: number) {
		super(scene, x, y, 'player', 1);
		scene.add.existing(this);
		this.setDepth(2);
		this.createAnimations();
		this.playIdleAnimation();
	}

	startMovement(dx: number, dy: number) {
		this.targetTileX = this.tileX + dx;
		this.targetTileY = this.tileY + dy;

		this.isMoving = true;
		this.movementProgress = 0;

		if (dx < 0) {
			this.direction = 'left';
			this.play('player-walk-left', true);
			this.setFlipX(true);
		} else if (dx > 0) {
			this.direction = 'right';
			this.play('player-walk-right', true);
			this.setFlipX(false);
		} else if (dy < 0) {
			this.direction = 'up';
			this.play('player-walk-up', true);
			this.setFlipX(false);
		} else if (dy > 0) {
			this.direction = 'down';
			this.play('player-walk-down', true);
			this.setFlipX(true);
		}
	}

	updateMovement(tileWidth: number) {
		if (
			!this.isMoving &&
			this.anims.currentAnim?.key !== 'player-idle-rear' &&
			this.anims.currentAnim?.key !== 'player-idle-front'
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
				this.play('player-idle-rear', true);
				break;
			case 'down':
				this.play('player-idle-front', true);
				break;
			case 'left':
				this.play('player-idle-rear', true);
				this.setFlipX(true);
				break;
			case 'right':
				this.play('player-idle-front', true);
				this.setFlipX(false);
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
