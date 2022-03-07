import * as Phaser from 'phaser';
import {COLORS, SCENES} from '../constants';
// import {isDebug} from '../utils/environments';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.LOADING,
    });
  }

  update(time) {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    window.resetGame(time);
    // if (isDebug()) {
    const isFirstTime = !window.gameState.gameEnded;
    this.scene.start(SCENES.GAME, {isFirstTime});
    this.scene.start(SCENES.HUD, {isFirstTime});
    //   // this.scene.start(SCENES.GAME);
    //   // this.scene.bringToTop(SCENES.HUD);
    // } else {
    //   // this.scene.start(SCENES.MENU);
    // }
  }
}
