import * as Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Image {
  constructor({scene, x, y, key}) {
    super(scene, x, y, key);
    this.setOrigin(0.5, 0.5).setDisplaySize(35, 43);
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);
  }

  update() {
    console.log('player updating');
  }
}
