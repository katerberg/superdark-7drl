import * as Phaser from 'phaser';
import logoImage from '../assets/logo.png';
import {COLORS, GAME, SCENES} from '../constants';
import {isDebug} from '../utils/environments';

export class MenuScene extends Phaser.Scene {
  restartKey;
  constructor() {
    super({
      key: SCENES.MENU,
    });
  }

  preload() {
    this.load.spritesheet('logo-splash', logoImage, {
      frameWidth: 498,
      frameHeight: 280,
    });
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.restartKey = this.input.keyboard.addKey(KeyCodes.ENTER);
  }

  create() {
    const color = '#cfcfcf';
    this.add.text(GAME.width / 2, 24, 'SUPER ', {fontSize: '96px', color}).setOrigin(1, 0);
    const title2 = this.add
      .text(GAME.width / 2, 24, 'DARK', {fontSize: '96px', color})
      .setOrigin(0, 0)
      .setAlpha(0);
    this.add.tween({
      loop: -1,
      yoyo: true,
      targets: title2,
      duration: 5000,
      ease: 'Exponential.In',
      alpha: 1,
    });
    const startText = this.add
      .text(GAME.width / 2, GAME.height - 96, 'Press enter to begin', {fontSize: '48px', color: 'red'})
      .setOrigin(0.5)
      .setAlpha(0);
    this.add.tween({
      delay: 3000,
      targets: startText,
      duration: 2000,
      ease: 'Exponential.In',
      alpha: 1,
    });
    const logo = this.add.sprite(GAME.width / 2, GAME.height / 2, 'logo-splash');
    logo.anims.create({
      key: 'logo-anim',
      frameRate: 15,
      frames: this.anims.generateFrameNumbers('logo-splash', {start: 0, end: 15}),
      repeat: -1,
    });
    logo.play('logo-anim');
  }

  startGame(time) {
    window.resetGame(time);
    const isFirstTime = !window.gameState.gameEnded;
    this.scene.start(SCENES.GAME, {isFirstTime});
    this.scene.start(SCENES.HUD, {isFirstTime});
  }

  handleInput(time) {
    if (this.restartKey.isDown) {
      this.startGame(time);
    }
  }

  update(time) {
    this.cameras.main.setBackgroundColor(COLORS.SHADOW);
    this.handleInput(time);

    if (isDebug()) {
      this.startGame(time);
    }
  }
}
