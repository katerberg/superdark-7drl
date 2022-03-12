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
    const bodyX = this.head.x - (Math.sin(Phaser.Math.DegToRad(20)) * bodyLength) / 2;
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
      .setAngle(20);
  }

  update(isShiftDown) {
    this.scene.add.tween({
      targets: this.head,
      duration: RUN_WALK.DURATION,
      ease: 'Exponential.In',
      x: isShiftDown ? 90 : 100,
    });
    this.scene.add.tween({
      targets: this.body,
      duration: RUN_WALK.DURATION,
      ease: 'Exponential.In',
      x: isShiftDown ? 80 : 100,
      angle: isShiftDown ? 20 : 0,
    });
  }
}
