import * as Phaser from 'phaser';

export class PlayerLegs extends Phaser.GameObjects.Sprite {
  constructor({scene, x, y, key, scale}) {
    super(scene, x, y + (172 * scale) / 2, key);
    this.setDisplayOrigin(0.5, 0.5);
    this.setScale(scale);
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);

    this.anims.create({
      key: 'walk',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('characterLegsWalk', {start: 0, end: 20}),
      repeat: -1,
    });
  }
}
