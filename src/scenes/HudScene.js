import * as Phaser from 'phaser';
import {Text} from '../classes/Text';
import {COLORS, DEPTH, EVENTS, GAME, GAME_STATUS, SCENES} from '../constants';
import {getTimeDisplayCs, getTimeDisplayMain} from '../utils/time';

export class HudScene extends Phaser.Scene {
  levelText;
  gameEndText;
  timerText;
  timerCsText;
  //TODO: Get rid of the pause button
  lastPause = 0; // temp to prevent pause flickers while I use the P key
  timeCop = 0; // holder for the time in between pauses
  useKey;
  pauseKey;

  constructor() {
    super({
      key: SCENES.HUD,
    });
  }

  preload() {
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.useKey = this.input.keyboard.addKey(KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard.addKey(KeyCodes.P);
  }

  create() {
    this.levelText = new Text({scene: this, x: 0, y: GAME.height, text: `Level ${window.gameState.currentLevel}`})
      .setFontSize('36px')
      .setOrigin(0, 1)
      .setDepth(DEPTH.HUD);
    this.timerText = new Text({scene: this, x: GAME.width - 50, y: GAME.height, text: getTimeDisplayMain(0)})
      .setFontSize('36px')
      .setColor(COLORS.TIMER_NORMAL)
      .setOrigin(1, 1)
      .setDepth(DEPTH.HUD);
    this.timerCsText = new Text({scene: this, x: GAME.width - 50, y: GAME.height - 10, text: getTimeDisplayCs(0)})
      .setFontSize('24px')
      .setColor(COLORS.TIMER_NORMAL)
      .setOrigin(0, 1)
      .setDepth(DEPTH.HUD);
    this.initListeners();
  }

  initListeners() {
    this.game.events.on(EVENTS.LEVEL_CHANGE, this.handleLevelChange, this);
    this.game.events.on(EVENTS.GAME_END, this.handleGameEnd, this);
  }

  handleLevelChange() {
    this.levelText.setText(`Level ${window.gameState.currentLevel}`);
  }

  handleGameEnd(status) {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
    this.game.scene.pause(SCENES.GAME);
    window.gameState.paused = !window.gameState.paused;

    window.gameState.gameEnded = status;

    const restartMessage = 'SPACE TO RESTART';
    this.gameEndText = new Text({
      scene: this,
      x: this.game.scale.width / 2,
      y: this.game.scale.height * 0.4,
      text: status === GAME_STATUS.WIN ? `CRISIS AVERTED\n${restartMessage}` : `WASTED\n${restartMessage}`,
    })
      .setAlign('center')
      .setColor(status === GAME_STATUS.WIN ? COLORS.MESSAGE_WIN : COLORS.MESSAGE_LOSE)
      .setDepth(DEPTH.HUD);

    this.gameEndText.setPosition(this.game.scale.width / 2 - this.gameEndText.width / 2, this.game.scale.height * 0.4);
  }

  handleInput(currentTime) {
    if (this.useKey.isDown) {
      if (window.gameState.gameEnded) {
        this.game.events.off(EVENTS.GAME_END, this.handleGameEnd);
        this.game.events.off(EVENTS.LEVEL_CHANGE, this.handleLevelChange);
        window.resetGame();
        this.scene.start(SCENES.LOADING);
      }
    }

    if (this.pauseKey.isDown) {
      if (currentTime < this.lastPause + 1000) {
        return;
      }
      this.lastPause = currentTime;
      window.gameState.paused = !window.gameState.paused;
      if (window.gameState.paused) {
        this.timeCop = currentTime;
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
        this.game.scene.pause(SCENES.GAME);
      } else {
        const timeOffset = currentTime - this.timeCop;
        window.gameState.pauseTime += timeOffset;
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
        this.game.scene.resume(SCENES.GAME);
      }
    }
  }

  updateTimer(currentTime) {
    if (!window.gameState.paused) {
      this.timerText.setText(getTimeDisplayMain(currentTime));
      this.timerCsText.setText(getTimeDisplayCs(currentTime));
    }
  }

  update(time) {
    this.handleInput(time);
    this.updateTimer(time);
  }
}
