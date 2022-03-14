import * as Phaser from 'phaser';
import {DEPTH} from '../constants';
import {createFloatingText} from '../utils/visuals';
import {Revolver, Smg} from './Weapon';

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

export class InvisibilityShield extends Pickup {
  duration = 10000;

  constructor({scene, x, y}) {
    super(scene, x, y, 'pickup-shield');
    this.scale = 0.5;
    this.scene.add.tween({
      targets: this,
      duration: 1000,
      angle: 360,
      loop: true,
      yoyo: true,
    });
  }

  pickup(player) {
    this.scene.add.tween({
      targets: [player, player.legs],
      duration: 500,
      ease: 'Exponential.Out',
      alpha: 0.2,
      onComplete: () => {
        player.setInvisible(true);
      },
    });
    this.scene.add.tween({
      delay: this.duration,
      targets: [player, player.legs],
      duration: 500,
      ease: 'Exponential.Out',
      alpha: 1,
      onComplete: () => {
        player.setInvisible(false);
      },
    });
    this.destroy();
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

export class FloorSmg extends Pickup {
  constructor({scene, x, y}) {
    super(scene, x, y, 'pickup-smg');
    this.scale = 0.1;
  }

  pickup(player) {
    player.inventory.pickupWeapon(new Smg(this.scene), Smg);
    this.destroy();
  }
}

export class FloorRevolver extends Pickup {
  constructor({scene, x, y}) {
    super(scene, x, y, 'pickup-revolver');
    this.scale = 0.1;
  }

  pickup(player) {
    player.inventory.pickupWeapon(new Revolver(this.scene), Revolver);
    this.destroy();
  }
}
