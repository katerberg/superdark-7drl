import * as Phaser from 'phaser';
import {Text} from '../classes/Text';
import {COLORS, DEPTH, EVENTS, GAME, GAME_STATUS, SCENES} from '../constants';
import {getMsRemaining, getTimeDisplayCs, getTimeDisplayMain} from '../utils/time';

export class HudScene extends Phaser.Scene {
  levelText;
  gameEndText;
  timerText;
  timerCsText;
  timeCop = 0; // holder for the time in between pauses
  useKey;
  playerKeys;

  constructor() {
    super({
      key: SCENES.HUD,
    });
  }

  preload() {
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.useKey = this.input.keyboard.addKey(KeyCodes.SPACE);
    this.playerKeys = this.input.keyboard.addKeys({
      w: KeyCodes.W,
      s: KeyCodes.S,
      a: KeyCodes.A,
      d: KeyCodes.D,
      up: KeyCodes.UP,
      down: KeyCodes.DOWN,
      left: KeyCodes.LEFT,
      right: KeyCodes.RIGHT,
    });
  }

  create() {
    this.initListeners();
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
    this.timeCop = window.gameState.startTime;
    this.lastPause = 0;
    this.drawTimer(window.gameState.startTime);
  }

  initListeners() {
    this.game.events.on(EVENTS.LEVEL_CHANGE, this.handleLevelChange, this);
    this.game.events.on(EVENTS.GAME_END, this.handleGameEnd, this);
  }

  handleLevelChange() {
    this.levelText.setText(`Level ${window.gameState.currentLevel}`);
  }

  handleGameEnd(status) {
    this.game.scene.pause(SCENES.GAME);
    window.gameState.paused = true;
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

  handleInput(time) {
    if (window.gameState.gameEnded) {
      if (this.useKey.isDown) {
        this.game.events.off(EVENTS.GAME_END, this.handleGameEnd);
        this.game.events.off(EVENTS.LEVEL_CHANGE, this.handleLevelChange);
        this.scene.start(SCENES.LOADING);
      }
      return;
    }
    if (Object.values(this.playerKeys).some((v) => v.isDown)) {
      if (window.gameState.paused) {
        window.gameState.pauseTime += time - this.timeCop;
        window.gameState.paused = false;
        this.game.scene.resume(SCENES.GAME);
      }
    } else if (!window.gameState.paused) {
      this.timeCop = time;
      window.gameState.paused = true;
    }
  }

  drawTimer(currentTime) {
    const msRemaining = getMsRemaining(currentTime);
    this.timerText.setText(getTimeDisplayMain(msRemaining));
    this.timerCsText.setText(getTimeDisplayCs(msRemaining));
    if (msRemaining < 300_000) {
      this.timerText.setColor(COLORS.TIMER_DANGER);
      this.timerCsText.setColor(COLORS.TIMER_DANGER);
    }
  }

  updateTimer(currentTime) {
    if (!window.gameState.paused) {
      this.drawTimer(currentTime);
    }
  }

  update(time) {
    this.cameras.main.setBackgroundColor(window.gameState.paused ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)');
    this.handleInput(time);
    this.updateTimer(time);
  }
}
