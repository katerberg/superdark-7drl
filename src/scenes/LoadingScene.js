import * as Phaser from 'phaser';
import {COLORS, SCENES} from '../constants';
// import {isDebug} from '../utils/environments';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.LOADING,
    });
  }

  update() {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    // if (isDebug()) {
    this.scene.start(SCENES.GAME);
    //   // this.scene.start(SCENES.HUD);
    //   // this.scene.start(SCENES.GAME);
    //   // this.scene.bringToTop(SCENES.HUD);
    // } else {
    //   // this.scene.start(SCENES.MENU);
    // }
  }
}
