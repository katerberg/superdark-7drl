import * as Phaser from 'phaser';

export class Wall extends Phaser.GameObjects.Rectangle {
  constructor({scene, x, y, width = 10, height = 100}) {
    super(scene, x, y, width, height, 0x000000, 1);
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }
}
