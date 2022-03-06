import * as Phaser from 'phaser';

export class Wall extends Phaser.GameObjects.Rectangle {
  constructor({scene, x, y}) {
    super(scene, x, y, 10, 100, 0x000000, 1);

    scene.physics.world.enable(this);
    scene.add.existing(this);
    // this.setAngle(90);
  }
}
