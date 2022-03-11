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
