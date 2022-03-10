import * as Phaser from 'phaser';
import {DEPTH, PLAYER} from '../constants';

export class Reticle extends Phaser.GameObjects.Text {
  player;

  constructor({scene, x, y, player}) {
    super(scene, x, y, '+');

    this.player = player;
    this.depth = DEPTH.HUD;
    this.setAlign('center');

    scene.add.existing(this);
  }

  update() {
    const x =
      this.player.x + PLAYER.RETICLE_DISTANCE * Math.cos(Phaser.Math.DegToRad(this.player.angle)) - this.width / 2;
    const y =
      this.player.y + PLAYER.RETICLE_DISTANCE * Math.sin(Phaser.Math.DegToRad(this.player.angle)) - this.height / 2;
    this.setPosition(x, y);
  }
}
