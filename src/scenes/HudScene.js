import * as Phaser from 'phaser';
import {Text} from '../classes/Text';
import {DEPTH, EVENTS, GAME, SCENES} from '../constants';

export class HudScene extends Phaser.Scene {
  levelText;
  gameEndText;

  constructor() {
    super({
      key: SCENES.HUD,
    });
  }

  preload() {
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.useKey = this.input.keyboard.addKey(KeyCodes.SPACE);
  }

  create() {
    this.levelText = new Text({scene: this, x: 0, y: GAME.height, text: `Level ${window.gameState.currentLevel}`})
      .setFontSize('36px')
      .setOrigin(0, 1)
      .setDepth(DEPTH.HUD);
    this.initListeners();
  }

  initListeners() {
    this.game.events.on(EVENTS.LEVEL_CHANGE, this.handleLevelChange, this);
    this.game.events.on(EVENTS.GAME_END, this.handleGameEnd, this);
  }

  handleLevelChange() {
    console.log('changing text');
    this.levelText.setText(`Level ${window.gameState.currentLevel}`);
  }

  handleGameEnd(status) {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
    this.game.scene.pause(SCENES.GAME);

    window.gameState.gameEnded = status;
    this.gameEndText = new Text({
      scene: this,
      x: this.game.scale.width / 2,
      y: this.game.scale.height * 0.4,
      text: 'CRISIS AVERTED\nSPACE TO RESTART',
    })
      .setAlign('center')
      .setColor('#ffffff')
      .setDepth(DEPTH.HUD);

    this.gameEndText.setPosition(this.game.scale.width / 2 - this.gameEndText.width / 2, this.game.scale.height * 0.4);
  }

  handleInput() {
    if (this.useKey.isDown) {
      if (window.gameState.gameEnded) {
        this.game.events.off(EVENTS.GAME_END, this.handleGameEnd);
        this.game.events.off(EVENTS.LEVEL_CHANGE, this.handleLevelChange);
        window.resetGame();
        this.scene.start(SCENES.LOADING);
      }
    }
  }

  update() {
    this.handleInput();
  }
}
