import * as Phaser from 'phaser';

export class Exit extends Phaser.GameObjects.Image {
  constructor({scene, x, y}) {
    super(scene, x, y, 'exit');

    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.body.setImmovable(true);
  }
}
