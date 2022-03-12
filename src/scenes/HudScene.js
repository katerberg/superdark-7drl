import * as Phaser from 'phaser';
import knifeSilhouette from '../assets/weapons/knife-silhouette.png';
import revolverSilhouette from '../assets/weapons/revolver-silhouette.png';
import {Text} from '../classes/Text';
import {WeaponSelection} from '../classes/WeaponSelection';
import {COLORS, DEPTH, EVENTS, GAME, GAME_STATUS, INVENTORY, SCENES} from '../constants';
import {isDebug} from '../utils/environments';
import {getMsRemaining, getTimeDisplayCs, getTimeDisplayMain} from '../utils/time';

export class HudScene extends Phaser.Scene {
  gameScene;
  levelText;
  timerGlow;
  weaponSelection;
  gameEndText;
  timerText;
  timerCsText;
  timeCop = 0; // holder for the time in between pauses
  restartKey;
  playerKeys;
  inventoryImages; // image[]
  inventoryAmmoTexts; // text[]
  pauseIndicator;
  runWalkIndicator;

  constructor() {
    super({
      key: SCENES.HUD,
    });
  }

  preload() {
    this.load.image('weapon-revolver', revolverSilhouette);
    this.load.image('weapon-knife', knifeSilhouette);
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.restartKey = this.input.keyboard.addKey(KeyCodes.ENTER);
    this.playerKeys = this.input.keyboard.addKeys({
      w: KeyCodes.W,
      s: KeyCodes.S,
      a: KeyCodes.A,
      d: KeyCodes.D,
      r: KeyCodes.R, // reload
      q: KeyCodes.Q,
      e: KeyCodes.E,
      f: KeyCodes.F, // wait
      shift: KeyCodes.SHIFT, // run
      1: KeyCodes.ONE,
      2: KeyCodes.TWO,
      3: KeyCodes.THREE,
      4: KeyCodes.FOUR,
      5: KeyCodes.FIVE,
      space: KeyCodes.SPACE, // useEquippedItem
      up: KeyCodes.UP,
      down: KeyCodes.DOWN,
      left: KeyCodes.LEFT,
      right: KeyCodes.RIGHT,
    });
  }

  create() {
    this.initListeners();
    this.levelText = new Text({scene: this, x: GAME.width, y: 20, text: `Level ${window.gameState.currentLevel}`})
      .setFontSize('18px')
      .setOrigin(1, 0)
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
    this.addInventory();
    this.addRunWalkIndicator();
    this.drawPauseIndicator();
  }

  drawPauseIndicator() {
    if (window.gameState.paused) {
      const glowOptions = {glowColor: 0xff3030, innerStrength: 1, outerStrength: 4};
      if (!this.plugins.get('rexGlowFilterPipeline').get(this.timerText).length) {
        this.timerGlow = [
          this.plugins.get('rexGlowFilterPipeline').add(this.timerText, glowOptions),
          this.plugins.get('rexGlowFilterPipeline').add(this.timerCsText, glowOptions),
        ];
      }
      this.add.tween({
        targets: this.timerGlow,
        duration: 100,
        ease: 'Exponential.In',
        innerStrength: glowOptions.innerStrength,
        outerStrength: glowOptions.outerStrength,
      });
    } else {
      this.add.tween({
        targets: this.timerGlow,
        duration: 100,
        ease: 'Exponential.In',
        innerStrength: 0,
        outerStrength: 0,
      });
    }
  }

  getGameScene() {
    return this.game.scene.getScene(SCENES.GAME);
  }

  addRunWalkIndicator() {
    this.runWalkIndicator = [];
    const color = 0xffffff;
    // const testColor = 0xff0000;
    const alpha = 1;
    const headX = 100;
    const headY = GAME.height - 100;
    const headRadius = 10;
    const bodyLength = 50;
    const head = this.add.circle(headX, headY, 10, color, alpha);
    const bodyX = headX - (Math.sin(Phaser.Math.DegToRad(20)) * bodyLength) / 2;
    const body = this.add
      .line(
        bodyX,
        headY + headRadius + Math.cos(Phaser.Math.DegToRad(20)) * (bodyLength / 2) - 5,
        0,
        0,
        0,
        bodyLength,
        color,
        alpha,
      )
      .setLineWidth(2)
      .setAngle(20);

    this.runWalkIndicator.push(head);
    this.runWalkIndicator.push(body);
  }

