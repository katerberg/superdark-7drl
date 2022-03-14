import * as Phaser from 'phaser';
import {DEPTH} from '../constants';
import {createFloatingText} from '../utils/visuals';

export class Pickup extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.depth = DEPTH.PICKUP;

    scene.add.existing(this);
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  pickup(player) {
    // meant to be overriden
  }
}

export class MedKit extends Pickup {
  amount = 5;

  constructor({scene, x, y}) {
    super(scene, x, y, 'pickup-medkit');
    this.scale = 0.25;
  }

  pickupAnimation() {
    createFloatingText(this.scene, this.x, this.y, '❤️‍🩹', undefined, 0, 20);
    createFloatingText(this.scene, this.x, this.y, '❤️‍🩹', undefined, 0, 40);
    createFloatingText(this.scene, this.x, this.y, '❤️‍🩹', undefined, 0, 60);
    createFloatingText(this.scene, this.x, this.y, '❤️‍🩹', undefined, 0, 80);
  }

  pickup(player) {
    player.heal(this.amount);
    this.pickupAnimation();
    this.destroy();
  }
}
