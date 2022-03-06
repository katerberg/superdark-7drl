import * as Phaser from 'phaser';
import {DEPTH, ENEMY} from '../constants';
import {PlayerLegs} from './PlayerLegs';

export class Enemy extends Phaser.GameObjects.Sprite {
  constructor({scene, x, y, key}) {
    super(scene, x, y, key);
    this.angle = 0;
    this.depth = DEPTH.ENEMY;

    this.setDisplaySize(ENEMY.WIDTH * ENEMY.SCALE, ENEMY.HEIGHT * ENEMY.SCALE);
    const xOrigin = 0.45;
    const yOrigin = 0.47;
    this.setDisplayOrigin(xOrigin, yOrigin);
    this.setOrigin(xOrigin, yOrigin);

    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    this.body.setCircle(30);
    scene.add.existing(this);

    this.anims.create({
      key: 'walkEnemy',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('enemy-rifle-move', {start: 0, end: 19}),
      repeat: -1,
    });
    this.legs = new PlayerLegs({scene, x, y, key: `${key}legs`, player: this});
    this.legs.play('walk');
  }
}
