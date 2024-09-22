import { Scene, GameObjects } from 'phaser';

export class ChatBubble extends GameObjects.Container {
	private background: GameObjects.Graphics;
	private text: GameObjects.Text;
	private padding: number = 8;
	private maxWidth: number = 200;
	private tailHeight: number = 4;

	constructor(scene: Scene, x: number, y: number, message: string) {
		super(scene, Math.round(x), Math.round(y));
		scene.add.existing(this);

		this.background = scene.add.graphics();
		this.add(this.background);

		this.text = scene.add.text(0, 0, message, {
			fontSize: '16px',
			stroke: '#303030',
			strokeThickness: 3,
			color: '#ffffff',
			fontFamily: 'Monogram',
			wordWrap: { width: this.maxWidth - this.padding * 2, useAdvancedWrap: true },
			resolution: 10 // Changed to 1 for pixel-perfect rendering
		});

		this.text.setOrigin(0.5);
		this.add(this.text);

		this.drawBubble();
		this.setDepth(10);

		// Auto-destroy after 5 seconds
		this.setMessage(message);
	}

	private drawBubble() {
		const width = Math.round(Math.min(this.text.width + this.padding * 2, this.maxWidth));
		const height = Math.round(this.text.height + this.padding);
		const cornerRadius = 4; // Rounded down from 5
		const tailWidth = 10;

		this.background.clear();
		this.background.fillStyle(0x909090, 0.8);
		this.background.lineStyle(1, 0x000000, 0.5);

		// Start path for the entire bubble shape
		this.background.beginPath();

		// Top left corner
		this.background.moveTo(-Math.floor(width / 2) + cornerRadius, -height);

		// Top side
		this.background.lineTo(Math.floor(width / 2) - cornerRadius, -height);

		// Top right corner
		this.background.arc(
			Math.floor(width / 2) - cornerRadius,
			-height + cornerRadius,
			cornerRadius,
			-Math.PI / 2,
			0
		);

		// Right side
		this.background.lineTo(Math.floor(width / 2), -cornerRadius);

		// Bottom right corner
		this.background.arc(
			Math.floor(width / 2) - cornerRadius,
			-cornerRadius,
			cornerRadius,
			0,
			Math.PI / 2
		);

		// Bottom side (right part)
		this.background.lineTo(Math.floor(tailWidth / 2), 0);

		// Tail (right side)
		this.background.lineTo(0, this.tailHeight);

		// Tail (left side)
		this.background.lineTo(-Math.floor(tailWidth / 2), 0);

		// Bottom side (left part)
		this.background.lineTo(-Math.floor(width / 2) + cornerRadius, 0);

		// Bottom left corner
		this.background.arc(
			-Math.floor(width / 2) + cornerRadius,
			-cornerRadius,
			cornerRadius,
			Math.PI / 2,
			Math.PI
		);

		// Left side
		this.background.lineTo(-Math.floor(width / 2), -height + cornerRadius);

		// Top left corner (closing the path)
		this.background.arc(
			-Math.floor(width / 2) + cornerRadius,
			-height + cornerRadius,
			cornerRadius,
			Math.PI,
			-Math.PI / 2
		);

		// Fill and stroke the path
		this.background.closePath();
		this.background.fillPath();
		this.background.strokePath();

		this.text.setPosition(0, -Math.floor(height / 2) - 2);
	}

	public setMessage(message: string) {
		this.text.setText(message);
		this.drawBubble();
	}
}
