import * as Phaser from 'phaser';
import {DEPTH} from '../constants';

export class Pickup extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.depth = DEPTH.PICKUP;

    scene.add.existing(this);
  }
}

export class MedKit extends Pickup {
  constructor({scene, x, y}) {
    super(scene, x, y, 'pickup-medkit');
  }
}
