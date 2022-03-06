import * as Phaser from 'phaser';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterMove from '../assets/character-move.png';
import ladderImage from '../assets/ladder.png';
import {Exit} from '../classes/Exit';
import {Player} from '../classes/Player';
import {Wall} from '../classes/Wall';
import {COLORS, GAME, PLAY_AREA, SCENES} from '../constants';
import {addLevelExits} from '../utils/setup';

export class GameScene extends Phaser.Scene {
  player;
  walls;
  shadows;
  exits;

  constructor() {
    super({
      key: SCENES.game,
    });
  }

  preload() {
    this.load.spritesheet('character', characterMove, {frameWidth: 253, frameHeight: 216});
    this.load.spritesheet('characterLegsWalk', characterLegsWalk, {frameWidth: 172, frameHeight: 124});
    this.load.image('exit', ladderImage);
  }

  create() {
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

    this.addPlayer();
    this.addWalls();
    this.addExits();

    this.add
      .text(0, GAME.height, `Level ${window.gameState.currentLevel}`, {
        fontSize: '36px',
      })
      .setOrigin(0, 1);
    this.physics.add.overlap(this.player, this.exits, (_, exit) => this.handlePlayerExit(exit));
    this.physics.add.collider(this.player, this.walls);
  }

  update() {
    if (this.player) {
      this.player.update();
    }
    this.shadows.forEach((shadow) => {
      shadow.destroy();
    });
    this.drawShadows();
  }

  handlePlayerExit(exit) {
    const goingUp = window.gameState.currentLevel === exit.end;
    window.gameState.currentLevel = goingUp ? exit.start : exit.end;

    this.scene.start(SCENES.game);
  }

  addWalls() {
    this.walls.add(new Wall({scene: this, x: 300, y: 300}));
    this.walls.add(new Wall({scene: this, x: 500, y: 500}));
  }

  addExits() {
    this.exits = this.physics.add.group();
    addLevelExits(window.gameState.currentLevel);
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

  addPlayer() {
    this.player = new Player({
      scene: this,
      x: 100,
      y: 100,
      key: 'character',
    });
    this.player.play('walk');
  }

  drawShadows() {
    //! get player position (p)
    //!    for each rectangle:
    //      get pairs of line segments
    //      for each segment:
    //        get the vector from (p) to the first point (r1), normalized (m1)
    //        getBoundsIntersection(r1, m1) (b1, boundnum1)
    //        get the vector from (p) to the second point (r2), normalized (m2)
    //        getBoundsIntersection(r2, m2) (b2, boundnum2)
    //        find intermediate points using boundnum1 and boundnum2
    //        draw from r1 to b1 to intermediate points to b2 to r2 to r1
    // (also figure out divide by zero errors for slope)

    this.shadows = [];

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
        graphics.fillStyle(0x999999);
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
}

function getNormalized(vector) {
  const magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return {x: vector.x / magnitude, y: vector.y / magnitude};
}
