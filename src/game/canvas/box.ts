import Phaser from 'phaser';

export class PixelArtBox extends Phaser.GameObjects.Container {
    private borderImage: Phaser.GameObjects.NineSlice;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, texture: string, borderSize: number) {
        super(scene, x, y);

        this.borderImage = scene.add.nineslice(0, 0, texture, undefined, width, height, borderSize, borderSize, borderSize, borderSize);

        this.add(this.borderImage);
    }

    setSize(width: number, height: number): this {
        this.borderImage.setSize(width, height);
        return this;
    }
}