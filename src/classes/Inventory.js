import {EVENTS} from '../constants';
import {Knife, Revolver} from './Weapon';

export class Inventory {
  scene;
  weaponSlots;
  gear;

  constructor(scene) {
    this.scene = scene;
    this.weaponSlots = [new Revolver(true), new Knife()]; //Weapon[]
    this.gear = []; //Gear[]
  }

  getActiveWeapon() {
    return this.weaponSlots.find((weapon) => weapon.active);
  }

  handleInput(currentTime, keys) {
    const inventoryKey = Object.keys(keys).find((key) => ['1', '2', '3', '4', '5'].includes(key) && keys[key].isDown);
    if (inventoryKey) {
      const newActive = Number.parseInt(inventoryKey, 10) - 1;
      this.weaponSlots.forEach((s, i) => {
        if (i === newActive) {
          this.scene.game.events.emit(EVENTS.SWAPPING_START, i + 1);
          s.setActive();
        } else {
          s.setInactive();
        }
      });
    }
  }

  update(currentTime, keys) {
    this.handleInput(currentTime, keys);
  }
}