  addInventory(gameScene) {
    if (gameScene?.player?.inventory?.weaponSlots) {
      this.inventoryImages = gameScene.player.inventory.weaponSlots.map((slot, i) => {
        const x = 250 + i * INVENTORY.ITEM_WIDTH;
        const image = this.add
          .image(x, GAME.height - 20, slot.image)
          .setOrigin(0, 1)
          .setScale(0.1333333);
        if (slot.active) {
          this.weaponSelection = new WeaponSelection({scene: this, slot: 1});
        }
        return image;
      });
      this.inventoryAmmoTexts = gameScene.player.inventory.weaponSlots.map((slot, i) =>
        this.add.text(300 + i * INVENTORY.ITEM_WIDTH, GAME.height - 20, slot.getAmmoText()).setOrigin(0, 1),
      );
    }
  }

  initListeners() {
    this.game.events.on(EVENTS.LEVEL_CHANGE, this.handleLevelChange, this);
    this.game.events.on(EVENTS.GAME_END, this.handleGameEnd, this);
    this.game.events.on(EVENTS.SWAPPING_START, this.handleSwapStart, this);
    this.game.events.on(EVENTS.SWAPPING_FINISH, this.handleSwapFinish, this);
  }

  handleLevelChange() {
    this.levelText.setText(`Level ${window.gameState.currentLevel}`);
  }

  handleSwapStart(newSlot) {
    this.weaponSelection.select(newSlot, false);
  }

  handleSwapFinish(newSlot) {
    this.weaponSelection.select(newSlot, true);
  }

  handleGameEnd(status) {
    this.game.scene.pause(SCENES.GAME);
    window.gameState.paused = true;
    window.gameState.gameEnded = status;

    const restartMessage = 'ENTER TO RESTART';
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
      if (this.restartKey.isDown) {
        this.game.events.off(EVENTS.GAME_END, this.handleGameEnd);
        this.game.events.off(EVENTS.LEVEL_CHANGE, this.handleLevelChange);
        this.game.events.off(EVENTS.SWAPPING_START, this.handleSwapStart);
        this.game.events.off(EVENTS.SWAPPING_FINISH, this.handleSwapFinish);
        this.scene.start(SCENES.LOADING);
      }
      return;
    }
    const timeEvents = Object.keys(window.gameState.runUntil);
    if (Object.values(this.playerKeys).some((v) => v.isDown) || timeEvents.length) {
      if (window.gameState.paused) {
        window.gameState.pauseTime += time - this.timeCop;
        window.gameState.paused = false;
        this.game.scene.resume(SCENES.GAME);
      }
    } else if (!window.gameState.paused) {
      this.timeCop = time;
      window.gameState.paused = true;
    }
    timeEvents.forEach((timeEvent) => {
      if (timeEvent < time) {
        delete window.gameState.runUntil[timeEvent];
      }
    });
    if (isDebug()) {
      if (this.restartKey.isDown) {
        this.scene.scene.game.events.emit(EVENTS.GAME_END, GAME_STATUS.LOSE);
      }
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

  clearDrawnInventory() {
    if (this.inventoryImages) {
      this.inventoryImages.forEach((image) => image.destroy());
    }
    if (this.inventoryAmmoTexts) {
      this.inventoryAmmoTexts.forEach((image) => image.destroy());
    }
    this.inventoryImages = null;
    this.inventoryAmmoTexts = null;
  }

  updateInventory() {
    const gameScene = this.getGameScene();
    if (!this.inventoryImages?.some((i) => i.active)) {
      this.addInventory(gameScene);
    }
    if (this.inventoryAmmoTexts) {
      this.inventoryAmmoTexts?.forEach((text, i) => {
        if (text && text.scene) {
          text.setText(gameScene.player?.inventory?.weaponSlots[i]?.getAmmoText());
        }
      });
    }
  }
  updateRunWalk() {
    const [head, body] = this.runWalkIndicator;
    this.add.tween({
      targets: head,
      duration: 100,
      ease: 'Exponential.In',
      x: this.playerKeys.shift.isDown ? 90 : 100,
    });
    this.add.tween({
      targets: body,
      duration: 100,
      ease: 'Exponential.In',
      x: this.playerKeys.shift.isDown ? 80 : 100,
      angle: this.playerKeys.shift.isDown ? 20 : 0,
    });
  }

  update(time) {
    this.cameras.main.setBackgroundColor(window.gameState.gameEnded ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)');
    this.drawPauseIndicator();
    this.handleInput(time);
    this.updateTimer(time);
    this.updateInventory();
    this.updateRunWalk();
  }
}
