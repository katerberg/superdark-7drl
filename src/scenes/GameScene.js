import * as Phaser from 'phaser';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterMove from '../assets/character-move.png';
import ladderImage from '../assets/ladder.png';
import winSwitchImage from '../assets/winSwitch.png';
import {Exit} from '../classes/Exit';
import {Player} from '../classes/Player';
import {Wall} from '../classes/Wall';
import {WinSwitch} from '../classes/WinSwitch';
import {COLORS, GAME, LEVELS, PLAYER, PLAY_AREA, SCENES} from '../constants';
import {isDebug} from '../utils/environments';
import {createLevelExits, createWinSwitch} from '../utils/setup';

export class GameScene extends Phaser.Scene {
  player;
  walls;
  shadows;
  exits;
  winSwitch;
  levelKey;

  constructor() {
    super({
      key: SCENES.game,
    });
  }

  preload() {
    this.load.spritesheet('character', characterMove, {frameWidth: PLAYER.WIDTH, frameHeight: PLAYER.HEIGHT});
    this.load.spritesheet('characterLegsWalk', characterLegsWalk, {
      frameWidth: PLAYER.LEGS_WIDTH,
      frameHeight: PLAYER.LEGS_HEIGHT,
    });
    this.load.image('exit', ladderImage);
    this.load.image('winSwitch', winSwitchImage);
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.levelKey = this.input.keyboard.addKey(KeyCodes.L);
  }

  create(startingInfo) {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.physics.world.setBounds(PLAY_AREA.xOffset, PLAY_AREA.yOffset, PLAY_AREA.width, PLAY_AREA.height);

    const immovableOptions = {
      createCallback: (p) => {
        if (p?.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    };

    this.walls = this.physics.add.group(immovableOptions);
    this.shadows = [];

    this.addPlayer(startingInfo);
    this.addWalls();
    this.addExits();
    this.addWinSwitch();

    this.add
      .text(0, GAME.height, `Level ${window.gameState.currentLevel}`, {
        fontSize: '36px',
      })
      .setOrigin(0, 1);
    this.physics.add.overlap(this.player, this.exits, (_, exit) => this.handlePlayerExit(exit));
    this.physics.add.collider(this.player, this.walls);
  }

  handleInput() {
    if (isDebug()) {
      if (this.levelKey.isDown) {
        const {currentLevel} = window.gameState;
        this.changeLevel(currentLevel === LEVELS.MAX_LEVEL ? currentLevel - 1 : currentLevel + 1);
      }
    }
  }

  changeLevel(level) {
    window.gameState.currentLevel = level;
    this.scene.start(SCENES.game, {
      startingPosition: {
        x: this.player.body.x + PLAYER.WIDTH * PLAYER.SCALE,
        y: this.player.body.y + PLAYER.WIDTH * PLAYER.SCALE,
      },
      angle: this.player.angle,
    });
  }

  handlePlayerExit(exit) {
    const goingUp = window.gameState.currentLevel === exit.end;

    this.changeLevel(goingUp ? exit.start : exit.end);
  }

  addWalls() {
    this.walls.add(new Wall({scene: this, x: 300, y: 300}));
    this.walls.add(new Wall({scene: this, x: 500, y: 500}));
  }

  addExits() {
    this.exits = this.physics.add.group();
    createLevelExits(window.gameState.currentLevel);
    window.gameState.levels[window.gameState.currentLevel].exits.forEach((exit) => {
      this.exits.add(
        new Exit({
          scene: this,
          x: exit.x,
          y: exit.y,
          start: exit.start,
          end: exit.end,
        }),
      );
    });
  }

  addPlayer(startingInfo) {
    this.player = new Player({
      scene: this,
      x: startingInfo?.startingPosition?.x || 100,
      y: startingInfo?.startingPosition?.y || 100,
      key: 'character',
      angle: startingInfo?.angle,
    });
    this.player.play('walk');
  }

  update() {
    if (this.player) {
      this.player.update();
    }
    this.clearShadows();
    this.drawShadows();
  }

  addWinSwitch() {
    if (window.gameState.currentLevel !== LEVELS.MAX_LEVEL) {
      return;
    }
    createWinSwitch();
    this.winSwitch = new WinSwitch({scene: this, x: window.gameState.winSwitch.x, y: window.gameState.winSwitch.y});
  }

  clearShadows() {
    this.shadows.forEach((shadow) => {
      shadow.destroy();
    });
    this.shadows = [];
  }

  drawShadows() {
    this.drawObstacleShadows();
    this.drawPeripheralShadows();
  }

  drawObstacleShadows() {
    const p = {x: this.player.x, y: this.player.y};
    const dirtyMultiplier = 10000;

    this.walls.children.entries.forEach((wall) => {
      for (let i = 0; i < wall.pathData.length - 2; i += 2) {
        const w1 = {
          x: wall.pathData[i] + wall.x - wall.width / 2,
          y: wall.pathData[i + 1] + wall.y - wall.height / 2,
        };
        const m1 = getNormalized({x: w1.x - p.x, y: w1.y - p.y});

        const w2 = {
          x: wall.pathData[i + 2] + wall.x - wall.width / 2,
          y: wall.pathData[i + 3] + wall.y - wall.height / 2,
        };
        const m2 = getNormalized({x: w2.x - p.x, y: w2.y - p.y});

        const graphics = this.add.graphics();
        graphics.fillStyle(COLORS.SHADOW);
        graphics.beginPath();

        graphics.moveTo(w1.x, w1.y);
        graphics.lineTo(w1.x + dirtyMultiplier * m1.x, w1.y + dirtyMultiplier * m1.y);
        graphics.lineTo(w2.x + dirtyMultiplier * m2.x, w2.y + dirtyMultiplier * m2.y);
        graphics.lineTo(w2.x, w2.y);

        graphics.closePath();
        graphics.fillPath();

        this.shadows.push(graphics);
      }
    });
  }

  drawPeripheralShadows() {
    const graphics = this.add.graphics();
    graphics.fillStyle(COLORS.SHADOW);
    graphics.beginPath();

    graphics.arc(
      this.player.x,
      this.player.y,
      75,
      Phaser.Math.DegToRad(this.player.angle - 100),
      Phaser.Math.DegToRad(this.player.angle + 100),
      true,
    );

    graphics.arc(
      this.player.x,
      this.player.y,
      5000,
      Phaser.Math.DegToRad(this.player.angle + 100),
      Phaser.Math.DegToRad(this.player.angle - 100),
      false,
    );

    graphics.closePath();
    graphics.fillPath();

    this.shadows.push(graphics);
  }
}

function getNormalized(vector) {
  const magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return {x: vector.x / magnitude, y: vector.y / magnitude};
}
