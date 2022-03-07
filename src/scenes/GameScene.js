import * as Phaser from 'phaser';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterMove from '../assets/character-move.png';
import enemyRifleMove from '../assets/enemy-rifle-move.png';
import exitDownImage from '../assets/exit-down.png';
import exitUpImage from '../assets/exit-up.png';
import steelTileset from '../assets/steel-tileset.jpg';
import winSwitchImage from '../assets/winSwitch.png';
import {Enemy} from '../classes/Enemy';
import {Exit} from '../classes/Exit';
import {Player} from '../classes/Player';
import {Wall} from '../classes/Wall';
import {WinSwitch} from '../classes/WinSwitch';
import {COLORS, DEPTH, ENEMY, EVENTS, GAME_STATUS, LEVELS, PLAYER, PLAY_AREA, SCENES, WALLS} from '../constants';
import {isDebug} from '../utils/environments';
import {getNormalized} from '../utils/math';
import {createLevelExits, createWinSwitch} from '../utils/setup';

const immovableOptions = {
  createCallback: (p) => {
    if (p?.body instanceof Phaser.Physics.Arcade.Body) {
      p.body.setImmovable(true);
    }
  },
};

export class GameScene extends Phaser.Scene {
  player;
  enemies;
  projectiles;
  walls;
  shadows;
  exits;
  winSwitch;
  levelKey;
  gameEndText;

  constructor() {
    super({
      key: SCENES.GAME,
    });
  }

  preload() {
    this.load.image('steel-tileset', steelTileset);
    this.load.spritesheet('character', characterMove, {frameWidth: PLAYER.WIDTH, frameHeight: PLAYER.HEIGHT});
    this.load.spritesheet('characterLegsWalk', characterLegsWalk, {
      frameWidth: PLAYER.LEGS_WIDTH,
      frameHeight: PLAYER.LEGS_HEIGHT,
    });
    this.load.spritesheet('enemy-rifle-move', enemyRifleMove, {
      frameWidth: ENEMY.WIDTH,
      frameHeight: ENEMY.HEIGHT,
    });
    this.load.image('exit-up', exitUpImage);
    this.load.image('exit-down', exitDownImage);
    this.load.image('winSwitch', winSwitchImage);
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.levelKey = this.input.keyboard.addKey(KeyCodes.L);
  }

