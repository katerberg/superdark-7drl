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
