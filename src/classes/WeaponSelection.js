import * as Phaser from 'phaser';
import {DEPTH, GAME, INVENTORY} from '../constants';

export class WeaponSelection extends Phaser.GameObjects.Rectangle {
  constructor({scene, slot}) {
    super(scene, 0, GAME.height - 10, INVENTORY.ITEM_WIDTH, INVENTORY.ITEM_HEIGHT + 10);
    this.setOrigin(0, 1);
    this.setDepth(DEPTH.HUD);
    this.setStrokeStyle(2, 0xffffff, 1);
    this.select(slot, true);
    scene.add.existing(this);
  }

  select(slot, available) {
    const x = 240 + (slot - 1) * INVENTORY.ITEM_WIDTH;
    this.setX(x);
    this.setAlpha(available ? 1 : 0.3);
  }
}
