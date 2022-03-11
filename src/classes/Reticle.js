import * as Phaser from 'phaser';
import {DEPTH, GAME, PLAYER} from '../constants';

export class Reticle extends Phaser.GameObjects.Text {
  player;

  constructor({scene, player}) {
    super(scene, GAME.width / 2, GAME.height / 2, '+');

    this.setScrollFactor(0);
    this.player = player;
    this.depth = DEPTH.HUD;
    this.setAlign('center');

    scene.add.existing(this);
  }

  update() {
    const x =
      GAME.width / 2 + PLAYER.RETICLE_DISTANCE * Math.cos(Phaser.Math.DegToRad(this.player.angle)) - this.width / 2;
    const y =
      GAME.height / 2 + PLAYER.RETICLE_DISTANCE * Math.sin(Phaser.Math.DegToRad(this.player.angle)) - this.height / 2;
    this.setPosition(x, y);
  }
}
