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
    const isFirstTime = !window.gameState.gameEnded;
    if (isFirstTime) {
      window.resetGame();
      this.scene.scene.time.update(0);
    }
    // if (isDebug()) {
    this.scene.start(SCENES.GAME, {isFirstTime});
    this.scene.start(SCENES.HUD, {isFirstTime});
    //   // this.scene.start(SCENES.GAME);
    //   // this.scene.bringToTop(SCENES.HUD);
    // } else {
    //   // this.scene.start(SCENES.MENU);
    // }
  }
}
