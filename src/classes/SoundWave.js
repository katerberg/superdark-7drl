import * as Phaser from 'phaser';
import {DEPTH, COLORS} from '../constants';
import {isDebug} from '../utils/environments';

export class SoundWave extends Phaser.GameObjects.Arc {
  constructor({scene, x, y, radius, color = COLORS.PLAYER_SOUND, duration = 100}) {
    super(scene, x, y, 0, undefined, undefined, undefined, 0xff0000, 0.001);
    this.depth = DEPTH.SOUND;
    this.setClosePath(false);
    const lineWidth = radius < 50 ? 2 : 4;
    this.setStrokeStyle(radius < 50 ? 2 : 40, color, radius < 50 ? 0.2 : 0.2);
    scene.physics.world.enable(this);
    if (!isDebug()) {
      scene.add.existing(this);
    }

    this.scene.add.tween({
      targets: this,
      duration,
      ease: 'Exponential.Out',
      radius,
      lineWidth: lineWidth * 10,
      onComplete: () => {
        if (this.strokeColor === COLORS.PLAYER_SOUND) {
          const hearingEnemies = this.scene.enemies
            .getChildren()
            .filter((e) => Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), e.getBounds()));
          if (hearingEnemies.length) {
            hearingEnemies.forEach((e) => e.handleSoundWave(this));
          }
        }
        this.destroy();
      },
    });
  }
}
