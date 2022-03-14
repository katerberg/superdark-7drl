import * as Phaser from 'phaser';
import {COLORS, SCENES} from '../constants';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.LOADING,
    });
  }

  update() {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    this.scene.start(SCENES.MENU);
  }
}
