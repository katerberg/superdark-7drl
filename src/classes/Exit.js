import * as Phaser from 'phaser';

export class Exit extends Phaser.GameObjects.Image {
  start;
  end;

  constructor({scene, x, y, start, end}) {
    super(scene, x, y, 'exit');

    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.body.setImmovable(true);

    this.start = start;
    this.end = end;
  }
}
