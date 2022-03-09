import {Revolver} from './Weapon';

export class Inventory {
  weaponSlots;
  gear;

  constructor() {
    const weapon = new Revolver(true);
    this.weaponSlots = [weapon]; //Weapon[]
    this.gear = []; //Gear[]
  }

  getActiveWeapon() {
    return this.weaponSlots.find((weapon) => weapon.active);
  }
}
