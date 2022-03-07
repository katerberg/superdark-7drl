import * as Phaser from 'phaser';
import {Text} from '../classes/Text';
import {COLORS, DEPTH, EVENTS, GAME, SCENES, TIME} from '../constants';

export class TimerScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.TIMER,
    });
  }

  preload() {
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.useKey = this.input.keyboard.addKey(KeyCodes.SPACE);
  }

  create() {
    this.initListeners();
  }

  // eslint-disable-next-line
  getTimeDisplayMain() {
    return TIME.TOTAL - window.gameState.time;
  }

  initListeners() {
    this.game.events.on(EVENTS.LEVEL_CHANGE, this.handleLevelChange, this);
    this.game.events.on(EVENTS.GAME_END, this.handleGameEnd, this);
    this.game.events.on(EVENTS.TIMER_START, this.handleTimerStart, this);
    this.game.events.on(EVENTS.TIMER_END, this.handleTimerEnd, this);
  }

  handleTimerStart(timerId) {
    this.timer.start(timerId);
  }

  handleTimerEnd(timerId) {
    this.timer.stop(timerId);
  }

  handleLevelChange() {
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

  updateTimer() {
    this.timerText.setText(this.getTimeDisplayMain());
  }

  update() {
    this.handleInput();
    this.updateTimer();
  }
}

