import * as Phaser from 'phaser';
import {GAME, RUN_WALK} from '../constants';

export class RunWalkIndicator {
  scene;
  color;
  alpha;
  head;
  body;

  constructor({scene}) {
    this.scene = scene;
    this.color = 0xffffff;
    // const testColor = 0xff0000;
    this.alpha = 1;
    this.createHead();
    this.createBody();
  }

  createHead() {
    const headX = 100;
    const headY = GAME.height - 100;
    const headRadius = 10;
    this.head = this.scene.add.circle(headX, headY, headRadius, this.color, this.alpha);
  }

  createBody() {
    const bodyLength = 50;
    // const bodyX = this.head.x - (Math.sin(Phaser.Math.DegToRad(20)) * bodyLength) / 2;
    const bodyX = 100;

    this.body = this.scene.add
      .line(
        bodyX,
        this.head.y + this.head.radius + Math.cos(Phaser.Math.DegToRad(20)) * (bodyLength / 2) - 5,
        0,
        0,
        0,
        bodyLength,
        this.color,
        this.alpha,
      )
      .setLineWidth(2)
      .setAngle(0);
  }

  update(state) {
    const isRunning = RUN_WALK.STATE.RUNNING === state;
    this.scene.add.tween({
      targets: this.head,
      duration: RUN_WALK.DURATION,
      ease: 'Exponential.In',
      x: isRunning ? 90 : 100,
    });
    this.scene.add.tween({
      targets: this.body,
      duration: RUN_WALK.DURATION,
      ease: 'Exponential.In',
      x: isRunning ? 80 : 100,
      angle: isRunning ? 20 : 0,
    });
  }
}
