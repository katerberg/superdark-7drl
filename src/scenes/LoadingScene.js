import * as Phaser from 'phaser';
import {COLORS, SCENES} from '../constants';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.LOADING,
    });
  }

  update(time) {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    window.resetGame(time);
    const isFirstTime = !window.gameState.gameEnded;
    this.scene.start(SCENES.GAME, {isFirstTime});
    this.scene.start(SCENES.HUD, {isFirstTime});

    this.scene.start(SCENES.MENU);
  }
}