  create(startingInfo) {
    this.cameras.main.setBackgroundColor(COLORS.SHADOW);
    this.physics.world.setBounds(PLAY_AREA.xOffset, PLAY_AREA.yOffset, PLAY_AREA.width, PLAY_AREA.height);

    this.add.tileSprite(PLAY_AREA.width / 2, PLAY_AREA.height / 2, PLAY_AREA.width, PLAY_AREA.height, 'steel-tileset');

    this.walls = this.physics.add.group(immovableOptions);
    this.shadows = [];
    this.enemies = this.physics.add.group(immovableOptions);
    this.projectiles = this.physics.add.group({runChildUpdate: true});

    this.addPlayer(startingInfo);
    this.addEnemy();
    this.addWalls();
    this.addExits();
    this.addWinSwitch();

    this.game.events.emit(EVENTS.LEVEL_CHANGE);
    //temp moved here to figure out shadow decay
    // this.clearShadows();
    // this.drawShadows();

    this.physics.add.overlap(this.player, this.exits, (_, exit) => this.handlePlayerExit(exit));
    // TODO: Figure out how to get the collision box to match angle
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => player.handleHit(projectile));
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.exits);
    this.cameras.main.startFollow(this.player);
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
    this.scene.start(SCENES.GAME, {
      startingPosition: {
        x: this.player.body.x + PLAYER.WIDTH * PLAYER.SCALE,
        y: this.player.body.y + PLAYER.WIDTH * PLAYER.SCALE,
      },
      angle: this.player.angle,
    });
  }

  handlePlayerExit(exit) {
    const goingUp = window.gameState.currentLevel === exit.end;

    this.walls.add(new Wall({scene: this, x: 200, y: 400, width: 200, height: 80}));
    this.changeLevel(goingUp ? exit.start : exit.end);
  }

  handlePlayerWinSwitch() {
    this.game.events.emit(EVENTS.GAME_END, GAME_STATUS.WIN);
  }

  getWalls(x1, x2, y1, y2) {
    const walls = [];
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    const nodeDiameter = WALLS.nodeRadius * 2;
    const numberOfNodes = Math.ceil(distance / nodeDiameter);
    const nodeDistanceX = xDistance / numberOfNodes;
    const nodeDistanceY = yDistance / numberOfNodes;
    for (let i = 0; i < numberOfNodes; i++) {
      walls.push(new Wall({scene: this, x: x1 + i * nodeDistanceX, y: y1 + i * nodeDistanceY}));
    }
    return walls;
  }

  addWalls() {
    this.getWalls(100, 200, 250, 380).forEach((w) => {
      this.walls.add(w);
    });
    // this.walls.add(new WallContainer({scene: this, x: 100, y: 250, wallWidth: 20, wallHeight: 20}));
    // let yPos = 0;

    // //walls top to bottom
    // this.walls.add(new Wall({scene: this, x: 1250, y: yPos, width: 2500, height: 10}));

    // yPos = 625;
    // this.walls.add(new Wall({scene: this, x: 0 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 625 - 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 625 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1250 - 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1250 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1875 - 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1875 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 2500 - 125, y: yPos, width: 250, height: 10}));

    // yPos = 1250;
    // this.walls.add(new Wall({scene: this, x: 625 / 2, y: yPos, width: 625, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 2500 - 625 / 2, y: yPos, width: 625, height: 10}));

    // yPos = 1875;
    // this.walls.add(new Wall({scene: this, x: 0 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 625 - 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 625 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1250 - 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1250 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1875 - 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 1875 + 125, y: yPos, width: 250, height: 10}));
    // this.walls.add(new Wall({scene: this, x: 2500 - 125, y: yPos, width: 250, height: 10}));

    // yPos = 2500;
    // this.walls.add(new Wall({scene: this, x: 1250, y: yPos, width: 2500, height: 10}));

    // //walls left to right
    // let xPos = 0;
    // this.walls.add(new Wall({scene: this, x: xPos, y: 1250, height: 2500, width: 10}));

    // xPos = 625;
    // this.walls.add(new Wall({scene: this, y: 0 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 625 - 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 625 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1250 - 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1250 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1875 - 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1875 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 2500 - 125, x: xPos, height: 250, width: 10}));

    // xPos = 1250;
    // this.walls.add(new Wall({scene: this, y: 625 / 2, x: xPos, height: 625, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 2500 - 625 / 2, x: xPos, height: 625, width: 10}));

    // xPos = 1875;
    // this.walls.add(new Wall({scene: this, y: 0 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 625 - 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 625 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1250 - 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1250 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1875 - 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 1875 + 125, x: xPos, height: 250, width: 10}));
    // this.walls.add(new Wall({scene: this, y: 2500 - 125, x: xPos, height: 250, width: 10}));

    // xPos = 2500;
    // this.walls.add(new Wall({scene: this, y: 1250, x: xPos, height: 2500, width: 10}));
  }

  addExits() {
    this.exits = this.physics.add.group(immovableOptions);
    createLevelExits(window.gameState.currentLevel);
    window.gameState.levels[window.gameState.currentLevel].exits.forEach((exit) => {
      this.exits.add(
        new Exit({
          scene: this,
          x: exit.x,
          y: exit.y,
          start: exit.start,
          end: exit.end,
          direction: exit.direction,
        }),
      );
    });
  }

  addEnemy() {
    const enemy = new Enemy({scene: this, x: 200, y: 200, key: 'enemy-rifle-move'});
    enemy.play('walkEnemy');
    this.enemies.add(enemy);
  }

  addProjectile(projectile) {
    this.projectiles.add(projectile);
  }

  removeProjectiles(enemy) {
    const filtered = this.projectiles.children.entries.filter((p) => p.enemy === enemy);
    filtered.forEach((p) => this.projectiles.remove(p, true, true));
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

  update(time) {
    if (this.player) {
      this.player.update();
    }
    this.enemies.children.entries.forEach((enemy) => {
      enemy.update(time);
    });
    this.handleInput();
    this.clearShadows();
    this.drawShadows();
  }

  addWinSwitch() {
    if (window.gameState.currentLevel !== LEVELS.MAX_LEVEL) {
      return;
    }
    createWinSwitch();
    this.winSwitch = new WinSwitch({scene: this, x: window.gameState.winSwitch.x, y: window.gameState.winSwitch.y});

    this.physics.add.overlap(this.player, this.winSwitch, () => this.handlePlayerWinSwitch());
  }

  clearShadows() {
    this.shadows.forEach((shadow) => {
      // if (shadow.alpha === 0) {
      //   shadow.destroy();
      // }
      shadow.destroy();
    });
    this.shadows = [];
  }

  drawShadows() {
    this.drawObstacleShadows();
    // this.drawPeripheralShadows();
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
        graphics.setDepth(DEPTH.SHADOWS);
        graphics.beginPath();

        graphics.moveTo(w1.x, w1.y);
        graphics.lineTo(w1.x + dirtyMultiplier * m1.x, w1.y + dirtyMultiplier * m1.y);
        graphics.lineTo(w2.x + dirtyMultiplier * m2.x, w2.y + dirtyMultiplier * m2.y);
        graphics.lineTo(w2.x, w2.y);

        graphics.closePath();
        graphics.fillPath();

        // this.tweens.add({
        //   targets: graphics,
        //   alpha: 1,
        //   duration: 300,
        // });

        this.shadows.push(graphics);
      }
    });
  }

  drawPeripheralShadows() {
    const graphics = this.add.graphics();
    graphics.fillStyle(COLORS.SHADOW);
    graphics.setDepth(DEPTH.SHADOWS);
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

    // this.tweens.add({
    //   targets: graphics,
    //   alpha: 1,
    //   duration: 300,
    // });

    this.shadows.push(graphics);
  }
}
