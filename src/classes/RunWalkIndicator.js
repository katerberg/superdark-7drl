import * as Phaser from 'phaser';
import {DEPTH, RUN_WALK} from '../constants';

export class RunWalkIndicator extends Phaser.GameObjects.Image {
  constructor({scene, x, y}) {
    super(scene, x, y, 'runwalk-walking');
    this.setDepth(DEPTH.HUD);
    this.setOrigin(0, 1);
    this.setScale(RUN_WALK.SCALE);
    scene.add.existing(this);
  }

  update(state) {
    const isRunning = RUN_WALK.STATE.RUNNING === state;
    this.setTexture(isRunning ? 'runwalk-running' : 'runwalk-walking');
  }
}
