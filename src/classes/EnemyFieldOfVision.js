import * as Phaser from 'phaser';
import {DEPTH, ENEMY} from '../constants';

export class EnemyFieldOfVision extends Phaser.GameObjects.Arc {
  enemy;

  constructor({scene, x, y, enemy}) {
    super(scene, x, y, 30, enemy.angle - ENEMY.VIEW_ANGLE - 10, enemy.angle + ENEMY.VIEW_ANGLE + 10, false, undefined);
    this.depth = DEPTH.ENEMY_FOV;
    this.enemy = enemy;
    this.setClosePath(false);
    this.setStrokeStyle(30, 0xffff00, 0.2);
    scene.add.existing(this);
  }

  update() {
    this.setAngle(this.enemy.angle);
    this.setPosition(this.enemy.x, this.enemy.y);
  }
}
