import * as Phaser from 'phaser';
import {PlayerLegs} from './PlayerLegs';

export class Player extends Phaser.GameObjects.Sprite {
  legs;

  constructor({scene, x, y, key}) {
    super(scene, x, y, key);
    this.depth = 1;
    const scale = 0.5;
    this.setDisplayOrigin(0.5).setDisplaySize(216 * scale, 253 * scale);
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);

    this.anims.create({
      key: 'walk',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('character', {start: 0, end: 19}),
      repeat: -1,
    });
    this.legs = new PlayerLegs({scene, x, y, key: `${key}legs`, scale});
    this.legs.play('walk');
    //  .world.bringToTop(activeCard);
  }
}
