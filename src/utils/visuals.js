import * as Phaser from 'phaser';
import {DEPTH} from '../constants';

export function createFloatingText(scene, x, y, message, color = '#fff') {
  const animation = scene.add.text(x, y, message, {color});

  scene.add.tween({
    targets: animation,
    duration: 750,
    ease: 'Exponential.In',
    y: y - 50,

    onComplete: () => {
      animation.destroy();
    },
    callbackScope: scene,
  });
}

export function drawTracer(scene, x, y, angle) {
  const lineLength = 1000;
  const animation = scene.add
    .rectangle(x, y, 1, 1, 0xffffff, 1)
    .setAngle(angle)
    .setDepth(DEPTH.PROJECTILE)
    .setOrigin(0);

  scene.add.tween({
    targets: animation,
    ease: 'Exponential.In',
    width: lineLength,
    alpha: 0.2,
    duration: 250,
    onStart: () => {
      animation.alpha = 1;
    },

    onComplete: () => {
      animation.destroy();
    },
    callbackScope: scene,
  });
}

export function createExpandingText(scene, x, y, message, color = '#fff') {
  const animation = scene.add.text(x, y, message, {color}).setOrigin(0.5).setDepth(DEPTH.EXPLOSION);

  scene.add.tween({
    targets: animation,
    duration: 250,
    ease: 'Exponential.In',
    scale: 5,
    alpha: 0,

    onComplete: () => {
      animation.destroy();
    },
    callbackScope: scene,
  });
}
