import * as Phaser from 'phaser';
import {DEPTH, PLAYER, RUN_WALK} from '../constants';

export class RunWalkIndicator extends Phaser.GameObjects.Image {
  unhealthy;

  constructor({scene, x, y}) {
    super(scene, x, y, 'runwalk-walking');
    this.setDepth(DEPTH.RUNWALK_HEALTHY);
    this.setOrigin(0, 1);
    this.setScale(RUN_WALK.SCALE);
    scene.add.existing(this);
    this.unhealthy = new RunWalkUnhealthyIndicator({scene, x, y});
  }

  updateHp(hp) {
    this.unhealthy.updateHp(hp);
  }

  update(state) {
    const isRunning = RUN_WALK.STATE.RUNNING === state;
    this.setTexture(isRunning ? 'runwalk-running' : 'runwalk-walking');
    this.unhealthy.update(state);
  }
}

class RunWalkUnhealthyIndicator extends Phaser.GameObjects.Image {
  hp;

  constructor({scene, x, y}) {
    super(scene, x, y, 'runwalk-walking');
    this.setDepth(DEPTH.RUNWALK_HEALTHY);
    this.setOrigin(0, 1);
    this.setScale(RUN_WALK.SCALE);
    this.hp = PLAYER.MAX_HP;
    scene.add.existing(this);
  }

  updateHp(hp) {
    const damagePercentage = (PLAYER.MAX_HP - hp) / PLAYER.MAX_HP;
    this.setCrop(0, RUN_WALK.HEIGHT * (1 - damagePercentage), RUN_WALK.WIDTH, RUN_WALK.HEIGHT * damagePercentage);
  }

  update(state) {
    const isRunning = RUN_WALK.STATE.RUNNING === state;
    this.setTexture(isRunning ? 'runwalk-running' : 'runwalk-walking');
    this.updateHp(this.hp);
  }
}
