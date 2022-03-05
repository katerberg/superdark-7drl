import * as Phaser from 'phaser';
import characterIdle from '../assets/Top_Down_Survivor/handgun/idle/survivor-idle_handgun_0.png';
import {Player} from '../classes/Player';
import {PLAY_AREA, SCENES, GAME} from '../constants';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.game,
    });
  }

  preload() {
    this.load.image('character', characterIdle);
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
      x: 100,
      y: 100,
      key: 'character',
    });
    this.add
      .text(GAME.width / 2, GAME.height / 2, 'foo', {
        align: 'center',
        fontSize: '32px',
        color: 'tomato',
      })
      .setOrigin(0.5, 0.5);
  }
}
