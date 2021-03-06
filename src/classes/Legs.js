import * as Phaser from 'phaser';
import {PLAYER} from '../constants';

export class Legs extends Phaser.GameObjects.Sprite {
  player;

  constructor({scene, x, y, player}) {
    super(scene, x, y, 'characterLegsWalk');
    this.setScale(PLAYER.SCALE);
    const xOrigin = player.originX;
    const yOrigin = player.originY;
    this.setDisplayOrigin(xOrigin, yOrigin);
    this.setOrigin(xOrigin, yOrigin);
    this.player = player;
    scene.add.existing(this);

    this.anims.create({
      key: 'walk',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('characterLegsWalk', {start: 0, end: 19}),
      repeat: -1,
    });
  }

  moveTo(x, y) {
    const xOffset = this.player.width * this.scale * this.player.originX;
    const yOffset = this.player.height * this.scale * this.player.originY;
    this.setPosition(x + xOffset, y + yOffset);
  }
}
