import * as Phaser from 'phaser';

export class WinSwitch extends Phaser.GameObjects.Image {
  constructor({scene, x, y}) {
    super(scene, x, y, 'winSwitch');

    this.scale = 0.4;
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.body.setImmovable(true);
  }
}
