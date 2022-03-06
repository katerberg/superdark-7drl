import * as Phaser from 'phaser';
import {DEPTH} from '../constants';

export class Projectile extends Phaser.GameObjects.Rectangle {
  constructor({scene, x, y, angle}) {
    super(scene, x, y, 5000, 1, 0xcc5555);
    this.depth = DEPTH.PROJECTILE;
    this.setOrigin(0);

    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.angle = angle;
    // TODO: Figure out how to get the collision box to match
  }
}
