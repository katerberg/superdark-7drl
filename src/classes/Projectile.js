import * as Phaser from 'phaser';
import {DEPTH, ENEMY} from '../constants';
import {getTimeAwareOfPauses} from '../utils/time';

export class Projectile extends Phaser.GameObjects.Ellipse {
  shotTime;
  weapon;

  constructor({scene, x, y, angle, weapon}) {
    super(scene, x, y, 30, 30, undefined, 0);
    this.shotTime = getTimeAwareOfPauses(scene.time.now);
    this.depth = DEPTH.PROJECTILE;

    scene.physics.world.enable(this);

    this.setAngle(angle);
    this.weapon = weapon;
    scene.add.existing(this);
  }

  getDamage() {
    this.weapon.damage;
  }

  update() {
    const xVelocity = Math.cos((this.angle * Math.PI) / 180) * ENEMY.PROJECTILE_SPEED;
    const yVelocity = Math.sin((this.angle * Math.PI) / 180) * ENEMY.PROJECTILE_SPEED;
    this.body.setVelocity(xVelocity, yVelocity);
  }
}
