import * as Phaser from 'phaser';
import {DEPTH} from '../constants';

export class Projectile extends Phaser.GameObjects.Rectangle {
  enemy;

  constructor({scene, x, y, angle, enemy}) {
    super(scene, x, y, 5000, 1, 0xcc5555);
    this.depth = DEPTH.PROJECTILE;
    this.setOrigin(0);

    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.angle = angle;
    this.enemy = enemy;
    // TODO: Figure out how to get the collision box to match
  }
}
