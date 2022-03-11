import * as Phaser from 'phaser';
import {DEPTH, GAME, INVENTORY} from '../constants';

export class WeaponSelection extends Phaser.GameObjects.Rectangle {
  constructor({scene, x}) {
    super(scene, x - 10, GAME.height - 10, INVENTORY.ITEM_WIDTH, INVENTORY.ITEM_HEIGHT + 10);
    this.setOrigin(0, 1);
    this.setDepth(DEPTH.HUD);
    this.setStrokeStyle(2, 0xffffff, 1);
    console.log('drawing');
    scene.add.existing(this);
    // const image = this.add
    //   .image(250 + i * INVENTORY.ITEM_WIDTH, GAME.height, slot.image)
    //   .setOrigin(0, 1)
    //   .setScale(0.1);
  }
}
