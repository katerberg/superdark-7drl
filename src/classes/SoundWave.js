import * as Phaser from 'phaser';
import {DEPTH} from '../constants';

export class SoundWave extends Phaser.GameObjects.Arc {
  constructor({scene, x, y, radius, color = 0x00ffff, duration = 100}) {
    super(scene, x, y, 0);
    this.depth = DEPTH.SOUND;
    this.setClosePath(false);
    this.setStrokeStyle(radius < 50 ? 2 : 4, color, radius < 50 ? 0.2 : 0.4);
    scene.add.existing(this);

    this.scene.add.tween({
      targets: this,
      duration,
      ease: 'Exponential.Out',
      radius,
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
