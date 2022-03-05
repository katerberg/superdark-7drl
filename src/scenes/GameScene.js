import * as Phaser from 'phaser';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterMove from '../assets/character-move.png';
import {Player} from '../classes/Player';
import {PLAY_AREA, SCENES} from '../constants';

export class GameScene extends Phaser.Scene {
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

    this.addPlayer();
  }

  update() {
    if (this.player) {
      this.player.update();
    }
  }

  addPlayer() {
    this.player = new Player({
      scene: this,
      x: 0,
      y: 0,
      key: 'character',
    });
    this.player.play('walk');
  }
}
