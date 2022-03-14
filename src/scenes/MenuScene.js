import * as Phaser from 'phaser';
import logoImage from '../assets/logo.png';
import splash1 from '../assets/splash1.png';
import splash2 from '../assets/splash2.png';

import {COLORS, GAME, SCENES} from '../constants';
import {isDebug, skipMenu} from '../utils/environments';

export class MenuScene extends Phaser.Scene {
  restartKey;
  enterPressed = 0;
  screen = 1;

  constructor() {
    super({
      key: SCENES.MENU,
    });
  }

  preload() {
    this.load.image('splash1', splash1);
    this.load.image('splash2', splash2);

    const {KeyCodes} = Phaser.Input.Keyboard;
    this.restartKey = this.input.keyboard.addKey(KeyCodes.ENTER);
  }

  create() {
    this.splash = this.add.image(0, 0, 'splash1').setScale(0.5).setOrigin(0, 0);
  }

  startGame(time) {
    window.resetGame(time);
    const isFirstTime = !window.gameState.gameEnded;
    this.scene.start(SCENES.GAME, {isFirstTime});
    this.scene.start(SCENES.HUD, {isFirstTime});
  }

  handleInput(time) {
    if (this.restartKey.isDown) {
      this.enterPressed = true;
    }

    if (this.restartKey.isUp && this.enterPressed) {
      this.enterPressed = false;
      if (this.splash.texture.key === 'splash1') {
        this.splash.setTexture('splash2');
      } else {
        this.startGame(time);
      }
    }
  }

  update(time) {
    this.cameras.main.setBackgroundColor(COLORS.SHADOW);
    this.handleInput(time);

    if (isDebug() || skipMenu()) {
      this.startGame(time);
    }
  }
}
