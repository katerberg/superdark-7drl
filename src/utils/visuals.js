import * as Phaser from 'phaser';
import {DEPTH} from '../constants';

export function createFloatingText(scene, x, y, message, color = '#fff', delay = 0, angleOffset = 0) {
  const animation = scene.add.text(x, y, message, {color});
  const rotationAngle = scene.player.angle + 90 + angleOffset;
  animation.setAngle(rotationAngle);

  const floatAmount = 50;
  const xTween = Math.cos(Phaser.Math.DegToRad(rotationAngle + 90)) * floatAmount;
  const yTween = Math.sin(Phaser.Math.DegToRad(rotationAngle + 90)) * floatAmount;

  scene.add.tween({
    targets: animation,
    delay,
    duration: 750,
    ease: 'Exponential.In',
    x: x - xTween,
    y: y - yTween,

    onComplete: () => {
      animation.destroy();
    },
    callbackScope: scene,
  });
}



export function createSpinningExpandingText(scene, x, y, message, color = '#fff') {
  const animation = scene.add.text(x, y, message, {color}).setOrigin(0.5).setDepth(DEPTH.EXPLOSION);

  scene.add.tween({
    targets: animation,
    duration: 250,
    ease: 'Exponential.In',
    scale: 5,
    angle: 180,
    alpha: 0,

    onComplete: () => {
      animation.destroy();
    },
    callbackScope: scene,
  });
}
