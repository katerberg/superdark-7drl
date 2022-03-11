import {DEPTH} from '../constants';

export function createFloatingText(scene, x, y, message, color = '#fff', delay = 0, slide = 0) {
  const animation = scene.add.text(x, y, message, {color});

  if (slide) {
    scene.add.tween({
      loop: 6,
      targets: animation,
      delay,
      duration: 125,
      ease: 'Linear',
      yoyo: true,
      x: x + slide,

      onComplete: () => {
        animation.destroy();
      },
      callbackScope: scene,
    });
  }

  scene.add.tween({
    targets: animation,
    delay,
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
