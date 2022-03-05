import * as Phaser from 'phaser';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterMove from '../assets/character-move.png';
import {Player} from '../classes/Player';
import {Wall} from '../classes/Wall';
import {PLAY_AREA, SCENES} from '../constants';

export class GameScene extends Phaser.Scene {
  player;
  walls;

  constructor() {
    super({
      key: SCENES.game,
    });
  }

  preload() {
    this.load.spritesheet('character', characterMove, {frameWidth: 253, frameHeight: 216});
    this.load.spritesheet('characterLegsWalk', characterLegsWalk, {frameWidth: 172, frameHeight: 124});
  }

  create() {
    this.cameras.main.setBackgroundColor('#FFFFFF');
    this.physics.world.setBounds(PLAY_AREA.xOffset, PLAY_AREA.yOffset, PLAY_AREA.width, PLAY_AREA.height);

    const immovableOptions = {
      createCallback: (p) => {
        if (p?.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    };

    this.walls = this.physics.add.group(immovableOptions);

    this.addPlayer();
    this.addWalls();

    this.physics.add.collider(this.player, this.walls);
  }

  update() {
    if (this.player) {
      this.player.update();
    }
  }

  addWalls() {
    this.walls.add(new Wall({scene: this, x: 300, y: 300}));
  }

  addPlayer() {
    this.player = new Player({
      scene: this,
      x: 50,
      y: 50,
      key: 'character',
    });
    this.player.play('walk');
  }
}
